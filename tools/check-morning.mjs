import assert from 'node:assert/strict';
import {createMorning,printPatientList,roundsComplete,bedId,bedLabel,bedApproach,visitPatient,collectPatient,cleanPatch,morningTarget,morningReady,wardWorkFocused,clinicCallDue,ROUND_PATIENTS,nasalRequired,nasalComplete,morningEventIds} from '../dist/game/morning-events.js';
import {createRun,PARTY_QUOTA} from '../dist/game/event-deck.js';
import {wardRooms,wardRect} from '../dist/game/ward-plan.js';
const lists=new Set(),combinations=new Set(),kinds=new Set(),branches=new Set();
assert.equal(ROUND_PATIENTS.length,5);
for(let seed=0;seed<500;seed++){
 const code='MORNING-'+seed,m=createMorning(code);lists.add(m.list.map(p=>p.id).join(','));combinations.add(m.list.map(p=>p.kind).sort().join(','));m.list.forEach(p=>kinds.add(p.kind));branches.add(nasalRequired(m));
 assert.equal(m.list.length,3);assert.equal(new Set(m.list.map(p=>p.kind)).size,3);assert.deepEqual(m,createMorning(code));assert.equal(morningTarget(m),null);assert(!visitPatient(m,m.list[0].id));assert(!roundsComplete(m));assert(printPatientList(m));assert(!printPatientList(m));assert(!visitPatient(m,bedId('7F25',3)));
 const nasal=m.list.find(p=>p.nasal);assert(!collectPatient(m,nasal?.id));
 if(nasal){
  assert(visitPatient(m,nasal.id));assert(!visitPatient(m,nasal.id));assert(!collectPatient(m,nasal.id));m.focus='nasal';assert.equal(morningTarget(m).spot,m.list.find(p=>!p.nasal).id);
 }
 for(const p of m.list){if(!m.visited.includes(p.id))assert(visitPatient(m,p.id));assert(!visitPatient(m,p.id));const spot=bedApproach(p.room,p.bed),r=wardRect(wardRooms.find(r=>r.id===p.room));assert(spot&&Math.abs(spot.x-r.x)<r.w/2&&Math.abs(spot.z-r.z)<r.d/2);assert(bedLabel(p).startsWith(p.room));}
 assert(roundsComplete(m));
 if(nasal){
  assert(collectPatient(m,nasal.id));assert(!collectPatient(m,m.list.find(p=>!p.nasal).id));m.focus='nasal';assert.equal(morningTarget(m).spot,'exam');m.escort='exam';assert(cleanPatch(m,0));assert(!cleanPatch(m,0));assert(!cleanPatch(m,4));
  const snapshot=JSON.stringify({visited:m.visited,escort:m.escort,cleaned:m.cleaned});m.focus='call';assert.equal(morningTarget(m),null);assert(!wardWorkFocused(m));m.firstCallDone=true;assert(!morningReady(m));assert.equal(JSON.stringify({visited:m.visited,escort:m.escort,cleaned:m.cleaned}),snapshot);assert(cleanPatch(m,1));assert(cleanPatch(m,2));m.escort='done';assert(morningReady(m));
 }else{
  assert.equal(m.escort,'none');assert(nasalComplete(m));m.focus='nasal';assert.equal(morningTarget(m),null);assert(!collectPatient(m,m.list[0].id));assert(!cleanPatch(m,0));assert(!morningReady(m));m.firstCallDone=true;assert(morningReady(m));assert(!morningEventIds(code).includes('nasal-cleaning'));
 }
 const discharge=m.list.find(p=>p.kind==='discharge');if(discharge){assert(discharge.note.includes('回診時間'));assert(discharge.note.includes('出院帶藥'));assert(discharge.followup.includes('09:00'));assert(discharge.medications.includes('用法與天數'));}
 const count=10+morningEventIds(code).length;
 for(const team of ['A','B','C']){const run=createRun({mode:'party',seed:code,team});assert.equal(run.total,count);assert.deepEqual(run.categories,{...PARTY_QUOTA,routine:PARTY_QUOTA.routine-(12-count)});assert.equal(run.ids.includes('nasal-cleaning'),!!nasal);assert.equal(run.phases[0].clock,440);assert.equal(run.phases[1].kind,'morning-work');assert.equal(run.phases.at(-1).clock,1890);}
}
assert(lists.size>10);assert.equal(combinations.size,10);assert.equal(kinds.size,5);assert.equal(branches.size,2);assert.equal(bedApproach('7F19',2),null);
for(const nasal of [true,false])for(let i=0;i<30;i++)assert.equal(nasalRequired(createMorning('PREVIEW-'+i,{nasal})),nasal);
console.log('Morning passed: all ten combinations of five cases drawn three at a time, with/without SMP, optional cleaning and matching scoring, discharge follow-up/medications, exact beds, resume and party fairness.');

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
