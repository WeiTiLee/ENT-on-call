import assert from 'node:assert/strict';
import {EVENTS} from '../dist/game/event-pool.js';
import {MORNING_CASES,roundsComplete} from '../dist/game/morning-events.js';
import {studioEnabled,STUDIO_GROUPS,STUDIO_SCENES,STUDIO_EGGS,STUDIO_DINING_STATES,createStudioEvent,createStudioDining,createStudioSandbox} from '../dist/game/studio-tools.js';
import {restaurantView,collectFood} from '../dist/game/meal-breaks.js';
import {foodShelf} from '../dist/game/self-care-ui.js';
const ids=STUDIO_GROUPS.flatMap(g=>g.ids);
assert.equal(ids.length,35);assert.equal(new Set(ids).size,35);assert.deepEqual([...ids].sort(),Object.keys({...EVENTS,...MORNING_CASES}).sort());
assert(!studioEnabled(new URLSearchParams()));assert(!studioEnabled(new URLSearchParams('studio=0')));assert(!studioEnabled(new URLSearchParams('studio')));assert(studioEnabled(new URLSearchParams('studio=1')));
for(const id of ids){const s=createStudioEvent(id,'TEST-A',{name:'測試',character:'female'});assert.equal(s.name,'測試');assert.equal(s.character,'female');assert.equal(s.run.testId,id);assert.equal(s.run.total,1);assert.deepEqual(s.run.ids,[id]);assert(!s.explore);assert.equal(s.completed.length,0);assert.equal(s.energy,100);assert.equal(s.food.orders.length,0);assert(s.run.phases.some(p=>p.case===id||p.id===id));}
assert.equal(createStudioEvent('drink','TEST-A').run.phases[0].orRoom,13);
const r=createStudioEvent('rounds','TEST-A');assert(!r.morning.printed);assert.equal(r.run.phases[0].id,'morning');assert.equal(r.morning.escort,'done');
const n=createStudioEvent('nasal-cleaning','TEST-A');assert(roundsComplete(n.morning));assert.equal(n.morning.focus,'nasal');assert.equal(n.morning.escort,'waiting');assert.equal(n.completed.length,0);assert.equal(n.run.phases.length,1);
for(const id of STUDIO_GROUPS[1].ids)assert(createStudioEvent(id,'TEST-A').clock>=1020);
const states={};for(const [state] of STUDIO_DINING_STATES){const s=createStudioDining(state,'TEST-A');const view=restaurantView(s.food,s.clock);states[state]=view.state;assert(s.explore);assert.equal(s.run.total,0);assert(view.items.every(i=>i.id==='drink'));const html=foodShelf({dining:true,ward:true,items:view.items,diningView:view});assert(!html.includes('data-eat-supply="biscuit"'));assert(html.includes('<svg'));if(state==='ready'){assert(html.includes('無糖去冰茶'));assert(collectFood(s.food,'drink',s.clock,'or'));assert.equal(restaurantView(s.food,s.clock).state,'taken');assert.equal(collectFood(s.food,'drink',s.clock,'or'),null);}else{assert(!html.includes('data-eat-supply='));assert(html.includes('目前沒有可領取的飲料'));}}
assert.deepEqual(states,{'not-ordered':'not-ordered',waiting:'ordered',ready:'ready',collected:'taken',declined:'declined'});
assert(!foodShelf({dining:true}).includes('data-eat-supply='));assert(foodShelf({discussion:true}).includes('data-eat-supply="biscuit"'));
for(const t of [...STUDIO_SCENES,...STUDIO_EGGS]){const s=createStudioSandbox(t,'TEST-A');assert.equal(s.location,t.location);assert.equal(s.orRoom,t.room||null);assert(s.explore);assert.equal(s.completed.length,0);assert.equal(s.side.completed.length,0);}
assert.throws(()=>createStudioEvent('missing','TEST-A'));assert.throws(()=>createStudioDining('missing','TEST-A'));assert.throws(()=>createStudioSandbox({location:'x1'},'TEST-A'));
console.log('Studio passed: all 35 isolated trials, morning prerequisites, scene/egg entry, five restaurant states, cup-only empty state, real pickup and repeat prevention.');
