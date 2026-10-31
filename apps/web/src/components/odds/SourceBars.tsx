'use client';
import { motion,useReducedMotion } from 'framer-motion';
import type { EngineState,Hypothesis } from '@stacksense/contracts';
import { sourceBarStatus } from '../../lib/visual';
import { regionalText } from '../../lib/labels';
const levels={mechanism:0,area:1,component:2};
export function permittedLabel(h:Hypothesis,state:EngineState):string {
 const allowed=state.secondOpinion?.allowedLevel??'area';
 if(levels[h.level]<=levels[allowed]) return h.label;
 const parent=state.hypotheses.find(p=>p.id===h.parentId&&levels[p.level]<=levels[allowed]);
 if(parent) return parent.label;
 if(allowed==='mechanism') return h.family.replaceAll('_',' ');
 return h.family==='upper_wet_area'?`${h.flatId??'Upper'} bathroom area`:`${h.flatId??''} ${h.family.replaceAll('_',' ')} area`.trim();
}
export function SourceBars({state,selected=null}:{state:EngineState;selected?:string|null}) {
 const reduced=useReducedMotion();
 const ranked=[...state.hypotheses].sort((a,b)=>(state.posterior[b.id]??0)-(state.posterior[a.id]??0));
 const top=ranked.slice(0,3);
 const shown=top.map(h=>Math.round((state.posterior[h.id]??0)*100));
 // "Other" carries the remainder so the displayed percentages always add up to 100.
 const rows=top.map((h,i)=>({id:h.id,flatId:h.flatId,label:permittedLabel(h,state),pct:shown[i]!,status:sourceBarStatus(h.id===ranked[0]?.id)}));
 rows.push({id:'others',flatId:null,label:'Other',pct:Math.max(0,100-shown.reduce((a,b)=>a+b,0)),status:sourceBarStatus(false)});
 if(!state.observations.length)return <div className="empty-state"><p>Source estimates appear with the case evidence.</p><small>Load the demo chat or open Judge Mode → Play.</small></div>;
 return <div className="odds">{rows.map(row=><div key={row.id} className={`odds-row${selected&&row.flatId===selected?' selected':''}${row.id===ranked[0]?.id?' leading':''}`}>
  <span className="odds-dot" style={{background:row.status.colour}} aria-hidden="true"/>
  <span className="odds-label">{regionalText(row.label,state.building.region)}{row.id===ranked[0]?.id&&<small className="bar-status"> · {row.status.label}</small>}</span>
  <div className="odds-track" role="meter" aria-label={row.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={row.pct} aria-valuetext={`${row.pct}% · ${row.status.label}`}><motion.div className="odds-fill" initial={false} animate={{width:`${row.pct}%`}} transition={reduced?{duration:0}:{type:'spring',stiffness:140,damping:22}} style={{background:row.status.colour}}/></div>
  <strong className="odds-pct">{row.pct}%</strong>
 </div>)}<p className="card-foot">Probable source · verify on site</p></div>;
}
