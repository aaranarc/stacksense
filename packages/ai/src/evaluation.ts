import {EngineState} from '@stacksense/contracts';
import {z} from 'zod';
import {interactiveEvaluation,evaluateCurrentCase} from '../../../eval/runner/interactive';
import {jsonBody,jsonResponse,rateLimiter} from './http/common';
const Input=z.object({state:EngineState.optional()}).strict();
export function createEvaluationHandler(){
 const allowed=rateLimiter();
 return async(request:Request)=>{
  if(request.method!=='POST')return jsonResponse({error:'POST required'},405);
  if(!allowed(request.headers.get('x-forwarded-for')??'unknown'))return jsonResponse({error:'Rate limit exceeded'},429);
  try{const input=Input.parse(await jsonBody(request,4*1024*1024));return jsonResponse(input.state?{current:evaluateCurrentCase(input.state)}:interactiveEvaluation());}catch{return jsonResponse({error:'Evaluation could not be completed. Please retry.'},400);}
 };
}
export const handleEvaluation=createEvaluationHandler();
