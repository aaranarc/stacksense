import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
import { SenderChips } from './SenderChips';
import { demo } from '../../lib/adapters';
import { remapSender } from '../../lib/assignSender';
afterEach(cleanup);
it('assigns an unresolved sender with one selection',()=>{const assign=vi.fn();render(<SenderChips senderMap={{S07:null,S01:'402'}} building={demo.states[0]!.building} onAssign={assign}/>);expect(screen.getAllByRole('combobox')).toHaveLength(1);fireEvent.change(screen.getByLabelText('S07 flat'),{target:{value:'402'}});expect(assign).toHaveBeenCalledWith('S07','402');});
it('only remaps observations linked to that sender',()=>{const observations=structuredClone(demo.states[1]!.observations);observations[0]!.sourceMessageIds=['msg-S07'];expect(remapSender(observations,'S07','502',[]).map(o=>o.flatId)).toEqual(['502','202']);expect(observations[0]!.flatId).toBe('402');});
