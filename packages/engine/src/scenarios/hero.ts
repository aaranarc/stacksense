import type { EngineState, Observation, PhotoLabel, SecondOpinion } from "@stacksense/contracts";
import { createCase, applyObservations } from "../bayes";
import { applySecondOpinion } from "../secondOpinion";
import { blockA } from "../building/blockA";

const at = "2026-10-30T16:30:00.000Z";
const report = (id: string, patch: Partial<Observation>): Observation => ({
  id, eventKey: id, flatId: "402", at, kind: "complaint", zone: "ceiling", surface: "damp_stain",
  room: "bathroom", hazards: [], hazardQuestionsAnswered: true, checkId: null, meter: null,
  moisture: null, finding: null, photoIds: [], sourceMessageIds: [], provenance: "simulated", rawText: "", ...patch,
});
const label = (photoId: string, zone: PhotoLabel["zone"], surface: PhotoLabel["surface"]): PhotoLabel => ({
  photoId, zone, surface, quality: "ok", boxes: [], meterDigits: null, humanCorrected: false,
});

// Simulated fixture: scripted reviewer drafts are labelled fallback, never live AI.
export function heroSnapshots(): EngineState[] {
  const s0 = createCase(blockA, { now: at });
  const s1 = applyObservations(s0, [
    report("hero-402", { photoIds: ["hero-ceiling-402"], rawText: "Bathroom ceiling stain near duct corner" }),
    report("hero-202", { flatId: "202", zone: "external_wall", photoIds: ["hero-window-202"], rawText: "Wall stain near window after rain" }),
  ]);
  const s2 = applyObservations(s1, [], { photoLabels: [
    label("hero-ceiling-402", "ceiling", "damp_stain"),
    label("hero-window-202", "window_perimeter", "efflorescence"),
  ] });
  const s3 = s2; // Weather join is A-T19, not a fabricated result here.
  const s4 = applyObservations(s3, [report("hero-502-denial", {
    flatId: "502", kind: "denial", zone: "floor", surface: "dry", rawText: "Our floor is dry",
  })]);
  const s5 = applyObservations(s4, [report("hero-302-duct", {
    flatId: "302", kind: "check_result", zone: "duct_wall", surface: "dry", checkId: "duct_photo@302",
    photoIds: ["hero-duct-302"], rawText: "Duct wall is dry",
  })], { photoLabels: [label("hero-duct-302", "duct_wall", "dry")] });
  const s6 = applyObservations(s5, [report("hero-502-meter", {
    flatId: "502", kind: "meter_reading", zone: "meter", surface: "unclear", room: null,
    checkId: "meter_check@502", meter: { start: 42, end: 42, minutes: 10 }, rawText: "Meter did not move during ten minutes with taps off",
  })]);
  const draft: SecondOpinion = {verdict:"needs_evidence",allowedLevel:"component",claim:"Probable bathroom component",
    supports:["hero-302-duct","hero-502-meter"],challenges:[],unknown:["Simulated scripted reviewer for demo; not a live model response"],
    wouldChange:["trap_grout_photo@502"],source:"fallback"};
  const s7=applySecondOpinion(s6,draft);
  const trap=applyObservations(s7,[report("hero-trap",{flatId:"502",kind:"check_result",zone:"trap_grout",surface:"crack",
    photoIds:["hero-trap-502"],checkId:"trap_grout_photo@502",rawText:"Cracked grout at the floor trap"})],
    {photoLabels:[label("hero-trap-502","trap_grout","crack")]});
  const s8=applySecondOpinion(trap,{...draft,verdict:"no_objection",wouldChange:[]});
  const s9=s8; // The deterministic Job Sheet is already derived from the stopped state.
  const s10=applyObservations({...s9,now:"2026-11-14T16:30:00.000Z"},[
    report("hero-repair",{flatId:"502",kind:"repair_done",at:"2026-10-31T16:30:00.000Z",zone:"trap_grout",surface:"unclear",rawText:"repair completed"}),
    report("hero-day14",{kind:"recapture",at:"2026-11-14T16:30:00.000Z",zone:"ceiling",surface:"dry",photoIds:["hero-day14-402"],rawText:"Looks better on day 14"}),
  ],{photoLabels:[label("hero-day14-402","ceiling","dry")]});
  const s11=s10; // Predict/prevent remains A-T21; no predictions are fabricated.
  return structuredClone([s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10,s11]);
}
