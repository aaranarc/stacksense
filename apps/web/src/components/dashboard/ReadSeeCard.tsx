'use client';
import { useState, type ReactNode } from 'react';
import type { ChatMessage, EngineState, ReadResult } from '@stacksense/contracts';
import { MapPin, Sparkles, Layers, Images, ScanSearch, Paintbrush, ShieldCheck, MessageCircle } from 'lucide-react';
import { DataBadge } from '../states/DataBadge';
import { incidents } from '../feed/CaseFeed';
import { photoMedia } from '../../lib/media';

const words = (s: string) => s.replaceAll('_', ' ');
const time = (at: string) => new Date(at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

/** Read & See: the first report as a chat bubble, what the AI read (with its Live/Cached/Fallback badge), then the input and the incidents. */
export function ReadSeeCard({ state, read, messages, mode, demoData, onPhoto, input, feed }:
  { state: EngineState; read: ReadResult | null; messages: ChatMessage[]; mode?: ReadResult['mode']; demoData: boolean; onPhoto: (id: string) => void; input: ReactNode; feed: ReactNode }) {
  const [paste, setPaste] = useState(false);
  const obs = [...state.observations].sort((a, b) => a.at.localeCompare(b.at));
  const first = obs.find(o => o.kind === 'complaint' && o.photoIds.length) ?? obs.find(o => o.kind === 'complaint') ?? obs[0];
  const message = first ? messages.find(m => first.sourceMessageIds.includes(m.id)) ?? messages.find(m => m.attachmentIds.length) : undefined;
  const photos = [...new Set(obs.filter(o => o.kind === 'complaint').flatMap(o => o.photoIds))].slice(0, 3);
  const allPhotos = new Set(obs.flatMap(o => o.photoIds)).size;
  const zones = [...new Set(obs.map(o => o.zone).filter(z => z !== 'unclear' && z !== 'other'))];
  const surfaces = [...new Set(obs.map(o => o.surface).filter(s => s !== 'unclear'))];
  const sender = message && read ? read.senderMap[message.senderKey] : null;
  const n = incidents(state.observations).length;
  return <div className="read-see">
    {first ? <>
      <article className="bubble">
        <span className="bubble-avatar" aria-hidden="true"><MessageCircle size={18} /></span>
        <div className="bubble-body">
          <header><strong>{message ? `Resident ${message.senderKey}` : 'Report'}{(sender ?? first.flatId) ? ` (${sender ?? first.flatId})` : ''}</strong><time dateTime={message?.at ?? first.at}>{time(message?.at ?? first.at)} UTC</time></header>
          <p>{message?.text ?? first.rawText}</p>
          {photos.length > 0 && <div className="bubble-photos">{photos.map(id => { const m = photoMedia(id), o = obs.find(x => x.photoIds.includes(id)); return <button key={id} onClick={() => onPhoto(id)} aria-label={`Open photo ${id} from flat ${o?.flatId ?? 'unassigned'}`}>{m ? <img src={m.url} alt={`${m.illustration ? 'Demo illustration' : m.demo ? 'Own-photo demo reference' : 'Prepared photo'} for ${id}`} /> : <span>Preview unavailable</span>}</button>; })}</div>}
        </div>
      </article>
      <p className="location"><MapPin size={14} aria-hidden="true" />Location: {first.flatId ? `Flat ${first.flatId}` : 'Unassigned flat'} · {words(first.zone)}</p>
      <div className="extracted">
        <div className="extracted-head"><Sparkles size={15} aria-hidden="true" /><strong>AI extracted</strong><DataBadge mode={mode ?? (demoData ? 'cached' : undefined)} /></div>
        <ul>
          <li><Layers size={14} aria-hidden="true" />{n} incident{n === 1 ? '' : 's'}</li>
          <li><Images size={14} aria-hidden="true" />{allPhotos} photo{allPhotos === 1 ? '' : 's'}</li>
          {zones.length > 0 && <li><ScanSearch size={14} aria-hidden="true" />Areas: {zones.map(words).join(', ')}</li>}
          {surfaces.length > 0 && <li><Paintbrush size={14} aria-hidden="true" />Surfaces: {surfaces.map(words).join(', ')}</li>}
        </ul>
      </div>
      {read && <p className="privacy-chip"><ShieldCheck size={14} aria-hidden="true" />Pseudonymised · EXIF removed</p>}
      {paste ? input : <button className="link-btn" onClick={() => setPaste(true)}>Paste another chat ▸</button>}
    </> : input}
    <div id="incidents" className="incidents"><div className="incidents-scroll" tabIndex={0} aria-label="Incidents">{feed}</div></div>
  </div>;
}
