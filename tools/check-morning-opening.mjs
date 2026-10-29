import assert from 'node:assert/strict';
import {createMorningOpening,checkMorningCalendar,openingTarget,conferenceQuestions,beginConference,answerConference} from '../dist/game/morning-opening.js';
import {createMorning,printPatientList} from '../dist/game/morning-events.js';
import {perimeterApproaches,spotDistance,sortedApproaches} from '../dist/game/interaction-points.js';
const variants=new Set();
for(let i=0;i<150;i++){
 const seed='CALENDAR-'+i,o=createMorningOpening(seed),m=createMorning(seed);variants.add(o.conference);assert.deepEqual(o,createMorningOpening(seed));assert.equal(openingTarget(o).spot,'computer');assert(!beginConference(o));assert(!answerConference(o,m,0));assert(checkMorningCalendar(o));assert(!checkMorningCalendar(o));assert(!m.printed);
 if(o.conference){assert.equal(openingTarget(o).spot,'conference');assert(beginConference(o));const qs=conferenceQuestions(m);assert.equal(qs.length,2);assert(!answerConference(o,m,1));assert.equal(o.question,0);assert.equal(o.mistakes,1);assert(answerConference(o,m,0));o.focused=false;assert.equal(openingTarget(o),null);assert.equal(o.question,1);o.focused=true;assert.equal(openingTarget(o).spot,'conference');assert(answerConference(o,m,0));assert.equal(o.stage,'done');assert(!o.focused);assert(!answerConference(o,m,0));}else{assert.equal(o.stage,'done');assert(!beginConference(o));}
 assert.equal(openingTarget(o),null);assert(printPatientList(m));assert(m.printed);
}
assert.equal(variants.size,2);
const spot={x:0,z:3,approaches:perimeterApproaches(0,0,4,2,1)};
for(const p of [{x:0,z:2},{x:0,z:-2},{x:3,z:0},{x:-3,z:0}])assert.equal(spotDistance(spot,p),0);
assert(Math.abs(spotDistance(spot,{x:0,z:-2},p=>p.z>=0)-Math.sqrt(13))<1e-10);
assert.equal(sortedApproaches(spot,{x:0,z:-8})[0].z,-2);
assert.equal(spotDistance(spot,{x:0,z:0},()=>false),Infinity);
console.log('Morning opening passed: 150 reproducible schedules, both calendar routes, report prerequisite, wrong answers, resumable questions, no duplicate completion; four object approaches and blocked-side filtering.');
