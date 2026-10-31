// C-T07 AI eval: keep only human-labelled lines, build a dataset for A's eval/runner-ai, run it live if any exist.
// Run: pnpm --filter @stacksense/engine exec tsx ../../eval/runner/ai.ts   (then the eval merge picks up ai.json)
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const DATA = fileURLToPath(new URL("../data/", import.meta.url));
const OUT = DATA + "labelled/";
const FIELDS = ["flatId", "room", "zone", "surface", "hazards", "kind"] as const;
type Row = { humanReviewed?: boolean; labels?: Record<string, unknown>; message?: unknown; language?: string };

/** A message row counts only when a human marked it reviewed and filled every label (null flat/room allowed only as explicit "none"). */
export function labelled(row: Row): boolean {
  return row.humanReviewed === true && !!row.labels && FIELDS.every((f) => f in row.labels!) &&
    Array.isArray(row.labels.hazards) && typeof row.labels.zone === "string" && typeof row.labels.surface === "string" && typeof row.labels.kind === "string";
}

export function prepare() {
  const file = existsSync(DATA + "messages.jsonl") ? "messages.jsonl" : "messages.draft.jsonl";
  const rows: Row[] = existsSync(DATA + file) ? readFileSync(DATA + file, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
  const messages = rows.filter(labelled);
  const csv = existsSync(DATA + "photos.csv") ? readFileSync(DATA + "photos.csv", "utf8").trim().split("\n") : [];
  const header = csv[0] ?? "", cols = header.split(",");
  const reviewedAt = cols.indexOf("humanReviewed"), pathAt = cols.indexOf("path");
  const photos = csv.slice(1).filter((l) => l.split(",")[reviewedAt] === "true")
    .map((l) => l.split(",").map((v, i) => (i === pathAt ? "../" + v : v)).join(",")); // paths stay relative to eval/data/
  return { file, total: rows.length, messages, photoTotal: Math.max(0, csv.length - 1), photos, header };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const p = prepare();
  console.log(`messages: ${p.messages.length} labelled of ${p.total} in eval/data/${p.file} (unlabelled skipped)`);
  console.log(`photos:   ${p.photos.length} labelled of ${p.photoTotal} in eval/data/photos.csv`);
  if (!p.messages.length && !p.photos.length) { console.log("No human-labelled data yet — AI eval skipped; latest.json keeps ai: null."); process.exit(0); }
  mkdirSync(OUT, { recursive: true });
  writeFileSync(OUT + "manifest.json", JSON.stringify({ placeholder: false, humanReviewed: true, label: "team-built test, not field accuracy" }, null, 2) + "\n");
  writeFileSync(OUT + "messages.jsonl", p.messages.map((r) => JSON.stringify(r)).join("\n") + (p.messages.length ? "\n" : ""));
  writeFileSync(OUT + "photos.csv", [p.header || "photoId,path,person,surface,zone,isClean,hasMeter,humanReviewed", ...p.photos].join("\n") + "\n");
  const env = fileURLToPath(new URL("../../apps/web/.env.local", import.meta.url));
  if (!existsSync(env)) { console.log("apps/web/.env.local missing — cannot run the live AI eval (needs the LLM key)."); process.exit(0); }
  // A's runner (eval/runner-ai) is run unmodified; it writes eval/results/ai.json.
  const r = spawnSync("pnpm", ["--filter", "@stacksense/engine", "exec", "tsx", `--env-file=${env}`, "../../eval/runner-ai/run.ts", "--live", "--data", OUT], { stdio: "inherit", env: { ...process.env, LIVE_LLM_TESTS: "1" } }); // explicit live opt-in (A's guard)
  process.exit(r.status ?? 1);
}
