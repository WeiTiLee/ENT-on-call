// Screen-left and screen-right refer to the rotated ward shown to players.
export const DUTY_ROOMS={
  '值班室 (1)':{character:'male',name:'男生值班室',side:'left'},
  '值班室 (2)':{character:'female',name:'女生值班室',side:'right'}
};
export const canUseDutyRoom=(spot,character)=>!spot.allowedCharacter||spot.allowedCharacter===character;
export const BULLETINS=[
  {tag:'榮譽榜',title:'恭喜 ENT 兩位蔡教授榮獲世界前 2% 科學家',text:'耳鼻喉科全體同仁敬賀。'},
  {tag:'團購情報',title:'爆米花開團：四種口味',text:'芥末、焦糖、烏龍茶、巧克力。請向護理站登記；訂單可以準時收，醫師不一定能準時吃。'},
  {tag:'失物招領',title:'診間的筆，請回家。',text:'在病房撿到初診間的筆，請送回 2G。它已經出差三天了，診間正在找它。'},
  {tag:'冰箱提醒',title:'冰便當的人，要記得領取！',text:'請寫上名字與日期，忙完記得拿走。冰箱負責保冷，不負責提醒你已經下班。'},
  {tag:'科內非正式研究',title:'近期研究發現：ENT 住院醫師脾氣越來越差',text:'本遊戲虛構研究：電話越密、便當越冷，脾氣越高。建議補飯、補眠，並減少「順便再看一個」。'},
  {tag:'人才招募',title:'內外科住院醫師短缺，歡迎投單',text:'歡迎有志之士加入內科、外科住院醫師行列。條件：接得起電話，也記得吃飯。詳情請洽各科招募窗口。'}
];

const FLOOR_BULLETINS={
  '1':[
    {tag:'急診旁的溫馨提醒',title:'「看完這個就好」是時間單位嗎？',text:'本遊戲非正式統計：這句話之後，通常還會再來一個。'},
    {tag:'夜間走廊觀察',title:'電梯到了，電話也到了',text:'剛跨進電梯，手機就響。請先確認目的地，避免搭出一趟院內觀光。'},
    {tag:'失物招領',title:'尋找完整吃完的晚餐',text:'最後目擊地點：值班醫師面前。失蹤時間：第一通急診電話響起之後。'}
  ],
  '2':[
    {tag:'初診間日常',title:'印表機目前情緒穩定',text:'這張公告印出來的時候是。現在請以現場狀況為準。'},
    {tag:'補給提醒',title:'最後一張衛生紙不是結案',text:'抽完請補下一包，讓下一位洗完手的人不用原地思考人生。'},
    {tag:'診間失物協尋',title:'筆離開2G後，是否仍記得回家的路？',text:'本遊戲虛構追蹤研究：初診間的筆經常在7F重新被發現。'}
  ],
  '7':[
    {tag:'值班室提醒',title:'枕頭尚未完成本日試用',text:'剛躺下就接電話不算睡過，請保留再次試用的機會。'},
    {tag:'病房電話實錄',title:'「一個小order」通常不會只有一個',text:'先漱口，再點滴，最後順便印張單。小，是指電話那一端的工作量。'},
    {tag:'病房走廊觀察',title:'你已經第三次經過護理站了',text:'第一次接call，第二次補order，第三次終於想起來領便當。辛苦了。'}
  ]
};
const XU_NOTICE={tag:'榮譽榜',title:'恭喜徐教授獲得研究成果應用競賽第一名',text:'耳鼻喉科全體同仁敬賀！'};
const EXTRA_NOTICES=[
 {tag:'院內氣象台',title:'今日電話降雨機率：100%',text:'局部病房有短暫密集來電，值班室可能出現雷聲。出門請帶手機與耐心。'},
 {tag:'睡眠研究速報',title:'手機可以偵測醫師躺下',text:'本遊戲虛構研究：背部接觸床墊後，分機響起的速度顯著上升。枕頭尚未通過盲測。'},
 {tag:'院內系統溫馨提醒',title:'越忙，越要改密碼',text:'新密碼不得與前三次相同。至於你上次睡飽是哪一天，系統不要求記得。'},
 {tag:'值班飲食學',title:'便當不會消失，只會變冷',text:'主治的刀可以準時開始，你的飯不保證。建議領到後，先吃一口再說。'},
 {tag:'器材協尋',title:'這支筆不是迷路，是跨科學習',text:'目前研修地點：7F護理站。原單位2G表示：課程結束請儘速返鄉。'},
 {tag:'不正式用語辭典',title:'「順便」：讓一件事變成五件事的咒語',text:'請搭配「你現在有空嗎」使用，效果加倍。聽到後先深呼吸。'}
];
function noticeShuffle(items,seed){let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.codePointAt(0),16777619);const out=[...items];for(let i=out.length-1;i>0;i--){h^=h<<13;h^=h>>>17;h^=h<<5;const j=(h>>>0)%(i+1);[out[i],out[j]]=[out[j],out[i]];}return out;}
// A run and floor always show the same papers, including on a return visit.
export function bulletinsFor(location,seed='ENT'){
 const floor=String(location).match(/\d+/)?.[0]||'7';
 const local=FLOOR_BULLETINS[floor]||FLOOR_BULLETINS['7'];
 return[BULLETINS[0],XU_NOTICE,...noticeShuffle(local,seed+'|local|'+floor).slice(0,2),...noticeShuffle([...BULLETINS.slice(1),...EXTRA_NOTICES],seed+'|common|'+floor).slice(0,2)];
}
