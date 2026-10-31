import {dayClockRate,spendShiftTime} from './day-pacing.js';
import {openingClockRate} from './morning-opening.js';
// Phone arrivals follow the shift clock; selected work is a separate, resumable context.
const WORK_FIELDS=['accepted','activeDest','caseStep','caseMode','awaitingDesk','clinicCallDeferred','activeORProcedure'];
const defaults={accepted:false,activeDest:null,caseStep:0,caseMode:'patient',awaitingDesk:false,clinicCallDeferred:false,activeORProcedure:null};
export const parallelCalls=s=>!!s.run&&!s.explore&&(!s.run.studio||!!s.run.concurrentPreview);
export function dispatchState(s){return s.dispatch??={released:[],work:{},handled:[]};}
export function saveWork(s){
  const p=s.run?.phases[s.phase],id=p?.id;if(!p?.case)return;
  dispatchState(s).work[id]=Object.fromEntries(WORK_FIELDS.map(key=>[key,s[key]]));
}
export function selectWork(s,index){
  const p=s.run?.phases[index];if(!p)return false;
  saveWork(s);s.phase=index;
  Object.assign(s,defaults,p.case?dispatchState(s).work[p.id]||{}:{});
  s.food.focus=null;s.food.drinkSeeking=false;return true;
}
export function pendingWork(s){
  saveWork(s);return s.run.phases.flatMap((p,index)=>p.case&&!s.completed.includes(p.id)&&dispatchState(s).work[p.id]?.accepted?[{...p,index,work:dispatchState(s).work[p.id]}]:[]);
}
export const callTimeRunning=s=>s.started&&!s.ending&&!['welcome','pause','help','vital-rules','studio','end'].includes(s.mode);
export function tickCallTimers(timers,s,dt){
  const ready=[];for(let i=timers.length-1;i>=0;i--){const t=timers[i];if(t.state!==s||!s.started||s.ending){timers.splice(i,1);continue;}if(!callTimeRunning(s)||!Number.isFinite(dt)||dt<=0)continue;t.remaining-=dt;if(t.remaining<=0){timers.splice(i,1);ready.unshift(t.fn);}}return ready;
}
export function releaseDueCalls(s){
  if(!parallelCalls(s)||!callTimeRunning(s))return[];
  const d=dispatchState(s),due=[];
  s.run.phases.forEach((p,index)=>{if(p.kind!=='case'||p.clock>s.clock||d.released.includes(p.id)||p.afterCase&&!s.completed.includes(p.afterCase))return;d.released.push(p.id);if(!s.completed.includes(p.id))due.push({...p,index});});
  return due;
}
export function tickShiftClock(s,dt){
  if(!parallelCalls(s)||!s.started||s.ending||!Number.isFinite(dt)||dt<=0||['welcome','pause','help','vital-rules','studio','supply','travel','rage','end'].includes(s.mode))return false;
  // Reading or doing a procedure still takes time; pause and authoring tools stop the clock.
  const rate=openingClockRate(s)??dayClockRate(s)??(s.care.posture==='lie'?(s.care.nightRest?6:2):s.run.phases[s.phase]?.kind==='morning-work'?2:1.2);
  spendShiftTime(s,dt*rate);return true;
}
export function idlePhase(s){
  const phases=s.run.phases,d=dispatchState(s);
  let index=phases.findIndex(p=>p.id==='between-calls');
  if(index<0){index=phases.length;phases.push({id:'between-calls',kind:'wait',clock:450,title:'接續待辦，也照顧自己',description:'電話會照時間打進來。可從待辦切換工作，或趁空檔坐下休息。',dest:'g2',spot:'desk',destination:'2G 初診間 · 電腦'});}
  if(s.morning&&!s.morning.printed)return phases.findIndex(p=>p.id==='morning');
  if(s.clock>=1890)return phases.findIndex(p=>p.kind==='finish');
  const milestones=phases.map((p,i)=>({p,i})).filter(({p})=>!p.case&&['morning-work','handover','break','sleep'].includes(p.kind)&&p.clock<=s.clock&&!d.handled.includes(p.id));
  return milestones.at(-1)?.i??index;
}
