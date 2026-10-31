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

## A-T16
- The shared trade table now drives VOI actions and the Job Sheet. Only stopped, safety-okay cases issue sheets; an inconclusive inspection stop has no repair trade. A missing review remains explicitly unreviewed. Paying responsibility is represented only by the specified links.
- The contract has no request timestamps, so the trail marks the first request time as unknown, rather than inventing it. Evidence time comes from observations; issue time uses state.now. No wall-clock calls occur in the engine.

## A-T17
- Recovery is replayed chronologically for the primary victim and spot. Repairs may be reported at the source flat; recaptures/readings must refer to the victim's original zone. A fresh, finite, nonnegative %WME reading after repair is required for paint readiness; relative units, old readings and other spots do not qualify.
- The 16 %WME region defaults are contractor-configuration prototype values, explicitly awaiting review, not a universal scientific threshold. Better photos reset dryness to unknown. Worse recaptures or renewed same-spot complaints reopen investigation and suppress the Job Sheet until a new repair cycle.

## A-T18
- whatIf validates patches, replays from createCase with the same case time, memory and photo labels, and never mutates the original. Surface/zone counterfactuals also update the associated good label in the simulated copy; bad photos remain uninformative. Patched evidence is marked simulated.
- A previous LLM review is invalidated to labelled unreviewed fallback when evidence changes, since a pure engine cannot rerun a model. The deterministic evidence cap, checks, Job Sheet and recovery are recalculated; B may request a fresh review separately.
- Hero review fixtures are explicitly scripted demo drafts with source fallback and a simulated-review warning. Weather and prediction placeholders remain deferred to A-T19/A-T21; no live AI or prediction is fabricated.
- Final case-split regression: the primary case's reviewer verdict is not inherited by another victim. A separate facade case starts unreviewed.

## A-T19
- Rain uses the previous 72 hours and a 75th-percentile baseline of rolling windows ending no later than the report. Forecast checks compare daily wall-facing totals to the forecast's daily 75th percentile and choose the first exceedance. Zero or uniform rain does not invent a heavy-rain check.
- Optional engine-only `weather` context is carried on returned state objects and replayed by whatIf without changing the shared contract. Rain joins only exterior/window evidence for that victim. Real July–August data and a current 16-day forecast are cached separately from source=fixture deterministic hero-weather examples.

## A-T20
- Scenario entries optionally include photoLabels and a scripted review so the dark-photo and component-evidence scenarios work without changing the shared contract. All scenario observations are simulated and titles disclose demo data.
- A professional finding in a diagonal upper flat enables lateral candidates and supplies an explicit high-likelihood finding update (prototype .999/.001); generic reports never identify a diagonal flat by guesswork. The hypothesis generator itself keeps its existing optional lateral interface.
- The break-it entry is a deterministic seed template until A-T22 replaces its building/steps with the simulator. This preserves task order; no simulator implementation is claimed in A-T20.

## A-T21
- Specific component evidence assigns 90% of the parent area's mass to the matching component and leaves 10% on the area, a prototype localization assumption pending contractor review. Parent-plus-child mass is unchanged and all mutually exclusive entries still sum to one. The reviewer never chooses these numbers.
- Prediction requires a professional finding or component probability >=0.8 with no objection. Diagnostic duct photos do not count as completed preventive inspections; this is why hero 302 is still suggested alongside 602. Explicit inspection/professional records suppress repeat suggestions. Prevention is inspection only.
- Memory is seed counts plus unique professional-finding event keys, never incremented by replay. Engine-only memoryPrior preserves the initial Dirichlet seed through whatIf; current-case findings are not added back into their own priors. Seasonal advice is derived only from this building's recorded cases.

## A-T22
- Simulator uses seeded Mulberry32 randomness, 4–10 floors, 1–3 stacks, randomized meters/access and an explicit hidden family. Answers sample the check catalog's true outcome distribution, optionally mixed with uniform noise via outcomePerturbation. Initial symptom patterns are simulated observations, not revealed source labels.
- The return value adds initialObservation/victimFlatId for B to initialize an engine case. Repeated calls consume the seeded oracle stream; equal seeds and equal check sequences give equal answers. The Break-it scenario now uses seed 23.
- Development smoke test: 48/60 top source family+flat matches after at most three selected checks (80%). This is a simulator unit/development check, not A-T24 evaluation, not field accuracy, and it does not read hard cases or write engine evaluation results. No outcomes are forced to make the metric pass.

## CP1 stop-rule correction (A-T10)

The 0.80 threshold applies to a source area including its localized component mass, consistently with claimEvidence and Job Sheet evidence caps. Previously localization could turn 0.80 into 0.08 area + 0.72 component and incorrectly select the low-value inspection stop. stopRule now uses conserved source mass; Number.EPSILON only absorbs summation rounding at the boundary. An objection still blocks the confidence path. The independent best available score < 0.05 inspection path, safety and reopened gates are unchanged; exactly 0.05 continues. Inspection stops still make no repair-trade claim. We did not lower the cost threshold, tune likelihoods, or read/run eval/hard-cases. Low-value inspection losses reported by C remain legitimate under the specified rule; correct top-1 alone below 0.80 is insufficient for a repair decision. Verification uses the hero, eight scenarios, and seeded simulated buildings only.
