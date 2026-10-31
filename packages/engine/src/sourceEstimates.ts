import type {EngineState,Hypothesis} from '@stacksense/contracts';
const levels={mechanism:0,area:1,component:2} as const;
/** Combine alternatives that have the same permitted claim, preserving all probability mass. */
export function sourceEstimates(state:EngineState):{id:string;flatId:string|null;label:string;probability:number}[]{
 const rows=new Map<string,{id:string;flatId:string|null;label:string;probability:number}>();
 for(const h of state.hypotheses){
  const label=permittedSourceLabel(h,state),existing=rows.get(label),probability=state.posterior[h.id]??0;
  if(existing)existing.probability+=probability;else rows.set(label,{id:h.id,flatId:h.flatId,label,probability});
 }
 return [...rows.values()].sort((a,b)=>b.probability-a.probability);
}

export function permittedSourceLabel(h:Hypothesis,state:EngineState):string{
 const allowed=state.secondOpinion?.allowedLevel??'area';
  if(levels[h.level]<=levels[allowed])return h.label;
  const parent=state.hypotheses.find(p=>p.id===h.parentId&&levels[p.level]<=levels[allowed]);
  if(parent)return parent.label;
  return allowed==='mechanism'?h.family.replaceAll('_',' '):h.family==='upper_wet_area'?`${h.flatId??'Upper'} bathroom area`:`${h.flatId??''} ${h.family.replaceAll('_',' ')} area`.trim();

}
