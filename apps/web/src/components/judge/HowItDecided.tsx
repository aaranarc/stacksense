'use client';
import type { EngineState } from '@stacksense/contracts';
// C-T05 renders state.trace as plain steps.
export function HowItDecided({ state }: { state: EngineState }) {
  return <p>{state.trace.length} decision steps recorded.</p>;
}
