'use client';
import { useEffect, useState } from 'react';
import type { EngineState, Observation } from '@stacksense/contracts';
import type { LucideIcon } from 'lucide-react';
import { MessageSquareWarning, Camera, Gauge, Droplets, HardHat, Wrench, MessageSquare, Images } from 'lucide-react';
import { incidents } from '../feed/CaseFeed';

const KIND: Record<Observation['kind'], { icon: LucideIcon; text: string }> = {
  complaint: { icon: MessageSquareWarning, text: 'Report' }, denial: { icon: MessageSquare, text: 'Resident reply' },
  check_result: { icon: Camera, text: 'Check answered' }, meter_reading: { icon: Gauge, text: 'Meter reading' },
  moisture_reading: { icon: Droplets, text: 'Moisture reading' }, professional_finding: { icon: HardHat, text: 'Professional finding' },
  repair_done: { icon: Wrench, text: 'Repair recorded' }, recapture: { icon: Images, text: 'Day-14 recapture' },
};
const rtf = typeof Intl !== 'undefined' ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }) : null;
export function relative(at: string, now: number) {
  const s = (Date.parse(at) - now) / 1000, abs = Math.abs(s);
  const [v, u] = abs < 60 ? [s, 'second'] : abs < 3600 ? [s / 60, 'minute'] : abs < 86400 ? [s / 3600, 'hour'] : [s / 86400, 'day'];
  return rtf ? rtf.format(Math.round(v), u as Intl.RelativeTimeFormatUnit) : at;
}

/** The last three case-feed events, newest first. Times are relative to this device's clock after mount. */
export function RecentActivity({ state }: { state: EngineState }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => { setNow(Date.now()); const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  const rows = incidents(state.observations).slice(0, 3);
  if (!rows.length) return <div className="empty-state"><p>No activity yet.</p><small>Reports, checks and repairs appear here as they arrive.</small></div>;
  return <ul className="activity">{rows.map(o => { const k = KIND[o.kind], Icon = k.icon; return <li key={o.eventKey}>
    <span className="icon-tile" aria-hidden="true"><Icon size={16} /></span>
    <span className="activity-text">{k.text} · {o.zone.replaceAll('_', ' ')}{o.flatId ? ` (Flat ${o.flatId})` : ''}</span>
    <time dateTime={o.at} className="activity-time">{now === null || Date.parse(o.at) > now ? new Date(o.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) : relative(o.at, now)}</time>
  </li>; })}</ul>;
}
