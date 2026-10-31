# AI runner — A-T25 code only

Run the non-network placeholder smoke from the repo root:

`pnpm --filter @stacksense/engine exec tsx ../../eval/runner-ai/run.ts --placeholder`

It reads only eval/data/placeholder/messages.jsonl, photos.csv and synthetic JPEGs, and writes eval/results/ai.placeholder.json. This dataset is not human reviewed. The output is prominently labelled PLACEHOLDER SMOKE ONLY — NOT FIELD ACCURACY. It is not EvalResults for the public evaluation card and must not be merged into latest.json.

After actual human labels exist, supply a dataset directory with manifest.json (placeholder false, humanReviewed true), messages.jsonl rows {message: ChatMessage, labels: {flatId,room,zone,surface,hazards,kind}, language, humanReviewed: true}, and photos.csv columns photoId,path,person,surface,zone,isClean,hasMeter,humanReviewed. Message rows are evaluated as independent requests; include sender/flat context in each reference input. To evaluate complete conversations, extend grouping before interpreting per-case cost.

Live command (explicit opt-in):

`LIVE_LLM_TESTS=1 pnpm --filter @stacksense/engine exec tsx --env-file=../../apps/web/.env.local ../../eval/runner-ai/run.ts --live --data /absolute/dataset/path`

Set EVAL_INPUT_USD_PER_MILLION and EVAL_OUTPUT_USD_PER_MILLION to the applicable provider token rates. Costs are estimates from returned token usage and configured rates; missing usage/rates produce null, never an invented price. Placeholders make no provider calls and have zero API cost. Mean latency is measured for the entire read request, including preprocessing; output records modes, case counts and abstentions.

Field/language F1 uses set-based micro TP/FP/FN (null means no label); undefined denominators return null. Photo accuracy is surface accuracy. Clean-wall false positives count predicted damage, excluding explicit unclear abstentions; abstentions remain visible and reduce accuracy.

This is not A-T24. No engine evaluation, baselines, hard cases or frozen evaluation tag are accessed. Do not publish placeholder numbers as accuracy.

Live evaluation additionally requires LIVE_LLM_TESTS=1; --live alone never authorizes provider traffic. Leave it unset/0 for ordinary tests. The live runner uses the same bounded quota fallback as the server; no live evaluation was run for this change.
