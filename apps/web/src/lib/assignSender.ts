import type { Observation,ChatMessage } from '@stacksense/contracts';
export function remapSender(observations:Observation[],sender:string,flatId:string,messages:ChatMessage[]):Observation[] {
 const messageIds=new Set(messages.filter(m=>m.senderKey===sender).map(m=>m.id));
 // Cached hero readings use stable pseudonymous source IDs.
 messageIds.add(`msg-${sender}`);
 return observations.map(o=>o.sourceMessageIds.some(id=>messageIds.has(id))?{...o,flatId}:o);
}
