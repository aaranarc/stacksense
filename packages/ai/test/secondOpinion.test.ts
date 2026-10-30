import { expect, it } from "vitest";
import { createSecondOpinionHandler } from "../src/secondOpinion";
import { createAdapter } from "../src/llm/adapter";
import { readFileSync } from "node:fs";
it("A-T15 returns null HTTP 200 for absent keys or invalid requests",async()=>{
 const handler=createSecondOpinionHandler({adapter:createAdapter()});
 const state=JSON.parse(readFileSync(new URL("../../../fixtures/hero/state-06.json",import.meta.url),"utf8"));
 for(const body of [{state},{}]) {
   const response=await handler(new Request("http://localhost/api/second-opinion",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}));
   expect(response.status).toBe(200);expect(await response.json()).toBeNull();
 }
});
