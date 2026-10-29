import assert from 'node:assert/strict';
import {OR_NUMBERS,OR_HALLS,OR_ROWS,OR_ROOMS,OR_WINGS,OR_INTERIORS,operatingDoor,operatingViewTarget,operatingTarget,operatingLabel,operatingPlanSVG} from '../dist/game/operating-plan.js';
import {EVENTS} from '../dist/game/event-pool.js';
import {createRun} from '../dist/game/event-deck.js';
import {createState} from '../dist/game/ent-data.js';
assert.equal(OR_NUMBERS.length,27);
assert.deepEqual(OR_NUMBERS.filter(n=>n%10===4),[]);
assert.equal(new Set([...OR_ROOMS.map(r=>r.number),...OR_WINGS.flatMap(w=>w.numbers)]).size,27);
assert.deepEqual(OR_ROWS.find(r=>r.id==='main').numbers,[15,16,17,18]);
assert.deepEqual(OR_ROWS.find(r=>r.id==='opposite').numbers,[13,12]);
const ent=OR_ROOMS.find(r=>r.number===16),local=OR_ROOMS.find(r=>r.number===13);
assert.equal(ent.x,local.x);assert.equal(ent.z,-local.z);
assert.deepEqual(operatingTarget(EVENTS.orassist),{dest:'f5',spot:'or-13'});
assert.deepEqual(operatingTarget(EVENTS.orassist,'or'),{dest:'f5',spot:'or-13'});
assert.deepEqual(operatingTarget(EVENTS.tonsil),{dest:'f7',spot:'patient'});
assert.deepEqual(operatingTarget(EVENTS.tonsil,'or'),{dest:'f5',spot:'or-16'});
assert.equal(EVENTS.orassist.orRoom,13);assert(EVENTS.orassist.call.includes('13 號'));
for(let seed=0;seed<50;seed++){
  const run=createRun({seed:'OR-'+seed});
  const phase=run.phases.find(p=>p.id==='orassist');
  if(phase)assert.equal(phase.destination,operatingLabel(13));
}
const svg=operatingPlanSVG();assert(svg.includes('16房 ↔ 13房'));assert(svg.includes('F 棟電梯'));
console.log('Operating floor passed: 27 room numbers, photo-based room rows and facing alignment, local 13 / ENT 16 targets, numbered call and mission.');

assert.equal(createState().orRoom,null);assert.deepEqual(OR_INTERIORS,[13,16]);
for(const number of OR_INTERIORS){
  const target={dest:'f5',spot:'or-'+number};
  assert.deepEqual(operatingViewTarget(target),target);
  assert.deepEqual(operatingViewTarget(target,number),{dest:'f5',spot:'operation'});
  assert.deepEqual(operatingViewTarget(target,number===13?16:13),{dest:'f5',spot:'or-exit'});
  assert.deepEqual(operatingViewTarget({dest:'f7',spot:'patient'},number),{dest:'f7',spot:'or-exit'});
  const door=operatingDoor(number);assert.equal(door.x,0);assert(Math.abs(door.z)<3.5,'Door approach must remain in the main corridor');
}
assert.equal(operatingDoor(14),null);
console.log('Operating interiors passed: correct-room work target, wrong-room and next-floor exit routes, corridor return points, initial room state.');

for(const room of OR_ROOMS){const door=operatingDoor(room.number);assert(OR_HALLS.some(h=>Math.abs(door.x-h.x)<h.w/2&&Math.abs(door.z-h.z)<h.d/2),'Door must open onto a corridor: '+room.number);for(const other of OR_ROOMS)if(other.number!==room.number)assert(Math.abs(room.x-other.x)>=(room.w+other.w)/2||Math.abs(room.z-other.z)>=(room.d+other.d)/2,'Rooms overlap: '+room.number+'/'+other.number);}
assert.deepEqual(OR_ROWS.find(r=>r.id==='lower').numbers,[8,9,10,11]);assert.deepEqual(OR_ROWS.find(r=>r.id==='bottom').numbers,[7,6,5]);
console.log('Photo plan passed: room rows, no room overlap, and every mapped doorway connected to a corridor.');
