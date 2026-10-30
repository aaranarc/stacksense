import {expect,it} from "vitest";
import {heroSnapshots} from "../src/scenarios/hero";
import {applyObservations} from "../src/index";
import {observation} from "./helpers";
it("A-T21 predicts 302 and 602 after component evidence and counts a finding once",()=>{
 const hero=heroSnapshots()[9]!;
 expect(hero.posterior["402:tile_grout@502"]).toBeGreaterThan(.8);
 expect(hero.prediction.sameStack.map(f=>f.flatId)).toEqual(["302","602"]);
 const finding=observation({id:"pro",eventKey:"pro",flatId:"502",kind:"professional_finding",zone:"trap_grout",surface:"unclear",finding:{family:"upper_wet_area",component:"tile grout"},rawText:"professional finding"});
 const next=applyObservations(hero,[finding]);
 expect(next.prediction.memory.upper_wet_area).toBe((hero.prediction.memory.upper_wet_area??0)+1);
 expect(applyObservations(next,[{...finding,id:"duplicate"}]).prediction.memory).toEqual(next.prediction.memory);
 expect(next.prediction.seasonal.every(s=>/inspect|check/i.test(s))).toBe(true);
});
