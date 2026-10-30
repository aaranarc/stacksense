'use client';
import { useState } from 'react';
export function RightTabs() {
 const [active,setActive]=useState('Job Sheet');
 const tabs=['Job Sheet','Dry & Paint','Next Leak'];
 const content=(tab:string)=>tab==='Job Sheet'?'No Job Sheet yet — complete the checks.':tab==='Dry & Paint'?'Looks better ≠ dry. Only a moisture reading can mark this ready to paint.':'Inspection first. No inspection recommendations yet.';
 return <section className="panel"><div className="desktop-tabs"><div role="tablist" aria-label="Case details">{tabs.map(tab=><button key={tab} id={`tab-${tab}`} role="tab" aria-selected={active===tab} aria-controls={`panel-${tab}`} onClick={()=>setActive(tab)}>{tab}</button>)}</div><div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} style={{paddingTop:16}}>{content(active)}</div></div><div className="mobile-tabs">{tabs.map(tab=><details key={tab}><summary>{tab}</summary><p>{content(tab)}</p></details>)}</div></section>;
}
