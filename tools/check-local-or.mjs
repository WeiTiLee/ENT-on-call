import assert from 'node:assert/strict';
import {LOCAL_PROCEDURES,createLocalOR,localAction,localSpot,localTarget,requestLocalSupport,joinLocalSenior,tickLocalRest} from '../dist/game/local-or.js';
import {localHTML} from '../dist/game/local-or-ui.js';
import {localVisual} from '../dist/game/local-or-art.js';
import {createRun,partyDecks} from '../dist/game/event-deck.js';
import {EVENTS,LOCAL_OR_IDS} from '../dist/game/event-pool.js';
import {createState} from '../dist/game/ent-data.js';
import {createORList,syncORList,orListPaper} from '../dist/game/or-list.js';
import {placeNPXOrder} from '../dist/game/or-work.js';
import {ATTENDING_SURNAMES,ATTENDING_NAMES,OR_ATTENDINGS} from '../dist/game/staff.js';
import {createNPX} from '../dist/game/npx-biopsy.js';
import {BOOKING_CASES,WORK_ATTENDINGS} from '../dist/game/or-work.js';
assert.deepEqual(ATTENDING_SURNAMES,['蔡','徐','葉','黃','羅','王','呂','張']);assert.deepEqual(WORK_ATTENDINGS,ATTENDING_NAMES);assert.equal(new Set(ATTENDING_NAMES).size,8);
assert.equal(createNPX('staff').attending,OR_ATTENDINGS.npx);
for(const c of BOOKING_CASES)assert(ATTENDING_NAMES.includes(c.attending));
for(const room of [13,16])for(const row of createORList(room).rows)assert(ATTENDING_NAMES.includes(row.attending));
const seen=new Set(),lesions=new Set();
for(let i=0;i<100;i++)for(const kind of ['ear','oral']){
  const t=createLocalOR(kind,'LOCAL-'+i),config=LOCAL_PROCEDURES[kind];assert.deepEqual(t,createLocalOR(kind,'LOCAL-'+i));lesions.add(t.lesion);assert.equal(t.attending,OR_ATTENDINGS[kind]);assert.equal(createORList(13).rows.find(r=>r.id===kind).attending,t.attending);
  assert.equal(localAction(t,'handoff').ok,false);assert.equal(localAction(t,'finish').ok,false);assert(!placeNPXOrder(t,13).ok);
  assert.equal(localAction(t,'verify','someone-else').penalty,true);assert(localAction(t,'verify',t.patient.id).ok);
  Object.assign(t.orderDraft,{patient:t.patient.id,procedure:config.order,attending:t.attending});assert(!placeNPXOrder(t,16).ok);assert(placeNPXOrder(t,13).first);assert.equal(placeNPXOrder(t,13).first,false);
  if(kind==='oral'){assert(localAction(t,'headlamp').ok);assert(t.headlamp);}else{assert(!localAction(t,'local','syringe').ok);assert(localAction(t,'local','spray').ok);}
  for(const p of [0,1])assert(localAction(t,'drape',p).ok);assert.equal(localAction(t,'drape',0).penalty,false);assert(localAction(t,'drape',2).ok);
  assert(requestLocalSupport(t));assert.equal(joinLocalSenior(t,13),false);assert.deepEqual(localTarget(t,13,true),{dest:'f5',spot:'or-exit'});assert.deepEqual(localTarget(t,16,true),{dest:'f5',spot:'or-team-senior'});
  assert(!localAction(t,'support').ok);assert.equal(t.stage,kind==='ear'?'scope':'inspect');assert(joinLocalSenior(t,16));assert(!joinLocalSenior(t,16));
  if(i%2)assert(localAction(t,'support').supported);else{assert(!localAction(t,'inspect',kind==='ear'?'posterior-superior':(t.lesion+1)%3).ok);assert(localAction(t,'inspect',kind==='ear'?'anterior-inferior':t.lesion).ok);}
  if(kind==='oral'){assert(!localAction(t,'local','spray').ok);assert(localAction(t,'local','syringe').ok);}
  assert.equal(localSpot(t),'or-team-scrub');assert(!localAction(t,'support').ok,'Support cannot skip the instrument handoff');assert(!localAction(t,'instrument','swab').ok);assert(localAction(t,'instrument',kind==='ear'?'injection':'biopsy').ok);
  if(kind==='ear'){
    assert(!localAction(t,'inject','posterior-inferior').ok);assert(localAction(t,'inject','anterior-inferior').ok);assert(t.injected);assert(!localAction(t,'start-rest').ok);assert(!tickLocalRest(t,100));
    localAction(t,'explain-rest');assert.equal(t.feedback,'');localAction(t,'start-rest');assert.equal(t.feedback,'');tickLocalRest(t,4);assert(!localAction(t,'finish-rest').ok);assert(!tickLocalRest(t,NaN));
    const resumed=JSON.parse(JSON.stringify(t));tickLocalRest(resumed,6);assert.equal(resumed.restElapsed,10);assert.equal(localAction(resumed,'finish-rest').minutes,10);assert(!localAction(resumed,'finish').ok);localAction(resumed,'check','feeling');localAction(resumed,'check','instructions');assert(localAction(resumed,'finish').completed);assert(!localAction(resumed,'finish').completed);Object.assign(t,resumed);
  }else{
    assert(!localAction(t,'sample',(t.lesion+1)%3).ok);assert(localAction(t,'sample',t.lesion).ok);assert(!localAction(t,'sample',t.lesion).ok,'Only one specimen is collected');assert(!localAction(t,'cautery','swab').ok);assert(localAction(t,'cautery','cautery').ok);assert(t.hemostasis);
    for(const wrong of ['patient','site'])assert(!localAction(t,'label',wrong).ok);assert(localAction(t,'label','correct').ok);assert.equal(localSpot(t),'or-team-circulator');assert(localAction(t,'handoff').completed);assert(!localAction(t,'handoff').completed);assert(t.handedOver);
  }
  assert.deepEqual(localTarget(t,13,false),{dest:'f5',spot:'or-team-circulator'});
  const list=createORList(13);syncORList(list,{localCases:{[kind]:t},activeKind:kind});assert.equal(list.rows.find(r=>r.id===kind).patient,t.patient.name);assert(list.rows.find(r=>r.id===kind).note.startsWith('已'));assert(orListPaper(list,{selectable:true}).includes('data-local-case="'+kind+'"'));
  for(const stage of config.stages.slice(0,-1)){const view={...t,stage};assert(!localHTML(view,{near:true}).includes('undefined'));assert(localVisual(view).includes('<svg'));}
}
for(let i=0;i<150;i++){
  const run=createRun({seed:'LOCAL-RUN-'+i});const selected=run.ids.filter(id=>LOCAL_OR_IDS.includes(id));assert.equal(selected.length,1);seen.add(selected[0]);assert.equal(run.phases.find(p=>p.case===selected[0]).clock,810);assert.equal(run.total,18);assert.equal(new Set(run.ids).size,run.total);
  const decks=partyDecks('LOCAL-PARTY-'+i);assert.equal(new Set(Object.values(decks).flatMap(ids=>ids.filter(id=>LOCAL_OR_IDS.includes(id)))).size,3);
}
assert.equal(seen.size,3);assert.equal(lesions.size,3);assert.deepEqual(createState().localOR,{});assert.equal(createState().activeORProcedure,null);assert.equal(createLocalOR('other','test'),null);
for(const id of LOCAL_OR_IDS){assert.equal(EVENTS[id].orRoom,13);assert(EVENTS[id].source.includes('流動'));}
console.log('Local OR passed: 200 complete ear/oral procedures, instrument/identity/site checks, 10-minute rest gate and resume, specimen/cautery/label/handoff ordering, physical senior routes, per-case orders and lists, 150 varied single-OR runs and three distinct team procedures.');
