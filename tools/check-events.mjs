import assert from 'node:assert/strict';
import {EVENTS,CATEGORIES,OUTPATIENT_IDS,LOCAL_OR_IDS,OR_WORK_IDS,FIXED_ORDER_IDS} from '../dist/game/event-pool.js';
import {nightCaseId} from '../dist/game/night-ward-calls.js';
import {MORNING_CASES,MORNING_IDS} from '../dist/game/morning-events.js';
import {PARTY_QUOTA,partyDecks,createRun,orderedChoices,eventPoints,resultScore} from '../dist/game/event-deck.js';
import {LOCATIONS,nextHop} from '../dist/game/ent-data.js';
import {readFile} from 'node:fs/promises';
const graph=JSON.parse(await readFile(new URL('../dist/game/navigation.json',import.meta.url),'utf8'));
const ids=Object.keys(EVENTS),categorySizes={urgent:4,routine:20,odd:5,daily:5};
const spots={f7:['patient','food','nurse','computer'],f5:['operation'],g2:['patient','patient2','desk','clinic-phone','printer','tissue'],f1:['patient']};
assert.equal(ids.length,34);
for(const [category,size] of Object.entries(categorySizes))assert.equal(ids.filter(id=>EVENTS[id].category===category).length,size);
for(const [id,c] of Object.entries(EVENTS)){
  assert(CATEGORIES[c.category]&&LOCATIONS[c.dest]&&c.brief&&c.call&&c.title,id);
  assert(c.phone.some(o=>o.dest),'No phone progress: '+id);
  for(const o of c.phone){assert(o.why||o.dest);if(o.dest){assert(LOCATIONS[o.dest]);assert(o.reply);}}
  if(!c.phoneOnly){assert(spots[c.dest].includes(c.spot),'Missing spot '+id);assert(c.steps.length>0);for(const step of c.steps){assert(step.ask&&step.options.some(o=>o.good),id);for(const o of step.options)assert(o.text&&o.reply);}}
  const route=nextHop(graph,'f7',c.dest);assert(c.dest==='f7'||route,id);
}
const counts=new Set(),firstPositions=new Set(),seen=new Set();let maxShared=0;
for(let seed=0;seed<500;seed++){
  const code='TEST-'+seed,decks=partyDecks(code),teams=['A','B','C'];
  assert.equal(new Set(Object.values(decks).map(ids=>ids[2])).size,3);
  assert(new Set(Object.values(decks).flat()).size>=20,'Three teams must keep a varied pool, including the two shared ward tasks');
  for(const team of teams){const run=createRun({mode:'party',seed:code,team});assert.equal(run.total,12);for(const id of FIXED_ORDER_IDS)assert(run.ids.includes(id));assert.equal(new Set(run.ids).size,12);assert.deepEqual(run.categories,PARTY_QUOTA);assert.deepEqual(run.ids,createRun({mode:'party',seed:code,team}).ids);assert.equal(run.maxScore,120);for(const p of run.phases.filter(p=>p.kind==='case'&&EVENTS[p.case].category==='routine'&&!LOCAL_OR_IDS.includes(p.case)))assert(p.clock<720,'Clinic work must be scheduled in the morning');assert.equal(run.phases.filter(p=>p.kind==='case').length,9);assert.deepEqual(run.ids.slice(0,2),MORNING_IDS);assert(OUTPATIENT_IDS.includes(run.ids[2]));assert.equal(run.ids.filter(id=>LOCAL_OR_IDS.includes(id)).length,1);assert(run.phases.find(p=>LOCAL_OR_IDS.includes(p.id)).clock>=780);assert(run.phases.find(p=>LOCAL_OR_IDS.includes(p.id)).clock<1050);assert(!run.ids.some(id=>['printer','tissue','water'].includes(id)));assert.equal(run.phases.find(p=>p.kind==='case').clock,510);let clock=0;for(const p of run.phases){assert(p.clock>=clock);clock=p.clock;}const sleep=run.phases.findIndex(p=>p.kind==='sleep');assert.equal(run.phases[sleep+1].kind,'case');}
  for(let a=0;a<3;a++)for(let b=a+1;b<3;b++){assert.notDeepEqual(decks[teams[a]],decks[teams[b]]);const shared=decks[teams[a]].filter(id=>decks[teams[b]].includes(id)).length;maxShared=Math.max(maxShared,shared);}
  const r=createRun({seed:code});assert(OUTPATIENT_IDS.includes(r.ids[2]));assert.equal(r.ids.filter(id=>LOCAL_OR_IDS.includes(id)).length,r.orPlan.kind==='three-local'?3:2);assert(r.phases.find(p=>LOCAL_OR_IDS.includes(p.id)).clock===810);assert.equal(r.total,27);assert.equal(r.maxScore,270);for(const id of FIXED_ORDER_IDS)assert(r.ids.includes(id));assert.equal(r.phases.find(p=>p.id==='lunchOrder').clock,990);assert.equal(r.phases.find(p=>p.id==='dinner').clock,1080);assert(!r.phases.some(p=>p.case==='drink'));for(let i=1;i<r.phases.length;i++)assert(r.phases[i].clock>=r.phases[i-1].clock);assert.equal(r.total,new Set(r.ids).size);counts.add(r.total);r.ids.forEach(id=>seen.add(nightCaseId(id)));
  const options=[{good:true},{good:false},{good:false}];const shuffled=orderedChoices(options,code);assert.deepEqual(shuffled,orderedChoices(options,code));firstPositions.add(shuffled.findIndex(o=>o.good));
}
assert.equal(counts.size,1);assert.equal(seen.size,36);assert.equal(firstPositions.size,3);
assert.equal(eventPoints('fish',{fish:2}),6);assert.equal(eventPoints('fish',{fish:20}),0);assert.equal(resultScore(['fish','fish','nose'],{fish:1}),18);
console.log('Events passed: 36 events; 500 seeded three-team draws have 2 shared ward tasks plus 10 calls, 12 unique events and equal categories per team; personal runs have 27 tasks with guaranteed bento/drink orders, shuffled answers, score caps. Max pair overlap: '+maxShared+'/12.');


assert(EVENTS.ng.requiresDesk);assert(EVENTS.ng.source.includes('病房'));assert(!EVENTS.ng.source.includes('小禾'));
for(const id of OUTPATIENT_IDS){assert(EVENTS[id].outpatient);assert.equal(EVENTS[id].dest,'g2');assert(EVENTS[id].call.includes('門診'));assert(!EVENTS[id].call.includes('會診'));}

for(const id of OUTPATIENT_IDS){assert.equal(EVENTS[id].phone.length,3);assert.deepEqual(EVENTS[id].phone.map(o=>o.outpatientAction),['leave','finish-rounds','hangup']);}
