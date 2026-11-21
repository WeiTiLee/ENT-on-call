const ACTIVITIES={calendar:'查看今日行事曆',music:'刀房音響',records:'查看病歷與影像','or-list':'核對手術清單',supply:'補充體力與飽足',printer:'處理印表機卡紙',tissue:'補充衛生紙',water:'處理漏水',map:'查看院區動線',wardplan:'查看7F病房平面',clinicplan:'查看2G平面'};
export function openingOwnsMission(s){return !!s.opening?.focused&&!s.accepted&&!ACTIVITIES[s.mode]&&!['done','missed'].includes(s.opening.stage);}
export function missionContext(s,{track=null,playing=false,hasCalls=false}={}){
 if(!s.started||s.ending)return null;
 const activity=ACTIVITIES[s.mode];if(activity){return{index:'正在操作',title:s.mode==='music'&&track?(playing?'播放中：':'音響：')+track.title:activity,description:s.mode==='music'?'關閉音響後，回到手邊的工作；原待辦保留。':s.mode==='calendar'?(s.opening?.checked?'今日行程已確認，依安排接續工作。':'點月曆中的今天，查看有沒有晨會。'):'完成或關閉這個畫面後，接續原本待辦。'};}
 if(s.mode==='walk'&&!s.explore&&!s.accepted&&!hasCalls&&s.location!=='f7'&&s.opening?.focused&&!s.opening.checked){return{index:'目前位置',title:s.orRoom?s.orRoom+'房':s.location==='g2'?'2G 初診間':s.location==='f5'?'5F 刀房走廊':'目前在院區走動',description:'早晨待辦還沒完成：確認今日有無晨會。可直接打開行事曆查看。'};}
 return null;
}
