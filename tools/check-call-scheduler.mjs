import assert from 'node:assert/strict';
import {createRun} from '../dist/game/event-deck.js';
import {createState} from '../dist/game/ent-data.js';
import {createStudioConcurrent,createStudioEvent} from '../dist/game/studio-tools.js';
import {parallelCalls,dispatchState,pendingWork,selectWork,releaseDueCalls,tickShiftClock,idlePhase,tickCallTimers} from '../dist/game/call-scheduler.js';
import {createFishCase,fishAction} from '../dist/game/fish-case.js';
for(let seed=0;seed<500;seed++){
  const s=createState();s.run=createRun({seed:'PARALLEL-'+seed});s.started=true;s.mode='walk';
  const expected=s.run.phases.filter(p=>p.kind==='case'&&!p.afterCase);
  // Even a never-completed first case cannot hold later scheduled arrivals.
  const first=s.run.phases.indexOf(expected[0]);s.phase=first;s.accepted=true;s.caseStep=2;
  const arrived=[];
  for(let time=450;time<=1890;time++){s.clock=time;arrived.push(...releaseDueCalls(s).map(p=>p.id));assert.equal(s.phase,first);assert.equal(s.caseStep,2);assert(s.accepted);}
  assert.deepEqual(arrived,expected.map(p=>p.id));assert.equal(new Set(arrived).size,expected.length);assert.deepEqual(releaseDueCalls(s),[]);
}
// The day flows into on-call work without an evening nursing-station gate.
for(const mode of ['random','party']){
  const t=createState();t.run=createRun({mode,seed:'DIRECT-NIGHT'});t.started=true;t.mode='walk';t.location='g2';t.clock=1020;
  assert.deepEqual(t.run.phases.filter(p=>p.kind==='handover').map(p=>p.id),['morning']);
  assert.equal(t.run.phases.find(p=>p.kind==='finish').clock,1890);
  const initial=t.run.phases.find(p=>p.id==='morning');dispatchState(t).handled.push(initial.id,'morning-work');
  const idle=t.run.phases[idlePhase(t)];assert.equal(idle.kind,'wait');assert.equal(idle.dest,'g2');
  const next=t.run.phases.find(p=>p.case&&p.clock>=1020);t.clock=next.clock;
  assert(releaseDueCalls(t).some(p=>p.id===next.id),'The first evening call arrives without a handover');assert.equal(t.location,'g2');
}
const s=createStudioConcurrent('RESUME');s.mode='walk';assert(parallelCalls(s));
s.phase=0;s.accepted=true;s.activeDest='g2';s.caseStep=2;s.caseMode='or';s.activeORProcedure='npx';s.clinicCallDeferred=true;
s.fish=createFishCase('RESUME');fishAction(s.fish,'send');const fishBefore=structuredClone(s.fish);
s.clock=1152;assert.deepEqual(releaseDueCalls(s).map(p=>p.case),['fish','wardOrder','wardExtend']);
assert(selectWork(s,1));assert.equal(s.accepted,false);assert.equal(s.caseStep,0);assert.equal(s.activeORProcedure,null);
s.accepted=true;s.caseStep=1;s.activeDest='f7';assert.deepEqual(pendingWork(s).map(p=>p.case),['fish','wardOrder']);
selectWork(s,2);s.accepted=true;s.activeDest='f7';assert.equal(pendingWork(s).length,3);
selectWork(s,0);assert.equal(s.caseStep,2);assert.equal(s.caseMode,'or');assert.equal(s.activeORProcedure,'npx');assert(s.clinicCallDeferred);assert.deepEqual(s.fish,fishBefore);
selectWork(s,1);assert.equal(s.caseStep,1);s.completed.push('wardOrder');s.accepted=false;assert.deepEqual(pendingWork(s).map(p=>p.case),['fish','wardExtend']);
assert.equal(s.clock,1152,'Switching/completing work never fast-forwards the clock');
assert(!selectWork(s,1000));assert.deepEqual(releaseDueCalls(s),[]);
for(const mode of ['case','call','fish','records','computer','nasal','surgery','walk']){
  const t=createStudioConcurrent('CLOCK');t.mode=mode;t.accepted=true;const before=t.clock;assert(tickShiftClock(t,5));assert(t.clock>before,mode+' consumes time while a task is unfinished');
}
for(const mode of ['pause','help','studio','welcome','end','vital-rules']){
  const t=createStudioConcurrent('PAUSE');t.mode=mode;t.clock=1200;assert(!tickShiftClock(t,10));assert.deepEqual(releaseDueCalls(t),[]);assert.equal(t.clock,1200);
}
for(const posture of ['stand','sit','lie']){const t=createStudioConcurrent('REST');t.mode='walk';t.care.posture=posture;tickShiftClock(t,10);assert(releaseDueCalls(t).some(p=>p.case==='wardExtend'));}
const capped=createStudioConcurrent('CAP');capped.mode='walk';capped.clock=1889;tickShiftClock(capped,10);assert.equal(capped.clock,1890);assert.equal(capped.run.phases[idlePhase(capped)].kind,'finish');
const isolated=createStudioEvent('fish','SINGLE');isolated.mode='walk';assert(!parallelCalls(isolated));assert(!tickShiftClock(isolated,10));assert.deepEqual(releaseDueCalls(isolated),[]);
const reset=createStudioConcurrent('NEW');assert.deepEqual(dispatchState(reset).released,[]);assert.deepEqual(pendingWork(reset),[]);
// Completing all outstanding work leaves the clock in place and exposes an idle context.
reset.mode='walk';reset.clock=1152;reset.completed=[...reset.run.ids];const i=idlePhase(reset);assert.equal(reset.run.phases[i].kind,'wait');assert.equal(reset.clock,1152);
const timerState=createStudioConcurrent('TIMER');timerState.mode='walk';let recalled=0;const timers=[{state:timerState,remaining:2.5,fn:()=>recalled++}];assert.deepEqual(tickCallTimers(timers,timerState,1),[]);timerState.mode='pause';assert.deepEqual(tickCallTimers(timers,timerState,60),[]);assert.equal(timers[0].remaining,1.5);timerState.mode='walk';selectWork(timerState,1);for(const fn of tickCallTimers(timers,timerState,1.5))fn();assert.equal(recalled,1,'Delayed recall survives task switching but waits through pause');assert.equal(timers.length,0);timers.push({state:timerState,remaining:1,fn:()=>recalled++});assert.deepEqual(tickCallTimers(timers,createStudioConcurrent('RESET'),10),[]);assert.equal(timers.length,0);assert.equal(recalled,1,'Old callbacks cannot leak into a new run');
console.log('Call scheduler passed: 500 full-day dispatches with unfinished work, multiple accepted tasks, generic/procedure context restore, independent modal and rest clocks, pause/end guards, no duplicate arrivals, no completion-driven clock jump, clean new runs and isolated studio events.');
