'use client';
import type { Building,ReadResult } from '@stacksense/contracts';
export function SenderChips({senderMap,building,onAssign}:{senderMap:ReadResult['senderMap'];building:Building;onAssign:(sender:string,flatId:string)=>void}) {
 const unresolved=Object.entries(senderMap).filter(([,flat])=>flat===null);
 if(!unresolved.length)return null;
 return <section aria-label="Unresolved senders" style={{marginTop:24}}><h3>Which flat?</h3>{unresolved.map(([sender])=><label key={sender} className="sender-chip">{sender} → <select aria-label={`${sender} flat`} defaultValue="" onChange={e=>{if(e.target.value)onAssign(sender,e.target.value);}}><option value="" disabled>Flat ▾</option>{building.flats.map(flat=><option key={flat.id} value={flat.id}>{flat.id}</option>)}</select></label>)}</section>;
}
