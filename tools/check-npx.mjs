import assert from 'node:assert/strict';
import {createNPX,npxAction,npxSpot,npxTarget,requestNPXSupport,joinNPXSenior,NPX_STAGES,NPX_PATIENTS} from '../dist/game/npx-biopsy.js';
import {EVENTS,LOCAL_OR_IDS} from '../dist/game/event-pool.js';
import {createRun,eventPoints} from '../dist/game/event-deck.js';
import {npxDrape,npxEndoscope,npxSpecimen} from '../dist/game/npx-art.js';
import {npxHTML} from '../dist/game/npx-ui.js';
const seen=new Set(),patients=new Set();
for(let seed=0;seed<120;seed++){
  const t=createNPX('NPX-'+seed);assert.deepEqual(t,createNPX('NPX-'+seed));seen.add(t.mass);patients.add(t.patient.id);
  assert.equal(npxAction(t,'handoff').ok,false);assert.equal(t.stage,'verify');assert.equal(t.mistakes,0);
  assert.equal(npxAction(t,'verify',NPX_PATIENTS.find(p=>p.id!==t.patient.id).id).penalty,true);assert.equal(t.stage,'verify');
  assert(npxAction(t,'verify',t.patient.id).ok);assert.equal(t.stage,'drape');
  for(const corner of [0,1]){assert(npxAction(t,'drape',corner).ok);assert.equal(t.stage,'drape');}
  assert.equal(npxAction(t,'drape',0).penalty,false);assert.equal(t.drapes.length,2);
  npxAction(t,'drape',2);assert.equal(t.stage,'packing');
  npxAction(t,'pack','cup');assert.equal(t.stage,'packing');
  npxAction(t,'pack','packing');assert.equal(t.stage,'scope');assert(t.packed);
  const errors=t.mistakes;npxAction(t,'inspect',(t.mass+1)%3);assert.equal(t.mistakes,errors);assert.equal(t.stage,'scope');
  npxAction(t,'inspect',t.mass);assert(t.found);assert.equal(npxSpot(t),'or-team-scrub');
  assert.deepEqual(npxTarget(t,null),{dest:'f5',spot:'or-13'});assert.deepEqual(npxTarget(t,13),{dest:'f5',spot:'or-team-scrub'});assert.deepEqual(npxTarget(t,16),{dest:'f5',spot:'or-exit'});
  npxAction(t,'instrument','swab');assert.equal(t.stage,'instrument');assert(!t.cup);
  npxAction(t,'instrument','cup');assert.equal(t.stage,'sample');assert(t.cup);
  npxAction(t,'sample',(t.mass+1)%3);assert(!t.specimen);
  npxAction(t,'sample',t.mass);assert.equal(t.stage,'hemostasis');assert(t.specimen);
  assert.equal(npxAction(t,'sample',t.mass).ok,false,'Only one specimen is taken');
  npxAction(t,'hemostasis','packing');assert.equal(t.stage,'hemostasis');
  npxAction(t,'hemostasis','swab');assert(t.hemostasis);assert.equal(t.stage,'label');
  for(const label of ['patient','site']){npxAction(t,'label',label);assert.equal(t.stage,'label');assert(!t.labeled);}
  npxAction(t,'label','correct');assert(t.labeled);assert.equal(npxSpot(t),'or-team-circulator');
  const snapshot=JSON.parse(JSON.stringify(t));assert.deepEqual(snapshot,t,'Partial work is ordinary serializable state');
  assert.equal(npxAction(t,'handoff').completed,true);assert(t.handedOver);assert.equal(t.stage,'done');assert.equal(npxAction(t,'handoff').completed,undefined,'Completion is emitted once');
}
assert.equal(seen.size,3);assert.equal(patients.size,3);assert.equal(eventPoints('orassist',{orassist:2}),6);
const t=createNPX('assisted',{practice:true});npxAction(t,'verify',t.patient.id);for(const i of [0,1,2])npxAction(t,'drape',i);npxAction(t,'pack','packing');
assert.equal(npxAction(t,'support').ok,false,'Support needs a visit to the senior first');assert.equal(t.stage,'scope');assert(requestNPXSupport(t));
assert.deepEqual(npxTarget(t,13),{dest:'f5',spot:'or-exit'});assert.deepEqual(npxTarget(t,null),{dest:'f5',spot:'or-16'});assert.deepEqual(npxTarget(t,16),{dest:'f5',spot:'or-team-senior'});
assert.equal(joinNPXSenior(t,13),false);assert.equal(t.stage,'scope');assert(joinNPXSenior(t,16));assert.equal(joinNPXSenior(t,16),false);assert.deepEqual(npxTarget(t,16),{dest:'f5',spot:'or-exit'});
assert(npxAction(t,'support').supported);assert.equal(t.stage,'instrument');assert.equal(npxAction(t,'support').ok,false,'Support must not skip the scrub handoff');npxAction(t,'instrument','cup');npxAction(t,'support');npxAction(t,'support');assert.equal(t.stage,'label');assert.equal(t.mistakes,0);assert.equal(t.assisted.length,3);assert.equal(npxAction(t,'handoff').ok,false,'Support still needs a correct label and physical handoff');
assert.equal(EVENTS.orassist.orRoom,13);assert(EVENTS.orassist.call.includes('NPX biopsy'));assert(EVENTS.orassist.source.includes('流動'));
for(let seed=0;seed<30;seed++){const run=createRun({seed:'NPX-RUN-'+seed});assert.equal(run.ids.filter(id=>LOCAL_OR_IDS.includes(id)).length,1);assert(run.total===18);assert.equal(run.phases.find(p=>LOCAL_OR_IDS.includes(p.case)).clock,810);}
for(const stage of NPX_STAGES.slice(0,-1)){const task=createNPX('art');task.stage=stage;const html=npxHTML(task,{near:true});assert(html.includes('id="modalTitle"'));assert(!html.includes('undefined'));}
for(const art of [npxDrape(t),npxEndoscope(t),npxSpecimen(t)])assert(art.includes('<svg')&&art.includes('role="img"'));
console.log('NPX biopsy passed: 120 seeded patients/views, ordered work, physical team targets, wrong-tool/label checks, inspection without penalty, support without skipping handoffs, one specimen and one completion, resumable state and unchanged event count.');
