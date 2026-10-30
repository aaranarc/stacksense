# Local live-path verification

Verified on 30 October 2026, with the key read server-side from apps/web/.env.local; no key or env file is committed.

- Production Next server: localhost:3127.
- POST /api/read with the pseudonymised messages parsed from fixtures-ai/chats/hero_blockA.txt: HTTP 200, mode live, five observations, no warnings.
- POST /api/second-opinion with fixtures/hero/state-05.json: HTTP 200, non-null needs_evidence verdict.
- Both outputs passed the existing Zod schemas; no schema relaxation or retry increase was needed.
- The default gemini-3.8-flash returned provider HTTP 503/high demand. A minimal probe succeeded with gemini-3.1-flash-lite; the local GEMINI_MODEL override was set to that available model and both routes then succeeded. Set the same override in Vercel if desired.
- This verifies the local live chat/review path, not photo accuracy or deployment readiness. Supabase credentials and a preview deployment remain unconfigured locally.
