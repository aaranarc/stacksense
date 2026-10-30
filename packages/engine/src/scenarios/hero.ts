import type { EngineState, Observation, PhotoLabel } from "@stacksense/contracts";
import { createCase, applyObservations } from "../bayes";
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

// A9 numbering is preserved; later-task steps intentionally reuse the last implemented state.
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
  return structuredClone([s0, s1, s2, s3, s4, s5, s6, s6, s6, s6, s6, s6]);
}
