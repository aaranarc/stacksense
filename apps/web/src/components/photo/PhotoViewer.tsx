'use client';
import { useState } from 'react';
import { SurfaceState,Zone } from '@stacksense/contracts';
import type { PhotoLabel } from '@stacksense/contracts';
import {edgeContrastPhoto} from '../../lib/adapters';
import {photoMedia} from '../../lib/media';
import { Drawer } from '../layout/Drawer';
export function PhotoViewer({photoId,label,onClose,onCorrect}:{photoId:string;label:PhotoLabel|undefined;onClose:()=>void;onCorrect:(label:PhotoLabel,changed:boolean)=>void}) {
 const [editing,setEditing]=useState(false),[surface,setSurface]=useState(label?.surface??'unclear'),[zone,setZone]=useState(label?.zone??'unclear'),[confirmed,setConfirmed]=useState(false);
 const media=photoMedia(photoId),[edge,setEdge]=useState(false),[edgeUrl,setEdgeUrl]=useState(''),[edgeBusy,setEdgeBusy]=useState(false),[edgeError,setEdgeError]=useState('');
 async function contrast(enabled:boolean){
  setEdgeError('');if(!enabled){setEdge(false);return;}if(edgeUrl){setEdge(true);return;}if(!media)return;
  setEdge(true);setEdgeBusy(true);try{setEdgeUrl(await edgeContrastPhoto(media.url));setEdge(true);}catch{setEdge(false);setEdgeError('Edge contrast is unavailable. The original image remains visible.');}finally{setEdgeBusy(false);}
 }
 const contrasted=edge&&!!edgeUrl,url=contrasted?edgeUrl:media?.url;
 return <Drawer title={/\.\w{3,4}$/.test(photoId)?`Photo ${photoId}`:`Photo · ${(label?.zone??'unclear').replaceAll('_',' ')}`} onClose={onClose}>
  {media?.demo?<><p className="chip">Cached · Demo data</p><p>{media.illustration?'Illustration, not a real photo.':'Own-photo reference; case evidence and timing remain simulated.'}</p><p className="diagram-key">{media.label}</p></>:media?<p>{media.label}</p>:null}
  {!media?<p>Photo preview unavailable in this browser session. The evidence label remains recorded.</p>:<>
   <label className="edge-control"><input type="checkbox" checked={edge} disabled={edgeBusy} onChange={e=>void contrast(e.target.checked)}/>Edge contrast, not moisture.</label>
   {edgeBusy&&<p role="status">Preparing edge contrast…</p>}{edgeError&&<p role="alert">{edgeError}</p>}
   <figure className="photo-whole"><img src={url} alt={`${media.illustration?'Demo illustration':media.demo?'Own-photo demo reference':'Whole photo'} ${photoId}${contrasted?' — edge contrast':''}`}/>{label?.boxes.map((box,i)=><span key={i} className="photo-box" style={{left:`${box.x*100}%`,top:`${box.y*100}%`,width:`${box.w*100}%`,height:`${box.h*100}%`}} title={box.label}><span>{box.label}</span></span>)}</figure>
  </>}
  <h3>{label?`AI says: ${label.surface.replaceAll('_',' ')} · ${label.zone.replaceAll('_',' ')}`:'No photo label yet.'}</h3>
  {label&&<>
   <p>Quality: {label.quality.replaceAll('_',' ')}{label.humanCorrected?' · Human-corrected':''}</p>
   {media&&<div className="detail-crops">{label.boxes.map((box,i)=><figure key={i}><div style={{width:160,height:120,overflow:'hidden',position:'relative'}}><img src={url} alt={`Detail crop: ${box.label}`} style={{position:'absolute',maxWidth:'none',width:`${100/Math.max(box.w,.01)}%`,height:`${100/Math.max(box.h,.01)}%`,left:`${-box.x/Math.max(box.w,.01)*100}%`,top:`${-box.y/Math.max(box.h,.01)*100}%`}}/></div><figcaption>{box.label}</figcaption></figure>)}</div>}
   <button onClick={()=>{onCorrect({...label,humanCorrected:true},false);setConfirmed(true);}}>✓ correct</button> <button onClick={()=>setEditing(true)}>wrong?</button>
   {confirmed&&<p role="status">Label confirmed.</p>}
   {editing&&<form onSubmit={e=>{e.preventDefault();const changed=surface!==label.surface||zone!==label.zone;onCorrect({...label,surface,zone,humanCorrected:true},changed);setEditing(false);setConfirmed(true);}}><label>Surface<select aria-label="Correct surface" value={surface} onChange={e=>setSurface(SurfaceState.parse(e.target.value))}>{SurfaceState.options.map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select></label><label>Zone<select aria-label="Correct zone" value={zone} onChange={e=>setZone(Zone.parse(e.target.value))}>{Zone.options.map(z=><option key={z} value={z}>{z.replaceAll('_',' ')}</option>)}</select></label><button className="primary" type="submit">Apply correction</button></form>}
  </>}
  <p className="diagram-key">A photo cannot measure moisture.</p>
 </Drawer>;
}
