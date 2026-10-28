import {seededRandom} from './event-deck.js';
import {ATTENDING_NAMES} from './staff.js';

export const CLINIC_DIRECTORY=[
  {id:'imaging',department:'影像科',doctor:'蔡醫師',extension:'53361'},
  {id:'plastic',department:'整形外科',doctor:'魏醫師',extension:'60101'},
  {id:'dental',department:'牙科',doctor:'黃醫師',extension:'39197'},
  {id:'maintenance',department:'公務課',doctor:'維修聯絡',extension:'3000'},
  {id:'audiology',department:'聽力室',doctor:'檢查聯絡',extension:'2181'},
  {id:'ward7',department:'7F',doctor:'護理站',extension:'3363'},
  {id:'sicu',department:'SICU',doctor:'護理站',extension:'3462'},
  {id:'or-control',department:'刀房控台',doctor:'排程聯絡',extension:'53629'}
];
export const CONTACT_REQUESTS={
  imaging:{title:'幫忙看一下片子',purpose:'協助看這位病人的影像',answer:'好，我先看這位病人的片子。'},
  plastic:{title:'能不能排一台 combine',purpose:'評估能否安排這位病人的 combine 手術',answer:'好，我先看資料，再確認可以配合的手術時段。'},
  dental:{title:'幫忙評估一下病人',purpose:'協助評估這位病人的牙科問題',answer:'好，我先看這位病人的資料，再安排評估。'}
};
const PATIENTS=[{name:'林以安',id:'ENT-301'},{name:'許承恩',id:'ENT-302'},{name:'陳語晴',id:'ENT-303'}];
export function createContact(seed,{practice=false,kind}={}){
  const rng=seededRandom(seed+'|contact'),keys=Object.keys(CONTACT_REQUESTS);
  kind=keys.includes(kind)?kind:keys[Math.floor(rng()*keys.length)];
  const target=CLINIC_DIRECTORY.find(d=>d.id===kind),request=CONTACT_REQUESTS[kind],patient={...PATIENTS[Math.floor(rng()*PATIENTS.length)]};
  return{practice,kind,target:{...target},patient,caller:kind==='imaging'?'蔡主治':ATTENDING_NAMES[Math.floor(rng()*ATTENDING_NAMES.length)],request:{...request},stage:'phone',readDirectory:false,digits:'',feedback:'',mistakes:0};
}
export function contactLine(t){return`${t.caller}：「可以幫我打給${t.target.department}${t.target.doctor}，請他${t.request.purpose}嗎？病人是${t.patient.name}，病歷號${t.patient.id}。」`;}
export function contactAction(t,action,value){
  if(t.stage==='done')return{ok:false};
  const okay=()=>{t.feedback='';return{ok:true};},fail=message=>{t.feedback=message;t.mistakes++;return{ok:false,penalty:true,message};};
  if(action==='accept'&&t.stage==='phone'){t.stage='dial';return okay();}
  if(action==='directory'&&t.stage==='dial'){t.readDirectory=true;return okay();}
  if(t.stage==='dial'){
    if(action==='digit'&&/^[0-9]$/.test(String(value))){if(t.digits.length<5)t.digits+=value;return okay();}
    if(action==='erase'){t.digits=t.digits.slice(0,-1);return okay();}
    if(action==='clear'){t.digits='';return okay();}
    if(action==='call'){
      if(!t.readDirectory)return{ok:false,message:t.feedback='先翻桌上的電話單，核對科別、醫師與簡碼。'};
      if(t.digits!==t.target.extension){const person=CLINIC_DIRECTORY.find(d=>d.extension===t.digits);return fail(person?`接通的是${person.department}${person.doctor}，再核對主治交代的聯絡對象。`:'這個號碼沒有接通，再看一次電話單。');}
      t.stage='connected';return okay();
    }
  }
  if(action==='relay'&&t.stage==='connected'){
    if(value!=='correct')return fail(value==='wrong-patient'?'病人的姓名與病歷號說錯了，再看一下主治便條。':'這通電話要轉達的事項和主治交代不同，再核對一次。');
    t.stage='done';t.feedback='';return{ok:true,completed:true};
  }
  return{ok:false,message:'先完成目前這一步。'};
}
