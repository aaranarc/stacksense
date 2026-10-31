import { render,screen,fireEvent,cleanup } from '@testing-library/react';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
vi.mock('../lib/adapters',async importOriginal=>{const original=await importOriginal<typeof import('../lib/adapters')>();const {mockEngine}=await import('../mocks/mockEngine');return {...original,engine:mockEngine};});
vi.mock('next/navigation',()=>import('../test/nextNavigation'));
vi.mock('next/link',()=>import('../test/nextLink'));
import { TestApp } from '../test/TestApp';
import { navigate } from '../test/nextNavigation';
beforeEach(()=>sessionStorage.clear());
afterEach(cleanup);
it('clears the chat input when the case is reset',()=>{navigate('/incidents');render(<TestApp/>);fireEvent.change(screen.getByRole('textbox',{name:'WhatsApp or agent chat'}),{target:{value:'Demo draft'}});fireEvent.click(screen.getByRole('button',{name:'Reset case'}));expect((screen.getByRole('textbox',{name:'WhatsApp or agent chat'}) as HTMLTextAreaElement).value).toBe('');expect(screen.getByRole('status').textContent).toContain('Safety questions unanswered');});

it('keeps the scenario controls mounted when the published case changes',()=>{vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}'));navigate('/judge');render(<TestApp/>);expect(screen.getAllByRole('link',{name:'Judge Mode'}).length).toBeGreaterThan(0);fireEvent.click(screen.getByRole('button',{name:'Next step ▸'}));expect(screen.getByText(/Step 1 \/ /)).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:'Next step ▸'}));expect(screen.getByText(/Step 2 \/ /)).toBeTruthy();expect(screen.getAllByText(/Demo data/).length).toBeGreaterThan(0);});
