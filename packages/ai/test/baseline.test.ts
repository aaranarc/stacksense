import {expect,it,vi} from "vitest";
import {singleLlmBaseline} from "../src/baseline";
import {createAdapter} from "../src/llm/adapter";
import {blockA} from "../../engine/src/building/blockA";
it("runs E.4 and derives only area/mechanism specificity",async()=>{
 const provider=vi.fn(async()=>({family:"upper_supply",flatId:"502",trade:"plumber",emergency:false}));
 expect(await singleLlmBaseline({building:blockA,observations:[]},createAdapter({provider}))).toMatchObject({family:"upper_supply",flatId:"502",trade:"plumber",level:"area"});
 expect(provider.mock.calls).toHaveLength(1);
 expect(await singleLlmBaseline({building:blockA,observations:[]},createAdapter({provider:async()=>({family:"other",flatId:null,trade:"general_inspector",emergency:false})}))).toMatchObject({level:"mechanism"});
});
it("repairs once then returns null rather than inventing a baseline",async()=>{
 const provider=vi.fn(async()=>({bad:true}));
 expect(await singleLlmBaseline({building:blockA,observations:[]},createAdapter({provider}))).toBeNull();
 expect(provider).toHaveBeenCalledTimes(2);
 expect(await singleLlmBaseline({building:blockA,observations:[]},createAdapter())).toBeNull();
});
