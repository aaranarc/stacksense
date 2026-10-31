'use client';
import { useEffect, useRef, useState } from 'react';
import type { Building, EngineState, Observation, PhotoLabel, RainSeries, SecondOpinion } from '@stacksense/contracts';
import { engine } from '../../lib/adapters';
import s from './judge.module.css';

type Scenario = { title: string; building: Building; steps: Observation[][]; rain?: RainSeries; forecast?: RainSeries; photoLabels?: PhotoLabel[]; review?: SecondOpinion | null };
const scenarios = engine.scenarios as Record<string, Scenario>;
export const PLAY_MS = 1200;

/** Plain-language outcome of the current state (text, never colour alone). */
export function outcomeOf(state: EngineState): string {
  if (state.safety.status === 'emergency') return 'Emergency — diagnosis stopped for safety';
  if (state.jobSheet) return state.jobSheet.send.length ? `Job Sheet: send ${state.jobSheet.send.map((t) => t.trade.replaceAll('_', ' ')).join(', ')}` : state.jobSheet.probableSource;
  if (state.stop.stopped) return state.stop.reason ?? 'Stopped';
  const next = state.nextChecks.find((c) => c.excluded === null);
  return next ? `Next check: ${next.type.replaceAll('_', ' ')}${next.targetFlatId ? ` at ${next.targetFlatId}` : ''}` : 'Investigating';
}

export function ScenarioPicker({ onState }: { onState: (s: EngineState) => void }) {
  const ids = Object.keys(scenarios);
  const [id, setId] = useState(ids[0] ?? 'happy');
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [status, setStatus] = useState('Pick a scenario and press Play or Next step.');
  const current = useRef<EngineState | null>(null);
  const sc = scenarios[id];
  const total = sc?.steps.length ?? 0;

  const publish = (next: EngineState) => { current.current = next; onState(next); setStatus(outcomeOf(next)); };
  const fresh = (scn: Scenario) => engine.createCase(scn.building, { now: scn.steps[0]?.[0]?.at ?? '2026-10-30T16:30:00.000Z' });
  const reset = (scenarioId = id) => {
    const scn = scenarios[scenarioId];
    setPlaying(false); setStep(0);
    if (scn) publish(fresh(scn));
  };
  const next = () => {
    if (!sc || step >= total) { setPlaying(false); return; }
    const ctx = { rain: sc.rain, forecast: sc.forecast, photoLabels: sc.photoLabels };
    let state = engine.applyObservations(current.current ?? fresh(sc), sc.steps[step]!, ctx);
    // Last step: the scenario's cached Second Opinion if it has one, else null (labelled fallback).
    if (step + 1 === total) state = engine.applySecondOpinion(state, sc.review ?? null);
    publish(state);
    setStep(step + 1);
    if (step + 1 >= total || state.safety.status === 'emergency') setPlaying(false);
  };

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(next, PLAY_MS);
    return () => clearTimeout(t);
  });

  return <div className={s.stack}>
    <label className={s.field}>Scenario
      <select value={id} onChange={(e) => { setId(e.target.value); reset(e.target.value); }}>
        {ids.map((k) => <option key={k} value={k}>{scenarios[k]!.title}</option>)}
      </select>
    </label>
    <div className={s.row} role="group" aria-label="Scenario controls">
      <button className="primary" onClick={next} disabled={step >= total}>Next step ▸</button>
      <button onClick={() => { if (step >= total) reset(); setPlaying(!playing); }} aria-pressed={playing}>{playing ? 'Pause' : 'Play'}</button>
      <button onClick={() => reset()}>Reset</button>
    </div>
    <p className={s.small} aria-live="polite">Step {step} / {total} · {status}</p>
  </div>;
}
