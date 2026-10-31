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

it("offers safe same-stack prevention inspections without adding diagnostic value",async()=>{
 const {EngineState}=await import("@stacksense/contracts");
 const hero=heroSnapshots()[9]!;
 const inspection=hero.nextChecks.find(c=>c.id==="inspect@602");
 expect(inspection?.excluded).toBeNull();
 expect(inspection?.instructions.en).toMatch(/photo.*safe/i);
 expect(inspection?.score).toBe(0);
 expect(EngineState.safeParse(JSON.parse(JSON.stringify(hero))).success).toBe(true);
 const locked={...hero,building:{...hero.building,flats:hero.building.flats.map(f=>f.id==='602'?{...f,access:'locked' as const}:f)}};
 const {rankChecks}=await import('../src/voi');
 expect(rankChecks(locked).find(c=>c.id==='inspect@602')?.excluded).toBe('flat locked');
 const done=applyObservations(hero,[observation({id:'inspection',eventKey:'inspection',kind:'check_result',flatId:'602',checkId:'inspect@602',surface:'dry'})]);
 expect(done.prediction.sameStack.some(f=>f.flatId==='602')).toBe(false);
});
