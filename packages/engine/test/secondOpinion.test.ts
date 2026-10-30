import { describe, expect, it } from "vitest";
import { SecondOpinion } from "@stacksense/contracts";
import { applySecondOpinion, applyObservations } from "../src/index";
import { claimEvidence } from "../src/secondOpinion";
import { heroSnapshots } from "../src/scenarios/hero";
import { observation, photo } from "./helpers";
const draft = SecondOpinion.parse({verdict:"no_objection",allowedLevel:"component",claim:"Confirmed guilty trap",supports:[],challenges:[],unknown:[],wouldChange:["trap_grout_photo@502"],source:"llm"});
describe("A-T15 evidence caps",()=>{
 it("caps a component claim to area without component evidence",()=>{
   const s=applySecondOpinion(heroSnapshots()[6]!,draft);
   expect(s.secondOpinion?.allowedLevel).toBe("area");expect(s.secondOpinion?.verdict).toBe("needs_evidence");
   expect(s.secondOpinion?.claim).toContain("Probable");expect(s.secondOpinion?.claim).not.toMatch(/confirmed|guilty/i);
   expect(s.nextChecks[0]?.id).toBe("trap_grout_photo@502");
 });
 it("allows a component only with good component-specific evidence in the probable source flat",()=>{
   const base=heroSnapshots()[6]!; expect(claimEvidence(base).level).toBe("area");
   const trap=observation({id:"trap",eventKey:"trap",flatId:"502",kind:"check_result",zone:"trap_grout",surface:"crack",rawText:"cracked grout at trap",photoIds:["trap"],checkId:"trap_grout_photo@502"});
   expect(applySecondOpinion(applyObservations(base,[trap],{photoLabels:[photo({photoId:"trap",zone:"trap_grout",surface:"crack"})]}),draft).secondOpinion?.allowedLevel).toBe("component");
   expect(applySecondOpinion(applyObservations(base,[trap],{photoLabels:[photo({photoId:"trap",quality:"too_dark"})]}),draft).secondOpinion?.allowedLevel).toBe("area");
   expect(applySecondOpinion(heroSnapshots()[1]!,draft).secondOpinion?.allowedLevel).toBe("mechanism");
 });
 it("labels missing review and never promotes unsafe checks",()=>{
   const s=applySecondOpinion(heroSnapshots()[6]!,null);
   expect(s.secondOpinion).toMatchObject({verdict:"review_failed",source:"fallback",claim:"Second Opinion unavailable — unreviewed"});
   const unsafe={...heroSnapshots()[6]!,safety:{status:"emergency" as const,reasons:[],actions:[]}};
   expect(applySecondOpinion(unsafe,draft).nextChecks).toEqual([]);
 });
});
