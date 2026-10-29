// The calendar is seeded with the shift, so restarting a test keeps its schedule.
export function createMorningOpening(seed,{conference}={}){
  let hash=0;for(const c of String(seed))hash=(hash*33+c.charCodeAt(0))>>>0;
  return{conference:conference??hash%3!==0,checked:false,stage:'calendar',question:0,focused:true,mistakes:0};
}
export function checkMorningCalendar(o){if(!o||o.checked)return false;o.checked=true;o.stage=o.conference?'report':'done';o.focused=o.conference;return true;}
export function openingTarget(o){return o?.focused&&o.stage!=='done'?{dest:'f7',spot:o.checked?'conference':'computer'}:null;}
export function conferenceQuestions(m){const nasal=m.list.find(p=>p.nasal);return[
  {question:'今天病房有幾位要查？',options:[{text:m.list.length+' 位，逐床確認今日計畫。',correct:true},{text:'先看電話有沒有響，再決定要查幾床。'}],explanation:'先確認名單上的 '+m.list.length+' 位，待會依名單逐床查房。'},
  {question:(nasal?.name||'SMP 術後病人')+'今天要清鼻子，你打算什麼時候帶過去？',options:[{text:'整份名單查完，再帶到 7F 檢查室。',correct:true},{text:'查到這一床就先離隊去清鼻子。'}],explanation:'先把整份名單查完，再帶病人到檢查室。'}
];}
export function beginConference(o){if(!o?.checked||!o.conference||o.stage!=='report')return false;o.stage='questions';return true;}
export function answerConference(o,m,index){if(o?.stage!=='questions')return false;const q=conferenceQuestions(m)[o.question];if(!q?.options[index]?.correct){o.mistakes++;return false;}o.question++;if(o.question===conferenceQuestions(m).length){o.stage='done';o.focused=false;}return true;}
