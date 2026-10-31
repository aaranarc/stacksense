// Raw photographs stay ignored; only an explicitly requested, metadata-free demo fixture is written.
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const root=fileURLToPath(new URL("../../../",import.meta.url));
const name=process.argv[2];if(!name||!["ceiling_402","window_202","trap_502","meter_502_a","meter_502_b","duct_302"].includes(name))throw Error("Use a supported named demo photo");
const raw=process.argv[3]??resolve(root,`eval/data/photos/${name}_raw.jpg`);
const {default:sharp}=await import("sharp");
const bytes=await sharp(readFileSync(raw),{limitInputPixels:128000000}).rotate().resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true}).jpeg({quality:85}).toBuffer();
const meta=await sharp(bytes).metadata();
if(meta.exif||meta.xmp||meta.iptc||meta.icc||Math.max(meta.width??0,meta.height??0)>1600||meta.format!=="jpeg")throw Error("Clean photo validation failed");
const dir=resolve(root,"fixtures-ai/photos/demo");mkdirSync(dir,{recursive:true});
writeFileSync(resolve(dir,`${name}.jpg`),bytes);
console.log(JSON.stringify({file:`fixtures-ai/photos/demo/${name}.jpg`,width:meta.width,height:meta.height,format:meta.format,exif:false,xmp:false,iptc:false,icc:false,quality:85}));
