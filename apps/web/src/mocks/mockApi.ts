import type { z } from 'zod';
import { ReadResult, LinkResult } from '@stacksense/contracts';
import type { EngineState, ReadRequest, LinkRequest } from '@stacksense/contracts';
import read from './read-hero.json';
export const mockApi={
 async read(_request:ReadRequest) {await new Promise(resolve=>setTimeout(resolve,600));return ReadResult.parse(read);},
 async secondOpinion(state:EngineState) {return state.secondOpinion;},
 async createLink(_request:z.infer<typeof LinkRequest>) {return LinkResult.parse({url:'https://example.invalid/c/demo',token:'demo',waUrl:'https://wa.me/?text=StackSense%20demo%20check%20%E2%80%94%20no%20real%20recipient'});},
};

