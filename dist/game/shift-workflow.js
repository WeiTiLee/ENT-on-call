import {EVENTS,LOCAL_OR_IDS,OUTPATIENT_IDS} from './event-pool.js';
// Follow-up work stays attached to its original case when another call interrupts it.
export function postoperative(s){return s.accepted?s.postoperative?.[s.run?.phases[s.phase]?.id]||null:null;}
export function beginPostoperative(s,text){
 const p=s.run.phases[s.phase];if(!(LOCAL_OR_IDS.includes(p.case)||p.case==='orSenior'||s.caseMode==='or'))return null;
 const all=s.postoperative??={};if(all[p.id])return all[p.id].done?null:all[p.id];
 const t=p.case==='orassist'?s.npx:s.localOR?.[EVENTS[p.case]?.localProcedure];
 return all[p.id]={id:p.id,room:EVENTS[p.case]?.orRoom||16,patient:t?.patient.name||EVENTS[p.case].patient,title:EVENTS[p.case].title,text,order:false,specimen:p.case==='orEar',needsSpecimen:p.case!=='orEar',done:false};
}
export function postoperativeAction(t,action){if(!t||t.done)return false;if(action==='order')t.order=true;else if(action==='specimen'&&t.needsSpecimen)t.specimen=true;else return false;t.done=t.order&&t.specimen;return true;}
export function continueOR(s,id){
 if(!s.run||s.run.studio&&!s.run.concurrentPreview||s.explore||![...LOCAL_OR_IDS,'orSenior'].includes(id)||s.clock>=1050)return null;
 const locals=s.run.phases.filter(p=>LOCAL_OR_IDS.includes(p.case)),next=locals.find(p=>!s.completed.includes(p.id));
 if(next){next.clock=Math.min(next.clock,s.clock);return next;}
 let senior=s.run.phases.find(p=>p.case==='orSenior');if(senior&&!s.completed.includes(senior.id)){senior.clock=Math.min(senior.clock,s.clock);return senior;}
 if(s.clock>=990||s.run.mode!=='random'||s.run.adaptiveBonus)return null;
 if(senior){const caseId=OUTPATIENT_IDS.find(id=>!s.run.ids.includes(id));if(!caseId)return null;const c=EVENTS[caseId],extra={id:caseId,case:caseId,kind:'case',clock:s.clock,title:c.title,description:'下午刀房提早收完，回2G支援門診工作。',dest:'g2',spot:c.spot,destination:'2G 初診間'};s.run.phases.push(extra);s.run.ids.push(caseId);s.run.total++;s.run.maxScore+=10;s.run.adaptiveBonus=caseId;return extra;}
 const c=EVENTS.orSenior;senior={id:'orSenior',case:'orSenior',kind:'case',clock:s.clock,title:c.title,description:'學長來電：13房都完成了，來16房幫我一下。',dest:'f5',spot:'operation',destination:'16房',afterCase:id};
 s.run.adaptiveBonus='orSenior';s.run.phases.push(senior);s.run.ids.push('orSenior');s.run.total++;s.run.maxScore+=10;return senior;
}
export function printFollowup(task,location,room,clock){if(!task?.request?.id.startsWith('print-'))return false;task.done=false;task.paper={stage:'printer',location:location==='f5'?'f7':location,room:null,lastReminder:clock};return true;}
export function paperTarget(task){const p=task?.paper;if(!p)return null;return p.stage==='printer'?{dest:p.location,spot:'printer'}:{dest:'f7',spot:'nurse'};}
export function paperAction(task,location,spot){const p=task?.paper;if(!p||task.done)return false;if(p.stage==='printer'&&location===p.location&&spot==='printer'){p.stage='deliver';return true;}if(p.stage==='deliver'&&location==='f7'&&spot==='nurse'){p.stage='done';task.done=true;return true;}return false;}
export function paperReminders(s){if(!s.started||s.explore||s.ending||s.mode!=='walk')return[];return Object.values(s.wardCalls||{}).filter(t=>t.paper&&!t.done&&s.clock-t.paper.lastReminder>=45).map(t=>{t.paper.lastReminder=s.clock;return t;});}
export const cookiePlace=({emergency=false,discussion=false,ward=false}={})=>emergency?'pocket':discussion?'discussion':ward?'ward':'clinic';
export function cookiesLeft(s,place){const stock=s.cookieStock??={pocket:1,discussion:3,ward:3,clinic:3};return stock[place]||0;}
export function takeCookie(s,place){if(cookiesLeft(s,place)<=0)return false;s.cookieStock[place]--;return true;}
