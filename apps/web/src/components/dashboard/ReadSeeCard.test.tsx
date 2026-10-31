import {expect,it} from 'vitest';
import {bubbleText} from './ReadSeeCard';
it('shows attachments as thumbnails, not as placeholder text',()=>{expect(bubbleText('402 here, bathroom ceiling stain near duct corner. IMG-[PHONE]WA0402.jpg (file attached)')).toBe('402 here, bathroom ceiling stain near duct corner.');expect(bubbleText('no attachment')).toBe('no attachment');});
