import {textHazards} from "@stacksense/engine";
import type { Observation } from "@stacksense/contracts";
export function hazardsIn(text:string): Observation["hazards"] {return textHazards(text).hazards;}
