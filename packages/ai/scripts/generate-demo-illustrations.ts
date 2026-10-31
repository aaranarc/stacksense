// Deterministic schematic test/demo assets. Never present these as field photographs or evaluation data.
import {readFileSync,writeFileSync,mkdirSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,dirname} from "node:path";
const root=fileURLToPath(new URL("../../../",import.meta.url));
const {default:sharp}=await import("sharp");
const manifestPath=resolve(root,"fixtures-ai/cache/demo-manifest.json");
const manifest=JSON.parse(readFileSync(manifestPath,"utf8")) as {label:string;inputs:{id:string;kind:string;path:string;assetSource?:string;label?:string}[]};
const panel=(title:string,scene:string)=>`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="720"><rect width="960" height="720" fill="#f4f1e9"/><rect width="960" height="104" fill="#203a54"/><text x="36" y="44" font-family="sans-serif" font-size="30" font-weight="bold" fill="white">DEMO ILLUSTRATION</text><text x="36" y="82" font-family="sans-serif" font-size="23" fill="white">${title}</text>${scene}<rect y="660" width="960" height="60" fill="#203a54"/><text x="26" y="698" font-family="sans-serif" font-size="22" fill="white">Simulated scene - not a real home photograph or field evidence</text></svg>`;
const pipe='<path d="M160 150V600M204 150V600" stroke="#7a8b92" stroke-width="18"/>';
const meter=(name:string)=>panel(`Water meter - ${name}`,`<circle cx="480" cy="380" r="220" fill="#d6dde0" stroke="#536976" stroke-width="15"/><rect x="287" y="300" width="386" height="150" rx="14" fill="white" stroke="#536976" stroke-width="8"/><text x="308" y="405" font-family="monospace" font-size="82" fill="#101820">00100.0</text><text x="387" y="530" font-family="sans-serif" font-size="32">CUBIC METRES</text>`);
const scenes:Record<string,string>={
 'ceiling-402':panel('Bathroom ceiling stain - simulated',`<path d="M120 200H840V570H120Z" fill="#e8e2d6" stroke="#899397" stroke-width="8"/><ellipse cx="475" cy="335" rx="190" ry="85" fill="#bea578"/><path d="M350 330l55-30 40 35 55-25" fill="none" stroke="#9b825d" stroke-width="10"/>`),
 'window-202':panel('Window marks after rain - simulated',`<rect x="250" y="155" width="380" height="365" fill="#d5e5eb" stroke="#607b8b" stroke-width="18"/><path d="M440 155v365M250 340h380" stroke="#607b8b" stroke-width="10"/><path d="M655 190l-20 55m60 15l-20 55m65 15l-20 55" stroke="#388ab1" stroke-width="9"/><path d="M640 400v160" stroke="#b8a778" stroke-width="25"/>`),
 'scenario-happy':panel('Hero ceiling - simulated',`<rect x="150" y="180" width="660" height="380" fill="#e8e2d6"/><ellipse cx="480" cy="320" rx="190" ry="70" fill="#bea578"/>`),
 'scenario-electrical_hazard':panel('Electrical hazard scenario - keep away',`${pipe}<path d="M210 260Q400 200 610 375" fill="none" stroke="#3699ba" stroke-width="30"/><rect x="620" y="330" width="125" height="155" fill="white" stroke="#33485d" stroke-width="8"/><circle cx="659" cy="380" r="8"/><circle cx="705" cy="380" r="8"/><path d="M570 460l35-55-5 45 35-10-35 70" fill="#e9b53f"/>`),
 'scenario-locked_502':panel('Locked access - no entry',`<rect x="270" y="150" width="400" height="490" fill="#becad0" stroke="#536976" stroke-width="12"/><rect x="420" y="355" width="115" height="95" rx="10" fill="#dca84b"/><path d="M445 355v-48q33-55 66 0v48" fill="none" stroke="#536976" stroke-width="15"/>`),
 'scenario-dark_photo':panel('Low light - retake required',`<rect x="90" y="135" width="780" height="490" fill="#101519"/><path d="M310 180v400M355 180v400" stroke="#202b31" stroke-width="25"/>`),
 'scenario-beam_travel':panel('Possible lateral travel - inspection only',`<rect x="100" y="260" width="760" height="65" fill="#a8b5bc"/><path d="M180 170v125h490v200" stroke="#4e9bb3" stroke-width="26" fill="none"/><ellipse cx="660" cy="535" rx="90" ry="38" fill="#c7b68d"/>`),
 'scenario-wrong_trade_rain':panel('Rain-related window scene',`<rect x="260" y="160" width="390" height="370" fill="#d5e5eb" stroke="#607b8b" stroke-width="18"/><path d="M455 160v370M260 345h390" stroke="#607b8b" stroke-width="10"/><path d="M680 190l-25 55m70 15l-25 55m65 15l-25 55M200 200l-25 55" stroke="#388ab1" stroke-width="9"/><path d="M650 400v165" stroke="#b8a778" stroke-width="24"/>`),
 'scenario-honest_uncertainty':panel('Ambiguous surface - no source claim',`<ellipse cx="475" cy="365" rx="240" ry="130" fill="#d2c7b4"/><ellipse cx="460" cy="375" rx="170" ry="85" fill="#c6c3b8"/><path d="M170 575H790" stroke="#8d9698" stroke-width="10"/>`),
 'scenario-break_it':panel('Seeded simulator - invented building',Array.from({length:12},(_,i)=>`<rect x="${180+(i%3)*205}" y="${145+Math.floor(i/3)*120}" width="165" height="85" fill="${i===7?'#d5b980':'#e0e5e7'}" stroke="#536976" stroke-width="6"/>`).join('')),
 'meter-start-502':meter('start reading - demo'),
 'meter-end-502':meter('end reading - demo'),
 'trap-502':panel('Tile grout / floor trap detail',`<path d="M100 290H860M100 500H860M300 140V625M620 140V625" stroke="#c0c7c9" stroke-width="14"/><circle cx="465" cy="398" r="100" fill="#aab5ba" stroke="#455d69" stroke-width="12"/><path d="M395 375h140m-140 35h140m-140 35h140" stroke="#455d69" stroke-width="8"/><path d="M300 500l40-30-18-28 45-30" stroke="#353c40" stroke-width="10" fill="none"/>`),
 'day14-402':panel('Day-14 appearance only - moisture not measured',`<rect x="140" y="160" width="680" height="430" fill="#e9e7de" stroke="#c3c7c1" stroke-width="7"/><ellipse cx="480" cy="350" rx="150" ry="92" fill="#e1dfd5"/>`),
};
// Stock/reference images and raw imports are intentionally never auto-selected here.
for(const input of manifest.inputs){
 if(input.kind==='chat')continue;
 if(input.assetSource==='team-photo'){if(!existsSync(resolve(root,input.path)))throw Error('Approved clean team photo missing');continue;}
 const target=resolve(root,input.path);mkdirSync(dirname(target),{recursive:true});
 const sceneId=input.path.endsWith('/ceiling_402.demo.jpg')?'ceiling-402':input.path.endsWith('/window_202.demo.jpg')?'window-202':input.id;
 const svg=scenes[sceneId];if(!svg)throw Error(`No demo scene for ${input.id}`);
 writeFileSync(target.replace(/\.jpg$/,'.demo.svg'),svg);writeFileSync(target,await sharp(Buffer.from(svg)).jpeg({quality:85}).toBuffer());input.assetSource='demo-illustration';input.label='DEMO ILLUSTRATION - simulated, not field evidence';
}
manifest.label='Approved clean team photographs and authored DEMO illustrations. No raw/reference photo is imported automatically.';
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest.inputs.map(({id,assetSource})=>({id,assetSource})),null,2));
