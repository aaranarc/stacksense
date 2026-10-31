'use client';
import { useRef,useState } from 'react';
import type { ChatMessage,ReadResult } from '@stacksense/contracts';
import { engine,demo,buildings } from '../lib/adapters';
import {answerDelta,applyResidentAnswers,mergeAnswerRead} from '../lib/answers';
import {AnswerRefresh} from './phone/AnswerRefresh';
import {ukDemo} from '../lib/regionDemo';
import {labels} from '../lib/labels';
import { remapSender } from '../lib/assignSender';
import { correctPhoto } from '../lib/correctPhoto';
import {DataBadge} from './states/DataBadge';
import {PanelState} from './states/PanelState';
import { Shell } from './layout/Shell';
import { TopBar } from './layout/TopBar';
import { RightTabs } from './tabs/RightTabs';
import { CrossSection } from './building/CrossSection';
import { Pills } from './building/Pills';
import { SourceBars } from './odds/SourceBars';
import { NextCheck } from './checks/NextCheck';
import { SafetyBoundary } from './safety/SafetyBoundary';
import { PasteChat } from './import/PasteChat';
import { SenderChips } from './import/SenderChips';
import { CaseFeed } from './feed/CaseFeed';
import { PhotoViewer } from './photo/PhotoViewer';
import {CheckLinkProvider} from './phone/PhoneSimulator';
import { JudgePanel } from './judge/JudgePanel';
import { SecondOpinionBanner } from './opinion/SecondOpinionBanner';
export function Workspace() {
 const [state,setState]=useState(()=>engine.createCase(demo.states[0]!.building));
 const [messages,setMessages]=useState<ChatMessage[]>([]);
 const [read,setRead]=useState<ReadResult|null>(null);
 const [fixture,setFixture]=useState(false);
 const [judge,setJudge]=useState(false);
 const [flat,setFlat]=useState<string|null>(null);
 const [photo,setPhoto]=useState<string|null>(null);
 const [resetKey,setResetKey]=useState(0);
 const regionCases=useRef<Partial<Record<'IN'|'UK',{state:typeof state;read:ReadResult|null;messages:ChatMessage[];fixture:boolean}>>>({});
 const changeRegion=(region:'IN'|'UK')=>{if(region===state.building.region)return;regionCases.current[state.building.region]={state,read,messages,fixture};const saved=regionCases.current[region];setState(saved?.state??(region==='UK'?ukDemo():engine.createCase(buildings.IN)));setRead(saved?.read??null);setMessages(saved?.messages??[]);setFixture(saved?.fixture??region==='UK');setFlat(null);setPhoto(null);setResetKey(key=>key+1);};
 const reset=()=>{setState(engine.createCase(state.building));setFlat(null);setPhoto(null);setRead(null);setMessages([]);setResetKey(key=>key+1);setFixture(false);};
 const advance=()=>setState(engine.applyObservations(state,[]));
 const isDemo=demo.enabled||fixture||state.observations.some(o=>o.provenance==='simulated');
 const mode=read?.mode??(isDemo?'cached':undefined);
 const acceptAnswers=(result:ReadResult)=>{const delta=answerDelta(state,result);if(!delta.observations.length)return 0;setRead(previous=>mergeAnswerRead(previous,delta));setState(previous=>applyResidentAnswers(previous,result));return delta.observations.length;};
 return <CheckLinkProvider state={state} onRead={acceptAnswers}><div className={judge?'app-with-judge':undefined}>
  <TopBar region={state.building.region} buildingName={state.building.name} onRegion={changeRegion} judge={judge} onJudge={()=>setJudge(!judge)} onReset={reset} onScenario={id=>{reset();if(id==='electrical_hazard')setState(structuredClone(demo.emergency));}}/>
  <div className="case-heading"><div><span className="eyebrow">BUILDING DIAGNOSTICS</span><h1>One building. A clearer next step.</h1></div><DataBadge mode={mode} demoData={isDemo}/></div>
  <SafetyBoundary state={state}>
   {judge && <PanelState key={`judge-${resetKey}`} name="Judge Mode"><JudgePanel state={state} onState={next=>{setState(next);setRead(null);setMessages([]);setFixture(true);setFlat(null);setPhoto(null);}} /></PanelState>}
   <Shell feed={<PanelState key={`feed-${resetKey}`} name="Case feed">
    <PasteChat key={`${state.building.id}-${resetKey}`} mode={mode} buildingId={state.building.id} onRead={(result,chatMessages,isDemo)=>{setFixture(!!isDemo);setMessages(chatMessages);setRead(result);setState(engine.applyObservations(engine.createCase(isDemo?buildings.IN:state.building),result.observations,{photoLabels:result.photoLabels}));}}/>
    {read&&<SenderChips senderMap={read.senderMap} building={state.building} onAssign={(sender,flatId)=>{const observations=remapSender(state.observations,sender,flatId,messages);setState(engine.applyObservations(state,observations,{photoLabels:state.photoLabels}));setRead({...read,senderMap:{...read.senderMap,[sender]:flatId},observations:remapSender(read.observations,sender,flatId,messages)});}}/>}
    {flat&&<p>Showing flat {flat} <button onClick={()=>setFlat(null)}>Clear flat filter</button></p>}
    <CaseFeed state={state} messages={messages} selectedFlat={flat} onPhoto={setPhoto}/><AnswerRefresh key={state.caseId} caseId={state.caseId} enabled={state.observations.length>0&&state.safety.status!=='emergency'} onAnswers={acceptAnswers} demoData={isDemo}/>
   </PanelState>} building={<PanelState key={`building-${state.caseId}`} name="Building">
    <div className="section-heading"><h2>Cross-Section</h2><span>{state.building.name} · {state.building.floors} floors</span><small>{labels[state.building.region].group} · {labels[state.building.region].manager} · {labels[state.building.region].trap}</small></div>
    <CrossSection state={state} selected={flat} onSelect={setFlat}/>{!state.observations.length&&<p className="diagram-key">No evidence assessed yet.</p>}<Pills state={state} selectedFlat={flat}/>
   </PanelState>} analysis={<>
    <PanelState key={`odds-${state.caseId}`} name="Source estimates"><SourceBars state={state}/></PanelState><PanelState key={`check-${state.caseId}`} name="Next check"><NextCheck state={state} onDemoStep={advance}/></PanelState>
    <PanelState key={`opinion-${state.caseId}`} name="Second Opinion"><SecondOpinionBanner state={state} demoData={isDemo} onState={setState}/></PanelState>
    <RightTabs state={state} onState={setState} demoData={isDemo}/>
   </>}/>
   {photo&&<PhotoViewer key={photo} photoId={photo} label={state.photoLabels.find(p=>p.photoId===photo)} onClose={()=>setPhoto(null)} onCorrect={(label,changed)=>setState(correctPhoto(state,label,changed))}/>}
  </SafetyBoundary>
 </div></CheckLinkProvider>;
}
