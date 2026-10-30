import { describe, expect, it } from "vitest";
import { blockA } from "../src/building/blockA";
import { hypothesesForVictims } from "../src/hypotheses";
import { archetypes, familyPriors, hypothesisPriors } from "../src/priors/archetypes";

describe("A-T04 priors", () => {
  it("provides valid ranges and normalized modes for every archetype", () => {
    for (const [name, rows] of Object.entries(archetypes)) {
      for (const row of Object.values(rows)) {
        expect(row.min).toBeGreaterThanOrEqual(0);
        expect(row.min).toBeLessThanOrEqual(row.mode);
        expect(row.mode).toBeLessThanOrEqual(row.max);
        expect(row.max).toBeLessThanOrEqual(1);
      }
      expect(Object.values(familyPriors(name as keyof typeof archetypes)).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 12);
    }
  });
  it("adds memory counts to mode times ten", () => {
    const base = familyPriors("MUMBAI_RCC_1990S");
    const updated = familyPriors("MUMBAI_RCC_1990S", { upper_wet_area: 1 });
    expect(updated.upper_wet_area).toBeCloseTo((base.upper_wet_area * 10 + 1) / 11, 12);
    expect(updated.upper_wet_area).toBeGreaterThan(base.upper_wet_area);
    expect(() => familyPriors("GENERIC", { other: -1 })).toThrow();
    expect(() => familyPriors("GENERIC", { other: Infinity })).toThrow();
  });
  it("normalizes available causes without double counting children and gives distant roof a tiny prior", () => {
    const groups = hypothesesForVictims(blockA, ["402", "602"]);
    const low = hypothesisPriors(blockA, groups[0]!);
    const top = hypothesisPriors(blockA, groups[1]!);
    expect(Object.values(low).reduce((a,b) => a+b, 0)).toBeCloseTo(1, 12);
    expect(low["402:roof_terrace"]).toBeLessThan(0.001);
    expect(top["602:roof_terrace"]).toBeGreaterThan(low["402:roof_terrace"]!);
    expect(low["402:nahani_trap@502"]).toBe(0);
  });
});
