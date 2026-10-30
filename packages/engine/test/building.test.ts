import { describe, expect, it } from "vitest";
import { Building } from "@stacksense/contracts";
import { blockA } from "../src/building/blockA";
import { ukBlock } from "../src/building/ukBlock";
import { createGraph } from "../src/building/graph";

describe("A-T02 buildings and topology", () => {
  it("models the exact hero building", () => {
    expect(Building.safeParse(blockA).success).toBe(true);
    expect(blockA).toMatchObject({ name: "Block A", lat: 19.07, lon: 72.88, floors: 6, hasTerrace: true });
    expect(blockA.flats.map(f => f.id)).toEqual(["101","102","201","202","301","302","401","402","501","502","601","602"]);
    expect(blockA.flats.filter(f => f.hasWaterMeter).map(f => f.id)).toEqual(["502"]);
    expect(blockA.flats.every(f => f.access === "open")).toBe(true);
    expect(blockA.stacks.find(s => s.id === "S-x02")?.flatIds).toEqual(["102","202","302","402","502","602"]);
    expect(blockA.flats.filter(f => f.position === "02").every(f => f.externalWalls.includes("W") && f.wetAreas.includes("bathroom"))).toBe(true);
  });
  it("models eight UK flats over four floors", () => {
    expect(Building.safeParse(ukBlock).success).toBe(true);
    expect(ukBlock).toMatchObject({ region: "UK", archetype: "UK_1960S_BLOCK", lat: 53.62, lon: -2.16, floors: 4 });
    expect(ukBlock.flats.map(f => f.id)).toEqual(["1","2","3","4","5","6","7","8"]);
  });
  it("queries vertical, lateral and shared-stack neighbours", () => {
    const g = createGraph(blockA);
    expect(g.above("402")?.id).toBe("502");
    expect(g.below(blockA.flats.find(f => f.id === "402")!)?.id).toBe("302");
    expect(g.above("602")).toBeUndefined();
    expect(g.below("102")).toBeUndefined();
    expect(g.sameStack("402").map(f => f.id)).toEqual(["102","202","302","502","602"]);
    expect(g.neighbours("402").map(f => f.id)).toEqual(["302","401","502"]);
    expect(g.wallsFacing("W").map(f => f.id)).toEqual(["102","202","302","402","502","602"]);
    expect(g.sameStack("missing")).toEqual([]);
    expect(g.neighbours("missing")).toEqual([]);
    expect(g.above("missing")).toBeUndefined();
    expect(createGraph(ukBlock).above("4")?.id).toBe("6");
  });
});
