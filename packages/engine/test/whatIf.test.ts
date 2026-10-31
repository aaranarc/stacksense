import {describe,expect,it} from "vitest";
import {EngineState} from "@stacksense/contracts";
import {whatIf} from "../src/index";
import {heroSnapshots} from "../src/scenarios/hero";
describe("A-T18 counterfactual replay",()=>{
 it("changes still meter to moving and sends a plumber without mutating input",()=>{
   const base=heroSnapshots()[9]!,copy=structuredClone(base);
   const changed=whatIf(base,[{observationId:"hero-502-meter",patch:{meter:{start:42,end:43,minutes:10}}}]);
   expect(changed.jobSheet?.send.map(t=>t.trade)).toContain("plumber");
   expect(changed.jobSheet?.dontSend.map(t=>t.trade)).not.toContain("plumber");
   expect(EngineState.safeParse(changed).success).toBe(true);expect(base).toEqual(copy);
   expect(changed.secondOpinion?.source).toBe("fallback");expect(changed.secondOpinion?.verdict).toBe("review_failed");
 });
 it("replays labels and safety, rejects bad patches and stays below 50ms",()=>{
   const base=heroSnapshots()[6]!;whatIf(base,[]);
   const start=performance.now();const changed=whatIf(base,[{observationId:"hero-402",patch:{hazards:["water_near_electrics"]}}]);
   expect(performance.now()-start).toBeLessThan(50);
   expect(changed.safety.status).toBe("emergency");expect(changed.nextChecks).toEqual([]);expect(changed.jobSheet).toBeNull();
   expect(()=>whatIf(base,[{observationId:"unknown",patch:{}}])).toThrow("Unknown observation");
   expect(()=>whatIf(base,[{observationId:"hero-402",patch:{at:"invalid"}}])).toThrow("Invalid observation");
 });
});
