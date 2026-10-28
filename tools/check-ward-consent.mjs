import assert from 'node:assert/strict';
import {createNightWardCall,wardCallAction} from '../dist/game/night-ward-calls.js';
import {consentSpot,consentStageText,consentAction,consentHTML} from '../dist/game/ward-consent.js';
import {NURSING_STATION,hasWardPatientTask} from '../dist/game/ward-life.js';
const numbers=new Set(),names=new Set(),operations=new Set();
for(let i=0;i<300;i++){
  const t=createNightWardCall('wardConsent','TABLET-'+i),c=t.consent;
  numbers.add(t.patient.mrn);names.add(t.patient.name);operations.add(t.item);assert.match(t.patient.mrn,/^\d{8}$/);assert.equal(t.spot,'nurse');assert(!hasWardPatientTask({started:true,explore:false,accepted:true},{dest:'f7',spot:t.spot}));
  assert(!wardCallAction(t,t.steps[0].options[0]).ok,'Old generic choices cannot skip the tablet');
  for(const action of ['lookup','doctor-sign','carry-tablet','handoff','take-tablet'])assert(!consentAction(t,action).ok);
  assert(consentHTML(t).includes(t.patient.mrn));assert.equal(consentSpot(t),'nurse');
  assert(consentAction(t,'verify',t.steps[0].options.find(o=>!o.good)).penalty);assert.equal(c.stage,'verify');
  assert(consentAction(t,'verify',t.steps[0].options.find(o=>o.good)).ok);assert.equal(c.stage,'tablet');assert.equal(consentSpot(t),'consent-tablet');assert(!consentAction(t,'doctor-sign').ok);
  assert(consentAction(t,'take-tablet').ok);assert.equal(c.stage,'mrn');assert(c.tabletTaken);assert(consentHTML(t).includes('consentMRN'));
  assert(consentAction(t,'input','123').ok);assert(!consentAction(t,'lookup').penalty);assert.equal(c.stage,'mrn');
  assert(!consentAction(t,'input','123456789').ok);assert(!consentAction(t,'input','abc').ok);assert.equal(c.mrnInput,'123');
  assert(consentAction(t,'input','99999999').ok);assert(consentAction(t,'lookup').penalty);assert.equal(c.stage,'mrn');assert(!c.mrnMatched);assert(!consentAction(t,'handoff').ok);
  assert(consentAction(t,'input',t.patient.mrn).ok);assert(consentAction(t,'lookup').ok);assert.equal(c.stage,'sign');assert(c.mrnMatched);assert(!consentAction(t,'handoff').ok);assert(!consentAction(t,'carry-tablet').ok);
  let html=consentHTML(t);assert(html.includes('醫師簽名欄'));assert(html.includes('尚未簽署'));assert(!html.includes('doctor-signature signed'));
  assert(consentAction(t,'doctor-sign').signed);assert(!consentAction(t,'doctor-sign').ok);assert(c.doctorSigned);assert(!t.done);assert(!c.patientSigned);assert(!c.handedToNurse);assert(consentHTML(t).includes('doctor-signature signed'));
  // Leaving and returning preserves the MRN lookup and doctor's signature.
  const copy=JSON.parse(JSON.stringify(t));assert.deepEqual(copy.consent,c);assert(consentHTML(copy).includes('醫師已簽名'));assert.equal(consentSpot(copy),'consent-tablet');
  assert(consentAction(t,'carry-tablet').ok);assert.equal(consentSpot(t),'nurse');assert(consentStageText(t).includes('護理師'));assert(!t.done);assert(!c.patientSigned);assert(consentHTML(t).includes('病人簽名：待護理師'));
  const end=consentAction(t,'handoff');assert(end.completed);assert(c.handedToNurse);assert(c.doctorSigned);assert.equal(c.stage,'done');assert(t.done);assert.equal(t.step,5);assert(!c.patientSigned,'Nurse still needs to obtain the patient signature');assert(end.message.includes('病人簽名由護理師接續'));assert(!consentAction(t,'handoff').completed);
}
assert.equal(numbers.size,3);assert.equal(names.size,3);assert.equal(operations.size,3);assert.equal(NURSING_STATION.spots.tablet.id,'consent-tablet');assert(!consentAction(createNightWardCall('wardOrder','T'),'verify').ok);
console.log('Consent passed: 300 reproducible patient/MRN/procedure variants, nursing-station/tablet route, wrong and incomplete MRN gating, doctor-only signature, resumable progress, nurse handoff and pending patient signature, no generic bypass or repeat completion.');
