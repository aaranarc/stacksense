import { describe, expect, it } from "vitest";
import { applyObservations, applySecondOpinion, createCase, scenarios, simulateBuilding, whatIf } from "../src/index";
import type { Building, EngineState } from "@stacksense/contracts";

describe("A-T01 engine skeleton", () => {
  const building = {} as Building;
  const state = {} as EngineState;
  it.each([
    ["simulateBuilding", () => simulateBuilding(1)],
  ])("%s fails explicitly until implemented", (_name, call) => {
    expect(call).toThrow("not implemented");
  });
  it("does not pretend scenarios are implemented", () => {
    expect(scenarios).toEqual({});
  });
});
