import { SecondOpinion, type EngineState, type Hypothesis } from "@stacksense/contracts";
import { rankChecks } from "./voi";
import { stopRule } from "./stop";
const levels = {mechanism:0,area:1,component:2} as const;
import { claimEvidence } from "./claimEvidence";
export { claimEvidence } from "./claimEvidence";
import { buildJobSheet } from "./jobSheet";
export function applySecondOpinion(state:EngineState,draft:SecondOpinion|null):EngineState {
  const evidence=claimEvidence(state),parsed=SecondOpinion.safeParse(draft);
  let opinion:SecondOpinion;
  if(!parsed.success) opinion={verdict:"review_failed",source:"fallback",allowedLevel:evidence.level,claim:"Second Opinion unavailable — unreviewed",supports:[],challenges:[],unknown:[],wouldChange:[]};
  else {
    const requested=parsed.data.allowedLevel;
    const allowedLevel=levels[requested]>levels[evidence.level]?evidence.level:requested;
    const capped=allowedLevel!==requested;
    const claim=allowedLevel==="component" ? `Probable ${evidence.top?.flatId ?? "source"} ${evidence.component ?? "component"}`
      : allowedLevel==="area" ? evidence.top?.label ?? "Probable source area requires inspection"
      : `Probable ${evidence.top?.family.replaceAll("_"," ") ?? "unresolved"} mechanism; source area requires evidence`;
    opinion={...parsed.data,allowedLevel,claim,verdict:capped&&parsed.data.verdict!=="objection"?"needs_evidence":parsed.data.verdict};
  }
  const next={...state,secondOpinion:opinion};
  let checks=state.safety.status==="ok"?rankChecks(next):[];
  if(opinion.verdict==="needs_evidence") {
    const suggestion=opinion.wouldChange.join(" ").toLowerCase();
    const requested=checks.find(c=>suggestion.includes(c.id.toLowerCase()) || (c.type==="trap_grout_photo"&&/trap|grout/.test(suggestion)));
    if(requested && (requested.excluded===null || requested.excluded==="can't change the action")) {
      checks=[{...requested,excluded:null,why:`Second Opinion requests evidence: ${requested.why}`},...checks.filter(c=>c.id!==requested.id)];
    }
  }
  const result={...next,nextChecks:checks};
  const stopped={...result,stop:stopRule(result)};
  return {...stopped,jobSheet:buildJobSheet(stopped)};
}
