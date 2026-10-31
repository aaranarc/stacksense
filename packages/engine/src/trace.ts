import type { z } from "zod";
import type { Hypothesis, TraceStep } from "@stacksense/contracts";
import type { Feature } from "./tables/likelihoods";

export function traceStep(
  before: Record<string, number>, after: Record<string, number>, hypotheses: Hypothesis[],
  observationId: string, features: Feature[], step: number,
): z.infer<typeof TraceStep> {
  return { step, observationId, changes: hypotheses.flatMap(h => {
    const a = before[h.id] ?? 0, b = after[h.id] ?? 0;
    return Math.abs(a - b) > .01 ? [{ hypothesisId: h.id, before: a, after: b,
      why: `${observationId}: ${features.map(f => f.replaceAll("_", " ")).join(", ")} changes ${h.family.replaceAll("_", " ")}`,
    }] : [];
  }) };
}
