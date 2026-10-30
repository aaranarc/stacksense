import { describe, expect, it } from "vitest";
import { blockA } from "../src/building/blockA";
import { featuresOf, likelihoods } from "../src/tables/likelihoods";
import { observation, photo } from "./helpers";

describe("A-T05 likelihoods and evidence features", () => {
  it("has 18 valid feature rows, with weak upper-floor dryness evidence", () => {
    expect(Object.keys(likelihoods)).toHaveLength(18);
    for (const row of Object.values(likelihoods)) for (const value of Object.values(row)) {
      expect(value).toBeGreaterThan(0); expect(value).toBeLessThan(1);
    }
    expect(likelihoods.upper_floor_dry.upper_wet_area / likelihoods.upper_floor_dry.upper_supply).toBeGreaterThan(.8);
  });
  it("extracts hero features and ignores unclear/poor images", () => {
    expect(featuresOf(observation(), blockA)).toEqual(["ceiling_under_wet_area", "near_duct_corner"]);
    expect(featuresOf(observation({ flatId: "202", zone: "window_perimeter", surface: "efflorescence", rawText: "window stain" }), blockA)).toEqual(["window_perimeter", "efflorescence"]);
    expect(featuresOf(observation({ flatId: "502", kind: "denial", zone: "floor", surface: "dry", rawText: "our floor is dry" }), blockA)).toEqual(["upper_floor_dry"]);
    expect(featuresOf(observation(), blockA, photo())).toEqual(["duct_wall_dry"]);
    for (const quality of ["too_dark", "blurry", "too_far"] as const) expect(featuresOf(observation(), blockA, photo({ quality }))).toEqual([]);
    expect(featuresOf(observation({ surface: "unclear", rawText: "" }), blockA)).toEqual([]);
  });
  it("requires measured meter values and recognizes check outcomes", () => {
    expect(featuresOf(observation({ zone: "meter", meter: { start: 10, end: 10, minutes: 10 }, rawText: "" }), blockA)).toEqual(["meter_still"]);
    expect(featuresOf(observation({ zone: "meter", meter: { start: 10, end: 11, minutes: 10 }, rawText: "" }), blockA)).toEqual(["meter_moved"]);
    expect(featuresOf(observation({ zone: "meter", meter: { start: 10, end: 11, minutes: 0 }, rawText: "" }), blockA)).toEqual([]);
    expect(featuresOf(observation({ zone: "trap_grout", surface: "crack", rawText: "" }), blockA)).toEqual(["trap_grout_cracked"]);
    expect(featuresOf(observation({ zone: "trap_grout", surface: "dry", rawText: "" }), blockA)).toEqual(["trap_grout_ok"]);
    expect(featuresOf(observation({ zone: "other", surface: "unclear", checkId: "dye_test@502", rawText: "dye appeared" }), blockA)).toEqual(["dye_appeared"]);
    expect(featuresOf(observation({ zone: "other", surface: "unclear", checkId: "flood_test@502", rawText: "flood test positive" }), blockA)).toEqual(["flood_test_positive"]);
  });
});
