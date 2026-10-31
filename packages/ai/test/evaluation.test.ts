import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createEvaluationHandler} from '../src/evaluation';
import {interactiveEvaluation} from '../../../eval/runner/interactive';

it('reruns the same engine loop and metrics as the published CLI metrics on all frozen cases and seeds',()=>{
 const actual=interactiveEvaluation(),cli=JSON.parse(readFileSync(new URL('../../../eval/results/engine.json',import.meta.url),'utf8'));
 for(const key of ['rightTrade','top1','overclaim','harmfulFlips','checksToDecision','hazardPass'] as const){expect(actual.rows[0]![key]).toEqual(cli.rows[0]![key]);}
 expect(actual.sets).toMatchObject({simBuildings:60,hardCases:30,photos:0});
});
it('evaluates a custom case without inventing ground-truth accuracy',async()=>{
 const state=JSON.parse(readFileSync(new URL('../../../fixtures/hero/state-06.json',import.meta.url),'utf8'));
 const handler=createEvaluationHandler();
 const response=await handler(new Request('http://localhost/api/evaluate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({state})}));
 expect(response.status).toBe(200);const body=await response.json();expect(body.current.accuracy).toMatch(/Not scored/);expect(body.current.review).toMatch(/Unreviewed/);
});
it('keeps the packaged frozen evaluation data identical to the source cases',async()=>{
 const {readdirSync}=await import('node:fs');
 const directory=new URL('../../../eval/hard-cases/',import.meta.url);
 const cases=readdirSync(directory).filter(p=>p.endsWith('.json')).sort().map(p=>JSON.parse(readFileSync(new URL(p,directory),'utf8')));
 const {default:frozen}=await import('../../../eval/data/frozen-cases');expect(frozen).toEqual(cases);
});
