import { describe, expect, it } from "vitest";
import { scenarios, runScenario, applyObservations } from "../src/index";
import type { Observation } from "@stacksense/contracts";

describe("C final: Day-14 recapture link target after a repair", () => {
  const hero = runScenario(scenarios.happy);
  const repair: Observation = { id: "c-repair", eventKey: "c-repair", flatId: "502", at: "2026-10-31T16:30:00.000Z", kind: "repair_done",
    zone: "trap_grout", surface: "unclear", room: "bathroom", hazards: [], hazardQuestionsAnswered: true, checkId: null, meter: null,
    moisture: null, finding: null, photoIds: [], sourceMessageIds: [], provenance: "simulated", rawText: "repair completed" };
  it("is offered (excluded null, score 0) only once a repair is recorded", () => {
    const before = hero.nextChecks.find((c) => c.type === "ceiling_photo");
    expect(before?.excluded).not.toBeNull();
    const after = applyObservations(hero, [repair]);
    const cap = after.nextChecks.find((c) => c.type === "ceiling_photo");
    expect(cap?.excluded).toBeNull();
    expect(cap?.score).toBe(0);
    expect(after.stop).toEqual(hero.stop); // recovery target never changes the diagnostic stop
  });
  it("is no longer offered once the recapture answers it", () => {
    const after = applyObservations(hero, [repair]);
    const id = after.nextChecks.find((c) => c.type === "ceiling_photo")!.id;
    const answered = applyObservations(after, [{ ...repair, id: "c-cap", eventKey: "c-cap", kind: "recapture", flatId: id.split("@")[1]!, zone: "ceiling", surface: "dry", checkId: id, at: "2026-11-14T16:30:00.000Z", rawText: "Day-14 recapture" }]);
    expect(answered.nextChecks.find((c) => c.id === id)?.excluded).not.toBeNull();
  });
});
