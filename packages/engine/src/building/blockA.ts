import { Building } from "@stacksense/contracts";

export const blockA: Building = Building.parse({
  id: "block-a", name: "Block A", region: "IN", archetype: "MUMBAI_RCC_1990S",
  lat: 19.07, lon: 72.88, floors: 6, hasTerrace: true,
  flats: Array.from({ length: 6 }, (_, i) => i + 1).flatMap(floor =>
    ["01", "02"].map(position => ({
      id: `${floor}${position}`, floor, position, wetAreas: ["bathroom", "kitchen", "wc"],
      externalWalls: [position === "02" ? "W" : "E"],
      hasWaterMeter: floor === 5 && position === "02", access: "open",
    })),
  ),
  stacks: ["01", "02"].map(position => ({
    id: `S-x${position}`, kind: "duct",
    flatIds: Array.from({ length: 6 }, (_, i) => `${i + 1}${position}`),
  })),
});
