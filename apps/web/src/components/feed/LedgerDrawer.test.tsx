import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {demo} from '../../lib/adapters';
import {LedgerDrawer} from './LedgerDrawer';
afterEach(cleanup);
it('keeps incident updates in chronological order and links their sources and corrected photos',()=>{const state=structuredClone(demo.states[2]!);const original=state.observations[0]!;state.observations=[{...original,id:'later',at:'2026-10-31T12:00:00Z'}, {...original,id:'earlier',at:'2026-10-30T12:00:00Z',sourceMessageIds:['source-1']}];state.photoLabels[0]!.humanCorrected=true;const onPhoto=vi.fn();render(<LedgerDrawer state={state} messages={[{id:'source-1',at:original.at,senderKey:'S01',text:'Pseudonymised source text',attachmentIds:[]}]} onPhoto={onPhoto} onClose={()=>{}}/>);expect(screen.getAllByRole('article')[0]!.textContent).toContain('earlier');expect(screen.getByText('Pseudonymised source text')).toBeTruthy();expect(screen.getAllByText('Human-corrected label').length).toBeGreaterThan(0);fireEvent.click(screen.getAllByRole('button',{name:`Open photo ${original.photoIds[0]}`})[0]!);expect(onPhoto).toHaveBeenCalledWith(original.photoIds[0]);expect(screen.getAllByText('simulated · Demo data')).toHaveLength(2);});
it('explains an empty ledger',()=>{render(<LedgerDrawer state={demo.states[0]!} onClose={()=>{}}/>);expect(screen.getByText(/No evidence recorded yet/)).toBeTruthy();});

