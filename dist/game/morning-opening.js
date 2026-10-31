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
  {question:'主治：「你在 7F 撿到這支，接下來？」',options:[{text:'確認是初診間的筆，順路送回去。',correct:true},{text:'撕掉標籤，宣布它已完成院內轉調。'}],explanation:'把筆送回原本的地方，讓下一位同事找得到。'}]}
];
function hash(value){let h=0;for(const c of String(value))h=(h*33+c.charCodeAt(0))>>>0;return h;}
export function calendarToday(now=new Date()){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function createMorningOpening(seed,{conference,paperId,today=calendarToday()}={}){const h=hash(seed);return{seed:String(seed),today,conference:conference??h%3!==0,type:CONFERENCE_TYPES[Math.floor(h/3)%4].id,paperId:CONFERENCE_PAPERS.some(p=>p.id===paperId)?paperId:CONFERENCE_PAPERS[Math.floor(h/13)%3].id,attending:['蔡','徐','葉','黃','羅','王','呂','張'][h%8],checked:false,stage:'calendar',slide:0,question:0,focused:true,mistakes:0,attendance:'pending',presentSince:null,wasPresent:false,arrivedAt:null,lateQueued:false,missedQueued:false,acknowledged:[]};}
export const conferenceType=o=>CONFERENCE_TYPES.find(t=>t.id===o.type);
export const conferencePaper=o=>CONFERENCE_PAPERS.find(p=>p.id===o.paperId);
export function calendarEntry(o,date){if(date===o.today)return o.conference?conferenceType(o):null;const weekday=new Date(date+'T12:00:00Z').getUTCDay();return weekday===0?null:CONFERENCE_TYPES[hash(date)%4];}
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
