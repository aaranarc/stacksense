'use client';
import {useId,useState} from 'react';
import type {EngineState} from '@stacksense/contracts';
import {PanelState} from '../states/PanelState';
import {JobSheetTab} from './JobSheetTab';
import {DryPaintTab} from './DryPaintTab';
import {NextLeakTab} from './NextLeakTab';
export function RightTabs({state,onState,demoData}:{state:EngineState;demoData?:boolean;onState:(state:EngineState)=>void}) {
 const [active,setActive]=useState(0),id=useId();
 const tabs=['Job Sheet','Dry & Paint','Next Leak'];
 const content=(index:number)=><PanelState key={`${state.caseId}-${index}`} name={tabs[index]!}>{index===0?<JobSheetTab state={state} demoData={demoData}/>:index===1?<DryPaintTab state={state} onState={onState}/>:<NextLeakTab state={state}/>}</PanelState>;
 return <section className="panel"><div className="desktop-tabs"><div role="tablist" aria-label="Case details">{tabs.map((tab,index)=><button key={tab} id={`${id}-tab-${index}`} role="tab" aria-selected={active===index} tabIndex={active===index?0:-1} aria-controls={`${id}-panel`} onClick={()=>setActive(index)} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=(index+(e.key==='ArrowRight'?1:2))%3;setActive(next);document.getElementById(`${id}-tab-${next}`)?.focus();}}}>{tab}</button>)}</div><div role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${active}`} style={{paddingTop:16}}>{content(active)}</div></div><div className="mobile-tabs">{tabs.map((tab,index)=><details key={tab}><summary>{tab}</summary>{content(index)}</details>)}</div></section>;
}
