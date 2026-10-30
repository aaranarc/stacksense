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
