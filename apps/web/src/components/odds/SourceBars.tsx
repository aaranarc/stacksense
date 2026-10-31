'use client';
import { motion,useReducedMotion } from 'framer-motion';
import type { EngineState,Hypothesis } from '@stacksense/contracts';
import { statusOf,visualStatus } from '../../lib/visual';
const levels={mechanism:0,area:1,component:2};
export function permittedLabel(h:Hypothesis,state:EngineState):string {
 const allowed=state.secondOpinion?.allowedLevel??'area';
 if(levels[h.level]<=levels[allowed]) return h.label;
 const parent=state.hypotheses.find(p=>p.id===h.parentId&&levels[p.level]<=levels[allowed]);
 if(parent) return parent.label;
 if(allowed==='mechanism') return h.family.replaceAll('_',' ');
 return h.family==='upper_wet_area'?`${h.flatId??'Upper'} bathroom area`:`${h.flatId??''} ${h.family.replaceAll('_',' ')} area`.trim();
}
export function SourceBars({state}:{state:EngineState}) {
 const reduced=useReducedMotion();
 const ranked=[...state.hypotheses].sort((a,b)=>(state.posterior[b.id]??0)-(state.posterior[a.id]??0));
 const top=ranked.slice(0,5);
 const others=ranked.slice(5).reduce((sum,h)=>sum+(state.posterior[h.id]??0),0);
 const rows=top.map(h=>({id:h.id,label:permittedLabel(h,state),value:state.posterior[h.id]??0,status:statusOf(h,state)}));
 rows.push({id:'others',label:'Others',value:others,status:visualStatus('Other probable sources')});
 return <section className="panel"><h2>Where is it from?</h2>{!state.observations.length?<p>Source estimates appear with the case evidence.</p>:<>{rows.map(row=><div key={row.id} className="source-row"><div className="source-label"><span>{row.label}</span><strong>{Math.round(row.value*100)}%</strong></div><div className="source-track" role="meter" aria-label={row.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(row.value*100)}><motion.div initial={false} animate={{width:`${row.value*100}%`}} transition={{duration:reduced?0:.3}} style={{background:row.status.colour,height:6,borderRadius:12}}/></div></div>)}<p className="diagram-key">Probable source · verify on site</p></>}</section>;
}
