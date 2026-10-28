import assert from 'node:assert/strict';
import {createContact,contactAction,CLINIC_DIRECTORY,contactLine} from '../dist/game/clinic-contact.js';
import {contactDirectory,contactMemo,contactPhone,contactRelayOptions} from '../dist/game/clinic-contact-ui.js';
import {createRun} from '../dist/game/event-deck.js';
import {createState} from '../dist/game/ent-data.js';
for(const [id,extension] of Object.entries({maintenance:'3000',audiology:'2181',ward7:'3363',sicu:'3462','or-control':'53629'}))assert.equal(CLINIC_DIRECTORY.find(d=>d.id===id).extension,extension);
const kinds=new Set();let drawn=0;
assert.deepEqual(Object.fromEntries(CLINIC_DIRECTORY.slice(0,3).map(c=>[c.doctor,c.extension])),{'蔡醫師':'53361','魏醫師':'60101','黃醫師':'39197'});
for(let i=0;i<200;i++){
  const t=createContact('CONTACT-'+i);kinds.add(t.kind);assert.deepEqual(t,createContact('CONTACT-'+i));
  if(t.kind==='imaging')assert.equal(t.caller,'蔡主治');
  assert(!contactAction(t,'relay','correct').completed);assert(!contactAction(t,'call').ok);
  assert(contactAction(t,'accept').ok);assert(!contactAction(t,'call').penalty,'Looking at the sheet is a prerequisite, not a scored wrong call');
  assert(contactAction(t,'directory').ok);
  const wrong=CLINIC_DIRECTORY.find(d=>d.id!==t.kind&&d.extension.length===5);
  for(const d of wrong.extension)contactAction(t,'digit',d);
  assert(!contactAction(t,'call').ok);assert.equal(t.stage,'dial');assert.equal(t.mistakes,1);
  contactAction(t,'clear');contactAction(t,'digit','5');contactAction(t,'erase');assert.equal(t.digits,'');
  for(const d of t.target.extension)contactAction(t,'digit',d);contactAction(t,'digit','0');assert.equal(t.digits,t.target.extension,'Keypad caps at five digits');
  const resumed=JSON.parse(JSON.stringify(t));assert(contactAction(resumed,'call').ok);assert.equal(resumed.stage,'connected');
  assert(!contactAction(resumed,'relay','wrong-patient').ok);assert(!contactAction(resumed,'relay','wrong-purpose').ok);assert.equal(resumed.stage,'connected');
  assert(contactAction(resumed,'relay','correct').completed);assert(!contactAction(resumed,'relay','correct').completed,'Completion is once only');
  assert(contactLine(t).includes(t.patient.id));assert.equal(contactRelayOptions(t).filter(o=>o.id==='correct').length,1);
  for(const html of [contactDirectory(),contactMemo(t),contactPhone(t)])assert(!html.includes('undefined'));
  const run=createRun({seed:'CONTACT-RUN-'+i});if(run.ids.includes('contact')){drawn++;const p=run.phases.find(p=>p.case==='contact');assert(p.clock>=510&&p.clock<720);assert(!p.requiresDesk,'Attending request is not a ward consultation');}
}
assert.equal(kinds.size,3);assert(drawn>0&&drawn<200);assert.equal(createState().contact,null);
for(const kind of kinds)assert.equal(createContact('PRACTICE',{kind,practice:true}).kind,kind);
console.log('Clinic contact passed: 200 seeded requests, three real supplied extensions, correct caller/recipient/patient/purpose, paper prerequisite, five-digit keypad, wrong-call retry, resumable state, once-only completion and random morning scheduling.');
