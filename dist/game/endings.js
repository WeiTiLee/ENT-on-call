import {shiftScore} from './vitals.js';
import {endingBadge} from './ending-badges.js';
export const ENDING_STORIES=[
 {id:'breakfast',minimum:90,title:'今天，你守住了這一班',theme:'warm',phone:'護理師：「醫師，早餐幫你留好了。」',thought:'原來，還有人記得我沒吃飯。',last:'這一次，桌上的早餐還是熱的。',scene:0,face:6},
 {id:'bento',minimum:75,title:'天亮了，終於換我吃飯',theme:'meal',phone:'護理師：「等一下！你的便當還在冰箱。」',thought:'好險。差點連便當都留院觀察。',last:'你轉身走回護理站。這一次，先把飯吃完。',scene:0,face:5},
 {id:'elevator',minimum:60,title:'差一點就能下班',theme:'lift',phone:'護理師：「醫師，昨天那個order……」',thought:'電梯門，現在關還來得及嗎？',last:'你望向天花板。畫面停在電梯門關上的前一秒。',scene:5,face:5},
 {id:'escape',minimum:0,title:'ENT暫時停止回應',theme:'sea',phone:'電話又響了。你坐在護理站，眼神逐漸失去焦距。',thought:'如果電梯能直達海邊就好了。',last:'電話聲變成海浪。你還在醫院，想像力已經先下班。',scene:0,face:4}
];
export const BADGE_EPILOGUES={cold:'你離開了醫院，便當還在值班。',pillow:'枕頭：「方便再自我介紹一次嗎？」',elevator:'電梯：「明天還是老時間？」',flammable:'本班電話已通過耐高溫測試。',calm:'你沒爆炸，這件事本身就值得寫一篇paper。',maintenance:'今天救回來的不只病人，還有印表機與冷氣。'};
export function endingForScore(total){const n=Number.isFinite(total)?Math.max(0,Math.min(100,total)):0;return ENDING_STORIES.find(s=>n>=s.minimum);}
export function endingDue(s){return s.started&&!s.ending&&!s.explore&&!!s.run&&(!s.run.studio||s.run.concurrentPreview)&&s.clock>=1890&&!['welcome','pause','help','studio','vital-rules','end'].includes(s.mode);}
export function createEnding(s,points,max){
 const result=shiftScore(s,points,max),story=endingForScore(result.total),badge=endingBadge(s),completed=[...new Set(s.completed)];
 const memories=[];
 if(completed.includes('rounds'))memories.push({scene:0,title:'早晨的patient list',text:'一床、一床，走過今天的查房名單。'});
 if(completed.some(id=>['outpatientPaperwork','outpatientNG','outpatientTrach','ng','sudden','booking','contact','fish','nose'].includes(id)))memories.push({scene:1,title:'初診間的日常',text:'桌上的單子收過一張，又來一張。'});
 if(s.stats.operations>0||completed.some(id=>['orassist','orEar','orOral','orSenior'].includes(id)))memories.push({scene:3,title:'刀房裡的午後',text:'燈亮著，手邊的工作一台接著一台。'});
 memories.push({scene:4,title:s.stats.woken?'沒睡成的枕頭':'短暫安靜的角落',text:s.stats.woken?'這一班被電話叫醒了'+s.stats.woken+'次。':'忙到沒睡，或終於能歇一會；只有你知道這一班的節奏。'});
 if(s.food.orders.some(o=>o.id==='bento'))memories.push({scene:0,title:s.food.orders.some(o=>o.id==='bento'&&o.taken)?'終於吃到的便當':'還在等你的便當',text:s.food.orders.some(o=>o.id==='bento'&&o.taken)?'電話之外，你也記得照顧自己。':'你忙了一整班，便當也等了一整班。'});
 return{storyId:story.id,result,badge,quip:BADGE_EPILOGUES[badge.id],memories:memories.slice(0,4),completed,step:0,montage:false,viewed:false,musicStarted:false};
}
export function advanceEnding(e){if(e.viewed)return false;if(e.step<2)e.step++;else e.montage=true;return true;}
export function revealEnding(e){if(!e.montage||e.viewed)return false;e.viewed=true;return true;}
