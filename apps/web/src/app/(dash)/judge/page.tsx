import type { Metadata } from 'next';
import Link from 'next/link';
import { Boundary, BuildingCard, OddsCard, JudgeSection } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
import { STEPS } from '../../../lib/steps';
export const metadata: Metadata = { title: 'Judge Mode · StackSense' };
export default function JudgePage() {
  return <>
    <div className="page-grid judge-page">
      <JudgeSection />
      <div className="side-col single"><Boundary><BuildingCard /><OddsCard /></Boundary>
        <nav className="card step-links" aria-label="View each step"><h2>View each step →</h2><ol>{STEPS.map(s => <li key={s.n}><Link href={s.href}><span className="step-dot blue" aria-hidden="true">{s.n}</span>{s.title}</Link></li>)}</ol></nav>
      </div>
    </div>
    <NextLink from="/judge" />
  </>;
}
