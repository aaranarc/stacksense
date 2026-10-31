import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it} from 'vitest';
import {demo} from '../../lib/adapters';
import {GhostCompare} from './GhostCompare';
afterEach(cleanup);
it('overlays the previous dated photo at 35% and lets the user reveal the new image',()=>{render(<GhostCompare state={demo.states[10]!}/>);const previous=screen.getByAltText('Previous photo at 35% opacity');expect(previous.style.opacity).toBe('0.35');fireEvent.change(screen.getByRole('slider',{hidden:true}),{target:{value:'20'}});expect(previous.style.clipPath).toBe('inset(0 80% 0 0)');expect(screen.getByText(/no visual change measured/)).toBeTruthy();});
it('does not invent a previous image for an empty case',()=>{render(<GhostCompare state={demo.states[0]!}/>);expect(screen.getByText(/dated recapture/)).toBeTruthy();expect(screen.queryByRole('slider',{hidden:true})).toBeNull();});
