import { PhotoLabels } from "../llm/schemas";
import { serverAdapter } from "../llm/server";
import type { LlmAdapter } from "../llm/adapter";
import { cacheKey, createCache, type ReadCache } from "./cache";
import {modeWarnings} from "./status";
import {QUOTA_WARNING} from "../llm/errors";
let defaultCache: ReadCache | undefined;
/** Server-only cache of validated labels, scoped to exact cleaned image bytes and prompt context. */
export function createPhotoReader(opts: { adapter?: LlmAdapter; cache?: ReadCache } = {}) {
  return async (input: Parameters<LlmAdapter["readPhoto"]>[0]) => {
    if (typeof window !== "undefined") throw new Error("Server-only photo cache");
    const cache = opts.cache ?? (defaultCache ??= createCache({supabaseUrl:process.env.SUPABASE_URL,serviceRoleKey:process.env.SUPABASE_SERVICE_ROLE_KEY}));
    const {images,...context}=input;
    const key=await cacheKey({buildingId:`photo:${JSON.stringify(context)}`,messages:[],photos:images.slice(0,3).map((dataUrl,i)=>({id:`image-${i}`,dataUrl}))});
    {
      const cached=await cache.get(key);
      const label=cached?.photoLabels[0];
      const parsed=PhotoLabels.safeParse(label?{surface:label.surface,zone:label.zone,boxes:label.boxes,meterDigits:label.meterDigits}:null);
      if(cached?.mode==="live"&&parsed.success) return {data:parsed.data,source:"llm" as const,warnings:modeWarnings("cached",cached.warnings),cached:true};
    }
    const adapter=opts.adapter??serverAdapter();
    const result=await adapter.readPhoto(input);
    if(!result.data&&result.warnings.includes(QUOTA_WARNING)){
      const late=await cache.get(key),label=late?.photoLabels[0];
      const parsed=PhotoLabels.safeParse(label?{surface:label.surface,zone:label.zone,boxes:label.boxes,meterDigits:label.meterDigits}:null);
      if(late?.mode==="live"&&parsed.success)return {data:parsed.data,source:"llm" as const,warnings:modeWarnings("cached",[...late.warnings,QUOTA_WARNING]),cached:true};
    }
    if(result.data) await cache.set(key,{observations:[],senderMap:{},warnings:result.warnings,mode:"live",photoLabels:[{...result.data,photoId:"cached-photo",quality:"ok",humanCorrected:false}]});
    return {...result,cached:false};
  };
}
