# Deterministic engine

StackSense turns reported observations into a cautious next check and a probable-source Job Sheet. It does not establish liability or replace an on-site inspection. The engine is pure TypeScript in `packages/engine`: no network, wall-clock reads, or unseeded randomness. Callers supply case time and evidence; Zod schemas in `packages/contracts` define the shared state.

## What decides what

| Capability | Implementation |
| --- | --- |
| Chat and photo labels | AI reader; see [AI and privacy](ai.md) |
| Source hypotheses and posterior odds | Building graph, prototype priors and likelihood tables |
| Hazard gate and emergency actions | Deterministic scan of all incoming/raw evidence, before deduplication |
| Next check | Expected information gain divided by effort, access and delay penalties |
| Claim specificity, stopping and trade | Deterministic evidence caps and rules |
| Second Opinion | AI drafts; engine validates/caps the draft and retains control of odds/trades |
| Recovery and prevention | Recorded repair/moisture/professional evidence and weather rules |

## Evidence to a case

`createCase(building, {now, memory, caseId})` initializes an unanswered safety gate. Browser-created cases should use unique IDs, such as `crypto.randomUUID()`, rather than a shared building ID. `applyObservations` validates inputs, retains the ledger, evaluates hazards and replays relevant evidence. `splitCases` separates complaints at different victim flats; 202's complaint is not pooled into 402's inference. A source/check result can inform a relevant case through the building graph.

A repeated `eventKey` contributes once to inference. Conflicting duplicate reports remain visible to the safety scan. Poor photo quality contributes no defect evidence. Photo labels describe visible surface/zone, not moisture, cause or a model confidence threshold. A dry upper-flat floor is weak evidence against a hidden wet-area leak; it does not prove absence of a defect.

The graph relates floors, positions, shared stacks and external orientations. Hypotheses include source families, source areas and optional localized components. Priors depend on the building archetype and recorded professional findings. Likelihoods, component-localization weights and moisture thresholds are prototype assumptions documented in `packages/engine/DECISIONS.md`; they need contractor review and field validation. Correlated observations can still overstate evidence despite incident deduplication.

## Safety and checks

Any electrical-water, sagging-ceiling, fast-ingress or sewage hazard produces an emergency gate, fixed keep-away actions and no resident next checks. Unanswered hazard questions mean incomplete, never safe. Safety is evaluated before any inference deduplication.

Check candidates include duct, trap/grout, meter, ceiling, dye, flood, rain recheck, moisture and inspection. Locked access and absent meters exclude the corresponding resident checks. Completed informative checks and checks unable to change the action are excluded from ordinary ranking. The Why view retains excluded descriptors. A reviewer may request a safe specificity check; it cannot bypass locked access, absent meters or safety.

The score is expected entropy reduction in bits divided by `max(0.5, effort minutes) × access/delay penalty`. This is a prototype information/cost heuristic, not a monetary savings estimate.

A-T10 has two independent stop paths:

- A leading source has at least 0.80 posterior mass and there is no Second Opinion objection. Area and its localized child components count as one conserved source mass.
- The best available check score is below 0.05, including no available check. This produces “Remote evidence can't decide — inspect …”; it does not authorize a repair-trade claim. A score of exactly 0.05 continues.

Incomplete safety and a reopened case block ordinary decisions. Emergency takes precedence. An objection blocks the confidence path; it does not make a costly/unavailable check worthwhile. The CP1 correction preserves these thresholds rather than tuning them to hard-case outcomes.

## Review, Job Sheet and recovery

`applySecondOpinion(state, draft)` leaves posterior odds untouched. It caps area/component claims to supporting evidence; absent/invalid review becomes `review_failed`, `source: "fallback"`, and an unreviewed Job Sheet flag. The reviewer cannot choose trades or assign blame.

Job Sheets use deterministic trade tables and require a stopped, safe, unreopened case. Low-value inspection stops have no repair trade in `send`. A probable wet-area source normally sends a waterproofer/tiler, while `wc_connection` sends a plumber. A still meter can explain why supply plumbing work is not justified. Sheets include site verification, evidence IDs, access, unsupported work and responsibility links. They never decide who pays or invent a request timestamp.

Repair completion schedules Day-14 follow-up. Looking better is not equivalent to being dry. Paint readiness requires a suitable, fresh post-repair recorded moisture reading at the victim spot; relative readings or photos alone cannot make paint ready. Worsening or recurrence reopens the case and suppresses its repair sheet.

`whatIf` replays patches on a copy, preserves safety, and invalidates the old review when evidence changes. It does not turn a simulation into observed evidence. Prediction produces same-stack inspection requests, rain/forecast rechecks and seasonal reminders. Memory counts professional findings idempotently; prediction is an inspection suggestion, not a diagnosis in neighboring flats.

## Demonstrations and verification

The hero fixtures contain twelve deterministic simulated snapshots, including dry duct → still meter → source review → trap evidence → repair follow-up. Hero weather is explicitly simulated; archived Open-Meteo weather has separate attribution. Eight scenarios cover happy, hazard, locked, dark photo, lateral travel, rain, uncertainty and Break it. `simulateBuilding(seed)` produces repeatable building/evidence samples from prototype outcome models.

The current development smoke found the correct top family/flat in 48/60 seeded simulations after up to three checks. This is not field accuracy or the held-out evaluation. No hard-case files were opened or evaluation runner executed for these fixes. C's separately generated evaluation artifacts must retain their provenance and limitations; do not infer refreshed evaluation numbers from a green unit suite.

Run the project checks with Node 20 and pnpm 9:

```sh
pnpm -r typecheck
pnpm -r test
pnpm --filter web build
```

Further limitations include prototype priors/outcome probabilities, imperfect incident independence, limited building archetypes and visual ambiguity. High posterior odds mean probable source under this model; on-site verification remains necessary.
