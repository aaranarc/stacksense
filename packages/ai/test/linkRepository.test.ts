import {expect,it,vi} from "vitest";
import {supabaseRepository} from "../src/links/repository";
it("A-T23 claims atomically and signs private photos for ten minutes",async()=>{
 const transport=vi.fn(async(url:RequestInfo|URL,init?:RequestInit)=>{
  if(String(url).includes("/object/sign/")){expect(JSON.parse(String(init?.body)).expiresIn).toBe(600);return Response.json({signedURL:"/object/sign/photos/c/p.jpg?token=test"});}
  expect(String(url)).toContain("used_at=is.null");expect(init?.method).toBe("PATCH");
  return Response.json([{token_hash:"a".repeat(64),case_id:"c",check_id:"duct_photo@302",flat_id:"302",lang:"en",check_type:"duct_photo",expires_at:"2026-11-01T00:00:00Z",used_at:"2026-10-30T00:00:00Z"}]);
 });
 const repo=supabaseRepository("https://storage.example.invalid","test-value",transport as typeof fetch);
 expect(await repo.claim("a".repeat(64),"2026-10-30T00:00:00Z")).toBe(true);
 expect(await repo.signedUrl("c/p.jpg")).toContain("https://storage.example.invalid/storage/v1/object/sign/");
 expect(JSON.stringify(transport.mock.calls.map(c=>c[0]))).not.toContain("test-value");
});

it("accepts Supabase's empty 201 minimal insert response",async()=>{
 const {readFileSync}=await import("node:fs");const state=JSON.parse(readFileSync(new URL("../../../fixtures/hero/state-05.json",import.meta.url),"utf8"));
 const repo=supabaseRepository("https://storage.example.invalid","test-value",(async()=>new Response(null,{status:201})) as typeof fetch);
 await expect(repo.putCase(state,"a".repeat(64))).resolves.toBeUndefined();
});

it('persists labels and fallback provenance with observations and validates owner refresh results',async()=>{
 const {readFileSync}=await import('node:fs');
 const obs=JSON.parse(readFileSync(new URL('../../../fixtures/hero/state-05.json',import.meta.url),'utf8')).observations[0];
 let payload:unknown;
 const transport=vi.fn(async(_url:RequestInfo|URL,init?:RequestInit)=>{
  if(init?.method==='POST'){payload=JSON.parse(String(init.body)).payload;return new Response(null,{status:201});}
  return Response.json([{payload}]);
 });
 const repo=supabaseRepository('https://storage.example.invalid','test-value',transport as typeof fetch);
 await repo.saveObservation('c',obs,{photoLabels:[],warnings:['Fallback (AI quota reached)'],mode:'fallback'});
 const result=await repo.getUpdates('c');
 expect(result.observations).toEqual([obs]);expect(result.mode).toBe('fallback');
 expect(result.warnings).toContain('Fallback (AI quota reached)');
 expect(String(transport.mock.calls[1]?.[0])).toContain('case_id=eq.c');
});
