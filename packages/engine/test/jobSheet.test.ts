import { describe,expect,it } from "vitest";
import { JobSheet, SourceFamily } from "@stacksense/contracts";
import { heroSnapshots } from "../src/scenarios/hero";
import { applyObservations, applySecondOpinion } from "../src/index";
import { buildJobSheet } from "../src/jobSheet";
import { tradesFor } from "../src/tables/trades";
import { observation } from "./helpers";
describe("A-T16 Job Sheet",()=>{
 it("sends a waterproofer/tiler, excludes plumber after still meter, and requires site verification",()=>{
   const state=heroSnapshots()[6]!;const sheet=state.jobSheet;
   expect(sheet?.send.map(t=>t.trade)).toContain("waterproofer_tiler");
   expect(sheet?.dontSend).toContainEqual({trade:"plumber",why:"meter did not move: supply unlikely"});
   expect(sheet?.verifyOnSite.join(" ")).toContain("24 h flood test of 502 bathroom");
   expect(sheet?.notJustifiedYet).toContain("breaking 402 ceiling");
   expect(JobSheet.safeParse(sheet).success).toBe(true);
   expect(sheet?.timestampTrail).toHaveLength(4);
   expect(buildJobSheet(state)).toEqual(sheet);
 });
 it("never issues a hazardous or still-investigating sheet and marks unreviewed output",()=>{
   expect(heroSnapshots()[1]?.jobSheet).toBeNull();
   const state=applySecondOpinion(heroSnapshots()[6]!,null);
   expect(state.jobSheet?.safetyFlags.join(" ")).toContain("unreviewed");
   expect(applyObservations(state,[observation({id:"hazard",eventKey:"hazard",hazards:["water_near_electrics"]})]).jobSheet).toBeNull();
   expect(buildJobSheet({...state,stop:{stopped:true,reason:"Remote evidence can't decide — inspect 502"}})?.send).toEqual([]);
 });
 it("covers all source trades and keeps responsibility as links only",()=>{
   for(const family of SourceFamily.options) expect(tradesFor(family)).not.toHaveLength(0);
   expect(tradesFor("upper_wet_area","wc_connection")[0]?.trade).toBe("plumber");
   expect(tradesFor("upper_supply")[0]?.trade).toBe("plumber");
   expect(tradesFor("shared_shaft")[0]?.why).toContain("society/landlord");
   expect(tradesFor("other",null,["water_near_electrics"])[0]?.trade).toBe("electrician");
   const state=heroSnapshots()[6]!;
   const uk=buildJobSheet({...state,building:{...state.building,region:"UK"}});
   expect(uk?.responsibilityLinks.some(l=>l.url.includes("gov.uk"))).toBe(true);
 });
});
