import {expect,it} from "vitest";
import {createMemoryHandler} from "../src/memory";
it("A-T21 memory round trip is idempotent and advertises localStorage fallback",async()=>{
 const handler=createMemoryHandler({});
 const post=()=>new Request("http://localhost/api/memory",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({buildingId:"block-a",family:"upper_wet_area",eventKey:"pro-1"})});
 expect((await (await handler(post())).json()).counts.upper_wet_area).toBe(1);
 await handler(post());
 const result=await (await handler(new Request("http://localhost/api/memory?buildingId=block-a"))).json();
 expect(result.counts.upper_wet_area).toBe(1);expect(result.fallback).toBe(true);expect(result.storage).toBe("localStorage");
});
