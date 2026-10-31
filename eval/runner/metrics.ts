// Pure metric functions for the engine evaluation (C-T02). No engine logic here.
import type { z } from "zod";
import type { EvalRow as EvalRowSchema } from "../../packages/contracts/src/index";
export type EvalRow = z.infer<typeof EvalRowSchema>;

export type Level = "mechanism" | "area" | "component";
export type Source = { family: string; flatId: string | null };
export type Truth = Source & { trade: string; emergency: boolean; inspect: boolean };
/** What one method concluded on one case. trade "emergency" = stopped for safety. */
export type Outcome = {
  caseId: string; set: "hard" | "sim"; truth: Truth;
  leaders: (Source | null)[];          // leader after 0,1,2,... answered checks (index = checks)
  trade: string; level: Level;         // final decision; undecided methods report general_inspector
  claim: Source | null;                // source named at `level`
  componentEvidence: boolean;          // a component-specific observation was actually collected
  checks: number; decided: boolean; ms: number;
};

const LEVEL = { mechanism: 0, area: 1, component: 2 } as const;

/** Leader matches truth: same family, and same flat when both name one. */
export function sameSource(a: Source | null, truth: Source): boolean {
  if (!a || a.family !== truth.family) return false;
  return a.flatId === null || truth.flatId === null || a.flatId === truth.flatId;
}

export function rightTrade(o: Outcome): boolean {
  return o.truth.emergency ? o.trade === "emergency" : o.trade === o.truth.trade;
}

export function leaderAfter(o: Outcome, k: number): Source | null {
  return o.leaders[Math.min(k, o.leaders.length - 1)] ?? null;
}

/** Top-1 is only defined where truth names a source: not hazard, not "inspect" cases. */
export const scoresTop1 = (o: Outcome) => !o.truth.emergency && !o.truth.inspect;

/**
 * Over-claim: the method commits to a trade AND claims more than the evidence supports —
 * any committed source on an "inspect" case, an area/component claim on the wrong source,
 * or a component claim with no component-specific evidence collected.
 */
export function overclaims(o: Outcome): boolean {
  if (o.truth.emergency || o.trade === "emergency" || o.trade === "general_inspector") return false;
  if (o.truth.inspect) return true;
  if (LEVEL[o.level] >= LEVEL.area && !sameSource(o.claim, o.truth)) return true;
  return o.level === "component" && !o.componentEvidence;
}

/** Number of single observations that turned a correct leader into a wrong one. */
export function harmfulFlips(o: Outcome): number {
  if (!scoresTop1(o)) return 0;
  let flips = 0;
  for (let i = 1; i < o.leaders.length; i++) {
    if (sameSource(o.leaders[i - 1]!, o.truth) && !sameSource(o.leaders[i]!, o.truth)) flips++;
  }
  return flips;
}

const rate = (xs: boolean[]) => (xs.length ? xs.filter(Boolean).length / xs.length : 0);
const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const r3 = (x: number) => Math.round(x * 1000) / 1000;

export function aggregate(method: string, outcomes: Outcome[]): EvalRow {
  const top = outcomes.filter(scoresTop1);
  const hazards = outcomes.filter((o) => o.truth.emergency);
  const decided = outcomes.filter((o) => o.decided && o.trade !== "emergency");
  return {
    method,
    rightTrade: r3(rate(outcomes.map(rightTrade))),
    top1: [1, 2, 3].map((k) => r3(rate(top.map((o) => sameSource(leaderAfter(o, k), o.truth))))),
    overclaim: r3(rate(outcomes.map(overclaims))),
    harmfulFlips: outcomes.reduce((s, o) => s + harmfulFlips(o), 0),
    checksToDecision: r3(mean(decided.map((o) => o.checks))),
    // NaN (→ null in JSON) when the set has no hazard cases: "n/a", never a fake 0 or 1.
    hazardPass: hazards.length ? r3(rate(hazards.map((o) => o.trade === "emergency"))) : NaN,
    msPerCase: r3(mean(outcomes.map((o) => o.ms))),
  };
}
