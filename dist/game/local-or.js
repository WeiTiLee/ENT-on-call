import {OR_ATTENDINGS} from './staff.js';
import {seededRandom} from './event-deck.js';

export const LOCAL_PROCEDURES={
  ear:{name:'耳內注射',patient:{id:'E13-01',name:'王以辰'},attending:OR_ATTENDINGS.ear,order:'耳內注射處置',stages:['verify','local','drape','scope','instrument','inject','rest','check','done'],titles:{verify:'先核對這一台',local:'噴 local',drape:'簡單鋪單',scope:'耳內視鏡確認前下方',instrument:'向刷手拿注射器',inject:'完成本台耳內注射',rest:'交代病人，躺著休息10分鐘',check:'休息後再確認狀況',done:'這一台完成了'}},
  oral:{name:'Oral biopsy',patient:{id:'O13-01',name:'張宜庭'},attending:OR_ATTENDINGS.oral,order:'口腔檢體病理檢查',stages:['verify','headlamp','drape','inspect','local','instrument','sample','cautery','label','handoff','done'],titles:{verify:'先核對這一台',headlamp:'戴好頭燈',drape:'簡單鋪單',inspect:'看清口腔病灶',local:'完成病灶局部麻醉',instrument:'向刷手拿切片器械',sample:'取下口腔檢體',cautery:'電燒止血',label:'核對口腔檢體標示',handoff:'把檢體交給流動',done:'這一台完成了'}}
};
export const LOCAL_TOOLS=[{id:'spray',name:'局部麻醉噴劑'},{id:'syringe',name:'局部麻醉用注射器'},{id:'injection',name:'耳內注射用注射器'},{id:'biopsy',name:'口腔切片器械組'},{id:'cautery',name:'電燒筆'},{id:'swab',name:'棉棒'}];
export function createLocalOR(kind,seed,{practice=false}={}){
  const c=LOCAL_PROCEDURES[kind];if(!c)return null;
  const rng=seededRandom(seed+'|local|'+kind),patient={...c.patient};
  return{kind,practice,patient,attending:c.attending,stage:'verify',drapes:[],lesion:Math.floor(rng()*3),headlamp:false,localized:false,found:false,instrument:false,specimen:false,hemostasis:false,labeled:false,handedOver:false,injected:false,restExplained:false,restStarted:false,restElapsed:0,checked:[],assisted:[],supportRequested:false,seniorJoined:false,orderDraft:{patient:'',procedure:'',attending:''},orderPlaced:false,mistakes:0,feedback:''};
}
export const localTitle=t=>LOCAL_PROCEDURES[t.kind].titles[t.stage];
export function localSpot(t){return t.stage==='instrument'?'or-team-scrub':t.stage==='handoff'?'or-team-circulator':'operation';}
export function localTarget(t,room,hasList){if(!hasList)return{dest:'f5',spot:room===13?'or-team-circulator':room?'or-exit':'or-13'};if(t.supportRequested&&!t.seniorJoined)return{dest:'f5',spot:room===16?'or-team-senior':room?'or-exit':'or-16'};return{dest:'f5',spot:room===13?localSpot(t):room?'or-exit':'or-13'};}
const supportable=t=>(t.kind==='ear'?['scope','inject']:['inspect','sample','cautery']).includes(t.stage);
export function requestLocalSupport(t){if(!supportable(t)||t.seniorJoined)return false;t.supportRequested=true;return true;}
export function joinLocalSenior(t,room){if(room!==16||!t.supportRequested||t.seniorJoined)return false;t.seniorJoined=true;return true;}
export function tickLocalRest(t,seconds){if(!t||t.kind!=='ear'||t.stage!=='rest'||!t.restStarted||!Number.isFinite(seconds)||seconds<=0)return false;const before=t.restElapsed;t.restElapsed=Math.min(10,t.restElapsed+seconds);return t.restElapsed!==before;}
export function localAction(t,action,value){
  if(t.stage==='done')return{ok:false,penalty:false,message:'這一台已完成。'};
  const fail=(message,penalty=true)=>{if(penalty)t.mistakes++;t.feedback=message;return{ok:false,penalty,message};};
  const okay=()=>{t.feedback='';return{ok:true};};
  const advance=()=>{const stages=LOCAL_PROCEDURES[t.kind].stages;t.stage=stages[stages.indexOf(t.stage)+1];t.feedback='';return{ok:true,completed:t.stage==='done'};};
  if(t.supportRequested&&!t.seniorJoined)return fail('這一步先停著，去16房請學長一起回來。',false);
  if(action==='support'){
    if(!supportable(t)||!t.seniorJoined)return fail('先到16房找學長，這一步的進度會保留。',false);
    t.assisted.push(t.stage);if(['scope','inspect'].includes(t.stage))t.found=true;if(t.stage==='inject')t.injected=true;if(t.stage==='sample')t.specimen=true;if(t.stage==='cautery')t.hemostasis=true;
    return{...advance(),supported:true};
  }
  if(t.stage==='verify'&&action==='verify')return value===t.patient.id?advance():fail('病人姓名與這台資料不同，再核對一次。');
  if(t.stage==='headlamp'&&action==='headlamp'){t.headlamp=true;return advance();}
  if(t.stage==='drape'&&action==='drape'){
    if(![0,1,2].includes(value)||t.drapes.includes(value))return fail('這一角已鋪好，繼續剩下的位置。',false);
    t.drapes.push(value);return t.drapes.length===3?advance():okay();
  }
  if(t.stage==='local'&&action==='local'){if(value!==(t.kind==='ear'?'spray':'syringe'))return fail(t.kind==='ear'?'這一步先噴 local，再鋪單。':'看清病灶後，依本台安排使用局部麻醉用注射器。');t.localized=true;return advance();}
  if(t.stage==='scope'&&action==='inspect'){if(value!=='anterior-inferior')return fail('依視野的方向標示，找鼓膜前下方。',false);t.found=true;return advance();}
  if(t.stage==='inspect'&&action==='inspect'){if(value!==t.lesion)return fail('這裡較平順，看看不規則的病灶位置。',false);t.found=true;return advance();}
  if(t.stage==='instrument'&&action==='instrument'){if(value!==(t.kind==='ear'?'injection':'biopsy'))return fail('刷手：「再確認這台需要的器械。」');t.instrument=true;return advance();}
  if(t.stage==='inject'&&action==='inject'){if(!t.instrument||!t.found||!t.localized||value!=='anterior-inferior')return fail('先核對本台準備、器械與剛才確認的位置。');t.injected=true;return advance();}
  if(t.stage==='rest'){
    if(action==='explain-rest'){t.restExplained=true;return okay();}
    if(action==='start-rest'){if(!t.restExplained||!t.injected)return fail('先交代這台休息時不要說話或吞口水，再開始休息計時。',false);t.restStarted=true;return okay();}
    if(action==='finish-rest'){if(t.restElapsed<10)return fail('休息還沒滿10分鐘，先讓病人繼續躺著。',false);return{...advance(),minutes:10};}
  }
  if(t.stage==='check'&&action==='check'&&['feeling','instructions'].includes(value)&&!t.checked.includes(value)){t.checked.push(value);return okay();}
  if(t.stage==='check'&&action==='finish'){if(t.checked.length<2)return fail('先確認休息後狀況，並交代後續安排。',false);return advance();}
  if(t.stage==='sample'&&action==='sample'){if(!t.instrument||!t.headlamp||!t.localized||!t.found||value!==t.lesion)return fail('先對準剛才確認的口腔病灶，再取檢體。');t.specimen=true;return advance();}
  if(t.stage==='cautery'&&action==='cautery'){if(!t.specimen||value!=='cautery')return fail('取樣後，依這台安排選電燒筆止血。');t.hemostasis=true;return advance();}
  if(t.stage==='label'&&action==='label'){if(value!=='correct')return fail('病人姓名與「口腔」檢體部位都要對上。');t.labeled=true;return advance();}
  if(t.stage==='handoff'&&action==='handoff'){if(!t.specimen||!t.hemostasis||!t.labeled)return fail('先完成止血與標示，再把檢體交給流動。',false);t.handedOver=true;return advance();}
  return fail('先完成目前這一步，進度會替你留著。',false);
}
