import assert from 'node:assert/strict';
import {createState} from '../dist/game/ent-data.js';
import {VITAL_RULES,SUPPLIES,changeVitals,refreshNeeds,workVitals,beginRest,endRest,tickVitals,eatSupply,startRage,tickRage,tickNightRest,shiftScore} from '../dist/game/vitals.js';
import {vitalRulesHTML,foodShelf,scoreBreakdown} from '../dist/game/self-care-ui.js';
const chair={id:'clinic-chair',restPose:'sit'},bed={id:'sleep',restPose:'lie'};
const s=createState();changeVitals(s,{energy:-1000,hunger:-1000});assert.equal(s.energy,0);assert.equal(s.hunger,0);assert.equal(refreshNeeds(s),'food');assert(s.care.energyLock&&s.care.hungerLock);assert(!endRest(s));
assert(eatSupply(s,'biscuit'));assert.equal(s.hunger,25);assert.equal(refreshNeeds(s),'rest');assert(!s.care.hungerLock);assert.equal(s.clock,455);
assert(beginRest(s,chair));assert(!endRest(s));tickVitals(s,10);assert.equal(s.energy,23);assert(!endRest(s));tickVitals(s,5);assert(s.energy>=30);assert(endRest(s));assert.equal(s.care.posture,'stand');
const a=createState(),b=createState();a.energy=b.energy=30;a.hunger=b.hunger=70;a.temper=b.temper=60;beginRest(a,bed);beginRest(b,bed);tickVitals(a,10);for(let i=0;i<100;i++)tickVitals(b,.1);for(const key of ['energy','hunger','temper'])assert(Math.abs(a[key]-b[key])<1e-8,'Recovery is independent of frame length');
assert.equal(Math.round(a.energy),60);assert.equal(Math.round(a.temper),52);const snapshot=JSON.stringify(a);tickVitals(a,10,{active:false});assert.equal(JSON.stringify(a),snapshot,'Pause and rules freeze resources');
const phone=createState();phone.energy=30;beginRest(phone,chair);const hunger=phone.hunger;tickVitals(phone,10,{allowDrain:false});assert.equal(phone.energy,45);assert.equal(phone.hunger,hunger,'Reading a call restores energy without reading-time hunger drain');
const tired=createState();tired.energy=10;refreshNeeds(tired);changeVitals(tired,{energy:10});assert(tired.care.energyLock,'Recovery requires 30, not just more than 10');changeVitals(tired,{energy:10});assert(!tired.care.energyLock);
const angry=createState();changeVitals(angry,{temper:100});assert(angry.care.ragePending);changeVitals(angry,{temper:-4});assert(angry.care.ragePending,'A threshold crossed during a case stays pending until the scene is safe');assert(startRage(angry));assert(!startRage(angry));const e=angry.energy;assert(!tickRage(angry,2.9));assert(tickRage(angry,.2));assert.equal(angry.temper,65);assert.equal(angry.energy,e-8);assert.equal(angry.care.rages,1);assert(!tickRage(angry,3));assert.equal(angry.care.rages,1);
for(const id of Object.keys(SUPPLIES)){const q=createState();q.energy=q.hunger=q.temper=50;assert(eatSupply(q,id));assert(q.energy>50&&q.hunger>50&&q.temper<50);}
const work=createState();workVitals(work);assert.equal(work.energy,82);assert.equal(work.hunger,65);assert.equal(work.temper,14);
const best=createState();best.energy=best.hunger=100;best.temper=0;assert.equal(shiftScore(best,120,120).total,100);assert.equal(shiftScore(best,0,120).total,30);const worst=createState();worst.energy=worst.hunger=0;worst.temper=100;assert.equal(shiftScore(worst,120,120).total,70);assert.equal(shiftScore(worst,0,120).total,0);
for(let i=0;i<200;i++){const q=createState();q.energy=i%101;q.hunger=(i*3)%101;q.temper=(i*7)%101;const score=shiftScore(q,i,150);assert(score.total>=0&&score.total<=100);assert.equal(Number(score.condition.toFixed(8)),Number(((q.energy+q.hunger+100-q.temper)/10).toFixed(8)));}
for(const html of [vitalRulesHTML({explore:true}),foodShelf(),foodShelf({ward:true}),foodShelf({emergency:true}),scoreBreakdown(s,80,120)])assert(!html.includes('undefined'));
assert.equal(createState().care.posture,'stand');assert.equal(createState().care.rages,0);assert.equal(VITAL_RULES.call,8);assert.equal(VITAL_RULES.urgentCall,12);
console.log('Vitals passed: threshold latches, forced food/rest recovery, concurrent needs, seated call recovery, pause, frame-rate independence, deferred once-only rage, food/work costs, fresh shift, weighted score boundaries and 200 condition scores.');

const nap=createState();beginRest(nap,bed,{night:true});assert(!tickNightRest(nap,9));assert(tickNightRest(nap,1));assert(!tickNightRest(nap,20),'Night call advances once');beginRest(nap,bed,{night:true});endRest(nap);assert(!tickNightRest(nap,20),'Getting up cancels the pending night wake-up');
