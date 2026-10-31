import {expect,it} from "vitest";
import {Building,Observation,SourceFamily} from "@stacksense/contracts";
import {simulateBuilding,createCase,applyObservations} from "../src/index";
it("A-T22 is deterministic, valid and samples the true outcome model",()=>{
 const a=simulateBuilding(22),b=simulateBuilding(22);expect(a.building).toEqual(b.building);expect(a.truth).toEqual(b.truth);expect(Building.safeParse(a.building).success).toBe(true);
 let state=applyObservations(createCase(a.building),[a.initialObservation]);const check=state.nextChecks.find(c=>!c.excluded)!;
 expect(a.answer(check)).toEqual(b.answer(check));expect(Observation.safeParse(a.answer(check)).success).toBe(true);
 for(const family of SourceFamily.options)expect(simulateBuilding(3,{hiddenFamily:family}).truth.family).toBe(family);
 expect(()=>simulateBuilding(NaN)).toThrow();
});
it("reports discovery within three checks without forcing an outcome",()=>{
 let found=0;
 for(let seed=1;seed<=60;seed++) {
  const sim=simulateBuilding(seed);let state=applyObservations(createCase(sim.building,{now:sim.initialObservation.at}),[sim.initialObservation]);
  for(let step=0;step<3&&!state.stop.stopped;step++){const check=state.nextChecks.find(c=>!c.excluded);if(!check)break;state=applyObservations(state,[sim.answer(check)]);}
  const top=[...state.hypotheses].sort((a,b)=>(state.posterior[b.id]??0)-(state.posterior[a.id]??0))[0];
  if(top?.family===sim.truth.family&&top.flatId===sim.truth.flatId)found++;
 }
 console.log(`Simulator development smoke: ${found}/60 top source after <=3 checks (not A-T24 evaluation)`);
 expect(found).toBeGreaterThan(30);
});
