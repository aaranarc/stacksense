import { Building } from "@stacksense/contracts";

export const ukBlock: Building = Building.parse({
  id: "uk-block", name: "UK Block", region: "UK", archetype: "UK_1960S_BLOCK",
  lat: 53.62, lon: -2.16, floors: 4, hasTerrace: true,
  flats: Array.from({ length: 8 }, (_, i) => ({
    id: String(i + 1), floor: Math.floor(i / 2) + 1, position: i % 2 === 0 ? "01" : "02",
    wetAreas: ["bathroom", "kitchen", "wc"], externalWalls: [i % 2 === 0 ? "E" : "W"],
    hasWaterMeter: false, access: "open",
  })),
  stacks: ["01", "02"].map((position, offset) => ({
    id: `UK-x${position}`, kind: "duct",
    flatIds: Array.from({ length: 4 }, (_, i) => String(i * 2 + offset + 1)),
  })),
});
