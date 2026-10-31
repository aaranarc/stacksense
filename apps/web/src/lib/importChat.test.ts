import {afterEach,expect,it,vi} from 'vitest';
vi.hoisted(()=>{process.env.NEXT_PUBLIC_USE_MOCK_API='false';process.env.NEXT_PUBLIC_USE_MOCK_ENGINE='false';});
import {readFileSync} from 'node:fs';
import {prepareChat,readChat} from './importChat';
import {browser,demo} from './adapters';
import result from '../mocks/read-hero.json';
import canonical from '../../public/demo/hero_request.json';
afterEach(()=>vi.restoreAllMocks());
const chat=readFileSync('public/demo/hero_blockA.txt','utf8');
it('uses the real text pipeline with mocks off and skips every photo helper',async()=>{expect(demo.enabled).toBe(false);const strip=vi.spyOn(browser,'stripExif'),quality=vi.spyOn(browser,'qualityCheck');const request=vi.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify(result),{status:200}));const read=await readChat(chat,[],true);expect(read.observations.length).toBeGreaterThan(0);expect(strip).not.toHaveBeenCalled();expect(quality).not.toHaveBeenCalled();const sent=JSON.parse(String(request.mock.calls[0]![1]!.body));expect(sent).toEqual(canonical);expect(sent).not.toHaveProperty('keyMap');expect(JSON.stringify(sent)).not.toContain('Demo Resident');});
it('omits an unstripped photo with a warning while retaining the chat',async()=>{vi.spyOn(browser,'stripExif').mockRejectedValue(new Error('Canvas unavailable'));const prepared=await prepareChat(chat,[new File(['photo'],'photo.jpg',{type:'image/jpeg'})]);expect(prepared.request.messages).toHaveLength(7);expect(prepared.request.photos).toHaveLength(0);expect(prepared.warnings[0]).toContain('metadata could not be removed');});
it('keeps the bundled demo usable after a preparation error without sending raw text',async()=>{vi.spyOn(browser,'pseudonymise').mockImplementation(()=>{throw new Error('Unavailable');});const prepared=await prepareChat('private raw text',[],browser,true);expect(prepared.request.messages).toEqual(canonical.messages);expect(prepared.warnings.join(' ')).toContain('Fallback');expect(JSON.stringify(prepared.request)).not.toContain('private raw text');});
it('keeps quality failures non-blocking after metadata removal',async()=>{vi.spyOn(browser,'stripExif').mockResolvedValue('data:image/jpeg;base64,AA==');vi.spyOn(browser,'qualityCheck').mockRejectedValue(new Error('Quality unavailable'));const prepared=await prepareChat(chat,[new File(['photo'],'photo.jpg',{type:'image/jpeg'})]);expect(prepared.request.photos).toHaveLength(1);expect(prepared.warnings.join(' ')).toContain('quality was not assessed');});

it('accepts a plain report with pseudonymisation and does not send an empty read',async()=>{
 const prepared=await prepareChat('Flat 402 bathroom ceiling stain. No ceiling sagging.',[]);
 expect(prepared.request.messages).toHaveLength(1);
 expect(prepared.request.messages[0]?.senderKey).toBe('S01');
 const network=vi.spyOn(globalThis,'fetch');
 await expect(readChat('',[])).rejects.toThrow(/report|chat/i);
 expect(network).not.toHaveBeenCalled();
});
