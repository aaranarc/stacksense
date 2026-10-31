# B2 handoff — A-T12 through A-T18

A/core supplies the real engine operations createCase, applyObservations, applySecondOpinion and whatIf; deterministic Job Sheet/recovery; POST /api/read; POST /api/second-opinion; and all six @stacksense/ai/browser helpers. B can connect these in adapters.ts. Keep Judge Mode scenario/simulator mocks until A-T20/A-T22, and link/upload/memory/weather mocks until their tasks land.

Before sending chat/photos, call pseudonymise and stripExif in the browser. Keep keyMap only in the browser. Sender maps, unknown safety questions, fallback warnings, and unreviewed Second Opinions must remain visible. applySecondOpinion(state, null) is the real missing-key result. whatIf invalidates a previous review when evidence changes; request a fresh review if desired.

## Environment for person A

Set these in apps/web/.env.local and the Vercel Preview/Production server environment, then restart/redeploy:

```text
LLM_PROVIDER=gemini
GEMINI_API_KEY=<your key>
GEMINI_MODEL=gemini-3.8-flash
```

Alternatively, to use the implemented OpenAI provider:

```text
LLM_PROVIDER=openai
OPENAI_API_KEY=<your key>
OPENAI_MODEL=gpt-4.1-mini
```

GEMINI_MODEL / OPENAI_MODEL are optional overrides; the shown values are the defaults. Only the selected provider is called; missing/failed/invalid output becomes labelled fallback after at most one repair retry. Provider model availability has not been verified against your account.

Optional persistent read cache:

```text
SUPABASE_URL=<your Supabase project URL>
SUPABASE_SERVICE_ROLE_KEY=<server service-role key>
```

The expected ai_cache columns are cache_key (unique text) and result (JSONB); provisioning/RLS migration is A-T23. Process-local caching works without Supabase. No secret has a NEXT_PUBLIC_ prefix. Public Supabase and magic-link variables in A8 are needed for later tasks, not this block's read/review fallback paths.

## Verification

No GitHub deployments existed during local verification. The production server was tested locally with no credentials: /api/read returned HTTP 200, mode fallback; /api/second-opinion returned HTTP 200, null. Live provider responses and a Vercel preview remain unverified.

From the repo root, set PREVIEW_URL to your deployed branch URL:

```bash
curl -sS "$PREVIEW_URL/api/read" -H 'Content-Type: application/json' --data-binary @fixtures-ai/chats/hero_request.json
python3 -c 'import json; print(json.dumps({"state":json.load(open("fixtures/hero/state-06.json"))}))' | curl -sS "$PREVIEW_URL/api/second-opinion" -H 'Content-Type: application/json' --data-binary @-
```

Hero states 00–11 are regenerated. The fixture reviewer is explicitly scripted, source fallback, and simulated; it is never presented as a live provider response. Step 03 weather and step 11 prevention remain placeholders for A-T19/A-T21. No actual damage photos have been supplied. Real API photo processing re-encodes metadata away before provider calls and returns unclear labels when unavailable.
