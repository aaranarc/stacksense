import type { ChatMessage } from "@stacksense/contracts";
export function resolveSenders(messages: ChatMessage[]): Record<string,string|null> {
  const found = new Map<string,Set<string>>();
  for (const message of messages) {
    const text = message.text.replace(/[०-९]/g,d=>String(d.charCodeAt(0)-0x966));
    const values = found.get(message.senderKey) ?? new Set<string>();
    for (const m of text.matchAll(/(?:\bflat\s*(?:[A-Z]-)?|\b[A-Z]-|मी\s*)(\d{1,4})|\((\d{1,4})\)|\b(\d{1,4})\s+here\b/gi)) values.add(m[1] ?? m[2] ?? m[3]!);
    found.set(message.senderKey,values);
  }
  return Object.fromEntries([...found].map(([sender,flats])=>[sender,flats.size===1?[...flats][0]!:null]));
}
