import {describe,expect,it} from "vitest";
import { applyObservations } from "../src/index";
import { heroSnapshots } from "../src/scenarios/hero";
import { recoveryOf } from "../src/recovery";
import { observation } from "./helpers";
const repair=observation({id:"repair",eventKey:"repair",kind:"repair_done",flatId:"502",at:"2026-10-31T16:30:00.000Z",zone:"trap_grout",surface:"dry",rawText:"repair done"});
const recapture=observation({id:"day14",eventKey:"day14",kind:"recapture",at:"2026-11-14T16:30:00.000Z",surface:"dry",rawText:"looks better"});
describe("A-T17 dry and paint",()=>{
 it("sets day 14, keeps a better photo unready, and requires a fresh moisture measurement",()=>{
   const repaired=applyObservations(heroSnapshots()[6]!,[repair]);
   expect(repaired.recovery.day14DueAt).toBe("2026-11-14T16:30:00.000Z");
   const better=applyObservations(repaired,[recapture]);
   expect(better.recovery).toMatchObject({repair:"done",dry:"unknown",paint:"not_ready"});
   expect(better.recovery.flags).toContain("looks better ≠ dry");
   const measured=applyObservations(better,[observation({id:"reading",eventKey:"reading",kind:"moisture_reading",at:"2026-11-14T17:00:00.000Z",moisture:{value:14,unit:"%WME"},rawText:"measured moisture"})]);
   expect(measured.recovery).toMatchObject({dry:"dry",paint:"ready"});
   expect(recoveryOf(measured)).toEqual(measured.recovery);
 });
 it("reopens a worse recapture or recurrence and reruns safety",()=>{
   const repaired=applyObservations(heroSnapshots()[6]!,[repair]);
   const worse=applyObservations(repaired,[{...recapture,surface:"active_blistering"}]);
   expect(worse.recovery.reopened).toBe(true);expect(worse.stop.stopped).toBe(false);expect(worse.jobSheet).toBeNull();
   const repeated=applyObservations(repaired,[{...recapture,id:"again",eventKey:"again",kind:"complaint",surface:"damp_stain"}]);
   expect(repeated.recovery.flags).toContain("recurrence at repaired spot — review earlier repair");
   expect(applyObservations(repaired,[{...recapture,hazards:["sagging_ceiling"]}]).safety.status).toBe("emergency");
 });
 it("never marks paint ready without a measurement across 1,000 seeded combinations",()=>{
   const base=heroSnapshots()[6]!;let seed=17;
   for(let i=0;i<1000;i++) {
     seed=(Math.imul(seed,1664525)+1013904223)>>>0;
     const surface=(seed%2?"dry":"damp_stain") as "dry"|"damp_stain";
     const state={...base,observations:[...base.observations,repair,{...recapture,surface}]};
     expect(recoveryOf(state).paint).toBe("not_ready");
   }
 });
 it("rejects stale, negative, relative, unrelated or high moisture readings",()=>{
   const repaired=applyObservations(heroSnapshots()[6]!,[repair]);
   for(const patch of [{at:"2026-10-30T17:00:00.000Z"},{moisture:{value:-1,unit:"%WME" as const}},{moisture:{value:14,unit:"relative" as const}},{flatId:"202"},{zone:"floor" as const},{moisture:{value:18,unit:"%WME" as const}}]) {
     const s=applyObservations(repaired,[observation({id:"m",eventKey:"m",kind:"moisture_reading",at:"2026-11-14T17:00:00.000Z",moisture:{value:14,unit:"%WME"},rawText:"measurement",...patch})]);
     expect(s.recovery.paint).toBe("not_ready");
   }
 });
});
