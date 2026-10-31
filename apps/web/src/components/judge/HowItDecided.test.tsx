import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { engine } from '../../lib/adapters';
import { HowItDecided, traceLines } from './HowItDecided';
afterEach(cleanup);

it('renders the hero trace as plain before → after steps', () => {
  const sc = engine.scenarios.happy;
  let state = engine.createCase(sc.building, { now: sc.steps[0]![0]!.at });
  for (const step of sc.steps) state = engine.applyObservations(state, step, { photoLabels: (sc as { photoLabels?: never }).photoLabels });
  const lines = traceLines(state);
  expect(lines.length).toBeGreaterThan(0);
  expect(lines.some((l) => /302 duct wall dry → .*\d+% → \d+%/.test(l))).toBe(true);
  render(<HowItDecided state={state} />);
  expect(screen.getAllByRole('listitem').length).toBe(lines.length);
});
