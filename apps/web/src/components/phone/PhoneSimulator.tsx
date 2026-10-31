'use client';
import {createContext,useContext,useEffect,useRef,useState} from 'react';
import type {ReactNode} from 'react';
import {ReadResult} from '@stacksense/contracts';
import type {EngineState} from '@stacksense/contracts';
import {rememberPhoto} from '../../lib/media';
import {Drawer} from '../layout/Drawer';
type Link={token:string;url:string;waUrl:string};
const CheckContext=createContext<(link:Link)=>void>(()=>{});
export const useCheckLink=()=>useContext(CheckContext);
export function PhoneSimulator({token,onAnswer,onClose}:{token:string;onAnswer:(result:ReadResult)=>void;onClose:()=>void}) {
 const frame=useRef<HTMLIFrameElement>(null);
 useEffect(()=>{const receive=(event:MessageEvent)=>{if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||event.data?.type!=='stacksense-check-complete'||event.data?.token!==token)return;const result=ReadResult.safeParse(event.data.result);if(result.success){if(Array.isArray(event.data.previews))for(const preview of event.data.previews){if(preview&&typeof preview.id==='string'&&typeof preview.url==='string'&&result.data.photoLabels.some(label=>label.photoId===preview.id))rememberPhoto(preview.id,preview.url);}onAnswer(result.data);onClose();}};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);},[token,onAnswer,onClose]);
 return <Drawer title="Phone simulator · neighbour check" onClose={onClose}><p>The frame closes when the check answer arrives.</p><div className="phone-frame"><iframe ref={frame} title="Neighbour check" src={`/c/${encodeURIComponent(token)}`} allow="camera" sandbox="allow-scripts allow-same-origin allow-forms"/></div></Drawer>;
}
export function CheckLinkProvider({state,onRead,children}:{state:EngineState;onRead:(result:ReadResult)=>void;children:ReactNode}) {
 const [link,setLink]=useState<(Link&{caseId:string})|null>(null);
 useEffect(()=>setLink(null),[state.caseId]);
 return <CheckContext.Provider value={value=>setLink({...value,caseId:state.caseId})}>{children}{link&&link.caseId===state.caseId&&state.safety.status==='ok'&&<PhoneSimulator token={link.token} onAnswer={onRead} onClose={()=>setLink(null)}/>}</CheckContext.Provider>;
}

