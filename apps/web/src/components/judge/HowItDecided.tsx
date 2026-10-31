'use client';
import type { EngineState } from '@stacksense/contracts';
import s from './judge.module.css';

const words = (x: string) => x.replaceAll('_', ' ');
const pct = (x: number) => `${Math.round(x * 100)}%`;

/** One plain line per trace step: "302 duct wall dry → shared shaft 31% → 6%". */
export function traceLines(state: EngineState): string[] {
  const label = (id: string) => {
    const h = state.hypotheses.find((x) => x.id === id);
    return h ? words(h.family) + (h.flatId ? ` ${h.flatId}` : '') + (h.level === 'component' ? ` (${h.label})` : '') : id;
  };
  return state.trace.map((t) => {
    const o = state.observations.find((x) => x.id === t.observationId);
    const what = o ? [o.flatId, o.kind === 'meter_reading' && o.meter ? (o.meter.end === o.meter.start ? 'meter still' : 'meter moved') : `${words(o.zone)} ${words(o.surface)}`].filter(Boolean).join(' ') : `Step ${t.step}`;
    const top = [...t.changes].sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before)).slice(0, 2);
    return top.length ? `${what} → ${top.map((c) => `${label(c.hypothesisId)} ${pct(c.before)} → ${pct(c.after)}`).join('; ')}` : `${what} → no change`;
  });
}

export function HowItDecided({ state }: { state: EngineState }) {
  const lines = traceLines(state);
  if (!lines.length) return <p className={s.small}>No evidence applied yet.</p>;
  return <ol className={s.trace}>{lines.map((l, i) => <li key={i}>{l}</li>)}</ol>;
}
