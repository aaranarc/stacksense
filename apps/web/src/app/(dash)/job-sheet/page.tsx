import type { Metadata } from 'next';
import { Boundary, JobSheetSection } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Job Sheet · StackSense' };
export default function JobSheetPage() {
  return <>
    <Boundary><div className="page-grid one"><JobSheetSection /></div></Boundary>
    <NextLink from="/job-sheet" />
  </>;
}
