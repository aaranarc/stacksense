import { describe, expect, it } from "vitest";
import { CheckType, SourceFamily } from "@stacksense/contracts";
import { checkCatalog, candidateChecks, accessPenalty } from "../src/tables/checks";
import { applyObservations, createCase } from "../src/index";
import { blockA } from "../src/building/blockA";
import { observation } from "./helpers";

describe("A-T08 check catalog", () => {
  it("covers every check with valid outcome distributions and translated safety instructions", () => {
    expect(Object.keys(checkCatalog).sort()).toEqual([...CheckType.options].sort());
    for (const check of Object.values(checkCatalog)) {
      for (const family of SourceFamily.options) {
        expect(Object.values(check.outcomes).reduce((s, row) => s + row[family], 0)).toBeCloseTo(1, 12);
        expect(Object.values(check.outcomes).every(row => row[family] >= 0 && row[family] <= 1)).toBe(true);
      }
      expect(check.instructions.en).toContain("only if safe");
      expect(check.instructions.hi.length).toBeGreaterThan(10);
      expect(check.instructions.mr.length).toBeGreaterThan(10);
      expect(check.safeOnlyIfSafetyOk).toBe(true);
    }
    expect(checkCatalog.meter_check.effortMin).toBe(10);
    expect(checkCatalog.duct_photo.effortMin).toBe(.5);
    expect(checkCatalog.flood_test.effortMin).toBe(1440);
    expect(checkCatalog.rain_recheck.delayPenalty).toBeGreaterThan(1);
    expect(checkCatalog.flood_test.professional).toBe(true);
  });
  it("targets the same-stack flat below and upper-flat meter only when present", () => {
    const s = applyObservations(createCase(blockA), [observation()]);
    const candidates = candidateChecks(s);
    expect(candidates.find(c => c.type === "duct_photo")?.flat.id).toBe("302");
    expect(candidates.filter(c => c.type === "meter_check").map(c => c.flat.id)).toEqual(["502"]);
    const noMeters = structuredClone(blockA); noMeters.flats.forEach(f => { f.hasWaterMeter = false; });
    const noMeterState = applyObservations(createCase(noMeters), [observation()]);
    expect(candidateChecks(noMeterState).some(c => c.type === "meter_check")).toBe(false);
    expect(candidateChecks(noMeterState, { includeUnavailableMeters: true }).some(c => c.type === "meter_check")).toBe(true);
    expect(candidateChecks(createCase(blockA))).toEqual([]);
  });
  it("penalizes unknown and excludes locked access", () => {
    expect(accessPenalty("open")).toBe(1);
    expect(accessPenalty("unknown")).toBe(3);
    expect(accessPenalty("locked")).toBe(Infinity);
  });
});
