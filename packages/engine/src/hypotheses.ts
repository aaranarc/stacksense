import type { Building, Hypothesis } from "@stacksense/contracts";
import { createGraph } from "./building/graph";

export type HypothesisGroup = { caseId: string; victimFlatId: string; hypotheses: Hypothesis[] };

export function hypothesesForVictims(
  building: Building, victimFlatIds: string[], opts: { caseId?: string; lateral?: boolean } = {},
): HypothesisGroup[] {
  const graph = createGraph(building);
  return [...new Set(victimFlatIds)].map(victimId => {
    const victim = building.flats.find(f => f.id === victimId);
    if (!victim) throw new Error(`Unknown victim flat: ${victimId}`);
    const hypotheses: Hypothesis[] = [];
    const add = (key: string, family: Hypothesis["family"], level: Hypothesis["level"], label: string,
      extra: Partial<Hypothesis> = {}) => {
      const h: Hypothesis = { id: `${victimId}:${key}`, family, level, label,
        flatId: null, stackId: null, orientation: null, parentId: null, ...extra };
      hypotheses.push(h);
      return h;
    };
    const above = graph.above(victim);
    const areas = [above, ...(opts.lateral ? building.flats.filter(f => f.floor === victim.floor + 1 && f.position !== victim.position) : [])];
    for (const flat of areas) {
      if (!flat || !flat.wetAreas.includes("bathroom")) continue;
      const parent = add(`upper_wet_area@${flat.id}`, "upper_wet_area", "area", `Probable ${flat.id} bathroom area`, { flatId: flat.id });
      for (const component of ["nahani_trap", "tile_grout", "sunken_slab_membrane", "wc_connection"]) {
        add(`${component}@${flat.id}`, "upper_wet_area", "component", `Probable ${flat.id} ${component.replaceAll("_", " ")}`,
          { flatId: flat.id, parentId: parent.id });
      }
    }
    if (above) add(`upper_supply@${above.id}`, "upper_supply", "mechanism", `Probable ${above.id} supply leak`, { flatId: above.id });
    for (const stack of building.stacks.filter(s => s.flatIds.includes(victimId))) {
      add(`shared_shaft@${stack.id}`, "shared_shaft", "mechanism", `Probable shared shaft ${stack.id}`, { stackId: stack.id });
    }
    for (const orientation of victim.externalWalls) {
      add(`facade_window@${victimId}:${orientation}`, "facade_window", "area", `Probable ${victimId} ${orientation} facade/window`,
        { flatId: victimId, orientation });
    }
    if (building.hasTerrace) add("roof_terrace", "roof_terrace", "mechanism", "Probable roof/terrace ingress");
    add(`condensation@${victimId}`, "condensation", "mechanism", `Probable ${victimId} condensation`, { flatId: victimId });
    add("other", "other", "mechanism", "Other unresolved source");
    return { caseId: `${opts.caseId ?? building.id}:${victimId}`, victimFlatId: victimId, hypotheses };
  });
}
