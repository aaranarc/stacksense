import type { z } from "zod";
import type {
  Building, EngineState, Hypothesis, Observation, PhotoLabel,
  RainSeries, RankedCheck, SecondOpinion, SourceFamily,
} from "@stacksense/contracts";

type SourceFamilyValue = z.infer<typeof SourceFamily>;

export type ScenarioId = "happy" | "electrical_hazard" | "locked_502" | "dark_photo" | "beam_travel" | "wrong_trade_rain" | "honest_uncertainty" | "break_it";
export type Scenario = {
  title: string;
  building: Building;
  steps: Observation[][];
  rain?: RainSeries;
  forecast?: RainSeries;
};

// Entries are supplied in A-T20; consumers must handle missing scenarios until then.
export const scenarios: Partial<Record<ScenarioId, Scenario>> = {};

export { createCase, applyObservations, splitCases } from "./bayes";
export { blockA } from "./building/blockA";
export { ukBlock } from "./building/ukBlock";
export { createGraph } from "./building/graph";

export { applySecondOpinion } from "./secondOpinion";

export function whatIf(
  _state: EngineState,
  _patches: { observationId: string; patch: Partial<Observation> }[],
): EngineState {
  throw new Error("not implemented");
}

export function simulateBuilding(
  _seed: number,
  _opts?: { hiddenFamily?: SourceFamilyValue },
): { building: Building; truth: Hypothesis; answer(check: RankedCheck): Observation } {
  throw new Error("not implemented");
}

export { buildJobSheet } from "./jobSheet";
