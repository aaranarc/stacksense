import { render, fireEvent, screen, cleanup, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { EngineState } from '@stacksense/contracts';
import { engine, demo } from '../../lib/adapters';
import { JudgePanel } from './JudgePanel';
afterEach(cleanup);
const start = (): EngineState => engine.createCase(demo.states[0]!.building);

it('shows the five calm sections with a labelled What-if placeholder', () => {
  render(<JudgePanel state={start()} onState={() => {}} />);
  for (const name of ['What-if', 'Scenarios', 'Evaluation', 'How it decided', 'Break it']) expect(screen.getByText(name)).toBeTruthy();
  expect(screen.getByText('What-if sliders — coming from B')).toBeTruthy();
});

it('steps a scenario through the engine and resets it', () => {
  const onState = vi.fn();
  render(<JudgePanel state={start()} onState={onState} />);
  fireEvent.change(screen.getByLabelText('Scenario'), { target: { value: 'electrical_hazard' } });
  fireEvent.click(screen.getByRole('button', { name: 'Next step ▸' }));
  const last = onState.mock.calls.at(-1)![0] as EngineState;
  expect(last.safety.status).toBe('emergency');
  expect(screen.getByText(/Emergency — diagnosis stopped/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
  expect((onState.mock.calls.at(-1)![0] as EngineState).observations).toHaveLength(0);
});

it('plays the hero scenario to its end', () => {
  vi.useFakeTimers();
  const onState = vi.fn();
  render(<JudgePanel state={start()} onState={onState} />);
  fireEvent.click(screen.getByRole('button', { name: 'Play' }));
  for (let i = 0; i < 20; i++) act(() => { vi.advanceTimersByTime(1200); });
  vi.useRealTimers();
  const last = onState.mock.calls.at(-1)![0] as EngineState;
  expect(last.secondOpinion).not.toBeNull();
  expect(screen.getByRole('button', { name: 'Next step ▸' }).hasAttribute('disabled')).toBe(true);
});
