export const NOSE_VARIANTS=['mild','merocel','foley','tae','shock','unstable'];
export const NOSE_EVENT={title:'急診鼻出血會診',source:'1F 急診 · NP',patient:'鼻出血 · 出血狀況與生命徵象待確認',tag:'急診會診',category:'routine',callType:'consult',urgent:false,dest:'g2',spot:'patient',brief:'先問還有沒有流血、生命徵象與能否上樓；依檢查與止血結果安排後續。',call:'ENT醫師，急診有一位鼻出血的病人，想請你評估。',phone:[{text:'確認出血與生命徵象，再決定地點',dest:'g2',reply:'依病況安排。'}],steps:[{ask:'評估鼻出血',options:[{text:'依病況檢查與處理',good:true,reply:'依本次止血結果安排後續。'}]}]};
const pick=(seed,items)=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.codePointAt(0),16777619);return items[(h>>>0)%items.length];};
export function createNoseCase(seed,{variant}={}){const v=NOSE_VARIANTS.includes(variant)?variant:pick(seed+'|nose',NOSE_VARIANTS);return{variant:v,patient:{name:pick(seed+'|nose-name',['林安禾','張沐晴','陳予安'])},stage:'phone',asked:[],dest:null,rescued:false,located:false,packing:null,history:[],finished:false,plan:null};}
export const noseUnstable=t=>t.variant==='unstable'||t.variant==='shock'&&t.dest==='g2';
export const noseVitals=t=>t.variant==='unstable'?'BP 78/46，HR 128，病人頭暈、冒冷汗。':'BP 132/78，HR 88，目前意識清楚。';
export const noseStageText=t=>({phone:'問出血狀況、生命徵象與能否上樓',arrival:'到診重新確認出血與生命徵象',rescue:'呼叫支援，先處理休克與持續出血',transfer:'與急診團隊協調後，陪同轉回1F急診',history:'確認出血經過與用藥病史',scope:'用fiber尋找出血點',bosmin:'以Bosmin止血綿packing，觀察反應',packing:'依仍在出血的狀況選擇packing',recheck:'重新確認出血與生命徵象',foley:'Merocel後仍大量出血，評估加上Foley',tae:'Packing仍止不住，聯繫TAE評估',disposition:'依本次處置交代回診或安排住院',done:'鼻出血會診已完成'})[t.stage];
const fail=(message,penalty=false)=>({ok:false,message,penalty});
export function noseAction(t,action,value){
 if(!t||t.finished)return fail('這件會診已完成。');
 if(action==='ask'&&t.stage==='phone'&&['bleeding','vitals','transfer'].includes(value)&&!t.asked.includes(value)){t.asked.push(value);return{ok:true};}
 if(action==='destination'&&t.stage==='phone'&&['f1','g2'].includes(value)){
  if(t.asked.length<3)return fail('先確認還在流嗎、生命徵象與適不適合上樓。');
  if(value==='g2'&&t.variant==='unstable')return fail('病人目前不穩定，不適合上樓；請急診先處理急變，你到1F會合。',true);
  t.dest=value;t.stage='arrival';return{ok:true,accepted:true};
 }
 if(action==='assess'&&t.stage==='arrival'){t.stage=noseUnstable(t)?'rescue':'history';return{ok:true};}
 if(action==='rescue'&&t.stage==='rescue'){
  if(value!=='support')return fail('病人已出現休克，先呼叫支援、評估呼吸循環並同步止血。',true);
  t.rescued=true;t.stage=t.dest==='g2'?'transfer':'history';return{ok:true,message:t.dest==='g2'?'支援團隊到場，先行急救與止血；與急診協調安全轉送，不能讓病人自己走下樓。':'與急診團隊處理急變、同步止血，重新評估後接續處理。'};
 }
 if(action==='transfer'&&t.stage==='transfer'&&t.rescued){t.dest='f1';t.stage='history';return{ok:true,travel:true};}
 if(action==='history'&&t.stage==='history'&&['course','medication'].includes(value)&&!t.history.includes(value)){t.history.push(value);return{ok:true};}
 if(action==='fiber'&&t.stage==='history'&&t.history.length===2){t.stage='scope';return{ok:true};}
 if(action==='locate'&&t.stage==='scope'&&!t.located){t.located=true;return{ok:true};}
 if(action==='scope-done'&&t.stage==='scope'&&t.located){t.stage='bosmin';return{ok:true};}
 if(action==='bosmin'&&t.stage==='bosmin'){t.stage='packing';return{ok:true};}
 if(action==='packing'&&t.stage==='packing'){
  const expected=t.variant==='mild'?'surgicel':'merocel';if(value!==expected)return fail(t.variant==='mild'?'目前只剩小量滲血，先依這次狀況選擇Surgicel。':'仍有大量出血，這次先選Merocel，再確認止血效果。',true);
  t.packing=value;t.stage='recheck';return{ok:true};
 }
 if(action==='recheck'&&t.stage==='recheck'){t.stage=t.packing==='merocel'&&['foley','tae','shock','unstable'].includes(t.variant)?'foley':'disposition';return{ok:true};}
 if(action==='foley'&&t.stage==='foley'){
  if(value!=='add')return fail('Merocel後仍大量出血，不能直接讓病人離開。',true);
  t.packing='foley';t.stage=t.variant==='tae'?'tae':'disposition';return{ok:true,message:t.variant==='tae'?'加上Foley後仍持續出血，團隊評估進一步止血。':'加上Foley並重新評估後，出血已控制；需安排住院。'};
 }
 if(action==='tae'&&t.stage==='tae'){
  if(value!=='refer')return fail('Packing後仍止不住，需要接上進一步止血團隊。',true);
  t.packing='tae';t.stage='disposition';return{ok:true,message:'已聯繫介入團隊評估TAE，並安排住院接續照護。'};
 }
 if(action==='finish'&&t.stage==='disposition'){
  const expected=t.packing==='surgicel'?'followup':t.packing==='merocel'?'three-days':'admit';
  if(value!==expected)return fail(t.packing==='merocel'?'這次使用Merocel，請交代三天後回診移除。':['foley','tae'].includes(t.packing)?'這次使用Foley或需TAE，安排住院接續照護。':'確認止血後交代追蹤與再出血時回院評估。',true);
  t.plan=value;t.finished=true;t.stage='done';return{ok:true,completed:true,message:value==='three-days'?'出血已控制，已交代三天後回診移除Merocel，以及再出血或不適時回院評估。':value==='admit'?'已安排住院，交接本次出血、止血處置與後續監測。':'出血已控制，已交代後續追蹤與再出血時回院評估。'};
 }
 return fail('先完成目前這一步。');
}
