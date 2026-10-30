import { expect, it } from 'vitest';
import { generateMocks } from './generate';
import { EngineState, ReadResult } from '@stacksense/contracts';
import { readdirSync, readFileSync } from 'node:fs';
if (process.env.GENERATE_MOCKS === 'true') generateMocks();
it('validates every hero state and variant with the shared schema', () => {
 const files=readdirSync('src/mocks/states').filter(f=>f.endsWith('.json'));
 expect(files.length).toBe(15);
 for(const file of files) expect(EngineState.safeParse(JSON.parse(readFileSync(`src/mocks/states/${file}`,'utf8'))).success,file).toBe(true);
 expect(ReadResult.safeParse(JSON.parse(readFileSync('src/mocks/read-hero.json','utf8'))).success).toBe(true);
});
