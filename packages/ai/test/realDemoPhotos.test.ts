import {expect,it} from "vitest";
import {existsSync,readFileSync} from "node:fs";
import {EngineState} from "@stacksense/contracts";
import {fixtureDemoAssets} from "../../engine/scripts/demo-assets";
const root=new URL("../../../",import.meta.url);
const json=(path:string)=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
it("binds authored illustrations in hero and scenario fixtures without changing simulated evidence",()=>{
 const hero=json("fixtures/hero/state-08.json"),rain=json("fixtures/scenarios/wrong_trade_rain.json");
 expect(fixtureDemoAssets(EngineState.parse(hero))).toEqual(hero.demoAssets);
 for(const id of ["hero-ceiling-402","hero-window-202","hero-trap-502"])expect(hero.demoAssets.images[id].assetSource).toBe("demo-illustration");
 expect(hero.demoAssets.meterReferences.every((a:{assetSource:string})=>a.assetSource==="demo-illustration")).toBe(true);
 expect(rain.demoAssets.preview.assetSource).toBe("demo-illustration");
 expect(hero.observations.every((o:{provenance:string})=>o.provenance==="simulated")).toBe(true);expect(EngineState.safeParse(hero).success).toBe(true);
});
it("has no stock files or reference-photo mappings and retains only the team duct photograph",()=>{
 for(const name of ["ceiling_402.jpg","window_202.jpg","trap_502.jpg","meter_502_a.jpg"])expect(existsSync(new URL(`fixtures-ai/photos/demo/${name}`,root))).toBe(false);
 const manifest=json("fixtures-ai/cache/demo-manifest.json");
 for(const input of manifest.inputs.filter((i:{kind:string})=>i.kind==="photo")){expect(input.assetSource).toBe(input.id==="duct-302"?"team-photo":"demo-illustration");}
 const cache=JSON.stringify(json("fixtures-ai/cache/bundled.json"));expect(cache).not.toContain("watermark");expect(cache).not.toContain("photographic reference");
});
