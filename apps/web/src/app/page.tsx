import {Suspense} from 'react';
import {Workspace} from '../components/Workspace';
export default function Home(){return <Suspense fallback={<main className="panel"><h1>StackSense</h1><p role="status">Loading your case…</p></main>}><Workspace/></Suspense>;}
