import { z } from "zod";
import type { Provider } from "./adapter";
import {ProviderHttpError} from "./errors";
import {guardLlmTransport} from "./guard";
const Envelope = z.object({choices:z.array(z.object({message:z.object({content:z.string().nullable()})}))});
export function openaiProvider(config: {apiKey:string;model:string;baseUrl?:string;fetch?:typeof fetch}): Provider {
  return async request => {
    const transport=config.fetch??fetch;guardLlmTransport(transport);
    const base=new URL(config.baseUrl??"https://api.openai.com/v1");
    if((base.protocol!=="https:"&&!(base.protocol==="http:"&&["localhost","127.0.0.1","[::1]"].includes(base.hostname)))||base.username||base.password||base.search||base.hash)throw new Error("Invalid AI provider base URL");
    const endpoint=base.href.replace(/\/$/,"");
    const content: object[] = [{type:"text",text:request.user + (request.repair ? `\n${request.repair}` : "")}];
    for (const image of request.images) content.push({type:"image_url",image_url:{url:image}});
    const response = await transport(endpoint.endsWith("/chat/completions")?endpoint:endpoint+"/chat/completions", {
      method:"POST",redirect:"error",headers:{"Content-Type":"application/json",Authorization:`Bearer ${config.apiKey}`},signal:request.signal,
      body:JSON.stringify({model:config.model,messages:[{role:"system",content:request.system},{role:"user",content}],response_format:{type:"json_schema",json_schema:{name:"stacksense",strict:true,schema:request.jsonSchema}},...(base.hostname==="api.openai.com"?{store:false}:{})}),
    });
    if (!response.ok) throw new ProviderHttpError(response.status);
    const parsed = Envelope.safeParse(await response.json());
    if (!parsed.success) throw new Error("Invalid OpenAI envelope");
    return parsed.data.choices[0]?.message.content ?? "";
  };
}
