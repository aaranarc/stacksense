import sharp from "sharp";
const directory=new URL("../../../eval/data/placeholder/",import.meta.url);
for(const [name,background] of [["clean","white"],["mark","#999999"]])await sharp({create:{width:32,height:32,channels:3,background:background!}}).jpeg().toFile(new URL(`${name}.jpg`,directory).pathname);
console.log("Wrote two explicitly synthetic placeholder images, not real damage photos");
