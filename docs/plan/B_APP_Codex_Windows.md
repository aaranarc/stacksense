# StackSense Build Plan — B: APP (Windows + Codex)

**You:** Windows · Codex · Antigravity · branch **`b/app`**
**You own:** everything in `apps/web/` **except** `src/app/api/**` and `public/eval/**` (A). That includes the mobile neighbour-check pages `src/app/c/[token]/**`. Plus `eval/hard-cases/`, the demo video, the README's GIF/video link, and the submission.
**In one line:** make the engine's decisions instantly readable — calm by default, detail one click away — and turn it into a 3-minute video judges remember.

**How to use this file:** do the human steps yourself; for each block paste the block's MASTER PROMPT from Part F into Codex; Codex executes the tasks in order, testing, committing and pushing after each. While Codex works, you do the human-only work (photos, hard-case truth checks, recordings, video).

---

# PART A — SHARED RULES (identical in both files)

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

## Block B0 · Fri 22:00–22:45 — Setup + photos (A is building the skeleton)

### B-T01 · Windows setup (human, 20 min)
- Install/verify Node 20 LTS, Git for Windows. PowerShell **as admin**: `corepack enable`, then `corepack prepare pnpm@9 --activate`.
- `git config --global core.autocrlf false` and `git config --global core.longpaths true`.
- Work in a short path: `C:\dev\`.
- **Photograph your home (20 min):** ≥14 photos — ≥4 clean walls, any real damp/stain/crack/peeling, bathroom duct/shaft wall, bathroom floor trap with grout, water meter if any. One without flash, one with. Name them `b_01.jpg…`. Note for each: surface, zone, clean? (send the photos + notes to A via Google Drive; A strips EXIF and stores them).
- When A says "CP0 done": `cd C:\dev && git clone <repo> && cd stacksense && git checkout -b b/app && pnpm i && pnpm --filter web dev` → open http://localhost:3000.
- `apps/web/.env.local`: `NEXT_PUBLIC_USE_MOCK_ENGINE=true`, `NEXT_PUBLIC_USE_MOCK_API=true`, `NEXT_PUBLIC_DEMO_MODE=true` (+ the `NEXT_PUBLIC_SUPABASE_*` values A sends).

## Block B1 · 22:45–03:30 — Main screen, Tier 1 (MUST-SHIP)

Component map (`apps/web/src/`):
```
styles/tokens.css                lib/adapters.ts  lib/labels.ts  lib/visual.ts
mocks/mockEngine.ts  mocks/mockApi.ts  mocks/states/state-00.json…
components/layout/TopBar.tsx  layout/Shell.tsx
components/feed/CaseFeed.tsx  feed/LedgerDrawer.tsx
components/building/CrossSection.tsx  building/Pills.tsx
components/odds/SourceBars.tsx
components/checks/NextCheck.tsx  checks/WhyDrawer.tsx
components/safety/EmergencyCard.tsx
components/import/PasteChat.tsx  import/SenderChips.tsx
components/photo/PhotoViewer.tsx
components/opinion/SecondOpinionBanner.tsx  opinion/SecondOpinionDrawer.tsx
components/tabs/RightTabs.tsx  tabs/JobSheetTab.tsx  tabs/DryPaintTab.tsx  tabs/NextLeakTab.tsx
components/judge/JudgePanel.tsx  judge/WhatIfSliders.tsx  judge/ScenarioPicker.tsx  judge/BreakIt.tsx  judge/EvalCard.tsx  judge/HowItDecided.tsx
components/phone/PhoneSimulator.tsx
app/page.tsx  app/print/[caseId]/page.tsx  app/c/[token]/page.tsx (+ steps)
```

### B-T02 · Design tokens (**push by 23:30**)
- `tokens.css` + Tailwind theme:
  - grey `#9CA3AF` = not assessed
  - amber `#D97706` = suspected / inspect
  - red `#DC2626` = leading source
  - green `#16A34A` = check passed (always with a date)
  - ink `#111827`; surface `#FFFFFF`; muted surface `#F9FAFB`; border `#E5E7EB`.
- Solid border = documented; dashed = hypothetical. Max three colours + grey on screen; **every colour has a text label**.
- Inter font; 8-pt spacing; radius 12; one primary button style; focus rings.
- `lib/visual.ts`: `statusOf(hypothesis|flat, state) → {colour, label, dashed}` — the **only** place colours are chosen.
- Framer Motion only when odds change (300 ms). No decorative animation.
**Done when:** a `/styleguide` page shows every token, button and status chip.

### B-T03 · Adapters + mocks
- `lib/adapters.ts` exactly as A6.
- `mocks/states/state-00…11.json`: hand-written from the contract (Codex generates them from the Zod schema in `packages/contracts`) following the hero story A9 step by step. Replace with A's `fixtures/hero/state-*.json` when they arrive (`git fetch && git checkout origin/a/core -- fixtures/hero`, then copy into `mocks/states/`).
- `mockEngine`: same signatures as A6; `applyObservations` advances to the next state file; `whatIf` returns a pre-made variant (`state-whatif-meter-moved.json` with send = plumber).
- `mockApi`: `read` returns `mocks/read-hero.json` after 600 ms with `mode:"cached"`; `secondOpinion` returns the state's opinion; `createLink` returns a fake `waUrl`.
**Done when:** the app runs fully on mocks.

### B-T04 · Shell + TopBar
- Desktop 3 columns (≈ 22% / 48% / 30%): left Case Feed, centre Cross-Section, right panel (bars → next check → Second Opinion line → tabs). Phone: single column, tabs become accordions.
- TopBar: `StackSense` · `Block A ▾` · `🇮🇳/🇬🇧` · `Scenario ▾` · `[Judge Mode]` · `Reset`.
**Done when:** layout matches the v3 wireframe at 1440 px and 390 px.

### B-T05 · CrossSection (the hero visual)
- SVG generated from `Building` (not hand-drawn), so Block A, the UK block and simulated buildings all render: floors × flats, duct between stacked bathrooms, sunken bathroom slab drawn as a recess, west wall with windows, terrace.
- Colour + label per flat/zone via `statusOf` ("402 · victim", "302 · duct dry · 31 Oct", "502 · leading source").
- Arrow from leading source to victim, animated only when the posterior changes.
- Click a flat → filter the feed to that flat.
**Done when:** hero states 00→11 visibly change the right flats.

### B-T06 · SourceBars ("Where is it from?")
- Top 5 hypotheses, whole %, bars animate on change, label at the level the Second Opinion allows ("502 bathroom area" until a component is allowed).
**Done when:** bars sum ≈ 100 with an "others" row.

### B-T07 · NextCheck + WhyDrawer
- Card: "302 duct-wall photo · 30 s" + one-line `why` + **[Send link]** (calls `api.createLink` → opens `waUrl` in a new tab; in demo mode also slides in the phone simulator) + `why? ▸`.
- WhyDrawer: table of all checks — check, flat, bits, effort, score, excluded reason (e.g., "no meter", "flat locked", "can't change the trade").
- When `stop.stopped`: card shows the stop reason instead.
**Done when:** works for states 00–11.

### B-T08 · Safety UI
- `emergency` → full-width red **EmergencyCard** with the engine's actions; everything else greyed with "Diagnosis stopped for safety".
- `incomplete` → amber strip "Safety questions unanswered — not marked safe".
**Done when:** a mock emergency state renders correctly.

### B-T09 · PasteChat
- Textarea + file drop (`.txt` export + images). Pipeline in the browser: `parseWhatsAppExport → pseudonymise → stripExif → qualityCheck` from `@stacksense/ai/browser` (until A pushes them ~10:00, call pass-through mocks), then `api.read`.
- Badge always visible: **Live / Cached / Fallback**, and "Demo data" when fixtures are shown. Warnings listed (e.g., "2 photos too dark — ask for retake").
- Button "Load demo chat" loads `hero_blockA.txt`.
**Done when:** demo chat → building lights up (mocks).

### B-T10 · SenderChips
- For each `senderMap` entry that is `null`: chip "S07 → [Flat ▾]"; choosing a flat re-maps that sender's observations and immediately re-runs `engine.applyObservations`.
**Done when:** an unresolved sender can be assigned in one tap.

### B-T11 · CaseFeed + PhotoViewer
- Feed: one row per incident (flat, zone, surface, time, provenance badge observed/reported/simulated), thumbnails, status dot; header opens LedgerDrawer (built in B-T25).
- PhotoViewer modal: whole view, detail crops with boxes, label "AI says: damp stain · ceiling", **✓ correct / wrong?** (wrong → choose surface/zone → `humanCorrected:true` → re-run engine).
**Done when:** correcting a label changes the bars.

**Push by 03:30. Sleep.**

## Block B2 · Sat 08:00–12:00 — Tier 1 finish (MUST-SHIP)

### B-T12 · 30 hard cases → tag `eval-frozen` (08:00–09:00, before A tunes anything)
You write these because you are **not** the engine author — that keeps the evaluation honest.
- `eval/hard-cases/<id>.json` = `{ id, title, building, steps: Observation[][], truth: { family, flatId, component|null, trade, emergency: boolean }, notes }`.
- Mix:
  - 6 plumbing (supply vs wet area; one where the meter moves);
  - 6 rain/façade (one that looks like plumbing);
  - 4 condensation (cold corner / kitchen / no rain link);
  - 4 hazard (must end in emergency);
  - 5 ambiguous (truth = "inspect", `trade: "general_inspector"`);
  - 5 locked-flat / missing-meter / dark-photo.
- Codex drafts the JSON; **you read every case and confirm the truth makes physical sense** (water flows down; a dry duct below a leak weakens a shaft leak; rain-linked stains on an external wall point to the façade).
- `git add eval/hard-cases && git commit -m "[app] B-T12 hard cases" && git tag eval-frozen && git push origin b/app --tags` → message A "eval-frozen pushed".

### B-T13 · Second Opinion UI
- Banner (always visible, one line): "⚠ Second Opinion: evidence supports the 502 bathroom area, not a specific component ▸"; colour by verdict (objection red, needs_evidence amber, no_objection grey-green, review_failed grey "Second Opinion unavailable — unreviewed").
- Drawer: supports / challenges / still unknown / what would change this.

### B-T14 · Job Sheet tab + PDF + WhatsApp share
- Sections: **Send** (trade + why) · **Don't send** (trade + why — visually prominent) · Access route · Verify on site · **Work not justified yet** · Safety flags · Evidence photos · Responsibility (links only) · UK: timestamp trail.
- Buttons: **Download PDF** → `/print/[caseId]` (A4 one page, print CSS, footer "Probable source — verify on site. Generated by StackSense") using `window.print()`; **Share on WhatsApp** → `https://wa.me/?text=` + short summary (source, send, don't send, link).
- No Job Sheet trade while `safety.status === "emergency"`.

### B-T15 · Dry & Paint tab
- Three separate pills: **Repair · Dry · Ready to paint** (never merged).
- Day-14 recapture card with due date and [Send link]; note "Looks better ≠ dry".
- Moisture-reading entry (value + unit %WME) → only this can turn "Ready to paint" green; "reopened" banner when a worse recapture arrives; recurrence flag.

### B-T16 · What-if sliders (component; lives in Judge Mode)
- Toggles bound to hero observations: "302 duct: dry ↔ wet", "502 meter: still ↔ moved", "trap grout: cracked ↔ ok", "202 after rain: yes ↔ no". Each change → `engine.whatIf` → bars, Second Opinion and Job Sheet trade update live.

### B-T17 · Mobile neighbour-check pages `/c/[token]` (phone-first, no login, EN/HI/MR switch)
- Data: `GET /api/link/verify?token` (mock until A-T23 ~15:30).
- Screen 1 **Why we're asking + consent**: "Your photo helps find where the water comes from — it can help clear your flat. Only the society/agent sees it." + checkbox (required).
- Screen 2 **4 safety questions** (water near switches/lights? ceiling sagging/bulging? water coming in fast? sewage smell?). Any "yes" → stop with emergency guidance, never ask them to approach. All four required.
- Screen 3 **Camera**: instructions for the check type; **ghost outline** (previous photo at 35% opacity if `ghostPhotoUrl`); `stripExif` + `qualityCheck` before upload; retake hint; `POST /api/upload`.
- Screen 4 **"Done — you've helped clear your flat."**
- Token `demo` works in demo mode with mocked data (for testing and the phone simulator).
**Done when:** full flow works on a 390 px viewport with mocks.

**Push by 11:45 → tell A "ready for CP1".**

### CP1 · 12:00–12:30
- After A merges: set your `.env.local` flags to `false`, `git fetch && git rebase origin/main`, run the hero case on the `main` preview with A, post the bug list.

## Block B3 · 12:30–16:30 — Tier 2 + Tier 3 UI (record video segments as each screen finishes)

### B-T18 · Judge Mode panel + Scenario picker
- Top-bar toggle opens a right-side panel: What-if sliders · Scenario picker (8: Happy path · Electrical hazard · Locked 502 · Dark photo · Horizontal beam travel · Wrong-trade save (rain) · Honest uncertainty · Break it) with **Next step ▸ / Play / Reset** · Evaluation card.
- Scenarios load from `engine.scenarios[id]` (mock: one scenario until A-T20 ~14:00).

### B-T19 · Evaluation card + How it decided
- `EvalCard` reads `/eval/latest.json`: table of methods (StackSense vs 5 baselines) × metrics; **ties and losses highlighted, not hidden**; robustness mini-table; AI block (photo accuracy, clean-wall false positives, F1 by language, cost per case); label "team-built test, not field accuracy". Placeholder "numbers pending" until A's file exists.
- `HowItDecided`: renders `state.trace` as steps ("302 duct dry → shaft 31% → 6%").

### B-T20 · Break it
- Judge picks building size + hidden true source → engine asks checks → judge answers (dry/wet, still/moved…) or "let the simulator answer" → end screen "Found <source> in N checks — 'blame the flat above' would have said <X>".

### B-T21 · Next Leak tab
- Same-stack inspections (302, 602 amber + reason + [Send link]); forecast re-checks ("Re-check 202 after Thu heavy rain — west wall"); seasonal items; Memory counts by family.

### B-T22 · Pills under the cross-section
- **Rain**: daily wind-driven rain on the selected wall with report dates as markers + "Weather data: Open-Meteo (CC-BY 4.0)".
- **Memory**: confirmed cases by family.
- **Slab ⓘ**: tooltip — tile · bedding · waterproofing membrane · RCC slab (tooltip only).

### B-T23 · Phone simulator
- Phone frame that slides in **only** during a neighbour check, renders `/c/[token]` in an iframe (or the same step components), slides out when the answer arrives.

### B-T24 · Region toggle 🇮🇳/🇬🇧
- `lib/labels.ts`: society → building/landlord · secretary → managing agent · nahani trap → floor gully/shower trap · flat 402 → Flat 12 (UK block) · languages EN/HI/MR → EN.
- Switches building (Block A ↔ UK block), Job Sheet responsibility links and shows the UK timestamp trail.

### B-T25 · Evidence ledger + timeline drawer
- Every observation: time, flat, kind, provenance badge, source message, photo links, human-corrected marker.

### B-T26 · Ghost recapture + edge-contrast toggle
- Dry & Paint: previous photo at 35% over the new one with a compare slider.
- PhotoViewer: toggle "edge contrast, not moisture" using `edgeContrast`.

### B-T27 · States and honesty badges
- Loading, empty and error states on every panel; "Demo data" badge on any fixture; Live/Cached/Fallback badge on AI results; no raw JSON anywhere.

### CP2 · 16:30–17:00
- Full click-through on the `main` preview: 8 scenarios, sliders, PDF, share, region toggle, phone simulator, mobile pages. Post bugs.

## Block B4 · 17:00–18:00
### B-T28 · Phone-width + accessibility pass
- 390 px: single column; cross-section scrolls horizontally; tabs as accordions.
- Buttons ≥ 44 px; focus states; alt text; colour never the only signal.

## FREEZE 18:00

## Block B5–B6 · 18:00–21:30
### B-T29 · Screen recordings (human)
- OBS Studio, 1920×1080, 30 fps, browser 100% zoom, clean profile, no bookmarks bar. Record each segment of the script separately (2 takes). Segments recorded earlier in B3 are re-recorded only if their screen changed.
### B-T30 · Video edit (human; Clipchamp or DaVinci Resolve), 3:00 max (confirm limit), captions on

| Time | Screen | Voice |
|---|---|---|
| 0:00–0:10 | Chat pasted → building lights up | "Two flats are damp. Where is the water from, and who do you send?" |
| 0:10–0:20 | Captions: wrong trade / broken ceiling / repaint | "Today: send someone, break something, repaint, repeat." |
| 0:20–0:45 | Next best check → **A's real phone footage** → 302 dry → shaft green; rain pill splits 202 off | "It asks the one neighbour whose answer matters most." |
| 0:45–1:00 | Meter still → supply drops | "Not the supply pipe, so not a plumber." |
| 1:00–1:15 | Second Opinion banner → trap photo | "It won't claim more than the evidence shows." |
| 1:15–1:35 | **Job Sheet** | "Right trade, first time, and what not to break." |
| 1:35–1:50 | What-if slider flips the meter → trade changes live | "Change the evidence and the decision changes. Not a script." |
| 1:50–2:05 | Dry & Paint: better photo, still not ready | "Looking better isn't dry. No repainting twice." |
| 2:05–2:25 | Next Leak: 302/602 amber; 202 forecast re-check; Memory +1 | "It predicts where to look next, from day one." |
| 2:25–2:45 | Evaluation card vs baselines, ties shown | "Measured, and honest where it only ties." |
| 2:45–3:00 | UK toggle (3 s) → link | "StackSense. Find the source. Send the right trade." |

### B-T31 · README additions + submission
- Add a 20-second GIF of the hero flow and the video link to A's README.
- **Submit by 21:30**: production URL (from A at 21:00), video (YouTube unlisted + direct upload if allowed), repo link (public if required). Screenshot the confirmation; send it to A.

---

# PART C — DEPENDENCIES

| You need from A | By | Until then |
|---|---|---|
| CP0 skeleton | 22:45 | set up Windows, take photos |
| `NEXT_PUBLIC_*` values | 23:00 | demo mode |
| `fixtures/hero/state-*.json` | 03:30 (refresh 12:00) | your hand-made `mocks/states/` |
| `@stacksense/ai/browser` | ~10:00 | pass-through mocks |
| `/api/read`, `/api/second-opinion` | 12:00 | `mockApi` |
| `scenarios`, `simulateBuilding` | ~14:00–15:00 | one mock scenario |
| `/api/link`, `/api/link/verify`, `/api/upload` | ~15:30 | mock responses |
| `public/eval/latest.json` | 17:30 (final 18:30) | "numbers pending" card |
| Real phone footage | 19:30 | record the phone simulator instead |
| Production URL | 21:00 | — |

| You deliver to A | By |
|---|---|
| `tokens.css` + Tailwind theme | 23:30 |
| 30 hard cases + tag `eval-frozen` | **09:00** |
| Branch ready for CP1 / CP2 | 11:45 / 16:15 |
| Bug lists | 12:30 / 17:00 |
| Submission confirmation | 21:30 |

---

# PART D — `apps/web/AGENTS.md` (B creates at B-T03; Codex reads it automatically, together with the root AGENTS.md)
```markdown
# apps/web — person B
Scope: apps/web/** EXCEPT src/app/api/** and public/eval/** (person A). Also eval/hard-cases/**.
Never edit packages/** or root config.

- Import engine and API ONLY through src/lib/adapters.ts. Types from @stacksense/contracts.
- The UI never computes odds, checks, trades or statuses. It renders EngineState.
- Colours only via src/lib/visual.ts: grey not assessed · amber suspected/inspect · red leading source ·
  green+date check passed · solid documented · dashed hypothetical · max 3 colours + grey · every colour
  has a text label · animate only when odds change.
- Calm by default: on screen = case feed, cross-section, bars, next check, Second Opinion line, 3 tabs.
  Everything else one click away (modal / drawer / pill / Judge Mode).
- Wording: "probable source", never "guilty". Responsibility = links only. Always show Live/Cached/Fallback
  and "Demo data" badges. No raw JSON in the UI. No money figures.
- Next.js App Router + TypeScript + Tailwind + Framer Motion. Must work at 390 px wide.
- Before every commit: pnpm --filter web typecheck && pnpm --filter web test && pnpm --filter web build.
- Commit "[app] <TASK-ID> <summary>", push origin b/app.
```

---

# PART E — UI COPY (use verbatim)

| Where | Text |
|---|---|
| Empty state | "Paste a WhatsApp or agent chat, or load the demo building." |
| Emergency | "Diagnosis stopped for safety." + engine actions |
| Incomplete | "Safety questions unanswered — not marked safe." |
| Second Opinion failed | "Second Opinion unavailable — treat this result as unreviewed." |
| Dry & Paint note | "Looks better ≠ dry. Only a moisture reading can mark this ready to paint." |
| Job Sheet footer | "Probable source — verify on site. Generated by StackSense." |
| Eval label | "Team-built test, not field accuracy." |
| Edge toggle | "Edge contrast, not moisture." |
| Mobile consent (EN) | "Your photo helps find where the water comes from — it can help clear your flat. Only the society or agent sees it." |
| Mobile consent (HI) | "आपकी फ़ोटो से पता चलेगा कि पानी कहाँ से आ रहा है — इससे आपका फ़्लैट क्लियर हो सकता है। इसे सिर्फ़ सोसाइटी या एजेंट देखेंगे।" |
| Mobile consent (MR) | "तुमच्या फोटोमुळे पाणी कुठून येतंय ते कळेल — त्यामुळे तुमचा फ्लॅट क्लिअर होऊ शकतो. हा फोटो फक्त सोसायटी किंवा एजंट पाहतील." |
| Mobile done | "Done — thank you. You've helped clear your flat." |
| Safety Qs | "Is there water near any switch, socket or light?" · "Is the ceiling sagging or bulging?" · "Is water coming in fast?" · "Is there a sewage smell?" |

(Have a Hindi/Marathi speaker in the team read the HI/MR lines once before the video.)

---

# PART F — PROMPTS TO PASTE INTO CODEX

**How to run:** open Codex in `C:\dev\stacksense` on branch `b/app`. Paste one MASTER PROMPT per block. While it runs, do the human tasks. If it stops, paste RESUME. To redo one task, use SINGLE-TASK. When Codex asks to run `pnpm`, `git push` or anything needing network, approve it; if your Codex can't push, run the git lines yourself after each task.

## F.1 MASTER — Block B1 (22:45–03:30)
```
Read AGENTS.md (root) and docs/plan/B_APP_Codex_Windows.md fully (Parts A, B, D, E).
First create apps/web/AGENTS.md from Part D.
Execute tasks B-T02, B-T03, B-T04, B-T05, B-T06, B-T07, B-T08, B-T09, B-T10, B-T11 in order, exactly as
specified in Part B, inside apps/web only. Use mocks (B-T03) for the engine and API — do not wait for person A.
Generate the mock EngineState JSON files from the Zod schemas in packages/contracts so they validate.
For each task:
 1. add a small Vitest/React Testing Library test or a schema validation test where it makes sense,
 2. implement,
 3. run pnpm --filter web typecheck && pnpm --filter web test && pnpm --filter web build until green,
 4. git add -A && git commit -m "[app] <TASK-ID> <summary>" && git push origin b/app,
 5. print "<TASK-ID> done — <what changed>".
B-T02 must be pushed first (person A's mobile work depends on it). Use the visual rules and UI copy exactly.
If something is ambiguous, choose the calmest, simplest UI consistent with the v3 wireframe, note it in
apps/web/DECISIONS.md, and continue. Stop after B-T11 is pushed.
```

## F.2a MASTER — hard cases (08:00–09:00)
```
Read docs/plan/B_APP_Codex_Windows.md task B-T12 and the contract in packages/contracts/src/index.ts.
Draft 30 hard cases as eval/hard-cases/<id>.json with the exact mix in B-T12. Each file must validate:
building is a valid Building (use Block A or the UK block from fixtures/ if present, else build one),
steps are arrays of valid Observations, truth has family, flatId, component|null, trade, emergency.
Write a script eval/hard-cases/validate.ts that Zod-validates all 30 and prints a table
(id, title, truth family, truth trade). Run it. Do NOT commit yet — I will review each case first.
```
**Human (30 min):** read every case; fix any truth that breaks physics; then:
`git add eval/hard-cases && git commit -m "[app] B-T12 hard cases" && git tag eval-frozen && git push origin b/app --tags` → tell A.

## F.2b MASTER — Block B2 (09:00–12:00)
```
Read AGENTS.md, apps/web/AGENTS.md and docs/plan/B_APP_Codex_Windows.md. git pull origin b/app.
If fixtures/hero/state-*.json exist on origin/a/core, copy them into apps/web/src/mocks/states/
(git checkout origin/a/core -- fixtures/hero, then copy; do not commit fixtures/ itself).
Execute B-T13, B-T14, B-T15, B-T16, B-T17 in order, exactly as specified. Use UI copy from Part E verbatim.
Mobile pages /c/[token] must work at 390 px with mocked /api/link/verify and /api/upload responses.
Same routine per task: test → implement → typecheck/test/build → commit "[app] <TASK-ID> ..." → push → print done.
Stop after B-T17 is pushed and print what still uses mocks.
```

## F.3 MASTER — Block B3 (12:30–16:30)
```
Read AGENTS.md, apps/web/AGENTS.md and docs/plan/B_APP_Codex_Windows.md. git fetch && git rebase origin/main.
Set NEXT_PUBLIC_USE_MOCK_ENGINE=false and NEXT_PUBLIC_USE_MOCK_API=false in apps/web/.env.local and fix any
integration issue that is inside my folders; if the bug is in person A's code, write it to INTEGRATION_BUGS.md
and continue.
Execute B-T18, B-T19, B-T20, B-T21, B-T22, B-T23, B-T24, B-T25, B-T26, B-T27 in order, exactly as specified.
Same routine per task. After each of B-T18, B-T21, B-T22 print "READY TO RECORD: <segment>" so I can record
that video segment. Stop after B-T27 is pushed.
```

## F.4 MASTER — Block B4 (17:00–18:00)
```
Execute B-T28 (phone-width + accessibility pass) across every screen and the /c/[token] pages.
Then fix everything listed in INTEGRATION_BUGS.md that is inside my folders. Same routine. Stop.
```

## F.5 MASTER — after freeze (bug fixes only)
```
Feature freeze is active. Only fix bugs I describe; no new features, no refactors.
Bug: <describe / paste error / screenshot description>. Fix inside my folders, test, build, commit
"[app] fix: ..." and push origin b/app.
```

## F.6 RESUME
```
Read AGENTS.md, apps/web/AGENTS.md and docs/plan/B_APP_Codex_Windows.md. Run git log --oneline -15 and
git status. Find the last task ID committed, finish any uncommitted work for the next task, and continue
with the remaining tasks of the current block in order with the same routine.
```

## F.7 SINGLE-TASK
```
Read AGENTS.md, apps/web/AGENTS.md and docs/plan/B_APP_Codex_Windows.md. Do ONLY task <TASK-ID> exactly as
specified in Part B (fix: <bug>). Test, typecheck, build, commit "[app] <TASK-ID> ..." and push origin b/app.
```

## F.8 Antigravity checks (paste into Antigravity's browser agent with your preview URL)
- **After B1:** "Open <preview-url> at 1440×900 and 390×844. Click 'Load demo chat', then step through the hero case. For each step screenshot the screen and report: which flats are coloured and how, the top bar, the next check, any console errors, any text overlapping or cut off."
- **After B2:** "Open <preview-url>. Open the Job Sheet tab, click Download PDF and report whether the print view fits one A4 page. Click Share on WhatsApp and report the URL it opens. Toggle each What-if slider and report how the bars and the 'Send' trade change."
- **After B3:** "Open <preview-url>, turn on Judge Mode, run all 8 scenarios with Play, and for each report the final state (emergency / job sheet trade / inspect X). Then run Break it with hidden source 'shared shaft' and report how many checks it took. Screenshot the evaluation card."
- **Mobile:** "Open <preview-url>/c/demo on 390×844. Complete consent, answer the four safety questions 'No', take/upload a photo, finish. Then repeat answering 'Yes' to 'water near a switch' and confirm it stops with emergency guidance. Screenshot every screen."

---

# PART G — CHECKLIST BEFORE EVERY PUSH
- [ ] `pnpm --filter web typecheck && pnpm --filter web test && pnpm --filter web build` green.
- [ ] Works with mocks **and** (after CP1) with real adapters.
- [ ] No colours, odds or trades computed outside `lib/visual.ts` / `EngineState`.
- [ ] `git diff --stat origin/main` touches only your folders.
- [ ] Message to A: preview URL, what's new, what still uses mocks.
