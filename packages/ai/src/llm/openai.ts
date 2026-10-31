import { z } from "zod";
import type { Provider } from "./adapter";
const Envelope = z.object({choices:z.array(z.object({message:z.object({content:z.string().nullable()})}))});
export function openaiProvider(config: {apiKey:string;model:string;fetch?:typeof fetch}): Provider {
  return async request => {
    const content: object[] = [{type:"text",text:request.user + (request.repair ? `\n${request.repair}` : "")}];
    for (const image of request.images) content.push({type:"image_url",image_url:{url:image}});
    const response = await (config.fetch ?? fetch)("https://api.openai.com/v1/chat/completions", {
      method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${config.apiKey}`},signal:request.signal,
      body:JSON.stringify({model:config.model,messages:[{role:"system",content:request.system},{role:"user",content}],response_format:{type:"json_schema",json_schema:{name:"stacksense",strict:true,schema:request.jsonSchema}},store:false}),
    });
    if (!response.ok) throw new Error("OpenAI request failed");
    const parsed = Envelope.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid OpenAI envelope");
    return parsed.data.choices[0]?.message.content ?? "";
  };
}
