import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { EngineState } from '@stacksense/contracts';
import { engine } from '../../lib/adapters';
import { BreakIt, SIZES, seedFor } from './BreakIt';
afterEach(cleanup);

it('picks a seed whose simulated building has the chosen size', () => {
  for (const floors of Object.values(SIZES)) expect(engine.simulateBuilding(seedFor(floors, 1000)).building.floors).toBe(floors);
});

it('electrical hazard: emergency card appears and the diagnosis stops', () => {
  const onState = vi.fn();
  render(<BreakIt onState={onState} />);
  fireEvent.change(screen.getByLabelText('Hidden true source'), { target: { value: 'electrical_hazard' } });
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  expect(screen.getByRole('alert').textContent).toMatch(/Emergency — diagnosis stopped for safety/);
  expect(screen.queryByRole('button', { name: 'Let the simulator answer' })).toBeNull();
  expect((onState.mock.calls.at(-1)![0] as EngineState).safety.status).toBe('emergency');
});

it('simulator-answered game ends with the blame-the-flat-above comparison', () => {
  render(<BreakIt onState={() => {}} />);
  fireEvent.change(screen.getByLabelText('Hidden true source'), { target: { value: 'shared_shaft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Start' }));
  for (let i = 0; i < 10; i++) {
    const b = screen.queryByRole('button', { name: 'Let the simulator answer' });
    if (!b) break;
    fireEvent.click(b);
  }
  expect(screen.getByText(/would have said/).textContent).toMatch(/Hidden truth: shared shaft/);
});
