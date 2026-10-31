'use client';
import { useEffect, useState } from 'react';
import { EvalResults } from '@stacksense/contracts';
import type { z } from 'zod';
import { visualStatus } from '../../lib/visual';
import s from './judge.module.css';

type Results = z.infer<typeof EvalResults>;
type Row = Results['rows'][number];
type Pending = { method: string; reason: string };
type AiMessages = { measured: number; reviewed: number; stopped: string; f1ByField: Record<string, number | null>; f1ByLanguage: Record<string, number | null>; photo: string; cost: string };
type Latest = Results & { pending?: Pending[]; rowsBySet?: { hard: Row[]; sim: Row[] }; aiMessages?: AiMessages | null };

export const LABEL = 'Team-built test, not field accuracy.';
const pct = (x: number | null) => (x === null || Number.isNaN(x) ? 'n/a' : `${Math.round(x * 100)}%`);
const num = (x: number | null) => (x === null || Number.isNaN(x) ? 'n/a' : String(Math.round(x * 100) / 100));

/** Metric columns: value getter, formatter, and whether higher is better. */
export const METRICS: { key: string; label: string; get: (r: Row) => number | null; fmt: (x: number | null) => string; higher: boolean }[] = [
  { key: 'rightTrade', label: 'Right trade', get: (r) => r.rightTrade, fmt: pct, higher: true },
  ...[0, 1, 2].map((k) => ({ key: `top1-${k}`, label: `Top-1 after ${k + 1} check${k ? 's' : ''}`, get: (r: Row) => r.top1[k] ?? null, fmt: pct, higher: true })),
  { key: 'overclaim', label: 'Over-claim', get: (r) => r.overclaim, fmt: pct, higher: false },
  { key: 'harmfulFlips', label: 'Harmful flips', get: (r) => r.harmfulFlips, fmt: num, higher: false },
  { key: 'checksToDecision', label: 'Checks to decision', get: (r) => r.checksToDecision, fmt: num, higher: false },
  { key: 'hazardPass', label: 'Hazard pass', get: (r) => r.hazardPass, fmt: pct, higher: true },
  { key: 'msPerCase', label: 'ms / case', get: (r) => r.msPerCase, fmt: num, higher: false },
];

/** StackSense vs a baseline on one metric: "tie", "loses" (StackSense worse) or null (StackSense better / n/a). */
export function verdict(ours: number | null, theirs: number | null, higher: boolean): 'tie' | 'loses' | null {
  if (ours === null || theirs === null || Number.isNaN(ours) || Number.isNaN(theirs)) return null;
  if (ours === theirs) return 'tie';
  return (higher ? ours < theirs : ours > theirs) ? 'loses' : null;
}

function Chip({ kind }: { kind: 'tie' | 'loses' }) {
  const v = visualStatus(kind, kind === 'tie' ? 'amber' : 'red');
  return <span className={`chip ${s.chip}`} style={{ borderColor: v.colour, color: v.colour }}
    title={kind === 'tie' ? 'StackSense ties this method here' : 'StackSense loses to this method here'}>{v.label}</span>;
}

export function EvalTable({ rows, pending = [] }: { rows: Row[]; pending?: Pending[] }) {
  const ours = rows.find((r) => r.method === 'StackSense');
  const ordered = ours ? [ours, ...rows.filter((r) => r !== ours)] : rows;
  return <div className={s.scroll} tabIndex={0} aria-label="Evaluation table, scrolls sideways">
    <table className={s.table}>
      <thead><tr><th scope="col">Method</th>{METRICS.map((m) => <th scope="col" key={m.key}>{m.label}</th>)}</tr></thead>
      <tbody>
        {ordered.map((r) => <tr key={r.method}>
          <th scope="row">{r.method}</th>
          {METRICS.map((m) => {
            const v = r === ours || !ours ? null : verdict(m.get(ours), m.get(r), m.higher);
            return <td key={m.key}>{m.fmt(m.get(r))}{v && <> <Chip kind={v} /></>}</td>;
          })}
        </tr>)}
        {pending.map((p) => <tr key={p.method}><th scope="row">{p.method}</th><td colSpan={METRICS.length}>{p.reason}</td></tr>)}
      </tbody>
    </table>
  </div>;
}

export function EvalCard({ src = '/eval/latest.json' }: { src?: string }) {
  const [data, setData] = useState<Latest | null | 'missing'>(null);
  const [set, setSet] = useState<'all' | 'hard' | 'sim'>('all');
  useEffect(() => {
    let live = true;
    fetch(src).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => { const parsed = EvalResults.safeParse(json); if (live) setData(parsed.success ? { ...parsed.data, pending: json.pending, rowsBySet: json.rowsBySet, aiMessages: json.aiMessages ?? null } : 'missing'); })
      .catch(() => { if (live) setData('missing'); });
    return () => { live = false; };
  }, [src]);

  if (data === null) return <p className={s.small}>Loading evaluation…</p>;
  if (data === 'missing') return <p className={s.small}>Numbers pending — {LABEL}</p>;
  const rows = set === 'all' || !data.rowsBySet ? data.rows : data.rowsBySet[set];
  const { sets, ai, robustness } = data;
  return <div className={s.stack}>
    <p className={s.label}><strong>{LABEL}</strong></p>
    <p className={s.small}>{sets.hardCases} hard cases · {sets.simBuildings} simulated buildings · {sets.photos} photos · {sets.messages} messages · generated {data.generatedAt.slice(0, 16).replace('T', ' ')} UTC</p>
    {data.rowsBySet && <label className={s.field}>Show
      <select value={set} onChange={(e) => setSet(e.target.value as typeof set)}>
        <option value="all">All cases</option><option value="hard">Hard cases only</option><option value="sim">Simulated only</option>
      </select></label>}
    <EvalTable rows={rows} pending={data.pending} />
    <p className={s.small}>Chips mark where StackSense <strong>ties</strong> or <strong>loses</strong> to a baseline — shown, never hidden.</p>
    <h4 className={s.h}>Robustness — priors shifted</h4>
    {robustness.length ? <div className={s.scroll} tabIndex={0} aria-label="Robustness table"><table className={s.table}>
      <thead><tr><th scope="col">Prior shift</th>{robustness.map((r) => <th scope="col" key={r.priorShiftPct}>{r.priorShiftPct > 0 ? '+' : ''}{r.priorShiftPct}%</th>)}</tr></thead>
      <tbody><tr><th scope="row">Top-1</th>{robustness.map((r) => <td key={r.priorShiftPct}>{pct(r.top1)}</td>)}</tr></tbody>
    </table></div> : <p className={s.small}>Robustness pending.</p>}
    <h4 className={s.h}>AI reading</h4>
    {ai ? <ul className={s.small}>
      <li>Photo accuracy {pct(ai.photoAccuracy)} · clean-wall false positives {pct(ai.cleanWallFalsePositive)} · cost per case ${ai.costPerCaseUsd.toFixed(4)}</li>
      <li>F1 by field: {Object.entries(ai.f1ByField).map(([k, v]) => `${k} ${pct(v)}`).join(' · ') || 'n/a'}</li>
      <li>F1 by language: {Object.entries(ai.f1ByLanguage).map(([k, v]) => `${k} ${pct(v)}`).join(' · ') || 'n/a'}</li>
    </ul> : data.aiMessages ? <ul className={s.small}>
      <li><strong>Partial:</strong> message extraction measured on {data.aiMessages.measured} of {data.aiMessages.reviewed} human-reviewed messages (free-tier quota)</li>
      <li>F1 by field: {Object.entries(data.aiMessages.f1ByField).map(([k, v]) => `${k} ${pct(v)}`).join(' · ')}</li>
      <li>F1 by language: {Object.entries(data.aiMessages.f1ByLanguage).map(([k, v]) => `${k} ${pct(v)}`).join(' · ')}</li>
      <li>Photo accuracy and clean-wall false positives: {data.aiMessages.photo} · cost {data.aiMessages.cost}</li>
    </ul> : <p className={s.small}>AI evaluation pending — human labels in progress.</p>}
  </div>;
}
