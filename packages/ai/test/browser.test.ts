import { readFileSync } from "node:fs";
import { describe, expect, it, vi, afterEach } from "vitest";
import { ChatMessage } from "@stacksense/contracts";
import { parseWhatsAppExport, pseudonymise, stripExif, qualityCheck, makeCrops, edgeContrast } from "../src/browser/index";
const sample = (name: string) => readFileSync(new URL(`../../../fixtures-ai/chats/samples/${name}.txt`, import.meta.url), "utf8");
afterEach(() => vi.unstubAllGlobals());

describe("A-T12 WhatsApp preprocessing", () => {
  it("parses Android multiline messages and attachments, dropping system messages", () => {
    const messages = parseWhatsAppExport(sample("android"));
    expect(messages).toHaveLength(3);
    expect(messages[0]?.text).toContain("\nnear the bathroom duct.");
    expect(messages[0]?.at).toBe("2026-10-30T15:46:00.000Z");
    expect(messages[1]?.attachmentIds).toEqual(["IMG-20261030-WA0012.jpg"]);
    expect(messages[2]?.attachmentIds).toHaveLength(1);
    expect(messages.every(m => ChatMessage.safeParse(m).success)).toBe(true);
  });
  it("detects US dates, 24h timestamps and Devanagari digits", () => {
    expect(parseWhatsAppExport(sample("ios"))[0]?.at).toBe("2026-10-30T15:45:03.000Z");
    const messages = parseWhatsAppExport(sample("hinglish"));
    const { messages: clean, keyMap } = pseudonymise(messages);
    expect(clean[0]?.text).toContain("मी 402");
    expect(clean.map(m => m.senderKey)).toEqual(["S01", "S02", "S01"]);
    expect(keyMap.S01).toBe("Demo Resident");
    expect(parseWhatsAppExport("not an export")).toEqual([]);
    expect(parseWhatsAppExport("31/02/26, 9:00 am - Demo Resident: invalid")).toEqual([]);
  });
  it("redacts names, phones and emails while preserving flat numbers", () => {
    const m = parseWhatsAppExport("30/10/26, 9:15 pm - Demo Resident: Demo Neighbour in 402; phone +00 12345 67890; demo@example.invalid\n30/10/26, 9:16 pm - Demo Neighbour: 502 here");
    const clean = pseudonymise(m).messages;
    expect(clean[0]?.text).toContain("[NAME] in 402");
    expect(clean[0]?.text).toContain("[PHONE]");
    expect(clean[0]?.text).toContain("[EMAIL]");
    expect(JSON.stringify(clean)).not.toContain("Demo Resident");
    expect(pseudonymise(clean).messages).toEqual(clean);
  });
});

describe("A-T12 browser photo preparation", () => {
  const pixels = (value: number): ImageData => ({ width: 20, height: 20, data: new Uint8ClampedArray(1600).fill(value), colorSpace: "srgb" } as ImageData);
  it("detects darkness, missing detail and returns multilingual retake hints", () => {
    expect(qualityCheck(pixels(0)).quality).toBe("too_dark");
    const flat = qualityCheck(pixels(180));
    expect(flat.quality).toBe("too_far");
    expect(Object.values(flat.hints).every(v => v.length > 5)).toBe(true);
    const sharp = pixels(255); for (let i=0;i<400;i++) for(let c=0;c<3;c++) sharp.data[i*4+c] = i%2 ? 255 : 0;
    expect(qualityCheck(sharp).quality).toBe("ok");
    expect(edgeContrast(sharp).label).toBe("edge contrast, not moisture");
    expect(edgeContrast(sharp).imageData.data).not.toBe(sharp.data);
  });
  it("re-encodes JPEG at .85 and scales the long edge to 1600, closing the bitmap", async () => {
    const close = vi.fn(); const drawImage = vi.fn();
    vi.stubGlobal("createImageBitmap", vi.fn(async () => ({ width: 3200, height: 2400, close })));
    const canvas = { width: 0, height: 0, getContext: () => ({ drawImage }), toBlob: (f: (b: Blob) => void, type: string, quality: number) => { expect(type).toBe("image/jpeg"); expect(quality).toBe(.85); f(new Blob(["clean"], { type })); } };
    vi.stubGlobal("document", { createElement: () => canvas });
    const result = await stripExif(new File(["metadata"], "original.jpg", { type: "image/jpeg" }));
    expect(canvas.width).toBe(1600); expect(canvas.height).toBe(1200);
    expect(await result.text()).toBe("clean"); expect(close).toHaveBeenCalled();
    expect(drawImage).toHaveBeenCalled();
  });
  it("clips at most two detail crops to image bounds", () => {
    const drawImage = vi.fn();
    vi.stubGlobal("document", { createElement: () => ({ width: 0, height: 0, getContext: () => ({ drawImage }), toDataURL: () => "data:image/jpeg;base64,YQ==" }) });
    expect(makeCrops({ width: 100, height: 100 } as ImageBitmap, Array.from({length:3}, () => ({x: -.1,y:0,w:.5,h:.5,label:"detail"})))).toHaveLength(2);
    expect(drawImage.mock.calls[0]?.slice(1,5)).toEqual([0,0,40,50]);
  });
});

it("redacts a full name mentioned in text even when it is not a sender",()=>{
 const m=parseWhatsAppExport("30/10/26, 9:15 pm - S01: Sample Person in flat 402 reported a stain");
 expect(pseudonymise(m).messages[0]?.text).toBe("[NAME] in flat 402 reported a stain");
});
