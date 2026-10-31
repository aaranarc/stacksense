# Judge audit fixes — 31 October 2026

The user authorized fixes across A, B and judge UI ownership for this audit. This change is on a review branch; it does not merge main or supersede C's final merge authority. The existing local change to apps/web/AGENTS.md is unrelated and excluded from the commit.

## Changes

- Safety extraction and the engine share a deterministic, clause-scoped negation backstop. Explicit denials, contractions and coordinated negative lists no longer create emergencies. Mixed positive or uncertain hazards still stop diagnosis. Explicit hazard labels still stop the engine. Cached chat results are reconciled too.
- Plain reports now work alongside timestamped WhatsApp exports. Empty extraction produces an actionable error and preserves the draft and prior case. Drafts survive navigation/reload in this browser session. A report's attached photos are linked to its observation.
- Incidents keeps the original report editable during an emergency, displays the engine's emergency actions, and provides a correction route. Diagnosis elsewhere remains blocked. All four safety questions can be answered explicitly for all reported areas; existing positive evidence is not cleared by those answers.
- Failed Second Opinions remain `review_failed` / `fallback`, with recorded, explicitly unreviewed evidence, unknowns, failure reasons and next steps. A retry control requests the configured provider. Successful schema-validated provider responses remain supported; deterministic evidence caps still apply. No fallback is represented as a successful AI review.
- Neighbour previews render the same resident component directly, avoiding a second page/iframe load. Actual resident verification has bounded waits and retryable service errors. A missing or failed optional ghost image does not block the form. Used/expired tokens and owner authorization remain enforced.
- Source bars combine probability mass for hypotheses sharing a permitted label in the engine, so capped components do not display indistinguishable competing entries.
- Settings supports a regular-layout building setup and explicitly configured meter flats. Stacks, access and wall orientations are not guessed. The form states the regular numbering/bathroom assumptions. The additive optional `Building.moistureThresholdWme` field overrides the regional prototype default; changing it recalculates readiness from recorded readings.
- Evaluation labels the headline as the prepared 30-hard-case subset. A new read-only, rate-limited evaluation endpoint reruns the current engine on the frozen 30 hard cases and 60 simulator seeds using the CLI's shared execution loop. A current-case replay is unscored without independent ground truth. Baselines, AI accuracy and robustness are not silently rerun or fabricated.
- Forecast and seasonal inspection tasks support owner, due date, completion date and an exported calendar reminder. Tracking is stored in the browser session, does not change diagnosis, and does not create evidence of a completed inspection.
- The demo phone now checks the actual selected image's quality locally and strips metadata. Diagnostic labels remain explicitly simulated; its answer never updates the active case. Photo accuracy remains unmeasured with zero evaluation photos.
- Job sheet actions say Print / Save PDF. WhatsApp text omits empty excluded-trade fields and includes a portable case-specific report snapshot. The snapshot excludes chat and private photo identifiers and is clearly labelled sender-supplied, unverified and readable by anyone holding the link. It needs no storage in the recipient's browser and can be printed there.
- Hindi and Marathi consent, checkbox, buttons, safety questions and capture flow use consistent translated copy. Slab help is explicitly general construction context.

## Contract and evaluation provenance

The only contract addition is optional `Building.moistureThresholdWme` (0–100). Existing cases and fixtures retain the original default when absent. No existing required fields changed.

`eval/data/frozen-cases.ts` statically imports the 30 unchanged, read-only hard-case JSON inputs. A test checks that the bundled set matches all source files. Shared evaluation execution lives in `eval/runner/caseRun.ts`; the CLI and interactive run use it. No hard-case truth, priors or trade-selection logic was tuned for this audit.

## Verification and limits

Validation uses Node 20, recursive typecheck/tests, the production web build, and the evaluation tests. Regression coverage includes negation, mixed hazards, failed/custom reads, editable emergencies, link storage outages, optional ghost failure, grouped probability mass, moisture configuration, portable report privacy and evaluation parity. Normal tests stay offline/cache-only.

Browser checks cover a custom negated report, a real positive electrical report, correcting it without reset, explicit safety answers, and the production build. Provider and signed-cloud upload outcomes are recorded below when checked; unit success is not evidence of successful live inference or delivery.

Real-world AI accuracy, a new human-labelled photo dataset, message delivery, real camera footage, cloud retention controls and field validation are not established by these changes. Calendar reminders take effect only when imported into the user's calendar. Building setup currently supports a regular floor layout, with shared stacks/walls unassessed. Snapshot report links are portable copies, not live, signed or revocable reports.

### Observed production-build browser results

- A plain Flat 402 report containing “no ceiling sagging” and “no sewage smell” produced an incident without a false emergency. Its draft remained visible.
- A subsequent positive electrical report produced the emergency state and engine actions while keeping the editor usable. Correcting and rereading it cleared the false input without resetting the workspace; explicit answers to all four safety questions enabled checks.
- One normal interactive request using the existing configured provider returned **Live · needs evidence**. Supports, unknowns and would-change sections were populated; no contradiction was recorded. The engine capped the claim at mechanism level. No billing/quota settings were changed and no repeated live probes were run.
- The production UI rerun returned 90 cases, 46% right trade across all cases and 100% hazard pass. The headline explicitly identified the separate prepared hard-case subset. The rerun did not execute AI or silently score unavailable baselines.
- Full signed-cloud upload and message delivery were not retested in this browser pass. Their failure paths and token/owner checks are covered by offline tests.

Final gates: Node 20.20.2; recursive typecheck passed; 317 recursive tests passed; 9 evaluation tests passed; production web build passed. The CLI evaluation completed with 100% hazard pass and unchanged outcome metrics (67% hard-case, 35% simulated, 46% all-case right trade). Settings/building setup was checked at 390 × 844 with document width 390 px and no horizontal overflow. The one live review was successful; routine verification remained offline.
