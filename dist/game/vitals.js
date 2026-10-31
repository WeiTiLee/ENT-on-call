import {spendShiftTime} from './day-pacing.js';
export const VITAL_RULES={call:8,urgentCall:12,mistake:8,work:{energy:-6,hunger:-5,temper:-4},travel:{energy:-1,temper:1},sit:{energy:1.5,temper:-.4},lie:{energy:3,temper:-.8},drain:{walk:.12,stand:.03,hunger:.04},energyLow:10,energyReady:30,hungerReady:25,rageSeconds:3,rageReset:65,rageEnergy:-8};
export const SUPPLIES={
  biscuit:{name:'餅乾',energy:8,hunger:25,temper:-5,minutes:5},
  drink:{name:'飲料',energy:6,hunger:10,temper:-4,minutes:3},
  takoyaki:{name:'章魚燒',energy:8,hunger:25,temper:-6,minutes:5},
  meal:{name:'值班餐',energy:12,hunger:45,temper:-12,minutes:10}
};
export function createSelfCare(){return{posture:'stand',spot:null,energyLock:false,hungerLock:false,ragePending:false,rageActive:false,rageElapsed:0,nightRest:false,nightElapsed:0,snacks:0,rages:0};}
const clamp=n=>Math.max(0,Math.min(100,n));
export function refreshNeeds(s){
  const c=s.care;
  if(s.energy<=VITAL_RULES.energyLow)c.energyLock=true;else if(s.energy>=VITAL_RULES.energyReady)c.energyLock=false;
  if(s.hunger<=0)c.hungerLock=true;else if(s.hunger>=VITAL_RULES.hungerReady)c.hungerLock=false;
  return c.hungerLock?'food':c.energyLock?'rest':null;
}
export function changeVitals(s,effect={}){
  for(const key of ['energy','hunger','temper'])if(Number.isFinite(effect[key]))s[key]=clamp(s[key]+effect[key]);
  if(s.temper>=100&&!s.care.rageActive)s.care.ragePending=true;
  refreshNeeds(s);
}
export function workVitals(s){changeVitals(s,VITAL_RULES.work);}
export function beginRest(s,spot,{night=false}={}){
  if(!spot?.restPose)return false;
  s.care.posture=spot.restPose;s.care.spot=spot.id;s.care.nightRest=night;s.care.nightElapsed=0;return true;
}
export function endRest(s,{force=false}={}){
  refreshNeeds(s);if(!force&&s.care.energyLock)return false;
  s.care.posture='stand';s.care.spot=null;s.care.nightRest=false;return true;
}
export function tickVitals(s,dt,{moving=false,active=true,allowDrain=true}={}){
  if(!active||!Number.isFinite(dt)||dt<=0||s.care.rageActive)return;
  if(s.care.posture!=='stand'){
    const gain=VITAL_RULES[s.care.posture];changeVitals(s,{energy:gain.energy*dt,temper:gain.temper*dt,hunger:s.explore||!allowDrain?0:-VITAL_RULES.drain.hunger*dt});s.stats.restSeconds+=dt;
  }else if(!s.explore)changeVitals(s,{energy:-dt*(moving?VITAL_RULES.drain.walk:VITAL_RULES.drain.stand),hunger:-dt*VITAL_RULES.drain.hunger});
}
export function eatSupply(s,id){const food=SUPPLIES[id];if(!food)return false;changeVitals(s,food);spendShiftTime(s,food.minutes);s.care.snacks++;if(id==='meal')s.stats.meals++;return true;}
export function startRage(s){if(!s.care.ragePending||s.care.rageActive)return false;s.care.ragePending=false;s.care.rageActive=true;s.care.rageElapsed=0;return true;}
export function tickRage(s,dt){
  if(!s.care.rageActive||!Number.isFinite(dt)||dt<=0)return false;
  s.care.rageElapsed+=dt;if(s.care.rageElapsed<VITAL_RULES.rageSeconds)return false;
  s.care.rageActive=false;s.care.rages++;s.temper=VITAL_RULES.rageReset;changeVitals(s,{energy:VITAL_RULES.rageEnergy});spendShiftTime(s,3);return true;
}
export function shiftScore(s,taskPoints,taskMax){
  const task=Math.max(0,Math.min(70,taskMax>0?taskPoints/taskMax*70:0)),energy=clamp(s.energy)/10,hunger=clamp(s.hunger)/10,temper=(100-clamp(s.temper))/10;
  return{task,energy,hunger,temper,condition:energy+hunger+temper,total:Math.round((task+energy+hunger+temper)*10)/10};
}

export function tickNightRest(s,dt){if(!s.care.nightRest||s.care.posture!=='lie'||!Number.isFinite(dt)||dt<=0)return false;s.care.nightElapsed+=dt;if(s.care.nightElapsed<10)return false;s.care.nightRest=false;return true;}
