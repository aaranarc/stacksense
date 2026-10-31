import type { EngineState, Flat, Hypothesis,Observation } from '@stacksense/contracts';
export const colours = { grey: '#9CA3AF', amber: '#D97706', red: '#DC2626', green: '#16A34A' };
export function visualStatus(label: string, kind: keyof typeof colours = 'grey', dashed = false) { return {colour: colours[kind], label, dashed}; }
export function sourceBarStatus(leading:boolean){return visualStatus(leading?'Probable source':'Alternative',leading?'red':'grey');}
export function statusOf(item: Flat | Hypothesis, state: EngineState) {
 const leader=[...state.hypotheses].sort((a,b)=>(state.posterior[b.id]??0)-(state.posterior[a.id]??0))[0];
 if('family' in item){
  if(!state.observations.length||!((state.posterior[item.id]??0)>0))return visualStatus(`${item.label} · not assessed`);
  return visualStatus(`${item.label} · ${item.id===leader?.id?'probable source':'suspected'}`,item.id===leader?.id?'red':'amber',!state.stop.stopped);
 }
 const flatId=item.id,observations=state.observations.filter(o=>o.flatId===flatId);
 if(state.observations.length&&leader?.flatId===flatId)return visualStatus(`${flatId} · probable source`,'red',!state.stop.stopped);
 if(state.prediction.sameStack.some(p=>p.flatId===flatId))return visualStatus(`${flatId} · inspect`,'amber',true);
 if(observations.some(o=>o.kind==='complaint'))return visualStatus(`${flatId} · victim`,'amber');
 // Only a named check can clear a flat; denials and unrequested dry-floor reports cannot.
 const latest=new Map<string,Observation>();
 for(const o of observations){if(o.kind!=='check_result'||!o.checkId)continue;const previous=latest.get(o.checkId);if(!previous||o.at>=previous.at)latest.set(o.checkId,o);}
 const passed=[...latest.values()].filter(o=>{
  if(!o.hazardQuestionsAnswered||o.hazards.length||!Number.isFinite(Date.parse(o.at)))return false;
  const labels=state.photoLabels.filter(p=>o.photoIds.includes(p.photoId));
  return o.surface==='dry'&&labels.every(p=>p.quality==='ok'&&p.surface==='dry');
 }).sort((a,b)=>b.at.localeCompare(a.at))[0];
 if(passed)return visualStatus(`${flatId} · ${passed.zone==='duct_wall'?'duct dry':'check passed'} · ${new Date(passed.at).toLocaleDateString('en-GB',{day:'numeric',month:'short',timeZone:'UTC'})}`,'green');
 if(observations.length||state.hypotheses.some(h=>h.flatId===flatId&&(state.posterior[h.id]??0)>0))return visualStatus(`${flatId} · suspected`,'amber',!observations.length);
 return visualStatus(`${flatId} · not assessed`,'grey',true);
}
