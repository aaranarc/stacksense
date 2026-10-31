import {describe,expect,it} from "vitest";
import {EngineState} from "@stacksense/contracts";
import {scenarios,runScenario} from "../src/index";
describe("A-T20 scenarios",()=>{
 it("exports eight valid deterministic scenarios",()=>{
  expect(Object.keys(scenarios)).toHaveLength(8);
  for(const scenario of Object.values(scenarios)) {const state=runScenario(scenario);expect(EngineState.safeParse(state).success).toBe(true);expect(state.observations.every(o=>o.provenance==="simulated")).toBe(true);}
 });
 it.each(["happy","electrical_hazard","locked_502","dark_photo","beam_travel","wrong_trade_rain","honest_uncertainty","break_it"] as const)("%s has the specified outcome",id=>{
  const state=runScenario(scenarios[id]);
  if(id==="happy")expect(state.jobSheet?.send[0]?.trade).toBe("waterproofer_tiler");
  if(id==="electrical_hazard"){expect(state.safety.status).toBe("emergency");expect(state.nextChecks).toEqual([]);}
  if(id==="locked_502"){expect(state.nextChecks.find(c=>c.id==="meter_check@502")?.excluded).toBe("flat locked");expect(state.nextChecks[0]?.targetFlatId).not.toBe("502");}
  if(id==="dark_photo")expect(state.recovery.flags.join(" ")).toContain("too_dark");
  if(id==="beam_travel"){const top=[...state.hypotheses].sort((a,b)=>(state.posterior[b.id]??0)-(state.posterior[a.id]??0))[0];expect(top?.flatId).toBe("501");}
  if(id==="wrong_trade_rain"){expect(state.jobSheet?.send[0]?.trade).toBe("facade_sealant");expect(state.trace.flatMap(t=>t.changes).some(c=>c.why.includes("follows rain"))).toBe(true);}
  if(id==="honest_uncertainty"){expect(state.stop.reason).toContain("inspect");expect(state.jobSheet?.send).toEqual([]);}
  if(id==="break_it")expect(state.building.flats.length).toBeGreaterThan(0);
 });
});
import { describe as describeHero, expect as expectHero, it as itHero } from "vitest";
import { runScenario as runHero, scenarios as heroScenarios } from "../src/scenarios";
describeHero("hero walkthrough (plan step 12)", () => {
  itHero("ends with Building Memory +1 wet-area and a 202 forecast re-check, still sending the waterproofer", () => {
    const s = runHero(heroScenarios.happy);
    expectHero(s.prediction.memory.upper_wet_area).toBe(1);
    expectHero(s.prediction.forecastRechecks.some(r => r.flatId === "202" && r.orientation === "W")).toBe(true);
    expectHero(s.jobSheet?.send.map(t => t.trade)).toEqual(["waterproofer_tiler"]);
  });
});
