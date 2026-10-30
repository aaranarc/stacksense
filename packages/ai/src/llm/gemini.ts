import { z } from "zod";
import type { Provider } from "./adapter";
const Envelope = z.object({candidates:z.array(z.object({content:z.object({parts:z.array(z.object({text:z.string().optional()}))})}))});
export function geminiProvider(config: {apiKey:string;model:string;fetch?:typeof fetch}): Provider {
  return async request => {
    const parts: object[] = [{text: request.user + (request.repair ? `\n${request.repair}` : "")}];
    for (const dataUrl of request.images) {
      const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      if (!match) throw new Error("Invalid image encoding");
      parts.push({inlineData:{mimeType:match[1],data:match[2]}});
    }
    const response = await (config.fetch ?? fetch)(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(config.model)}:generateContent`,{
      method:"POST",headers:{"Content-Type":"application/json","x-goog-api-key":config.apiKey},signal:request.signal,
      body:JSON.stringify({systemInstruction:{parts:[{text:request.system}]},contents:[{role:"user",parts}],generationConfig:{responseMimeType:"application/json",responseJsonSchema:request.jsonSchema}}),
    });
    if (!response.ok) throw new Error("Gemini request failed");
    const parsed = Envelope.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid Gemini envelope");
    return parsed.data.candidates[0]?.content.parts.map(p => p.text ?? "").join("") ?? "";
  };
}
