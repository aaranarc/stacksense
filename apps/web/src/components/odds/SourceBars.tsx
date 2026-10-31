'use client';
import { motion,useReducedMotion } from 'framer-motion';
import type { EngineState,Hypothesis } from '@stacksense/contracts';
import { sourceBarStatus } from '../../lib/visual';
import {sourceEstimates} from '../../lib/adapters';
import { regionalText } from '../../lib/labels';
export function SourceBars({state,selected=null}:{state:EngineState;selected?:string|null}) {
 const reduced=useReducedMotion();
 const ranked=sourceEstimates(state);
 const top=ranked.slice(0,3);
 const shown=top.map(h=>Math.round(h.probability*100));
 // "Other" carries the remainder so the displayed percentages always add up to 100.
 const rows=top.map((h,i)=>({id:h.id,flatId:h.flatId,label:h.label,pct:shown[i]!,status:sourceBarStatus(h.id===ranked[0]?.id)}));
 rows.push({id:'others',flatId:null,label:'Other',pct:Math.max(0,100-shown.reduce((a,b)=>a+b,0)),status:sourceBarStatus(false)});
 if(!state.observations.length)return <div className="empty-state"><p>Source estimates appear with the case evidence.</p><small>Load the demo chat or open Judge Mode → Play.</small></div>;
 return <div className="odds">{rows.map(row=><div key={row.id} className={`odds-row${selected&&row.flatId===selected?' selected':''}${row.id===ranked[0]?.id?' leading':''}`}>
  <span className="odds-dot" style={{background:row.status.colour}} aria-hidden="true"/>
  <span className="odds-label">{regionalText(row.label,state.building.region)}{row.id===ranked[0]?.id&&<small className="bar-status"> · {row.status.label}</small>}</span>
  <div className="odds-track" role="meter" aria-label={row.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={row.pct} aria-valuetext={`${row.pct}% · ${row.status.label}`}><motion.div className="odds-fill" initial={false} animate={{width:`${row.pct}%`}} transition={reduced?{duration:0}:{type:'spring',stiffness:140,damping:22}} style={{background:row.status.colour}}/></div>
  <strong className="odds-pct">{row.pct}%</strong>
 </div>)}<p className="card-foot">Probable source · verify on site</p></div>;
}

export {permittedSourceLabel as permittedLabel} from '../../lib/adapters';
