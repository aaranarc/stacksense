import { describe, expect, it, vi } from "vitest";
import { ReadResult, type ChatMessage } from "@stacksense/contracts";
import { createAdapter } from "../src/llm/adapter";
import { resolveSenders } from "../src/read/senderMap";
import { assignIncidents } from "../src/read/incidents";
import { hazardsIn } from "../src/read/hazards";
import { createCache, cacheKey } from "../src/read/cache";
import { createReadService } from "../src/read/pipeline";
import { createReadHandler } from "../src/read/http";
const messages: ChatMessage[] = [
 {id:"m1",at:"2026-10-30T16:00:00.000Z",senderKey:"S01",text:"bathroom ceiling stain",attachmentIds:[]},
 {id:"m2",at:"2026-10-30T16:01:00.000Z",senderKey:"S01",text:"402 here",attachmentIds:[]},
 {id:"m3",at:"2026-10-30T16:02:00.000Z",senderKey:"S02",text:"flat A-502, our floor is dry",attachmentIds:[]},
 {id:"m4",at:"2026-10-30T16:03:00.000Z",senderKey:"S03",text:"मी २०२, भिंतीवर डाग आहे",attachmentIds:[]},
];
const input = {buildingId:"block-a",messages,photos:[]};
describe("A-T14 read pipeline", () => {
 it("resolves whole-chat senders and unions all hazard keywords", () => {
   expect(resolveSenders(messages)).toEqual({S01:"402",S02:"502",S03:"202"});
   expect(hazardsIn("bijli spark ceiling bulging tez paani sewage")).toEqual(["water_near_electrics","sagging_ceiling","fast_ingress","sewage"]);
 });
 it("returns conservative validated fallback without a key", async () => {
   const result = await createReadService({adapter:createAdapter(),cache:createCache() })(input);
   expect(ReadResult.safeParse(result).success).toBe(true); expect(result.mode).toBe("fallback");
   expect(result.observations.find(o=>o.sourceMessageIds.includes("m1"))?.flatId).toBe("402");
   expect(result.warnings.join(" ")).toContain("fallback");
   expect(result.observations.every(o=>!o.hazardQuestionsAnswered)).toBe(true);
 });
 it("clusters same-flat same-zone reports within 72 hours and never merges unknown senders", async () => {
   const service = createReadService({adapter:createAdapter(),cache:createCache()});
   const result = await service({...input,messages:[messages[0]!,messages[1]!,{...messages[0]!,id:"repeat",at:"2026-11-01T16:00:00.000Z"},{...messages[0]!,id:"later",at:"2026-11-04T16:00:00.000Z"}]});
   const obs = assignIncidents(result.observations);
   expect(obs[0]?.eventKey).toBe(obs[1]?.eventKey); expect(obs[2]?.eventKey).not.toBe(obs[0]?.eventKey);
 });
 it("caches valid model results and preserves skipped hazardous messages", async () => {
   const provider = vi.fn(async()=>({observations:[]}));
   const cache = createCache(); const service = createReadService({adapter:createAdapter({provider}),cache});
   const request = {...input,messages:[{...messages[0]!,text:"socket spark"}]};
   const first = await service(request); const second = await service(request);
   expect(first.mode).toBe("live"); expect(first.observations[0]?.hazards).toContain("water_near_electrics");
   expect(second.mode).toBe("cached"); expect(provider).toHaveBeenCalledTimes(1);
   expect(await cacheKey(request)).not.toBe(await cacheKey({...request,buildingId:"different"}));
 });
 it("enforces HTTP schema, size, count, method and rate limits", async () => {
   const handler = createReadHandler({service:createReadService({adapter:createAdapter(),cache:createCache()})});
   const req = (body:unknown,ip="test")=>new Request("http://localhost/api/read",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":ip},body:JSON.stringify(body)});
   expect((await handler(req({}))).status).toBe(400);
   expect((await handler(new Request("http://localhost/api/read"))).status).toBe(405);
   expect((await handler(req({...input,photos:Array.from({length:13},()=>({id:"p",dataUrl:""}))}))).status).toBe(400);
   expect((await handler(req({...input,photos:[{id:"p",dataUrl:"https://evil.invalid/image.jpg"}]}))).status).toBe(400);
   for(let i=0;i<30;i++) expect((await handler(req(input,"rate"))).status).toBe(200);
   expect((await handler(req(input,"rate"))).status).toBe(429);
 });
});

it("validates bundled cache data and survives remote-cache outages", async()=>{
 const result=await createReadService({adapter:createAdapter(),cache:createCache()})(input);
 const key=await cacheKey(input);
 const bundled=createCache({bundled:{[key]:result}});
 expect(await bundled.get(key)).toEqual(result);
 const remote=createCache({supabaseUrl:"https://cache.example.invalid",serviceRoleKey:"test-value",fetch:vi.fn(async()=>{throw new Error("offline");}) as typeof fetch});
 expect(await remote.get(key)).toBeNull();await remote.set(key,result);expect(await remote.get(key)).toEqual(result);
 expect(await createCache({bundled:{bad:{}}}).get("bad")).toBeNull();
});

it("keeps a ceiling complaint near a duct corner in the ceiling zone",async()=>{
 const result=await createReadService({adapter:createAdapter(),cache:createCache()})({...input,messages:[{...messages[0]!,text:"402 here, bathroom ceiling stain near duct corner"}]});
 expect(result.observations[0]?.zone).toBe("ceiling");
});

it("serves twenty sequential HTTP reads from cache without another model call",async()=>{
 const provider=vi.fn(async()=>({observations:[]}));
 const service=createReadService({adapter:createAdapter({provider}),cache:createCache({bundled:{}})});
 const handler=createReadHandler({service});
 const call=()=>handler(new Request("http://localhost/api/read",{method:"POST",headers:{"content-type":"application/json","x-forwarded-for":"cache-smoke"},body:JSON.stringify(input)}));
 expect((await (await call()).json()).mode).toBe("live");
 for(let i=0;i<20;i++) {const r=await call();expect(r.status).toBe(200);expect(ReadResult.parse(await r.json()).mode).toBe("cached");}
 expect(provider).toHaveBeenCalledTimes(1);
});
it("serves a warm cache before considering missing credentials",async()=>{
 const cache=createCache({bundled:{}});
 await createReadService({cache,adapter:createAdapter({provider:async()=>({observations:[]})})})(input);
 const result=await createReadService({cache,adapter:createAdapter()})(input);
 expect(result.mode).toBe("cached");expect(result.warnings).toContain("Cached");
});

it("serves the actual bundled hero without contacting an unavailable configured provider",async()=>{
 const {readFileSync}=await import("node:fs");
 const {parseWhatsAppExport,pseudonymise}=await import("../src/browser/chat");
 const messages=pseudonymise(parseWhatsAppExport(readFileSync(new URL("../../../fixtures-ai/chats/hero_blockA.txt",import.meta.url),"utf8"))).messages;
 const provider=vi.fn(async()=>{throw Error("provider offline")});
 const result=await createReadService({adapter:createAdapter({provider}),cache:createCache()})({buildingId:"block-a",messages,photos:[]});
 expect(result.mode).toBe("cached");expect(result.observations.length).toBeGreaterThan(0);expect(provider).not.toHaveBeenCalled();
});

it("reads photo-only inputs without an empty-chat model call and reports reused labels as cached",async()=>{
 const provider=vi.fn(async(r:{images:string[]})=>{if(!r.images.length)throw Error("Empty chat must not be sent");return {surface:"dry",zone:"duct_wall",boxes:[],meterDigits:null};});
 const service=createReadService({adapter:createAdapter({provider}),cache:createCache({bundled:{}}),preparePhoto:async p=>p});
 const first=await service({buildingId:"block-a",messages:[],photos:[{id:"photo-one",dataUrl:"data:image/jpeg;base64,YQ=="}]});
 expect(first.mode).toBe("live");expect(provider).toHaveBeenCalledTimes(1);
 const next=await service({buildingId:"block-a",messages:[],photos:[{id:"photo-two",dataUrl:"data:image/jpeg;base64,YQ=="}]});
 expect(next.mode).toBe("cached");expect(next.photoLabels[0]?.photoId).toBe("photo-two");expect(provider).toHaveBeenCalledTimes(1);
});
