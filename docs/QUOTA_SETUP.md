# Quota-safe AI configuration

The default provider remains Gemini. Cached successful read/photo results are checked before model configuration, even when keys are absent. Cache misses use this finite chain:

1. GEMINI_MODEL once.
2. Only on HTTP 429: distinct GEMINI_FALLBACK_MODEL once, if configured.
3. Only when both Gemini models return 429 and LLM_FALLBACK_PROVIDER=openai: the explicitly configured compatible provider.
4. Recheck cache, then return labelled fallback if no usable cached result exists.

HTTP errors do not enter the schema-repair retry. A successful response containing invalid JSON/schema may receive the existing one repair attempt on the selected model; rejected Gemini models are not restarted. Fully exhausted adapters make no additional requests for the remaining uncached photos in that read/upload. A provider timeout retains the existing bounded repair limit. This is not a distributed daily-quota counter; upstream quotas still apply. No billing or account setting is changed, and no paid fallback is selected automatically.

## Vercel variables

Set these as server variables for Production and Preview; keep keys secret:

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=<your existing free-tier key>
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODEL=gemini-3.8-flash
LIVE_LLM_TESTS=0
```

Absent environment variables default to GEMINI_MODEL=gemini-3.1-flash-lite and GEMINI_FALLBACK_MODEL=gemini-3.8-flash; explicit environment values override these defaults. These are the user-authorized model IDs; no handoff live probe confirms current capacity. Availability and quotas remain account/model dependent. The fallback must differ from the primary; an identical name is skipped.

Optional compatible fallback—omit these to stay Gemini-only:

```env
LLM_FALLBACK_PROVIDER=openai
OPENAI_BASE_URL=https://<active-compatible-provider>/<api-base>
OPENAI_MODEL=<its-structured-output-and-vision-model>
OPENAI_API_KEY=<its-key>
```

All three OPENAI_* settings are required, so an omitted endpoint cannot silently send fallback traffic to a paid default. A standard `/v1` base or legacy `/inference` base is preserved and `/chat/completions` is appended; a full chat-completions URL is also accepted. Credentials/query strings in the URL are rejected, redirects are not followed, and keys are sent only in headers. Choose a provider/model supporting the structured JSON schema and images used by this app. `LLM_PROVIDER=openai` can select that configured provider directly.

**GitHub Models is retired.** [GitHub's official documentation](https://docs.github.com/en/github-models) says its inference API was fully retired on July 30, 2026. The adapter supports its legacy OpenAI-compatible request/path format, but this cannot restore the retired service; do not rely on `models.github.ai` as a working free fallback. No account/provider connectivity was tested live for this change.

Restart/redeploy after changing environment variables. Existing Supabase/signing/origin variables remain necessary for storage and links.

## Tests, evaluation, warm-up and health checks

No live provider request is permitted from standalone diagnostics, tests, build-time work or evaluation unless LIVE_LLM_TESTS=1. Provider unit tests use mocked transports. Interactive Next/Vercel requests may use configured providers without this diagnostic opt-in; existing cached inputs use no live request. LIVE_LLM_TESTS is not a switch that disables real user requests.

`cache-demo.ts --live`, `eval/runner-ai --live` and baseline prefetch explicitly require the flag before provider work. To intentionally spend free quota, set LIVE_LLM_TESTS=1 for that command only; ordinary checks should leave it unset/0. Never automatically run a fresh live key probe during CP2 without that opt-in; use the known cached hero for routine integration checks.

The implementation was verified with simulated 429/503/schema responses, cache hits and guarded CLI failures, not live calls. The known canonical demo inventory remains in `fixtures-ai/cache/demo-status.json`.

ReadResult keeps its shared `mode` enum. Warnings include Live, Cached, Fallback, or exactly **Fallback (AI quota reached)** as appropriate. A cached result is never described as a fresh live call. Invalid/unavailable labels remain unclear; no confidence, meter digits or success is fabricated. Second Opinion retains its existing null → review_failed/unreviewed contract on failure.


## Free-tier operating budget

The team reports 20 requests/day per model for this free project; treat that as a small operational budget, not a universal promised limit. Google documents RPM, TPM and RPD limits, applied per project rather than API key, with daily reset at midnight Pacific. View the actual project/model limits in AI Studio; changing keys does not create a new project quota. Capacity and stated limits are not guaranteed. [Google rate-limit documentation](https://ai.google.dev/gemini-api/docs/rate-limits) (checked 31 October 2026).

Do not enable billing, change tier, loop retries, run live evaluation or repeatedly rotate keys to work around quota. A cache miss involving chat plus multiple photos may consume multiple requests, and one schema repair can consume another; model fallback is bounded per operation, not a shared daily counter. Prefer the exact demo chat/photos and cached upload instructions. When exhausted, Cached or labelled Fallback is an acceptable demo result. No live provider calls were made in the final A handoff; offline coverage, mocked quota transitions and no-key HTTP/UI paths were verified instead. A health check hitting a deployed interactive API is still a diagnostic: use cached known inputs unless LIVE_LLM_TESTS=1 was explicitly enabled for that check. The server cannot infer the purpose of an arbitrary HTTP client.
