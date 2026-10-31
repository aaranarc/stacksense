import { type ZodType } from "zod";
import {ProviderHttpError,LiveLlmDisabledError,QUOTA_WARNING} from "./errors";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatLabels, PhotoLabels, OpinionDraft, BaselineDraft } from "./schemas";
import { PROMPT as READ } from "./prompts/read";
import { PROMPT as PHOTO } from "./prompts/photo";
import { PROMPT as OPINION } from "./prompts/secondOpinion";
import { PROMPT as BASELINE } from "./prompts/baseline";

export type ModelRequest = { system: string; user: string; jsonSchema: object; images: string[]; signal: AbortSignal; repair?: string; context?: object; onWarning?: (warning:string)=>void };
export type Provider = (request: ModelRequest) => Promise<unknown>;
export type ModelResult<T> = { data: T | null; source: "llm" | "fallback"; warnings: string[] };
export function createAdapter(opts: {provider?: Provider; timeoutMs?: number} = {}) {
  let quotaExhausted=false;
  async function run<T>(schema: ZodType<T>, template: string, fields: Record<string,string>, images: string[] = []): Promise<ModelResult<T>> {
    if(quotaExhausted)return {data:null,source:"fallback",warnings:[QUOTA_WARNING]};
    if (!opts.provider) return {data:null,source:"fallback",warnings:["LLM provider is not configured"]};
    // One substitution pass prevents input strings from becoming template instructions.
    const prompt = template.replace(/\{(\w+)\}/g,(match,key:string) => fields[key] ?? match);
    const [system, user] = prompt.replace(/^SYSTEM:\n/, "").split("\nUSER:\n");
    const jsonSchema = zodToJsonSchema(schema, { $refStrategy:"none", target:"openAi" });
    let repair: string | undefined;
    const context={},warnings:string[]=[];
    const onWarning=(warning:string)=>{if(!warnings.includes(warning))warnings.push(warning);};
    for (let attempt=0;attempt<2;attempt++) {
      const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const value = await Promise.race([
          opts.provider({system:system ?? "",user:user ?? "",jsonSchema,images,signal:controller.signal,repair,context,onWarning}),
          new Promise<never>((_,reject) => {timer = setTimeout(() => {controller.abort(); reject(new Error("Provider timeout"));},opts.timeoutMs ?? 20000);}),
        ]);
        let data: unknown = value;
        if (typeof value === "string") { try { data = JSON.parse(value); } catch { repair = "Invalid JSON; return only JSON matching the schema"; continue; } }
        const parsed = schema.safeParse(data);
        if (parsed.success) return {data:parsed.data,source:"llm",warnings};
        repair = `Repair the output to match the schema. Validation errors: ${JSON.stringify(parsed.error.issues)}`;
      } catch(error) {
        if(error instanceof LiveLlmDisabledError)return {data:null,source:"fallback",warnings:[...warnings,error.message]};
        if(error instanceof ProviderHttpError){quotaExhausted=error.status===429;return {data:null,source:"fallback",warnings:[...warnings,error.status===429?QUOTA_WARNING:"AI provider unavailable; no HTTP retry"]};}
        repair = "Previous attempt failed or timed out; return valid schema JSON";
      }
      finally { if (timer) clearTimeout(timer); controller.abort(); }
    }
    return {data:null,source:"fallback",warnings:[...warnings,"LLM unavailable or invalid after one repair retry"]};
  }
  return {
    configured: Boolean(opts.provider),
    readChat: (fields: {buildingSummary:string;messagesJson:string}) => run(ChatLabels,READ,fields),
    readPhoto: ({images,...fields}: {checkType:string;flatId:string;instruction:string;images:string[]}) => run(PhotoLabels,PHOTO,fields,images.slice(0,3)),
    secondOpinion: (fields: {topHypothesisLabel:string;topProbabilityPct:string;otherHypotheses:string;observationsJson:string;checksJson:string}) => run(OpinionDraft,OPINION,fields),
    baseline: (fields: {buildingJson:string;observationsJson:string}) => run(BaselineDraft,BASELINE,fields),
  };
}
export type LlmAdapter = ReturnType<typeof createAdapter>;
