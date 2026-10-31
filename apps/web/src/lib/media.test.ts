import {afterEach,expect,it} from 'vitest';
import {rememberPhoto,photoMedia,clearPhotoMedia} from './media';
afterEach(clearPhotoMedia);
it('keeps prepared images locally and distinguishes missing previews from demo illustrations',()=>{expect(photoMedia('unknown')).toBeNull();expect(photoMedia('P402')?.demo).toBe(true);expect(rememberPhoto('real','https://example.com/private.jpg')).toBe(false);expect(rememberPhoto('real','data:image/jpeg;base64,AA==')).toBe(true);expect(photoMedia('real')?.demo).toBe(false);});

it('serves every approved hero ID from byte-identical cached assets and keeps Day-14 illustrated',async()=>{
 const {readFileSync}=await import('node:fs');const {resolve}=await import('node:path');
 const assets=JSON.parse(readFileSync('../../fixtures-ai/photos/demo/assets.json','utf8'));
 for(const [id,asset] of Object.entries(assets.hero) as [string,{path:string;assetSource:string}][]){const media=photoMedia(id)!;expect(media.demo).toBe(true);expect(media.illustration).toBe(asset.assetSource==='demo-illustration');expect(readFileSync(resolve('public',media.url.slice(1)))).toEqual(readFileSync(resolve('../..',asset.path)));}
 expect(photoMedia('hero-ceiling-402')!.url).toBe('/demo/photos/ceiling_402_own.jpg');expect(photoMedia('hero-day14-402')!.illustration).toBe(true);
});
