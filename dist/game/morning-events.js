import {wardRooms,wardBedPositions,wardRect} from './ward-plan.js';

export const MORNING_IDS=['rounds','nasal-cleaning'];
export const MORNING_CASES={
  rounds:{title:'07:30 跟主治查房',category:'routine',dest:'f7',brief:'五種病房情境隨機抽三床；先印 patient list，再逐床查房。'},
  'nasal-cleaning':{title:'鼻術後病人清鼻子',category:'routine',dest:'f7',brief:'整份名單查房完成後，到床邊接病人，帶到 7F 檢查室清鼻子。'}
};
export const ROUND_PATIENTS=[
  {kind:'smp',room:'7F01',bed:2,name:'林先生',note:'SMP 術後：整份名單查完，再帶至 7F 檢查室清鼻子。',nasal:true},
  {kind:'survey',room:'7F07',bed:1,name:'陳小姐',note:'Tumor survey：今天安排 HNCT、腹部超音波、胃鏡。'},
  {kind:'discharge',room:'7F19',bed:1,name:'黃先生',note:'今日出院：確認回診時間、出院帶藥與出院病摘。',followup:'下週三上午09:00 · 蔡主治門診',medications:'核對出院藥單、用法與天數，交代病人帶回。'},
  {kind:'combine',room:'7F09',bed:2,name:'李先生',note:'頭頸癌 combine 術後：主要顧傷口，線還沒拆、VB 還沒拔，再住幾天觀察。'},
  {kind:'epiglottitis',room:'7F17',bed:1,name:'周小姐',note:'Acute epiglottitis：住院持續抗生素治療，明天抽血、再照一次 fiber。'}
];
export const bedId=(room,bed)=>'bed-'+room+'-'+bed;
export function bedLabel(p){return p.room+(wardRooms.find(r=>r.id===p.room)?.bedCount===1?'':'ABC'[p.bed-1]);}
export function bedApproach(room,bed){const r=wardRooms.find(r=>r.id===room);if(!r||bed<1||bed>r.bedCount)return null;const b=wardBedPositions(r)[bed-1];return{x:b.x,z:wardRect(r).z+1.28};}
export function createMorning(seed,{nasal}={}){
 let n=2166136261;for(const c of String(seed))n=Math.imul(n^c.codePointAt(0),16777619);
 const random=()=>{n+=0x6D2B79F5;let t=n;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};
 const group=ROUND_PATIENTS.filter(p=>nasal===undefined||!p.nasal);for(let i=group.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[group[i],group[j]]=[group[j],group[i]];}
 const selected=nasal===true?[ROUND_PATIENTS.find(p=>p.nasal),...group.slice(0,2)]:group.slice(0,3),list=selected.map(p=>({...p,id:bedId(p.room,p.bed)}));
 return{active:false,printed:false,focus:'rounds',list,visited:[],escort:list.some(p=>p.nasal)?'waiting':'none',cleaned:[],firstCallDone:false};
}
export const nasalRequired=m=>!!m?.list.some(p=>p.nasal);
export const nasalComplete=m=>!nasalRequired(m)||m.escort==='done';
export const morningEventIds=seed=>nasalRequired(createMorning(seed))?MORNING_IDS.slice():['rounds'];
export function printPatientList(m){if(m.printed)return false;m.printed=true;m.active=true;return true;}
export function roundsComplete(m){return!!m?.printed&&m.list.length>0&&m.list.every(p=>m.visited.includes(p.id));}
export function morningTarget(m){if(!m?.active||!m.printed||m.focus==='call')return null;if(m.focus==='rounds'||!roundsComplete(m)){const p=m.list.find(p=>!m.visited.includes(p.id));return p?{dest:'f7',spot:p.id}:null;}const p=m.list.find(p=>p.nasal);return nasalComplete(m)?null:{dest:'f7',spot:m.escort==='waiting'?p.id:'exam'};}
export function visitPatient(m,id){if(!m.active||!m.printed||!m.list.some(p=>p.id===id)||m.visited.includes(id))return false;m.visited.push(id);return true;}
export function collectPatient(m,id){const p=m.list.find(p=>p.nasal);if(!p||m.escort!=='waiting'||p.id!==id||!roundsComplete(m))return false;m.escort='following';return true;}
export function cleanPatch(m,id){if(!nasalRequired(m)||m.escort!=='exam'||m.cleaned.includes(id)||![0,1,2].includes(id))return false;m.cleaned.push(id);return true;}
export function morningReady(m){return roundsComplete(m)&&nasalComplete(m)&&m.firstCallDone;}

export function wardWorkFocused(m){return!!m?.active&&m.focus!=='call';}
export function clinicCallDue(m,phaseKind,clock){return!!m?.printed&&phaseKind==='morning-work'&&clock>=510;}

export function clinicPhonePlan(action,m){if(action==='hangup')return'recall';return action==='finish-rounds'&&m?.printed&&!roundsComplete(m)?'rounds':'clinic';}
