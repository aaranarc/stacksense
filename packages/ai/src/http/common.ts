export function rateLimiter(limit=30,clock=Date.now) {
  const windows=new Map<string,{count:number;until:number}>();
  return (key:string):boolean=>{
    const now=clock();
    if(windows.size>10000) for(const [k,v] of windows) if(v.until<=now) windows.delete(k);
    if(windows.size>10000 && !windows.has(key)) return false;
    const row=windows.get(key); if(!row||row.until<=now) {windows.set(key,{count:1,until:now+60000});return true;}
    row.count++;return row.count<=limit;
  };
}
export async function jsonBody(request:Request,maxBytes:number):Promise<unknown> {
  if(Number(request.headers.get("content-length"))>maxBytes) throw new Error("body limit");
  const reader=request.body?.getReader(); if(!reader) throw new Error("missing body");
  let size=0;const chunks:Uint8Array[]=[];
  while(true) {const {done,value}=await reader.read();if(done) break;size+=value.byteLength;if(size>maxBytes){await reader.cancel();throw new Error("body limit");}chunks.push(value);}
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}
export function jsonResponse(data:unknown,status=200,extra:Record<string,string>={}) {
  return Response.json(data,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...extra}});
}
