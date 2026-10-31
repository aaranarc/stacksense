import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{process.env.NEXT_PUBLIC_USE_MOCK_API='false';process.env.NEXT_PUBLIC_USE_MOCK_ENGINE='false';});
import {readFileSync} from 'node:fs';
import {ReadResult} from '@stacksense/contracts';
import {Workspace} from '../Workspace';
import cached from '../../mocks/read-hero.json';
afterEach(()=>{cleanup();vi.restoreAllMocks();});
it('loads bundled text through real preparation and lights the building with mocks off',async()=>{const text=readFileSync('public/demo/hero_blockA.txt','utf8');const fetchSpy=vi.spyOn(globalThis,'fetch').mockImplementation(async input=>String(input)==='/demo/hero_blockA.txt'?new Response(text):new Response(JSON.stringify(cached)));render(<Workspace/>);fireEvent.click(screen.getByRole('button',{name:'Load demo chat'}));expect(await screen.findByRole('button',{name:'402 · victim'})).toBeTruthy();expect(fetchSpy.mock.calls.some(([path])=>path==='/api/read')).toBe(true);expect(screen.getAllByText(/Demo data/).length).toBeGreaterThan(0);expect(screen.queryByText(/Private browser preparation is unavailable/)).toBeNull();});
it('renders the real cached demo-chat attachment filenames as approved thumbnails and viewer photos',async()=>{
 const text=readFileSync('public/demo/hero_blockA.txt','utf8'),bundle=JSON.parse(readFileSync('../../fixtures-ai/cache/bundled.json','utf8')) as Record<string,unknown>;
 const cached=Object.values(bundle).map(value=>ReadResult.safeParse(value)).find(result=>result.success&&result.data.observations.some(o=>o.photoIds.includes('IMG-20261030-WA0402.jpg'))&&result.data.observations.some(o=>o.photoIds.includes('IMG-20261030-WA0202.jpg')));
 if(!cached?.success)throw new Error('Canonical cached chat with both attachment IDs is missing');
 vi.spyOn(globalThis,'fetch').mockImplementation(async input=>String(input)==='/demo/hero_blockA.txt'?new Response(text):new Response(JSON.stringify({...cached.data,mode:'cached',warnings:['Cached']})));
 render(<Workspace/>);fireEvent.click(screen.getByRole('button',{name:'Load demo chat'}));
 const cases=[['IMG-20261030-WA0402.jpg','402','/demo/photos/ceiling_402_own.jpg'],['IMG-20261030-WA0202.jpg','202','/demo/photos/window_202_own.jpg']] as const;
 for(const [id,flat,path] of cases){const buttons=await screen.findAllByRole('button',{name:`Open photo ${id} from flat ${flat}`});expect(within(buttons[0]!).getByRole('img').getAttribute('src')).toBe(path);fireEvent.click(buttons[0]!);expect(screen.getByAltText(`Own-photo demo reference ${id}`).getAttribute('src')).toBe(path);expect(screen.getByText('Own-photo reference; case evidence and timing remain simulated.')).toBeTruthy();fireEvent.click(screen.getByRole('button',{name:`Close Photo ${id}`}));}
});
