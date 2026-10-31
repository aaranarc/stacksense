import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
import { CaseFeed,incidents } from './CaseFeed';
import { demo } from '../../lib/adapters';
afterEach(cleanup);
it('deduplicates an incident and filters to the selected flat',()=>{const state=structuredClone(demo.states[2]!);state.observations.push({...state.observations[0]!,id:'duplicate'});expect(incidents(state.observations)).toHaveLength(2);const open=vi.fn();render(<CaseFeed state={state} selectedFlat="402" onPhoto={open}/>);expect(screen.getAllByRole('article')).toHaveLength(1);fireEvent.click(screen.getByRole('button',{name:'Open photo P402 from flat 402'}));expect(open).toHaveBeenCalledWith('P402');});
