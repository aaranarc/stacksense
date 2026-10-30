# Engine decisions

## A-T02
- Graph helpers are bound by `createGraph(building)` so `above(flat)` and the other queries stay pure and work for both buildings. Same-stack excludes self; neighbours are flats on the same floor plus directly above/below.
- UK flats are numbered left-to-right, then bottom-to-top; no UK meters are assumed. Both positions have a shared duct and wet rooms. Windows are represented by the plan's wall orientation and window-zone observations because the unchanged contract has no window field.
- Building JSON files contain the specified physical topology; observation/state fixtures carry `provenance: simulated`.

## A-T03
- Hypotheses are grouped per victim with `caseId:<victim>` and victim-prefixed IDs; a report from another victim does not update this victim's odds. Components are conditional children of their bathroom area, not competing independent causes. Roof remains a tiny-prior candidate below the top floor (A-T04). No upper-flat source is created when there is no flat above.

## A-T04
- Prior ranges are prototype assumptions, not measured field accuracy. Only modes drive decisions; memory adds counts to ten prior pseudo-observations. Invalid counts are rejected.
- Posterior mass is assigned to mutually exclusive root hypotheses. Component descriptors start at zero until component evidence is implemented in A-T15; this avoids counting an area and its children twice. Multiple roots of the same family share its mass. Roof below the top floor receives weight 0.0001 before normalization.

## A-T05
- Each feature row is a Bernoulli likelihood across families, not a distribution summing across families. The numerical tables are prototype assumptions. Complementary check outcomes use complementary rows.
- Text locates a duct corner or records explicit dye/flood outcomes; it never fabricates a meter reading. Rain/weather joining stays in A-T19. Poor-quality photos provide no feature evidence; a good label overrides surface/zone.

## A-T06
- `createCase` without `now` uses the Unix epoch, never the system clock. Callers supply real case time. States are rebuilt from evidence in log space so delayed or human-corrected labels replace earlier labels without double-counting.
- The unchanged contract has no warnings or child-case fields: photo warnings use `recovery.flags`; `splitCases(state)` returns independent, contract-valid states linked by building/case prefix. The first complaint is the primary returned case; every case retains the evidence ledger for case splitting. Each posterior sums to one independently.
- Evidence is counted once per eventKey; IDs retain the audit ledger. Complaints at other victims never update this victim. Upper-flat checks/denials and same-stack duct checks can inform the primary case. A-T07 adds safety before inference; no active checks are offered before the gate exists.

## A-T07
- Safety scans the complete ledger and incoming reports before event deduplication; a duplicate ID/event cannot hide a new hazard. Conflicting versions are preserved in the ledger while evidence still counts the event once. Hazards affect the whole building session, including case splits.
- Emergency removes all checks and the Job Sheet and stops immediately. Unanswered questions retain incomplete status and no active checks. The keyword backstop intentionally follows the conservative literal pattern in the plan.
