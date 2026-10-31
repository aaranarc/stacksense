import {expect,it,vi} from "vitest";
import {createPhotoReader} from "../src/read/photoCache";
import {createAdapter} from "../src/llm/adapter";
import {createCache} from "../src/read/cache";
const input={checkType:"duct_photo",flatId:"302",instruction:"Photograph the duct only if safe",images:["data:image/jpeg;base64,YQ=="]};
it("reuses validated photo labels for identical image bytes/context and separates other checks",async()=>{
 const provider=vi.fn(async()=>({surface:"dry",zone:"duct_wall",boxes:[],meterDigits:null}));
 const read=createPhotoReader({adapter:createAdapter({provider}),cache:createCache({bundled:{}})});
 expect((await read(input)).cached).toBe(false);
 const cached=await read(input);expect(cached.cached).toBe(true);expect(cached.data?.surface).toBe("dry");expect(provider).toHaveBeenCalledTimes(1);
 expect((await read({...input,flatId:"402"})).cached).toBe(false);expect(provider).toHaveBeenCalledTimes(2);
});
it("never caches unavailable labels or reuses live cache with a missing key",async()=>{
 const cache=createCache({bundled:{}});
 const live=createPhotoReader({cache,adapter:createAdapter({provider:async()=>({surface:"dry",zone:"duct_wall",boxes:[],meterDigits:null})})});await live(input);
 const offline=createPhotoReader({cache,adapter:createAdapter()});
 expect((await offline(input)).source).toBe("fallback");expect((await offline(input)).cached).toBe(false);
});

it("serves the real clean duct photo from bundled upload caches in all three languages",async()=>{
 const {readFileSync}=await import("node:fs");const {preparePhoto}=await import("../src/read/photos");
 const state=JSON.parse(readFileSync(new URL("../../../fixtures/hero/state-02.json",import.meta.url),"utf8"));
 const check=state.nextChecks.find((c:{id:string})=>c.id==="duct_photo@302");
 const bytes=readFileSync(new URL("../../../fixtures-ai/photos/demo/duct_302.jpg",import.meta.url));
 const clean=await preparePhoto(`data:image/jpeg;base64,${bytes.toString("base64")}`);
 const provider=vi.fn(async()=>{throw Error("provider offline")});
 const read=createPhotoReader({adapter:createAdapter({provider}),cache:createCache()});
 for(const lang of ["en","hi","mr"]){const result=await read({checkType:check.type,flatId:"302",instruction:check.instructions[lang],images:[clean]});expect(result.cached).toBe(true);expect(result.data).not.toBeNull();}
 expect(provider).not.toHaveBeenCalled();
});
