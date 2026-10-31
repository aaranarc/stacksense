export async function preparePhoto(dataUrl:string):Promise<string> {
  if (typeof window !== "undefined") throw new Error("Server-only image processing");
  const match=dataUrl.match(/^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
  if(!match) throw new Error("Invalid photo");
  const bytes=Buffer.from(match[1]!,"base64");
  if(bytes.length>4*1024*1024 || !bytes.length) throw new Error("Invalid photo size");
  const { default: sharp } = await import("sharp");
  const clean=await sharp(bytes,{limitInputPixels:16000000}).rotate().resize({width:1600,height:1600,fit:"inside",withoutEnlargement:true}).jpeg({quality:85}).toBuffer();
  return `data:image/jpeg;base64,${clean.toString("base64")}`;
}
