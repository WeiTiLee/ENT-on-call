import assert from 'node:assert/strict';
import {createTubeTask,tubeAction,tubeSpot,TUBE_CASES,TUBE_KINDS} from '../dist/game/clinic-tubes.js';
import {registrationCard,tubePackage,tubeCheckArt} from '../dist/game/clinic-tube-art.js';
import {createState} from '../dist/game/ent-data.js';
const people=new Set(),models=new Set();
for(const id of TUBE_CASES)for(let i=0;i<100;i++){
  const seed='CLINIC-'+i,t=createTubeTask(seed,id);assert.deepEqual(t,createTubeTask(seed,id));people.add(t.patient.name);models.add(t.code);
  assert.deepEqual(TUBE_KINDS.outpatientNG.codes,['NG 14','NG 16']);assert.deepEqual(TUBE_KINDS.outpatientTrach.codes,['Teflon 11','Shiley 6','Shiley 8','Bivona 8']);assert.equal(new Set(t.packages.map(p=>p.id)).size,t.packages.length);assert(t.packages.every(p=>TUBE_KINDS[p.type].codes.includes(p.id)));
  assert.equal(tubeSpot(t),'desk');assert.equal(tubeAction(t,'exchange'),'blocked');assert.equal(tubeAction(t,'record'),'blocked');assert.equal(tubeAction(t,'return-slip'),'blocked');
  const before=JSON.stringify(t);assert.equal(tubeAction(t,'call',t.names.find(n=>n!==t.patient.name)),'wrong-name');assert.equal(JSON.stringify(t),before);
  assert.equal(tubeAction(t,'call',t.patient.name),'called');assert.equal(tubeSpot(t),'patient');assert.equal(tubeAction(t,'identity',t.patient.name),'blocked');assert.equal(tubeAction(t,'ask-name'),'spoken');assert.equal(tubeAction(t,'identity',t.names.find(n=>n!==t.patient.name)),'wrong-name');assert.equal(tubeAction(t,'identity',t.patient.name),'identified');
  assert.equal(tubeAction(t,'model',t.packages.find(p=>p.id!==t.code).id),'wrong-model');assert.equal(tubeAction(t,'model',t.code),'equipped');assert.equal(tubeAction(t,'check',TUBE_KINDS[id].checks[0]),'blocked');assert.equal(tubeAction(t,'exchange'),'exchanged');
  if(id==='outpatientNG'){assert.equal(tubeAction(t,'check','water'),'blocked');assert.equal(tubeAction(t,'check','position'),'blocked');}
  for(const check of TUBE_KINDS[id].checks){assert.equal(tubeAction(t,'check',check),'checked');assert.equal(tubeAction(t,'check',check),'blocked');}
  assert.equal(t.stage,'record');assert.equal(tubeAction(t,'return-slip'),'blocked');assert.equal(tubeAction(t,'record'),'recorded');assert(!t.recorded,'Record is written at the computer after returning');assert.equal(tubeSpot(t),'desk');assert.equal(t.stage,'desk-return');
  const restored=JSON.parse(JSON.stringify(t));assert.equal(tubeAction(restored,'return-slip'),'done');assert(restored.recorded);assert.equal(tubeAction(restored,'return-slip'),'blocked');assert.equal(tubeSpot(restored),null);
  assert(registrationCard(t).includes(t.patient.name));assert(registrationCard(t).includes(t.code));assert(tubePackage({id:t.code,type:id}).includes(t.code));assert(!/id="[^"]*\s[^"]*"/.test(tubePackage({id:t.code,type:id})));assert(!registrationCard(t).includes('遊戲器材代碼'));assert(tubeCheckArt(TUBE_KINDS[id].checks[0]).includes('<svg'));
}
assert.equal(people.size,4);assert.equal(models.size,6);const practice=createTubeTask('CLINIC','outpatientNG',{practice:true});assert(practice.practice);assert.deepEqual(createState().tubes,{});assert.equal(createState().practiceTube,null);assert.equal(createState().clinicNurseAway,true);
console.log('Clinic tubes passed: seeded slips and models, correct-name call and bedside recheck, package matching, ordered NG/trach checks, water gated by position confirmation, resumable records and one-time desk return.');
