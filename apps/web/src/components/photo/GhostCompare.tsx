'use client';
import {useState} from 'react';
import type {EngineState} from '@stacksense/contracts';
import {photoMedia} from '../../lib/media';
export function GhostCompare({state}:{state:EngineState}){
 const [extent,setExtent]=useState(100);
 const ordered=[...state.observations].sort((a,b)=>a.at.localeCompare(b.at));
 const latest=ordered.filter(o=>o.kind==='recapture'&&o.photoIds.length).at(-1);
 const previous=latest?ordered.filter(o=>o.flatId===latest.flatId&&o.zone===latest.zone&&o.at<latest.at&&o.photoIds.length).at(-1):undefined;
 const before=previous&&photoMedia(previous.photoIds[0]!),after=latest&&photoMedia(latest.photoIds[0]!);
 return <details className="ghost-compare"><summary>Compare recapture photos</summary>{!previous||!latest?<p>A previous photo and a dated recapture of the same surface are needed.</p>:!before||!after?<p>Photo preview unavailable in this browser session. Import the photos here to compare.</p>:<><p>Flat {latest.flatId} · previous {new Date(previous.at).toLocaleDateString('en-GB',{timeZone:'UTC'})} · new {new Date(latest.at).toLocaleDateString('en-GB',{timeZone:'UTC'})}</p>{(before.demo||after.demo)&&<p className="chip">Cached · Demo data · {before.illustration||after.illustration?'Illustration comparison; no visual change measured.':'Reference comparison; case timing and findings remain simulated.'}</p>}<div className="ghost-comparison"><img src={after.url} alt="New recapture"/><img src={before.url} alt="Previous photo at 35% opacity" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'contain',opacity:.35,clipPath:`inset(0 ${100-extent}% 0 0)`}}/></div><label>Compare previous photo<input aria-label="Compare previous photo" type="range" min="0" max="100" value={extent} onChange={e=>setExtent(Number(e.target.value))}/></label><p className="diagram-key">Previous photo at 35% opacity. Align the same surface; a photo cannot measure moisture.</p></>}</details>;
}
