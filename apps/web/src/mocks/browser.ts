import type { ChatMessage } from '@stacksense/contracts';
export const mockBrowser={
 parseWhatsAppExport(text:string):ChatMessage[] {
  return text.split(/\r?\n/).filter(Boolean).map((line,i)=>{const match=line.match(/^(?:\[)?(\d{1,2})\/(\d{1,2})\/(\d{2,4}),?\s+(\d{1,2}):(\d{2})(?:\])?\s*-?\s*([^:]+):\s*(.*)$/);return {id:`msg-${i}`,at:match?new Date(Date.UTC(Number(match[3])<100?2000+Number(match[3]):Number(match[3]),Number(match[2])-1,Number(match[1]),Number(match[4]),Number(match[5]))).toISOString():'2026-10-31T04:30:00.000Z',senderKey:match?.[6]?.trim()??'S01',text:match?.[7]??line,attachmentIds:[]};});
 },
 pseudonymise(messages:ChatMessage[]):ChatMessage[] {
  const senders=[...new Set(messages.map(m=>m.senderKey))];
  return messages.map(m=>({...m,senderKey:`S${String(senders.indexOf(m.senderKey)+1).padStart(2,'0')}`,text:senders.reduce((text,sender,i)=>text.split(sender).join(`S${String(i+1).padStart(2,'0')}`),m.text).replace(/\+?\d[\d\s()-]{8,}\d/g,'[phone removed]')}));
 },
 async stripExif(file:File):Promise<string> {
  // Local-only mock. Nothing processed here is allowed to reach a live API.
  return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(new Error('Could not read image'));reader.readAsDataURL(file);});
 },
 async qualityCheck(_dataUrl:string) {return {warnings:['Photo quality is not assessed by the demo helper.']};},
};
