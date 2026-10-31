import { expect, it } from "vitest";
import { createSecondOpinionHandler } from "../src/secondOpinion";
import { createAdapter } from "../src/llm/adapter";
import { readFileSync } from "node:fs";
it("A-T15 returns an honest populated fallback for absent keys and null for invalid requests",async()=>{
 const handler=createSecondOpinionHandler({adapter:createAdapter()});
 const state=JSON.parse(readFileSync(new URL("../../../fixtures/hero/state-06.json",import.meta.url),"utf8"));
 for(const body of [{state},{}]) {
   const response=await handler(new Request("http://localhost/api/second-opinion",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)}));
   expect(response.status).toBe(200);const data=await response.json();if("state" in body){expect(data).toMatchObject({source:"fallback",verdict:"review_failed"});expect(data.unknown).toContain("LLM provider is not configured");}else expect(data).toBeNull();
 }
});
it('returns a schema-validated live review when the configured provider succeeds',async()=>{
 const state=JSON.parse(readFileSync(new URL('../../../fixtures/hero/state-06.json',import.meta.url),'utf8'));
 const handler=createSecondOpinionHandler({adapter:createAdapter({provider:async()=>({verdict:'needs_evidence',allowedLevel:'area',claim:'Probable wet area',supports:['obs1: recorded stain'],challenges:['Supply not established'],unknown:['Exact component'],wouldChange:['trap_grout_photo@502']})})});
 const response=await handler(new Request('http://localhost/api/second-opinion',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state})}));
 expect(await response.json()).toMatchObject({source:'llm',verdict:'needs_evidence',supports:['obs1: recorded stain']});
});
