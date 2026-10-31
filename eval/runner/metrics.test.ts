import { describe, expect, it } from "vitest";
import { aggregate, harmfulFlips, overclaims, rightTrade, sameSource, type Outcome } from "./metrics";
import { evaluate } from "./run";

const truth = { family: "upper_wet_area", flatId: "502", trade: "waterproofer_tiler", emergency: false, inspect: false };
const o = (p: Partial<Outcome>): Outcome => ({
  caseId: "x", set: "hard", truth, leaders: [{ family: "upper_wet_area", flatId: "502" }], trade: "waterproofer_tiler",
  level: "area", claim: { family: "upper_wet_area", flatId: "502" }, componentEvidence: false, checks: 1, decided: true, ms: 1, ...p,
});

describe("metrics", () => {
  it("matches sources by family and flat (null flat = family only)", () => {
    expect(sameSource({ family: "upper_wet_area", flatId: "502" }, truth)).toBe(true);
    expect(sameSource({ family: "upper_wet_area", flatId: "402" }, truth)).toBe(false);
    expect(sameSource({ family: "shared_shaft", flatId: null }, { family: "shared_shaft", flatId: null })).toBe(true);
    expect(sameSource(null, truth)).toBe(false);
  });
  it("right trade; hazard cases need an emergency", () => {
    expect(rightTrade(o({}))).toBe(true);
    expect(rightTrade(o({ trade: "plumber" }))).toBe(false);
    const hz = { ...truth, trade: "electrician", emergency: true };
    expect(rightTrade(o({ truth: hz, trade: "electrician" }))).toBe(false);
    expect(rightTrade(o({ truth: hz, trade: "emergency" }))).toBe(true);
  });
  it("over-claim: wrong area, component without evidence, any trade on inspect cases", () => {
    expect(overclaims(o({}))).toBe(false);
    expect(overclaims(o({ claim: { family: "upper_wet_area", flatId: "602" } }))).toBe(true);
    expect(overclaims(o({ level: "component" }))).toBe(true);
    expect(overclaims(o({ level: "component", componentEvidence: true }))).toBe(false);
    expect(overclaims(o({ truth: { ...truth, inspect: true }, level: "mechanism" }))).toBe(true);
    expect(overclaims(o({ truth: { ...truth, inspect: true }, trade: "general_inspector" }))).toBe(false);
    expect(overclaims(o({ level: "mechanism", claim: { family: "condensation", flatId: null } }))).toBe(false);
  });
  it("counts harmful flips (right → wrong only)", () => {
    const R = { family: "upper_wet_area", flatId: "502" }, W = { family: "shared_shaft", flatId: null };
    expect(harmfulFlips(o({ leaders: [W, R, W, R, W] }))).toBe(2);
    expect(harmfulFlips(o({ leaders: [R, R] }))).toBe(0);
  });
  it("aggregates; hazard pass is n/a (NaN) without hazard cases, ties stay ties", () => {
    const row = aggregate("m", [o({}), o({ trade: "plumber", leaders: [null, { family: "upper_wet_area", flatId: "502" }] })]);
    expect(row.rightTrade).toBe(0.5);
    expect(row.top1).toEqual([1, 1, 1]);
    expect(row.hazardPass).toBeNaN();
    expect(aggregate("a", [o({})]).rightTrade).toBe(aggregate("b", [o({})]).rightTrade);
  });
});

describe("runner", () => {
  it("is deterministic for fixed seeds (ignoring timing)", () => {
    const strip = (r: ReturnType<typeof evaluate>["results"]) => r.rows.map(({ msPerCase: _ms, ...x }) => x);
    expect(strip(evaluate({ sims: 5 }).results)).toEqual(strip(evaluate({ sims: 5 }).results));
  });
  it("StackSense passes every hazard case", () => {
    const { outcomes } = evaluate({ sims: 0 });
    const hz = outcomes["StackSense"]!.filter((x) => x.truth.emergency);
    expect(hz).toHaveLength(4);
    expect(hz.every((x) => x.trade === "emergency")).toBe(true);
  });
});

describe("robustness prior shift", () => {
  it("memory counts reproduce the shifted, re-normalised prior exactly", async () => {
    const { shiftMemory } = await import("./run");
    const { familyPriors, archetypes } = await import("../../packages/engine/src/priors/archetypes");
    for (const shift of [-40, -20, 20, 40] as const) {
      const p = familyPriors("MUMBAI_RCC_1990S", shiftMemory("MUMBAI_RCC_1990S", "shared_shaft", shift));
      const modes = archetypes.MUMBAI_RCC_1990S;
      const raw = { ...Object.fromEntries(Object.entries(modes).map(([f, r]) => [f, r.mode])), shared_shaft: modes.shared_shaft.mode * (1 + shift / 100) };
      const total = Object.values(raw).reduce((a, b) => a + b, 0);
      for (const [f, v] of Object.entries(raw)) expect(p[f as keyof typeof p]).toBeCloseTo(v / total, 9);
    }
    const max = familyPriors("GENERIC", shiftMemory("GENERIC", "condensation", "max"));
    expect(max.condensation).toBeGreaterThan(familyPriors("GENERIC").condensation);
  });
});

describe("README eval block", () => {
  it("replaces only the marked block, numbers from results", async () => {
    const { readmeEval } = await import("./merge");
    const { results } = evaluate({ sims: 2 });
    const md = readmeEval("# T\n<!-- eval:start -->\nold\n<!-- eval:end -->\ntail", results as never);
    expect(md).toMatch(/^# T\n<!-- eval:start -->\n\*\*Team-built test, not field accuracy\.\*\*/);
    expect(md).not.toContain("old");
    expect(md.endsWith("<!-- eval:end -->\ntail")).toBe(true);
  });
});
