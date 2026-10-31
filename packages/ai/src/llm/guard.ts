import {LiveLlmDisabledError} from './errors';
export function assertLiveLlmOptIn(){if(process.env.LIVE_LLM_TESTS!=='1')throw new LiveLlmDisabledError();}
export function guardLlmTransport(transport:typeof fetch){
 const entry=(process.argv[1]??'').split(String.fromCharCode(92)).join('/');
 const check=process.env.NODE_ENV==='test'||Boolean(process.env.VITEST)||process.env.NEXT_PHASE==='phase-production-build'||/(?:^|\/)(?:eval|test|tests|scripts)(?:\/|$)/.test(entry)||/(?:^|[-_/])(?:health|smoke|verify)(?:[-_.]|$)/i.test(entry);
 const webRuntime=process.env.VERCEL==='1'||Boolean(process.env.NEXT_RUNTIME)||entry.includes('/next/dist/')||entry.includes('/.next/');
 const gated=check||!webRuntime;
 const mocked=(transport as typeof fetch&{_isMockFunction?:boolean})._isMockFunction===true;
 if(gated&&!mocked)assertLiveLlmOptIn();
}
