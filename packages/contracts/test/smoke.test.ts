import { describe, expect, it } from "vitest";
import { Building, ReadRequest, Region } from "../src/index";

describe("shared contracts", () => {
  it("accepts supported regions and rejects unknown ones", () => {
    expect(Region.parse("IN")).toBe("IN");
    expect(Region.safeParse("US").success).toBe(false);
  });

  it("validates a minimal read request and rejects missing fields", () => {
    expect(ReadRequest.parse({ buildingId: "block-a", messages: [], photos: [] })).toEqual({
      buildingId: "block-a", messages: [], photos: [],
    });
    expect(ReadRequest.safeParse({ messages: [], photos: [] }).success).toBe(false);
  });

  it("rejects incomplete building data", () => {
    expect(Building.safeParse({ id: "block-a" }).success).toBe(false);
  });
});
