'use client';
import { Suspense,useEffect,useRef,useState } from 'react';
import { useParams } from 'next/navigation';
import type { EngineState } from '@stacksense/contracts';
import { loadCaseFromRoute,loadCaseDemoFromRoute } from '../../../lib/caseStore';
import { JobSheetContent } from '../../../components/tabs/JobSheetTab';
export default function PrintPage(){return <Suspense fallback={<p>Loading Job Sheet…</p>}><PrintCase/></Suspense>;}
function PrintCase(){const params=useParams<{caseId:string}>(),[state,setState]=useState<EngineState|null>(null),[demoData,setDemoData]=useState<boolean|undefined>(undefined),[ready,setReady]=useState(false),[scale,setScale]=useState(1),ref=useRef<HTMLDivElement>(null);useEffect(()=>{setState(loadCaseFromRoute(params.caseId));setDemoData(loadCaseDemoFromRoute(params.caseId));setReady(true);},[params.caseId]);useEffect(()=>{if(state&&ref.current)setScale(Math.min(1,990/ref.current.scrollHeight));},[state]);return <main className="print-page"><div className="no-print"><h1>Print Job Sheet</h1><p>Choose Save as PDF in the print dialog. This view uses an A4 page.</p><button disabled={!state?.jobSheet||state.safety.status==='emergency'} onClick={()=>window.print()}>Print / Save PDF</button></div>{state?<div ref={ref} style={{zoom:scale}}><JobSheetContent state={state} demoData={demoData}/></div>:<p>{ready?'This Job Sheet is unavailable in this browser. Open Download PDF from the case first.':'Loading Job Sheet…'}</p>}</main>;}
