'use client';
import { Database, Menu, RotateCcw } from 'lucide-react';
import { Logo } from '../ui/Card';
/** Region toggle, demo-data chip and case reset. Section navigation lives in the Sidebar. */
export function TopBar({ onReset, region = 'IN', buildingName = 'Block A', onRegion, demoData = false, onMenu, menuOpen = false }:
  { onReset: () => void; region?: 'IN' | 'UK'; buildingName?: string; onRegion?: (region: 'IN' | 'UK') => void; demoData?: boolean; onMenu?: () => void; menuOpen?: boolean }) {
  return <header className="topbar">
    <div className="topbar-left">
      {onMenu && <button className="icon-btn menu-btn" aria-label="Menu" aria-expanded={menuOpen} onClick={onMenu}><Menu size={20} aria-hidden="true" /></button>}
      <span className="topbar-brand"><Logo size={28} /><strong>StackSense</strong></span>
      <span className="topbar-building"><span className="eyebrow">Building</span>{buildingName}</span>
    </div>
    <div className="topbar-right">
      <div className="segmented" role="group" aria-label="Region">
        <button aria-pressed={region === 'IN'} onClick={() => onRegion?.('IN')}><span aria-hidden="true">🇮🇳</span> IN</button>
        <button aria-pressed={region === 'UK'} disabled={!onRegion} onClick={() => onRegion?.('UK')}><span aria-hidden="true">🇬🇧</span> UK</button>
      </div>
      {demoData && <span className="demo-chip" title="Case evidence and timing are simulated for this demo."><Database size={15} aria-hidden="true" />Demo data</span>}
      <button className="ghost-btn" onClick={onReset}><RotateCcw size={15} aria-hidden="true" /><span className="btn-label">Reset case</span></button>
    </div>
  </header>;
}
