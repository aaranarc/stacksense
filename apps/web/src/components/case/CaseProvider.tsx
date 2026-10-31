'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { z } from 'zod';
import { ChatMessage, EngineState, ReadResult, type Building } from '@stacksense/contracts';
import { engine, demo, buildings } from '../../lib/adapters';
import { answerDelta, applyResidentAnswers, mergeAnswerRead } from '../../lib/answers';
import { ukDemo } from '../../lib/regionDemo';
import { remapSender } from '../../lib/assignSender';
import { CheckLinkProvider } from '../phone/PhoneSimulator';
import { PlayerContext, useScenarioPlayer } from '../judge/ScenarioPicker';

export const STORAGE_KEY = 'stacksense:workspace';
const Saved = z.object({ state: EngineState, read: ReadResult.nullable(), messages: z.array(ChatMessage), fixture: z.boolean(), flat: z.string().nullable(), draftText: z.string().default('') });
type Saved = z.infer<typeof Saved>;
type Region = 'IN' | 'UK';

/** sessionStorage when available; any failure (private mode, quota, bad JSON) falls back to memory. */
let memory: string | null = null;
function readSaved(): Saved | null {
  let raw: string | null;
  try { raw = sessionStorage.getItem(STORAGE_KEY); } catch { raw = memory; }
  try { return raw ? Saved.parse(JSON.parse(raw)) : null; } catch { return null; }
}
function writeSaved(value: Saved | null) {
  const json = value ? JSON.stringify(value) : null;
  try { if (json) sessionStorage.setItem(STORAGE_KEY, json); else sessionStorage.removeItem(STORAGE_KEY); } catch { memory = json; }
}

function useCaseStore() {
  const [state, setState] = useState(() => engine.createCase(demo.states[0]!.building));
  const [draftText,setDraftText]=useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [read, setRead] = useState<ReadResult | null>(null);
  const [fixture, setFixture] = useState(false);
  const [flat, setFlat] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [view, setView] = useState<'iso' | 'section'>('iso');
  const [resetKey, setResetKey] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const regionCases = useRef<Partial<Record<Region, { state: EngineState; read: ReadResult | null; messages: ChatMessage[]; fixture: boolean }>>>({});

  const fromJudge = (next: EngineState) => { setState(next); setRead(null); setMessages([]); setFixture(true); setFlat(null); setPhoto(null); };
  const player = useScenarioPlayer(fromJudge);

  useEffect(() => {
    const saved = readSaved();
    if (saved) { setState(saved.state); setRead(saved.read); setMessages(saved.messages); setFixture(saved.fixture); setFlat(saved.flat); setDraftText(saved.draftText); }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) writeSaved({ state, read, messages, fixture, flat, draftText }); }, [hydrated, state, read, messages, fixture, flat, draftText]);

  const changeRegion = (region: Region) => {
    if (region === state.building.region) return;
    player.clear();
    regionCases.current[state.building.region] = { state, read, messages, fixture };
    const saved = regionCases.current[region];
    setState(saved?.state ?? (region === 'UK' ? ukDemo() : engine.createCase(buildings.IN)));
    setRead(saved?.read ?? null); setMessages(saved?.messages ?? []); setFixture(saved?.fixture ?? region === 'UK');
    setFlat(null); setPhoto(null); setResetKey(k => k + 1);
  };
  const reset = () => {
    player.clear(); regionCases.current = {}; writeSaved(null);
    setState(engine.createCase(buildings.IN)); setFlat(null); setPhoto(null); setRead(null); setMessages([]); setResetKey(k => k + 1); setFixture(false); setDraftText('');
  };
  const startBuilding=(building:Building)=>{
    player.clear();regionCases.current={};setState(engine.createCase(building));setMessages([]);setRead(null);setFixture(false);setFlat(null);setPhoto(null);setDraftText('');setResetKey(k=>k+1);
  };
  const acceptAnswers = (result: ReadResult) => {
    const delta = answerDelta(state, result);
    if (!delta.observations.length) return 0;
    setRead(previous => mergeAnswerRead(previous, delta)); setState(previous => applyResidentAnswers(previous, result));
    return delta.observations.length;
  };
  const acceptRead = (result: ReadResult, chatMessages: ChatMessage[], isDemo?: boolean) => {
    player.clear(); setFixture(!!isDemo); setMessages(chatMessages); setRead(result);
    setState(engine.applyObservations(engine.createCase(isDemo ? buildings.IN : state.building), result.observations, { photoLabels: result.photoLabels }));
  };
  const assignSender = (sender: string, flatId: string) => {
    if (!read) return;
    setState(engine.applyObservations(state, remapSender(state.observations, sender, flatId, messages), { photoLabels: state.photoLabels }));
    setRead({ ...read, senderMap: { ...read.senderMap, [sender]: flatId }, observations: remapSender(read.observations, sender, flatId, messages) });
  };
  const isDemo = demo.enabled || fixture || state.observations.some(o => o.provenance === 'simulated');
  return {
    state, setState, draftText, setDraftText, messages, read, flat, setFlat, photo, setPhoto, view, setView, resetKey, hydrated, player,
    isDemo, mode: read?.mode ?? (isDemo ? 'cached' as const : undefined), region: state.building.region,
    changeRegion, reset, startBuilding, acceptAnswers, acceptRead, assignSender, fromJudge,
    advance: () => setState(engine.applyObservations(state, [])),
  };
}
export type CaseStore = ReturnType<typeof useCaseStore>;
const CaseContext = createContext<CaseStore | null>(null);

export function useCase(): CaseStore {
  const store = useContext(CaseContext);
  if (!store) throw new Error('useCase must be used inside <CaseProvider>');
  return store;
}

/** One case store for every dashboard page, so state (and Judge Mode playback) survives navigation. */
export function CaseProvider({ children }: { children: ReactNode }) {
  const store = useCaseStore();
  return <CaseContext.Provider value={store}><PlayerContext.Provider value={store.player}>
    <CheckLinkProvider state={store.state} onRead={store.acceptAnswers}>{children}</CheckLinkProvider>
  </PlayerContext.Provider></CaseContext.Provider>;
}
