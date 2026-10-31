'use client';
import { useEffect, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCase } from './case/CaseProvider';
import { labels } from '../lib/labels';
import { correctPhoto } from '../lib/correctPhoto';
import { Card } from './ui/Card';
import { InfoTip } from './ui/InfoTip';
import { DataBadge } from './states/DataBadge';
import { PanelState } from './states/PanelState';
import { BuildingHero } from './building/BuildingHero';
import { CrossSection } from './building/CrossSection';
import { Pills } from './building/Pills';
import { SourceBars } from './odds/SourceBars';
import { RecentActivity } from './dashboard/RecentActivity';
import { ReadSeeCard } from './dashboard/ReadSeeCard';
import { SafetyGateCard } from './dashboard/SafetyGateCard';
import { JobSheetCard } from './dashboard/JobSheetCard';
import { NextCheck } from './checks/NextCheck';
import { SecondOpinionBanner } from './opinion/SecondOpinionBanner';
import { DryPaintTab } from './tabs/DryPaintTab';
import { NextLeakTab } from './tabs/NextLeakTab';
import { PasteChat } from './import/PasteChat';
import { SenderChips } from './import/SenderChips';
import { CaseFeed } from './feed/CaseFeed';
import { AnswerRefresh } from './phone/AnswerRefresh';
import { PhotoViewer } from './photo/PhotoViewer';
import { SafetyBoundary } from './safety/SafetyBoundary';
import { JudgePanel } from './judge/JudgePanel';

/** Each section remounts its error boundary when the case changes. */
function usePane() {
  const { state } = useCase();
  return (name: string, node: ReactNode) => <PanelState key={`${name}-${state.caseId}`} name={name}>{node}</PanelState>;
}

export function BuildingCard() {
  const { state, flat, setFlat, view, setView, region } = useCase();
  return <Card id="building" className="hero-card" title={state.building.name} subtitle={`${state.building.floors} floors · ${labels[region].group} · ${labels[region].manager} · ${labels[region].trap}`}
    actions={<div className="segmented sm" role="group" aria-label="Building view"><button aria-pressed={view === 'iso'} onClick={() => setView('iso')}>Isometric</button><button aria-pressed={view === 'section'} onClick={() => setView('section')}>Section</button></div>}>
    <PanelState key={`building-${state.caseId}`} name="Building">{view === 'iso' ? <BuildingHero state={state} selected={flat} onSelect={id => setFlat(f => f === id ? null : id)} /> : <CrossSection state={state} selected={flat} onSelect={setFlat} />}
      <div className="hero-foot"><Pills state={state} selectedFlat={flat} />{flat ? <span className="filter-note">Showing flat {flat} <button className="link-btn" onClick={() => setFlat(null)}>Clear flat filter</button></span> : state.observations.length ? <span className="filter-note">Select a flat to filter incidents and odds</span> : <span className="filter-note">No evidence assessed yet.</span>}</div>
    </PanelState>
  </Card>;
}

export function OddsCard() {
  const { state, flat, mode } = useCase(); const pane = usePane();
  return <Card id="odds" title="Probable Source" subtitle="Based on all available evidence · updates live" actions={<><DataBadge mode={mode} /><InfoTip text="Engine odds from the evidence the AI read. The badge says how the chat was read: Live, Cached or Fallback. Probable source — verify on site." /></>}>{pane('Source estimates', <SourceBars state={state} selected={flat} />)}</Card>;
}

export function ActivityCard() {
  const { state } = useCase(); const pane = usePane();
  return <Card id="activity" title="Recent activity">{pane('Recent activity', <RecentActivity state={state} />)}</Card>;
}

export function ReadCard({ autoDemo = false }: { autoDemo?: boolean }) {
  const c = useCase(); const pane = usePane();
  const { state, read, messages, mode, isDemo, flat, setFlat, setPhoto } = c;
  return <Card id="read" step={1} title="Read & See" subtitle="Paste a WhatsApp/agent chat with photos. We’ll structure it.">{pane('Read & See', <ReadSeeCard state={state} read={read} messages={messages} mode={mode} demoData={isDemo} onPhoto={setPhoto}
    input={<PasteChat key={`${state.building.id}-${c.resetKey}`} mode={mode} buildingId={state.building.id} autoDemo={autoDemo} onRead={c.acceptRead} />}
    feed={<>{read && <SenderChips senderMap={read.senderMap} building={state.building} onAssign={c.assignSender} />}
      <CaseFeed state={state} messages={messages} selectedFlat={flat} onClearFlat={() => setFlat(null)} onPhoto={setPhoto} />
      <AnswerRefresh key={state.caseId} caseId={state.caseId} enabled={state.observations.length > 0 && state.safety.status !== 'emergency'} onAnswers={c.acceptAnswers} demoData={isDemo} /></>} />)}</Card>;
}

export function SafetyCard() {
  const { state } = useCase(); const pane = usePane();
  return <Card id="safety" step={2} tone="amber" title="Safety Gate" subtitle="Checks for hazards first. Never asks anyone to approach a risk.">{pane('Safety Gate', <SafetyGateCard state={state} />)}</Card>;
}

export function CheckCard() {
  const { state, advance } = useCase(); const pane = usePane(); const router = useRouter();
  return <Card id="check" step={3} title="Ask the Right Check" subtitle="We choose the next best check, by information gained per minute.">{pane('Next check', <NextCheck state={state} onDemoStep={advance} onOpenJudge={() => router.push('/judge')} />)}</Card>;
}

export function OpinionCard() {
  const { state, isDemo, setState } = useCase(); const pane = usePane();
  return <Card id="opinion" step={4} title="Second Opinion" subtitle="Prevents over-confident claims.">{pane('Second Opinion', <SecondOpinionBanner state={state} demoData={isDemo} onState={setState} />)}</Card>;
}

export function JobSheetSection() {
  const { state, isDemo } = useCase(); const pane = usePane();
  return <Card id="jobsheet" step={5} title="Job Sheet" subtitle="Right trade, what to check, what not to break.">{pane('Job Sheet', <JobSheetCard state={state} demoData={isDemo} />)}</Card>;
}

export function RepairCard() {
  const { state, setState } = useCase(); const pane = usePane();
  return <Card id="repair" step={6} title="Repair → Dry → Paint" subtitle="Three separate steps. Track until truly ready to paint.">{pane('Dry & Paint', <DryPaintTab state={state} onState={setState} />)}</Card>;
}

export function PredictCard() {
  const { state } = useCase(); const pane = usePane();
  return <Card id="predict" step={7} tone="amber" title="Predict & Prevent" subtitle="Building-type priors, rain-forecast re-checks and same-stack inspections.">{pane('Next Leak', <NextLeakTab state={state} />)}</Card>;
}

export function GlobalPhotoViewer() {
  const { state, photo, setPhoto, setState } = useCase();
  return photo ? <PhotoViewer key={photo} photoId={photo} label={state.photoLabels.find(p => p.photoId === photo)} onClose={() => setPhoto(null)} onCorrect={(label, changed) => setState(correctPhoto(state, label, changed))} /> : null;
}

export function Boundary({ children }: { children: ReactNode }) {
  const { state } = useCase();
  return <SafetyBoundary state={state}>{children}</SafetyBoundary>;
}

/** /incidents?demo=1 (from the dashboard banner) loads the demo chat once, then drops the query. */
export function ReadFromRoute() {
  const demo = useSearchParams().get('demo') === '1'; const router = useRouter();
  useEffect(() => { if (demo) router.replace('/incidents', { scroll: false }); }, [demo, router]);
  return <ReadCard autoDemo={demo} />;
}

export function JudgeSection() {
  const { state, fromJudge, resetKey } = useCase();
  return <section id="judge" className="judge-slot" aria-label="Judge Mode panel"><PanelState key={`judge-${resetKey}`} name="Judge Mode"><JudgePanel state={state} onState={fromJudge} sheet={false} /></PanelState></section>;
}

export function SettingsPanel() {
  const { state, region, changeRegion, reset } = useCase();
  return <Card id="settings" title="Settings" subtitle="Region, building facts and data labels."><div className="settings">
    <section><h3>Region</h3><div className="segmented" role="group" aria-label="Region setting"><button aria-pressed={region === 'IN'} onClick={() => changeRegion('IN')}><span aria-hidden="true">🇮🇳</span> India</button><button aria-pressed={region === 'UK'} onClick={() => changeRegion('UK')}><span aria-hidden="true">🇬🇧</span> United Kingdom</button></div><p className="note">UK mode uses UK flat labels, landlord/agent wording, Awaab’s Law links and a timestamp trail.</p></section>
    <section><h3>Building</h3><dl className="facts"><div><dt>Name</dt><dd>{state.building.name}</dd></div><div><dt>Type</dt><dd>{state.building.archetype.replaceAll('_', ' ')}</dd></div><div><dt>Floors</dt><dd>{state.building.floors}</dd></div><div><dt>Flats</dt><dd>{state.building.flats.length}</dd></div></dl></section>
    <section><h3>Data labels</h3><p className="note">Every AI output carries Live, Cached or Fallback. Demo data marks simulated evidence and timing.</p></section>
    <section><h3>Case</h3><p className="note">Clears the case on every page, including the saved session copy.</p><button className="outline-btn" onClick={reset}>Reset case</button></section>
  </div></Card>;
}
