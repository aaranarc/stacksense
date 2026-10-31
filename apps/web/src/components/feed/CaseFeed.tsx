'use client';
import { useState } from 'react';
import type { ChatMessage,EngineState,Observation } from '@stacksense/contracts';
import { statusOf,visualStatus } from '../../lib/visual';
import {photoMedia} from '../../lib/media';
import { LedgerDrawer } from './LedgerDrawer';
export function incidents(observations:Observation[]) {
 const events=new Map<string,Observation>();
 for(const observation of observations){const previous=events.get(observation.eventKey);const latest=previous&&previous.at>observation.at?previous:observation;events.set(observation.eventKey,{...latest,photoIds:[...new Set([...(previous?.photoIds??[]),...observation.photoIds])]});}
 return [...events.values()].sort((a,b)=>b.at.localeCompare(a.at));
}
export function CaseFeed({state,messages=[],selectedFlat,onPhoto}:{state:EngineState;messages?:ChatMessage[];selectedFlat:string|null;onPhoto:(id:string)=>void}) {
 const [ledger,setLedger]=useState(false);
 const rows=incidents(state.observations).filter(o=>!selectedFlat||o.flatId===selectedFlat);
 return <section className="case-feed"><button className="feed-heading" onClick={()=>setLedger(true)}><h2>Case Feed</h2><span>Evidence ledger ▸</span></button>{!rows.length?<p>{selectedFlat?'No incidents recorded for this flat.':'No incidents yet.'}</p>:rows.map(o=>{const flat=state.building.flats.find(f=>f.id===o.flatId),status=flat?statusOf(flat,state):visualStatus('Unassigned');return <article className="feed-row" key={o.eventKey}><div className="source-label"><strong><span className="status-dot" style={{background:status.colour}}/>{o.flatId??'Unassigned'}</strong><span className="provenance">{o.provenance}</span></div><p>{o.zone.replaceAll('_',' ')} · {o.surface.replaceAll('_',' ')}</p><p className="feed-status" style={{color:status.colour}}>{status.label}</p><time dateTime={o.at}>{new Date(o.at).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'UTC'})} UTC</time><div className="thumbnails">{o.photoIds.map(id=><button key={id} onClick={()=>onPhoto(id)} aria-label={`Open photo ${id} from flat ${o.flatId??'unassigned'}`}>{photoMedia(id)?<img src={photoMedia(id)!.url} alt={`${photoMedia(id)!.demo?'Demo illustration':'Prepared photo'} for ${id}`} width="56" height="48"/>:<span>Preview unavailable</span>}<span>{id}</span></button>)}</div></article>;})}{ledger&&<LedgerDrawer state={state} messages={messages} onPhoto={id=>{setLedger(false);onPhoto(id);}} onClose={()=>setLedger(false)}/>}</section>;
}


