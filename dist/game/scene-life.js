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
