'use client';
import {Suspense,useEffect,useState} from 'react';
import {useParams} from 'next/navigation';
import {readReport} from '../../../lib/shareReport';
import {buildings,engine} from '../../../lib/adapters';
import {JobSheetContent} from '../../../components/tabs/JobSheetTab';
export default function SharedReport(){return <Suspense fallback={<p>Loading shared report…</p>}><ReadSharedReport/></Suspense>;}
function ReadSharedReport(){
 const {caseId}=useParams<{caseId:string}>();
 const [report,setReport]=useState<ReturnType<typeof readReport>|null>(null),[error,setError]=useState('');
 useEffect(()=>{try{const next=readReport(window.location.hash);if(next.job.caseId!==caseId&&encodeURIComponent(next.job.caseId)!==caseId)throw Error();setReport(next);}catch{setError('This report link is incomplete or invalid. Ask the sender to share it again.');}},[caseId]);
 const state=report?{...engine.createCase(buildings[report.job.region]),caseId:report.job.caseId,jobSheet:report.job}:null;
 return <main className="print-page"><h1>Shared case report</h1><p>Snapshot supplied by the sender, not an independently verified report. No chat or private photos are included.</p>{state?<><JobSheetContent state={state} demoData={report!.demoData}/><button className="no-print" onClick={()=>window.print()}>Print / Save PDF</button></>:<p role={error?'alert':'status'}>{error||'Loading report…'}</p>}</main>;
}
