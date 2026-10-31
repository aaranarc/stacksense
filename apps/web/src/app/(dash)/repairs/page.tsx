import type { Metadata } from 'next';
import { Boundary, RepairCard } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Repairs · StackSense' };
export default function RepairsPage() {
  return <>
    <Boundary><div className="page-grid one"><RepairCard /></div></Boundary>
    <NextLink from="/repairs" />
  </>;
}
