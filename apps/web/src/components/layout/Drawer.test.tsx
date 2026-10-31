import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import {Drawer} from './Drawer';
afterEach(cleanup);
it('closes with Escape even when asynchronous work moved focus outside a disabled control',()=>{const close=vi.fn();const {unmount}=render(<Drawer title="Photo" onClose={close}><input aria-label="Pending edge contrast" disabled/></Drawer>);expect(document.body.style.overflow).toBe('hidden');(document.activeElement as HTMLElement).blur();fireEvent.keyDown(document.body,{key:'Escape'});expect(close).toHaveBeenCalledOnce();unmount();expect(document.body.style.overflow).not.toBe('hidden');});
it('lets only the top drawer handle Escape',()=>{const parent=vi.fn(),child=vi.fn();render(<><Drawer title="Evidence" onClose={parent}>Evidence</Drawer><Drawer title="Photo" onClose={child}>Photo</Drawer></>);fireEvent.keyDown(document.body,{key:'Escape'});expect(child).toHaveBeenCalledOnce();expect(parent).not.toHaveBeenCalled();expect(screen.getAllByRole('dialog')).toHaveLength(2);});
