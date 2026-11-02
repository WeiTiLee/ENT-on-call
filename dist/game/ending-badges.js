export const ENDING_BADGES=[
 {id:'cold',title:'冷便當考古學家'},
 {id:'pillow',title:'枕頭試用失敗員'},
 {id:'elevator',title:'電梯里長伯'},
 {id:'flammable',title:'ENT易燃特有種'},
 {id:'calm',title:'ENT 情緒穩定稀有種'},
 {id:'maintenance',title:'公務課之友'}
];
const count=n=>Number.isFinite(n)?Math.max(0,Math.floor(n)):0;
export function recordTravel(s,mode){if(!['walk','elevator'].includes(mode))return false;s.stats.trips=count(s.stats.trips)+1;if(mode==='elevator')s.stats.elevatorRides=count(s.stats.elevatorRides)+1;return true;}
export function endingBadge(s){
 const stats=s.stats||{},woken=count(stats.woken),rides=count(stats.elevatorRides),rages=count(s.care?.rages),temper=Math.max(0,Math.min(100,Number.isFinite(s.temper)?s.temper:50));
 const repairs=new Set((s.side?.completed||[]).filter(key=>['printer','water','tissue'].includes(String(key).split(':').at(-1)))).size;
 let id,reason;
 if(rages>0||temper>=80){id='flammable';reason=rages?'這一班脾氣爆炸'+rages+'次，已足以成為晨會研究對象。':'交班脾氣'+Math.round(temper)+'/100，下通電話請輕放。';}
 else if(repairs>=2){id='maintenance';reason='完成'+repairs+'項設備或補給彩蛋，公務課感謝你的友情支援。';}
 else if(woken>=2){id='pillow';reason='被電話叫醒'+woken+'次，枕頭至今還不認識你。';}
 else if(rides>=8){id='elevator';reason='這一班搭了'+rides+'次電梯，電梯門都快認得你。';}
 else if(count(stats.meals)===0||s.hunger<=25){id='cold';reason='便當還在等你，你已經準備交班。';}
 else if(temper>=50){id='flammable';reason='交班脾氣'+Math.round(temper)+'/100，再一通「幫我補一下」就很難說。';}
 else{id='calm';reason='交班脾氣'+Math.round(temper)+'/100，接了這麼多call還能好好說話。';}
 return{...ENDING_BADGES.find(b=>b.id===id),reason};
}
