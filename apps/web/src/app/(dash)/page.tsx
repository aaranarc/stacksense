import { Boundary, BuildingCard, OddsCard, ActivityCard } from '../../components/sections';
import { NextLink, ProgressStrip, StartBanner } from '../../components/layout/Steps';
export default function DashboardPage() {
  return <>
    <StartBanner />
    <Boundary><div className="page-grid hero-row"><BuildingCard /><div className="side-col"><OddsCard /><ActivityCard /></div></div></Boundary>
    <ProgressStrip />
    <NextLink from="/" />
  </>;
}
