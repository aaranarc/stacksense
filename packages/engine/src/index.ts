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

export function createCase(
  _building: Building,
  _opts?: { memory?: Record<SourceFamilyValue, number>; now?: string },
): EngineState {
  throw new Error("not implemented");
}

export function applyObservations(
  _state: EngineState,
  _obs: Observation[],
  _ctx?: { rain?: RainSeries; forecast?: RainSeries; photoLabels?: PhotoLabel[] },
): EngineState {
  throw new Error("not implemented");
}

export function applySecondOpinion(_state: EngineState, _draft: SecondOpinion | null): EngineState {
  throw new Error("not implemented");
}

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
