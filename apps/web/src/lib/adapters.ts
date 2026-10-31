import type { z } from 'zod';
import * as realEngine from '@stacksense/engine';
import { ReadResult, SecondOpinion, LinkResult } from '@stacksense/contracts';
import type { EngineState, ReadRequest, LinkRequest } from '@stacksense/contracts';
import { mockEngine, heroStates, emergencyState } from '../mocks/mockEngine';
import { mockApi } from '../mocks/mockApi';
import { mockBrowser } from '../mocks/browser';
const USE_MOCK_ENGINE = process.env.NEXT_PUBLIC_USE_MOCK_ENGINE === 'true';
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
async function post(path:string,body:unknown):Promise<unknown> {const response=await fetch(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!response.ok) throw new Error('Request failed. Please try again.');return response.json();}
const realApi={
 async read(request:ReadRequest) {return ReadResult.parse(await post('/api/read',request));},
 async secondOpinion(state:EngineState) {return SecondOpinion.nullable().parse(await post('/api/second-opinion',{state}));},
 async createLink(request:z.infer<typeof LinkRequest>) {return LinkResult.parse(await post('/api/link',request));},
};
export const engine = USE_MOCK_ENGINE ? mockEngine : realEngine;
export const api = USE_MOCK_API ? mockApi : realApi;
export const demo = { states:heroStates, emergency:emergencyState, enabled:USE_MOCK_ENGINE || USE_MOCK_API };
export const browser = { ...mockBrowser, available:USE_MOCK_API };

