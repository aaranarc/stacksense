import { SecondOpinion, type EngineState, type Hypothesis } from "@stacksense/contracts";
import { rankChecks } from "./voi";
import { stopRule } from "./stop";
const levels = {mechanism:0,area:1,component:2} as const;
export function claimEvidence(state:EngineState): {level:SecondOpinion["allowedLevel"];top:Hypothesis|undefined;mass:number;component:string|null} {
  const roots=state.hypotheses.filter(h=>!h.parentId);
  const massOf=(h:Hypothesis)=>(state.posterior[h.id] ?? 0)+state.hypotheses.filter(c=>c.parentId===h.id).reduce((s,c)=>s+(state.posterior[c.id] ?? 0),0);
  const top=[...roots].sort((a,b)=>massOf(b)-massOf(a))[0];
  const mass=top?massOf(top):0;
  if(!top || mass<.8) return {level:"mechanism",top,mass,component:null};
  let component:string|null=null;
  for(const o of state.observations) {
    if(o.flatId!==top.flatId) continue;
    if(o.kind==="professional_finding" && o.finding?.family===top.family && o.finding.component) component=o.finding.component;
    const good=state.photoLabels.find(p=>o.photoIds.includes(p.photoId)&&p.quality==="ok");
    if(top.family==="upper_wet_area" && good?.zone==="trap_grout" && good.surface==="crack") component="tile grout at the floor trap";
    if(top.family==="upper_wet_area" && o.checkId?.startsWith("dye_test@") && /dye appeared/i.test(o.rawText)) component="bathroom connection identified by dye test";
  }
  return {level:component?"component":"area",top,mass,component};
}
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
  return {...result,stop:stopRule(result)};
}
