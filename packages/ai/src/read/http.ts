import { ReadRequest } from "@stacksense/contracts";
import { jsonBody, jsonResponse, rateLimiter } from "../http/common";
import { createReadService } from "./pipeline";
export function createReadHandler(opts:{service?:ReturnType<typeof createReadService>}={}) {
  const allowed=rateLimiter();
  return async(request:Request):Promise<Response>=>{
    if(request.method!=="POST") return jsonResponse({error:"POST required"},405,{Allow:"POST"});
    if(!allowed(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown")) return jsonResponse({error:"Rate limit exceeded"},429,{"Retry-After":"60"});
    if(!request.headers.get("content-type")?.includes("application/json")) return jsonResponse({error:"JSON required"},415);
    let input:unknown; try {input=await jsonBody(request,70*1024*1024);} catch {return jsonResponse({error:"Invalid or oversized JSON body"},400);}
    const parsed=ReadRequest.safeParse(input);
    if(!parsed.success) return jsonResponse({error:"Invalid read request"},400);
    const data=parsed.data;
    if(!data.buildingId || data.messages.length>2000 || data.photos.length>12 || data.messages.some(m=>m.text.length>20000) || new Set(data.messages.map(m=>m.id)).size!==data.messages.length || new Set(data.photos.map(p=>p.id)).size!==data.photos.length) return jsonResponse({error:"Invalid request limits or duplicate IDs"},400);
    for(const photo of data.photos) {
      const m=photo.dataUrl.match(/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
      if(!m||Buffer.byteLength(m[1]!,"base64")>4*1024*1024) return jsonResponse({error:"Photos must be JPEG/PNG/WebP and at most 4 MB"},400);
    }
    try {return jsonResponse(await (opts.service ?? createReadService())(data));}
    catch {return jsonResponse({error:"Photo could not be decoded or request could not be read"},400);}
  };
}
export const handleRead=createReadHandler();
