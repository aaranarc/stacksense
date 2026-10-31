import { Suspense } from 'react';
import type { Metadata } from 'next';
import { IncidentsSafetyNotice, ReadCard, ReadFromRoute, SafetyCard } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Incidents · StackSense' };
export default function IncidentsPage() {
  return <>
    <IncidentsSafetyNotice/>
    <div className="page-grid wide-narrow"><Suspense fallback={<ReadCard />}><ReadFromRoute /></Suspense><SafetyCard /></div>
    <NextLink from="/incidents" />
  </>;
}
