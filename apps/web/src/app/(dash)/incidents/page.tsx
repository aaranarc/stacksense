import { Suspense } from 'react';
import type { Metadata } from 'next';
import { Boundary, ReadCard, ReadFromRoute, SafetyCard } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Incidents · StackSense' };
export default function IncidentsPage() {
  return <>
    <Boundary><div className="page-grid wide-narrow"><Suspense fallback={<ReadCard />}><ReadFromRoute /></Suspense><SafetyCard /></div></Boundary>
    <NextLink from="/incidents" />
  </>;
}
