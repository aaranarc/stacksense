import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {ChatMessage,Observation,PhotoLabel,type ReadRequest} from "../../packages/contracts/src/index";
import {assertLiveLlmOptIn} from "../../packages/ai/src/llm/guard";
import {createAdapter} from "../../packages/ai/src/llm/adapter";
import {serverAdapter} from "../../packages/ai/src/llm/server";
import {createReadService} from "../../packages/ai/src/read/pipeline";
import {createCache} from "../../packages/ai/src/read/cache";
import {computeAiMetrics,parseCsv,type Fields,type ScoredCase} from "./metrics";
const args=process.argv.slice(2),live=args.includes("--live"),dataIndex=args.indexOf("--data");
if(live)assertLiveLlmOptIn();
const directory=dataIndex>=0?resolve(args[dataIndex+1]??""):fileURLToPath(new URL("../data/placeholder/",import.meta.url));
if(directory.includes("/eval/hard-cases"))throw new Error("This runner never reads hard cases");
const manifest=JSON.parse(readFileSync(resolve(directory,"manifest.json"),"utf8")) as {placeholder:boolean;humanReviewed:boolean;label:string};
if(typeof manifest.placeholder!=="boolean"||typeof manifest.humanReviewed!=="boolean"||typeof manifest.label!=="string")throw new Error("Invalid dataset manifest");
if(live&&(manifest.placeholder||manifest.humanReviewed!==true))throw new Error("Live evaluation requires a non-placeholder, human-reviewed dataset");
let knownCost=false,unpricedAttempt=false,cost=0,apiCalls=0;
const inputRate=Number(process.env.EVAL_INPUT_USD_PER_MILLION),outputRate=Number(process.env.EVAL_OUTPUT_USD_PER_MILLION);
const measuredFetch:typeof fetch=async(input,init)=>{
 apiCalls++;let response:Response;try{response=await fetch(input,init);}catch(error){unpricedAttempt=true;throw error;}
 try{const raw=await response.clone().json() as {usageMetadata?:{promptTokenCount?:number;candidatesTokenCount?:number;thoughtsTokenCount?:number};usage?:{prompt_tokens?:number;completion_tokens?:number}};
  const inputTokens=raw.usageMetadata?.promptTokenCount??raw.usage?.prompt_tokens,outputTokens=raw.usageMetadata?((raw.usageMetadata.candidatesTokenCount??0)+(raw.usageMetadata.thoughtsTokenCount??0)):raw.usage?.completion_tokens;
  if(typeof inputTokens==="number"&&typeof outputTokens==="number"&&Number.isFinite(inputRate)&&inputRate>=0&&Number.isFinite(outputRate)&&outputRate>=0){cost+=(inputTokens*inputRate+outputTokens*outputRate)/1e6;knownCost=true;}else unpricedAttempt=true;
 }catch{unpricedAttempt=true;}return response;
};
const providerName=process.env.LLM_PROVIDER??"gemini";
const apiKey=providerName==="openai"?process.env.OPENAI_API_KEY:process.env.GEMINI_API_KEY;
if(live&&!apiKey)throw new Error("Selected provider key is missing; load the server env file");
const adapter=live?serverAdapter({fetch:measuredFetch}):createAdapter();
if(live&&!adapter.configured)throw new Error("Selected provider configuration is incomplete");
const read=createReadService({adapter,cache:createCache()}),scored:ScoredCase[]=[],modes:Record<string,number>={};
const labels=Observation.pick({flatId:true,room:true,zone:true,surface:true,hazards:true,kind:true});
async function score(request:ReadRequest,reference:{kind:"message";language:string;expected:Record<string,Fields>}|{kind:"photo";expected:{photoId:string;surface:PhotoLabel["surface"];zone:PhotoLabel["zone"];isClean:boolean}[]}) {
 knownCost=false;unpricedAttempt=false;cost=0;const before=apiCalls,start=performance.now(),result=await read(request);
 modes[result.mode]=(modes[result.mode]??0)+1;
 scored.push({...reference,result,latencyMs:performance.now()-start,costUsd:live?(apiCalls===before?0:knownCost&&!unpricedAttempt?cost:null):0});
}
for(const line of readFileSync(resolve(directory,"messages.jsonl"),"utf8").split(/\r?\n/).filter(Boolean)) {
 const row=JSON.parse(line) as {message:unknown;labels:unknown;language:string;humanReviewed:boolean};if(live&&row.humanReviewed!==true)throw new Error("Unreviewed message row");
 const message=ChatMessage.parse(row.message),expected=labels.parse(row.labels);
 await score({buildingId:"block-a",messages:[message],photos:[]},{kind:"message",language:row.language,expected:{[message.id]:expected}});
}
for(const row of parseCsv(readFileSync(resolve(directory,"photos.csv"),"utf8"))) {
 if(live&&row.humanReviewed!=="true")throw new Error("Unreviewed photo row");
 if(!["true","false"].includes(row.isClean??"")||!["true","false"].includes(row.humanReviewed??""))throw new Error("Invalid photo label booleans");
 const expected=PhotoLabel.pick({photoId:true,surface:true,zone:true}).parse(row);
 const dataUrl=`data:image/jpeg;base64,${readFileSync(resolve(directory,row.path!)).toString("base64")}`;
 await score({buildingId:"block-a",messages:[],photos:[{id:expected.photoId,dataUrl}]},{kind:"photo",expected:[{...expected,isClean:row.isClean==="true"}]});
}
const output={generatedAt:new Date().toISOString(),label:manifest.placeholder?"PLACEHOLDER SMOKE ONLY — NOT FIELD ACCURACY":"team-built test, not field accuracy",placeholder:manifest.placeholder,humanReviewed:manifest.humanReviewed,execution:live?"live-provider":"fallback-smoke-no-network",caseCount:scored.length,apiCalls,modes,...computeAiMetrics(scored),costBasis:live?"Configured token rates; unknown if usage/rates absent":"Zero provider calls; no API cost"};
const target=new URL(manifest.placeholder?"../results/ai.placeholder.json":"../results/ai.json",import.meta.url);mkdirSync(new URL("../results/",import.meta.url),{recursive:true});writeFileSync(target,JSON.stringify(output,null,2)+"\n");console.log(`${output.label}: ${scored.length} cases, ${apiCalls} provider calls; wrote ${fileURLToPath(target)}`);
