import type { SecondOpinion, EngineState, Hypothesis } from "@stacksense/contracts";
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
