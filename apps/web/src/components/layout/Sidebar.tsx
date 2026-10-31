'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, TriangleAlert, Building2, ClipboardList, Wrench, ShieldCheck, Scale, Settings, Ellipsis } from 'lucide-react';
import { Logo } from '../ui/Card';

export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/incidents', label: 'Incidents', icon: TriangleAlert },
  { href: '/building', label: 'Building View', icon: Building2 },
  { href: '/job-sheet', label: 'Job Sheets', icon: ClipboardList },
  { href: '/repairs', label: 'Repairs', icon: Wrench },
  { href: '/predict', label: 'Predict & Prevent', icon: ShieldCheck },
  { href: '/judge', label: 'Judge Mode', icon: Scale },
];
const isActive = (path: string, href: string) => href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);

/** Page navigation; the current route is highlighted. On phones it opens from the bottom bar's "More". */
export function Sidebar({ open = false, onNavigate }: { open?: boolean; onNavigate?: () => void }) {
  const path = usePathname() ?? '/';
  const item = (href: string, label: string, Icon: LucideIcon, className?: string) => <Link href={href} title={label} onClick={onNavigate}
    aria-current={isActive(path, href) ? 'page' : undefined} className={[className, isActive(path, href) ? 'active' : ''].filter(Boolean).join(' ') || undefined}>
    <Icon size={18} aria-hidden="true" /><span>{label}</span></Link>;
  return <nav id="app-nav" className={`sidebar${open ? ' open' : ''}`} aria-label="Pages">
    <Link className="wordmark" href="/" onClick={onNavigate}><Logo /><strong>StackSense</strong><small>Find the probable source. Send the right trade. Finish the job.</small></Link>
    <ul>{NAV.map(n => <li key={n.href}>{item(n.href, n.label, n.icon)}</li>)}</ul>
    {item('/settings', 'Settings', Settings, 'nav-settings')}
  </nav>;
}

const TABS = [NAV[0]!, NAV[1]!, { ...NAV[2]!, label: 'Building' }, { ...NAV[3]!, label: 'Job Sheet' }];
/** Phone navigation: four pages plus "More" (opens the full page list). */
export function BottomTabs({ moreOpen, onMore }: { moreOpen: boolean; onMore: () => void }) {
  const path = usePathname() ?? '/';
  const inMore = !TABS.some(t => isActive(path, t.href));
  return <nav className="bottom-tabs" aria-label="Main pages">
    {TABS.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={isActive(path, href) ? 'page' : undefined}><Icon size={20} aria-hidden="true" /><span>{label}</span></Link>)}
    <button aria-expanded={moreOpen} aria-controls="app-nav" className={inMore ? 'active' : undefined} onClick={onMore}><Ellipsis size={20} aria-hidden="true" /><span>More</span></button>
  </nav>;
}
