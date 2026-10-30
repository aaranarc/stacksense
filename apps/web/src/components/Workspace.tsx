'use client';
import { useState } from 'react';
import { engine,demo } from '../lib/adapters';
import { Shell } from './layout/Shell';
import { TopBar } from './layout/TopBar';
import { RightTabs } from './tabs/RightTabs';
import { CrossSection } from './building/CrossSection';
import { SourceBars } from './odds/SourceBars';
import { NextCheck } from './checks/NextCheck';
export function Workspace() {
 const [state,setState]=useState(()=>engine.createCase(demo.states[0]!.building));
 const [judge,setJudge]=useState(false);
 const [flat,setFlat]=useState<string|null>(null);
 const reset=()=>{setState(engine.createCase(demo.states[0]!.building));setFlat(null);};
 return <><TopBar judge={judge} onJudge={()=>setJudge(!judge)} onReset={reset} onScenario={reset}/><div className="case-heading"><div><span className="eyebrow">BUILDING DIAGNOSTICS</span><h1>One building. A clearer next step.</h1></div><p className="chip">{demo.enabled?'Demo data · Cached':'Live'}</p></div>{judge&&<aside className="judge-panel panel" aria-label="Judge Mode"><strong>Hero story · {state.caseId}</strong><button className="primary" onClick={()=>setState(engine.applyObservations(state,[]))}>Next step ▸</button><button onClick={reset}>Reset story</button></aside>}<Shell feed={<><h2>Case Feed</h2><p>Paste a WhatsApp or agent chat, or load the demo building.</p><button className="primary" onClick={()=>setState(engine.applyObservations(state,[]))}>Load demo building</button>{flat&&<p>Showing flat {flat}</p>}{flat&&<button onClick={()=>setFlat(null)}>Clear flat filter</button>}</>} building={<><div className="section-heading"><h2>Cross-Section</h2><span>{state.building.name} · {state.building.floors} floors</span></div><CrossSection state={state} selected={flat} onSelect={setFlat}/></>} analysis={<><SourceBars state={state}/><NextCheck state={state} onDemoStep={()=>setState(engine.applyObservations(state,[]))}/><section className="panel opinion-line">Second Opinion: {state.secondOpinion?.claim??'Not reviewed yet.'}</section><RightTabs/></>}/></>;
}



