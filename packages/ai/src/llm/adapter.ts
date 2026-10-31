import { z, type ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ChatLabels, PhotoLabels, OpinionDraft, BaselineDraft } from "./schemas";
import { PROMPT as READ } from "./prompts/read";
import { PROMPT as PHOTO } from "./prompts/photo";
import { PROMPT as OPINION } from "./prompts/secondOpinion";
import { PROMPT as BASELINE } from "./prompts/baseline";

export type ModelRequest = { system: string; user: string; jsonSchema: object; images: string[]; signal: AbortSignal; repair?: string };
export type Provider = (request: ModelRequest) => Promise<unknown>;
export type ModelResult<T> = { data: T | null; source: "llm" | "fallback"; warnings: string[] };
export function createAdapter(opts: {provider?: Provider; timeoutMs?: number} = {}) {
  async function run<T>(schema: ZodType<T>, template: string, fields: Record<string,string>, images: string[] = []): Promise<ModelResult<T>> {
    if (!opts.provider) return {data:null,source:"fallback",warnings:["LLM provider is not configured"]};
    // One substitution pass prevents input strings from becoming template instructions.
    const prompt = template.replace(/\{(\w+)\}/g,(match,key:string) => fields[key] ?? match);
    const [system, user] = prompt.replace(/^SYSTEM:\n/, "").split("\nUSER:\n");
    const jsonSchema = zodToJsonSchema(schema, { $refStrategy:"none", target:"openAi" });
    let repair: string | undefined;
    for (let attempt=0;attempt<2;attempt++) {
      const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        const value = await Promise.race([
          opts.provider({system:system ?? "",user:user ?? "",jsonSchema,images,signal:controller.signal,repair}),
          new Promise<never>((_,reject) => {timer = setTimeout(() => {controller.abort(); reject(new Error("Provider timeout"));},opts.timeoutMs ?? 20000);}),
        ]);
        let data: unknown = value;
        if (typeof value === "string") { try { data = JSON.parse(value); } catch { repair = "Invalid JSON; return only JSON matching the schema"; continue; } }
        const parsed = schema.safeParse(data);
        if (parsed.success) return {data:parsed.data,source:"llm",warnings:[]};
        repair = `Repair the output to match the schema. Validation errors: ${JSON.stringify(parsed.error.issues)}`;
      } catch { repair = "Previous attempt failed or timed out; return valid schema JSON"; }
      finally { if (timer) clearTimeout(timer); controller.abort(); }
    }
    return {data:null,source:"fallback",warnings:["LLM unavailable or invalid after one repair retry"]};
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
