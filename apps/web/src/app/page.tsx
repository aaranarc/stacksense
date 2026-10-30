'use client';
import { useState } from 'react';
import { engine, demo } from '../lib/adapters';
export default function Home() {
 const [state,setState]=useState(()=>engine.createCase(demo.states[0]!.building));
 return <main className="panel" style={{margin:32}}><h1>StackSense</h1><p>Demo data · Cached</p><p>Hero story step {state.caseId}</p><p>{state.observations.length} observations · Safety: {state.safety.status}</p><button className="primary" onClick={()=>setState(engine.applyObservations(state,[]))}>Next step ▸</button><button onClick={()=>setState(engine.createCase(state.building))}>Reset</button><p>{state.secondOpinion?.claim}</p><a href="/styleguide">Styleguide</a></main>;
}

