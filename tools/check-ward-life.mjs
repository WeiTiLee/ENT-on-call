import assert from 'node:assert/strict';
import {NURSING_STATION as n,hasWardPatientTask,bedPatientVisible,wardEventPatientSpot} from '../dist/game/ward-life.js';
import {wardRooms,wardBedPositions} from '../dist/game/ward-plan.js';
import {createMorning,printPatientList,bedLabel,collectPatient,visitPatient} from '../dist/game/morning-events.js';
import {createState} from '../dist/game/ent-data.js';
import {foodShelf} from '../dist/game/self-care-ui.js';
import {EVENTS} from '../dist/game/event-pool.js';
for(const q of [...n.computers,n.printer,n.chair,n.tablet]){assert(Math.abs(q.x-n.center.x)<n.width/2);assert(Math.abs(q.z-n.center.z)<n.depth/2);}
assert.equal(n.spots.computer.labelX,n.computers[0].x);assert.equal(n.spots.computer.labelZ,n.computers[0].z);assert.equal(n.spots.printer.labelX,n.printer.x);assert.equal(n.spots.printer.labelZ,n.printer.z);assert.equal(n.spots.nurse.label,'護理站');assert.equal(n.spots.tablet.labelX,n.tablet.x);assert.equal(n.spots.tablet.labelZ,n.tablet.z);assert.equal(n.spots.tablet.id,'consent-tablet');
const s=createState(),target={dest:'f7',spot:'patient'};assert(!hasWardPatientTask(s,target));s.started=true;s.accepted=true;assert(hasWardPatientTask(s,target));s.explore=true;assert(!hasWardPatientTask(s,target));s.explore=false;for(const t of [{dest:'g2',spot:'patient'},{dest:'f7',spot:'nurse'},{dest:'f5',spot:'operation'}])assert(!hasWardPatientTask(s,t));s.accepted=false;assert(!hasWardPatientTask(s,target));
const beds=wardRooms.flatMap(r=>wardBedPositions(r).map((b,i)=>({room:r.id,bed:i+1})));assert(beds.length>40);assert(beds.every(b=>bedPatientVisible(b.room,b.bed,null)));assert.equal(wardEventPatientSpot().label,'7F23A · 病人');
for(let seed=0;seed<50;seed++){const m=createMorning('WARD'+seed);printPatientList(m);for(const p of m.list)visitPatient(m,p.id);const nasal=m.list.find(p=>p.nasal);assert(collectPatient(m,nasal.id));for(const escort of ['following','exam']){m.escort=escort;assert.equal(beds.filter(b=>!bedPatientVisible(b.room,b.bed,m)).length,1);assert(!bedPatientVisible(nasal.room,nasal.bed,m));}m.escort='done';assert(beds.every(b=>bedPatientVisible(b.room,b.bed,m)));}
for(const r of wardRooms.filter(r=>r.bedCount===1))assert.equal(bedLabel({room:r.id,bed:1}),r.id);assert.equal(bedLabel({room:'7F01',bed:3}),'7F01C');
const biscuits=foodShelf({discussion:true});assert(biscuits.includes('data-eat-supply="biscuit"'));assert(!biscuits.includes('data-eat-supply="meal"'));assert(!biscuits.includes('data-eat-supply="drink"'));assert(biscuits.includes('討論室'));
for(const id of ['takoyaki','lunchOrder'])assert.equal(EVENTS[id].spot,'nurse');
console.log('Ward life passed: station equipment/label alignment, contextual ward marker, all bed occupants, 50 escort visibility cycles, simple single-room labels, nursing-station meal routes and discussion-room biscuits.');

assert.equal(EVENTS.drink.dest,'f5');assert.equal(EVENTS.drink.spot,'or-team-circulator');assert.equal(EVENTS.drink.trigger,'or-entry');
