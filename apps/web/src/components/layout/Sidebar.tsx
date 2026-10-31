'use client';
import { useEffect, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, TriangleAlert, Building2, ClipboardList, Wrench, ShieldCheck, Scale, Settings } from 'lucide-react';
import { Logo } from '../ui/Card';

export const NAV: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'read', label: 'Incidents', icon: TriangleAlert },
  { id: 'building', label: 'Building View', icon: Building2 },
  { id: 'jobsheet', label: 'Job Sheets', icon: ClipboardList },
  { id: 'repair', label: 'Repairs', icon: Wrench },
  { id: 'predict', label: 'Predict & Prevent', icon: ShieldCheck },
  { id: 'judge', label: 'Judge Mode', icon: Scale },
];

export function scrollToSection(id: string) {
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (id === 'dashboard') { window.scrollTo?.({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); return; }
  document.getElementById(id)?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}

/** Scroll-to-section navigation; the section crossing the middle of the viewport is highlighted. */
export function Sidebar({ onSettings, open = false, onNavigate }: { onSettings: () => void; open?: boolean; onNavigate?: () => void }) {
  const [active, setActive] = useState('dashboard');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Map<string, boolean>();
    const observer = new IntersectionObserver(entries => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting);
      const first = NAV.slice(1).find(n => visible.get(n.id));
      setActive(window.scrollY < 40 ? 'dashboard' : first?.id ?? 'dashboard');
    }, { rootMargin: '-40% 0px -55% 0px' });
    for (const n of NAV.slice(1)) { const el = document.getElementById(n.id); if (el) observer.observe(el); }
    const top = () => { if (window.scrollY < 40) setActive('dashboard'); };
    window.addEventListener('scroll', top, { passive: true });
    return () => { observer.disconnect(); window.removeEventListener('scroll', top); };
  }, []);
  return <nav className={`sidebar${open ? ' open' : ''}`} aria-label="Sections">
    <a className="wordmark" href="#" onClick={e => { e.preventDefault(); scrollToSection('dashboard'); }}>
      <Logo /><strong>StackSense</strong><small>Find the probable source. Send the right trade. Finish the job.</small>
    </a>
    <ul>
      {NAV.map(({ id, label, icon: Icon }) => <li key={id}>
        <a href={`#${id === 'dashboard' ? '' : id}`} aria-current={active === id ? 'true' : undefined} className={active === id ? 'active' : undefined} title={label}
          onClick={e => { e.preventDefault(); setActive(id); scrollToSection(id); onNavigate?.(); }}>
          <Icon size={18} aria-hidden="true" /><span>{label}</span>
        </a>
      </li>)}
    </ul>
    <button className="nav-settings" onClick={() => { onSettings(); onNavigate?.(); }} title="Settings"><Settings size={18} aria-hidden="true" /><span>Settings</span></button>
  </nav>;
}
