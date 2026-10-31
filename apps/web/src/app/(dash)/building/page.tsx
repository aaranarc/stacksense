import type { Metadata } from 'next';
import { Boundary, BuildingCard, OddsCard, CheckCard, OpinionCard } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Building · StackSense' };
export default function BuildingPage() {
  return <>
    <Boundary>
      <div className="page-grid hero-row"><BuildingCard /><div className="side-col single"><OddsCard /></div></div>
      <div className="page-grid two"><CheckCard /><OpinionCard /></div>
    </Boundary>
    <NextLink from="/building" />
  </>;
}
