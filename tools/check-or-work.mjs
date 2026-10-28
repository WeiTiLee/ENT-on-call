import assert from 'node:assert/strict';
import {createBooking,bookingAction,BOOKING_CASES,BOOKING_SLOTS,placeNPXOrder} from '../dist/game/or-work.js';
import {createNPX,npxAction} from '../dist/game/npx-biopsy.js';
import {LOCAL_OR_IDS} from '../dist/game/event-pool.js';
import {createRun} from '../dist/game/event-deck.js';
import {createState} from '../dist/game/ent-data.js';
import {bookingMemo,workForm,bookingReview} from '../dist/game/or-work-ui.js';
const scenarios=new Set();let inDraw=0;
for(let i=0;i<150;i++){
  const t=createBooking('BOOK-'+i);scenarios.add(t.patient.id);assert.deepEqual(t,createBooking('BOOK-'+i));
  assert(!bookingAction(t,'submit').ok);assert(!bookingAction(t,'leave-slip').ok);assert(bookingAction(t,'accept').ok);
  const fill=(field,value)=>bookingAction(t,'edit',{field,value});
  fill('patient','wrong');fill('procedure',t.patient.procedure);fill('attending',t.patient.attending);fill('slot',BOOKING_SLOTS.find(s=>s.room===t.patient.room&&s.occupied).id);
  assert(!bookingAction(t,'review').ok);assert.equal(t.stage,'draft');fill('patient',t.patient.id);
  assert(!bookingAction(t,'review').ok,'An occupied slot is rejected even with matching paperwork');
  const right=BOOKING_SLOTS.find(s=>!s.occupied&&s.room===t.patient.room&&s.session===t.patient.session),wrong=BOOKING_SLOTS.find(s=>!s.occupied&&s.room===t.patient.room&&s.session!==t.patient.session);
  fill('slot',wrong.id);assert(!bookingAction(t,'review').ok);fill('slot',BOOKING_SLOTS.find(s=>!s.occupied&&s.room!==t.patient.room&&s.session===t.patient.session).id);assert(!bookingAction(t,'review').ok,'Wrong room must be rejected');fill('slot',right.id);
  fill('procedure','wrong');assert(!bookingAction(t,'review').ok);fill('procedure',t.patient.procedure);
  fill('attending','wrong');assert(!bookingAction(t,'review').ok);fill('attending',t.patient.attending);
  const saved=JSON.parse(JSON.stringify(t));assert.deepEqual(saved.draft,t.draft,'A partial request survives leaving the desk');
  assert(bookingAction(t,'review').ok);assert(bookingReview(t).includes(right.time));assert(bookingAction(t,'back').ok);assert.equal(t.draft.slot,right.id);
  bookingAction(t,'review');assert(bookingAction(t,'submit').ok);assert(!bookingAction(t,'submit').ok);assert.equal(t.stage,'submitted','Submitting still needs the slip left on the desk');
  assert(bookingAction(t,'leave-slip').completed);assert(!bookingAction(t,'leave-slip').completed,'Leaving the slip emits completion once');
  for(const html of [bookingMemo(t),workForm(t,{booking:true}),bookingReview(t)])assert(!html.includes('undefined'));
  const run=createRun({seed:'BOOK-RUN-'+i});if(run.ids.includes('booking')){inDraw++;const at=run.phases.find(p=>p.case==='booking'),or=run.phases.find(p=>LOCAL_OR_IDS.includes(p.case));assert(at.clock>=510&&at.clock<720);assert(run.phases.indexOf(at)<run.phases.indexOf(or));}
  assert(run.total===18);
}
assert.equal(scenarios.size,9);assert(inDraw>0&&inDraw<150,'Booking stays part of the random event pool');
const t=createNPX('ORDER'),snapshot=JSON.stringify(t);
assert(!placeNPXOrder(t,13).ok);npxAction(t,'verify',t.patient.id);
Object.assign(t.orderDraft,{patient:t.patient.id,procedure:'口腔檢體病理檢查',attending:t.attending});assert(!placeNPXOrder(t,13).ok);
t.orderDraft.procedure='鼻咽檢體病理檢查';assert(!placeNPXOrder(t,16).ok);assert(!t.orderPlaced);
const stage=t.stage;assert.deepEqual(placeNPXOrder(t,13),{ok:true,first:true});assert.deepEqual(placeNPXOrder(t,13),{ok:true,first:false});assert.equal(t.stage,stage,'An order must not advance the procedure');
assert(!workForm(t).includes('undefined'));assert.notEqual(JSON.stringify(t),snapshot);assert.equal(createState().booking,null);assert(!createNPX('ORDER').orderPlaced);
console.log('OR work passed: 150 seeded booking requests, correct identity/procedure/attending/session, occupied slots, resumable drafts, review/submit/leave-slip ordering, once-only completion, random morning placement, NPX order matching and shift reset.');

for(const procedure of ['SMP','FESS','tonsillectomy','tumor wide excision','neck dissection','tracheostomy'])assert(BOOKING_CASES.some(c=>c.procedure===procedure&&c.room===16));
