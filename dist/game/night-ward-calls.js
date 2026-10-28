import {createConsentState} from './ward-consent.js';
export const NIGHT_WARD_IDS=['wardConsent','wardOrder','wardExtend'];
export const WARD_ORDER_REQUESTS=[
  {id:'rinse-allowed',item:'漱口 order',surgery:'SMP',note:'術後紀錄：原手術團隊已交代可依計畫漱口。',call:'可以幫我補一個漱口的 order 嗎？',action:'核對術式與術後交代，開立漱口 order',reply:'漱口 order 已送出。',canRinse:true},
  {id:'rinse-check',item:'漱口 order',surgery:'oral tumor wide excision',note:'術後紀錄：目前先不要漱口，有需求請向手術團隊確認。',call:'可以幫我補一個漱口的 order 嗎？',action:'依術後交代暫不開漱口，先向手術團隊確認',reply:'你回覆病房先依原術後交代，並聯絡手術團隊確認。',canRinse:false},
  {id:'print-discharge',item:'補印出院單',surgery:'FESS',note:'白班已完成出院計畫，病房需要補印出院單。',call:'出院單找不到了，可以幫我補印一下嗎？',action:'補印出院單',reply:'出院單已送出列印。'},
  {id:'print-ct',item:'補印 CT 單',surgery:'tumor wide excision',note:'CT 申請已完成，病房需要補印 CT 單。',call:'可以幫我補印一張 CT 單嗎？',action:'補印 CT 單',reply:'CT 單已送出列印。'},
  {id:'dc-iv',item:'DC 點滴 order',surgery:'SMP',note:'病人目前進食良好，病房回報吃得不錯，請核對後處理點滴醫囑。',call:'病人現在吃得不錯，可以幫我 DC 點滴的 order 嗎？',action:'確認現況後，DC 點滴 order',reply:'DC 點滴 order 已送出。'},
  {id:'dc-oximeter',item:'DC fix oximeter order',surgery:'OSA 手術 · 術後第3天',note:'OSA 術後第3天，病房請你處理 fix oximeter 醫囑。',call:'病人 OSA 術後三天了，可以幫我 DC fix oximeter 的 order 嗎？',action:'核對術後天數，DC fix oximeter order',reply:'DC fix oximeter order 已送出。'}
];
export const isWardComputer=(location,room,spot)=>location==='f7'&&spot==='computer'||location==='g2'&&spot==='desk'||location==='f5'&&[13,16].includes(room)&&spot==='or-computer';
export function wardComputerTarget(location,room){if(location==='f7'||location==='g7')return{dest:'f7',spot:'computer'};if(location==='f5')return{dest:'f5',spot:[13,16].includes(room)?'or-computer':'or-13'};return{dest:'g2',spot:'desk'};}
const meta={
  wardConsent:{title:'明天開刀，同意書還沒簽',spot:'nurse',brief:'護理站核對、找平板、輸入病歷號、醫師簽名，再交護理師拿給病人簽。'},
  wardOrder:{title:'醫師，幫我補個 order',spot:'computer',brief:'漱口、補印出院／CT單、DC點滴或fix oximeter；回任意電腦處理。'},
  wardExtend:{title:'幫我 extend 一下藥物',spot:'computer',brief:'病房一通電話，把你從休息處叫回任意電腦，一鍵extend。'}
};
export const NIGHT_WARD_EVENTS=Object.fromEntries(NIGHT_WARD_IDS.map(id=>[id,{...meta[id],category:'routine',nightOnly:true,shortCall:true,dest:'f7',source:'7F 病房 · 可晴護理師',tag:'病房小 call',urgent:false,patient:'7F 病房 · 虛構病人',call:'醫師，病房有一件事情想請你幫忙。',phone:[{text:'先問清病人與事項，再回病房處理',dest:'f7',reply:'資料放好了，麻煩你。'}],intro:'先核對資料，再接續這件事。',steps:[{ask:'先確認什麼？',options:[{text:'核對病人、需求與原本計畫',good:true,reply:'資料對好了。'}]}]}]));
const choose=(seed,items)=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.codePointAt(0),16777619);return items[(h>>>0)%items.length];};
const question=(ask,correct,reply,wrong,why)=>({ask,options:[{text:correct,good:true,reply},{text:wrong,reply:why}]});
// Each request is a short, fictional ward workflow; no medication dose is prescribed.
export function createNightWardCall(id,seed){
  if(!NIGHT_WARD_IDS.includes(id))throw new Error('找不到這個病房小 call');
  const patient=choose(seed+'|'+id,[{name:'陳沐安',bed:'7F09A'},{name:'林予澄',bed:'7F11B'},{name:'王以寧',bed:'7F17'}]);
  const who=patient.bed+' · '+patient.name,task={...NIGHT_WARD_EVENTS[id],id,patient,step:0,done:false};
  if(id==='wardConsent'){
    patient.mrn=choose(seed+'|mrn',['26001021','26004276','26008913']);task.consent=createConsentState();
    task.item=choose(seed+'|consent',['SMP','FESS','tonsillectomy']);task.memo='明日手術：'+task.item+'。醫師簽名欄待簽，簽完交給護理師，由護理師拿給病人簽名。';
    task.call='醫師，'+who+'明天開'+task.item+'，同意書還缺醫師簽名。回護理站核對資料後找平板，輸入病歷號'+patient.mrn+'，你簽完再交給我，我拿給病人簽。';
    task.steps=[question('先核對這一位的資料。','核對'+patient.name+'、'+patient.bed+'、病歷號'+patient.mrn+'與'+task.item,'護理站資料核對完成，接著找平板。','只看床號，不看姓名、病歷號與術式','先把病人、病歷號與手術資料對齊。')];
  }else if(id==='wardOrder'){
    const request=choose(seed+'|order-request',WARD_ORDER_REQUESTS);task.request={...request};task.item=request.item;task.memo=request.note;task.surgery=request.surgery;
    task.call='醫師，'+who+'，'+request.call;
    const good={text:request.action,good:true,reply:'可晴：「收到了，謝謝。」\n'+request.reply};
    task.steps=[{ask:'處理這通病房請託。',options:request.canRinse===undefined?[good]:[good,{text:request.canRinse?'不看術後紀錄，一律不開漱口':'不看術後交代，直接開漱口 order',reply:'先看病人做了什麼手術，以及這位病人的術後交代，再決定能不能漱口。'}]}];
  }else{
    task.item='extend 藥物';task.memo='病房請託：原藥物快到期，幫忙 extend。';task.call='醫師，'+who+'的藥物快到期，可以幫我 extend 一下嗎？';
    task.steps=[{ask:'電腦就在這裡，幫這一位 extend。',options:[{text:'extend 藥物',good:true,reply:'可晴：「有延到了，謝謝。」\n你心想：藥可以 extend，下班可不可以不要。'}]}];
  }
  task.phone=[{text:'問清病人與資料，先處理手邊事情，再回7F',dest:'f7',reply:who+(id==='wardConsent'?'，病歷號'+patient.mrn+'，請回護理站，平板簽完交給我。':'，資料保留在病歷裡，麻煩你。')},{text:'收到，我回7F核對後處理',dest:'f7',reply:who+(id==='wardConsent'?'，我在護理站等你，平板簽完給我。':'，我們在病房等你。')},{text:id==='wardConsent'?'不用核對，簽完醫師欄就收工':id==='wardOrder'?'不用看病歷，隨便補一張就好':'全部藥物直接延，不用看病歷',why:'先核對病人、現況與交代內容，再處理這件事。'}];
  if(id!=='wardConsent')task.phone=[{text:'好，我找電腦處理。',dest:'f7',reply:'可晴：「好，'+patient.name+'（'+patient.bed+'），'+task.item+'，謝謝。」'}];
  return task;
}
export function wardCallAction(task,option){
  if(!task||task.id==='wardConsent'||task.done||!task.steps[task.step]?.options.includes(option))return{ok:false};
  if(!option.good)return{ok:false,penalty:true,message:option.reply};
  task.step++;task.done=task.step===task.steps.length;return{ok:true,completed:task.done,message:option.reply};
}
// The sleep phase must progress for players waiting in a chair or corridor, too.
export function tickNightWaiting(s,dt,{hasCall=false}={}){
  const p=s.run?.phases[s.phase],next=s.run?.phases[s.phase+1];
  if(!s.started||s.ending||s.explore||s.run?.studio&&!s.run.nightPreview||s.mode!=='walk'||p?.kind!=='sleep'||next?.kind!=='case'||hasCall||s.accepted||!Number.isFinite(dt)||dt<=0)return false;
  s.nightWaitElapsed=(s.nightWaitElapsed||0)+dt;
  return s.nightWaitElapsed>=30||s.clock>=next.clock;
}
