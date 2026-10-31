'use client';
import { useEffect, useState } from 'react';
import type { EngineState } from '@stacksense/contracts';
import { Scale, CircleCheck } from 'lucide-react';
import { ScenarioPicker, outcomeOf } from './ScenarioPicker';
import { EvalCard } from './EvalCard';
import { HowItDecided } from './HowItDecided';
import { BreakIt } from './BreakIt';
import { WhatIfSliders } from '../whatif/WhatIfSliders';
import s from './judge.module.css';

/** Only facts that hold in the current engine state; nothing is listed that the state does not show. */
export function decisionChecks(state: EngineState): string[] {
  const out: string[] = [];
  if (state.safety.status === 'emergency') out.push('Emergency stop shown — no diagnosis');
  if (state.safety.status === 'ok') out.push('Safety questions answered — no hazard');
  if (state.jobSheet?.send.length) out.push('Job Sheet names the trade to send');
  if (state.jobSheet?.dontSend.length) out.push('Job Sheet names the trade not to send');
  if (state.jobSheet?.notJustifiedYet.length) out.push('Unjustified work listed (do not break)');
  if (state.secondOpinion && state.secondOpinion.verdict !== 'review_failed') out.push(`Claim capped at ${state.secondOpinion.allowedLevel} level by the Second Opinion`);
  if (state.recovery.paint !== 'ready') out.push('Not ready to paint without a dry moisture reading');
  if (state.prediction.sameStack.length) out.push('Same-stack inspections suggested');
  return state.observations.length ? out : [];
}

function useRightTrade(src = '/eval/latest.json') {
  const [pct, setPct] = useState<number | null>(null);
  useEffect(() => {
    let live = true;
    try {
      fetch(src).then(r => (r.ok ? r.json() : null)).then(json => { const v = json?.rowsBySet?.hard?.find((row:{method:string})=>row.method==='StackSense')?.rightTrade; if (live && typeof v === 'number') setPct(Math.round(v * 100)); }).catch(() => {});
    } catch { /* no network in this environment */ }
    return () => { live = false; };
  }, [src]);
  return pct;
}

/** sheet: phone bottom sheet (default). The /judge page passes sheet={false} and shows the panel as the page. */
export function JudgePanel({ state, onState, sheet = true }: { state: EngineState; onState: (s: EngineState) => void; sheet?: boolean }) {
  const [collapsed, setCollapsed] = useState(false);
  // At phone width (≤480 px) the panel is a bottom sheet; it starts collapsed there so the case stays visible.
  useEffect(() => { if (sheet && window.matchMedia?.('(max-width: 480px)').matches) setCollapsed(true); }, [sheet]);
  const rightTrade = useRightTrade();
  const checks = decisionChecks(state);
  return <aside className={`${s.panel} ${sheet ? s.sheet : ''} ${collapsed ? s.collapsed : ''}`} aria-label="Judge Mode">
    <div className={s.sheetHead}>
      <div className={s.title}><span className={s.titleIcon} aria-hidden="true"><Scale size={20} /></span><div><h2>Judge Mode</h2><p>What-if scenarios. See how it decides.</p></div></div>
      {sheet && <button className={s.sheetToggle} aria-expanded={!collapsed} aria-controls="judge-body" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? 'Show panel ▴' : 'Hide panel ▾'}
      </button>}
    </div>
    <div id="judge-body" className={s.body}>
      <div className={s.cols}>
        <div className={s.inputs}>
          <details open><summary>Scenarios</summary><ScenarioPicker onState={onState} /></details>
          <details open><summary>What-if</summary><p className={s.small}>Adjust inputs — the engine replays the evidence.</p><WhatIfSliders state={state} onState={onState} /></details>
        </div>
        <section className={s.decision} aria-label="Decision check">
          <p className={s.kicker}>Decision check</p>
          <div className={s.decisionTile}><CircleCheck size={22} aria-hidden="true" /><div><small>Current decision</small><strong>{state.observations.length ? outcomeOf(state) : 'No evidence yet'}</strong></div></div>
          {checks.length > 0 && <ul className={s.checklist}>{checks.map(c => <li key={c}><CircleCheck size={14} aria-hidden="true" />{c}</li>)}</ul>}
          {rightTrade !== null && <p className={s.foot}>Hard-case right trade {rightTrade}% · prepared 30-case subset · team-built test, not field accuracy</p>}
        </section>
      </div>
      <details><summary>Evaluation</summary><EvalCard region={state.building.region} state={state} /></details>
      <details><summary>How it decided</summary><HowItDecided state={state} /></details>
      <details><summary>Break it</summary><BreakIt onState={onState} /></details>
    </div>
  </aside>;
}
