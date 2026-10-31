import { render, screen, within, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';
import { runScenario, scenarios } from '@stacksense/engine';
import { BuildingHero, flatCallouts } from './BuildingHero';
import { statusOf, colours } from '../../lib/visual';
import { demo } from '../../lib/adapters';
import { ukDemo } from '../../lib/regionDemo';
afterEach(cleanup);
const hero = () => runScenario(scenarios.happy);
const shapes = () => within(screen.getByRole('group', { name: /isometric building view/ })).getAllByRole('button');

it('draws exactly one interactive shape per flat, named by its engine status', () => {
  const state = hero();
  render(<BuildingHero state={state} selected={null} onSelect={() => {}} />);
  expect(shapes()).toHaveLength(state.building.flats.length);
  for (const f of state.building.flats) expect(screen.getByRole('button', { name: statusOf(f, state).label })).toBeTruthy();
});

it('gives every non-grey flat a visible text label from the engine status', () => {
  const state = hero();
  render(<BuildingHero state={state} selected={null} onSelect={() => {}} />);
  const coloured = state.building.flats.filter(f => statusOf(f, state).colour !== colours.grey);
  expect(coloured.length).toBeGreaterThan(0);
  const items = within(screen.getByRole('list', { name: 'Flat statuses' })).getAllByRole('listitem');
  expect(items).toHaveLength(coloured.length);
  for (const f of coloured) expect(items.some(li => li.textContent!.includes(statusOf(f, state).label))).toBe(true);
});

it('draws the source path dashed and labelled hypothetical until a professional finding documents it', () => {
  const { container, unmount } = render(<BuildingHero state={demo.states[9]!} selected={null} onSelect={() => {}} />);
  expect(container.querySelector('.hero-path')!.getAttribute('stroke-dasharray')).toBeTruthy();
  expect(screen.getByText('probable path (hypothetical)')).toBeTruthy();
  unmount();
  const documented = render(<BuildingHero state={hero()} selected={null} onSelect={() => {}} />);
  expect(documented.container.querySelector('.hero-path')!.getAttribute('stroke-dasharray')).toBeNull();
  expect(screen.getByText('documented path')).toBeTruthy();
});

it('selects a flat by click and keyboard', () => {
  const picked: string[] = [];
  const state = hero();
  render(<BuildingHero state={state} selected={null} onSelect={id => picked.push(id)} />);
  const leader = screen.getByRole('button', { name: /502 · probable source/ });
  fireEvent.click(leader); fireEvent.keyDown(leader, { key: 'Enter' });
  expect(picked).toEqual(['502', '502']);
});

it('works with the UK block: UK flat labels and no India flat ids', () => {
  const state = ukDemo();
  render(<BuildingHero state={state} selected={null} onSelect={() => {}} />);
  expect(shapes()).toHaveLength(state.building.flats.length);
  expect(flatCallouts(state).every(c => c.label.startsWith('Flat '))).toBe(true);
  expect(screen.queryByText(/\b[1-6]0[12]\b/)).toBeNull();
});
