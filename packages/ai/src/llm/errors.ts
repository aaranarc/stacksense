/** Sanitized transport failure: never includes response bodies, credentials or URLs. */
export class ProviderHttpError extends Error {
 constructor(readonly status:number){super(`AI provider HTTP ${status}`);this.name='ProviderHttpError';}
}
export class LiveLlmDisabledError extends Error {
 constructor(){super('Live LLM calls disabled; set LIVE_LLM_TESTS=1 for explicit tests, evaluation or health checks');this.name='LiveLlmDisabledError';}
}
export const QUOTA_WARNING='Fallback (AI quota reached)';
