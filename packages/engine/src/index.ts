import type { z } from "zod";
import type {
  Building, EngineState, Hypothesis, Observation, PhotoLabel,
  RainSeries, RankedCheck, SecondOpinion, SourceFamily,
} from "@stacksense/contracts";

type SourceFamilyValue = z.infer<typeof SourceFamily>;

export { scenarios, runScenario } from "./scenarios";
export type { Scenario, ScenarioId } from "./scenarios";

export { createCase, applyObservations, splitCases } from "./bayes";
export { blockA } from "./building/blockA";
export { ukBlock } from "./building/ukBlock";
export { createGraph } from "./building/graph";

export { applySecondOpinion } from "./secondOpinion";

export { whatIf } from "./whatIf";

export function simulateBuilding(
  _seed: number,
  _opts?: { hiddenFamily?: SourceFamilyValue },
): { building: Building; truth: Hypothesis; answer(check: RankedCheck): Observation } {
  throw new Error("not implemented");
}

export { buildJobSheet } from "./jobSheet";
export { recoveryOf, moistureThresholds } from "./recovery";
