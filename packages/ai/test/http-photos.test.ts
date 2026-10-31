import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { preparePhoto } from "../src/read/photos";
import { rateLimiter, jsonBody, jsonResponse } from "../src/http/common";
describe("server input boundaries",()=>{
 it("rejects browser execution before loading the native image module",async()=>{
   Object.defineProperty(globalThis,"window",{value:{},configurable:true});
   try { await expect(preparePhoto("data:image/jpeg;base64,YQ==")).rejects.toThrow("Server-only"); }
   finally { Reflect.deleteProperty(globalThis,"window"); }
 });
 it("re-encodes valid image data, bounds dimensions, and strips metadata",async()=>{
   const bytes=await sharp({create:{width:2000,height:10,channels:3,background:"white"}}).jpeg().withMetadata().toBuffer();
   const clean=await preparePhoto(`data:image/jpeg;base64,${bytes.toString("base64")}`);
   const metadata=await sharp(Buffer.from(clean.split(",")[1]!,"base64")).metadata();
   expect(metadata.width).toBe(1600);expect(metadata.exif).toBeUndefined();
   await expect(preparePhoto("data:image/jpeg;base64,YQ==")).rejects.toThrow();
 });
 it("limits actual streamed bytes and expires rate windows",async()=>{
   let now=0;const allowed=rateLimiter(1,()=>now);expect(allowed("ip")).toBe(true);expect(allowed("ip")).toBe(false);now=60000;expect(allowed("ip")).toBe(true);
   await expect(jsonBody(new Request("http://localhost",{method:"POST",body:'{"long":true}'}),2)).rejects.toThrow("body limit");
   expect(await jsonBody(new Request("http://localhost",{method:"POST",body:'{}'}),10)).toEqual({});
   expect(jsonResponse(null).headers.get("cache-control")).toBe("no-store");
 });
});
