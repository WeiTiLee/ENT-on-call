export const AIRWAY_EVENT={title:'插管困難：急診 stand by',source:'1F 急診 · 柏宇醫師',patient:'頭頸腫瘤出血病人 · 麻醉科插管困難',tag:'急診緊急支援',category:'urgent',callType:'consult',urgent:true,dest:'f1',spot:'patient',orRoom:16,brief:'通知二線、帶portable fiber與工作帶到急診；確認插管無法完成後配合急氣切，接上呼吸器確認，再輸刀、聯絡控台，等通知後到16房revise。',call:'ENT醫師，這裡有一位tumor bleeding的病人，麻醉科插管插不上，請你們來急診stand by！',phone:[{text:'先通知二線，帶portable fiber和工作帶到急診',dest:'f1',support:true,reply:'急診團隊在現場等你。'}],intro:'麻醉科正在處理，二線已趕到現場。',steps:[{ask:'到場後先確認什麼？',options:[{text:'與麻醉科確認目前插管情況，再與二線接續處理',good:true,reply:'團隊確認現況後接續工作。'}]}]};
export const AIRWAY_KIT=[{id:'fiber',name:'Portable fiber'},{id:'belt',name:'工作帶（刀片、壓舌板等）'}];
export const OR_CONTROL_EXTENSION='53629';
const pick=(seed,list)=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.codePointAt(0),16777619);return list[(h>>>0)%list.length];};
export function createAirway(seed){return{patient:{name:pick(seed,['周以安','林沐晴','陳予澄']),id:pick(seed+'|mrn',['26007136','26008429','26009517'])},stage:'phone',seniorNotified:false,kit:[],seniorTogether:false,failedIntubation:false,prepared:[],procedure:[],ventilator:[],booked:false,draft:{patient:'',procedure:'',room:''},digits:'',directoryRead:false,waitSeconds:0,controlQueued:false,controlAnswered:false,reviseDone:false,done:false};}
export const airwayStageText=t=>({phone:'急診來電：麻醉科插管不上',gear:'通知二線，確認portable fiber與工作帶',arrival:'衝到1F急診，與麻醉科確認現況',prepare:'與二線準備急氣切',procedure:'配合團隊完成急氣切',ventilator:'接上ventilator，確認沒有問題',booking:'到急診電腦輸刀',dial:'打給刀房控台',waiting:'等待控台通知接刀','control-called':'接聽控台回電',transfer:'跟二線一起前往16房',revise:'與二線在16房revise',operating:'16房revise進行中',postop:'回16房電腦完成術後開單',done:'急氣切與16房revise已完成'})[t.stage];
export function airwayTarget(t,room=null){if(['transfer','revise','operating','postop'].includes(t.stage))return{dest:'f5',spot:room===16?(t.stage==='postop'?'or-computer':'operation'):room?'or-exit':'or-16'};return{dest:'f1',spot:t.stage==='booking'?'ed-computer':['dial','waiting','control-called'].includes(t.stage)?'ed-phone':'patient'};}
const fail=(message,penalty=false)=>({ok:false,message,penalty});
export function airwayAction(t,action,value){
 if(!t||t.done)return fail('這件事件已完成。');
 if(t.stage==='phone'&&action==='notify'){t.seniorNotified=true;t.stage='gear';return{ok:true,accepted:true};}
 if(t.stage==='gear'&&action==='kit'&&AIRWAY_KIT.some(x=>x.id===value)&&!t.kit.includes(value)){t.kit.push(value);return{ok:true};}
 if(t.stage==='gear'&&action==='depart'){if(!t.seniorNotified||t.kit.length!==2)return fail('先通知二線，確認portable fiber與工作帶都帶齊。');t.stage='arrival';return{ok:true,travel:true};}
 if(t.stage==='arrival'&&action==='confirm-failed'){t.failedIntubation=true;t.seniorTogether=true;t.stage='prepare';return{ok:true};}
 if(t.stage==='prepare'&&action==='prepare'&&['team','equipment'].includes(value)&&!t.prepared.includes(value)){t.prepared.push(value);return{ok:true};}
 if(t.stage==='prepare'&&action==='ready'){if(!t.failedIntubation||!t.seniorTogether||t.prepared.length!==2)return fail('先確認麻醉科無法完成插管，與二線確認分工及準備。');t.stage='procedure';return{ok:true};}
 if(t.stage==='procedure'&&action==='assist'&&value===t.procedure.length){t.procedure.push(value);if(t.procedure.length===3)t.stage='ventilator';return{ok:true};}
 if(t.stage==='ventilator'&&action==='ventilator'&&['connect','confirm'].includes(value)&&!t.ventilator.includes(value)){if(value==='confirm'&&!t.ventilator.includes('connect'))return fail('先接上ventilator，再與麻醉科確認。');t.ventilator.push(value);return{ok:true};}
 if(t.stage==='ventilator'&&action==='stable'){if(t.ventilator.length!==2)return fail('先接上呼吸器，與麻醉科確認通氣及監測狀況。');t.stage='booking';return{ok:true};}
 if(t.stage==='booking'&&action==='edit'&&['patient','procedure','room'].includes(value?.field)){t.draft[value.field]=value.value;return{ok:true};}
 if(t.stage==='booking'&&action==='book'){if(t.draft.patient!==t.patient.id||t.draft.procedure!=='revise-tracheostomy'||t.draft.room!=='16')return fail('核對病人、revise tracheostomy及16房，再輸刀。',true);t.booked=true;t.stage='dial';return{ok:true};}
 if(t.stage==='dial'){
  if(action==='directory'){t.directoryRead=true;return{ok:true};}
  if(action==='digit'&&/^\d$/.test(String(value))){if(t.digits.length<5)t.digits+=value;return{ok:true};}
  if(action==='clear'){t.digits='';return{ok:true};}
  if(action==='call'){if(!t.booked||!t.directoryRead)return fail('先輸刀，再核對電話單上的控台簡碼。');if(t.digits!==OR_CONTROL_EXTENSION)return fail('這不是刀房控台，再看電話單。',true);t.stage='waiting';return{ok:true,waiting:true};}
 }
 if(t.stage==='control-called'&&action==='answer-control'){t.controlAnswered=true;t.stage='transfer';return{ok:true,travel:true};}
 if(t.stage==='transfer'&&action==='arrive-or'){if(!t.controlAnswered||!t.seniorTogether)return fail('先等控台通知，再與二線一起進16房。');t.stage='revise';return{ok:true};}
 if(t.stage==='revise'&&action==='start-revise'){t.stage='operating';return{ok:true,surgery:true};}
 if(t.stage==='operating'&&action==='revise-done'){t.reviseDone=true;t.stage='postop';return{ok:true};}
 if(t.stage==='postop'&&action==='finish'&&t.reviseDone){t.done=true;t.stage='done';return{ok:true,completed:true};}
 return fail('先完成目前這一步，進度會保留。');
}
export function tickAirwayControl(t,dt,{active=true}={}){if(!t||t.stage!=='waiting'||t.controlQueued||!active||!Number.isFinite(dt)||dt<=0)return false;t.waitSeconds+=dt;if(t.waitSeconds<8)return false;t.controlQueued=true;t.stage='control-called';return true;}
