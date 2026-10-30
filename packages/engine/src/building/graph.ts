import type { Building, Flat } from "@stacksense/contracts";

type FlatRef = Flat | string;

export function createGraph(building: Building) {
  const resolve = (ref: FlatRef) => building.flats.find(f => f.id === (typeof ref === "string" ? ref : ref.id));
  const vertical = (ref: FlatRef, delta: number) => {
    const flat = resolve(ref);
    return flat && building.flats.find(f => f.position === flat.position && f.floor === flat.floor + delta);
  };
  return {
    above: (ref: FlatRef) => vertical(ref, 1),
    below: (ref: FlatRef) => vertical(ref, -1),
    sameStack(ref: FlatRef): Flat[] {
      const flat = resolve(ref);
      if (!flat) return [];
      const ids = new Set(building.stacks.filter(s => s.flatIds.includes(flat.id)).flatMap(s => s.flatIds));
      return building.flats.filter(f => f.id !== flat.id && ids.has(f.id));
    },
    neighbours(ref: FlatRef): Flat[] {
      const flat = resolve(ref);
      if (!flat) return [];
      return building.flats.filter(f => f.id !== flat.id && (
        f.floor === flat.floor || (f.position === flat.position && Math.abs(f.floor - flat.floor) === 1)
      ));
    },
    wallsFacing: (orientation: Flat["externalWalls"][number]) => building.flats.filter(f => f.externalWalls.includes(orientation)),
  };
}
