import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Sidebar, NAV } from './Sidebar';
afterEach(cleanup);
it('scrolls to each section anchor and marks it current; Settings opens the drawer', () => {
  const settings = vi.fn();
  render(<><Sidebar onSettings={settings} />{NAV.slice(1).map(n => <section key={n.id} id={n.id} />)}</>);
  for (const n of NAV.slice(1)) {
    const spy = vi.fn(); document.getElementById(n.id)!.scrollIntoView = spy;
    fireEvent.click(screen.getByRole('link', { name: n.label }));
    expect(spy).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: n.label }).getAttribute('aria-current')).toBe('true');
  }
  fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
  expect(settings).toHaveBeenCalledOnce();
});
