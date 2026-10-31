'use client';
import { useState } from 'react';
import type { Building, EngineState, Hypothesis, Observation, RankedCheck } from '@stacksense/contracts';
import { SourceFamily } from '@stacksense/contracts';
import { engine } from '../../lib/adapters';
import { HowItDecided } from './HowItDecided';
import s from './judge.module.css';

type Sim = { building: Building; truth: Hypothesis; victimFlatId?: string; initialObservation?: Observation; answer(check: RankedCheck): Observation };
const simulate = engine.simulateBuilding as (seed: number, opts?: { hiddenFamily?: Hypothesis['family'] }) => Sim;
export const SIZES = { small: 4, medium: 6, large: 10 } as const;
type Size = keyof typeof SIZES;
const FAMILIES = SourceFamily.options;
const MAX_CHECKS = 8;
const words = (x: string) => x.replaceAll('_', ' ');

/** First seed ≥ start whose simulated building has the wanted floor count (simulator untouched). */
export function seedFor(floors: number, start: number, hiddenFamily?: Hypothesis['family']): number {
  for (let seed = start; seed < start + 500; seed++) if (simulate(seed, { hiddenFamily }).building.floors === floors) return seed;
  return start;
}

/** Judge-facing answer buttons per check type: [label, observation patch]. */
function choices(check: RankedCheck): [string, Partial<Observation>][] {
  const wet = { surface: 'damp_stain' as const }, dry = { surface: 'dry' as const };
  switch (check.type) {
    case 'duct_photo': return [['Dry', { ...dry, zone: 'duct_wall' }], ['Wet', { ...wet, zone: 'duct_wall' }]];
    case 'meter_check': return [['Still', { kind: 'meter_reading', zone: 'meter', meter: { start: 100, end: 100, minutes: 10 } }], ['Moved', { kind: 'meter_reading', zone: 'meter', meter: { start: 100, end: 101, minutes: 10 } }]];
    case 'trap_grout_photo': return [['OK', { ...dry, zone: 'trap_grout' }], ['Cracked', { surface: 'crack', zone: 'trap_grout' }]];
    case 'dye_test': case 'flood_test': return [['Appeared', { rawText: check.type === 'dye_test' ? 'dye appeared' : 'flood test positive' }], ['None', { rawText: 'test negative' }]];
    case 'ceiling_photo': return [['Dry', { ...dry, zone: 'ceiling' }], ['Wet', { ...wet, zone: 'ceiling' }]];
    case 'rain_recheck': return [['Dry after rain', { ...dry, zone: 'window_perimeter' }], ['Wet after rain', { ...wet, zone: 'window_perimeter' }]];
    default: return [];
  }
}

type Game = { sim: Sim; state: EngineState; checks: number; truth: string; blame: string };

export function BreakIt({ onState }: { onState: (s: EngineState) => void }) {
  const [size, setSize] = useState<Size>('medium');
  const [hidden, setHidden] = useState<string>('surprise');
  const [game, setGame] = useState<Game | null>(null);
  const [round, setRound] = useState(1);

  const publish = (g: Game) => { setGame(g); onState(g.state); };
  const start = () => {
    const hazard = hidden === 'electrical_hazard';
    const family = hidden === 'surprise' || hazard ? undefined : (hidden as Hypothesis['family']);
    const seed = seedFor(SIZES[size], round * 1000, family);
    setRound(round + 1);
    const sim = simulate(seed, { hiddenFamily: family });
    const victim = sim.victimFlatId ?? sim.building.flats[0]!.id;
    const first: Observation = sim.initialObservation ?? { id: `bi-${seed}-0`, eventKey: `bi-${seed}-0`, flatId: victim, at: '2026-10-30T16:00:00.000Z', kind: 'complaint', zone: 'ceiling', surface: 'damp_stain', room: 'bathroom', hazards: [], hazardQuestionsAnswered: true, checkId: null, meter: null, moisture: null, finding: null, photoIds: [], sourceMessageIds: [], provenance: 'simulated', rawText: 'simulated building stain' };
    const report = hazard ? { ...first, hazards: ['water_near_electrics' as const], rawText: 'water dripping near the switch board' } : first;
    const v = sim.building.flats.find((f) => f.id === victim);
    const above = v && sim.building.flats.find((f) => f.floor === v.floor + 1 && f.position === v.position);
    const state = engine.applyObservations(engine.createCase(sim.building, { now: report.at }), [report]);
    publish({ sim, state, checks: 0, truth: words(sim.truth.family) + (sim.truth.flatId ? ` at ${sim.truth.flatId}` : ''),
      blame: above ? `upper wet area at ${above.id}` : 'the terrace (no flat above)' });
  };

  const check = game?.state.nextChecks.filter((c) => c.excluded === null).sort((a, b) => b.score - a.score)[0];
  const emergency = game?.state.safety.status === 'emergency';
  const over = !!game && (emergency || game.state.stop.stopped || !check || game.checks >= MAX_CHECKS);

  const answer = (obs: Observation | null) => {
    if (!game || !check) return;
    const o = obs ?? game.sim.answer(check);
    publish({ ...game, state: engine.applyObservations(game.state, [o]), checks: game.checks + 1 });
  };
  const judgeAnswer = (patch: Partial<Observation>) => {
    if (!game || !check) return;
    const id = `bi-judge-${game.checks + 1}`;
    answer({ id, eventKey: id, flatId: check.targetFlatId, at: new Date(Date.parse(game.state.now) + (game.checks + 1) * 60000).toISOString(),
      kind: 'check_result', zone: 'other', surface: 'unclear', room: null, hazards: [], hazardQuestionsAnswered: true, checkId: check.id,
      meter: null, moisture: null, finding: null, photoIds: [], sourceMessageIds: [], provenance: 'simulated', rawText: 'judge answer', ...patch });
  };
  const leader = game && [...game.state.hypotheses].filter((h) => !h.parentId).sort((a, b) => (game.state.posterior[b.id] ?? 0) - (game.state.posterior[a.id] ?? 0))[0];
  const n = game?.checks ?? 0, plural = n === 1 ? '' : 's';

  return <div className={s.stack}>
    <div className={s.row}>
      <label className={s.field}>Building size
        <select value={size} onChange={(e) => setSize(e.target.value as Size)}>
          {Object.entries(SIZES).map(([k, f]) => <option key={k} value={k}>{k} · {f} floors</option>)}
        </select></label>
      <label className={s.field}>Hidden true source
        <select value={hidden} onChange={(e) => setHidden(e.target.value)}>
          <option value="surprise">Surprise me</option>
          {FAMILIES.map((f) => <option key={f} value={f}>{words(f)}</option>)}
          <option value="electrical_hazard">Electrical hazard</option>
        </select></label>
    </div>
    <div className={s.row}><button className="primary" onClick={start}>{game ? 'New building' : 'Start'}</button></div>
    {game && emergency && <div role="alert" className={s.alert}>
      <strong>Emergency — diagnosis stopped for safety.</strong>
      <ul>{game.state.safety.actions.map((a) => <li key={a}>{a}</li>)}</ul>
    </div>}
    {game && !over && check && <div className={s.stack}>
      <p className={s.small}>Check {n + 1}: <strong>{words(check.type)}{check.targetFlatId ? ` at ${check.targetFlatId}` : ''}</strong> — {check.why}</p>
      <div className={s.row} role="group" aria-label="Answer the check">
        {choices(check).map(([label, patch]) => <button key={label} onClick={() => judgeAnswer(patch)}>{label}</button>)}
        <button onClick={() => answer(null)}>Let the simulator answer</button>
      </div>
    </div>}
    {game && over && !emergency && <p className={s.label} aria-live="polite">
      {game.state.stop.reason?.startsWith("Remote evidence can't decide")
        ? <>No confident probable source after {n} check{plural} — {game.state.stop.reason}. </>
        : <>Found probable source <strong>{leader ? words(leader.family) + (leader.flatId ? ` at ${leader.flatId}` : '') : 'unresolved'}</strong> in {n} check{plural}. </>}
      ‘Blame the flat above’ would have said {game.blame}. Hidden truth: {game.truth}. <span className="muted">(simulated building)</span>
    </p>}
    {game && <HowItDecided state={game.state} />}
  </div>;
}
