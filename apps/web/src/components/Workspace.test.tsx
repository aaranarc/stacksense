import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,expect,it,vi } from 'vitest';
vi.mock('../lib/adapters',async importOriginal=>{const original=await importOriginal<typeof import('../lib/adapters')>();const {mockEngine}=await import('../mocks/mockEngine');return {...original,engine:mockEngine};});
import { Workspace } from './Workspace';
afterEach(cleanup);
it('clears the chat input when the case is reset',()=>{render(<Workspace/>);fireEvent.change(screen.getByRole('textbox',{name:'WhatsApp or agent chat'}),{target:{value:'Demo draft'}});fireEvent.click(screen.getByRole('button',{name:'Reset case'}));expect((screen.getByRole('textbox',{name:'WhatsApp or agent chat'}) as HTMLTextAreaElement).value).toBe('');expect(screen.getByRole('status').textContent).toContain('Safety questions unanswered');});

it('keeps the scenario controls mounted when the published case changes',()=>{vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}'));render(<Workspace/>);expect(screen.getByRole('link',{name:'Judge Mode'})).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Next step ▸'}));expect(screen.getByText(/Step 1 \/ /)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Next step ▸'}));expect(screen.getByText(/Step 2 \/ /)).toBeTruthy();expect(screen.getAllByText(/Demo data/).length).toBeGreaterThan(0);});
