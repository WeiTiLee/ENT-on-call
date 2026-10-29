import assert from 'node:assert/strict';
import {NIGHT_WARD_IDS,NIGHT_REPEAT_IDS,createNightWardCall,wardCallAction,tickNightWaiting,WARD_ORDER_REQUESTS,isWardComputer,wardComputerTarget} from '../dist/game/night-ward-calls.js';
import {createRun} from '../dist/game/event-deck.js';
import {createState} from '../dist/game/ent-data.js';
import {createStudioNightWait,createStudioEvent} from '../dist/game/studio-tools.js';
const orderVariants=new Set();
const variations=new Map(NIGHT_WARD_IDS.map(id=>[id,new Set()]));
for(let seed=0;seed<500;seed++){
  const code='NIGHT-'+seed,run=createRun({seed:code});assert.equal(run.total,27);assert.equal(run.maxScore,270);assert.equal(new Set(run.ids).size,27);
  const calls=run.phases.filter(p=>p.kind==='case'&&p.clock>=1020),clocks=[1020,...calls.map(p=>p.clock),1890];
  assert(calls.length>=15);for(let i=1;i<clocks.length;i++)assert(clocks[i]-clocks[i-1]<=60,'Night phone gap exceeds one hour: '+code);
  for(const id of NIGHT_WARD_IDS){assert.equal(run.ids.filter(x=>x===id).length,1);const p=calls.find(p=>p.id===id);assert(p&&p.clock>=1035&&p.clock<1890);}
  assert(run.phases.find(p=>p.case==='wardConsent').clock<1440,'Pre-op consent belongs before midnight');
  assert(run.phases.find(p=>p.case==='wardExtend').clock>1440,'Medication call also interrupts the late night');
  assert.equal(calls.filter(p=>p.case==='wardOrder').length,6);assert.equal(calls.filter(p=>p.case==='wardExtend').length,3);assert.equal(new Set(calls.filter(p=>p.case==='wardOrder').map(p=>p.requestId)).size,6);for(const id of NIGHT_REPEAT_IDS)assert.equal(run.ids.filter(x=>x===id).length,1);
  assert.deepEqual(run,createRun({seed:code}));
  const party=createRun({mode:'party',seed:code});assert.equal(party.total,12);assert(!party.ids.some(id=>NIGHT_WARD_IDS.includes(id)));
  for(const id of NIGHT_WARD_IDS){
    const task=createNightWardCall(id,code);assert.deepEqual(task,createNightWardCall(id,code));assert.equal(task.dest,'f7');assert.equal(task.spot,id==='wardConsent'?'nurse':'computer');assert(task.call.includes(task.patient.name));assert(task.call.includes(task.patient.bed));assert.equal(task.steps.length,1);variations.get(id).add(task.patient.name+'|'+task.item);
    if(id==='wardConsent'){assert.match(task.patient.mrn,/^\d{8}$/);assert.equal(task.consent.stage,'verify');assert(!wardCallAction(task,task.steps[0].options[0]).ok);continue;}
    const start=JSON.stringify(task);assert(!wardCallAction(task,{good:true}).ok);assert.equal(JSON.stringify(task),start);
    if(id==='wardOrder'){
      orderVariants.add(task.request.id);assert(task.surgery);assert.equal(task.phone.length,1);
      assert.equal(task.steps[0].options.length,task.request.canRinse===undefined?1:2);
      if(task.request.canRinse!==undefined){const bad=task.steps[0].options.find(o=>!o.good);assert(wardCallAction(task,bad).penalty);assert.equal(task.step,0);assert(!task.done);}
    }else{assert.equal(task.steps[0].options.length,1);assert.equal(task.steps[0].options[0].text,'extend 藥物');assert.equal(task.phone.length,1);}
    const good=task.steps[0].options.find(o=>o.good),r=wardCallAction(task,good);assert(r.ok&&r.completed);assert.equal(task.step,1);assert(task.done);
    assert(!wardCallAction(task,good).ok,'A quick request cannot finish twice');
  }
}
for(const variants of variations.values())assert(variants.size>=3);
assert.deepEqual([...orderVariants].sort(),WARD_ORDER_REQUESTS.map(x=>x.id).sort(),'Every order variant appears across personal seeds');
for(const [location,room,spot] of [['f7',null,'computer'],['g2',null,'desk'],['f5',13,'or-computer'],['f5',16,'or-computer']])assert(isWardComputer(location,room,spot));
for(const [location,room,spot] of [['f7',null,'nurse'],['g2',null,'printer'],['f5',null,'or-computer'],['f5',12,'or-computer'],['g7',null,'computer']])assert(!isWardComputer(location,room,spot));
for(const [location,room,target] of [['f7',null,{dest:'f7',spot:'computer'}],['g7',null,{dest:'f7',spot:'computer'}],['g2',null,{dest:'g2',spot:'desk'}],['f1',null,{dest:'g2',spot:'desk'}],['f5',13,{dest:'f5',spot:'or-computer'}],['f5',16,{dest:'f5',spot:'or-computer'}],['f5',null,{dest:'f5',spot:'or-13'}]])assert.deepEqual(wardComputerTarget(location,room),target);
for(const posture of ['stand','sit','lie']){
  const s=createStudioNightWait('WAIT');s.care.posture=posture;s.mode='walk';
  for(let i=0;i<29;i++)assert(!tickNightWaiting(s,1));assert(tickNightWaiting(s,1),'Every posture must get a call after 30 active seconds');
  s.phase=1;assert(!tickNightWaiting(s,10),'Pending case must not spawn another phase');
}
for(const mode of ['studio','pause','case','call','computer','supply','travel','rage','end']){const s=createStudioNightWait('WAIT');s.mode=mode;assert(!tickNightWaiting(s,60));assert.equal(s.nightWaitElapsed,0);}
const wait=createStudioNightWait('WAIT');wait.mode='walk';assert(!tickNightWaiting(wait,10,{hasCall:true}));assert(!tickNightWaiting(wait,NaN));assert(!tickNightWaiting(wait,-1));assert.equal(wait.nightWaitElapsed,0);wait.clock=wait.run.phases[1].clock;assert(tickNightWaiting(wait,.01),'A due call rings even without lying down');
for(const props of [{explore:true},{started:false},{ending:true},{accepted:true}]){const s=createStudioNightWait('WAIT');Object.assign(s,props);assert(!tickNightWaiting(s,60));}
const ordinary=createStudioEvent('wardOrder','WAIT');ordinary.mode='walk';assert(!tickNightWaiting(ordinary,60));assert.equal(createState().nightWaitElapsed,0);assert.deepEqual(createState().wardCalls,{});
assert.throws(()=>createNightWardCall('other','WAIT'));
console.log('Night ward passed: 500 varied 27-task personal runs, ten short calls with unique identities, pre-op/late-night placement, <=60-minute scheduled gaps, unchanged party quota, six single-action order variants, one-click medication extension, all four computer contexts and routing, tablet-consent entry, wrong-choice gating and automatic standing/seated/lying night calls with pause and duplicate guards.');
