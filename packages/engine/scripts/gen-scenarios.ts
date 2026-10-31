import {mkdirSync,writeFileSync} from "node:fs";
import {scenarios,runScenario} from "../src/scenarios";
import {fixtureDemoAssets} from "./demo-assets";
const directory=new URL("../../../fixtures/scenarios/",import.meta.url);mkdirSync(directory,{recursive:true});
for(const [id,scenario] of Object.entries(scenarios)){const state=runScenario(scenario);writeFileSync(new URL(`${id}.json`,directory),JSON.stringify({...scenario,state,demoAssets:fixtureDemoAssets(state,id)},null,2)+"\n");}
console.log("Wrote eight simulated scenarios");
