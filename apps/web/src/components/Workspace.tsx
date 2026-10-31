'use client';
import { useState } from 'react';
import type { ChatMessage,ReadResult } from '@stacksense/contracts';
import { engine,demo } from '../lib/adapters';
import { remapSender } from '../lib/assignSender';
import { correctPhoto } from '../lib/correctPhoto';
import { Shell } from './layout/Shell';
import { TopBar } from './layout/TopBar';
import { RightTabs } from './tabs/RightTabs';
import { CrossSection } from './building/CrossSection';
import { SourceBars } from './odds/SourceBars';
import { NextCheck } from './checks/NextCheck';
import { SafetyBoundary } from './safety/SafetyBoundary';
import { PasteChat } from './import/PasteChat';
import { SenderChips } from './import/SenderChips';
import { CaseFeed } from './feed/CaseFeed';
import { PhotoViewer } from './photo/PhotoViewer';
import { JudgePanel } from './judge/JudgePanel';
import { SecondOpinionBanner } from './opinion/SecondOpinionBanner';
export function Workspace() {
 const [state,setState]=useState(()=>engine.createCase(demo.states[0]!.building));
 const [messages,setMessages]=useState<ChatMessage[]>([]);
 const [read,setRead]=useState<ReadResult|null>(null);
 const [judge,setJudge]=useState(false);
 const [flat,setFlat]=useState<string|null>(null);
 const [photo,setPhoto]=useState<string|null>(null);
 const [resetKey,setResetKey]=useState(0);
 const reset=()=>{setState(engine.createCase(demo.states[0]!.building));setFlat(null);setPhoto(null);setRead(null);setMessages([]);setResetKey(key=>key+1);};
 const advance=()=>setState(engine.applyObservations(state,[]));
 const mode=read?.mode??(demo.enabled?'cached':'fallback');
 return <>
  <TopBar judge={judge} onJudge={()=>setJudge(!judge)} onReset={reset} onScenario={id=>{reset();if(id==='electrical_hazard')setState(structuredClone(demo.emergency));}}/>
  <div className="case-heading"><div><span className="eyebrow">BUILDING DIAGNOSTICS</span><h1>One building. A clearer next step.</h1></div><p className="chip">{mode==='cached'?'Cached':mode==='live'?'Live':'Fallback'}{demo.enabled?' · Demo data':''}</p></div>
  <SafetyBoundary state={state}>
   {judge && <JudgePanel state={state} onState={setState} />}
   <Shell feed={<>
    <PasteChat key={`${state.building.id}-${resetKey}`} mode={mode} onRead={(result,chatMessages)=>{setMessages(chatMessages);setRead(result);setState(engine.applyObservations(engine.createCase(state.building),result.observations,{photoLabels:result.photoLabels}));}}/>
    {read&&<SenderChips senderMap={read.senderMap} building={state.building} onAssign={(sender,flatId)=>{const observations=remapSender(state.observations,sender,flatId,messages);setState(engine.applyObservations(state,observations,{photoLabels:state.photoLabels}));setRead({...read,senderMap:{...read.senderMap,[sender]:flatId},observations:remapSender(read.observations,sender,flatId,messages)});}}/>}
    {flat&&<p>Showing flat {flat} <button onClick={()=>setFlat(null)}>Clear flat filter</button></p>}
    <CaseFeed state={state} selectedFlat={flat} onPhoto={setPhoto}/>
   </>} building={<>
    <div className="section-heading"><h2>Cross-Section</h2><span>{state.building.name} · {state.building.floors} floors</span></div>
    <CrossSection state={state} selected={flat} onSelect={setFlat}/>
   </>} analysis={<>
    <SourceBars state={state}/><NextCheck state={state} onDemoStep={advance}/>
    <SecondOpinionBanner state={state} onState={setState}/>
    <RightTabs/>
   </>}/>
   {photo&&<PhotoViewer key={photo} photoId={photo} label={state.photoLabels.find(p=>p.photoId===photo)} onClose={()=>setPhoto(null)} onCorrect={(label,changed)=>setState(correctPhoto(state,label,changed))}/>}
  </SafetyBoundary>
 </>;
}
