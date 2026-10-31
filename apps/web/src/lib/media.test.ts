import {afterEach,expect,it} from 'vitest';
import {rememberPhoto,photoMedia,clearPhotoMedia} from './media';
afterEach(clearPhotoMedia);
it('keeps prepared images locally and distinguishes missing previews from demo illustrations',()=>{expect(photoMedia('unknown')).toBeNull();expect(photoMedia('P402')?.demo).toBe(true);expect(rememberPhoto('real','https://example.com/private.jpg')).toBe(false);expect(rememberPhoto('real','data:image/jpeg;base64,AA==')).toBe(true);expect(photoMedia('real')?.demo).toBe(false);});
