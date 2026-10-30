import { createAdapter } from "./adapter";
import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";

export function serverAdapter() {
  if (typeof window !== "undefined") throw new Error("Server-only AI module");
  const provider = process.env.LLM_PROVIDER ?? "gemini";
  if (provider === "openai" && process.env.OPENAI_API_KEY) return createAdapter({provider:openaiProvider({apiKey:process.env.OPENAI_API_KEY,model:process.env.OPENAI_MODEL ?? "gpt-4.1-mini"})});
  if (provider === "gemini" && process.env.GEMINI_API_KEY) return createAdapter({provider:geminiProvider({apiKey:process.env.GEMINI_API_KEY,model:process.env.GEMINI_MODEL ?? "gemini-3.8-flash"})});
  return createAdapter();
}
