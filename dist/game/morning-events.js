import {wardRooms,wardBedPositions,wardRect} from './ward-plan.js';

export const MORNING_IDS=['rounds','nasal-cleaning'];
export const MORNING_CASES={
  rounds:{title:'07:30 跟主治查房',category:'routine',dest:'f7',brief:'先到護理站列印 patient list，再自行依名單逐床完成查房。'},
  'nasal-cleaning':{title:'鼻術後病人清鼻子',category:'routine',dest:'f7',brief:'整份名單查房完成後，到床邊接病人，帶到 7F 檢查室清鼻子。'}
};
const patients=[
  {room:'7F01',bed:2,name:'林先生',note:'SMP 術後：整份名單查完，再帶至 7F 檢查室清鼻子。',nasal:true},
  {room:'7F07',bed:1,name:'陳小姐',note:'Tumor survey：今天安排 HNCT、腹部超音波、胃鏡。'},
  {room:'7F19',bed:1,name:'黃先生',note:'今日出院：確認出院病摘、處方與回診安排。'},
  {room:'7F03',bed:3,name:'王小姐',note:'SMP 術後：整份名單查完，再帶至 7F 檢查室清鼻子。',nasal:true},
  {room:'7F09',bed:2,name:'李先生',note:'10:00 叫到 2G 初診間，給主治醫師看。'},
  {room:'7F17',bed:1,name:'周小姐',note:'繼續抗生素治療，追蹤症狀與今日恢復情形。'}
];
export const bedId=(room,bed)=>'bed-'+room+'-'+bed;
export function bedLabel(p){return p.room+(wardRooms.find(r=>r.id===p.room)?.bedCount===1?'':'ABC'[p.bed-1]);}
export function bedApproach(room,bed){const r=wardRooms.find(r=>r.id===room);if(!r||bed<1||bed>r.bedCount)return null;const b=wardBedPositions(r)[bed-1];return{x:b.x,z:wardRect(r).z+1.28};}
export function createMorning(seed){let n=0;for(const c of seed)n=(n*31+c.charCodeAt(0))>>>0;const group=n%2?patients.slice(3):patients.slice(0,3),list=group.map(p=>({...p,id:bedId(p.room,p.bed)}));return{active:false,printed:false,focus:'rounds',list,visited:[],escort:'waiting',cleaned:[],firstCallDone:false};}
export function printPatientList(m){if(m.printed)return false;m.printed=true;m.active=true;return true;}
export function roundsComplete(m){return!!m?.printed&&m.list.length>0&&m.list.every(p=>m.visited.includes(p.id));}
export function morningTarget(m){if(!m?.active||!m.printed||m.focus==='call')return null;if(m.focus==='rounds'||m.escort==='waiting'&&!roundsComplete(m)){const p=m.list.find(p=>!m.visited.includes(p.id));return p?{dest:'f7',spot:p.id}:null;}const p=m.list.find(p=>p.nasal);return m.escort==='done'?null:{dest:'f7',spot:m.escort==='waiting'?p.id:'exam'};}
export function visitPatient(m,id){if(!m.active||!m.printed||!m.list.some(p=>p.id===id)||m.visited.includes(id))return false;m.visited.push(id);return true;}
export function collectPatient(m,id){const p=m.list.find(p=>p.nasal);if(m.escort!=='waiting'||p.id!==id||!roundsComplete(m))return false;m.escort='following';return true;}
export function cleanPatch(m,id){if(m.escort!=='exam'||m.cleaned.includes(id)||![0,1,2].includes(id))return false;m.cleaned.push(id);return true;}
export function morningReady(m){return roundsComplete(m)&&m.escort==='done'&&m.firstCallDone;}

export function wardWorkFocused(m){return!!m?.active&&m.focus!=='call';}
export function clinicCallDue(m,phaseKind,clock){return!!m?.printed&&phaseKind==='morning-work'&&clock>=510;}

export function clinicPhonePlan(action,m){if(action==='hangup')return'recall';return action==='finish-rounds'&&m?.printed&&!roundsComplete(m)?'rounds':'clinic';}
