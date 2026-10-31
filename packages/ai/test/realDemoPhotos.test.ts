import {expect,it} from "vitest";
import {readFileSync} from "node:fs";
import {EngineState} from "@stacksense/contracts";
import {fixtureDemoAssets} from "../../engine/scripts/demo-assets";
const root=new URL("../../../",import.meta.url);
const json=(path:string)=>JSON.parse(readFileSync(new URL(path,root),"utf8"));
it("binds photographic references to hero and rain fixtures without converting simulated evidence to observed",()=>{
 const hero=json("fixtures/hero/state-08.json"),rain=json("fixtures/scenarios/wrong_trade_rain.json");
 expect(fixtureDemoAssets(EngineState.parse(hero))).toEqual(hero.demoAssets);
 expect(hero.demoAssets.images["hero-ceiling-402"].path).toBe("fixtures-ai/photos/demo/ceiling_402.jpg");
 expect(hero.demoAssets.images["hero-window-202"].path).toBe("fixtures-ai/photos/demo/window_202.jpg");
 expect(hero.demoAssets.images["hero-trap-502"].path).toBe("fixtures-ai/photos/demo/trap_502.jpg");
 expect(hero.demoAssets.meterReferences[0].path).toBe("fixtures-ai/photos/demo/meter_502_a.jpg");
 expect(hero.demoAssets.meterReferences[1].assetSource).toBe("demo-illustration");
 expect(rain.demoAssets.preview.path).toBe("fixtures-ai/photos/demo/window_202.jpg");
 expect(hero.observations.every((o:{provenance:string})=>o.provenance==="simulated")).toBe(true);expect(EngineState.safeParse(hero).success).toBe(true);
});
it("records stock/unverified photographs as demo references and leaves unmatched events illustrated",()=>{
 const manifest=json("fixtures-ai/cache/demo-manifest.json");
 for(const id of ["ceiling-402","window-202","trap-502","meter-start-502"]){const input=manifest.inputs.find((r:{id:string})=>r.id===id);expect(input.assetSource).toBe("reference-photo");expect(input.label).toContain("DEMO");}
 expect(manifest.inputs.find((r:{id:string})=>r.id==="window-202").label).toContain("watermark");
 for(const id of ["meter-end-502","day14-402","scenario-electrical_hazard","scenario-dark_photo"]){expect(manifest.inputs.find((r:{id:string})=>r.id===id).assetSource).toBe("demo-illustration");}
});
