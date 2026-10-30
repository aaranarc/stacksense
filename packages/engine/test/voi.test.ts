import { describe, expect, it } from "vitest";
import { EngineState, type Hypothesis } from "@stacksense/contracts";
import { applyObservations, createCase } from "../src/index";
import { blockA } from "../src/building/blockA";
import { entropy, informationGain, rankChecks, actionFor } from "../src/voi";
import { checkCatalog } from "../src/tables/checks";
import { observation, photo } from "./helpers";

describe("A-T09 value of information", () => {
  it("computes Shannon entropy and expected entropy reduction", () => {
    expect(entropy({ a: .5, b: .5, c: 0 })).toBe(1);
    const s = applyObservations(createCase(blockA), [observation()]);
    const hypotheses = s.hypotheses.filter(h => h.family === "upper_supply" || (h.family === "upper_wet_area" && h.parentId === null));
    const posterior = Object.fromEntries(hypotheses.map(h => [h.id, .5]));
    const result = informationGain(posterior, hypotheses, checkCatalog.meter_check.outcomes);
    expect(result.bits).toBeCloseTo(1 - entropy({ a: .98, b: .02 }), 10);
    expect(result.outcomes.reduce((a,b) => a+b.probability, 0)).toBeCloseTo(1, 12);
    expect(actionFor(posterior, hypotheses)).toBeTruthy();
  });
  it("chooses 302 duct photo then 502 meter using outcome information and effort", () => {
    const initial = applyObservations(createCase(blockA), [observation()]);
    expect(initial.nextChecks[0]?.id).toBe("duct_photo@302");
    const after = applyObservations(initial, [observation({ id: "o302", eventKey: "e302", flatId: "302", kind: "check_result", zone: "duct_wall", surface: "dry", rawText: "duct wall dry", checkId: "duct_photo@302", photoIds: ["p302"] })], { photoLabels: [photo({ photoId: "p302" })] });
    expect(after.nextChecks[0]?.id).toBe("meter_check@502");
    const best = after.nextChecks[0]!;
    expect(best.score).toBeCloseTo(best.expectedBits / (best.effortMin * best.accessPenalty), 12);
    expect(after.nextChecks.find(c => c.type === "trap_grout_photo")?.excluded).toContain("can't change the action");
    expect(after.nextChecks.find(c => c.type === "duct_photo")?.excluded).toContain("already checked");
  });
  it("retains exclusions for locked, unsafe and no-meter checks", () => {
    const b = structuredClone(blockA); b.flats.find(f => f.id === "502")!.hasWaterMeter = false;
    b.flats.find(f => f.id === "302")!.access = "locked";
    const s = applyObservations(createCase(b), [observation()]);
    expect(s.nextChecks.find(c => c.type === "duct_photo")).toMatchObject({ excluded: "flat locked", score: 0 });
    expect(s.nextChecks.find(c => c.type === "meter_check")).toMatchObject({ excluded: "no meter", score: 0 });
    expect(EngineState.safeParse(JSON.parse(JSON.stringify(s))).success).toBe(true);
    expect(rankChecks({ ...s, safety: { status: "incomplete", reasons: [], actions: [] } }).every(c => c.excluded === "unsafe: hazard questions incomplete")).toBe(true);
    expect(rankChecks({ ...s, safety: { status: "emergency", reasons: [], actions: [] } }).every(c => c.score === 0)).toBe(true);
  });
  it("keeps a failed photo check available for retaking", () => {
    const s = applyObservations(createCase(blockA), [observation(), observation({ id: "o302", eventKey: "e302", flatId: "302", kind: "check_result", zone: "duct_wall", photoIds: ["p302"], checkId: "duct_photo@302" })], { photoLabels: [photo({ photoId: "p302", quality: "too_dark" })] });
    expect(s.nextChecks.find(c => c.id === "duct_photo@302")?.excluded).toBeNull();
  });
});
