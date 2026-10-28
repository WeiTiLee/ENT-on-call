import assert from 'node:assert/strict';
import {createWardNG,NG_WARDS,NG_QUESTIONS,ngReady,ngAction,ngSource,ngSpot} from '../dist/game/ward-ng.js';
import {createRun} from '../dist/game/event-deck.js';

const wards=new Set();
for(let i=0;i<200;i++){
  const t=createWardNG('NG-'+i);wards.add(t.patient.ward);
  assert.deepEqual(t,createWardNG('NG-'+i));assert.equal(ngSpot(t),'desk');
  assert.equal(ngAction(t,'arrange'),'blocked');assert.equal(ngAction(t,'confirm'),'blocked');assert.equal(ngAction(t,'report'),'blocked');
  const order=i%2?NG_QUESTIONS:[...NG_QUESTIONS].reverse();
  assert.equal(ngAction(t,order[0].id),'asked');assert(!ngReady(t));assert.equal(ngAction(t,'arrange'),'blocked');
  assert.equal(ngAction(t,'defer'),'recall');assert.equal(t.stage,'phone');assert.equal(t.deferrals,1);assert.equal(t.asked.length,1);
  const resumed=JSON.parse(JSON.stringify(t));assert.equal(ngAction(resumed,order[0].id),'blocked');
  assert.equal(ngAction(resumed,order[1].id),'asked');assert(ngReady(resumed));assert.equal(ngAction(resumed,'arrange'),'arranged');assert.equal(ngSpot(resumed),'patient');
  assert.equal(ngAction(resumed,'report'),'blocked');assert.equal(ngAction(resumed,'confirm'),'blocked');
  assert.equal(ngAction(resumed,'assess'),'assessed');assert.equal(ngAction(resumed,'confirm'),'confirmed');assert.equal(ngSpot(resumed),'desk');
  assert.equal(ngAction(resumed,'report'),'done');assert.equal(ngSpot(resumed),null);assert.equal(ngAction(resumed,'report'),'blocked');
  assert.equal(ngAction(resumed,'defer'),'blocked');assert(resumed.assessed&&resumed.confirmed&&resumed.reported);
  assert(ngSource(t).includes(t.patient.ward));assert(t.patient.age>=18);assert(!t.patient.ward.includes('小兒'));if(t.patient.ward==='8F 感染科')assert(t.patient.attempt.includes('感染科'));
  assert.equal(t.patient.headNeck,t.patient.ward==='12F 腫瘤科');
  assert(createWardNG('NG-'+i,{practice:true}).practice);
  const run=createRun({mode:'party',seed:'NG-'+i,team:'A'});if(run.ids.includes('ng'))assert.equal(run.phases.find(p=>p.case==='ng').dest,'g2');
}
assert.equal(wards.size,NG_WARDS.length);assert(wards.has('8F 感染科'));assert(!wards.has('6G 小兒科'));
console.log('Ward NG passed: 200 reproducible cases cover 3 wards; phone questions, recall/resume, arrival assessment, position record and one-time ward reply.');
