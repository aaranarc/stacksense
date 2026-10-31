import {createAdapter} from './adapter';
import {geminiProvider} from './gemini';
import {openaiProvider} from './openai';
import {quotaProvider} from './quota';
export function serverAdapter(opts:{fetch?:typeof fetch}={}){
 if(typeof window!=='undefined')throw new Error('Server-only AI module');
 const provider=process.env.LLM_PROVIDER??'gemini';
 const {OPENAI_API_KEY:key,OPENAI_MODEL:openaiModel,OPENAI_BASE_URL:baseUrl}=process.env;
 // No automatic paid-provider default: compatible fallback requires all three explicit settings.
 const compatible=key&&openaiModel&&baseUrl?openaiProvider({apiKey:key,model:openaiModel,baseUrl,fetch:opts.fetch}):undefined;
 if(provider==='openai')return createAdapter({provider:compatible});
 if(provider==='gemini'&&process.env.GEMINI_API_KEY){
  const apiKey=process.env.GEMINI_API_KEY,model=process.env.GEMINI_MODEL??'gemini-3.1-flash-lite',second=process.env.GEMINI_FALLBACK_MODEL;
  return createAdapter({provider:quotaProvider({primary:geminiProvider({apiKey,model,fetch:opts.fetch}),secondary:second&&second!==model?geminiProvider({apiKey,model:second,fetch:opts.fetch}):undefined,openai:process.env.LLM_FALLBACK_PROVIDER==='openai'?compatible:undefined})});
 }
 return createAdapter();
}
