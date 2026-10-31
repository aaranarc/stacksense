import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('next/navigation', () => import('../../test/nextNavigation'));
vi.mock('next/link', () => import('../../test/nextLink'));
import { Sidebar, BottomTabs, NAV } from './Sidebar';
import { navigate, currentUrl } from '../../test/nextNavigation';
afterEach(cleanup);
it('links every page and marks the current route; Settings is its own page', () => {
  act(() => navigate('/'));
  render(<Sidebar />);
  for (const n of NAV) {
    const link = screen.getByRole('link', { name: n.label });
    expect(link.getAttribute('href')).toBe(n.href);
    fireEvent.click(link);
    expect(currentUrl()).toBe(n.href);
    expect(screen.getByRole('link', { name: n.label }).getAttribute('aria-current')).toBe('page');
    expect(NAV.filter(o => o.href !== n.href).every(o => screen.getByRole('link', { name: o.label }).getAttribute('aria-current') === null)).toBe(true);
  }
  fireEvent.click(screen.getByRole('link', { name: 'Settings' }));
  expect(currentUrl()).toBe('/settings');
  expect(screen.getByRole('link', { name: 'Settings' }).getAttribute('aria-current')).toBe('page');
});
it('phone tabs: four pages plus More, which opens the full list', () => {
  act(() => navigate('/repairs'));
  const more = vi.fn();
  render(<BottomTabs moreOpen={false} onMore={more} />);
  expect(screen.getAllByRole('link').map(a => a.textContent)).toEqual(['Dashboard', 'Incidents', 'Building', 'Job Sheet']);
  const button = screen.getByRole('button', { name: 'More' });
  expect(button.className).toContain('active');
  fireEvent.click(button); expect(more).toHaveBeenCalledOnce();
});
