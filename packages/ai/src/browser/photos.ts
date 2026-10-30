import type { PhotoLabel } from "@stacksense/contracts";
type Pixels = Pick<ImageData, "width" | "height" | "data">;
type Image = ImageBitmap | HTMLImageElement;
const gray = (image: Pixels, x: number, y: number) => {
  const i = (Math.max(0, Math.min(image.height - 1, y)) * image.width + Math.max(0, Math.min(image.width - 1, x))) * 4;
  return .299 * image.data[i]! + .587 * image.data[i + 1]! + .114 * image.data[i + 2]!;
};
const context = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext("2d"); if (!ctx) throw new Error("Canvas unavailable"); return ctx;
};
export async function stripExif(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale)); canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    context(canvas).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Image encoding failed")), "image/jpeg", .85));
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } finally { bitmap.close(); }
}
export function qualityCheck(image: Pixels) {
  let luminance = 0, lap = 0, lap2 = 0, edges = 0, count = 0;
  for (let y=0; y<image.height; y++) for(let x=0; x<image.width; x++) {
    const g = gray(image,x,y); luminance += g;
    const l = gray(image,x-1,y)+gray(image,x+1,y)+gray(image,x,y-1)+gray(image,x,y+1)-4*g;
    lap += l; lap2 += l*l; edges += Math.abs(gray(image,x+1,y)-g) > 15 || Math.abs(gray(image,x,y+1)-g) > 15 ? 1 : 0; count++;
  }
  const mean = luminance / Math.max(1,count), variance = lap2 / Math.max(1,count) - (lap / Math.max(1,count)) ** 2, density = edges / Math.max(1,count);
  const quality: PhotoLabel["quality"] = mean < 45 ? "too_dark" : density < .015 ? "too_far" : variance < 75 ? "blurry" : "ok";
  const hints = quality === "ok" ? { en: "Photo detail is usable", hi: "फोटो में विवरण साफ है", mr: "फोटोतील तपशील स्पष्ट आहे" }
    : { en: "Retake in better light, hold steady and move closer only if safe", hi: "सुरक्षित हो तभी रोशनी में पास से स्थिर फोटो लें", mr: "सुरक्षित असेल तरच उजेडात जवळून स्थिर फोटो घ्या" };
  return { quality, hints, metrics: { luminance: mean, laplacianVariance: variance, edgeDensity: density } };
}
export function makeCrops(img: Image, boxes: PhotoLabel["boxes"]): string[] {
  return boxes.slice(0,2).flatMap(box => {
    const x = Math.max(0, box.x), y = Math.max(0,box.y), right = Math.min(1,box.x+box.w), bottom = Math.min(1,box.y+box.h);
    if (right <= x || bottom <= y) return [];
    const canvas = document.createElement("canvas"); canvas.width = Math.max(1, Math.round((right-x)*img.width)); canvas.height = Math.max(1,Math.round((bottom-y)*img.height));
    context(canvas).drawImage(img,x*img.width,y*img.height,canvas.width,canvas.height,0,0,canvas.width,canvas.height);
    return [canvas.toDataURL("image/jpeg", .85)];
  });
}
export function edgeContrast(image: Pixels): { imageData: ImageData; label: "edge contrast, not moisture" } {
  const data = new Uint8ClampedArray(image.data);
  for(let y=1;y<image.height-1;y++) for(let x=1;x<image.width-1;x++) {
    const gx = -gray(image,x-1,y-1)+gray(image,x+1,y-1)-2*gray(image,x-1,y)+2*gray(image,x+1,y)-gray(image,x-1,y+1)+gray(image,x+1,y+1);
    const gy = -gray(image,x-1,y-1)-2*gray(image,x,y-1)-gray(image,x+1,y-1)+gray(image,x-1,y+1)+2*gray(image,x,y+1)+gray(image,x+1,y+1);
    if (Math.hypot(gx,gy)>80) { const i=(y*image.width+x)*4; data[i]=255; data[i+1]=120; data[i+2]=0; }
  }
  const imageData = typeof ImageData === "undefined" ? { width:image.width,height:image.height,data,colorSpace:"srgb" } as ImageData : new ImageData(data,image.width,image.height);
  return { imageData, label: "edge contrast, not moisture" };
}
