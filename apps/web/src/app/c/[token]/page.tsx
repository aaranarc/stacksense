'use client';
import {Suspense} from 'react';
import {useParams,useSearchParams} from 'next/navigation';
import {NeighbourFlow} from '../../../components/phone/NeighbourFlow';
function Check(){const {token}=useParams<{token:string}>(),query=useSearchParams();const region=query.get('region')==='UK'?'UK':'IN';return <NeighbourFlow key={`${token}-${region}`} token={token} region={region}/>;}
export default function NeighbourPage(){return <Suspense fallback={<p>Loading your check…</p>}><Check/></Suspense>;}
