import { createHash } from "node:crypto";
import { ReadResult, type ReadRequest } from "@stacksense/contracts";
import bundled from "../../../../fixtures-ai/cache/bundled.json";
import { PROMPT_VERSION as READ } from "../llm/prompts/read";
import { PROMPT_VERSION as PHOTO } from "../llm/prompts/photo";
export async function cacheKey(request: ReadRequest): Promise<string> {
  const hash=createHash("sha256").update(JSON.stringify({buildingId:request.buildingId,messages:request.messages,versions:[READ,PHOTO]}));
  for(const photo of request.photos) {hash.update(photo.id);hash.update(Buffer.from(photo.dataUrl.split(",")[1] ?? "","base64"));}
  return hash.digest("hex");
}
export function createCache(opts: {bundled?:Record<string,unknown>;supabaseUrl?:string;serviceRoleKey?:string;fetch?:typeof fetch}={}) {
  const memory=new Map<string,ReadResult>(); const fetcher=opts.fetch ?? fetch;
  const remote=opts.supabaseUrl && opts.serviceRoleKey && opts.supabaseUrl.startsWith("https://") ? opts.supabaseUrl.replace(/\/$/,"")+"/rest/v1/ai_cache" : null;
  const headers={apikey:opts.serviceRoleKey ?? "",Authorization:`Bearer ${opts.serviceRoleKey ?? ""}`,"Content-Type":"application/json"};
  return {
    async get(key:string):Promise<ReadResult|null> {
      let value:unknown=memory.get(key) ?? (opts.bundled ?? bundled as Record<string,unknown>)[key];
      if(!value && remote) try {
        const query=new URLSearchParams({cache_key:`eq.${key}`,select:"result",limit:"1"});
        const r=await fetcher(`${remote}?${query}`,{headers,signal:AbortSignal.timeout(2000)});
        if(r.ok) {const rows:unknown=await r.json(); if(Array.isArray(rows)) value=(rows[0] as {result?:unknown}|undefined)?.result;}
      } catch { /* Unavailable cache never blocks a read. */ }
      const parsed=ReadResult.safeParse(value); return parsed.success?structuredClone(parsed.data):null;
    },
    async set(key:string,value:ReadResult):Promise<void> {
      const parsed=ReadResult.safeParse(value);if(!parsed.success) return;
      if(memory.size>=500) memory.delete(memory.keys().next().value!);
      memory.set(key,structuredClone(parsed.data));
      if(remote) try {await fetcher(remote,{method:"POST",headers:{...headers,Prefer:"resolution=merge-duplicates"},body:JSON.stringify({cache_key:key,result:parsed.data}),signal:AbortSignal.timeout(2000)});} catch { /* Memory remains available. */ }
    },
  };
}
export type ReadCache=ReturnType<typeof createCache>;
