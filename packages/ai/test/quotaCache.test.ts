import {expect,it,vi} from 'vitest';
import {createReadService} from '../src/read/pipeline';
import {createCache} from '../src/read/cache';
import {createAdapter} from '../src/llm/adapter';
import {ProviderHttpError} from '../src/llm/errors';
import {modeWarnings} from '../src/read/status';
const input={buildingId:'new-quota-test',messages:[{id:'quota-message',at:'2026-10-31T08:00:00.000Z',senderKey:'S01',text:'402 here, bathroom ceiling stain',attachmentIds:[]}],photos:[]};
it('labels quota exhaustion honestly and does not spend more requests on uncached photos',async()=>{
 const provider=vi.fn(async()=>{throw new ProviderHttpError(429)});
 const result=await createReadService({adapter:createAdapter({provider}),cache:createCache({bundled:{}}),preparePhoto:async p=>p})({...input,photos:[{id:'one',dataUrl:'data:image/jpeg;base64,YQ=='},{id:'two',dataUrl:'data:image/jpeg;base64,Yg=='}]});
 expect(result.mode).toBe('fallback');expect(result.warnings).toContain('Fallback (AI quota reached)');expect(provider).toHaveBeenCalledTimes(1);expect(result.photoLabels.every(p=>p.surface==='unclear')).toBe(true);
});
it('rechecks cache once after quota exhaustion without another provider request',async()=>{
 const cache=createCache({bundled:{}});vi.spyOn(cache,'get').mockResolvedValueOnce(null).mockResolvedValueOnce({observations:[],photoLabels:[],senderMap:{},warnings:['Live'],mode:'live'});
 const provider=vi.fn(async()=>{throw new ProviderHttpError(429)});const result=await createReadService({adapter:createAdapter({provider}),cache})(input);
 expect(result.mode).toBe('cached');expect(result.warnings).toContain('Cached');expect(result.warnings).not.toContain('Live');expect(provider).toHaveBeenCalledTimes(1);expect(cache.get).toHaveBeenCalledTimes(2);
});
it('normalizes source warnings without describing cached results as live or fallback',()=>{
 expect(modeWarnings('live',[])).toEqual(['Live']);expect(modeWarnings('fallback',['Fallback (AI quota reached)'])).toEqual(['Fallback (AI quota reached)']);
 expect(modeWarnings('cached',['Live','Fallback (AI quota reached)'])).toEqual(['Cached','AI quota reached; using validated cached data']);
});
