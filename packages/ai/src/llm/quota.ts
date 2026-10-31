import type {Provider,ModelRequest} from './adapter';
import {ProviderHttpError} from './errors';
/** A bounded transition chain. Schema repair resumes the selected stage, never exhausted models. */
export function quotaProvider(opts:{primary:Provider;secondary?:Provider;openai?:Provider}):Provider {
 const states=new WeakMap<object,{stage:'primary'|'secondary'|'openai'|'exhausted'}>();
 const quota=(e:unknown)=>e instanceof ProviderHttpError&&e.status===429;
 return async(request:ModelRequest)=>{
  const key=request.context??request;let state=states.get(key);if(!state){state={stage:'primary'};states.set(key,state);}
  if(state.stage==='primary'){
   try{return await opts.primary(request);}catch(error){if(!quota(error))throw error;request.onWarning?.('Gemini primary quota reached');state.stage=opts.secondary?'secondary':'exhausted';}
  }
  if(state.stage==='secondary'){
   try{return await opts.secondary!(request);}catch(error){if(!quota(error))throw error;request.onWarning?.('Gemini fallback model quota reached');state.stage=opts.openai?'openai':'exhausted';}
  }
  if(state.stage==='openai'){
   request.onWarning?.('Using configured OpenAI-compatible fallback after both Gemini models reached quota');
   try{return await opts.openai!(request);}catch(error){if(quota(error))state.stage='exhausted';throw error;}
  }
  throw new ProviderHttpError(429);
 };
}
