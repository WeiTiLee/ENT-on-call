import assert from 'node:assert/strict';
import {createFishCase,fishAction,fishStageText,FISH_SITES,FISH_HISTORY,FISH_EVENT,FISH_PLANS,fishSpot} from '../dist/game/fish-case.js';
import {fishHTML,fishSummary} from '../dist/game/fish-ui.js';
import {createState} from '../dist/game/ent-data.js';
import {EVENTS} from '../dist/game/event-pool.js';
const branches=new Set(),locations=new Set(),films=new Set();
for(let i=0;i<500;i++){
  const t=createFishCase('FISH-'+i);branches.add(t.variant);assert.deepEqual(t,createFishCase('FISH-'+i));assert.equal(t.stage,'phone');assert(fishStageText(t));assert(!fishAction(t,'finish').ok);assert(!fishAction(t,'extract').ok);
  if(i%2){assert(fishAction(t,'xray').ok);assert(t.xrayAsked);assert(!fishAction(t,'xray').ok);films.add(t.xray);}
  assert(fishAction(t,'send').ok);assert.equal(t.stage,'history');assert.equal(fishSpot(t),'desk');assert(!t.recordReviewed);assert(!fishAction(t,'history','when').ok);assert(!fishAction(t,'history-done').ok);assert(fishAction(t,'read-record').ok);assert(t.recordReviewed);assert.equal(fishSpot(t),'patient');assert(!fishAction(t,'read-record').ok);
  assert(fishHTML(t).includes(t.patient.name));assert(!fishHTML(t).includes('CT評估'));
  for(const q of [...FISH_HISTORY].reverse()){assert(fishAction(t,'history',q.id).ok);assert(!fishAction(t,'history',q.id).ok);}
  assert(fishAction(t,'history-done').ok);assert(!fishAction(t,'oral-check').ok);assert(!fishAction(t,'fiber').ok);
  assert(fishAction(t,'headlamp').ok);assert(fishAction(t,'oral-check').ok);assert(fishAction(t,'fiber').ok);assert.equal(t.stage,'scope');assert(!fishAction(t,'scope-done').ok);
  const initial=JSON.stringify(t);assert(!fishAction(t,'view','invalid').ok);assert.equal(initial,JSON.stringify(t));
  for(const site of FISH_SITES){assert(fishAction(t,'view',site.id).ok);assert(fishHTML(t).includes('aria-label="Fiber檢查位置"'));if(site.id===t.site){locations.add(site.id);assert(fishHTML(t).includes('標記可疑細長物'));assert(fishAction(t,'mark').ok);}}
  assert.equal(t.inspected.length,4);assert(fishAction(t,'view','vallecula').ok);assert.equal(t.inspected.length,4);
  const resumed=JSON.parse(JSON.stringify(t));assert.deepEqual(resumed,t);assert.equal(fishHTML(resumed),fishHTML(t));
  assert(fishAction(t,'scope-done').ok);
  if(t.variant==='found'){
    assert.equal(t.stage,'extract');assert.equal(t.activeSite,t.site,'Extraction restores the view containing the bone');assert(!fishAction(t,'extract').ok);assert(fishAction(t,'tool','cup').penalty);assert(!t.tool);assert(!t.removed);assert(fishAction(t,'tool','forceps').ok);assert(fishAction(t,'extract').ok);assert(t.removed);assert(!fishAction(t,'extract').ok);assert(!fishAction(t,'recheck-done').ok);assert(fishAction(t,'recheck').ok);assert(fishAction(t,'recheck-done').ok);assert.equal(t.plan,'removed');
  }else{
    assert.equal(t.stage,'plan');assert(!t.found);assert(!t.removed);assert(!fishAction(t,'extract').ok);
    const correct={mild:'observe',ct:'ct',esophagus:'endoscopy'}[t.variant],wrong=FISH_PLANS.find(p=>p.id!==correct).id;
    assert(fishAction(t,'plan',wrong).penalty);assert.equal(t.stage,'plan');assert(!t.plan);assert(fishAction(t,'plan',correct).ok);assert.equal(t.plan,correct);
  }
  assert.equal(t.stage,'explain');assert(fishSummary(t));assert(fishHTML(t).includes('完成說明與會診紀錄'));assert(!t.finished);assert(fishAction(t,'finish').completed);assert(t.finished);assert.equal(t.stage,'done');assert(!fishAction(t,'finish').ok);
}
assert.equal(branches.size,4);assert.equal(locations.size,4);assert.equal(films.size,2);assert.equal(createState().fish,null);assert.equal(EVENTS.fish,FISH_EVENT);assert.equal(FISH_EVENT.source,'1F 急診 · NP');assert(FISH_EVENT.phone.every(p=>p.dest==='g2'));
const missed=createFishCase('FISH-0|');assert(missed.site);fishAction(missed,'send');fishAction(missed,'read-record');for(const q of FISH_HISTORY)fishAction(missed,'history',q.id);fishAction(missed,'history-done');fishAction(missed,'headlamp');fishAction(missed,'oral-check');fishAction(missed,'fiber');for(const site of FISH_SITES)fishAction(missed,'view',site.id);assert(!fishAction(missed,'scope-done').ok);assert.equal(missed.stage,'scope');
console.log('Fish passed: 500 seeded cases, four outcome branches and four finding sites, optional X-ray question, history/headlamp/fiber gates, all-site inspection, correct-view extraction with tool checks, recheck and case-specific plan, resume and no repeat completion.');
