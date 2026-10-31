import { ReadRequest, ReadResult, type Observation, type ChatMessage, type PhotoLabel } from "@stacksense/contracts";
import { pseudonymise } from "../browser/chat";
import { serverAdapter } from "../llm/server";
import type { LlmAdapter } from "../llm/adapter";
import { resolveSenders } from "./senderMap";
import { assignIncidents } from "./incidents";
import { textHazards } from "@stacksense/engine";
import { hazardsIn } from "./hazards";
import { cacheKey, createCache, type ReadCache } from "./cache";
import { preparePhoto } from "./photos";
import { createPhotoReader } from "./photoCache";
import {modeWarnings} from "./status";
import {QUOTA_WARNING} from "../llm/errors";
let defaultCache:ReadCache|undefined;
const damage=/water|damp|leak|stain|crack|mould|mold|peel|meter|repair|dry|paani|pani|सीलन|डाग|ओल|पाणी|छत|गील|नमी/i;
function fallbackObservation(m:ChatMessage,flatId:string|null):Observation {
  const t=m.text;
  const zone:Observation["zone"]=/meter/i.test(t)?"meter":/trap|grout/i.test(t)?"trap_grout":/ceiling|छत/i.test(t)?"ceiling":/duct/i.test(t)?"duct_wall":/window/i.test(t)?"window_perimeter":/floor/i.test(t)?"floor":/wall|भिंत/i.test(t)?"external_wall":"unclear";
  const surface:Observation["surface"]=/dry|सूख|कोरड/i.test(t)?"dry":/crack/i.test(t)?"crack":/mould|mold/i.test(t)?"mould":/stain|डाग/i.test(t)?"damp_stain":"unclear";
  return {id:`obs-${m.id}`,flatId,eventKey:m.id,at:m.at,kind:surface==="dry"?"denial":"complaint",zone,surface,
    room:/bathroom/i.test(t)?"bathroom":null,hazards:hazardsIn(t),hazardQuestionsAnswered:false,checkId:null,meter:null,moisture:null,finding:null,
    photoIds:[...m.attachmentIds],sourceMessageIds:[m.id],provenance:"reported",rawText:t};
}
function reconcileHazards(read:ReadResult):ReadResult{return {...read,observations:read.observations.map(o=>{const text=textHazards(o.rawText);return {...o,hazardQuestionsAnswered:o.hazardQuestionsAnswered&&(o.provenance==="simulated"||text.denied.length===4),hazards:[...new Set([...o.hazards.filter(h=>!text.denied.includes(h)),...text.hazards])]};})};}
export function createReadService(opts:{adapter?:LlmAdapter;cache?:ReadCache;preparePhoto?:typeof preparePhoto}={}) {
  return async(input:ReadRequest):Promise<ReadResult>=>{
    const request=ReadRequest.parse(input);
    const messages=pseudonymise(request.messages).messages;
    const cleanRequest={...request,messages};
    const cache=opts.cache ?? (defaultCache ??= createCache({supabaseUrl:process.env.SUPABASE_URL,serviceRoleKey:process.env.SUPABASE_SERVICE_ROLE_KEY}));
    const key=await cacheKey(cleanRequest),cached=await cache.get(key);
    if(cached?.mode==="live")return {...reconcileHazards(cached),mode:"cached",warnings:modeWarnings("cached",cached.warnings)};
    const adapter=opts.adapter ?? serverAdapter();
    const senderMap=resolveSenders(messages);
    const readPhoto=createPhotoReader({adapter,cache});
    const photoOnly=messages.length===0&&request.photos.length>0;
    const result=photoOnly?{data:{observations:[]},source:"llm" as const,warnings:[]}:await adapter.readChat({buildingSummary:request.buildingId,messagesJson:JSON.stringify(messages)});
    if(result.source==="fallback"&&result.warnings.includes(QUOTA_WARNING)){
      const late=await cache.get(key);if(late?.mode==="live")return {...reconcileHazards(late),mode:"cached",warnings:modeWarnings("cached",[...late.warnings,QUOTA_WARNING])};
    }
    const warnings=[...result.warnings]; let fallback=result.source==="fallback",usedLive=!photoOnly&&result.source==="llm";
    let observations:Observation[]=[];
    if(result.data) for(const draft of result.data.observations) {
      const sources=messages.filter(m=>draft.sourceMessageIds.includes(m.id)); if(!sources.length) {warnings.push("Discarded observation with unknown source message");continue;}
      const m=sources[0]!; const base=fallbackObservation(m,senderMap[m.senderKey] ?? null);
      const text=sources.map(s=>s.text).join("\n"),assessment=textHazards(text);
      observations.push({...base,...draft,id:base.id,at:m.at,flatId:senderMap[m.senderKey] ?? null,rawText:sources.map(s=>s.text).join("\n"),sourceMessageIds:sources.map(s=>s.id),hazardQuestionsAnswered:draft.hazardQuestionsAnswered&&assessment.denied.length===4,hazards:[...new Set([...draft.hazards.filter(h=>!assessment.denied.includes(h)),...sources.flatMap(s=>hazardsIn(s.text))])]});
    }
    else observations=messages.filter(m=>damage.test(m.text)||hazardsIn(m.text).length).map(m=>fallbackObservation(m,senderMap[m.senderKey] ?? null));
    // A model may skip a hazard report; the deterministic backstop must preserve it.
    for(const m of messages) if(hazardsIn(m.text).length && !observations.some(o=>o.sourceMessageIds.includes(m.id))) observations.push(fallbackObservation(m,senderMap[m.senderKey] ?? null));
    const photoLabels:PhotoLabel[]=[];
    for(const photo of request.photos) {
      const clean=await (opts.preparePhoto ?? preparePhoto)(photo.dataUrl);
      const read=await readPhoto({checkType:"inspect",flatId:observations.find(o=>o.photoIds.includes(photo.id))?.flatId ?? "unknown",instruction:"Label visible evidence only",images:[clean]});
      if(!read.data) fallback=true;usedLive ||= read.source==="llm"&&!read.cached;warnings.push(...read.warnings);
      photoLabels.push({photoId:photo.id,surface:"unclear",zone:"unclear",quality:"ok",boxes:[],meterDigits:null,humanCorrected:false,...read.data});
    }
    if(fallback) warnings.push("Labelled fallback: deterministic chat extraction; unavailable photo labels remain unclear");
    const mode=fallback?"fallback":usedLive?"live":"cached";
    const output=ReadResult.parse({observations:assignIncidents(observations),photoLabels,senderMap,warnings:modeWarnings(mode,warnings),mode});
    if(!fallback) await cache.set(key,{...output,mode:"live"});
    return output;
  };
}
