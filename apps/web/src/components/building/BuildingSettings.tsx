'use client';
import {useState} from 'react';
import {useCase} from '../case/CaseProvider';
import {buildingFromSetup,engine,moistureThresholds} from '../../lib/adapters';
export function BuildingSettings(){
 const c=useCase(),{state}=c,b=state.building;
 const [name,setName]=useState(b.name),[floors,setFloors]=useState(String(b.floors)),[count,setCount]=useState('2'),[type,setType]=useState(b.archetype),[terrace,setTerrace]=useState(b.hasTerrace),[meters,setMeters]=useState(''),[lat,setLat]=useState(String(b.lat)),[lon,setLon]=useState(String(b.lon)),[threshold,setThreshold]=useState(String(b.moistureThresholdWme??moistureThresholds[b.region])),[error,setError]=useState(''),[notice,setNotice]=useState('');
 function saveThreshold(){setError('');if(threshold.trim()===''||!Number.isFinite(Number(threshold))||Number(threshold)<0||Number(threshold)>100){setError('Enter a moisture threshold from 0 to 100 %WME.');return;}c.setState(engine.applyObservations({...state,building:{...b,moistureThresholdWme:Number(threshold)}},[]));setNotice('Moisture threshold saved. Readiness has been recalculated from recorded readings.');}
 function setup(){setError('');try{
  const building=buildingFromSetup({id:`building-${crypto.randomUUID()}`,name,region:b.region,archetype:type,floors:Number(floors),flatsPerFloor:Number(count),hasTerrace:terrace,lat:Number(lat),lon:Number(lon),meterFlatIds:meters.split(/[\s,]+/).filter(Boolean)});
  c.startBuilding(building);setNotice('Building created. Import a report to start its first case.');
 }catch(e){setError(e instanceof Error?e.message:'Could not create this building.');}}
 return <section><h3>Building</h3><dl className="facts"><div><dt>Name</dt><dd>{b.name}</dd></div><div><dt>Type</dt><dd>{b.archetype.replaceAll('_',' ')}</dd></div><div><dt>Floors</dt><dd>{b.floors}</dd></div><div><dt>Flats</dt><dd>{b.flats.length}</dd></div></dl>
 <form className="settings-form" onSubmit={e=>{e.preventDefault();saveThreshold();}}><h4>Moisture threshold</h4><p className="note">Confirm the meter and surface threshold with your contractor. A photo never supplies a moisture reading.</p><label>Target %WME<input aria-label="Moisture threshold" type="number" min="0" max="100" step="0.1" required value={threshold} onChange={e=>setThreshold(e.target.value)}/></label><button className="outline-btn">Save threshold</button></form>
 <details><summary>Set up your own building</summary><p className="note">Saving starts an empty case. Regular floor layouts use flat numbers 101, 102…201, 202. Each flat has a bathroom; shared stacks and wall directions remain unassessed.</p><form className="settings-form" onSubmit={e=>{e.preventDefault();setup();}}>
 <label>Building name<input required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></label>
 <label>Building type<select value={type} onChange={e=>setType(e.target.value as typeof type)}><option value="GENERIC">Generic</option><option value="MUMBAI_RCC_1990S">Mumbai RCC, 1990s</option><option value="UK_1960S_BLOCK">UK block, 1960s</option></select></label>
 <label>Floors<input type="number" required min="1" max="50" value={floors} onChange={e=>setFloors(e.target.value)}/></label>
 <label>Flats per floor<input type="number" required min="1" max="20" value={count} onChange={e=>setCount(e.target.value)}/></label>
 <label>Latitude<input type="number" required min="-90" max="90" step="any" value={lat} onChange={e=>setLat(e.target.value)}/></label><label>Longitude<input type="number" required min="-180" max="180" step="any" value={lon} onChange={e=>setLon(e.target.value)}/></label>
 <label><input type="checkbox" checked={terrace} onChange={e=>setTerrace(e.target.checked)}/>Has a terrace</label>
 <label>Flats with an actual water meter<input value={meters} onChange={e=>setMeters(e.target.value)} placeholder="e.g. 202, 502; leave empty if none"/></label><button className="primary">Create building and start case</button>
 </form></details>{error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}</section>;
}
