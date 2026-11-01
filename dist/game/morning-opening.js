import {WARD_PLAN,wardRect} from './ward-plan.js';
export const MORNING_START=440,CONFERENCE_START=450,CONFERENCE_END=465;
export const CONFERENCE_TYPES=[{id:'nose-ear',label:'鼻耳次專科',short:'鼻耳',color:'teal'},{id:'larynx',label:'喉次專科',short:'喉',color:'blue'},{id:'head-neck',label:'頭頸次專科',short:'頭頸',color:'gold'},{id:'paper',label:'paper reading',short:'Paper',color:'rose'}];
export const CONFERENCE_PAPERS=[
 {id:'temper',title:'近期研究：耳鼻喉科住院醫師脾氣越來越差',subtitle:'來電密度與深呼吸次數的前瞻性觀察',slides:[
  {tag:'研究問題',title:'到底是我脾氣差，還是電話太多？',text:'研究小組觀察值班醫師每次被 call 後的表情、深呼吸次數，以及「我才剛坐下」的出現頻率。',bars:[['電話還沒響',18],['剛躺下就響',68],['便當第一口就響',95]]},
  {tag:'方法與結果',title:'脾氣指數隨 call 密度上升。',text:'受試者原本都表示「今天應該還好」。接到第三通「幫我補個 order」後，這句話退出研究。吃到熱便當的組別，深呼吸次數較少。',bars:[['低 call 組',25],['中 call 組',56],['高 call 組',91]]},
  {tag:'討論',title:'先讓醫師吃一口，再討論統計。',text:'本研究的主要限制：研究助理也被叫去接電話，部分資料只有一聲嘆氣。結論暫時支持「先吃飯、坐一下、再接下一通」。'}
 ],questions:[
  {question:'主治：「你的結果，能說 ENT R 天生脾氣差嗎？」',options:[{text:'不能，先看來電與休息狀況；這篇也只是科內搞笑研究。',correct:true},{text:'可以，電話響之前就先怪住院醫師。'}],explanation:'觀察到一起發生，不代表能說是天生個性；這是一篇虛構的科內笑點。'},
  {question:'主治：「那你建議怎麼改善？」',options:[{text:'讓他吃到便當、適時休息，電話先把資訊講清楚。',correct:true},{text:'再加一支分機，讓研究更有統計力量。'}],explanation:'先照顧好吃飯和休息，也把來電資訊講完整。'}]},
 {id:'bento',title:'便當一熱，電話就響：一項第一口生存分析',subtitle:'熱便當與來電時機的神祕相關',slides:[
  {tag:'研究問題',title:'為什麼 call 總是在第一口？',text:'起始點定義為便當微波完成的那一秒，終點為第一次電話響。對照組則是已經冷掉、沒有人想打開的便當。',bars:[['冷便當',22],['剛微波好',65],['筷子夾起雞腿',94]]},
  {tag:'方法與結果',title:'微波三次，雞腿仍然沒咬到。',text:'熱便當組反覆出現「我先接一下」；冷便當組則出現「這是午餐還是晚餐」。唯一完整吃完的一位，當天手機沒電，已排除分析。'},
  {tag:'討論',title:'熱便當：尚未接到 call 的冷便當。',text:'研究限制是微波爐只有一台，而且研究者每次都忘了拿。後續研究預計評估「先吃一口再接」是否只是美好的願望。'}
 ],questions:[
  {question:'主治：「所以是便當的香味把電話引來？」',options:[{text:'不能這樣下結論，先確認時間與工作量；這是搞笑相關研究。',correct:true},{text:'是，改吃沒有味道的空氣就不會有 call。'}],explanation:'時間上的相關不等於香味造成來電，這篇是虛構的科內笑點。'},
  {question:'主治：「你報完，便當打算怎麼辦？」',options:[{text:'記得領、趁空檔吃，也留意待接電話。',correct:true},{text:'繼續冰著，留給下一屆做長期追蹤。'}],explanation:'記得領餐和補充飽足，別讓便當一直留在冰箱。'}]},
 {id:'pen',title:'初診間的筆為何出現在病房？跨樓層遷徙研究',subtitle:'從 2G 筆筒到 7F 白袍口袋的追蹤',slides:[
  {tag:'研究問題',title:'筆沒有腳，為什麼會搭電梯？',text:'研究者在初診間的筆貼上標籤，記錄它們是否出現在病房、刀房工作桌，以及某件永遠說「這不是我的筆」的白袍。'},
  {tag:'方法與結果',title:'2G 越找越少，7F 越撿越多。',text:'追蹤期間，病房發現大量「初診間專用」標記。受訪醫師皆表示「借一下而已」，但沒有一位能定義「一下」有多長。',bars:[['2G 原始標記',100],['7F 找到',65],['主動歸還',10]]},
  {tag:'討論',title:'建議設立候鳥返鄉專區。',text:'研究限制：負責記錄筆位置的那支筆也不見了。後續計畫於聯通層公告「病房撿到初診間的筆，請記得送回」，並觀察歸巢率。'}
 ],questions:[
  {question:'主治：「筆到底怎麼上樓的？」',options:[{text:'跟著工作流程和口袋移動；先看紀錄，別急著指控誰。',correct:true},{text:'筆自己通過電梯門，還有刷員工證。'}],explanation:'先確認移動紀錄；這是虛構的追蹤研究，笑點在於借完忘記送回。'},
  {question:'主治：「你在 7F 撿到這支，接下來？」',options:[{text:'確認是初診間的筆，順路送回去。',correct:true},{text:'撕掉標籤，宣布它已完成院內轉調。'}],explanation:'把筆送回原本的地方，讓下一位同事找得到。'}]},
 {id:'sleep',title:'眼睛一閉，分機就響：住院醫師與床墊的神祕感應',subtitle:'從頭碰到枕頭，到「喂，ENT嗎」的時間分析',slides:[
  {tag:'研究問題',title:'枕頭是不是接了院內分機？',text:'研究起點定義為後腦勺接觸枕頭。主要終點為第一次被叫「ENT醫師」，次要終點為棉被有沒有成功拉到肩膀。',bars:[['站著等 call',12],['坐到床邊',46],['終於躺平',96]]},
  {tag:'方法與結果',title:'唯一睡滿三分鐘的，是對照組的空床。',text:'躺平組最常回報「我才剛躺下」；尚未躺平組則表示「我根本還沒躺」。一位受試者成功拉好棉被，但電話在他決定要不要翻身時響了。'},
  {tag:'討論',title:'本研究無法雙盲，因為沒有人閉得了眼。',text:'研究助理原本負責記錄入睡時間，後來被叫去補 order。建議後續研究比較不同枕頭；但採購前，公務課先問：這個到底算寢具，還是通訊設備？'}
 ],questions:[
  {question:'主治：「所以把值班室的床拆掉，call就會變少？」',options:[{text:'不能這樣推論，還要看工作量；有空檔還是需要休息。',correct:true},{text:'對，並把枕頭列為高風險通訊設備。'}],explanation:'這是虛構的科內笑點，剛躺下接到電話不代表床墊造成來電。'},
  {question:'主治：「那你今晚打算睡哪裡？」',options:[{text:'回自己的值班室，趁空檔休息，也留意電話。',correct:true},{text:'躺初診間的治療床，讓分機以為我還在看病人。'}],explanation:'回自己的值班室休息，別搶病人的治療床或診療椅。'}]},
 {id:'order',title:'只要一分鐘：補個 order 的時間膨脹效應',subtitle:'從「幫我補一下」到真正按下送出的歷程',slides:[
  {tag:'研究問題',title:'「一下」的單位，是分鐘還是一個班？',text:'納入所有以「很快啦」開頭的請託。計時從接到電話開始，包含找電腦、登入、被迫改密碼，以及忘記剛剛到底要補哪一張。'},
  {tag:'方法與結果',title:'Order只有一張，密碼已經換了三組。',text:'第一組密碼與前三次相同，第二組只差一個字也不行。第三組終於通過，系統請你重新登入。受試者的表情先完成了統計顯著，order還沒有。',bars:[['接電話時的脾氣',18],['密碼被退回',62],['登入後又接一通',93]]},
  {tag:'討論',title:'一分鐘，是對方說出口花的時間。',text:'研究限制：觀察員剛問「怎麼還沒好」，就被分配去修卡紙的印表機。建議後續研究將「順便」列為獨立變項；目前沒有人願意加入順便組。'}
 ],questions:[
  {question:'主治：「只做一分鐘的，為什麼沒有納入分析？」',options:[{text:'也要納入，不能只挑卡最久的；這篇是搞笑報告。',correct:true},{text:'因為做太快，研究者還沒打開碼表。'}],explanation:'不能只選符合笑點的紀錄來下結論；本報告與圖表都是科內虛構內容。'},
  {question:'主治：「所以這張order，你補好了沒？」',options:[{text:'先核對病人與內容，確認送出；做完再說好了。',correct:true},{text:'我已經把「收到」講得很有完成的感覺。'}],explanation:'接到請託後還是要核對並完成，不能把「收到」當成已經送出。'}]}
];
function hash(value){let h=0;for(const c of String(value))h=(h*33+c.charCodeAt(0))>>>0;return h;}
function scheduleHash(value){let h=hash(value);h=Math.imul(h^h>>>16,0x7feb352d);h=Math.imul(h^h>>>15,0x846ca68b);return(h^h>>>16)>>>0;}
export function calendarToday(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function conferencePreviewDate(today=calendarToday()){const date=new Date(today+'T12:00:00Z'),weekday=date.getUTCDay();if(weekday===0||weekday===6)date.setUTCDate(date.getUTCDate()+(weekday===6?2:1));return date.toISOString().slice(0,10);}
export function monthlyConferences(seed,month,{today,conference}={}){
 const key=String(seed)+'|'+month,[year,m]=month.split('-').map(Number),days=new Date(Date.UTC(year,m,0)).getUTCDate(),weeks=new Map(),selected=[];
 const forced=typeof conference==='boolean'&&today?.startsWith(month+'-')&&[1,2,3,4,5].includes(new Date(today+'T12:00:00Z').getUTCDay());
 for(let day=1;day<=days;day++){
  const date=month+'-'+String(day).padStart(2,'0'),weekday=new Date(date+'T12:00:00Z').getUTCDay();
  if(weekday===0||weekday===6||(forced&&!conference&&date===today))continue;
  const week=Math.floor((day-1+new Date(Date.UTC(year,m-1,1)).getUTCDay())/7);
  if(!weeks.has(week))weeks.set(week,{id:week,dates:[],selected:0});weeks.get(week).dates.push(date);
 }
 const take=(week,date)=>{selected.push(date);week.selected++;week.dates.splice(week.dates.indexOf(date),1);};
 if(forced&&conference){const week=[...weeks.values()].find(w=>w.dates.includes(today));take(week,today);}
 // Fill the least occupied weeks first so meetings stay spread across the month.
 const count=6+scheduleHash(key+'|count')%3;
 while(selected.length<count){
  const week=[...weeks.values()].filter(w=>w.dates.length).sort((a,b)=>a.selected-b.selected||scheduleHash(key+'|week|'+a.id)-scheduleHash(key+'|week|'+b.id))[0];
  const date=week.dates.slice().sort((a,b)=>scheduleHash(key+'|'+a)-scheduleHash(key+'|'+b))[0];take(week,date);
 }
 const offset=scheduleHash(key+'|type')%CONFERENCE_TYPES.length;
 return selected.sort().map((date,i)=>({date,type:CONFERENCE_TYPES[(offset+i)%CONFERENCE_TYPES.length].id}));
}
export function createMorningOpening(seed,{conference,paperId,today=calendarToday()}={}){const h=hash(seed),entry=monthlyConferences(seed,today.slice(0,7),{today,conference}).find(e=>e.date===today);return{seed:String(seed),today,conferenceOverride:conference,conference:!!entry,type:entry?.type??CONFERENCE_TYPES[Math.floor(h/3)%4].id,paperId:CONFERENCE_PAPERS.some(p=>p.id===paperId)?paperId:CONFERENCE_PAPERS[Math.floor(h/13)%CONFERENCE_PAPERS.length].id,attending:['蔡','徐','葉','黃','羅','王','呂','張'][h%8],checked:false,stage:'calendar',slide:0,question:0,focused:true,mistakes:0,attendance:'pending',presentSince:null,wasPresent:false,arrivedAt:null,lateQueued:false,missedQueued:false,acknowledged:[]};}
export const conferenceType=o=>CONFERENCE_TYPES.find(t=>t.id===o.type);
export const conferencePaper=o=>CONFERENCE_PAPERS.find(p=>p.id===o.paperId);
export function calendarEntry(o,date){const entry=monthlyConferences(o.seed,date.slice(0,7),{today:o.today,conference:o.conferenceOverride}).find(e=>e.date===date);return entry?CONFERENCE_TYPES.find(t=>t.id===entry.type):null;}
export function calendarCells(year,month){const first=new Date(Date.UTC(year,month,1)),start=first.getTime()-first.getUTCDay()*86400000;return Array.from({length:42},(_,i)=>{const d=new Date(start+i*86400000);return{date:d.toISOString().slice(0,10),day:d.getUTCDate(),inMonth:d.getUTCMonth()===month};});}
export function checkMorningCalendar(o){if(!o||o.checked)return false;o.checked=true;if(o.stage!=='missed')o.stage=o.conference?'waiting':'done';o.focused=o.conference&&o.stage!=='missed';return true;}
export function openingTarget(o){return o?.focused&&!['done','missed'].includes(o.stage)?{dest:'f7',spot:o.checked?'conference':'computer'}:null;}
export function inDiscussionRoom(location,position){if(location!=='f7'||!position)return false;const r=wardRect(WARD_PLAN.core.find(r=>r.id==='討論室'));return Math.abs(position.x-r.x)<r.w/2-.15&&Math.abs(position.z-r.z)<r.d/2-.15;}
export function tickConference(o,clock,{present=false}={}){
 if(!o?.conference||['done','missed'].includes(o.stage))return[];
 if(present&&!o.wasPresent)o.presentSince=clock;if(!present)o.presentSince=null;o.wasPresent=present;
 if(clock>=CONFERENCE_START&&present&&o.attendance==='pending'){o.attendance=o.presentSince<=CONFERENCE_START?'on-time':'late';o.arrivedAt=clock;}
 const notices=[];
 if(clock>=CONFERENCE_START+1&&o.attendance!=='on-time'&&!o.lateQueued){o.lateQueued=true;notices.push('late');}
 if(clock>=CONFERENCE_END&&!present){o.stage='missed';o.focused=false;o.attendance='missed';if(!o.missedQueued){o.missedQueued=true;return['missed'];}}
 if(o.stage==='waiting'&&present&&clock>=CONFERENCE_START)o.stage='report';return notices;
}
export function openingClockRate(s){if(!s.opening)return null;if(s.clock<CONFERENCE_START)return .1;return !['done','missed'].includes(s.opening.stage)&&s.clock<CONFERENCE_END?.2:null;}
export function beginConference(o,clock){if(!o?.checked||!o.conference||o.stage!=='report'||clock<CONFERENCE_START||!['on-time','late'].includes(o.attendance))return false;o.stage='slides';return true;}
export function nextConferenceSlide(o){if(o?.stage!=='slides')return false;if(o.slide<conferencePaper(o).slides.length-1)o.slide++;else o.stage='questions';return true;}
export const conferenceQuestions=o=>conferencePaper(o).questions;
export function answerConference(o,index){if(o?.stage!=='questions')return false;const q=conferenceQuestions(o)[o.question];if(!q?.options[index]?.correct){o.mistakes++;return false;}o.question++;if(o.question===conferenceQuestions(o).length){o.stage='done';o.focused=false;}return true;}
export function conferenceCall(o,reason){return{id:'conference-'+reason,kind:'conference',reason,title:reason==='missed'?'主治來電：晨會你去哪了？':'主治來電：晨會遲到了！',source:o.attending+'主治 · '+conferenceType(o).label,urgent:false,penalty:reason==='missed'?12:8};}
