import {afterEach,expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {rememberPhoto,photoMedia,clearPhotoMedia} from './media';
afterEach(clearPhotoMedia);
it('keeps prepared images locally and distinguishes missing previews from demo illustrations',()=>{expect(photoMedia('unknown')).toBeNull();expect(photoMedia('P402')?.demo).toBe(true);expect(rememberPhoto('real','https://example.com/private.jpg')).toBe(false);expect(rememberPhoto('real','data:image/jpeg;base64,AA==')).toBe(true);expect(photoMedia('real')?.demo).toBe(false);});

it('serves every approved hero ID from byte-identical cached assets and keeps Day-14 illustrated',()=>{
 const hash=(path:string)=>createHash('sha256').update(readFileSync(path)).digest('hex');
 const assets=JSON.parse(readFileSync('../../fixtures-ai/photos/demo/assets.json','utf8'));
 for(const [id,asset] of Object.entries(assets.hero) as [string,{path:string;assetSource:string}][]){const media=photoMedia(id)!;expect(media.demo).toBe(true);expect(media.illustration).toBe(asset.assetSource==='demo-illustration');expect(hash(resolve('public',media.url.slice(1)))).toBe(hash(resolve('../..',asset.path)));}
 expect(photoMedia('hero-ceiling-402')!.url).toBe('/demo/photos/ceiling_402_own.jpg');expect(photoMedia('hero-day14-402')!.illustration).toBe(true);
});
it('maps both canonical demo-chat attachment IDs to the same approved photos and labels as Judge previews',()=>{expect(photoMedia('IMG-20261030-WA0402.jpg')).toBe(photoMedia('hero-ceiling-402'));expect(photoMedia('IMG-20261030-WA0202.jpg')).toBe(photoMedia('hero-window-202'));expect(photoMedia('IMG-20261030-WA0402.jpg')).toMatchObject({url:'/demo/photos/ceiling_402_own.jpg',demo:true,illustration:false});expect(photoMedia('IMG-20261030-WA0202.jpg')).toMatchObject({url:'/demo/photos/window_202_own.jpg',demo:true,illustration:false});});
