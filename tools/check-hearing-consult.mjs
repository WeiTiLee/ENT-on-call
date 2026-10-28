import assert from 'node:assert/strict';
import {createHearingConsult,consultAction,consultReady,consultSpot,consultResultsCall,CONSULT_HISTORY,CONSULT_PLAN} from '../dist/game/hearing-consult.js';
import {consultOtoscopy} from '../dist/game/hearing-consult-art.js';
import {createRun} from '../dist/game/event-deck.js';
import {EVENTS} from '../dist/game/event-pool.js';

const branches=new Set(),sides=new Set(),wards=new Set();
for(let i=0;i<250;i++){
  const t=createHearingConsult('AUDIO-'+i);assert.deepEqual(t,createHearingConsult('AUDIO-'+i));branches.add(t.branch);sides.add(t.patient.side);wards.add(t.patient.ward);assert(t.patient.chronic.includes('高血壓'));if(t.patient.ward==='12F 腫瘤科')assert(t.patient.chronic.includes('乳癌')&&t.patient.chronic.includes('治療'));else assert(t.patient.chronic.includes('糖尿病'));
  assert.equal(consultSpot(t),'desk');assert.equal(consultAction(t,'arrange'),'blocked');assert.equal(consultResultsCall(t,'g2'),null);
  assert.equal(consultAction(t,'question','side'),'asked');assert(!consultReady(t));assert.equal(consultAction(t,'arrange'),'blocked');
  assert.equal(consultAction(t,'question','onset'),'asked');assert(consultReady(t));assert.equal(consultAction(t,'arrange'),'testing');
  assert.equal(consultAction(t,'call-patient',t.patient.name),'blocked');assert.equal(consultAction(t,'answer-results'),'blocked');
  assert.equal(consultAction(t,'audiology-ready'),'ready');assert.equal(consultResultsCall(t,'f7'),null);assert(consultResultsCall(t,'g2').audiology);
  assert(!JSON.stringify(consultResultsCall(t,'g2')).includes(t.branch));assert.equal(consultAction(t,'answer-results'),'notified');assert.equal(consultResultsCall(t,'g2'),null);
  assert.equal(consultAction(t,'call-patient','別人'),'wrong-name');assert.equal(t.stage,'call-patient');assert.equal(consultAction(t,'call-patient',t.patient.name),'called');
  assert.equal(consultAction(t,'diagnosis',t.branch),'blocked');assert.equal(consultAction(t,'otoscopy'),'examined');
  assert.equal(consultAction(t,'diagnosis',t.branch==='sshl'?'wax':'sshl'),'wrong-diagnosis');assert.equal(t.stage,'review');
  assert.equal((consultOtoscopy(t,{interactive:true}).match(/data-consult-clean=/g)||[]).length,t.branch==='wax'?4:0);assert.equal(consultAction(t,'diagnosis',t.branch),'diagnosed');
  if(t.branch==='sshl'){
    const ear=t.patient.side,p=t.patient;assert(p[ear].filter((n,j)=>n-p.baseline[j]>=30).length>=3);assert(p[ear].every((n,j)=>Math.abs(n-p[ear==='right'?'boneRight':'boneLeft'][j])<=5));
    assert.equal(consultAction(t,'clean','right-0'),'blocked');assert.equal(consultAction(t,'history-done'),'blocked');
    for(const q of CONSULT_HISTORY)assert.equal(consultAction(t,'history',q.id),'asked');
    assert.equal(consultAction(t,'history-done'),'planned');assert.equal(consultAction(t,'explain'),'blocked');
    for(const q of CONSULT_PLAN){
      if(q.id!=='steroid'){assert.equal(consultAction(t,'plan',q.id),'planned');continue;}
      assert.equal(consultAction(t,'plan',q.id),'steroid-review');assert.equal(consultAction(t,'steroid','give'),'premature');
      const order=i%2?['counsel','med-history']:['med-history','counsel'];
      assert.notEqual(consultAction(t,'steroid',order[0]),'blocked');assert.equal(consultAction(t,'steroid','give'),'premature');
      assert.notEqual(consultAction(t,'steroid',order[1]),'blocked');assert.equal(consultAction(t,'steroid','give'),'planned');
      assert(t.medHistory&&t.steroidCounselled);
    }
    assert.equal(consultAction(t,'explain'),'explained');
  }else{
    assert(t.patient.right.concat(t.patient.left).every(n=>n<=25));assert.equal(consultAction(t,'plan','steroid'),'blocked');
    assert.equal(consultAction(t,'explain'),'blocked');assert.equal(consultAction(t,'clean','right-2'),'blocked');
    for(const key of ['right-0','left-0','right-1','left-1']){assert.equal(consultAction(t,'clean',key),'cleaned');assert.equal(consultAction(t,'clean',key),'blocked');}
    assert.equal(t.stage,'recheck');assert.equal((consultOtoscopy(t,{interactive:true}).match(/data-consult-clean=/g)||[]).length,0);assert.equal(consultAction(t,'explain'),'blocked');assert.equal(consultAction(t,'recheck','ears'),'rechecked');assert.equal(consultAction(t,'explain'),'blocked');assert.equal(consultAction(t,'recheck','feeling'),'rechecked');assert.equal(consultAction(t,'explain'),'explained');
  }
  assert.equal(consultSpot(t),'desk');const restored=JSON.parse(JSON.stringify(t));assert.equal(consultAction(restored,'report'),'done');assert.equal(consultAction(restored,'report'),'blocked');assert(restored.reported);assert.equal(consultSpot(restored),null);
  const run=createRun({mode:'party',seed:'AUDIO-'+i,team:'A'});if(run.ids.includes('sudden')){const p=run.phases.find(p=>p.case==='sudden');assert.equal(p.dest,'g2');assert(p.clock<720);}
}
assert.equal(branches.size,2);assert.equal(sides.size,3);assert.equal(wards.size,2);assert(EVENTS.sudden.requiresDesk&&EVENTS.sudden.daytime);
for(const branch of ['sshl','wax'])assert.equal(createHearingConsult('practice',{practice:true,branch}).branch,branch);
assert.deepEqual(createHearingConsult('formal',{branch:'wax'}),createHearingConsult('formal'));
console.log('Hearing consult passed: 250 seeded cases cover both branches, staged audiology notification, name/otoscopy gates, histories, treatment discussion, bilateral cleaning/recheck, resume and one-time report; daytime competitive scheduling.');
