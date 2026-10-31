import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EvalCard, verdict } from './EvalCard';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const row = (method: string, rightTrade: number) => ({ method, rightTrade, top1: [0.8, 0.8, 0.8], overclaim: 0, harmfulFlips: 0, checksToDecision: 1, hazardPass: 1, msPerCase: 1 });
const fixture = { generatedAt: '2026-10-31T12:00:00.000Z', label: 'team-built test, not field accuracy',
  sets: { simBuildings: 60, hardCases: 30, photos: 0, messages: 0 },
  rows: [row('Blame the flat above', 0.5), row('StackSense', 0.5)], robustness: [{ priorShiftPct: -20, top1: 0.7 }], ai: null,
  pending: [{ method: 'Single LLM, same evidence', reason: 'pending — not exported yet' }] };
const serve = (body: unknown, ok = true) => vi.stubGlobal('fetch', vi.fn(async () => ({ ok, status: ok ? 200 : 404, json: async () => body })));

it('verdict: tie, loss, win, n/a', () => {
  expect(verdict(0.5, 0.5, true)).toBe('tie');
  expect(verdict(0.4, 0.5, true)).toBe('loses');
  expect(verdict(2, 1, false)).toBe('loses');
  expect(verdict(0.6, 0.5, true)).toBeNull();
  expect(verdict(NaN, 1, true)).toBeNull();
});

it('renders StackSense first, the label, a tie chip and the pending row', async () => {
  serve(fixture);
  render(<EvalCard />);
  await waitFor(() => expect(screen.getByText('Team-built test, not field accuracy.')).toBeTruthy());
  const methods = screen.getAllByRole('rowheader').map((h) => h.textContent);
  expect(methods.slice(0, 2)).toEqual(['StackSense', 'Blame the flat above']);
  expect(screen.getAllByText('tie').length).toBeGreaterThan(0);
  expect(screen.getByText(/pending — not exported yet/)).toBeTruthy();
  expect(screen.getByText('AI evaluation pending — human labels in progress.')).toBeTruthy();
});

it('shows "numbers pending" when latest.json is missing', async () => {
  serve({}, false);
  render(<EvalCard />);
  await waitFor(() => expect(screen.getByText(/Numbers pending/)).toBeTruthy());
});
