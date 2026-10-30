# Engine decisions

## A-T02
- Graph helpers are bound by `createGraph(building)` so `above(flat)` and the other queries stay pure and work for both buildings. Same-stack excludes self; neighbours are flats on the same floor plus directly above/below.
- UK flats are numbered left-to-right, then bottom-to-top; no UK meters are assumed. Both positions have a shared duct and wet rooms. Windows are represented by the plan's wall orientation and window-zone observations because the unchanged contract has no window field.
- Building JSON files contain the specified physical topology; observation/state fixtures carry `provenance: simulated`.

## A-T03
- Hypotheses are grouped per victim with `caseId:<victim>` and victim-prefixed IDs; a report from another victim does not update this victim's odds. Components are conditional children of their bathroom area, not competing independent causes. Roof remains a tiny-prior candidate below the top floor (A-T04). No upper-flat source is created when there is no flat above.
