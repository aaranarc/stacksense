'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { EngineState } from '@stacksense/contracts';
import { ArrowRight, Pause, Play, Scale } from 'lucide-react';
import { useCase } from '../case/CaseProvider';
import { incidents } from '../feed/CaseFeed';
import { colours, tint } from '../../lib/visual';
import { STEPS, NEXT } from '../../lib/steps';
export { STEPS, NEXT, HASH_ROUTES } from '../../lib/steps';

type Tone = 'grey' | 'amber' | 'red' | 'green';
const verdicts = { objection: 'Objection', needs_evidence: 'Needs evidence', no_objection: 'No objection', review_failed: 'Review failed' } as const;
/** Status of each step, read straight from the engine state (no new judgements). */
export function stepStatus(state: EngineState, n: number): { text: string; tone: Tone } {
  const stopped = state.safety.status === 'emergency';
  switch (n) {
    case 1: { const k = incidents(state.observations).length; return k ? { text: `${k} incident${k === 1 ? '' : 's'} read`, tone: 'grey' } : { text: 'Not started', tone: 'grey' }; }
    case 2: return stopped ? { text: 'Emergency stop', tone: 'red' } : state.safety.status === 'ok' ? { text: 'Answered · no hazard', tone: 'green' } : { text: 'Unanswered', tone: 'amber' };
    case 3: return stopped ? { text: 'Stopped for safety', tone: 'red' } : state.stop.stopped ? { text: 'Checks complete', tone: 'grey' } : state.nextChecks.some(c => !c.excluded) ? { text: 'Next check chosen', tone: 'grey' } : { text: 'Waiting for evidence', tone: 'grey' };
    case 4: return state.secondOpinion ? { text: verdicts[state.secondOpinion.verdict], tone: 'grey' } : { text: 'Not reviewed', tone: 'grey' };
    case 5: return stopped ? { text: 'Stopped for safety', tone: 'red' } : state.jobSheet ? { text: 'Ready', tone: 'green' } : { text: 'Not yet', tone: 'grey' };
    case 6: { const r = state.recovery; return r.paint === 'ready' ? { text: 'Ready to paint', tone: 'green' } : r.dry === 'dry' ? { text: 'Dry reading', tone: 'grey' } : r.repair === 'done' ? { text: 'Repair done · drying', tone: 'amber' } : { text: 'Not started', tone: 'grey' }; }
    default: { const k = state.prediction.sameStack.length + state.prediction.forecastRechecks.length; return k ? { text: `${k} inspection${k === 1 ? '' : 's'} suggested`, tone: 'amber' } : { text: 'Nothing flagged', tone: 'grey' }; }
  }
}

export function StatusChip({ text, tone }: { text: string; tone: Tone }) {
  const c = colours[tone];
  return <span className="status-chip" style={{ borderColor: tint(c, .45), background: tint(c, .08) }}><i style={{ background: c }} aria-hidden="true" />{text}</span>;
}

export function ProgressStrip() {
  const { state } = useCase();
  return <nav className="card progress-strip" aria-label="Case steps">
    <ol>{STEPS.map(s => { const st = stepStatus(state, s.n); return <li key={s.n}>
      <Link href={s.href}><span className="step-dot blue" aria-hidden="true">{s.n}</span><span className="progress-title">{s.title}</span><StatusChip {...st} /></Link>
    </li>; })}</ol>
  </nav>;
}

export function NextLink({ from }: { from: string }) {
  const next = NEXT[from];
  return next ? <p className="next-link"><Link className="button-link" href={next.href}>Next: {next.label} <ArrowRight size={15} aria-hidden="true" /></Link></p> : null;
}

/** Empty case: point the judge at the two ways in. */
export function StartBanner() {
  const { state, hydrated, player } = useCase(); const router = useRouter();
  if (!hydrated || state.observations.length) return null;
  return <section className="start-banner" aria-label="Start here">
    <p><strong>Start here:</strong> Judge Mode → Play, or Load demo chat</p>
    <div className="check-actions">
      <button className="primary" onClick={() => { if (!player.playing) player.toggle(); router.push('/judge'); }}><Play size={15} aria-hidden="true" />Judge Mode → Play</button>
      <Link className="button-link" href="/incidents?demo=1">Load demo chat</Link>
    </div>
  </section>;
}

/** Sticky top-bar pill: demo progress on every page, and the way into Judge Mode on phones. */
export function DemoPill() {
  const { player } = useCase();
  const running = player.playing || (player.step > 0 && player.step < player.total);
  if (!running) return <Link className="demo-pill idle" href="/judge"><Scale size={15} aria-hidden="true" />Judge Mode</Link>;
  return <div className="demo-pill" role="status">
    <Link href="/judge">{player.playing ? 'Demo running' : 'Demo paused'} · step {player.step}/{player.total}</Link>
    <button onClick={player.toggle} aria-label={player.playing ? 'Pause demo' : 'Resume demo'}>{player.playing ? <><Pause size={14} aria-hidden="true" />Pause</> : <><Play size={14} aria-hidden="true" />Play</>}</button>
  </div>;
}
