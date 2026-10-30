import {mkdirSync,writeFileSync} from "node:fs";
import {scenarios,runScenario} from "../src/scenarios";
const directory=new URL("../../../fixtures/scenarios/",import.meta.url);mkdirSync(directory,{recursive:true});
for(const [id,scenario] of Object.entries(scenarios))writeFileSync(new URL(`${id}.json`,directory),JSON.stringify({...scenario,state:runScenario(scenario)},null,2)+"\n");
console.log("Wrote eight simulated scenarios");
