// Test double for next/link: a plain anchor that navigates the in-memory router.
import type { AnchorHTMLAttributes } from 'react';
import { navigate } from './nextNavigation';
export default function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; scroll?: boolean; prefetch?: boolean }) {
  const { scroll: _s, prefetch: _p, ...props } = rest as typeof rest & { scroll?: boolean; prefetch?: boolean };
  return <a href={href} {...props} onClick={e => { onClick?.(e); if (!e.defaultPrevented) { e.preventDefault(); navigate(href); } }} />;
}
