'use client';
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCase } from '../case/CaseProvider';
import { GlobalPhotoViewer } from '../sections';
import { Sidebar, BottomTabs } from './Sidebar';
import { TopBar } from './TopBar';
import { DemoPill, HASH_ROUTES } from './Steps';

/** Sidebar + top bar + page; bottom tabs on phones. Old "/#section" links land on the page that now holds the section. */
export function AppShell({ children }: { children: ReactNode }) {
  const c = useCase(); const path = usePathname() ?? '/'; const router = useRouter();
  const [more, setMore] = useState(false);
  useEffect(() => {
    const go = () => { const to = HASH_ROUTES[window.location.hash.slice(1)]; if (to) router.replace(to); };
    go(); window.addEventListener('hashchange', go);
    return () => window.removeEventListener('hashchange', go);
  }, [router]);
  return <div className="app">
    <Sidebar open={more} onNavigate={() => setMore(false)} />
    {more && <button className="nav-backdrop" aria-label="Close menu" onClick={() => setMore(false)} />}
    <div className="main">
      <TopBar region={c.region} buildingName={c.state.building.name} onRegion={c.changeRegion} demoData={c.isDemo} onReset={c.reset} pill={<DemoPill />} />
      <main key={path} className="page">{children}</main>
    </div>
    <BottomTabs moreOpen={more} onMore={() => setMore(!more)} />
    <GlobalPhotoViewer />
  </div>;
}
