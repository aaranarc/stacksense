'use client';
import { useState } from 'react';
import type { EngineState } from '@stacksense/contracts';
import { HardHat, Ban, OctagonX, Info } from 'lucide-react';
import { colours, tint } from '../../lib/visual';
import { regionalText } from '../../lib/labels';
import { Drawer } from '../layout/Drawer';
import { JobSheetActions, JobSheetContent, JOB_FOOTER } from '../tabs/JobSheetTab';

const PAIRS: Record<string, string> = { waterproofer_tiler: 'Waterproofer / tiler', plasterer_decorator: 'Plasterer / decorator' };
const trade = (t: string) => PAIRS[t] ?? (t.charAt(0).toUpperCase() + t.slice(1)).replaceAll('_', ' ');

/** Summary of the engine Job Sheet; the full sheet (verify, access, photos, links, UK trail) opens in a drawer. */
export function JobSheetCard({ state, demoData }: { state: EngineState; demoData: boolean }) {
  const [full, setFull] = useState(false);
  const job = state.jobSheet;
  if (state.safety.status === 'emergency') return <div className="empty-state"><p>Diagnosis stopped for safety.</p></div>;
  if (!job) return <div className="empty-state"><p>No Job Sheet yet — complete the checks.</p><small>Send, don’t-send and what not to break appear here.</small></div>;
  const r = job.region, breaks = job.notJustifiedYet.filter(i => /^breaking /.test(i)).map(i => i.replace(/^breaking /, ''));
  const source = regionalText(job.probableSource.replace(/^Probable /, ''), r);
  return <div className="job-card">
    {demoData && <p className="chip-soft">Demo data — case evidence and timing are simulated.</p>}
    {job.send.map(t => <div key={t.trade} className="status-row big" style={{ borderLeftColor: colours.green, background: tint(colours.green) }}><span className="icon-tile" style={{ background: tint(colours.green, .16), color: colours.green }} aria-hidden="true"><HardHat size={18} /></span><div><strong style={{ color: '#067647' }}>Send: {trade(t.trade)}</strong><span>{regionalText(t.why, r)}</span></div></div>)}
    {job.dontSend.map(t => <div key={t.trade} className="status-row big" style={{ borderLeftColor: colours.red, background: tint(colours.red) }}><span className="icon-tile" style={{ background: tint(colours.red, .14), color: colours.red }} aria-hidden="true"><Ban size={18} /></span><div><strong style={{ color: '#B42318' }}>Don’t send: {trade(t.trade)}</strong><span>{regionalText(t.why, r)}</span></div></div>)}
    {breaks.length > 0 && <div className="status-row big" style={{ borderLeftColor: colours.red, background: tint(colours.red) }}><span className="icon-tile" style={{ background: tint(colours.red, .14), color: colours.red }} aria-hidden="true"><OctagonX size={18} /></span><div><strong style={{ color: '#B42318' }}>Do NOT break</strong>{breaks.map(b => <span key={b}>{regionalText(b, r)}</span>)}</div></div>}
    <JobSheetActions state={state} demoData={demoData} />
    <div className="info-row"><Info size={16} aria-hidden="true" /><span><strong>Probable source:</strong> {source} · Verify on site before starting work.</span></div>
    <button className="link-btn" onClick={() => setFull(true)}>Full job sheet ▸</button>
    <p className="card-foot">{JOB_FOOTER}</p>
    {full && <Drawer title="Job Sheet" onClose={() => setFull(false)}><JobSheetContent state={state} demoData={demoData} /></Drawer>}
  </div>;
}
