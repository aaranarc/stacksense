import { describe, expect, it } from "vitest";
import { Hypothesis } from "@stacksense/contracts";
import { blockA } from "../src/building/blockA";
import { hypothesesForVictims } from "../src/hypotheses";

describe("A-T03 hypotheses", () => {
  it("generates the hero source tree", () => {
    const [group] = hypothesesForVictims(blockA, ["402"], { caseId: "hero" });
    expect(group?.caseId).toBe("hero:402");
    expect(group?.hypotheses.map(h => [h.id, h.family, h.level, h.parentId])).toMatchInlineSnapshot(`
      [
        [
          "402:upper_wet_area@502",
          "upper_wet_area",
          "area",
          null,
        ],
        [
          "402:nahani_trap@502",
          "upper_wet_area",
          "component",
          "402:upper_wet_area@502",
        ],
        [
          "402:tile_grout@502",
          "upper_wet_area",
          "component",
          "402:upper_wet_area@502",
        ],
        [
          "402:sunken_slab_membrane@502",
          "upper_wet_area",
          "component",
          "402:upper_wet_area@502",
        ],
        [
          "402:wc_connection@502",
          "upper_wet_area",
          "component",
          "402:upper_wet_area@502",
        ],
        [
          "402:upper_supply@502",
          "upper_supply",
          "mechanism",
          null,
        ],
        [
          "402:shared_shaft@S-x02",
          "shared_shaft",
          "mechanism",
          null,
        ],
        [
          "402:facade_window@402:W",
          "facade_window",
          "area",
          null,
        ],
        [
          "402:roof_terrace",
          "roof_terrace",
          "mechanism",
          null,
        ],
        [
          "402:condensation@402",
          "condensation",
          "mechanism",
          null,
        ],
        [
          "402:other",
          "other",
          "mechanism",
          null,
        ],
      ]
    `);
    expect(group?.hypotheses.every(h => Hypothesis.safeParse(h).success)).toBe(true);
    expect(group?.hypotheses.find(h => h.level === "area" && h.family === "upper_wet_area")?.label).toContain("bathroom");
  });
  it("keeps victims independent and adds diagonal candidates only when requested", () => {
    const groups = hypothesesForVictims(blockA, ["402", "202", "402"], { caseId: "hero", lateral: true });
    expect(groups.map(g => g.caseId)).toEqual(["hero:402", "hero:202"]);
    expect(groups[0]?.hypotheses.some(h => h.flatId === "501" && h.family === "upper_wet_area")).toBe(true);
    expect(hypothesesForVictims(blockA, ["402"])[0]?.hypotheses.some(h => h.flatId === "501")).toBe(false);
    expect(hypothesesForVictims(blockA, ["602"])[0]?.hypotheses.some(h => h.family === "upper_supply")).toBe(false);
    expect(() => hypothesesForVictims(blockA, ["missing"])).toThrow("Unknown victim flat");
  });
});
