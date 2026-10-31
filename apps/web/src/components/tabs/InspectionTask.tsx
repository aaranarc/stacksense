'use client';
import {useEffect,useState} from 'react';
import {z} from 'zod';
const Task=z.object({owner:z.string().max(120),due:z.string().regex(/^$|^\d{4}-\d{2}-\d{2}$/),completed:z.string().nullable()});
export function InspectionTask({caseId,id,title,defaultDue=''}:{caseId:string;id:string;title:string;defaultDue?:string}){
 const key=`stacksense:task:${caseId}:${id}`;
 const [task,setTask]=useState({owner:'',due:defaultDue,completed:null as string|null}),[loaded,setLoaded]=useState(false),[error,setError]=useState('');
 useEffect(()=>{try{const raw=sessionStorage.getItem(key);if(raw)setTask(Task.parse(JSON.parse(raw)));}catch{setError('Saved task details were unavailable.');}setLoaded(true);},[key]);
 useEffect(()=>{if(loaded)try{sessionStorage.setItem(key,JSON.stringify(task));}catch{setError('Storage unavailable; changes last until this page closes.');}},[key,task,loaded]);
 function calendar(){try{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(task.due))throw Error();
  const escape=(text:string)=>text.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;');
  const next=new Date(Date.parse(`${task.due}T12:00:00Z`)+86400000).toISOString().slice(0,10);
  const content=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//StackSense//Inspection//EN','BEGIN:VEVENT',`UID:${encodeURIComponent(caseId+':'+id)}@stacksense`,`DTSTAMP:${new Date().toISOString().replaceAll(/[-:]/g,'').replace(/\.\d+Z$/,'Z')}`,`DTSTART;VALUE=DATE:${task.due.replaceAll('-','')}`,`DTEND;VALUE=DATE:${next.replaceAll('-','')}`,`SUMMARY:${escape(title)}`,`DESCRIPTION:${escape('Inspection first. Add findings to the case evidence. Owner: '+(task.owner||'Unassigned'))}`,'BEGIN:VALARM','TRIGGER:-P1D','ACTION:DISPLAY','DESCRIPTION:Inspection due tomorrow','END:VALARM','END:VEVENT','END:VCALENDAR',''].join('\r\n');
  const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='stacksense-inspection.ics';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch{setError('Choose a valid due date before adding a calendar reminder.');}}
 return <fieldset className="inspection-task"><legend className="sr-only">Inspection task details</legend><label>Owner<input aria-label={`Owner for ${title}`} value={task.owner} maxLength={120} onChange={e=>setTask({...task,owner:e.target.value})}/></label><label>Due date<input aria-label={`Due date for ${title}`} type="date" value={task.due} onChange={e=>setTask({...task,due:e.target.value})}/></label><label><input aria-label={`Complete ${title}`} type="checkbox" checked={!!task.completed} onChange={e=>setTask({...task,completed:e.target.checked?new Date().toISOString():null})}/>Inspection completed{task.completed?` · ${task.completed.slice(0,10)}`:''}</label><button className="ghost-btn sm" disabled={!task.due} onClick={calendar}>Add calendar reminder</button><small>Saved in this browser session. Task tracking does not add diagnostic evidence.</small>{error&&<p role="alert">{error}</p>}</fieldset>;
}
