'use client';
import { SafetyBoundary } from './safety/SafetyBoundary';

import { useState } from 'react';
import type { ReadResult,ChatMessage } from '@stacksense/contracts';
import { PasteChat } from './import/PasteChat';
import { SenderChips } from './import/SenderChips';
import { remapSender } from '../lib/assignSender';
import { engine,demo } from '../lib/adapters';
import { Shell } from './layout/Shell';
import { TopBar } from './layout/TopBar';
import { RightTabs } from './tabs/RightTabs';
import { CrossSection } from './building/CrossSection';
import { SourceBars } from './odds/SourceBars';
import { NextCheck } from './checks/NextCheck';
export function Workspace() {
 const [state,setState]=useState(()=>engine.createCase(demo.states[0]!.building));
 const [messages,setMessages]=useState<ChatMessage[]>([]);
 const [read,setRead]=useState<ReadResult|null>(null);
 const [judge,setJudge]=useState(false);
 const [flat,setFlat]=useState<string|null>(null);
 const reset=()=>{setState(engine.createCase(demo.states[0]!.building));setFlat(null);setRead(null);};
 return <><TopBar judge={judge} onJudge={()=>setJudge(!judge)} onReset={reset} onScenario={id=>{setState(id==='electrical_hazard'?structuredClone(demo.emergency):engine.createCase(demo.states[0]!.building));setFlat(null);}}/><div className="case-heading"><div><span className="eyebrow">BUILDING DIAGNOSTICS</span><h1>One building. A clearer next step.</h1></div><p className="chip">{demo.enabled?'Demo data · Cached':'Live'}</p></div><SafetyBoundary state={state}>{judge&&<aside className="judge-panel panel" aria-label="Judge Mode"><strong>Hero story · {state.caseId}</strong><button className="primary" onClick={()=>setState(engine.applyObservations(state,[]))}>Next step ▸</button><button onClick={reset}>Reset story</button></aside>}<Shell feed={<><PasteChat mode={read?.mode??'cached'} onRead={(result,chatMessages)=>{setMessages(chatMessages);setRead(result);setState(engine.applyObservations(engine.createCase(state.building),result.observations,{photoLabels:result.photoLabels}));}}/>{read&&<SenderChips senderMap={read.senderMap} building={state.building} onAssign={(sender,flatId)=>{const observations=remapSender(state.observations,sender,flatId,messages);setState(engine.applyObservations(state,observations,{photoLabels:state.photoLabels}));setRead({...read,senderMap:{...read.senderMap,[sender]:flatId},observations:remapSender(read.observations,sender,flatId,messages)});}}/>}{flat&&<p>Showing flat {flat}</p>}{flat&&<button onClick={()=>setFlat(null)}>Clear flat filter</button>}</>} building={<><div className="section-heading"><h2>Cross-Section</h2><span>{state.building.name} · {state.building.floors} floors</span></div><CrossSection state={state} selected={flat} onSelect={setFlat}/></>} analysis={<><SourceBars state={state}/><NextCheck state={state} onDemoStep={()=>setState(engine.applyObservations(state,[]))}/><section className="panel opinion-line">Second Opinion: {state.secondOpinion?.claim??'Not reviewed yet.'}</section><RightTabs/></>}/></SafetyBoundary></>;
}






