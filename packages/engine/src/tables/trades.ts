import type { z } from "zod";
import type { Trade, Observation } from "@stacksense/contracts";
import type { Family } from "../priors/archetypes";
type TradeValue=z.infer<typeof Trade>;
export const familyTrade:Record<Family,TradeValue>={upper_wet_area:"waterproofer_tiler",upper_supply:"plumber",shared_shaft:"plumber",facade_window:"facade_sealant",roof_terrace:"roofer",condensation:"ventilation",other:"general_inspector"};
export function tradesFor(family:Family,_component:string|null=null,hazards:Observation["hazards"]=[]) {
  if(hazards.length) return [{trade:"electrician" as const,why:"Emergency electrical/water hazard: keep away and call emergency professionals"}];
  if(_component==="wc_connection") return [{trade:"plumber" as const,why:"Verify the probable WC connection defect on site before repairs"}];
  return [{trade:familyTrade[family],why:family==="shared_shaft"?"Probable shared shaft defect; coordinate access with society/landlord":`Verify the probable ${family.replaceAll("_"," ")} source on site before repairs`}];
}
