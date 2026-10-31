import {Building} from '@stacksense/contracts';
export function buildingFromSetup(input:Pick<Building,'id'|'name'|'region'|'archetype'|'floors'|'hasTerrace'|'lat'|'lon'|'moistureThresholdWme'>&{flatsPerFloor:number;meterFlatIds:string[]}):Building {
 if(!input.name.trim()||input.name.length>120||!Number.isInteger(input.floors)||input.floors<1||input.floors>50||!Number.isInteger(input.flatsPerFloor)||input.flatsPerFloor<1||input.flatsPerFloor>20||!Number.isFinite(input.lat)||Math.abs(input.lat)>90||!Number.isFinite(input.lon)||Math.abs(input.lon)>180)throw new Error('Enter a valid building name, location, 1–50 floors and 1–20 flats per floor.');
 const flats:Building['flats']=Array.from({length:input.floors},(_,f)=>Array.from({length:input.flatsPerFloor},(_,p)=>({id:`${f+1}${String(p+1).padStart(2,'0')}`,floor:f+1,position:String(p+1).padStart(2,'0'),wetAreas:['bathroom' as const],externalWalls:[],hasWaterMeter:input.meterFlatIds.includes(`${f+1}${String(p+1).padStart(2,'0')}`),access:'unknown' as const}))).flat();
 if(input.meterFlatIds.some(id=>!flats.some(f=>f.id===id)))throw new Error('Meter flat IDs must belong to the configured building.');
 return Building.parse({...input,name:input.name.trim(),flats,stacks:[]});
}
