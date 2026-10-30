# AI implementation decisions

## A-T12
- WhatsApp dates detect DMY/MDY from a component over 12; ambiguous exports default to DMY. Timestamps without a zone default to IST (+330 minutes); callers can supply dateOrder/offsetMinutes. Invalid dates are discarded.
- Parsed sender names stay local until pseudonymise returns S01… and a separate browser-only keyMap. Known sender names, titled full names, phone numbers and emails are redacted; applications must let people review text for other personal details before submission. Attachment IDs are filenames or synthetic omitted-media IDs, not uploads.
- Photo quality uses prototype pixel thresholds, never AI confidence. Canvas re-encoding discards EXIF; crops must be made from the cleaned image. Helpers perform no network calls.

## A-T13
- All four prompt constants are exact copies of the Part E text blocks, with separate PROMPT_VERSION constants and byte-equivalence tests. The adapter uses prompt-specific schemas derived from shared contracts, then the read pipeline adds deterministic IDs, timestamps and provenance.
- Providers use native fetch with JSON Schema structured outputs, validated envelopes and Zod-validated data. Each operation gets two attempts maximum, with a 20-second timeout per attempt and one schema-error repair. Missing credentials return labelled fallback without a network call. Real provider behavior remains unverified until a key is supplied.
- The server factory reads LLM_PROVIDER and server-only keys. GEMINI_MODEL and OPENAI_MODEL may override the documented defaults. Browser entry points never import this factory. Provider request formats: https://ai.google.dev/gemini-api/docs/generate-content/structured-output and https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat .
