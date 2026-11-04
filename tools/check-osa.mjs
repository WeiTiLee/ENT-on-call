import assert from 'node:assert/strict';
import {createOSABleed,osaAction,osaTarget,osaStageText,osaVitalText,OSA_EVENT} from '../dist/game/osa-bleeding.js';
import {osaHTML,osaPhoneHTML} from '../dist/game/osa-ui.js';
import {CASES,createState} from '../dist/game/ent-data.js';
import {EVENTS} from '../dist/game/event-pool.js';
import {callAllowed} from '../dist/game/call-scheduler.js';
import {operatingTarget} from '../dist/game/operating-plan.js';
const branches=new Set(),pressures=new Set();
for(let i=0;i<400;i++){
 const t=createOSABleed('OSA-'+i);assert.deepEqual(t,createOSABleed('OSA-'+i));branches.add(t.site+'-'+t.clearWithHeadlamp);pressures.add(t.bpHigh);assert.equal(t.patient.bed,'7F23A');assert(osaPhoneHTML(t).includes('五天前開達文西OSA'));assert(!osaAction(t,'finish').ok);assert(!osaAction(t,'route','direct').ok);assert(!osaAction(t,'first-aid','ice').ok);
 for(const q of ['vitals','amount'])assert(osaAction(t,'ask',q).ok);assert(!osaAction(t,'ask','amount').ok);
 for(const q of ['sit','ice'])assert(osaAction(t,'first-aid',q).ok);
 const route=i%2?'direct':'fiber';assert(osaAction(t,'route',route).accepted);
 if(route==='fiber'){assert.deepEqual(osaTarget(t),{dest:'g2',spot:'clinic-fiber'});assert(osaHTML(t).includes('拿起fiber'));assert(osaAction(t,'pickup').travel);assert(t.hasFiber);assert(!osaAction(t,'pickup').ok);}
 assert.deepEqual(osaTarget(t),{dest:'f7',spot:'patient'});assert(osaAction(t,'arrival').ok);assert(!osaAction(t,'examine').ok);assert(!osaAction(t,'bosmin').ok);assert(osaAction(t,'headlamp').ok);assert(osaAction(t,'examine').ok);assert(osaVitalText(t));
 if(!t.clearWithHeadlamp){assert(osaAction(t,'identify',t.site).penalty);if(!t.hasFiber){assert(!osaAction(t,'fiber').ok);assert(osaAction(t,'request-fiber').ok);}assert(osaAction(t,'fiber').ok);assert(t.fiberUsed);}
 assert(osaAction(t,'identify',t.site==='tonsil'?'tongue':'tonsil').penalty);assert(osaAction(t,'identify',t.site).ok);assert(!osaAction(t,'medical','transamin').ok);assert(osaAction(t,'bosmin').ok);assert(!osaAction(t,'recheck').ok);assert(osaAction(t,'medical','bp').ok);assert(!osaAction(t,'medical','bp').ok);assert(osaAction(t,'medical','transamin').ok);assert(osaAction(t,'recheck').ok);assert(!osaAction(t,'finish').ok);assert(osaAction(t,'assess-result').ok);
 const resumed=JSON.parse(JSON.stringify(t));assert.equal(osaHTML(resumed),osaHTML(t));assert(osaStageText(resumed));assert(osaAction(resumed,'finish').completed);assert(!osaAction(resumed,'finish').ok);assert(!t.finished);assert.equal(resumed.stage,'done');
}
assert.equal(branches.size,3);assert.equal(pressures.size,2);assert.equal(EVENTS.tonsil,OSA_EVENT);assert.equal(CASES.tonsil,OSA_EVENT);assert.equal(createState().osaBleed,null);assert(!OSA_EVENT.orRoom);assert.deepEqual(operatingTarget(OSA_EVENT,'or'),{dest:'f7',spot:'patient'});assert(callAllowed({location:'f5'},{caseId:'tonsil'}));assert(!JSON.stringify(OSA_EVENT).includes('action":"or'));assert.equal(OSA_EVENT.callType,'ward');
console.log('OSA bleeding passed: 400 seeded ward cases, two sites/three visibility branches, phone questions/first-aid gates, both travel routes, headlamp before fiber, bedside delivery, Bosmin-first treatment, BP/TXA checks, reassessment/observation, resume and no OR route.');
