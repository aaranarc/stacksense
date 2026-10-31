import type { EngineState, Flat, Hypothesis } from '@stacksense/contracts';
export const colours = { grey: '#9CA3AF', amber: '#D97706', red: '#DC2626', green: '#16A34A' };
export function visualStatus(label: string, kind: keyof typeof colours = 'grey', dashed = false) { return {colour: colours[kind], label, dashed}; }
export function statusOf(item: Flat | Hypothesis, state: EngineState) {
 const flatId = 'family' in item ? item.flatId : item.id;
 if (state.prediction.sameStack.some(p => p.flatId === flatId)) return visualStatus(`${flatId} · inspect`, 'amber', true);
 const observations = state.observations.filter(o => o.flatId === flatId);
 const dry = observations.find(o => o.kind === 'check_result' && o.surface === 'dry');
 if (dry) return visualStatus(`${flatId} · ${dry.zone === 'duct_wall' ? 'duct dry' : 'check passed'} · ${new Date(dry.at).toLocaleDateString('en-GB', {day:'numeric', month:'short',timeZone:'UTC'})}`, 'green');
 if (observations.some(o => o.kind === 'complaint')) return visualStatus(`${flatId} · victim`, 'amber');
 const leader = [...state.hypotheses].sort((a,b) => (state.posterior[b.id] ?? 0) - (state.posterior[a.id] ?? 0))[0];
 if (observations.length && leader?.flatId === flatId) return visualStatus(`${flatId} · leading source`, 'red', !state.stop.stopped);
 return visualStatus(`${flatId ?? item.id} · not assessed`, 'grey', !observations.length);
}
