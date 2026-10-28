import {OR_ATTENDINGS} from './staff.js';
import {seededRandom} from './event-deck.js';

export const NPX_STAGES=['verify','drape','packing','scope','instrument','sample','hemostasis','label','handoff','done'];
export const NPX_TITLES={verify:'先核對這一台',drape:'簡單鋪單',packing:'止血綿 packing',scope:'內視鏡找 NPX mass',instrument:'向刷手要 biopsy cup',sample:'取得一塊檢體',hemostasis:'棉棒止血',label:'核對檢體標示',handoff:'把檢體交給流動',done:'這一台完成了'};
export const NPX_PATIENTS=[{id:'P13-01',name:'林予安'},{id:'P13-02',name:'陳子晴'},{id:'P13-03',name:'許明哲'}];
export const NPX_POINTS=[{x:32,y:37,label:'左上方'},{x:67,y:43,label:'右側'},{x:48,y:70,label:'下方'}];
export const NPX_TOOLS=[{id:'packing',name:'止血綿'},{id:'cup',name:'Biopsy cup'},{id:'swab',name:'棉棒'}];
export function createNPX(seed,{practice=false}={}){
  const rng=seededRandom(seed+'|npx'),patient={...NPX_PATIENTS[Math.floor(rng()*NPX_PATIENTS.length)]},other=NPX_PATIENTS.find(p=>p.id!==patient.id);
  const labels=[{id:'correct',patient:patient.name,site:'鼻咽'},{id:'patient',patient:other.name,site:'鼻咽'},{id:'site',patient:patient.name,site:'口腔'}];
  for(let i=labels.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[labels[i],labels[j]]=[labels[j],labels[i]];}
  return{practice,patient,attending:OR_ATTENDINGS.npx,stage:'verify',drapes:[],mass:Math.floor(rng()*3),found:false,packed:false,cup:false,specimen:false,hemostasis:false,labeled:false,handedOver:false,assisted:[],supportRequested:false,seniorJoined:false,orderDraft:{patient:'',procedure:'',attending:''},orderPlaced:false,mistakes:0,labels,feedback:''};
}
export function requestNPXSupport(t){if(!['scope','sample','hemostasis'].includes(t.stage)||t.seniorJoined)return false;t.supportRequested=true;return true;}
export function joinNPXSenior(t,room){if(room!==16||!t.supportRequested||t.seniorJoined)return false;t.seniorJoined=true;return true;}
export function npxSpot(t){return t.stage==='instrument'?'or-team-scrub':t.stage==='handoff'?'or-team-circulator':'operation';}
export function npxTarget(t,room){if(t.supportRequested&&!t.seniorJoined)return{dest:'f5',spot:room===16?'or-team-senior':room?'or-exit':'or-16'};return{dest:'f5',spot:room===13?npxSpot(t):room?'or-exit':'or-13'};}
export function npxAction(t,action,value){
  if(t.stage==='done')return{ok:false,penalty:false,message:'這一台已完成。'};
  const fail=(message,penalty=true)=>{if(penalty)t.mistakes++;t.feedback=message;return{ok:false,penalty,message};};
  const advance=()=>{t.stage=NPX_STAGES[NPX_STAGES.indexOf(t.stage)+1];t.feedback='';return{ok:true,completed:t.stage==='done'};};
  if(action==='support'){
    if(!['scope','sample','hemostasis'].includes(t.stage))return fail('這一步先依畫面確認。',false);
    if(!t.seniorJoined)return fail('先到16房找學長，請他一起回13房。',false);
    t.assisted.push(t.stage);if(t.stage==='scope')t.found=true;if(t.stage==='sample')t.specimen=true;if(t.stage==='hemostasis')t.hemostasis=true;
    return{...advance(),supported:true};
  }
  if(t.stage==='verify'&&action==='verify')return value===t.patient.id?advance():fail('這不是流動交代的病人，再對一下姓名。');
  if(t.stage==='drape'&&action==='drape'){
    if(![0,1,2].includes(value)||t.drapes.includes(value))return fail('這一角已鋪好了，看看剩下的位置。',false);
    t.drapes.push(value);return t.drapes.length===3?advance():{ok:true};
  }
  if(t.stage==='packing'&&action==='pack'){if(value!=='packing')return fail('這一步是先用止血綿 packing，再接內視鏡。');t.packed=true;return advance();}
  if(t.stage==='scope'&&action==='inspect'){if(value!==t.mass)return fail('這裡的表面較平順。繼續觀察不規則的隆起。',false);t.found=true;return advance();}
  if(t.stage==='instrument'&&action==='instrument'){if(value!=='cup')return fail('刷手：「你要取檢體，這台要的是 biopsy cup 喔。」');t.cup=true;return advance();}
  if(t.stage==='sample'&&action==='sample'){if(!t.cup||!t.found||value!==t.mass)return fail('先對準剛剛確認的病灶，再取得一塊檢體。');t.specimen=true;return advance();}
  if(t.stage==='hemostasis'&&action==='hemostasis'){if(value!=='swab')return fail('檢體已取得，這一步依這台的安排使用棉棒止血。');t.hemostasis=true;return advance();}
  if(t.stage==='label'&&action==='label'){if(value!=='correct')return fail('病人姓名與檢體部位都要對上，再看一次瓶身標示。');t.labeled=true;return advance();}
  if(t.stage==='handoff'&&action==='handoff'){
    if(!t.specimen||!t.hemostasis||!t.labeled)return fail('先把檢體、止血與標示確認好。',false);
    t.handedOver=true;return advance();
  }
  return fail('先完成目前這一步，進度會替你留著。',false);
}
