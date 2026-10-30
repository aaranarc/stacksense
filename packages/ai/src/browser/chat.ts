import type { ChatMessage } from "@stacksense/contracts";

const ascii = (text: string) => text.replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x0966));
const header = /^\[?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([ap]m)?\]?\s*(?:-\s*)?(.*)$/i;

export function parseWhatsAppExport(text: string, opts: { dateOrder?: "DMY" | "MDY"; offsetMinutes?: number } = {}): ChatMessage[] {
  const lines = ascii(text).replace(/[\u200e\u200f\u202f]/g, " ").split(/\r?\n/);
  let order = opts.dateOrder;
  if (!order) for (const line of lines) {
    const m = line.match(header); if (!m) continue;
    if (+m[1]! > 12) { order = "DMY"; break; }
    if (+m[2]! > 12) { order = "MDY"; break; }
  }
  order ??= "DMY";
  const result: ChatMessage[] = []; let current: ChatMessage | undefined;
  for (const line of lines) {
    const m = line.match(header);
    if (!m) { if (current && line) current.text += `\n${line}`; continue; }
    current = undefined;
    const body = m[8]!;
    const sender = body.match(/^([^:]+):\s?(.*)$/);
    if (!sender || /end-to-end encrypted|security code changed|created (?:this )?group|added you/i.test(body)) continue;
    const day = +(order === "DMY" ? m[1]! : m[2]!); const month = +(order === "DMY" ? m[2]! : m[1]!);
    const year = +m[3]! < 100 ? 2000 + +m[3]! : +m[3]!;
    let hour = +m[4]!; const minute = +m[5]!, second = +(m[6] ?? 0);
    if (m[7]) { if (hour < 1 || hour > 12) continue; hour = hour % 12 + (m[7].toLowerCase() === "pm" ? 12 : 0); }
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    if (date.getUTCDate() !== day || date.getUTCMonth() !== month - 1 || hour > 23 || minute > 59 || second > 59) continue;
    const id = `msg-${result.length + 1}`;
    current = { id, at: new Date(date.getTime() - (opts.offsetMinutes ?? 330) * 60000).toISOString(), senderKey: sender[1]!.trim(), text: sender[2]!, attachmentIds: [] };
    result.push(current);
  }
  for (const m of result) {
    m.attachmentIds = [...new Set(m.text.match(/IMG-[\w-]+\.(?:jpg|jpeg|png)/gi) ?? [])];
    if (/<Media omitted>|image omitted/i.test(m.text) && !m.attachmentIds.length) m.attachmentIds.push(`media-${m.id}`);
  }
  return result;
}

export function pseudonymise(messages: ChatMessage[]): { messages: ChatMessage[]; keyMap: Record<string, string> } {
  const senders = [...new Set(messages.map(m => m.senderKey))];
  const mapping = new Map(senders.map((sender, i) => [sender, /^S\d+$/.test(sender) ? sender : `S${String(i + 1).padStart(2, "0")}`]));
  const names = senders.filter(s => !/^S\d+$/.test(s) && !/^[+\d\s()-]+$/.test(s)).sort((a,b) => b.length-a.length);
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const redact = (text: string) => {
    let value = ascii(text).replace(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/gi, "[EMAIL]")
      .replace(/(?:\+\d{1,3}[\s-]*)?(?:\d[\s()-]*){7,15}/g, "[PHONE]");
    for (const name of names) value = value.replace(new RegExp(escape(name), "gi"), "[NAME]");
    return value.replace(/\b[A-Z][a-z]+(?:[ \t]+[A-Z][a-z]+)+\b/g, "[NAME]").replace(/\b(?:Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g, "[NAME]");
  };
  return { messages: messages.map(m => ({ ...m, senderKey: mapping.get(m.senderKey)!, text: redact(m.text), attachmentIds: [...m.attachmentIds] })),
    keyMap: Object.fromEntries([...mapping].map(([name, key]) => [key, name])) };
}
