import type { EngineState } from "@stacksense/contracts";

export function stopRule(state: EngineState): EngineState["stop"] {
  if (state.safety.status === "emergency") return { stopped: true, reason: "emergency" };
  if (state.safety.status !== "ok" || state.recovery.reopened || !state.hypotheses.length) return { stopped: false, reason: null };
  const top = [...state.hypotheses].sort((a,b) => (state.posterior[b.id] ?? 0) - (state.posterior[a.id] ?? 0))[0]!;
  if ((state.posterior[top.id] ?? 0) >= .80 && state.secondOpinion?.verdict !== "objection") {
    return { stopped: true, reason: "Probable source reached 80% with no Second Opinion objection" };
  }
  const best = Math.max(0, ...state.nextChecks.filter(c => c.excluded === null).map(c => c.score));
  if (best < .05) {
    const target = top.flatId ?? top.stackId ?? state.caseId;
    return { stopped: true, reason: `Remote evidence can't decide — inspect ${target}` };
  }
  return { stopped: false, reason: null };
}
