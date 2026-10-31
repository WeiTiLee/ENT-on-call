import assert from 'node:assert/strict';
import {createMorning,printPatientList,roundsComplete,bedId,bedLabel,bedApproach,visitPatient,collectPatient,cleanPatch,morningTarget,morningReady,wardWorkFocused,clinicCallDue} from '../dist/game/morning-events.js';
import {createRun,PARTY_QUOTA} from '../dist/game/event-deck.js';
import {wardRooms,wardRect} from '../dist/game/ward-plan.js';
const lists=new Set();
for(let seed=0;seed<100;seed++){
  const code='MORNING-'+seed,m=createMorning(code);lists.add(m.list.map(p=>p.id).join(','));assert.equal(m.list.length,3);assert.equal(new Set(m.list.map(p=>p.id)).size,3);assert.deepEqual(m,createMorning(code));
  assert.equal(morningTarget(m),null);assert.equal(visitPatient(m,m.list[0].id),false);assert(!roundsComplete(m));assert(printPatientList(m));assert.equal(printPatientList(m),false);
  const nasal=m.list.find(p=>p.nasal),other=m.list.find(p=>!p.nasal),wrong=bedId(nasal.room,nasal.bed===1?2:1);
  assert.equal(visitPatient(m,wrong),false);assert.equal(m.visited.length,0);assert.equal(collectPatient(m,nasal.id),false);
  assert(visitPatient(m,nasal.id));assert.equal(visitPatient(m,nasal.id),false);assert.equal(collectPatient(m,nasal.id),false);
  m.focus='nasal';assert.equal(morningTarget(m).spot,other.id);
  for(const p of m.list.filter(p=>p.id!==nasal.id))assert(visitPatient(m,p.id));assert(roundsComplete(m));assert(collectPatient(m,nasal.id));assert.equal(collectPatient(m,other.id),false);
  m.focus='nasal';assert.equal(morningTarget(m).spot,'exam');m.escort='exam';assert(cleanPatch(m,0));assert(!cleanPatch(m,0));assert(!cleanPatch(m,4));
  const snapshot=JSON.stringify({visited:m.visited,escort:m.escort,cleaned:m.cleaned});m.focus='call';assert.equal(morningTarget(m),null);assert(!wardWorkFocused(m));m.firstCallDone=true;assert(!wardWorkFocused(m));assert(m.active);m.focus='rounds';assert(wardWorkFocused(m));m.focus='call';assert.equal(JSON.stringify({visited:m.visited,escort:m.escort,cleaned:m.cleaned}),snapshot);assert(!morningReady(m));
  for(const p of m.list){visitPatient(m,p.id);const spot=bedApproach(p.room,p.bed),r=wardRect(wardRooms.find(r=>r.id===p.room));assert(spot&&Math.abs(spot.x-r.x)<r.w/2&&Math.abs(spot.z-r.z)<r.d/2);assert(bedLabel(p).startsWith(p.room));}
  assert(cleanPatch(m,1));assert(cleanPatch(m,2));m.escort='done';assert(morningReady(m));
  for(const team of ['A','B','C']){const run=createRun({mode:'party',seed:code,team});assert.equal(run.total,12);assert.deepEqual(run.categories,PARTY_QUOTA);assert.equal(run.phases[0].clock,440);assert.equal(run.phases[1].kind,'morning-work');assert.equal(run.phases.at(-1).clock,1890);}
}
assert(lists.size>1);assert.equal(bedApproach('7F19',2),null);
console.log('Morning passed: exact bed/list matching, seeded lists, no duplicate credit, escort prerequisites, interrupted cleaning resume, 07:20–07:30 timeline and 12-event party scoring.');

import {createSideActivities,activityKey,finishSideActivity,attemptPassword} from '../dist/game/side-activities.js';
const side=createSideActivities(),password=side.password;
for(const old of [...password.history])assert.equal(attemptPassword(password,old),'reused');
assert.equal(password.changed,false);assert.equal(attemptPassword(password,'real-world-input'),'invalid');
assert.equal(attemptPassword(password,'ENToncall!04'),'ok');assert.equal(password.history.length,3);assert(password.changed);
assert.equal(attemptPassword(password,'ENToncall!04'),'changed');
for(const [place,room,id] of [['f7',null,'printer'],['g2',null,'printer'],['f7',null,'water'],['f5',13,'water'],['g2',null,'tissue']]){const key=activityKey(place,room,id);assert(finishSideActivity(side,key)>0);assert.equal(finishSideActivity(side,key),0);}
const fresh=createSideActivities();assert.deepEqual(fresh.completed,[]);assert(!fresh.password.changed);
console.log('Side activities passed: previous-three password rejection, successful fictional password rotation, per-place relief once only and independent run reset.');

const early=createMorning('EARLY');assert(!clinicCallDue(early,'morning-work',510));printPatientList(early);assert(!clinicCallDue(early,'morning-work',509));assert(clinicCallDue(early,'morning-work',510));early.active=false;assert(clinicCallDue(early,'morning-work',510));assert(!clinicCallDue(early,'case',510));

import {clinicPhonePlan} from '../dist/game/morning-events.js';
const phoneMorning=createMorning('PHONE');assert.equal(clinicPhonePlan('finish-rounds',phoneMorning),'clinic');printPatientList(phoneMorning);assert.equal(clinicPhonePlan('hangup',phoneMorning),'recall');assert.equal(clinicPhonePlan('leave',phoneMorning),'clinic');assert.equal(clinicPhonePlan('finish-rounds',phoneMorning),'rounds');for(const p of phoneMorning.list)visitPatient(phoneMorning,p.id);assert.equal(clinicPhonePlan('finish-rounds',phoneMorning),'clinic');
console.log('Clinic phone passed: immediate visit, finish remaining rounds first, hangup recall and completed-round fallback.');
