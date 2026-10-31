import {createHmac,createHash,randomBytes,timingSafeEqual} from "node:crypto";
import {z} from "zod";
import {LinkRequest} from "@stacksense/contracts";
const Claims=LinkRequest.extend({expiresAt:z.number().int(),nonce:z.string().min(20)});
export function createTokenCodec(secret:string,now=Date.now) {
 if(Buffer.byteLength(secret)<32)throw new Error("MAGIC_LINK_SECRET must have at least 32 bytes");
 const sign=(data:string)=>createHmac("sha256",secret).update(data).digest("base64url");
 return {
  issue(input:z.infer<typeof LinkRequest>){const data=Buffer.from(JSON.stringify({...LinkRequest.parse(input),expiresAt:now()+48*3600000,nonce:randomBytes(24).toString("base64url")})).toString("base64url");return `${data}.${sign(data)}`;},
  verify(token:string){if(token.length>4096)throw new Error("Invalid token");const [data,sig,...extra]=token.split(".");if(!data||!sig||extra.length)throw new Error("Invalid token");const expected=Buffer.from(sign(data)),actual=Buffer.from(sig);if(actual.length!==expected.length||!timingSafeEqual(actual,expected))throw new Error("Invalid token");const claims=Claims.parse(JSON.parse(Buffer.from(data,"base64url").toString("utf8")));if(claims.expiresAt<=now())throw new Error("Expired token");return claims;},
  hash(token:string){return createHash("sha256").update(token).digest("hex");},
 };
}
