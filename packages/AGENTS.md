# packages/* — person A
- packages/engine is PURE TypeScript: no network, no Date.now() (use state.now), seeded randomness only.
- All types come from @stacksense/contracts; validate external data with Zod safeParse.
- Every exported function has a Vitest test; write the test first.
- Engine must keep the hero test (docs/plan A9) green after every change.
- packages/ai: every LLM output is validated; invalid → one repair retry → fallback with mode "fallback".
- Prompts live in packages/ai/src/llm/prompts/*.ts with a PROMPT_VERSION; copy them verbatim from plan Part E.
- Keys only server-side (route handlers). Browser helpers never import server code.
