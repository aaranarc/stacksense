'use client';
import { useId, useMemo, useState } from 'react';
import type { EngineState, Flat } from '@stacksense/contracts';
import { CloudRain, MapPin } from 'lucide-react';
import { statusOf, colours, tint } from '../../lib/visual';
import { regionalText } from '../../lib/labels';
import { permittedLabel } from '../odds/SourceBars';

/* Geometry of the illustration (SVG user units). The building is generated from the Building fixture,
   so the same code draws Block A, the UK block, every scenario and Break it buildings. */
const W = 1000, H = 860, GROUND = 792;
const SIDE = { dx: -78, dy: -40 };
const ORIENTATION: Record<string, string> = { N: 'North', S: 'South', E: 'East', W: 'West', NE: 'North-east', NW: 'North-west', SE: 'South-east', SW: 'South-west' };
const words = (s: string) => s.replaceAll('_', ' ');
const day = (iso: string) => new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const shortDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const checkNames: Record<string, string> = { duct_photo: 'duct-wall photo', trap_grout_photo: 'trap-grout photo', meter_check: 'meter check', ceiling_photo: 'ceiling photo' };

/** UK flats are numbered 1–6, so the label carries the word "Flat" there. */
const flatName = (label: string, region: 'IN' | 'UK') => region === 'UK' ? `Flat ${label}` : label;
export type FlatCallout = { flat: Flat; label: string; detail: string | null; colour: string; dashed: boolean };

/** Every word on the hero comes from EngineState: the engine status (lib/visual), the flat's own evidence and predictions. */
export function flatCallouts(state: EngineState): FlatCallout[] {
  const region = state.building.region;
  const ranked = [...state.hypotheses].sort((a, b) => (state.posterior[b.id] ?? 0) - (state.posterior[a.id] ?? 0));
  return [...state.building.flats].sort((a, b) => b.floor - a.floor || a.position.localeCompare(b.position)).flatMap(flat => {
    const s = statusOf(flat, state);
    if (s.colour === colours.grey) return [];
    const own = state.observations.filter(o => o.flatId === flat.id).sort((a, b) => b.at.localeCompare(a.at));
    const complaint = own.find(o => o.kind === 'complaint');
    const recheck = state.prediction.forecastRechecks.find(r => r.flatId === flat.id);
    const lead = state.observations.length && ranked[0]?.flatId === flat.id ? ranked[0] : undefined;
    const detail = lead ? regionalText(permittedLabel(lead, state), region)
      : recheck ? `re-check after rain · ${day(recheck.afterDate)}`
      : complaint ? `${words(complaint.zone)} · ${words(complaint.surface)}`
      : null;
    return [{ flat, label: flatName(regionalText(s.label, region), region), detail, colour: s.colour, dashed: s.dashed }];
  });
}

function tooltipFor(flat: Flat, state: EngineState) {
  const region = state.building.region;
  const mine = state.hypotheses.filter(h => h.flatId === flat.id).sort((a, b) => (state.posterior[b.id] ?? 0) - (state.posterior[a.id] ?? 0))[0];
  const odds = mine && (state.posterior[mine.id] ?? 0) > 0 ? `${Math.round((state.posterior[mine.id] ?? 0) * 100)}% · ${regionalText(permittedLabel(mine, state), region)}` : 'No source estimate for this flat';
  const last = state.observations.filter(o => o.flatId === flat.id && (o.checkId || o.kind === 'check_result' || o.kind === 'meter_reading' || o.kind === 'moisture_reading')).sort((a, b) => b.at.localeCompare(a.at))[0];
  const next = state.nextChecks.find(c => !c.excluded && c.targetFlatId === flat.id);
  return {
    odds,
    last: last ? `${words(last.zone)} · ${words(last.surface)} · ${shortDate(last.at)}` : 'None recorded',
    next: next ? `${checkNames[next.type] ?? words(next.type)} · ${next.effortMin < 1 ? `${Math.round(next.effortMin * 60)} s` : `${next.effortMin} min`}` : 'None from the engine',
  };
}

export function BuildingHero({ state, selected, onSelect }: { state: EngineState; selected: string | null; onSelect: (id: string) => void }) {
  const uid = useId().replace(/:/g, '');
  const [hover, setHover] = useState<string | null>(null);
  const b = state.building;
  const positions = useMemo(() => [...new Set(b.flats.map(f => f.position))].sort(), [b]);
  const cw = Math.min(196, 440 / positions.length);
  const rowH = Math.min(92, 600 / b.floors);
  const fw = positions.length * cw;
  const x0 = 350 + (392 - fw) / 2;
  const top = GROUND - b.floors * rowH;
  const cellX = (p: string) => x0 + positions.indexOf(p) * cw;
  const cellY = (floor: number) => GROUND - floor * rowH;
  const dot = (f: Flat) => ({ x: cellX(f.position) + cw * 0.5, y: cellY(f.floor) + rowH * 0.52 });
  const callouts = flatCallouts(state);
  const leftSide = (f: Flat) => positions.indexOf(f.position) < positions.length / 2 && positions.length > 1;

  // Wet stack and service duct sit at the inner edge of each stacked column.
  const stackX = (flatIds: string[]) => { const f = b.flats.find(x => flatIds.includes(x.id)); return f ? cellX(f.position) + cw - 34 : null; };
  const ducts = b.stacks.filter(s => s.kind === 'duct' || s.kind === 'wet_stack');
  const walls = b.flats.flatMap(f => f.externalWalls);
  const exposed = state.prediction.forecastRechecks[0]?.orientation ?? (walls.length ? [...walls].sort((a, c) => walls.filter(w => w === c).length - walls.filter(w => w === a).length)[0]! : null);
  const recheck = state.prediction.forecastRechecks[0];
  const rainy = !!recheck;

  // Hypothesis path: leading source → affected ceiling. Solid only when a professional finding documents it.
  const ranked = [...state.hypotheses].sort((a, c) => (state.posterior[c.id] ?? 0) - (state.posterior[a.id] ?? 0));
  const source = state.observations.length ? b.flats.find(f => f.id === ranked[0]?.flatId) : undefined;
  const victim = b.flats.find(f => state.observations.some(o => o.flatId === f.id && o.kind === 'complaint' && o.zone === 'ceiling'));
  const documented = !!source && state.observations.some(o => o.kind === 'professional_finding' && o.flatId === source.id);
  const path = source && victim && source.id !== victim.id ? (() => {
    const a = dot(source), c = dot(victim), bend = Math.min(a.x, c.x) - 70;
    return { d: `M${a.x - 8} ${a.y} C${bend} ${a.y} ${bend} ${c.y} ${c.x - 10} ${c.y - 2}`, mid: { x: bend + 14, y: (a.y + c.y) / 2 } };
  })() : null;
  const pathColour = source ? statusOf(source, state).colour : colours.red;

  const passedDuct = b.flats.filter(f => /duct dry/.test(statusOf(f, state).label));
  const hovered = hover ? b.flats.find(f => f.id === hover) : undefined;
  const tip = hovered ? tooltipFor(hovered, state) : null;
  const pct = (v: number, of: number) => `${(v / of) * 100}%`;

  return <div className="hero-stage" data-rain={rainy || undefined}>
    <div className="hero-canvas">
    <svg className="hero-svg" viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`${b.name} · isometric building view, ${b.floors} floors`}>
      <defs>
        <linearGradient id={`${uid}sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C9D6E8" /><stop offset=".72" stopColor="#E8E1D6" /><stop offset="1" stopColor="#F3E7D3" /></linearGradient>
        <radialGradient id={`${uid}sun`} cx=".8" cy=".82" r=".5"><stop offset="0" stopColor="#FCE7C3" stopOpacity=".9" /><stop offset="1" stopColor="#FCE7C3" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${uid}lit`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFE7A8" /><stop offset=".6" stopColor="#F9CF7A" /><stop offset="1" stopColor="#E9AE58" /></linearGradient>
        <linearGradient id={`${uid}glass`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8EA3BE" /><stop offset="1" stopColor="#56697F" /></linearGradient>
        <linearGradient id={`${uid}front`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#E9ECF1" /><stop offset="1" stopColor="#DADFE7" /></linearGradient>
        <linearGradient id={`${uid}side`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#AEB7C5" /><stop offset="1" stopColor="#C3CAD5" /></linearGradient>
        <linearGradient id={`${uid}ground`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D8D2C6" /><stop offset="1" stopColor="#C9C2B4" /></linearGradient>
        <linearGradient id={`${uid}wet`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3B82F6" stopOpacity=".22" /><stop offset="1" stopColor="#2563EB" stopOpacity=".34" /></linearGradient>
        <radialGradient id={`${uid}shadow`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#3A3326" stopOpacity=".28" /><stop offset="1" stopColor="#3A3326" stopOpacity="0" /></radialGradient>
        <pattern id={`${uid}rain`} width="14" height="28" patternUnits="userSpaceOnUse" patternTransform="rotate(18)"><line x1="7" y1="0" x2="7" y2="12" stroke="#5B6F8C" strokeWidth="1" strokeOpacity=".35" strokeLinecap="round" /></pattern>
        <marker id={`${uid}arrow`} markerWidth="10" markerHeight="10" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill={pathColour} /></marker>
      </defs>

      {/* dusk scene */}
      <rect width={W} height={H} fill={`url(#${uid}sky)`} />
      <rect width={W} height={H} fill={`url(#${uid}sun)`} />
      <g className="hero-skyline" fill="#AEB9C9" fillOpacity=".55">
        {[[10, 560, 74], [88, 500, 56], [148, 600, 86], [238, 540, 48], [770, 520, 62], [836, 470, 56], [896, 560, 92]].map(([x, y, w], i) =>
          <g key={i}><rect x={x} y={y} width={w} height={GROUND - y!} rx="2" />{Array.from({ length: 3 }, (_, k) => <rect key={k} x={x! + 10 + k * 14} y={y! + 18 + (i % 3) * 22} width="6" height="8" fill="#F6DFAE" fillOpacity={(i + k) % 3 ? 0 : .55} />)}</g>)}
      </g>
      <rect y={GROUND} width={W} height={H - GROUND} fill={`url(#${uid}ground)`} />
      <ellipse cx={x0 + fw / 2 - 20} cy={GROUND + 8} rx={fw * 0.78} ry="20" fill={`url(#${uid}shadow)`} />
      {[[96, 1.15], [212, .9], [812, 1.25], [930, 1]].map(([x, s], i) => <g key={i} className="hero-tree" transform={`translate(${x} ${GROUND}) scale(${s})`}>
        <rect x="-3" y="-34" width="6" height="34" fill="#7B6A55" /><circle cx="0" cy="-52" r="24" fill="#7E9C80" /><circle cx="-14" cy="-40" r="16" fill="#8DAA8E" /><circle cx="14" cy="-42" r="17" fill="#6F8F72" />
      </g>)}

      {/* building massing: left side face, roof, front face */}
      <polygon points={`${x0},${GROUND} ${x0},${top} ${x0 + SIDE.dx},${top + SIDE.dy} ${x0 + SIDE.dx},${GROUND + SIDE.dy}`} fill={`url(#${uid}side)`} />
      {Array.from({ length: b.floors }, (_, i) => { const y = GROUND - (i + 1) * rowH; return <g key={i}>
        <polygon points={`${x0},${y + rowH * .22} ${x0 + SIDE.dx * .78},${y + rowH * .22 + SIDE.dy * .78} ${x0 + SIDE.dx * .78},${y + rowH * .78 + SIDE.dy * .78} ${x0},${y + rowH * .78}`} fill={`url(#${uid}lit)`} opacity=".55" />
        <line x1={x0} y1={y} x2={x0 + SIDE.dx} y2={y + SIDE.dy} stroke="#9AA4B2" strokeWidth="2" /></g>; })}
      {rainy && exposed && <polygon className="hero-rain" points={`${x0 + 6},${GROUND} ${x0 + 6},${top - 40} ${x0 + SIDE.dx - 120},${top + SIDE.dy - 40} ${x0 + SIDE.dx - 120},${GROUND + SIDE.dy}`} fill={`url(#${uid}rain)`} />}
      <polygon points={`${x0},${top} ${x0 + fw},${top} ${x0 + fw + SIDE.dx},${top + SIDE.dy} ${x0 + SIDE.dx},${top + SIDE.dy}`} fill="#C9CFD8" />
      <rect x={x0} y={top} width={fw} height={b.floors * rowH} fill={`url(#${uid}front)`} />
      {positions.slice(1).map(p => <rect key={p} x={cellX(p) - 3} y={top} width="6" height={b.floors * rowH} fill="#CDD3DC" />)}
      <rect x={x0 + fw - 6} y={top} width="6" height={b.floors * rowH} fill="#C5CCD6" />
      <rect x={x0 - 6} y={GROUND - 6} width={fw + 12} height="8" rx="2" fill="#B9C0CA" />
      {b.hasTerrace && <g>
        <rect x={x0 - 2} y={top - 10} width={fw + 4} height="10" fill="#CBD1DA" stroke="#B4BCC8" />
        <g transform={`translate(${x0 + fw * .2} ${top + SIDE.dy * .5 - 4})`}><rect x="0" y="-26" width="30" height="26" rx="3" fill="#8E99A9" /><ellipse cx="15" cy="-26" rx="15" ry="4" fill="#A3ADBB" /></g>
        <g transform={`translate(${x0 + fw * .2 + 40} ${top + SIDE.dy * .5 - 4})`}><rect x="0" y="-20" width="24" height="20" rx="3" fill="#8E99A9" /><ellipse cx="12" cy="-20" rx="12" ry="3.5" fill="#A3ADBB" /></g>
      </g>}

      {/* flats */}
      {b.flats.map(f => {
        const s = statusOf(f, state), x = cellX(f.position), y = cellY(f.floor), isSel = selected === f.id;
        const ww = cw * .56, wh = rowH * .58;
        return <g key={f.id} className="hero-flat" role="button" tabIndex={0} aria-label={flatName(regionalText(s.label, b.region), b.region)} aria-pressed={isSel}
          onClick={() => onSelect(f.id)} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(h => h === f.id ? null : h)} onFocus={() => setHover(f.id)} onBlur={() => setHover(h => h === f.id ? null : h)}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(f.id); } }}>
          <rect x={x} y={y} width={cw} height={rowH} fill="transparent" />
          <rect x={x} y={y} width={cw} height={Math.max(3, rowH * .08)} fill="#F4F6F9" />
          <line x1={x} y1={y + Math.max(3, rowH * .08)} x2={x + cw} y2={y + Math.max(3, rowH * .08)} stroke="#B9C1CD" />
          <rect x={x + 10} y={y + rowH * .18} width={ww} height={wh} rx="3" fill="#5E6B7E" />
          <rect x={x + 13} y={y + rowH * .18 + 3} width={ww - 6} height={wh - 6} rx="2" fill={(f.floor + positions.indexOf(f.position)) % 3 === 1 ? `url(#${uid}glass)` : `url(#${uid}lit)`} />
          {[1, 2].map(k => <line key={k} x1={x + 13 + (ww - 6) * k / 3} y1={y + rowH * .18 + 3} x2={x + 13 + (ww - 6) * k / 3} y2={y + rowH * .18 + wh - 3} stroke="#6B5A3E" strokeOpacity=".45" strokeWidth="1.2" />)}
          <rect x={x + 13} y={y + rowH * .18 + 3} width={(ww - 6) * .45} height={(wh - 6) * .35} fill="#FFFFFF" fillOpacity=".18" />
          <rect x={x + 6} y={y + rowH * .6} width={ww + 10} height={rowH * .28} rx="1.5" fill="#D6E6F5" fillOpacity=".38" stroke="#FFFFFF" strokeOpacity=".85" />
          <line x1={x + 6} y1={y + rowH * .6} x2={x + 16 + ww} y2={y + rowH * .6} stroke="#5F6C7E" strokeWidth="2" strokeLinecap="round" />
          {[.25, .5, .75].map(k => <line key={k} x1={x + 6 + (ww + 10) * k} y1={y + rowH * .6} x2={x + 6 + (ww + 10) * k} y2={y + rowH * .88} stroke="#FFFFFF" strokeOpacity=".55" />)}
          <rect x={x + 6} y={y + rowH * .88} width={ww + 10} height={Math.max(2, rowH * .04)} fill="#C7CED8" />
          {(s.colour !== colours.grey || isSel) && <rect className="hero-outline" x={x + 3} y={y + 3} width={cw - 6} height={rowH - 6} rx="6" fill={tint(s.colour, isSel ? .16 : .1)} stroke={isSel ? '#2563EB' : s.colour} strokeWidth={isSel ? 3 : 2} strokeDasharray={s.dashed ? '7 5' : undefined} />}
        </g>;
      })}

      {/* cut-away: wet stack (bathrooms) and service duct */}
      {ducts.map(st => { const sx = stackX(st.flatIds); if (sx === null) return null; return <g key={st.id} className="hero-cutaway" aria-hidden="true">
        <rect x={sx} y={top + 2} width="22" height={b.floors * rowH - 2} fill="#1E293B" fillOpacity=".08" />
        <rect x={sx} y={top + 2} width="22" height={b.floors * rowH - 2} fill={`url(#${uid}wet)`} stroke="#2563EB" strokeOpacity=".35" />
        {b.flats.filter(f => st.flatIds.includes(f.id) && f.wetAreas.includes('bathroom')).map(f => { const y = cellY(f.floor) + rowH * .5; return <g key={f.id} fill="#FFFFFF" fillOpacity=".9"><rect x={sx + 6} y={y - 2} width="10" height="7" rx="2" /><ellipse cx={sx + 11} cy={y - 3} rx="6" ry="2.4" /></g>; })}
        <rect x={sx + 24} y={top + 2} width="7" height={b.floors * rowH - 2} fill="#8B96A6" fillOpacity=".75" />
      </g>; })}

      {passedDuct.map(f => { const d = dot(f), sx = (stackX(b.stacks.find(st => st.flatIds.includes(f.id))?.flatIds ?? []) ?? d.x + 40) + 27; return <line key={f.id} className="hero-flow" x1={d.x} y1={d.y} x2={sx} y2={d.y} stroke={colours.green} strokeWidth="2.5" strokeDasharray="5 5" />; })}

      {path && <path className={documented ? 'hero-path' : 'hero-path hero-flow'} d={path.d} fill="none" stroke={pathColour} strokeWidth="2.6" strokeDasharray={documented ? undefined : '8 6'} markerEnd={`url(#${uid}arrow)`} />}

      {callouts.map(c => { const d = dot(c.flat); return <g key={c.flat.id} aria-hidden="true">
        <line x1={d.x} y1={d.y} x2={leftSide(c.flat) ? 236 : 724} y2={d.y} stroke={c.colour} strokeOpacity=".8" strokeWidth="1.4" strokeDasharray={c.dashed ? '3 3' : undefined} />
        <circle className="hero-pulse" cx={d.x} cy={d.y} r="9" fill={c.colour} fillOpacity=".25" />
        <circle cx={d.x} cy={d.y} r="5" fill={c.colour} stroke="#FFFFFF" strokeWidth="2" />
      </g>; })}

      {/* floor labels: flat ids on the left edge of the side face */}
      {Array.from({ length: b.floors }, (_, i) => { const floor = i + 1, y = cellY(floor) + rowH / 2 + SIDE.dy / 2; const ids = b.flats.filter(f => f.floor === floor).map(f => flatName(f.id, b.region)); return <text key={floor} x={x0 + SIDE.dx - 10} y={y + 4} textAnchor="end" className="hero-floor">{ids.join(' · ')}</text>; })}
    </svg>

    {/* HTML overlay: glassy callouts aligned to the SVG coordinate system */}
    <div className="hero-overlay" aria-hidden="true">
      {callouts.map(c => { const d = dot(c.flat), left = leftSide(c.flat); const [id, ...rest] = c.label.split(' · '); return <div key={c.flat.id} className={`hero-callout${left ? ' left' : ''}`} style={{ top: pct(d.y, H), ...(left ? { right: pct(W - 236, W) } : { left: pct(724, W) }), borderLeftColor: c.colour }}>
        <span className="hero-callout-dot" style={{ background: c.colour }} />
        <span><strong>{id}</strong>{rest.length ? <> · {rest.join(' · ')}</> : null}{c.detail && <small>{c.detail}</small>}</span>
      </div>; })}
      {path && <span className="hero-path-pill" style={{ left: pct(path.mid.x, W), top: pct(path.mid.y, H), borderColor: pathColour }}>{documented ? 'documented path' : 'probable path (hypothetical)'}</span>}
      {recheck && <span className="hero-chip hero-rain-chip"><CloudRain size={16} aria-hidden="true" /> Heavy rain forecast · {day(recheck.afterDate)}</span>}
      {exposed && <span className="hero-chip hero-side"><MapPin size={14} aria-hidden="true" /> {ORIENTATION[exposed] ?? exposed} wall · windows{state.prediction.forecastRechecks.some(r => r.orientation === exposed) ? ' (exposed to rain)' : ''}</span>}
      {ducts.length > 0 && <span className="hero-legend"><span><i className="sw wet" />Wet stack (bathrooms)</span><span><i className="sw duct" />Service duct (pipes + utilities)</span></span>}
    </div>

    {hovered && tip && <div className="hero-tooltip" role="tooltip" style={{ top: pct(cellY(hovered.floor) - 4, H), left: pct(Math.min(cellX(hovered.position) + cw / 2, W - 150), W) }}>
      <strong>Flat {hovered.id}</strong>
      <dl><div><dt>Odds</dt><dd>{tip.odds}</dd></div><div><dt>Last check</dt><dd>{tip.last}</dd></div><div><dt>Next check</dt><dd>{tip.next}</dd></div></dl>
    </div>}

    </div>
    {/* Narrow screens: the same labels as a list (the overlay hides below 560 px). */}
    <ul className="hero-list" aria-label="Flat statuses">
      {callouts.map(c => <li key={c.flat.id} style={{ borderLeftColor: c.colour, background: tint(c.colour) }}><span className="hero-callout-dot" style={{ background: c.colour }} />{c.label}{c.detail ? ` — ${c.detail}` : ''}</li>)}
    </ul>
  </div>;
}
