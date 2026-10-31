'use client';
import {Suspense} from 'react';
import {useParams} from 'next/navigation';
import {NeighbourFlow} from '../../../components/phone/NeighbourFlow';
function Check(){const {token}=useParams<{token:string}>();return <NeighbourFlow key={token} token={token}/>;}
export default function NeighbourPage(){return <Suspense fallback={<p>Loading your check…</p>}><Check/></Suspense>;}

