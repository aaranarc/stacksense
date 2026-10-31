import { readFileSync } from 'node:fs';
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.hoisted(() => { process.env.NEXT_PUBLIC_USE_MOCK_API = 'false'; process.env.NEXT_PUBLIC_USE_MOCK_ENGINE = 'false'; });
vi.mock('next/navigation', () => import('../test/nextNavigation'));
vi.mock('next/link', () => import('../test/nextLink'));
import { TestApp, ROUTES } from '../test/TestApp';
import { navigate, currentUrl } from '../test/nextNavigation';
import { STORAGE_KEY } from './case/CaseProvider';
import { NEXT, HASH_ROUTES } from './layout/Steps';
import { PLAY_MS } from './judge/ScenarioPicker';
import cached from '../mocks/read-hero.json';

const demoChat = () => vi.spyOn(globalThis, 'fetch').mockImplementation(async input => String(input) === '/demo/hero_blockA.txt' ? new Response(readFileSync('public/demo/hero_blockA.txt', 'utf8')) : new Response(JSON.stringify(cached)));
const heading = (name: string | RegExp) => screen.getByRole('heading', { name });
beforeEach(() => { sessionStorage.clear(); window.location.hash = ''; navigate('/'); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

it('each route renders its own sections and a Next link that walks steps 1→7', () => {
  const expected: Record<string, (string | RegExp)[]> = {
    '/': ['Probable Source', 'Recent activity'],
    '/incidents': ['Read & See', 'Safety Gate', 'Case Feed'],
    '/building': ['Ask the Right Check', 'Second Opinion', 'Probable Source'],
    '/job-sheet': ['Job Sheet'],
    '/repairs': ['Repair → Dry → Paint'],
    '/predict': ['Predict & Prevent'],
    '/judge': ['Judge Mode', 'View each step →', 'Probable Source'],
    '/settings': ['Settings'],
  };
  render(<TestApp />);
  for (const path of Object.keys(ROUTES)) {
    act(() => navigate(path));
    for (const name of expected[path]!) expect(heading(name)).toBeTruthy();
    const next = screen.getByRole('link', { name: new RegExp(`^Next: ${NEXT[path]!.label.replace(/[→&]/g, '.')}`) });
    expect(next.getAttribute('href')).toBe(NEXT[path]!.href);
  }
  act(() => navigate('/'));
  expect(screen.getByRole('navigation', { name: 'Case steps' }).querySelectorAll('li')).toHaveLength(7);
  expect(screen.queryByRole('heading', { name: 'Read & See' })).toBeNull();
});

it('dashboard empty state offers Judge Mode → Play and Load demo chat; Play keeps running across pages', () => {
  vi.useFakeTimers();
  render(<TestApp />);
  const banner = screen.getByRole('region', { name: 'Start here' });
  expect(within(banner).getByRole('link', { name: 'Load demo chat' }).getAttribute('href')).toBe('/incidents?demo=1');
  fireEvent.click(within(banner).getByRole('button', { name: /Judge Mode → Play/ }));
  expect(currentUrl()).toBe('/judge');
  act(() => { vi.advanceTimersByTime(PLAY_MS); });
  expect(screen.getByText(/Demo running · step 1\/7/)).toBeTruthy();
  act(() => navigate('/incidents'));
  act(() => { vi.advanceTimersByTime(PLAY_MS); });
  expect(screen.getByText(/Demo running · step 2\/7/)).toBeTruthy();
  act(() => navigate('/job-sheet'));
  act(() => { vi.advanceTimersByTime(PLAY_MS); });
  expect(screen.getByText(/Demo running · step 3\/7/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'Pause demo' }));
  act(() => { vi.advanceTimersByTime(PLAY_MS * 3); });
  expect(screen.getByText(/Demo paused · step 3\/7/)).toBeTruthy();
});

it('keeps the case when navigating /incidents → /job-sheet → back, and across a reload; Reset clears it everywhere', async () => {
  demoChat(); navigate('/incidents');
  const { unmount } = render(<TestApp />);
  fireEvent.click(screen.getByRole('button', { name: 'Load demo chat' }));
  const before = (await screen.findAllByRole('button', { name: /^Open photo / })).length;
  expect(before).toBeGreaterThan(0);
  act(() => navigate('/job-sheet'));
  expect(heading('Job Sheet')).toBeTruthy();
  expect(screen.queryByRole('button', { name: /^Open photo / })).toBeNull();
  act(() => navigate('/incidents'));
  expect(screen.getAllByRole('button', { name: /^Open photo / })).toHaveLength(before);
  expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY)!).state.observations.length).toBeGreaterThan(0);
  unmount();
  render(<TestApp />);
  expect(await screen.findAllByRole('button', { name: /^Open photo / })).toHaveLength(before);
  fireEvent.click(screen.getByRole('button', { name: 'Reset case' }));
  expect(screen.queryByRole('button', { name: /^Open photo / })).toBeNull();
  expect(sessionStorage.getItem(STORAGE_KEY)).not.toContain('"observations":[{');
  act(() => navigate('/'));
  expect(screen.getByRole('region', { name: 'Start here' })).toBeTruthy();
});

it('redirects old single-page hash links to their new routes', () => {
  window.location.hash = '#repair';
  render(<TestApp />);
  expect(currentUrl()).toBe('/repairs');
  expect(heading('Repair → Dry → Paint')).toBeTruthy();
  for (const [hash, path] of Object.entries(HASH_ROUTES)) {
    act(() => { window.location.hash = `#${hash}`; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    expect(currentUrl()).toBe(path);
  }
});

it('flat filter: the case feed says which flat it shows and offers all incidents', async () => {
  demoChat(); navigate('/incidents');
  render(<TestApp />);
  fireEvent.click(screen.getByRole('button', { name: 'Load demo chat' }));
  await screen.findAllByRole('button', { name: /^Open photo / });
  act(() => navigate('/building'));
  fireEvent.click(screen.getByRole('button', { name: '402 · victim' }));
  act(() => navigate('/incidents'));
  expect(screen.getByText(/Showing flat 402 \(\d+ of \d+ incidents\) — select another flat/)).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'show all incidents' }));
  expect(screen.queryByText(/Showing flat 402 \(/)).toBeNull();
});
