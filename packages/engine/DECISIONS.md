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

## A-T08
- Duct check targets the directly lower flat in the same stack; upper wet-area and supply checks target the flat above; ceiling/rain/moisture/inspection target the victim. No targets are invented outside the building.
- Public candidate generation omits unavailable meters. Ranking can request unavailable descriptors explicitly to explain a no-meter exclusion in the Why drawer (A-T09).
- Professional moisture/inspection efforts are 30/60 minutes, prototype assumptions. Rain waiting has a multiplicative delay penalty of 2880 (one day at the 0.5-minute denominator floor). Outcomes are normalized per family; inspection has a prototype seven-way source model. Ceiling/moisture do not pretend to identify a source from a photo/reading alone.

## A-T09
- VOI marginalizes each check outcome over the current posterior and recomputes Shannon entropy in bits. Trade choice sums mutually exclusive source mass by trade; the minimal mapping here is required for action-change exclusion, with Job Sheet reasoning deferred to A-T16.
- Completed informative checks remain in the Why drawer, excluded as already checked. A dark/unclear photo does not complete a check. Unsafe descriptors are available from `rankChecks`, but `applyObservations` offers no active checks when safety is not okay.
- Locked access uses Infinity internally. RankedCheck serializes that as Number.MAX_VALUE with explicit `flat locked` exclusion, since JSON converts Infinity to null and the unchanged contract requires a number. Rain delay multiplies the access penalty in the prescribed score denominator.

## A-T10
- Safety overrides stopping: emergency stops; incomplete cannot reach a source decision. A null Second Opinion is not an objection, matching A-T10; actual review caps arrive in A-T15. Low-value remote checks request an inspection without producing a Job Sheet.
- Trace is replayed deterministically from unique events and current labels, appending a step for each informative event and including only changes greater than 0.01. Duplicate reports add no trace step. Correcting a photo recomputes the derived trace rather than treating the old and corrected labels as independent evidence.

## A-T11
- A9's numbering is retained in all twelve fixture files. Weather step 03 reuses 02 (A-T19 pending); steps 07–11 reuse 06 until later tasks regenerate them. No review, trade sheet, repair or prediction is fabricated. Independent 202/402 JSON files expose the case split to B.
- The hero regression revealed that corrected photo zones must also control same-stack relevance, not just feature extraction. Labels are now applied before that relevance decision, with a regression test.

## A-T15
- Evidence caps are deterministic. Root mass includes any component children; a good trap/grout crack photo at the source flat, an explicit positive dye test, or a matching professional component finding can support a component only above 80% parent mass. The reviewer never changes odds.
- Claims are rewritten from engine evidence at the lower of the requested and supported level; no draft can introduce confirmed/guilty wording. Missing/invalid review is explicitly unreviewed. Existing reviews are re-capped when evidence changes.
- A safe, available reviewer-requested check can override only the `can't change the action` exclusion to refine claim specificity; locked, unavailable, unsafe and completed checks remain excluded. This is the A-T15 exception to A-T09's trade-only ranking.
