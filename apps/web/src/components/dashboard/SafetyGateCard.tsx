'use client';
import {useState} from 'react';
import {answerSafetyQuestions} from '../../lib/adapters';
import type { EngineState } from '@stacksense/contracts';
import type { LucideIcon } from 'lucide-react';
import { Zap, House, Waves, Wind, ShieldCheck, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { colours, tint } from '../../lib/visual';
import { humanReason } from '../safety/EmergencyCard';

/** The same four questions the neighbour page asks. */
export const SAFETY_QUESTIONS: { hazard: 'water_near_electrics' | 'sagging_ceiling' | 'fast_ingress' | 'sewage'; text: string; icon: LucideIcon }[] = [
  { hazard: 'water_near_electrics', text: 'Water near a switch, socket or light?', icon: Zap },
  { hazard: 'sagging_ceiling', text: 'Ceiling sagging or bulging?', icon: House },
  { hazard: 'fast_ingress', text: 'Water coming in fast?', icon: Waves },
  { hazard: 'sewage', text: 'Sewage smell?', icon: Wind },
];
export type Answer = 'Yes' | 'No' | 'Unanswered';
/** Yes = a hazard is recorded; No = every report answered the questions without it; otherwise Unanswered (never "safe"). */
export function answerOf(state: EngineState, hazard: string): Answer {
  const obs = state.observations;
  if (obs.some(o => o.hazards.includes(hazard as never)) || state.safety.reasons.some(r => r.endsWith(`: ${hazard}`))) return 'Yes';
  return obs.length && obs.every(o => o.hazardQuestionsAnswered) ? 'No' : 'Unanswered';
}

export function SafetyGateCard({ state,onState }: { state: EngineState;onState?:(state:EngineState)=>void }) {
  const [answers,setAnswers]=useState<Partial<Record<typeof SAFETY_QUESTIONS[number]['hazard'],boolean>>>({}),[error,setError]=useState('');
  const status = state.safety.status;
  return <div className="safety-gate">
    <ul className="safety-rows">{SAFETY_QUESTIONS.map(({ hazard, text, icon: Icon }) => { const a = answerOf(state, hazard); const c = a === 'Yes' ? colours.red : a === 'No' ? colours.green : colours.grey; return <li key={hazard}>
      <span className="icon-tile" style={{ background: tint(c, .12), color: c }} aria-hidden="true"><Icon size={16} /></span>
      <span className="safety-q">{text}</span>
      <span className={`answer-pill ${a.toLowerCase()}`}><i style={{ background: c }} aria-hidden="true" />{a}</span>
    </li>; })}</ul>
    {status === 'emergency' ? <div className="result-panel" style={{ background: tint(colours.red), borderColor: colours.red }}><ShieldAlert size={22} color={colours.red} aria-hidden="true" /><div><strong>Diagnosis stopped for safety</strong><ul>{[...new Set(state.safety.reasons.map(humanReason))].map(r => <li key={r}>{r}</li>)}</ul></div></div>
      : status === 'ok' ? <div className="result-panel" style={{ background: tint(colours.green), borderColor: colours.green }}><ShieldCheck size={22} color={colours.green} aria-hidden="true" /><div><strong>No safety hazards detected</strong><span>Safe to continue with diagnosis</span></div></div>
      : <div role="status" className="result-panel" style={{ background: tint(colours.amber, .12), borderColor: colours.amber }}><ShieldQuestion size={22} color="#B54708" aria-hidden="true" /><div><strong>Safety questions unanswered — not marked safe</strong><span>Confirm the reported answers below or use a neighbour check. Never approach a hazard.</span></div></div>}
    {onState&&state.observations.length>0&&status==='incomplete'&&<form onSubmit={e=>{e.preventDefault();try{onState(answerSafetyQuestions(state,answers));setError('');}catch{setError('Answer all four questions explicitly.');}}}><h3>Confirm the reported safety answers</h3><p className="note">Answer for every affected area, using what residents reported. Do not approach to check a hazard. If an answer is unknown, leave it unanswered.</p>{SAFETY_QUESTIONS.map(q=><fieldset key={q.hazard}><legend>{q.text}</legend>{[true,false].map(value=><label key={String(value)}><input type="radio" name={`confirm-${q.hazard}`} aria-label={`Confirm ${q.text} ${value?'Yes':'No'}`} checked={answers[q.hazard]===value} onChange={()=>{const next={...answers,[q.hazard]:value};setAnswers(next);if(value)onState(answerSafetyQuestions(state,next));}}/>{value?'Yes':'No'}</label>)}</fieldset>)}<button className="outline-btn" disabled={SAFETY_QUESTIONS.some(q=>answers[q.hazard]===undefined)}>Record safety answers</button>{error&&<p role="alert">{error}</p>}</form>}
  </div>;
}
