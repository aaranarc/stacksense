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
import { TopBar } from './layout/TopBar';
import { DryPaintTab } from './tabs/DryPaintTab';
import { NextLeakTab } from './tabs/NextLeakTab';
import { Sidebar,scrollToSection } from './layout/Sidebar';
import { Drawer } from './layout/Drawer';
import { Card } from './ui/Card';
import { InfoTip } from './ui/InfoTip';
import { BuildingHero } from './building/BuildingHero';
import { RecentActivity } from './dashboard/RecentActivity';
import { SafetyGateCard } from './dashboard/SafetyGateCard';
import { ReadSeeCard } from './dashboard/ReadSeeCard';
import { JobSheetCard } from './dashboard/JobSheetCard';
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
 const [menu,setMenu]=useState(false),[settings,setSettings]=useState(false),[view,setView]=useState<'iso'|'section'>('iso');
 const [flat,setFlat]=useState<string|null>(null);
 const [photo,setPhoto]=useState<string|null>(null);
 const [resetKey,setResetKey]=useState(0);
 const regionCases=useRef<Partial<Record<'IN'|'UK',{state:typeof state;read:ReadResult|null;messages:ChatMessage[];fixture:boolean}>>>({});
 const changeRegion=(region:'IN'|'UK')=>{if(region===state.building.region)return;regionCases.current[state.building.region]={state,read,messages,fixture};const saved=regionCases.current[region];setState(saved?.state??(region==='UK'?ukDemo():engine.createCase(buildings.IN)));setRead(saved?.read??null);setMessages(saved?.messages??[]);setFixture(saved?.fixture??region==='UK');setFlat(null);setPhoto(null);setResetKey(key=>key+1);};
 const reset=()=>{regionCases.current={};setState(engine.createCase(buildings.IN));setFlat(null);setPhoto(null);setRead(null);setMessages([]);setResetKey(key=>key+1);setFixture(false);};
 const advance=()=>setState(engine.applyObservations(state,[]));
 const isDemo=demo.enabled||fixture||state.observations.some(o=>o.provenance==='simulated');
 const mode=read?.mode??(isDemo?'cached':undefined);
 const acceptAnswers=(result:ReadResult)=>{const delta=answerDelta(state,result);if(!delta.observations.length)return 0;setRead(previous=>mergeAnswerRead(previous,delta));setState(previous=>applyResidentAnswers(previous,result));return delta.observations.length;};
 const region=state.building.region;
 const pane=(name:string,node:React.ReactNode)=><PanelState key={`${name}-${state.caseId}`} name={name}>{node}</PanelState>;
 return <CheckLinkProvider state={state} onRead={acceptAnswers}><div className="app">
  <Sidebar onSettings={()=>setSettings(true)} open={menu} onNavigate={()=>setMenu(false)}/>
  <div className="main">
   <TopBar region={region} buildingName={state.building.name} onRegion={changeRegion} demoData={isDemo} onReset={reset} onMenu={()=>setMenu(!menu)} menuOpen={menu}/>
   <div className="dash">
    <SafetyBoundary state={state}>
     <Card id="building" className="hero-card" index={0} title={state.building.name} subtitle={`${state.building.floors} floors · ${labels[region].group} · ${labels[region].manager} · ${labels[region].trap}`}
      actions={<div className="segmented sm" role="group" aria-label="Building view"><button aria-pressed={view==='iso'} onClick={()=>setView('iso')}>Isometric</button><button aria-pressed={view==='section'} onClick={()=>setView('section')}>Section</button></div>}>
      <PanelState key={`building-${state.caseId}`} name="Building">{view==='iso'?<BuildingHero state={state} selected={flat} onSelect={id=>setFlat(f=>f===id?null:id)}/>:<CrossSection state={state} selected={flat} onSelect={setFlat}/>}
       <div className="hero-foot"><Pills state={state} selectedFlat={flat}/>{flat?<span className="filter-note">Showing flat {flat} <button className="link-btn" onClick={()=>setFlat(null)}>Clear flat filter</button></span>:state.observations.length?<span className="filter-note">Select a flat to filter incidents and odds</span>:<span className="filter-note">No evidence assessed yet.</span>}</div>
      </PanelState>
     </Card>
     <div className="side-col">
      <Card id="odds" index={1} title="Probable Source" subtitle="Based on all available evidence · updates live" actions={<><DataBadge mode={mode}/><InfoTip text="Engine odds from the evidence the AI read. The badge says how the chat was read: Live, Cached or Fallback. Probable source — verify on site."/></>}>{pane('Source estimates',<SourceBars state={state} selected={flat}/>)}</Card>
      <Card id="activity" index={2} title="Recent activity">{pane('Recent activity',<RecentActivity state={state}/>)}</Card>
     </div>
     <Card id="read" step={1} index={3} title="Read & See" subtitle="Paste a WhatsApp/agent chat with photos. We’ll structure it.">{pane('Read & See',<ReadSeeCard state={state} read={read} messages={messages} mode={mode} demoData={isDemo} onPhoto={setPhoto}
      input={<PasteChat key={`${state.building.id}-${resetKey}`} mode={mode} buildingId={state.building.id} onRead={(result,chatMessages,isDemo)=>{setFixture(!!isDemo);setMessages(chatMessages);setRead(result);setState(engine.applyObservations(engine.createCase(isDemo?buildings.IN:state.building),result.observations,{photoLabels:result.photoLabels}));}}/>}
      feed={<>{read&&<SenderChips senderMap={read.senderMap} building={state.building} onAssign={(sender,flatId)=>{const observations=remapSender(state.observations,sender,flatId,messages);setState(engine.applyObservations(state,observations,{photoLabels:state.photoLabels}));setRead({...read,senderMap:{...read.senderMap,[sender]:flatId},observations:remapSender(read.observations,sender,flatId,messages)});}}/>}
       <CaseFeed state={state} messages={messages} selectedFlat={flat} onPhoto={setPhoto}/><AnswerRefresh key={state.caseId} caseId={state.caseId} enabled={state.observations.length>0&&state.safety.status!=='emergency'} onAnswers={acceptAnswers} demoData={isDemo}/></>}/>)}</Card>
     <Card id="safety" step={2} tone="amber" index={4} title="Safety Gate" subtitle="Checks for hazards first. Never asks anyone to approach a risk.">{pane('Safety Gate',<SafetyGateCard state={state}/>)}</Card>
     <Card id="check" step={3} index={5} title="Ask the Right Check" subtitle="We choose the next best check, by information gained per minute.">{pane('Next check',<NextCheck state={state} onDemoStep={advance} onOpenJudge={()=>scrollToSection('judge')}/>)}</Card>
     <Card id="opinion" step={4} index={6} title="Second Opinion" subtitle="Prevents over-confident claims.">{pane('Second Opinion',<SecondOpinionBanner state={state} demoData={isDemo} onState={setState}/>)}</Card>
     <Card id="jobsheet" step={5} index={7} title="Job Sheet" subtitle="Right trade, what to check, what not to break.">{pane('Job Sheet',<JobSheetCard state={state} demoData={isDemo}/>)}</Card>
     <Card id="repair" step={6} index={8} title="Repair → Dry → Paint" subtitle="Three separate steps. Track until truly ready to paint.">{pane('Dry & Paint',<DryPaintTab state={state} onState={setState}/>)}</Card>
     <Card id="predict" step={7} tone="amber" index={9} title="Predict & Prevent" subtitle="Building-type priors, rain-forecast re-checks and same-stack inspections.">{pane('Next Leak',<NextLeakTab state={state}/>)}</Card>
    </SafetyBoundary>
    <section id="judge" className="judge-slot" aria-label="Judge Mode panel"><PanelState key={`judge-${resetKey}`} name="Judge Mode"><JudgePanel state={state} onState={next=>{setState(next);setRead(null);setMessages([]);setFixture(true);setFlat(null);setPhoto(null);}}/></PanelState></section>
   </div>
  </div>
  {photo&&<PhotoViewer key={photo} photoId={photo} label={state.photoLabels.find(p=>p.photoId===photo)} onClose={()=>setPhoto(null)} onCorrect={(label,changed)=>setState(correctPhoto(state,label,changed))}/>}
  {settings&&<Drawer title="Settings" onClose={()=>setSettings(false)}><div className="settings">
   <section><h3>Region</h3><div className="segmented" role="group" aria-label="Region setting"><button aria-pressed={region==='IN'} onClick={()=>changeRegion('IN')}><span aria-hidden="true">🇮🇳</span> India</button><button aria-pressed={region==='UK'} onClick={()=>changeRegion('UK')}><span aria-hidden="true">🇬🇧</span> United Kingdom</button></div><p className="note">UK mode uses UK flat labels, landlord/agent wording, Awaab’s Law links and a timestamp trail.</p></section>
   <section><h3>Building</h3><dl className="facts"><div><dt>Name</dt><dd>{state.building.name}</dd></div><div><dt>Type</dt><dd>{state.building.archetype.replaceAll('_',' ')}</dd></div><div><dt>Floors</dt><dd>{state.building.floors}</dd></div><div><dt>Flats</dt><dd>{state.building.flats.length}</dd></div></dl></section>
   <section><h3>Data labels</h3><p className="note">Every AI output carries Live, Cached or Fallback. Demo data marks simulated evidence and timing.</p></section>
   <button className="outline-btn" onClick={()=>{reset();setSettings(false);}}>Reset case</button>
  </div></Drawer>}
 </div></CheckLinkProvider>;
}
