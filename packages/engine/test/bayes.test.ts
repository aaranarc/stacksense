import { describe, expect, it } from "vitest";
import { EngineState } from "@stacksense/contracts";
import { createCase, applyObservations } from "../src/index";
import { splitCases, updatePosterior } from "../src/bayes";
import { blockA } from "../src/building/blockA";
import { observation, photo } from "./helpers";

describe("A-T06 deterministic Bayesian updates", () => {
  it("returns contract-valid pure states with normalized odds", () => {
    const initial = createCase(blockA, { now: "2026-10-30T16:30:00.000Z" });
    const copy = structuredClone(initial);
    const next = applyObservations(initial, [observation()]);
    expect(initial).toEqual(copy);
    expect(EngineState.safeParse(next).success).toBe(true);
    expect(Object.values(next.posterior).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 12);
    expect(next.now).toBe(initial.now);
    expect(applyObservations(initial, [observation()])).toEqual(next);
    expect(createCase(blockA).now).toBe("1970-01-01T00:00:00.000Z");
  });
  it("counts an event once even with another message ID or replay", () => {
    const once = applyObservations(createCase(blockA), [observation()]);
    const twice = applyObservations(once, [observation({ id: "o2" })]);
    expect(twice.posterior).toEqual(once.posterior);
    expect(applyObservations(twice, []).posterior).toEqual(once.posterior);
  });
  it("ignores bad photos, warns, and replays delayed human-corrected labels", () => {
    const initial = createCase(blockA);
    const noEvidence = applyObservations(initial, [observation({ surface: "unclear", rawText: "", photoIds: ["p1"] })]);
    const dark = applyObservations(initial, [observation({ photoIds: ["p1"] })], { photoLabels: [photo({ quality: "too_dark" })] });
    expect(dark.posterior).toEqual(noEvidence.posterior);
    expect(dark.recovery.flags.join(" ")).toContain("too_dark");
    const corrected = applyObservations(dark, [], { photoLabels: [photo({ humanCorrected: true })] });
    expect(corrected.posterior["402:shared_shaft@S-x02"]).toBeLessThan(dark.posterior["402:shared_shaft@S-x02"]!);
    expect(corrected.recovery.flags.some(f => f.includes("too_dark"))).toBe(false);
  });
  it("splits independent complaints with linked case IDs", () => {
    const main = applyObservations(createCase(blockA), [observation(), observation({ id: "o202", eventKey: "e202", flatId: "202", zone: "window_perimeter", surface: "efflorescence", rawText: "window stain" })]);
    const cases = splitCases(main);
    expect(cases.map(c => c.caseId)).toEqual(["block-a:402", "block-a:202"]);
    expect(cases[0]?.posterior).toEqual(applyObservations(createCase(blockA), [observation()]).posterior);
    expect(cases[1]?.posterior["202:facade_window@202:W"]).toBeGreaterThan(.8);
  });
  it("normalizes in log space under extreme repeated evidence", () => {
    const h = applyObservations(createCase(blockA), [observation()]).hypotheses;
    const p = Object.fromEntries(h.map(x => [x.id, x.parentId ? 0 : 1 / h.filter(y => !y.parentId).length]));
    const next = updatePosterior(p, h, Array.from({ length: 2000 }, () => "meter_still" as const));
    expect(Object.values(next).every(Number.isFinite)).toBe(true);
    expect(Object.values(next).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 12);
    expect(() => applyObservations(createCase(blockA), [{ ...observation(), at: "bad" }])).toThrow("Invalid observation");
  });
});

it("uses a corrected photo zone when selecting relevant same-stack evidence", () => {
  const base = applyObservations(createCase(blockA), [observation()]);
  const after = applyObservations(base, [observation({ id: "lower", eventKey: "lower", kind: "check_result", flatId: "302", zone: "unclear", surface: "unclear", photoIds: ["p1"], rawText: "" })], { photoLabels: [photo()] });
  expect(after.posterior["402:shared_shaft@S-x02"]).toBeLessThan(base.posterior["402:shared_shaft@S-x02"]!);
});
