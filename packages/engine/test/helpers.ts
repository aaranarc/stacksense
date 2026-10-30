import type { Observation, PhotoLabel } from "@stacksense/contracts";

export function observation(patch: Partial<Observation> = {}): Observation {
  return { id: "o1", flatId: "402", eventKey: "event-1", at: "2026-10-30T16:30:00.000Z",
    kind: "complaint", zone: "ceiling", surface: "damp_stain", room: "bathroom", hazards: [],
    hazardQuestionsAnswered: true, checkId: null, meter: null, moisture: null, finding: null,
    photoIds: [], sourceMessageIds: [], provenance: "simulated", rawText: "bathroom ceiling stain near duct corner", ...patch };
}

export function photo(patch: Partial<PhotoLabel> = {}): PhotoLabel {
  return { photoId: "p1", surface: "dry", zone: "duct_wall", quality: "ok", boxes: [], meterDigits: null,
    humanCorrected: false, ...patch };
}
