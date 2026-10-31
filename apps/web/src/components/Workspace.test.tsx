import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
vi.mock('../lib/adapters',async importOriginal=>{const original=await importOriginal<typeof import('../lib/adapters')>();const {mockEngine}=await import('../mocks/mockEngine');return {...original,engine:mockEngine};});
import { Workspace } from './Workspace';
afterEach(cleanup);
it('clears the chat input when the case is reset',()=>{render(<Workspace/>);fireEvent.change(screen.getByRole('textbox',{name:'WhatsApp or agent chat'}),{target:{value:'Demo draft'}});fireEvent.click(screen.getByRole('button',{name:/^Reset$/}));expect((screen.getByRole('textbox',{name:'WhatsApp or agent chat'}) as HTMLTextAreaElement).value).toBe('');expect(screen.getByRole('status').textContent).toContain('Safety questions unanswered');});

