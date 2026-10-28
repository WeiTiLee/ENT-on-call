import {orderedChoices} from './event-deck.js';
export const TUBE_CASES=['outpatientNG','outpatientTrach'];
export const TUBE_KINDS={outpatientNG:{label:'鼻胃管',short:'NG',codes:['NG 14','NG 16'],checks:['listen','position','water']},outpatientTrach:{label:'氣切管',short:'TRACH',codes:['Teflon 11','Shiley 6','Shiley 8','Bivona 8'],checks:['airflow','breathing']}};
const PEOPLE=[{name:'林明德',age:67,other:['林明得','陳明德']},{name:'陳美玲',age:59,other:['陳美鈴','林美玲']},{name:'黃建宏',age:72,other:['黃健宏','李建宏']},{name:'張秀英',age:64,other:['張秀瑛','林秀英']}];
export function createTubeTask(seed,caseId,{practice=false}={}){
  if(!TUBE_CASES.includes(caseId))throw new Error('Unknown outpatient tube task');
  const kind=TUBE_KINDS[caseId],patient=orderedChoices(PEOPLE,seed+'|'+caseId+'|patient')[0],code=orderedChoices(kind.codes,seed+'|'+caseId+'|model')[0];
  const names=orderedChoices([patient.name,...patient.other],seed+'|names');
  const otherId=caseId==='outpatientNG'?'outpatientTrach':'outpatientNG',otherKind=TUBE_KINDS[otherId],otherCode=orderedChoices(otherKind.codes,seed+'|other-model')[0];
  const packages=orderedChoices([...kind.codes.map(id=>({id,type:caseId,label:kind.label})),{id:otherCode,type:otherId,label:otherKind.label}],seed+'|packages');
  return{caseId,practice,patient:{name:patient.name,age:patient.age},code,names,packages,stage:'desk',spoken:false,identity:false,selected:null,exchanged:false,checks:[],recorded:false};
}
export function tubeSpot(task){return!task||task.stage==='desk'?'desk':task.stage==='desk-return'?'desk':task.stage==='done'?null:'patient';}
export function tubeAction(task,action,value){
  if(task.stage==='done')return'blocked';
  if(action==='call'&&task.stage==='desk'){if(value!==task.patient.name)return'wrong-name';task.stage='identity';return'called';}
  if(action==='ask-name'&&task.stage==='identity'){task.spoken=true;return'spoken';}
  if(action==='identity'&&task.stage==='identity'&&task.spoken){if(value!==task.patient.name)return'wrong-name';task.identity=true;task.stage='equipment';return'identified';}
  if(action==='model'&&task.stage==='equipment'){if(value!==task.code)return'wrong-model';task.selected=value;task.stage='exchange';return'equipped';}
  if(action==='exchange'&&task.stage==='exchange'&&task.identity&&task.selected===task.code){task.exchanged=true;task.stage='checks';return'exchanged';}
  if(action==='check'&&task.stage==='checks'){
    const list=TUBE_KINDS[task.caseId].checks;if(value!==list[task.checks.length])return'blocked';task.checks.push(value);if(task.checks.length===list.length)task.stage='record';return'checked';
  }
  if(action==='record'&&task.stage==='record'&&task.exchanged&&TUBE_KINDS[task.caseId].checks.every(c=>task.checks.includes(c))){task.stage='desk-return';return'recorded';}
  if(action==='return-slip'&&task.stage==='desk-return'){task.recorded=true;task.stage='done';return'done';}
  return'blocked';
}
export function tubeStageText(task){if(!task)return'到工作桌拿掛號單';return({desk:'看掛號單，按名字叫病人',identity:'請病人說姓名，核對掛號單',equipment:'核對這位病人的管子型號',exchange:'完成這位病人的更換',checks:task.caseId==='outpatientNG'?'聽診、位置確認與通暢檢查':'確認氣流與呼吸現況',record:'更換與確認完成，回電腦記錄','desk-return':'在電腦完成紀錄，掛號單放回桌上',done:'這位病人的工作完成了'})[task.stage];}
