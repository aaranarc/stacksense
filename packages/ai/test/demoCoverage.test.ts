import {expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {ReadResult} from "@stacksense/contracts";
import sharp from "sharp";
const root=new URL("../../../",import.meta.url);
it("covers all demo slots with validated caches and explicit illustration provenance",()=>{
 const manifest=JSON.parse(readFileSync(new URL("fixtures-ai/cache/demo-manifest.json",root),"utf8"));
 const status=JSON.parse(readFileSync(new URL("fixtures-ai/cache/demo-status.json",root),"utf8"));
 const bundled=JSON.parse(readFileSync(new URL("fixtures-ai/cache/bundled.json",root),"utf8"));
 expect(manifest.inputs).toHaveLength(16);expect(manifest.inputs.filter((i:{id:string})=>i.id.startsWith("scenario-"))).toHaveLength(8);
 expect(status.complete).toBe(true);expect(status.inputs).toHaveLength(16);
 for(const row of status.inputs){expect(row.status).toBe("cached");const cached=ReadResult.parse(bundled[row.key]);expect(cached.mode).toBe("live");if(row.assetSource==="demo-illustration")expect(cached.warnings.join(" ")).toContain("DEMO illustration");}
 for(const id of ["duct-302","meter-start-502","meter-end-502","trap-502"])expect(status.inputs.find((r:{id:string})=>r.id===id).uploadContexts).toBe(3);
});
it("keeps every photo metadata-free and every schematic visibly labelled demo",async()=>{
 const manifest=JSON.parse(readFileSync(new URL("fixtures-ai/cache/demo-manifest.json",root),"utf8"));
 for(const input of manifest.inputs.filter((i:{kind:string})=>i.kind==="photo")){
  const metadata=await sharp(readFileSync(new URL(input.path,root))).metadata();
  expect(metadata.format).toBe("jpeg");expect(Math.max(metadata.width!,metadata.height!)).toBeLessThanOrEqual(1600);
  for(const field of [metadata.exif,metadata.xmp,metadata.iptc,metadata.icc])expect(field).toBeUndefined();
  if(input.assetSource==="demo-illustration"){const svg=readFileSync(new URL(input.path.replace(/\.jpg$/,".demo.svg"),root),"utf8");expect(svg).toContain("DEMO ILLUSTRATION");expect(svg).toContain("not a real home photograph");}
 }
});
