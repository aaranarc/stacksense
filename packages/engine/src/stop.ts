import type { EngineState } from "@stacksense/contracts";
import { claimEvidence } from "./claimEvidence";

export function stopRule(state: EngineState): EngineState["stop"] {
  if (state.safety.status === "emergency") return { stopped: true, reason: "emergency" };
  if (state.safety.status !== "ok" || state.recovery.reopened || !state.hypotheses.length) return { stopped: false, reason: null };
  // Area and its localized component are one source, with conserved total mass.
  const { top, mass } = claimEvidence(state);
  if (!top) return { stopped: false, reason: null };
  if (mass >= .80 - Number.EPSILON && state.secondOpinion?.verdict !== "objection") {
    // The text must match the review actually on record: only "no_objection" may be called "no objection".
    const verdict = state.secondOpinion?.verdict;
    return { stopped: true, reason: verdict === "no_objection" ? "Probable source reached 80% with no Second Opinion objection"
      : verdict === "needs_evidence" ? "Probable source reached 80%; Second Opinion asks for more evidence"
      : "Probable source reached 80%; Second Opinion unavailable — unreviewed" };
  }
  const best = Math.max(0, ...state.nextChecks.filter(c => c.excluded === null).map(c => c.score));
  if (best < .05) {
    // caseId is "<building>-<uuid>:<victim flat>"; show only the flat label, never the internal id.
    const target = top.flatId ?? top.stackId ?? state.caseId.split(":").pop();
    return { stopped: true, reason: `Remote evidence can't decide — inspect ${target}` };
  }
  return { stopped: false, reason: null };
}
