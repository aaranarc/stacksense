'use client';
import { useState } from 'react';
import type { EngineState, SecondOpinion } from '@stacksense/contracts';
import type { LucideIcon } from 'lucide-react';
import { Ban, FileSearch, ShieldCheck, TriangleAlert, CircleCheck, CircleX } from 'lucide-react';
import { api,engine } from '../../lib/adapters';
import { colours, tint } from '../../lib/visual';
import { regionalText } from '../../lib/labels';
import { SecondOpinionDrawer } from './SecondOpinionDrawer';

const levels = { mechanism: 0, area: 1, component: 2 } as const;
const VERDICTS: { id: SecondOpinion['verdict']; label: string; icon: LucideIcon; colour: string }[] = [
  { id: 'objection', label: 'Objection', icon: Ban, colour: colours.red },
  { id: 'needs_evidence', label: 'Needs evidence', icon: FileSearch, colour: colours.amber },
  { id: 'no_objection', label: 'No objection', icon: ShieldCheck, colour: '#475467' },
  { id: 'review_failed', label: 'Review failed', icon: TriangleAlert, colour: colours.grey },
];

/** The one wording for a review on record, shared by this badge and the Ask the Right Check stop text. */
export const opinionBadge = (opinion: SecondOpinion) => `${opinion.source === 'fallback' ? 'Fallback' : 'Live'} · ${opinion.verdict.replaceAll('_', ' ')}`;

/** Claims more specific than the Second Opinion allows (engine hypotheses above the allowed level, leader first). */
export function tooSpecific(state: EngineState): string[] {
  const allowed = state.secondOpinion?.allowedLevel; if (!allowed) return [];
  return [...state.hypotheses].sort((a, b) => (state.posterior[b.id] ?? 0) - (state.posterior[a.id] ?? 0))
    .filter(h => levels[h.level] > levels[allowed] && (state.posterior[h.id] ?? 0) > 0).slice(0, 1).map(h => regionalText(h.label, state.building.region));
}

export function SecondOpinionBanner({state,onState,demoData=false}:{state:EngineState;demoData?:boolean;onState:(state:EngineState)=>void}) {
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const opinion=state.secondOpinion;
 const failed=opinion?.verdict==='review_failed';
 const current=VERDICTS.find(v=>v.id===opinion?.verdict);
 async function review(){setBusy(true);setError('');try{const draft=await api.secondOpinion(state);onState(engine.applySecondOpinion(state,draft));setOpen(true);}catch{onState(engine.applySecondOpinion(state,null));setError('Second Opinion unavailable — treat this result as unreviewed.');}finally{setBusy(false);}}
 const blocked=busy||!state.observations.length||state.safety.status==='emergency';
 const notAllowed=failed?[]:tooSpecific(state);
 return <div className="opinion">
  <ul className="verdict-tiles" aria-label="Second Opinion verdicts">{VERDICTS.map(v=>{const Icon=v.icon,on=v.id===opinion?.verdict;return <li key={v.id} aria-current={on?'true':undefined} className={on?'on':undefined} style={on?{borderColor:v.colour,background:tint(v.colour,.1)}:undefined}><Icon size={18} color={on?v.colour:'#98A2B3'} aria-hidden="true"/><span>{v.label}</span></li>;})}</ul>
  <div className="verdict-panel" style={{borderColor:current?.colour??'#E7EBF2',background:current?tint(current.colour,.07):undefined}}>
   <button className="opinion-button" disabled={blocked} onClick={()=>opinion?setOpen(true):void review()}>{busy?'Reading the evidence…':failed?'Second Opinion unavailable — treat this result as unreviewed.':opinion?`⚠ Second Opinion: ${opinion.claim} ▸`:'Second Opinion: request a review ▸'}</button>
   {opinion&&<small className="verdict-meta"><span className="chip">{opinionBadge(opinion)}</span>{demoData&&<span className="chip">Demo data</span>}</small>}
  </div>
  {opinion&&!failed&&<div className="claim-row allowed" style={{borderLeftColor:colours.green,background:tint(colours.green)}}><CircleCheck size={16} color={colours.green} aria-hidden="true"/><div><strong>Allowed now</strong><span>{regionalText(opinion.claim,state.building.region)}</span></div></div>}
  {notAllowed.length>0&&<div className="claim-row denied" style={{borderLeftColor:colours.red,background:tint(colours.red)}}><CircleX size={16} color={colours.red} aria-hidden="true"/><div><strong>Not allowed (too specific)</strong>{notAllowed.map(t=><span key={t}>“{t}”</span>)}</div></div>}
  {error&&<p role="alert">{error}</p>}{open&&<SecondOpinionDrawer state={state} demoData={demoData} onClose={()=>setOpen(false)}/>}
 </div>;
}
