import {expect,it} from 'vitest';
import {buildingFromSetup} from '../src/building/setup';
import {createCase,applyObservations} from '../src';
import {observation} from './helpers';
import {heroSnapshots} from '../src/scenarios/hero';
it('creates a configured building with explicit meter ownership and no assumed shared stacks',()=>{
 const building=buildingFromSetup({id:'own',name:'My building',region:'IN',archetype:'GENERIC',floors:3,flatsPerFloor:2,hasTerrace:true,lat:19,lon:72,meterFlatIds:['202'],moistureThresholdWme:12});
 expect(building.flats).toHaveLength(6);expect(building.stacks).toEqual([]);
 expect(building.flats.filter(f=>f.hasWaterMeter).map(f=>f.id)).toEqual(['202']);
 expect(createCase(building).building.moistureThresholdWme).toBe(12);
 expect(()=>buildingFromSetup({...building,flatsPerFloor:2,meterFlatIds:['999']})).toThrow(/meter/i);
});
it('uses a configured moisture threshold without changing the regional defaults',()=>{
 const base=heroSnapshots()[11]!;const state=applyObservations(base,[observation({id:'configured-reading',eventKey:'configured-reading',flatId:'402',kind:'moisture_reading',zone:'ceiling',at:'2026-11-16T12:00:00Z',moisture:{value:12,unit:'%WME'}})]);
 const next=applyObservations({...state,building:{...state.building,moistureThresholdWme:10}},[]);
 expect(next.recovery.paint).toBe('not_ready');
 expect(applyObservations(state,[]).recovery.paint).toBe('ready');
});
