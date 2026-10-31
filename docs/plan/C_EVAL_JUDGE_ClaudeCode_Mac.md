# StackSense Build Plan — C: EVALUATION, JUDGE MODE & STORY (Mac + Claude Code)

**You:** Mac · Claude Code · Antigravity · branch **`c/help`** · start **Sat 31 Oct, 07:45 IST**
**Context:** A (Mac + Codex) and B (Windows + Codex) started Friday night. A is far ahead: engine Tier 1, the AI read pipeline, Second Opinion, Job Sheet, Recovery and what-if are pushed on `a/core`. You take over the work that proves the product is real — **hard cases, evaluation, Judge Mode, README and the video edit** — so A and B can finish and polish.

**In one line:** you make the judges believe it — an honest evaluation they can see, a Judge Mode they can play with, and a story that lands in 3 minutes.

**Status when you start (from Friday night):**
- **A** finished A-T01…A-T18: skeleton, engine, AI read pipeline, `/api/read`, Second Opinion, Job Sheet, Recovery, what-if. Overnight A is doing A-T19…A-T23: weather, scenarios, prediction, simulator, magic links.
- **B** built the main screen overnight (B-T02…B-T11).
- All three plan files and the v3 idea doc are in `docs/plan/`.

## YOUR DAY AT A GLANCE

| Time (Sat) | Step | Claude Code prompt |
|---|---|---|
| 07:45 | **C-T00** setup: accept GitHub invite → clone → branch `c/help` → merge `a/core` → `pnpm i` → tests green → Gemini key from A into `apps/web/.env.local` → send Part 0 messages to A and B | — |
| 08:00–09:00 | **C-T01** 30 hard cases → review by hand → tag `eval-frozen` → push | F.1 |
| 09:00–11:00 | **C-T02** evaluation runner + 5 baselines (Claude Code) · **C-T03** you hand-label messages + photos meanwhile | F.2, F.3 |
| 11:00–12:00 | **C-T04** Judge Mode panel + scenario picker → push by 11:45 | F.4 |
| 12:00–12:30 | **CP1** — A merges; check Judge Mode on the live link | — |
| 12:30–14:00 | **C-T05** evaluation card + "How it decided" | F.5 |
| 14:00–15:00 | **C-T06** Break it | F.5 |
| 15:00–16:30 | **C-T07** robustness + AI eval + `latest.json` + `RESULTS.md` | F.5 |
| 16:30–17:00 | **CP2** — A merges; Antigravity click-through | F.6 |
| 17:00–18:00 | **C-T08** Judge Mode phone-width + polish | F.5 |
| **18:00** | **FREEZE** — no new features | |
| 18:00–20:00 | **C-T09** final numbers + README; voice line to B | F.5 |
| 20:00–21:15 | **C-T10** edit the 3-minute video; send links to B | — |

**Golden rules:** stay in your folders (Part 0) · never edit the engine to improve numbers · never touch hard cases after the tag · push after every task · ties and losses are shown, never hidden.

---

# PART 0 — OWNERSHIP CHANGE (this supersedes A2 and A12 in the other two plans)

| Moves to C | From | Notes |
|---|---|---|
| `eval/hard-cases/**` (B-T12) | B | You write them 08:00–09:00 and tag `eval-frozen`. You are not the engine author, so the test stays honest |
| `eval/runner/**`, `eval/results/**` (A-T24, A-T26) | A | Engine eval + baselines + robustness + merged numbers |
| `eval/data/**` (human labels in A-T25) | A | You hand-label messages and photos; A's `eval/runner-ai/` code stays A's — you run it |
| `apps/web/public/eval/**` | A | `latest.json` |
| `apps/web/src/components/judge/**` (B-T18 panel content, B-T19, B-T20) | B | B keeps the Judge Mode **toggle** in the TopBar and the **What-if sliders** in `components/whatif/` |
| `docs/RESULTS.md`, `README.md` text (A-T28 part) | A | A keeps `docs/engine.md`, `docs/ai.md` |
| Video **edit** (B-T30) | B | B still records the screen segments and submits |
| `docs/plan/C_EVAL_JUDGE_ClaudeCode_Mac.md` | — | This file, committed by you |

**Messages to send at 07:45 (copy-paste):**
- **To A:** "C is taking A-T24, A-T26, the human-label part of A-T25, README text and RESULTS.md. Please skip those. Make sure `@stacksense/ai` exports `singleLlmBaseline` and that `scenarios` + `simulateBuilding` are exported from the engine. Tell me when A-T20/A-T22 are pushed."
- **To B:** "C is taking B-T12 (hard cases), B-T19 (eval card), B-T20 (Break it) and the content of the Judge Mode panel (B-T18). Please keep the Judge Mode toggle in the TopBar and render `<JudgePanel state={state} onState={setState} />` from `@/components/judge/JudgePanel` when it's on. Put the What-if sliders in `src/components/whatif/WhatIfSliders.tsx` (not in judge/) and export it — I'll embed it. C also edits the video; you record the segments and submit."

---

# PART A — SHARED RULES (same as in A's and B's files; Part 0 above overrides ownership)

## A0. Strict operating rules (read twice)
1. **Two builders right now:** **A = Mac + Codex** (core: engine, AI, APIs, data, eval). **B = Windows + Codex** (app: every screen, Judge Mode, mobile pages, video, submission). The Claude Code teammate is unavailable; if they rejoin, see A12.
2. **Deadline:** submit by **21:30 IST, Sat 31 Oct**. **Feature freeze 18:00.** After the freeze: bug fixes, eval numbers, video, README only.
3. **Nothing is removed from the v3 plan.** Every module is in these files. But two people cannot finish all of it with certainty, so the order is strict:
   - **MUST-SHIP** (the submission is invalid without these): hero case live on the deployed link — paste chat → building lights up → odds bars → next best check → Second Opinion → Job Sheet → what-if sliders → Dry & Paint → evaluation card with real numbers → 3-minute video.
   - Then Tier 2, then Tier 3, in the task order given.
   - **Drop order if a checkpoint is missed** (drop from the top, one at a time, only when a checkpoint fails): ghost recapture → edge-contrast toggle → UK timestamp trail → phone simulator (if real phone footage exists) → labelled data 150→80 messages, 40→30 photos → Break it → forecast re-checks (keep same-stack) → Marathi text (keep English + Hindi).
4. **Stay in your folders** (A3). Never edit the other person's files. If you need a change there, message them.
5. **Never wait.** If the other person's piece isn't ready, use the mock described in your file and keep going.
6. **Push after every task**, minimum once an hour. A red build is never pushed.
7. **Codex runs the tasks; you supervise.** Paste the block's MASTER PROMPT (Part F), watch it, approve commands, and do the human-only tasks (photos, labels, footage, video) while it works.
8. **One source of truth:** these two plan files live in the repo at `docs/plan/`. Codex reads them from there.

## A1. Timeline (IST)

| Block | Time | A — Mac Codex (core) | B — Windows Codex (app) |
|---|---|---|---|
| B0 | Fri 22:00–22:45 | Repo skeleton + contracts + plan files → push `main` (**CP0 22:45**) | Windows setup; photograph your home; label photos |
| B1 | 22:45–03:30 | Engine Tier 1 core → hero fixtures pushed by 03:30 | Design tokens (push by 23:30), adapters, mocks, main screen Tier 1 |
| Sleep | 03:30–08:00 | **Sleep 4.5 h** | **Sleep 4.5 h** |
| B2 | Sat 08:00–12:00 | AI read pipeline + `/api/read` live; Second Opinion caps + route; Job Sheet; Recovery; whatIf | 08:00–09:00 write 30 hard cases → tag `eval-frozen`; then Second Opinion UI, Job Sheet tab, PDF, share, Dry & Paint, sliders, mobile pages |
| **CP1** | 12:00–12:30 | Merge both → hero case end-to-end on `main` preview (**must pass**) | Flip adapters to real |
| B3 | 12:30–16:30 | Weather, scenarios, locked flat, same-stack, memory, forecast, seasonal, simulator, magic links, upload, meter, eval runner + baselines, AI eval | Judge Mode, scenario picker, eval card, Break it, Next Leak, pills, phone simulator, region toggle, ledger, ghost, edge toggle; **record video segments as screens finish** |
| **CP2** | 16:30–17:00 | Merge → release candidate on `main` | Full click-through |
| B4 | 17:00–18:00 | Robustness, quota test, leftovers | Leftovers, phone-width, accessibility |
| **FREEZE** | 18:00 | | |
| B5 | 18:00–20:00 | Final eval → numbers; cache all demo inputs; real phone footage → B | Polish; final screen recordings; start editing |
| B6 | 20:00–21:30 | README + docs; **21:00 final merge, tag v1.0, production URL → B** | Finish video; **submit by 21:30** |

**Checkpoint rule:** if the hero case does not run end-to-end on `main` at 12:30, nobody starts any Tier 2/3 task until it does.

## A2. Repo layout and ownership

```
stacksense/                                   pnpm monorepo
├─ AGENTS.md  package.json  pnpm-workspace.yaml  tsconfig.base.json  .gitattributes  .gitignore  .nvmrc   (A)
├─ docs/plan/A_CORE_Codex_Mac.md  B_APP_Codex_Windows.md                                               (both, read-only after CP0)
├─ packages/contracts/   Zod schemas = the shared contract                    (A; additive changes only)
├─ packages/engine/      pure TS engine, scenarios, simulator                 (A)
├─ packages/ai/          LLM adapter, prompts, browser prep, weather, supabase, links   (A)
├─ apps/web/
│  ├─ src/app/api/**                 route handlers                           (A)
│  ├─ public/eval/latest.json        merged eval numbers                      (A)
│  └─ everything else (incl. src/app/c/[token]/** mobile pages, components, styles, mocks, adapters)   (B)
├─ fixtures/         hero + scenario states (generated by engine)             (A)
├─ fixtures-ai/      chats, photos, cached AI outputs, weather cache          (A)
├─ eval/hard-cases/  30 hard cases — written by B, tag eval-frozen            (B)
├─ eval/data/        labelled messages + photo labels                         (A writes messages; both label photos)
├─ eval/runner/  eval/runner-ai/  eval/results/                               (A)
├─ docs/engine.md  docs/ai.md  docs/RESULTS.md                                (A)
└─ README.md                                                                   (A writes text at B6; B adds GIF/video link)
```

Read-only access to the other person's work: `git fetch && git checkout origin/<their-branch> -- <path>` (copy into your tree; never commit edits to their files).

## A3. Git rules (strict)
- Branches: **A → `a/core`**, **B → `b/app`**. Nobody commits to `main` except A at checkpoints.
- After **every task**:
  ```bash
  pnpm -r typecheck && pnpm -r test        # B also: pnpm --filter web build
  git add -A && git commit -m "[core] A-T07 bayes update"   # B uses [app] B-T07 ...
  git push origin a/core                   # B: git push origin b/app
  ```
- Red build → fix before pushing. Never force-push. Never commit `.env*`, keys, real names or phone numbers.
- Windows (B), once: `git config --global core.autocrlf false && git config --global core.longpaths true`. Repo has `.gitattributes` `* text=auto eol=lf`.
- Codex and git: Codex runs commands inside a sandbox. When it asks to run `pnpm install` or `git push` (network), **approve it**. If your Codex setup can't push, run the three git lines yourself after each task — don't skip pushes.
- Vercel builds a preview URL for each branch. Test on it, not only on localhost.

## A4. Merges
| When | Who | What |
|---|---|---|
| CP0 22:45 | A | Skeleton + contracts + plan files on `main` |
| CP1 12:00 | A merges `a/core` then `b/app` into `main`; both rebase after | Flags flipped to real; hero case end-to-end |
| CP2 16:30 | A | Release candidate |
| FINAL 21:00 | A | Tag `v1.0`, promote to production |

Folders don't overlap → no merge conflicts. If a merge breaks the build, the owner of the broken file fixes it on their branch.

## A5. The contract — `packages/contracts/src/index.ts` (A commits this exact file at CP0)
Change rule after CP0: **additive optional fields only**, announced to the other person, committed by A.

```ts
import { z } from "zod";

// ---------- enums ----------
export const Region = z.enum(["IN", "UK"]);
export const Orientation = z.enum(["N", "NE", "E", "SE", "S", "SW", "W", "NW"]);
export const SourceFamily = z.enum([
  "upper_wet_area", "upper_supply", "shared_shaft", "facade_window",
  "roof_terrace", "condensation", "other",
]);
export const ClaimLevel = z.enum(["mechanism", "area", "component"]);
export const SurfaceState = z.enum([
  "dry", "damp_stain", "active_blistering", "efflorescence", "mould", "crack", "peeling", "unclear",
]);
export const Zone = z.enum([
  "ceiling", "duct_wall", "window_perimeter", "external_wall", "skirting", "floor", "trap_grout", "meter", "other", "unclear",
]);
export const HazardType = z.enum(["water_near_electrics", "sagging_ceiling", "fast_ingress", "sewage"]);
export const Trade = z.enum([
  "plumber", "waterproofer_tiler", "roofer", "facade_sealant", "plasterer_decorator",
  "ventilation", "electrician", "structural_engineer", "general_inspector",
]);
export const CheckType = z.enum([
  "duct_photo", "trap_grout_photo", "meter_check", "ceiling_photo", "dye_test",
  "flood_test", "rain_recheck", "moisture_reading", "inspect",
]);

// ---------- building ----------
export const Flat = z.object({
  id: z.string(),                       // "402"
  floor: z.number().int(),
  position: z.string(),                 // "02"
  wetAreas: z.array(z.enum(["bathroom", "kitchen", "wc"])),
  externalWalls: z.array(Orientation),
  hasWaterMeter: z.boolean(),
  access: z.enum(["open", "locked", "unknown"]),
});
export const Stack = z.object({
  id: z.string(),
  kind: z.enum(["wet_stack", "duct", "rainwater_pipe"]),
  flatIds: z.array(z.string()),
});
export const Building = z.object({
  id: z.string(), name: z.string(), region: Region,
  archetype: z.enum(["MUMBAI_RCC_1990S", "UK_1960S_BLOCK", "GENERIC"]),
  lat: z.number(), lon: z.number(), floors: z.number().int(), hasTerrace: z.boolean(),
  flats: z.array(Flat), stacks: z.array(Stack),
});

// ---------- input from chat / phone ----------
export const ChatMessage = z.object({
  id: z.string(), at: z.string().datetime(),
  senderKey: z.string(),                // pseudonymised, e.g. "S07"
  text: z.string(), attachmentIds: z.array(z.string()),
});
export const Box = z.object({ x: z.number(), y: z.number(), w: z.number(), h: z.number(), label: z.string() });
export const PhotoLabel = z.object({
  photoId: z.string(), surface: SurfaceState, zone: Zone,
  quality: z.enum(["ok", "too_dark", "blurry", "too_far"]),
  boxes: z.array(Box), meterDigits: z.string().nullable(),
  humanCorrected: z.boolean(),
});
export const Observation = z.object({
  id: z.string(),
  flatId: z.string().nullable(),
  eventKey: z.string(),                 // same physical event → same key → counted once
  at: z.string().datetime(),
  kind: z.enum([
    "complaint", "denial", "check_result", "meter_reading", "moisture_reading",
    "professional_finding", "repair_done", "recapture",
  ]),
  zone: Zone, surface: SurfaceState, room: z.string().nullable(),
  hazards: z.array(HazardType),
  hazardQuestionsAnswered: z.boolean(),
  checkId: z.string().nullable(),       // set when this answers a requested check
  meter: z.object({ start: z.number(), end: z.number(), minutes: z.number() }).nullable(),
  moisture: z.object({ value: z.number(), unit: z.enum(["%WME", "relative"]) }).nullable(),
  finding: z.object({ family: SourceFamily, component: z.string().nullable() }).nullable(),
  photoIds: z.array(z.string()), sourceMessageIds: z.array(z.string()),
  provenance: z.enum(["observed", "reported", "simulated"]),
  rawText: z.string(),                  // pseudonymised text; safety backstop scans it
});

// ---------- engine state ----------
export const Hypothesis = z.object({
  id: z.string(), family: SourceFamily, level: ClaimLevel, label: z.string(),
  flatId: z.string().nullable(), stackId: z.string().nullable(), orientation: Orientation.nullable(),
  parentId: z.string().nullable(),      // component → area → mechanism
});
export const RankedCheck = z.object({
  id: z.string(), type: CheckType, targetFlatId: z.string().nullable(),
  effortMin: z.number(), accessPenalty: z.number(),
  expectedBits: z.number(), score: z.number(),
  why: z.string(), excluded: z.string().nullable(),
  instructions: z.object({ en: z.string(), hi: z.string(), mr: z.string() }),
});
export const Safety = z.object({
  status: z.enum(["ok", "incomplete", "emergency"]),
  reasons: z.array(z.string()), actions: z.array(z.string()),
});
export const SecondOpinion = z.object({
  verdict: z.enum(["objection", "needs_evidence", "no_objection", "review_failed"]),
  allowedLevel: ClaimLevel, claim: z.string(),
  supports: z.array(z.string()), challenges: z.array(z.string()),
  unknown: z.array(z.string()), wouldChange: z.array(z.string()),
  source: z.enum(["llm", "fallback"]),
});
export const JobSheet = z.object({
  caseId: z.string(), region: Region,
  probableSource: z.string(), level: ClaimLevel,
  send: z.array(z.object({ trade: Trade, why: z.string() })),
  dontSend: z.array(z.object({ trade: Trade, why: z.string() })),
  access: z.string(), verifyOnSite: z.array(z.string()),
  notJustifiedYet: z.array(z.string()), safetyFlags: z.array(z.string()),
  evidencePhotoIds: z.array(z.string()),
  responsibilityLinks: z.array(z.object({ label: z.string(), url: z.string().url() })),
  timestampTrail: z.array(z.object({ label: z.string(), at: z.string() })),
});
export const Recovery = z.object({
  repair: z.enum(["not_started", "done"]),
  dry: z.enum(["unknown", "not_dry", "dry"]),
  paint: z.enum(["not_ready", "ready"]),
  day14DueAt: z.string().nullable(), reopened: z.boolean(), flags: z.array(z.string()),
});
export const Prediction = z.object({
  sameStack: z.array(z.object({ flatId: z.string(), why: z.string() })),
  forecastRechecks: z.array(z.object({ flatId: z.string(), orientation: Orientation, afterDate: z.string(), why: z.string() })),
  seasonal: z.array(z.string()),
  memory: z.record(SourceFamily, z.number()),
});
export const TraceStep = z.object({
  step: z.number(), observationId: z.string().nullable(),
  changes: z.array(z.object({ hypothesisId: z.string(), before: z.number(), after: z.number(), why: z.string() })),
});
export const EngineState = z.object({
  caseId: z.string(), now: z.string(), building: Building,
  observations: z.array(Observation), photoLabels: z.array(PhotoLabel),
  hypotheses: z.array(Hypothesis), posterior: z.record(z.string(), z.number()),
  safety: Safety, nextChecks: z.array(RankedCheck),
  stop: z.object({ stopped: z.boolean(), reason: z.string().nullable() }),
  secondOpinion: SecondOpinion.nullable(), jobSheet: JobSheet.nullable(),
  recovery: Recovery, prediction: Prediction, trace: z.array(TraceStep),
});

// ---------- weather ----------
export const RainSeries = z.object({
  lat: z.number(), lon: z.number(),
  hourly: z.array(z.object({ t: z.string(), precipMm: z.number(), windDirDeg: z.number(), windSpeedMs: z.number() })),
  source: z.enum(["open-meteo-archive", "open-meteo-forecast", "fixture"]),
});

// ---------- API payloads ----------
export const ReadRequest = z.object({
  buildingId: z.string(), messages: z.array(ChatMessage),
  photos: z.array(z.object({ id: z.string(), dataUrl: z.string() })),
});
export const ReadResult = z.object({
  observations: z.array(Observation), photoLabels: z.array(PhotoLabel),
  senderMap: z.record(z.string(), z.string().nullable()),   // senderKey → flatId | null
  warnings: z.array(z.string()), mode: z.enum(["live", "cached", "fallback"]),
});
export const SecondOpinionRequest = z.object({ state: EngineState });
export const LinkRequest = z.object({ caseId: z.string(), checkId: z.string(), flatId: z.string(), lang: z.enum(["en", "hi", "mr"]) });
export const LinkResult = z.object({ url: z.string().url(), token: z.string(), waUrl: z.string().url() });

// ---------- evaluation ----------
export const EvalRow = z.object({
  method: z.string(), rightTrade: z.number(), top1: z.array(z.number()),   // after 1,2,3 checks
  overclaim: z.number(), harmfulFlips: z.number(), checksToDecision: z.number(),
  hazardPass: z.number(), msPerCase: z.number(),
});
export const EvalResults = z.object({
  generatedAt: z.string(), label: z.literal("team-built test, not field accuracy"),
  sets: z.object({ simBuildings: z.number(), hardCases: z.number(), photos: z.number(), messages: z.number() }),
  rows: z.array(EvalRow),
  robustness: z.array(z.object({ priorShiftPct: z.number(), top1: z.number() })),
  ai: z.object({
    photoAccuracy: z.number(), cleanWallFalsePositive: z.number(),
    f1ByField: z.record(z.string(), z.number()), f1ByLanguage: z.record(z.string(), z.number()),
    costPerCaseUsd: z.number(),
  }).nullable(),
});

export type Building = z.infer<typeof Building>;
export type Flat = z.infer<typeof Flat>;
export type ChatMessage = z.infer<typeof ChatMessage>;
export type PhotoLabel = z.infer<typeof PhotoLabel>;
export type Observation = z.infer<typeof Observation>;
export type Hypothesis = z.infer<typeof Hypothesis>;
export type RankedCheck = z.infer<typeof RankedCheck>;
export type SecondOpinion = z.infer<typeof SecondOpinion>;
export type JobSheet = z.infer<typeof JobSheet>;
export type EngineState = z.infer<typeof EngineState>;
export type RainSeries = z.infer<typeof RainSeries>;
export type ReadRequest = z.infer<typeof ReadRequest>;
export type ReadResult = z.infer<typeof ReadResult>;
export type EvalResults = z.infer<typeof EvalResults>;
```

## A6–A7. Interfaces

**Engine — `@stacksense/engine` (A). Pure functions, no network:**
```ts
createCase(building: Building, opts?: { memory?: Record<SourceFamily, number>; now?: string }): EngineState
applyObservations(state: EngineState, obs: Observation[], ctx?: { rain?: RainSeries; forecast?: RainSeries; photoLabels?: PhotoLabel[] }): EngineState
applySecondOpinion(state: EngineState, draft: SecondOpinion | null): EngineState
whatIf(state: EngineState, patches: { observationId: string; patch: Partial<Observation> }[]): EngineState
scenarios: Record<ScenarioId, { title: string; building: Building; steps: Observation[][]; rain?: RainSeries; forecast?: RainSeries }>
simulateBuilding(seed: number, opts?: { hiddenFamily?: SourceFamily }): { building: Building; truth: Hypothesis; answer(check: RankedCheck): Observation }
type ScenarioId = "happy" | "electrical_hazard" | "locked_502" | "dark_photo" | "beam_travel" | "wrong_trade_rain" | "honest_uncertainty" | "break_it";
```

**API + browser helpers (A):**
| Endpoint / function | In → Out |
|---|---|
| `POST /api/read` | `ReadRequest` → `ReadResult` |
| `POST /api/second-opinion` | `SecondOpinionRequest` → `SecondOpinion \| null` |
| `GET /api/weather?lat&lon&start&end` | → `RainSeries` |
| `GET /api/forecast?lat&lon` | → `RainSeries` |
| `POST /api/link` | `LinkRequest` → `LinkResult` |
| `POST /api/upload` (multipart: token, photo) | → `ReadResult` |
| `GET/POST /api/memory?buildingId` | Building Memory counts |
| `GET /api/link/verify?token` | → `{ caseId, checkId, flatId, lang, checkType, instructions, ghostPhotoUrl \| null }` |
| `@stacksense/ai/browser` | `parseWhatsAppExport`, `pseudonymise`, `stripExif`, `qualityCheck`, `makeCrops`, `edgeContrast` |

**App (B) consumes both through one file `apps/web/src/lib/adapters.ts`:**
```ts
const USE_MOCK_ENGINE = process.env.NEXT_PUBLIC_USE_MOCK_ENGINE === "true";
const USE_MOCK_API    = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";
export const engine = USE_MOCK_ENGINE ? mockEngine : realEngine;
export const api    = USE_MOCK_API    ? mockApi    : realApi;
```
At CP1 both flags become `false` on `main`. No code edits needed.

## A8. Environment variables (A creates and adds to Vercel; B gets only `NEXT_PUBLIC_*`; each keeps a local `.env.local`, never committed)
```
LLM_PROVIDER=gemini                # or openai
GEMINI_API_KEY=...                 # server only
OPENAI_API_KEY=...                 # server only (fallback provider)
SUPABASE_URL=...  SUPABASE_SERVICE_ROLE_KEY=...      # server only
NEXT_PUBLIC_SUPABASE_URL=...  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
MAGIC_LINK_SECRET=...              # 32+ random chars
NEXT_PUBLIC_DEMO_MODE=true         # bundled fixtures if backend is down
NEXT_PUBLIC_USE_MOCK_ENGINE=true   # B only, until CP1
NEXT_PUBLIC_USE_MOCK_API=true      # B only, until CP1
```

## A9. The hero case (everyone builds toward this exact story)
**Building "Block A":** Mumbai, 6 floors, flats x01 and x02 per floor (101…602). x02 bathrooms are stacked over a shared duct (stack `S-x02`). x02 flats have a west-facing external wall with a window. Archetype `MUMBAI_RCC_1990S` (sunken bathroom slabs). 502 **has** a water meter. Terrace above floor 6.

| Step | Event | Expected engine behaviour |
|---|---|---|
| 1 | 402: bathroom ceiling stain (photo) · 202: wall stain near window (photo, after rain) · 502: "our floor is dry" | Safety ok → observations lit on the cross-section |
| 2 | AI reads photos | 402 stain near duct corner; 202 external wall with efflorescence |
| 3 | Rain join | 202's report follows heavy west-facing rain → façade hypothesis for 202 rises |
| 4 | 502 "floor dry" | Barely moves anything (sunken-slab leak rarely wets the tiles above) |
| 5 | Next best check = **302 duct-wall photo** | Photo dry → shaft drops, 302 green; 202 splits off as a separate façade case |
| 6 | Next = **502 meter check** (meter exists) | Meter still → upper supply drops |
| 7 | Second Opinion | "Evidence supports the 502 bathroom **area**, not a component" → asks for trap photo |
| 8 | Trap photo | Cracked grout at trap → component "probable" |
| 9 | Job Sheet | Send waterproofer/tiler · **don't** send plumber (meter ruled out supply) · verify with flood test · don't break 402's ceiling |
| 10 | Repair → Day 14 recapture | Looks better but **not ready to paint** until a moisture reading |
| 11 | Predict & Prevent | 302 and 602 amber for 1-minute inspection photos · Memory +1 wet-area · 202 re-check after next forecast heavy rain |

## A10. Trust rules (code reviews reject anything that breaks these)
1. "Probable source", never "guilty flat". Who pays = links only.
2. A photo cannot measure moisture. `paint: "ready"` requires a recorded moisture reading.
3. No invented money figures. Use "work not justified yet".
4. No meter check where `hasWaterMeter === false`.
5. Prevention = inspection first, never bundled repairs.
6. No self-reported AI confidence used as a threshold anywhere.
7. AI down → labelled fallback (`mode: "fallback"`, `source: "fallback"`), never a fake result.
8. Pseudonymise and strip EXIF **before** anything leaves the browser; photos private; consent on every neighbour request.
9. An unanswered hazard question = `incomplete`, never `safe`. Never ask anyone to approach a hazard.
10. Every demo fixture says `provenance: "simulated"` or carries a "demo data" label in the UI.

## A11. Definition of done
- [ ] Production URL runs the hero case end-to-end with real API calls; every demo input also has a cached fallback; app still works with the LLM key removed (labelled fallback).
- [ ] All 8 scenarios load in Judge Mode; sliders change bars, Second Opinion and Job Sheet live.
- [ ] Eval card shows real numbers labelled "team-built test, not field accuracy", ties/losses visible; hazard pass rate 100%.
- [ ] 3-minute video with real phone footage; README; submission sent by 21:30 IST with screenshot of confirmation.

## A12. If the Claude Code teammate rejoins
Give them, in this order, whatever is not started yet: (1) A's eval runner + baselines + robustness (A-T24…A-T26), (2) B's Judge Mode panel (B-T18…B-T20) as their own folder `apps/web/src/components/judge/**`, (3) README. They work on branch `c/help`, follow the same git rules, and A merges them at the next checkpoint.

## A13. Still to confirm today
Judging criteria, video length, exact deadline hour (email organiser). Whether anyone's building has a per-flat water meter (for real meter footage). Contractor review of priors/trade table — if none, label tables "prototype, contractor review pending".

---

# PART B — YOUR TASKS (in strict order)

## C-T00 · Setup (07:45–08:00, human)
First accept the GitHub invite (email, or github.com/aaranarc/stacksense/invitations). Install Node 20 if needed (`node -v`).
```bash
mkdir -p ~/dev && cd ~/dev
git clone https://github.com/aaranarc/stacksense.git && cd stacksense
git fetch --all
git checkout -b c/help origin/main
git merge origin/a/core --no-edit        # you need A's engine, contracts and fixtures locally (do not edit them)
corepack enable && pnpm i
pnpm -r typecheck && pnpm -r test        # must be green before you start
```
- Ask A for the server env values (`LLM_PROVIDER`, `GEMINI_API_KEY`) and put them in `apps/web/.env.local` — you need them for the single-LLM baseline and the AI eval. Never commit `.env*`.
- Copy this file to `docs/plan/C_EVAL_JUDGE_ClaudeCode_Mac.md`.
- Create `CLAUDE.md` at the repo root **only if it doesn't exist** — otherwise create `eval/CLAUDE.md` (Part D).
- Photograph your own home (≥14, ≥4 clean walls, duct wall, floor trap, meter if any) and add them to the dataset (C-T03).

> **Note on `git merge origin/a/core`:** you merge A's branch into yours only to build on it. Never edit A's or B's folders. At each checkpoint A merges `c/help` into `main` like the other branches.

## C-T01 · 30 hard cases → tag `eval-frozen` (08:00–09:00) — MUST-SHIP
- `eval/hard-cases/<id>.json` = `{ id, title, building, steps: Observation[][], truth: { family, flatId, component|null, trade, emergency: boolean }, notes }`.
- Mix (30):
  - 6 plumbing (supply vs wet area; one where the meter moves);
  - 6 rain/façade (one that looks like plumbing);
  - 4 condensation (cold corner / kitchen / no rain link);
  - 4 hazard (must end in emergency);
  - 5 ambiguous (truth = inspect, `trade: "general_inspector"`);
  - 5 locked-flat / missing-meter / dark-photo.
- Buildings: reuse `fixtures/hero/building.json` and `fixtures/uk/building.json`, plus 2–3 variants (different floors, no meter, top-floor victim).
- `eval/hard-cases/validate.ts`: Zod-validates all 30 against the contract and prints a table.
- **Rules:** do **not** look at the engine's likelihood or prior tables while writing truths. Truth comes from physics: water runs down; a dry duct below a suspected shaft leak weakens the shaft; rain-linked stains on an external wall point to the façade; condensation shows on cold corners without a rain link.
- Human (20 min): read every case, fix any truth that breaks physics.
- `git add eval/hard-cases && git commit -m "[eval] C-T01 hard cases" && git tag eval-frozen && git push origin c/help --tags` → tell A and B "eval-frozen pushed".

## C-T02 · Evaluation runner + baselines (09:00–11:00) — MUST-SHIP
Spec = A-T24, owned by you:
- `eval/runner/run.ts` (root script `pnpm eval` → point it at your runner if A's script points elsewhere; ask A to change the root script if needed — it's A's file).
- Imports the **same** `@stacksense/engine` the UI uses. Never re-implement engine logic.
- Sets: 60 simulated buildings (`simulateBuilding`, seeds 1–60; if A-T22 isn't pushed yet, start with hard cases only and add sims later) + the 30 frozen hard cases (**read-only after the tag**).
- Answer loop: for each case, the engine picks a check; the answer comes from the case's steps (hard cases) or `answer(check)` (sims); stop when the engine stops or after 5 checks.
- Baselines:
  1. **Blame the flat above:** source = `upper_wet_area@above(victim)`, trade = `waterproofer_tiler`.
  2. **Send a trade straight away:** most common trade for the archetype, no checks.
  3. **Fixed checklist:** checks in a fixed order (ceiling photo → duct photo → meter → trap photo) and the same engine posterior, no information-gain choice.
  4. **Single LLM with the same evidence:** `singleLlmBaseline` from `@stacksense/ai` (prompt E.4 in A's plan); cache outputs in `eval/runner/baseline-cache/<caseId>.json` so the run is reproducible. If the key is missing, mark this row "pending".
  5. **StackSense without the Second Opinion:** `applySecondOpinion` skipped.
- Metrics per method:
  - right-trade rate;
  - top-1 source after 1, 2 and 3 checks;
  - over-claim rate (claimed level above what the evidence supports);
  - harmful flips (a correct leader flipped to wrong by one observation);
  - checks to decision;
  - hazard pass rate (**must be 1.0** for StackSense — if not, report it to A immediately; it's a must-fix);
  - ms per case.
- Output `eval/results/engine.json` validated against `EvalResults` (`ai: null` for now).
- Tests: the runner is deterministic for a fixed seed; the metrics functions have unit tests.
- **Never edit the engine to improve numbers.** If StackSense loses or ties, that's a result. Report bugs to A with the case id.

## C-T03 · Labelled data (human, 09:00–12:00, while Claude Code does C-T02)
- `eval/data/photos.csv` — every team photo (A's, B's, yours): `photoId, person, surface, zone, isClean, hasMeter`. Label by eye **before** running any model. Target ≥40 photos, ≥10 clean walls (drop order allows 30).
- `eval/data/messages.jsonl` — ≥150 messages, half Hinglish/Marathi (drop order allows 80). Claude Code may draft realistic messages; **you label every line by hand**: `flatId, room, zone, surface, hazards, kind`. Include hazards, denials, noise and duplicates.
- Commit `[eval] C-T03 labelled data` and push.

## C-T04 · Judge Mode panel + scenario picker (11:00–12:00) — MUST-SHIP
- `apps/web/src/components/judge/JudgePanel.tsx` — props `{ state: EngineState; onState: (s: EngineState) => void }`. Sections (accordion, calm):
  1. **What-if** — embeds B's `WhatIfSliders` from `@/components/whatif/WhatIfSliders` (if not there yet, render a placeholder "What-if sliders — coming from B").
  2. **Scenarios** — `ScenarioPicker.tsx`: the 8 scenarios from `engine.scenarios` with **Next step ▸ / Play / Reset**. Play steps every 1.2 s. Each step: `engine.applyObservations` → `onState`. Then `applySecondOpinion` with the cached opinion if the scenario has one, else `null`.
  3. **Evaluation** — `EvalCard` (C-T05).
  4. **How it decided** — `HowItDecided` (C-T05).
  5. **Break it** — `BreakIt` (C-T06).
- Use B's design tokens and `lib/visual.ts` for colours (read-only). All engine and API access goes through B's `src/lib/adapters.ts` (import, don't edit).
- Push by 11:45 → tell A "c/help ready for CP1".

## CP1 · 12:00–12:30
- A merges `a/core`, `b/app`, then `c/help` into `main`. Check Judge Mode on the `main` preview with B. Then `git fetch && git rebase origin/main` (or merge `origin/main` into `c/help`).

## C-T05 · Evaluation card + How it decided (12:30–14:00) — MUST-SHIP
- `EvalCard.tsx` reads `/eval/latest.json` (fetch). Shows:
  - methods × metrics table: StackSense first, then the 5 baselines;
  - **ties and losses highlighted, not hidden** (a "tie" or "loses" chip);
  - robustness mini-table (prior shift −40/−20/+20/+40 → top-1);
  - AI block: photo accuracy, clean-wall false-positive rate, F1 by field and by language, cost per case;
  - counts of each set; label **"Team-built test, not field accuracy."**;
  - placeholder "numbers pending" if the file is missing.
- `HowItDecided.tsx` renders `state.trace` as plain steps: "302 duct dry → shared shaft 31% → 6%".
- Tests: renders with a fixture `EvalResults`; shows a "tie" chip when values are equal.

## C-T06 · Break it (14:00–15:00)
- `BreakIt.tsx`: the judge picks building size (small/medium/large → floors 4/6/10) and a hidden true source family (dropdown, or "surprise me").
- `engine.simulateBuilding(seed, {hiddenFamily})` → loop:
  - the engine asks a check;
  - the judge answers with buttons (dry/wet, still/moved, cracked/ok, appeared/none) **or** "let the simulator answer".
- End screen: "Found <source> in N checks — 'blame the flat above' would have said <X>." Show the trace.
- Safety: if the judge picks "electrical hazard", the emergency card must appear and the diagnosis stop.

## C-T07 · Robustness, AI eval run, merged numbers, RESULTS.md (15:00–16:30) — MUST-SHIP
- Robustness (A-T26): rerun the engine eval with priors shifted ±20% and ±40% (re-normalised) and at the archetype min/max → `robustness` array. If the engine has no hook for shifted priors, ask A for an `opts.priorShift` in `createCase` (additive, A's code).
- Run A's `eval/runner-ai` on `eval/data/` → `eval/results/ai.json`.
- `eval/runner/merge.ts` → `apps/web/public/eval/latest.json` (engine + ai), validated against `EvalResults`.
- `docs/RESULTS.md`: the full table; what each metric means in plain English; **every tie and loss written out** with one line on why; the set sizes; label "team-built test, not field accuracy"; how to reproduce (`pnpm eval`).
- Push → tell B "latest.json ready".

## CP2 · 16:30–17:00
- A merges. Click through all 8 scenarios and Break it on the `main` preview (Antigravity prompt F.6). Post bugs.

## C-T08 · Judge Mode QA + polish (17:00–18:00)
- Phone width (390 px): Judge panel becomes a bottom sheet; tables scroll horizontally.
- Keyboard and focus states; every colour has a text label.

## FREEZE 18:00

## C-T09 · Final numbers + README (18:00–20:00)
- 18:00: final `pnpm eval` on `main`, regenerate `latest.json` and `RESULTS.md`, push, tell A to merge.
- `README.md`:
  - one-liner + GIF placeholder (B adds the GIF);
  - **Try it**: production link, Judge Mode, the 8 scenarios, Break it;
  - the problem, in 4 lines;
  - how it works: the mermaid flow from the v3 plan §3;
  - what is AI and what isn't — link A's `docs/ai.md`;
  - evaluation summary table + link to `docs/RESULTS.md`;
  - trust rules;
  - architecture;
  - run locally (`pnpm i && pnpm --filter web dev`);
  - limitations (team-built test, prototype priors pending contractor review, no field validation yet);
  - team.
- Give B the 20-second eval-card voice line for 2:25–2:45 with the real numbers ("On 30 hard cases StackSense picked the right trade in X; blaming the flat above did Y; it ties on simple vertical leaks").

## C-T10 · Video edit (20:00–21:15, human; iMovie or DaVinci Resolve on Mac)
- Inputs: B's screen segments (by 19:45) and A's real phone footage (by 19:30).
- Follow the 3:00 script in B's plan (B-T30). Captions on, music low or none, product on screen within the first 10 seconds. Export 1080p MP4.
- 21:15: upload (YouTube unlisted + file) → send the links to B for submission.

---

# PART C — DEPENDENCIES

| You need | From | By | Until then |
|---|---|---|---|
| `main` + `a/core` with engine, contracts, fixtures | A | already there | — |
| `scenarios`, `simulateBuilding` exports | A | morning | hard cases only; one scenario |
| `singleLlmBaseline` export + LLM key | A | 09:00 | baseline 4 "pending" |
| `eval/runner-ai` code | A | 12:00 | — |
| `adapters.ts`, tokens, `lib/visual.ts`, `WhatIfSliders` | B | 11:00 | Tailwind defaults; placeholder |
| Screen segments | B | 19:45 | — |
| Phone footage | A | 19:30 | phone simulator recording |

| You deliver | To | By |
|---|---|---|
| Tag `eval-frozen` | A, B | **09:00** |
| `JudgePanel` | B (renders it), CP1 | 11:45 |
| `latest.json`, `RESULTS.md` | B (video, eval card) | 16:30, final 18:30 |
| README text | judges | 20:00 |
| Final video | B (submits) | 21:15 |

---

# PART D — `eval/CLAUDE.md` (Claude Code reads it)
```markdown
# C — evaluation, Judge Mode, README
Scope: eval/hard-cases/**, eval/runner/**, eval/results/**, eval/data/**, apps/web/public/eval/**,
apps/web/src/components/judge/**, docs/RESULTS.md, README.md, docs/plan/C_*.md.
Never edit packages/**, apps/web/src/app/api/**, other apps/web folders, eval/runner-ai/**, or root config.
If something outside scope must change, write the request to C_REQUESTS.md and tell the human.

- Engine and API only through @stacksense/engine and apps/web/src/lib/adapters.ts. Types from @stacksense/contracts.
- Never re-implement or tune engine logic to improve numbers. Ties and losses are reported, never hidden.
- Hard cases are frozen after tag eval-frozen: never edit eval/hard-cases/ after that tag.
- Every number shown to judges comes from eval/results/*.json produced by pnpm eval. Label: "team-built test, not field accuracy".
- UI: B's tokens and lib/visual.ts for colours; calm, text label on every colour; works at 390 px.
- Trust rules from docs/plan A10 apply (no "guilty", no money, hazard → emergency).
- After every task: pnpm -r typecheck && pnpm -r test && pnpm --filter web build;
  git add -A && git commit -m "[eval] <TASK-ID> <summary>" && git push origin c/help. Never push red.
```

---

# PART F — PROMPTS FOR CLAUDE CODE

**How to run:** `cd ~/dev/stacksense && claude`. Use plan mode (Shift+Tab) for C-T02 and C-T04, then let it execute. `/clear` between tasks. If it stops, use F.7.

## F.1 C-T01 hard cases (08:00)
```
I am person C. Read docs/plan/C_EVAL_JUDGE_ClaudeCode_Mac.md (Parts 0, A, B, D) and packages/contracts/src/index.ts.
Do task C-T01 only: draft 30 hard cases in eval/hard-cases/<id>.json with the exact mix, reusing
fixtures/hero/building.json and fixtures/uk/building.json plus 2–3 variants. Do NOT open packages/engine/src/priors
or tables — truths must come from building physics as described in the task. Write eval/hard-cases/validate.ts,
run it, and print the table (id, title, truth family, truth trade, emergency). Do not commit — I will review.
```
Then review by hand and run the commit + tag lines from C-T01.

## F.2 C-T02 evaluation runner (09:00)
```
I am person C. Read eval/CLAUDE.md and task C-T02 in docs/plan/C_EVAL_JUDGE_ClaudeCode_Mac.md.
Enter plan mode, propose the runner design (answer loop, 5 baselines, metric definitions), then implement it in
eval/runner/ using only the public exports of @stacksense/engine and @stacksense/ai. Tests first for the metric
functions and determinism. Run it on the frozen hard cases (and sims if simulateBuilding exists), write
eval/results/engine.json validated against EvalResults, print the results table, then typecheck/test/build,
commit "[eval] C-T02 runner + baselines" and push origin c/help. If hazard pass rate < 1.0, stop and list the
failing case ids for person A. Never edit engine code.
```

## F.3 C-T03 drafting help (while you label)
```
Draft 150 realistic housing-society WhatsApp messages for eval/data/messages.draft.jsonl — half Hinglish or
Marathi, about Block A (flats 101–602): leaks, damp, stains, denials ("our floor is dry"), hazards (water near
switch, sagging ceiling), noise, duplicates, meter readings. Fields: id, at, senderKey, text, language.
Leave ALL label fields empty — I will label by hand. Do not commit.
```

## F.4 C-T04 Judge Mode panel (11:00)
```
I am person C. Read eval/CLAUDE.md, task C-T04, and B's files apps/web/src/lib/adapters.ts, src/lib/visual.ts,
src/styles/tokens.css (read-only). Plan mode first, then build apps/web/src/components/judge/JudgePanel.tsx and
ScenarioPicker.tsx exactly as specified, importing WhatIfSliders from @/components/whatif/WhatIfSliders if it exists
(else a labelled placeholder). Add a small React Testing Library test. Typecheck/test/build, commit
"[eval] C-T04 judge panel" and push origin c/help. Print the one line B must add to render it.
```

## F.5 C-T05 / C-T06 / C-T07 (12:30 onward — paste one at a time)
```
I am person C. Read eval/CLAUDE.md and task <C-T05|C-T06|C-T07> in docs/plan/C_EVAL_JUDGE_ClaudeCode_Mac.md.
Pull first: git fetch && git merge origin/main --no-edit. Implement exactly as specified, tests first,
then typecheck/test/build, commit "[eval] <TASK-ID> <summary>" and push origin c/help. If you need a change in
someone else's folder, write it to C_REQUESTS.md and stop to tell me.
```

## F.6 Antigravity check (after CP1 and CP2)
"Open <main-preview-url> at 1440×900. Turn on Judge Mode. Run each of the 8 scenarios with Play and report the final state (emergency / Job Sheet trade / inspect X) with a screenshot. Run Break it three times (hidden source: shared shaft, façade, condensation) and report checks used. Screenshot the evaluation card and check that ties/losses are visible. Repeat at 390×844 and report layout problems and console errors."

## F.7 Resume
```
I am person C. Read eval/CLAUDE.md and docs/plan/C_EVAL_JUDGE_ClaudeCode_Mac.md. Run git log --oneline -15
and git status. Find the last C-T task committed, finish any uncommitted work, and continue with the next task.
```

---

# PART G — CHECKLIST BEFORE EVERY PUSH
- [ ] `pnpm -r typecheck && pnpm -r test && pnpm --filter web build` green.
- [ ] `git diff --stat origin/main` touches only C's folders (plus merges from `main`).
- [ ] Hard cases untouched since `eval-frozen` (`git diff eval-frozen -- eval/hard-cases` is empty).
- [ ] Every number on screen traces to `eval/results/*.json`.
- [ ] Message to A/B: what changed, what they can use.
