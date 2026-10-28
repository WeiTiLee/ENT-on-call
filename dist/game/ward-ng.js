import {orderedChoices} from './event-deck.js';

export const NG_WARDS=[
  {ward:'8G 胸腔科',name:'陳志明',age:71,attempt:'我們的住院醫師試過了，這次還是放不進去。',history:'病歷及家屬都確認，沒有頭頸癌病史。',headNeck:false},
  {ward:'12F 腫瘤科',name:'林惠珍',age:63,attempt:'NP 和住院醫師都試過，這次沒有成功。',history:'有頭頸癌治療病史，治療紀錄在電子病歷裡可以看。',headNeck:true},
  {ward:'8F 感染科',name:'吳宗宇',age:66,attempt:'我們感染科的住院醫師和 NP 都試過，這次還是放不進去。',history:'病歷與家屬都確認沒有頭頸癌病史，感染科的病歷及處理紀錄在線上系統都看得到。',headNeck:false}
];
export const NG_QUESTIONS=[{id:'attempt',text:'你們住院醫師或 NP 試過了嗎？'},{id:'history',text:'病人有沒有頭頸癌病史？'}];
export function createWardNG(seed,{practice=false}={}){
  const patient={...orderedChoices(NG_WARDS,seed+'|ward-ng')[0]};
  return{practice,patient,asked:[],stage:'phone',deferrals:0,assessed:false,confirmed:false,reported:false};
}
export function ngSource(task){return task.patient.ward+' · 病房護理師';}
export function ngReady(task){return NG_QUESTIONS.every(q=>task.asked.includes(q.id));}
export function ngSpot(task){return['phone','report'].includes(task.stage)?'desk':task.stage==='done'?null:'patient';}
export function ngAction(task,action){
  if(task.stage==='done')return'blocked';
  if(task.stage==='phone'){
    if(NG_QUESTIONS.some(q=>q.id===action)&&!task.asked.includes(action)){task.asked.push(action);return'asked';}
    if(action==='defer'){task.deferrals++;return'recall';}
    if(action==='arrange'&&ngReady(task)){task.stage='patient';return'arranged';}
  }
  if(action==='assess'&&task.stage==='patient'){task.assessed=true;task.stage='confirm';return'assessed';}
  if(action==='confirm'&&task.stage==='confirm'&&task.assessed){task.confirmed=true;task.stage='report';return'confirmed';}
  if(action==='report'&&task.stage==='report'&&task.confirmed){task.reported=true;task.stage='done';return'done';}
  return'blocked';
}
export function ngStageText(task){return({phone:'坐在工作桌接聽病房會診',patient:'到診療椅核對病人與會診資料',confirm:'核對處理結果與位置確認紀錄',report:'回工作桌，回覆原病房並完成紀錄',done:'病房會診已回覆'})[task.stage];}
