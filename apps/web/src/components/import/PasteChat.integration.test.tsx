import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{process.env.NEXT_PUBLIC_USE_MOCK_API='false';process.env.NEXT_PUBLIC_USE_MOCK_ENGINE='false';});
import {readFileSync} from 'node:fs';
import {Workspace} from '../Workspace';
import cached from '../../mocks/read-hero.json';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('loads bundled text through real preparation and lights the building with mocks off',async()=>{const text=readFileSync('public/demo/hero_blockA.txt','utf8');const fetchSpy=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>String(input)==='/demo/hero_blockA.txt'?new Response(text):new Response(JSON.stringify(cached)));render(<Workspace/>);fireEvent.click(screen.getByRole('button',{name:'Load demo chat'}));expect(await screen.findByRole('button',{name:'402 · victim'})).toBeTruthy();expect(fetchSpy.mock.calls.some(([path])=>path==='/api/read')).toBe(true);expect(screen.getAllByText(/Demo data/).length).toBeGreaterThan(0);expect(screen.queryByText(/Private browser preparation is unavailable/)).toBeNull();});
