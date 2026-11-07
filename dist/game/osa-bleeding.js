export const OSA_EVENT={title:'達文西OSA術後第5天吐血',source:'7F 病房 · 主護',patient:'7F23A · 成人 · 達文西OSA術後第5天',tag:'病房急call',category:'urgent',callType:'ward',wardOnly:true,urgent:true,dest:'f7',spot:'patient',brief:'先問出血量與vital signs、交代含冰水與坐高；到床邊用頭燈，必要時fiber找扁桃腺或舌根出血點，再做床邊止血與觀察。',call:'醫師，7F23A五天前開達文西OSA，現在在吐血！',phone:[{text:'確認出血量與vital signs，交代初步處理後到床邊',dest:'f7',reply:'主護在床邊等你。'}],intro:'先到床邊重新看病人，確認出血點。',steps:[{ask:'先做什麼？',options:[{text:'到床邊檢查，依出血點進行止血',good:true,reply:'床邊評估與處理後，留病房持續觀察。'}]}]};
export const OSA_SITES=[{id:'tonsil',name:'扁桃腺'},{id:'tongue',name:'舌根'}];
export const OSA_QUESTIONS=[{id:'amount',text:'吐血的量大概多少？'},{id:'vitals',text:'Vital signs如何？'}];
export const OSA_FIRST_AID=[{id:'ice',text:'先口含冰水'},{id:'sit',text:'先坐高'}];
const pick=(seed,list)=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.codePointAt(0),16777619);h=Math.imul(h^(h>>>16),0x7feb352d);h^=h>>>15;return list[(h>>>0)%list.length];};
export function createOSABleed(seed){const site=pick(seed+'|osa-site',OSA_SITES).id;return{patient:{name:pick(seed+'|osa-name',['林安禾','陳予安','張沐晴']),bed:'7F23A'},site,clearWithHeadlamp:site==='tonsil',amount:pick(seed+'|osa-amount',['剛剛吐出一小口鮮血，現在還有少量血水。','剛吐出幾口帶鮮血的血水，還在反覆吐。']),bpHigh:pick(seed+'|osa-bp',[true,false]),stage:'phone',asked:[],firstAid:[],route:null,hasFiber:false,headlamp:false,examined:false,fiberUsed:false,identified:false,treated:[],rechecked:false,reported:false,finished:false};}
export const osaVitalText=t=>t.bpHigh?'BP 168/94，HR 96；意識清楚、可配合，呼吸目前平順。':'BP 138/82，HR 88；意識清楚、可配合，呼吸目前平順。';
export const osaTarget=t=>t.stage==='pickup'?{dest:'g2',spot:'clinic-fiber'}:{dest:'f7',spot:'patient'};
export const osaStageText=t=>({phone:'問出血量與生命徵象，交代含冰水與坐高',pickup:'到2G拿fiber，再回7F23A床邊',arrival:'到7F23A，重新評估術後吐血的病人',headlamp:!t.headlamp?'戴頭燈，先看口腔出血點':!t.examined?'用頭燈看清口腔':t.site==='tonsil'?'確認扁桃腺出血點':'接續fiber，確認深處出血點',scope:'用fiber確認出血點在扁桃腺或舌根',packing:'選擇器械，夾Bosmin紗布止血',medical:'Transamin與血壓評估處理',recheck:'打給二線學長報告',handoff:'向主護交代，完成事件',done:'病房床邊處理已完成'})[t.stage];
const fail=(message,penalty=false)=>({ok:false,message,penalty});
export function osaAction(t,action,value){
 if(!t||t.finished)return fail('這件病房事件已完成。');
 if(action==='ask'&&t.stage==='phone'&&OSA_QUESTIONS.some(q=>q.id===value)&&!t.asked.includes(value)){t.asked.push(value);return{ok:true};}
 if(action==='first-aid'&&t.stage==='phone'&&t.asked.length===2&&OSA_FIRST_AID.some(q=>q.id===value)&&!t.firstAid.includes(value)){t.firstAid.push(value);return{ok:true};}
 if(action==='route'&&t.stage==='phone'&&['direct','fiber'].includes(value)){
  if(t.asked.length!==2||t.firstAid.length!==2)return fail('先問量與vital signs，交代主護讓病人口含冰水、坐高。');t.route=value;t.stage=value==='fiber'?'pickup':'arrival';return{ok:true,accepted:true};
 }
 if(action==='pickup'&&t.stage==='pickup'){t.hasFiber=true;t.stage='arrival';return{ok:true,travel:true,message:'Fiber拿好了，回7F23A床邊。'};}
 if(action==='arrival'&&t.stage==='arrival'){t.stage='headlamp';return{ok:true,message:'已重新確認病人清醒、呼吸平順，仍有血水。接著戴頭燈看口腔。'};}
 if(action==='headlamp'&&t.stage==='headlamp'&&!t.headlamp){t.headlamp=true;return{ok:true};}
 if(action==='examine'&&t.stage==='headlamp'&&t.headlamp&&!t.examined){t.examined=true;return{ok:true};}
 if(action==='request-fiber'&&t.stage==='headlamp'&&t.examined&&!t.hasFiber){t.hasFiber=true;return{ok:true,message:'請同事協助把fiber送到床邊，你留在病人旁邊接續處理。'};}
 if(action==='fiber'&&t.stage==='headlamp'&&t.examined&&t.hasFiber){t.fiberUsed=true;t.stage='scope';return{ok:true};}
 if(action==='identify'&&['headlamp','scope'].includes(t.stage)){
  if(t.stage==='headlamp'&&(!t.examined||t.site!=='tonsil'))return fail('目前頭燈視野還看不清楚出血點，先用fiber確認。',true);
  if(!OSA_SITES.some(p=>p.id===value))return fail('請選擇檢查所見的位置。');
  if(value!==t.site)return fail('再看一下紅色出血點的位置，對照扁桃腺與舌根。',true);
  t.identified=true;t.stage='packing';return{ok:true};
 }
 if(action==='bosmin'&&t.stage==='packing'&&t.identified){const needed=t.site==='tonsil'?'forceps':'fish-forceps';if(value!==needed)return fail(t.site==='tongue'?'舌根位置較深，要用魚刺鉗夾Bosmin紗布才壓得到。':'扁桃腺用forceps夾Bosmin紗布壓迫即可。',true);if(t.site==='tongue'&&!t.fiberUsed)return fail('先用fiber確認舌根出血點。');t.instrument=value;t.treated.push('bosmin');t.stage='medical';return{ok:true,message:'已用'+(needed==='forceps'?'forceps':'魚刺鉗')+'夾Bosmin紗布壓迫止血。'};}
 if(action==='medical'&&t.stage==='medical'&&['transamin','bp'].includes(value)&&!t.treated.includes(value)){t.treated.push(value);return{ok:true,message:value==='transamin'?'已安排Transamin處置，接著確認反應。':t.bpHigh?'已處理偏高的血壓，持續監測變化。':'目前血壓不需額外降壓，持續監測。'};}
 if(action==='report-senior'&&['medical','recheck','handoff'].includes(t.stage)&&!t.reported&&['bosmin','transamin','bp'].every(id=>t.treated.includes(id))){t.rechecked=true;t.reported=true;t.stage='handoff';return{ok:true};}
 if(action==='finish'&&t.stage==='handoff'&&t.reported){t.finished=true;t.stage='done';return{ok:true,completed:true,message:'已向二線學長報告，並交代主護持續觀察、再出血時回報。'};}
 return fail('先完成目前這一步。');
}
