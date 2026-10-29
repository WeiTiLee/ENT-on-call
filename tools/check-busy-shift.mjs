import assert from 'node:assert/strict';
import {createRun,resultScore} from '../dist/game/event-deck.js';
import {LOCAL_OR_IDS,OR_WORK_IDS} from '../dist/game/event-pool.js';
import {createStudioShift} from '../dist/game/studio-tools.js';
import {createNightWardCall,wardCallAction,WARD_ORDER_REQUESTS} from '../dist/game/night-ward-calls.js';
import {releaseDueCalls,selectWork,pendingWork} from '../dist/game/call-scheduler.js';
import {hudVitals} from '../dist/game/hud-state.js';
const plans=new Set();
for(let i=0;i<500;i++){
  const run=createRun({seed:'BUSY-'+i});plans.add(run.orPlan.kind);assert.equal(run.total,27);assert.equal(run.maxScore,270);assert.equal(new Set(run.ids).size,27);
  const or=run.phases.filter(p=>OR_WORK_IDS.includes(p.case));assert.equal(or.length,3);assert.equal(or.filter(p=>LOCAL_OR_IDS.includes(p.case)).length,run.orPlan.kind==='three-local'?3:2);assert(or.every(p=>p.clock>=810&&p.clock<1020));
  const night=run.phases.filter(p=>p.kind==='case'&&p.clock>=1020);assert(night.length>=15&&night.length<=17);const times=[1020,...night.map(p=>p.clock),1890];assert(times.every((n,j)=>!j||n-times[j-1]<=60));
  const orders=night.filter(p=>p.case==='wardOrder');assert.equal(orders.length,6);assert.deepEqual(orders.map(p=>p.requestId).sort(),WARD_ORDER_REQUESTS.map(r=>r.id).sort());
  const s=createStudioShift('or',run.seed);s.mode='walk';s.clock=950;
  const senior=s.run.phases.find(p=>p.case==='orSenior');const due=releaseDueCalls(s);assert.equal(due.length,senior?2:3);
  if(senior){assert(!due.some(p=>p.case==='orSenior'));s.completed.push(senior.afterCase);assert.deepEqual(releaseDueCalls(s).map(p=>p.case),['orSenior']);assert.deepEqual(releaseDueCalls(s),[]);}
  const party=createRun({mode:'party',seed:run.seed});assert.equal(party.total,12);assert.equal(party.ids.filter(id=>OR_WORK_IDS.includes(id)).length,1);
}
assert.equal(plans.size,2);
const s=createStudioShift('night','BUSY-0');s.mode='walk';s.clock=1200;releaseDueCalls(s);
const orderPhases=s.run.phases.map((p,i)=>({p,i})).filter(({p})=>p.case==='wardOrder');
const [a,b]=orderPhases;selectWork(s,a.i);s.accepted=true;s.caseStep=1;selectWork(s,b.i);s.accepted=true;s.caseStep=0;
assert.deepEqual(pendingWork(s).map(p=>p.id),[a.p.id,b.p.id]);selectWork(s,a.i);assert.equal(s.caseStep,1);assert(s.accepted);s.completed.push(a.p.id);s.accepted=false;assert.deepEqual(pendingWork(s).map(p=>p.id),[b.p.id]);selectWork(s,b.i);assert.equal(s.caseStep,0);assert(s.accepted);
const tasks=orderPhases.map(({p})=>createNightWardCall(p.case,'BUSY',{instanceId:p.id,requestId:p.requestId}));assert.equal(new Set(tasks.map(t=>t.id)).size,6);for(const t of tasks){assert(wardCallAction(t,t.steps[0].options.find(o=>o.good)).completed);assert(!wardCallAction(t,t.steps[0].options[0]).completed);}assert.equal(resultScore(tasks.map(t=>t.id)),60);assert.equal(resultScore([tasks[0].id,tasks[0].id]),10);
for(const [state,levels] of [[{energy:88,hunger:70,temper:18},['normal','normal','normal']],[{energy:30,hunger:25,temper:70},['warning','warning','warning']],[{energy:10,hunger:0,temper:99},['critical','critical','critical']]])assert.deepEqual(hudVitals(state).map(v=>v.level),levels);
console.log('Busy shift passed: 500 varied 27-task runs, 15–17 night calls with <=60-minute gaps, all six distinct order requests, three OR jobs in both plans, completion-triggered room-16 followup once, independent repeated-call progress/scoring, unchanged party quotas and visible vital warning thresholds.');
