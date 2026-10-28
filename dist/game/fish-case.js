export const FISH_SITES=[{id:'vallecula',name:'Vallecula',zh:'會厭谷'},{id:'pyriform',name:'Pyriform sinus',zh:'梨狀窩'},{id:'tonsils',name:'Tonsils',zh:'扁桃腺'},{id:'tongue-base',name:'Tongue base',zh:'舌根'}];
export const FISH_HISTORY=[{id:'when',text:'什麼時候吃到的？'},{id:'fish',text:'吃的是什麼魚？'},{id:'symptoms',text:'現在哪裡不舒服？'}];
export const FISH_PLANS=[{id:'observe',text:'症狀不明顯，觀察並安排門診追蹤'},{id:'ct',text:'症狀明顯，建議安排 CT'},{id:'endoscopy',text:'症狀明顯且疑在食道，安排胃鏡評估'}];
export const FISH_EVENT={title:'魚刺會診',category:'routine',dest:'g2',spot:'patient',source:'1F 急診 · NP',patient:'成人 · 吃魚後異物感，初評呼吸平順',tag:'急診會診',urgent:false,
  call:'ENT醫師，急診有一個 foreign body，魚刺。Lateral view 照完了，病人目前呼吸平順。',
  brief:'急診NP來電；問病史、頭燈看口腔、fiber檢查四處，找到魚刺後夾取，或依症狀安排後續。',
  phone:[{text:'Lateral view 有看到東西嗎？',dest:'g2',reply:'影像結果已補問，可安排到2G。'},{text:'請病人上來2G初診間。',dest:'g2',reply:'病人安排到2G初診間。'}],intro:'先問經過，再戴頭燈看口腔、用fiber檢查。',
  steps:[{ask:'先做什麼？',options:[{text:'問經過、用頭燈與fiber檢查',good:true,reply:'檢查與後續處理依這一位的發現接續。'}]}]};
const pick=(seed,items)=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.codePointAt(0),16777619);return items[(h>>>0)%items.length];};
export function createFishCase(seed){
  const variant=pick(seed+'|fish-branch',['found','found','mild','ct','esophagus']),site=variant==='found'?pick(seed+'|fish-site',FISH_SITES).id:null;
  const xraySuspicious=!!(site&&pick(seed+'|fish-film',[true,false]));
  const patient={name:pick(seed+'|fish-name',['林安禾','張沐晴','陳予安']),when:pick(seed+'|fish-time',['大約半小時前吃晚餐時。','今天晚餐吃到的，到現在約兩小時。','剛剛吃宵夜時突然覺得卡卡的。']),fish:pick(seed+'|fish-type',['虱目魚','鱸魚','吳郭魚']),symptoms:variant==='mild'?'喉嚨有點刮，現在只有輕微異物感，沒有很明顯。':variant==='esophagus'?'吞嚥會明顯卡痛，覺得卡在比較深、接近胸口的地方。':variant==='ct'?'吞嚥時明顯刺痛，到現在還是很不舒服。':'吃完後喉嚨一直有一點刺刺的，吞嚥時會更有感覺。'};
  return{variant,site,patient,stage:'phone',recordReviewed:false,xraySuspicious,xrayAsked:false,xray:xraySuspicious?'NP：「側面影像有看到疑似異物的影像，影像在系統裡可以看。」':'NP：「側面影像沒有看到明確異物，影像在系統裡可以看。」',asked:[],headlamp:false,oralChecked:false,activeSite:null,inspected:[],found:false,tool:null,removed:false,rechecked:false,plan:null,finished:false,point:pick(seed+'|fish-point',[{x:42,y:44},{x:57,y:53},{x:47,y:62}])};
}
export const fishSpot=t=>t.stage==='history'&&!t.recordReviewed?'desk':'patient';
export const fishStageText=t=>t.stage==='history'&&!t.recordReviewed?'到電腦查看線上影像與病歷':({phone:'接聽急診NP來電，安排病人到2G',history:'到診療椅旁，問清時間、魚種與不適位置',oral:'戴頭燈，先看口腔',scope:'用fiber查看四個重要位置',extract:'選魚刺鉗，對準可見魚刺夾取',recheck:'取出後再檢查、詢問症狀',plan:'依本次症狀與懷疑位置安排後續',explain:'說明本次結果與後續安排',done:'魚刺會診已完成'})[t.stage];
const fail=(message,penalty=false)=>({ok:false,message,penalty});
export function fishAction(t,action,value){
  if(!t||t.finished)return fail('這件會診已完成。');
  if(action==='xray'&&t.stage==='phone'&&!t.xrayAsked){t.xrayAsked=true;return{ok:true,message:t.xray};}
  if(action==='send'&&t.stage==='phone'){t.stage='history';return{ok:true};}
  if(action==='read-record'&&t.stage==='history'&&!t.recordReviewed){t.recordReviewed=true;return{ok:true};}
  if(action==='history'&&t.stage==='history'&&t.recordReviewed&&FISH_HISTORY.some(q=>q.id===value)&&!t.asked.includes(value)){t.asked.push(value);return{ok:true};}
  if(action==='history-done'&&t.stage==='history'&&t.recordReviewed&&t.asked.length===3){t.stage='oral';return{ok:true};}
  if(action==='headlamp'&&t.stage==='oral'&&!t.headlamp){t.headlamp=true;return{ok:true};}
  if(action==='oral-check'&&t.stage==='oral'&&t.headlamp&&!t.oralChecked){t.oralChecked=true;return{ok:true};}
  if(action==='fiber'&&t.stage==='oral'&&t.oralChecked){t.stage='scope';return{ok:true};}
  if(action==='view'&&t.stage==='scope'&&FISH_SITES.some(s=>s.id===value)){t.activeSite=value;if(!t.inspected.includes(value))t.inspected.push(value);return{ok:true};}
  if(action==='mark'&&t.stage==='scope'&&t.activeSite===t.site&&t.site&&!t.found){t.found=true;return{ok:true,message:'可疑魚刺已標記。'};}
  if(action==='scope-done'&&t.stage==='scope'&&t.inspected.length===4){if(t.site&&!t.found)return fail('視野中還有可疑細長物，先看清楚再標記。');t.stage=t.found?'extract':'plan';if(t.found)t.activeSite=t.site;return{ok:true};}
  if(action==='tool'&&t.stage==='extract'){if(value!=='forceps')return fail('這次要拿的是魚刺鉗。',true);t.tool=value;return{ok:true};}
  if(action==='extract'&&t.stage==='extract'&&t.tool==='forceps'&&t.found){t.removed=true;t.stage='recheck';return{ok:true};}
  if(action==='recheck'&&t.stage==='recheck'&&!t.rechecked){t.rechecked=true;return{ok:true};}
  if(action==='recheck-done'&&t.stage==='recheck'&&t.rechecked){t.plan='removed';t.stage='explain';return{ok:true};}
  if(action==='plan'&&t.stage==='plan'&&FISH_PLANS.some(p=>p.id===value)){
    const correct={mild:'observe',ct:'ct',esophagus:'endoscopy'}[t.variant];
    if(value!==correct)return fail('對照這位病人的症狀程度與本次評估的懷疑位置，再選後續安排。',true);
    t.plan=value;t.stage='explain';return{ok:true};
  }
  if(action==='finish'&&t.stage==='explain'&&t.plan){t.finished=true;t.stage='done';return{ok:true,completed:true,message:t.plan==='removed'?'病人：「下次不吃魚了。」\n你心想：這句話的有效期限，通常到下一餐。':'本次安排：'+FISH_PLANS.find(p=>p.id===t.plan).text+'。\n已向病人說明檢查結果與後續，症狀變化時再回報評估。'};}
  return fail('先完成目前這一步。');
}
