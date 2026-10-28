import {orderedChoices} from './event-deck.js';

export const CONSULT_PHONE=[{id:'onset',text:'從什麼時候開始聽不到？'},{id:'side',text:'左耳、右耳，還是雙耳？'}];
export const CONSULT_HISTORY=[{id:'days',text:'確切幾天了？什麼時候、怎麼發現的？'},{id:'previous',text:'以前有沒有類似狀況？'},{id:'chronic',text:'有沒有慢性病、用藥或其他病史？'}];
export const CONSULT_PLAN=[{id:'steroid',text:'全身類固醇治療'},{id:'followup',text:'安排這位病人一週後再做聽力檢查'},{id:'intratympanic',text:'評估耳內注射的適應與時機'}];
export const CONSULT_STEROID=[{id:'give',text:'直接給藥'},{id:'counsel',text:'說明可能有腸胃道出血等副作用'},{id:'med-history',text:'問清相關病史、是否使用抗凝血劑'}];
const PEOPLE=[{name:'王建文',age:58,ward:'8G 胸腔科',chronic:'我有糖尿病和高血壓，平常都有規則吃藥。這次因為肺炎住院，用藥紀錄在電子病歷可以看。',other:['王健文','李建文']},{name:'張雅惠',age:62,ward:'12F 腫瘤科',chronic:'我有乳癌，這次住腫瘤科接受治療；另外有高血壓，平常有吃藥。癌症治療與目前用藥的紀錄，電子病歷裡都有。',other:['張雅慧','陳雅惠']}];
export function createHearingConsult(seed,{practice=false,branch}={}){
  const result=practice&&['sshl','wax'].includes(branch)?branch:orderedChoices(['sshl','wax'],seed+'|consult-result')[0];
  const p=orderedChoices(PEOPLE,seed+'|consult-patient')[0],side=result==='wax'?'both':orderedChoices(['right','left'],seed+'|consult-side')[0];
  const normal=[10,15,15,20],loss=[60,65,65,60],bone=[55,60,60,55];
  const patient={name:p.name,age:p.age,ward:p.ward,side,onset:result==='sshl'?'昨天早上開始，確切經過請醫師再問病人。':'今天查房時提到雙耳悶悶、感覺聽不清楚。',sideText:{right:'右耳',left:'左耳',both:'雙耳'}[side],days:result==='sshl'?'昨天早上起床發現，到現在約兩天；之前沒有這個感覺。':'今天提到耳悶，時間和感受會再和病人確認。',previous:'以前沒有突然聽不清楚的情形。',chronic:p.chronic,right:side==='right'?[...loss]:[...normal],left:side==='left'?[...loss]:[...normal],boneRight:side==='right'?[...bone]:[...normal],boneLeft:side==='left'?[...bone]:[...normal],baseline:[...normal]};
  return{practice,branch:result,patient,names:orderedChoices([p.name,...p.other],seed+'|consult-names'),stage:'phone',asked:[],history:[],plan:[],steroidCounselled:false,medHistory:false,otoscopy:false,cleaned:[],rechecked:[],reported:false};
}
export function consultSource(t){return t.patient.ward+' · 病房護理師';}
export function consultSpot(t){return['phone','testing','results-ready','call-patient','report'].includes(t.stage)?'desk':t.stage==='done'?null:'patient';}
export function consultReady(t){return CONSULT_PHONE.every(q=>t.asked.includes(q.id));}
export function consultResultsCall(t,location){return t?.stage==='results-ready'&&location==='g2'?{id:'sudden-results',caseId:'sudden',kind:'case',title:'聽力檢查完成了，病人在外面等',source:'聽力室 · 聽力師',urgent:false,audiology:true}:null;}
export function consultAction(t,action,value){
  if(t.stage==='done')return'blocked';
  if(action==='question'&&t.stage==='phone'&&CONSULT_PHONE.some(q=>q.id===value)&&!t.asked.includes(value)){t.asked.push(value);return'asked';}
  if(action==='arrange'&&t.stage==='phone'&&consultReady(t)){t.stage='testing';return'testing';}
  if(action==='audiology-ready'&&t.stage==='testing'){t.stage='results-ready';return'ready';}
  if(action==='answer-results'&&t.stage==='results-ready'){t.stage='call-patient';return'notified';}
  if(action==='call-patient'&&t.stage==='call-patient'){if(value!==t.patient.name)return'wrong-name';t.stage='review';return'called';}
  if(action==='otoscopy'&&t.stage==='review'){t.otoscopy=true;return'examined';}
  if(action==='diagnosis'&&t.stage==='review'&&t.otoscopy){if(value!==t.branch)return'wrong-diagnosis';t.stage=t.branch==='sshl'?'history':'clean';return'diagnosed';}
  if(action==='history'&&t.stage==='history'&&CONSULT_HISTORY.some(q=>q.id===value)&&!t.history.includes(value)){t.history.push(value);return'asked';}
  if(action==='history-done'&&t.stage==='history'&&CONSULT_HISTORY.every(q=>t.history.includes(q.id))){t.stage='plan';return'planned';}
  if(action==='plan'&&t.stage==='plan'&&CONSULT_PLAN.some(q=>q.id===value)&&!t.plan.includes(value)){if(value==='steroid'){t.stage='steroid-review';return'steroid-review';}t.plan.push(value);return'planned';}
  if(action==='steroid'&&t.stage==='steroid-review'){
    if(value==='counsel'&&!t.steroidCounselled){t.steroidCounselled=true;return'counselled';}
    if(value==='med-history'&&!t.medHistory){t.medHistory=true;return'history-checked';}
    if(value==='give'){if(!t.steroidCounselled||!t.medHistory)return'premature';t.plan.push('steroid');t.stage='plan';return'planned';}
  }
  if(action==='explain'&&t.stage==='plan'&&CONSULT_PLAN.every(q=>t.plan.includes(q.id))){t.stage='report';return'explained';}
  if(action==='clean'&&t.stage==='clean'&&['right-0','right-1','left-0','left-1'].includes(value)&&!t.cleaned.includes(value)){t.cleaned.push(value);if(t.cleaned.length===4)t.stage='recheck';return'cleaned';}
  if(action==='recheck'&&t.stage==='recheck'&&['ears','feeling'].includes(value)&&!t.rechecked.includes(value)){t.rechecked.push(value);return'rechecked';}
  if(action==='explain'&&t.stage==='recheck'&&t.rechecked.length===2){t.stage='report';return'explained';}
  if(action==='report'&&t.stage==='report'){t.reported=true;t.stage='done';return'done';}
  return'blocked';
}
export function consultStageText(t){return({phone:'問清發作時間與左／右／雙耳',testing:'已安排聽檢，回工作桌等聽力室通知','results-ready':'聽力室來電：檢查完成，病人在外面等','call-patient':'在電腦看線上聽力圖，按姓名叫病人進來',review:'到診療椅比對聽力圖與耳鏡檢查',history:'補問幾天、過去發作與慢性病史',plan:'和病人說明治療評估與一週後聽檢','steroid-review':'確認相關病史、用藥與副作用說明',clean:'清理兩側耳垢，讓耳鏡視野清楚',recheck:'清理後再檢查，確認病人耳悶的感受',report:'回工作桌，回覆原病房並完成紀錄',done:'聽力會診已完成'})[t.stage];}
