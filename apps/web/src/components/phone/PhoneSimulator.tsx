'use client';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {ReadResult} from '@stacksense/contracts';
import type {EngineState} from '@stacksense/contracts';
import {rememberPhoto} from '../../lib/media';
import {Drawer} from '../layout/Drawer';
type Link={token:string;url:string;waUrl:string;checkId?:string;demo?:boolean};
const CheckContext=createContext<(link:Link)=>void>(()=>{});
export const useCheckLink=()=>useContext(CheckContext);
export function PhoneSimulator({token,onAnswer,onClose,region='IN',demoPreview=false}:{token:string;region?:'IN'|'UK';demoPreview?:boolean;onAnswer:(result:ReadResult)=>void;onClose:()=>void}) {
 const frame=useRef<HTMLIFrameElement>(null);
 const [loading,setLoading]=useState(true),[error,setError]=useState(false),[attempt,setAttempt]=useState(0);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.type!=='stacksense-check-complete'||event.data?.token!==token)return;const result=ReadResult.safeParse(event.data.result);if(result.success){if(Array.isArray(event.data.previews))for(const preview of event.data.previews){if(preview&&typeof preview.id==='string'&&typeof preview.url==='string'&&result.data.photoLabels.some(label=>label.photoId===preview.id))rememberPhoto(preview.id,preview.url);}onAnswer(result.data);onClose();}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[token,onAnswer,onClose]);
 return <Drawer title="Phone simulator · neighbour check" onClose={onClose}>{demoPreview?<p className="chip">Cached · Demo data · Block A 302 duct preview. No evidence is added to your current case.</p>:<p>The frame closes when the check answer arrives.</p>}<div aria-busy={loading}>{loading&&<p role="status">Loading neighbour check…</p>}{error&&<p role="alert">The phone check could not load. <button onClick={()=>{setError(false);setLoading(true);setAttempt(value=>value+1);}}>Retry phone check</button></p>}<div className="phone-frame"><iframe key={`${token}-${attempt}`} ref={frame} onLoad={()=>setLoading(false)} onError={()=>{setLoading(false);setError(true);}} title="Neighbour check" src={`/c/${encodeURIComponent(token)}${region==='UK'?'?region=UK':''}`} allow="camera" sandbox="allow-scripts allow-same-origin allow-forms"/></div></div></Drawer>;
}
export function CheckLinkProvider({state,onRead,children}:{state:EngineState;onRead:(result:ReadResult)=>void;children:ReactNode}) {
 const [link,setLink]=useState<(Link&{caseId:string;seenIds:string[]})|null>(null);
 const [notice,setNotice]=useState('');
 useEffect(()=>{setLink(null);setNotice('');},[state.caseId]);
 useEffect(()=>{if(link?.checkId&&state.observations.some(o=>o.checkId===link.checkId&&!link.seenIds.includes(o.id)))setLink(null);},[state.observations,link]);
 return <CheckContext.Provider value={value=>{setNotice('');setLink({...value,caseId:state.caseId,seenIds:state.observations.map(o=>o.id)});}}>{children}{notice&&<p role="status" className="panel demo-note">{notice}</p>}{link&&link.caseId===state.caseId&&(state.safety.status==='ok'||(link.demo&&state.safety.status==='incomplete'))&&<PhoneSimulator demoPreview={link.demo} region={link.demo?'IN':state.building.region} token={link.token} onAnswer={result=>{if(link.demo)setNotice('Demo phone completed — no evidence was added to this case.');else onRead(result);}} onClose={()=>setLink(null)}/>}</CheckContext.Provider>;
}
