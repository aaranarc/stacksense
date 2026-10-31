'use client';
import {createContext,useContext,useEffect,useState} from 'react';
import type {ReactNode} from 'react';
import {ReadResult} from '@stacksense/contracts';
import type {EngineState} from '@stacksense/contracts';
import {NeighbourFlow} from './NeighbourFlow';
import {Drawer} from '../layout/Drawer';
type Link={token:string;url:string;waUrl:string;checkId?:string;demo?:boolean};
const CheckContext=createContext<(link:Link)=>void>(()=>{});
export const useCheckLink=()=>useContext(CheckContext);
export function PhoneSimulator({token,onAnswer,onClose,region='IN',demoPreview=false}:{token:string;region?:'IN'|'UK';demoPreview?:boolean;onAnswer:(result:ReadResult)=>void;onClose:()=>void}) {
 return <Drawer title="Phone simulator · neighbour check" onClose={onClose}>{demoPreview?<p className="chip">Demo data · Block A 302 duct preview. Quality is checked locally; diagnostic labels are simulated. No evidence is added to your current case.</p>:<p>This preview uses the same form as the resident link.</p>}<p><a href={`/c/${encodeURIComponent(token)}${region==='UK'?'?region=UK':''}`} target="_blank" rel="noopener noreferrer">Open check in a new tab</a></p><div className="phone-preview" role="region" aria-label="Neighbour check"><NeighbourFlow token={token} region={region} onComplete={result=>{onAnswer(result);onClose();}}/></div></Drawer>;
}
export function CheckLinkProvider({state,onRead,children}:{state:EngineState;onRead:(result:ReadResult)=>void;children:ReactNode}) {
 const [link,setLink]=useState<(Link&{caseId:string;seenIds:string[]})|null>(null);
 const [notice,setNotice]=useState('');
 useEffect(()=>{setLink(null);setNotice('');},[state.caseId]);
 useEffect(()=>{if(link?.checkId&&state.observations.some(o=>o.checkId===link.checkId&&!link.seenIds.includes(o.id)))setLink(null);},[state.observations,link]);
 return <CheckContext.Provider value={value=>{setNotice('');setLink({...value,caseId:state.caseId,seenIds:state.observations.map(o=>o.id)});}}>{children}{notice&&<p role="status" className="panel demo-note">{notice}</p>}{link&&link.caseId===state.caseId&&(state.safety.status==='ok'||(link.demo&&state.safety.status==='incomplete'))&&<PhoneSimulator demoPreview={link.demo} region={link.demo?'IN':state.building.region} token={link.token} onAnswer={result=>{if(link.demo)setNotice('Demo phone completed — no evidence was added to this case.');else onRead(result);}} onClose={()=>setLink(null)}/>}</CheckContext.Provider>;
}
