// Explicit live opt-in only; no key, raw sender map, or photo bytes are written to the cache report.
import {existsSync,readFileSync,writeFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,sep} from "node:path";
import {z} from "zod";
import {ReadResult,type ReadRequest,type EngineState} from "@stacksense/contracts";
import {parseWhatsAppExport,pseudonymise} from "../src/browser/chat";
import {serverAdapter} from "../src/llm/server";
import {cacheKey,createCache} from "../src/read/cache";
import {createReadService} from "../src/read/pipeline";
import {createPhotoReader} from "../src/read/photoCache";
import {preparePhoto} from "../src/read/photos";
const root=fileURLToPath(new URL("../../../",import.meta.url));
const file=(path:string)=>{const absolute=resolve(root,path);if(!absolute.startsWith(resolve(root,"fixtures-ai")+sep))throw Error("Demo assets must be inside fixtures-ai");return absolute;};
const manifest=z.object({buildingId:z.string(),inputs:z.array(z.object({id:z.string(),kind:z.enum(["chat","photo"]),path:z.string(),checkId:z.string().optional(),flatId:z.string().optional()}))}).parse(JSON.parse(readFileSync(file("fixtures-ai/cache/demo-manifest.json"),"utf8")));
const live=process.argv.includes("--live"),allowMissing=process.argv.includes("--allow-missing");
const bundlePath=file("fixtures-ai/cache/bundled.json"),bundle:Record<string,unknown>=JSON.parse(readFileSync(bundlePath,"utf8"));
const adapter=serverAdapter();if(live&&!adapter.configured)throw Error("Configure the server provider before --live");
const cache=createCache({bundled:bundle,...(live?{supabaseUrl:process.env.SUPABASE_URL,serviceRoleKey:process.env.SUPABASE_SERVICE_ROLE_KEY}:{})});
const service=createReadService({adapter,cache}),readPhoto=createPhotoReader({adapter,cache});
const status:{id:string;status:string;path:string;key?:string;uploadContexts?:number}[]=[];
for(const input of manifest.inputs){
 const path=file(input.path);if(!existsSync(path)){status.push({id:input.id,path:input.path,status:"missing"});continue;}
 const request:ReadRequest={buildingId:manifest.buildingId,messages:[],photos:[]};
 if(input.kind==="chat")request.messages=pseudonymise(parseWhatsAppExport(readFileSync(path,"utf8"))).messages;
 else{const ext=path.split(".").at(-1)?.toLowerCase(),mime=ext==="png"?"png":ext==="webp"?"webp":"jpeg";request.photos=[{id:input.id,dataUrl:`data:image/${mime};base64,${readFileSync(path).toString("base64")}`}];}
 const key=await cacheKey({...request,messages:pseudonymise(request.messages).messages});
 if(live){const result=ReadResult.parse(await service(request));if(result.mode==="fallback"){status.push({id:input.id,path:input.path,status:"provider-fallback-not-cached"});continue;}bundle[key]={...result,mode:"live"};}
 const valid=ReadResult.safeParse(bundle[key]);
 const row={id:input.id,path:input.path,key,status:valid.success&&valid.data.mode==="live"?"cached":"not-cached",uploadContexts:0};
 if(input.kind==="photo"&&input.checkId&&input.flatId){
  const state=JSON.parse(readFileSync(resolve(root,"fixtures/hero/state-02.json"),"utf8")) as EngineState;
  const check=state.nextChecks.find(c=>c.id===input.checkId);if(!check)throw Error(`Unknown check for ${input.id}`);
  const cleaned=await preparePhoto(request.photos[0]!.dataUrl);
  for(const lang of ["en","hi","mr"] as const){const fields={checkType:check.type,flatId:input.flatId,instruction:check.instructions[lang],images:[cleaned]};
   const result=live?await readPhoto(fields):null;
   const {images,...context}=fields;const photoKey=await cacheKey({buildingId:`photo:${JSON.stringify(context)}`,messages:[],photos:images.map((dataUrl,i)=>({id:`image-${i}`,dataUrl}))});
   if(result?.data)bundle[photoKey]={observations:[],senderMap:{},warnings:result.warnings,mode:"live",photoLabels:[{...result.data,photoId:"cached-photo",quality:"ok",humanCorrected:false}]};
   const stored=ReadResult.safeParse(bundle[photoKey]);if(stored.success&&stored.data.mode==="live")row.uploadContexts++;
  }
 }
 status.push(row);
}
const report={label:"Demo cache coverage — not evaluation or field accuracy",generatedAt:new Date().toISOString(),liveOptIn:live,inputs:status,complete:status.every(s=>s.status==="cached"&&(!manifest.inputs.find(i=>i.id===s.id)?.checkId||s.uploadContexts===3))};
if(live)writeFileSync(bundlePath,JSON.stringify(bundle,null,2)+"\n");
writeFileSync(file("fixtures-ai/cache/demo-status.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));
if(!report.complete&&!allowMissing)process.exitCode=2;
