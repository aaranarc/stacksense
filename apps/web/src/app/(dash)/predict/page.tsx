import type { Metadata } from 'next';
import { Boundary, PredictCard } from '../../../components/sections';
import { NextLink } from '../../../components/layout/Steps';
export const metadata: Metadata = { title: 'Predict & Prevent · StackSense' };
export default function PredictPage() {
  return <>
    <Boundary><div className="page-grid one"><PredictCard /></div></Boundary>
    <NextLink from="/predict" />
  </>;
}
