import {createFoodState} from './meal-breaks.js';
import {createSelfCare} from './vitals.js';
import {createSideActivities} from './side-activities.js';
export const GAME={title:'今天你值 ENT',version:'0.4'};
export const CREDIT='以《我熱愛值班》範本製作 · drcharming.net';
export const LOCATIONS={
  f7:{code:'7F',building:'F 棟 · 七樓',name:'耳鼻喉科病房',kind:'ward',chapter:'一個看似平靜的早上'},
  f5:{code:'5F',building:'F 棟 · 五樓',name:'刀房',kind:'or',chapter:'手穩，肩膀放鬆。'},
  f2:{code:'2F',building:'F 棟 · 二樓',name:'跨棟連通區',kind:'lobby',chapter:'轉個彎，又是另一個棟別'},
  f1:{code:'1F',building:'F 棟 · 一樓',name:'急診',kind:'ed',chapter:'每一通電話，都有自己的故事'},
  g2:{code:'2G',building:'G 棟 · 二樓',name:'耳鼻喉科初診間',kind:'clinic',chapter:'病人還沒到，電話先到了。'},
  g1:{code:'1G',building:'G 棟 · 一樓',name:'跨棟連通區',kind:'lobby',chapter:'走廊的另一端，還有人在等你'},
  g7:{code:'7G',building:'G 棟 · 七樓',name:'跨棟連通區',kind:'lobby',chapter:'夜裡的走廊，腳步特別清楚'}
};
export const PHASES=[
  {id:'morning',kind:'handover',clock:440,title:'先到護理站印名單',description:'在護理站列印 patient list，再依名單走到每一床。',dest:'f7',spot:'nurse',destination:'7F 病房 · 護理站列印'},
  {id:'fish',kind:'case',clock:520,title:'魚刺會診',description:'急診打來了。先接電話，確認病況與處理地點。',case:'fish',dest:'g2',spot:'patient',destination:'2G 初診間'},
  {id:'day-or',kind:'operation',clock:600,title:'刀房在等你',description:'先到 F 棟，再搭電梯上五樓。這一段，學長會陪你做。',dest:'f5',spot:'operation',destination:'F 棟 5 樓 · 刀房'},
  {id:'blueberry',kind:'case',clock:840,title:'會診標題：藍莓',description:'這次需要去急診現場。先聽完整資訊，再決定下一步。',case:'blueberry',dest:'f1',spot:'patient',destination:'1F 急診 · 會診區'},
  {id:'nose',kind:'case',clock:960,title:'鼻血與衛生紙',description:'一整包衛生紙，不等於一份完整病史。先補齊資訊。',case:'nose',dest:'g2',spot:'patient',destination:'2G 初診間'},
  {id:'dinner',kind:'break',clock:1080,title:'晚餐便當到了，先吃一口',description:'18:00 後便當送到 7F 護理站。領取自己訂的便當；若先忙，餐點仍留在待辦。',dest:'f7',spot:'nurse',destination:'7F 病房 · 護理站'},
  {id:'popcorn',kind:'social',clock:1110,title:'爆米花口味投票',description:'電話響了。這通的三個選項，可能還有附件。',dest:'g2',spot:'desk',destination:'電話回覆即可'},
  {id:'tonsil',kind:'case',clock:1200,title:'術後病人出血了',description:'病房有需要及時評估的狀況。到現場，並找齊團隊。',case:'tonsil',dest:'f7',spot:'patient',destination:'7F 病房 · 7F23'},
  {id:'sleep',kind:'sleep',clock:1445,title:'終於可以躺一下',description:'午夜了，回 7F 病房後方值班室。電話會記得找到你。',dest:'f7',spot:'sleep',destination:'7F 病房後方 · 值班室'},
  {id:'cockroach',kind:'case',clock:1510,title:'耳朵裡的不速之客',description:'病人在初診間等候。從 F 棟下二樓，再跨到 2G。',case:'cockroach',dest:'g2',spot:'patient',destination:'2G 初診間'},
  {id:'airway',kind:'case',clock:1680,title:'急氣切，現場會合',description:'急診發出需要團隊到場的會診。先聯繫支援，再趕往現場。',case:'airway',dest:'f1',spot:'patient',destination:'1F 急診 · 急救區'},
  {id:'finish',kind:'finish',clock:1890,title:'終於要交班了',description:'把後續事項交代清楚。你昨晚的故事，包含了四個樓層。',dest:'f7',spot:'nurse',destination:'7F 病房 · 護理站'}
];
export const CASES={
  fish:{title:'魚刺會診',source:'1F 急診 · 柏宇醫師',patient:'張先生 · 成人 · 吃魚後喉嚨異物感',tag:'一般會診',urgent:false,
    call:'ENT 你好，魚刺會診。成人，意識清楚，目前呼吸平順。吃魚以後覺得喉嚨有刺，想請你評估。',
    phone:[{text:'補問目前狀況，確認適合上樓後請到 2G',dest:'g2',reply:'病人安排到 2G 初診間。小禾會先幫你接待。'},{text:'我到 1F 急診評估',dest:'f1',reply:'好，我們在急診等你。這一趟多走了一些路，也能完成評估。'},{text:'只回「應該沒事」就掛電話',why:'還沒有評估，先把目前狀況與經過問完整。'}],
    intro:'病人：「本來吃得好好的，突然覺得怪怪的。」\n小禾：「每位魚刺病人的故事，都是從這一句開始。」',
    steps:[{ask:'病人已經到診。先把哪些資訊補齊？',options:[{text:'確認吃魚經過、症狀與目前狀況，再進行評估',good:true,reply:'病史與現況已記錄，準備進一步評估。'},{text:'沒看病人，只問他魚好不好吃',reply:'魚的味道可以晚點聊，先確認現在的狀況。'}]},{ask:'評估完成，團隊已安排適當處理。接下來？',options:[{text:'確認處理後狀況，交代後續注意事項並完成紀錄',good:true,reply:'病人：「下次不吃魚了。」\n你心想：這句話的有效期限，通常到下一餐。'},{text:'事情做完就走，紀錄與交代留到不知道哪一天',reply:'把這一件收好尾，下一位同事才接得上。'}]}]},
  blueberry:{title:'會診標題：藍莓',source:'1F 急診 · 柏宇醫師',patient:'兒童 · 吃藍莓後持續嗆咳，仍有呼吸症狀',tag:'需要到場',urgent:true,
    call:'小朋友吃藍莓後嗆咳，現在還在咳，呼吸也有聲音。請你到急診現場一起評估，我們正在照顧他。',
    phone:[{text:'確認現況、聯繫資深與相關團隊，到 1F 會合',dest:'f1',support:true,reply:'學長與相關團隊已聯繫，請到急診現場。'},{text:'直接請病人上 2G 再說',why:'這個情境仍有呼吸症狀，先到急診現場共同評估。'},{text:'因為是水果，就當作不需要處理',why:'物品名稱不能取代病況評估，先確認目前狀況。'}],
    intro:'柏宇：「會診單標題我先打了『藍莓』。」\n你：「我看到了。完整資訊，還是要靠你口頭補上。」',
    steps:[{ask:'現場團隊正在照顧病童，你要先做什麼？',options:[{text:'補齊嗆咳經過與現況，和團隊確認後續評估安排',good:true,reply:'學長到場，大家確認資訊與分工。'},{text:'只看當下沒再大哭，就認為事情結束',reply:'症狀與嗆咳經過仍要一起評估。'}]},{ask:'團隊已共同評估並接手後續處理。怎麼把會診交代清楚？',options:[{text:'確認後續安排與負責團隊，完成紀錄及交接',good:true,reply:'後續安排已交代。你看了一眼會診標題：果然只有兩個字。'},{text:'只把會診標題改長一點',reply:'標題可以改，實際安排也要交代清楚。'}]}]},
  nose:{title:'鼻血與一整包衛生紙',source:'1F 急診 · 柏宇醫師',patient:'陳先生 · 目前狀況穩定，鼻出血需要評估',tag:'一般會診',urgent:false,
    call:'鼻血會診，目前意識與生命徵象穩定。病人帶了一整包衛生紙，想請你評估一下。',
    phone:[{text:'補問出血狀況與病史，確認適合後安排到 2G',dest:'g2',reply:'資訊已補齊，病人安排到初診間。'},{text:'到 1F 急診看病人',dest:'f1',reply:'好，急診會診區見。'},{text:'衛生紙用得不多，應該不用看',why:'先依出血與病人狀況判斷，不能只用衛生紙的量下結論。'}],
    intro:'病人：「我剛剛有先捏鼻子。」\n小禾：「好，我們再確認一下你捏的位置和方式。」',
    steps:[{ask:'現在怎麼進行評估？',options:[{text:'確認出血狀況、相關病史與先前處理，再安排合適處置',good:true,reply:'資訊與檢查結果已整理，團隊進行合適處理。'},{text:'先研究這一包衛生紙是哪個品牌',reply:'備品的品牌可以之後聊，先看病人的狀況。'}]},{ask:'處理告一段落，接下來？',options:[{text:'再次確認狀況，交代後續並完成紀錄',good:true,reply:'桌上還有一整包備用衛生紙。\n你心想：這位病人的備品，比我的值班包還齊。'},{text:'只跟病人說「下次再來」',reply:'後續注意事項與處理結果，還是要交代完整。'}]}]},
  tonsil:{title:'扁桃腺術後出血',source:'7F 病房 · 可晴護理師',patient:'術後病童 · 吐出血，仍反覆吞嚥',tag:'需要及時到場',urgent:true,
    call:'醫師，扁桃腺術後的小朋友剛剛吐出血，現在還一直吞口水，請你快過來。',
    phone:[{text:'前往 7F 評估，同步聯繫學長與需要的團隊',dest:'f7',support:true,reply:'學長已聯繫，請到 7F23。'},{text:'吐出來的量不多，先延到晚一點',why:'這個情境仍有出血徵象，需要及時到場評估。'},{text:'請病人自己到 2G 等',why:'病人目前在病房有出血狀況，先到現場評估。'}],
    intro:'可晴：「病人在這裡，病歷在電腦可以看，學長也正在過來。」\n這一次，大家的聲音都很簡短。',
    steps:[{ask:'到病房後先如何與團隊配合？',options:[{text:'回報現況、共同評估並確認分工',good:true,support:true,reply:'學長與團隊完成現場安排，這位病人在本劇情中需要進一步刀房處理。'},{text:'沒有回報就自己做完所有事',reply:'把資訊和支援接起來，是這件事的重要部分。'}]},{ask:'團隊已安排刀房，接下來的目的地？',options:[{text:'搭 F 棟電梯到 5 樓，參與指定操作',good:true,action:'or',reply:'前往 F 棟 5 樓。這一段，團隊已在刀房準備。'},{text:'先跨到 G 棟五樓再走過去',reply:'F／G 五樓不相通，刀房要從 F 棟電梯到達。'}]}]},
  cockroach:{title:'耳朵裡的不速之客',source:'1F 急診 · 柏宇醫師',patient:'李先生 · 耳朵異物，初評狀況穩定',tag:'深夜會診',urgent:false,
    call:'耳朵異物會診，病人說是蟑螂。目前狀況穩定，確認能上樓的話，我們安排到初診間。',
    phone:[{text:'補齊資訊，安排病人到 2G 初診間',dest:'g2',reply:'小禾會協助接待。請到 2G。'},{text:'我下 1F 急診評估',dest:'f1',reply:'好，我們在急診等你。'},{text:'只說等白天，沒有釐清狀況',why:'先補齊目前狀況與經過，再決定處理安排。'}],
    intro:'病人：「牠還在動嗎？」\n小禾：「我們先確認位置和狀況，你頭先穩住。」',
    steps:[{ask:'現在先怎麼做？',options:[{text:'確認病史與耳部狀況，再安排合適處理',good:true,reply:'檢查資訊已整理，團隊完成適當處理。'},{text:'沒確認位置，就隨手拿器械找牠',reply:'先確認狀況與位置，再進行處理。'}]},{ask:'處理完成，還需要什麼？',options:[{text:'確認後續狀況，完成交代與紀錄',good:true,reply:'牠離開了耳朵，你離開了睡意。'},{text:'把所有時間都拿來替這位訪客取名字',reply:'名字先留著，把後續交代完整。'}]}]},
  airway:{title:'急氣切，現場會合',source:'1F 急診 · 柏宇醫師',patient:'急診病人 · 呼吸狀況變差，團隊在場',tag:'緊急會診',urgent:true,
    call:'ENT，急氣切會診。病人在急救區，呼吸狀況正在變差，麻醉團隊已經來了，請資深醫師一起到現場。',
    phone:[{text:'確認現況，立即聯繫學長並到 1F 會合',dest:'f1',support:true,reply:'學長正在過來，急診與麻醉團隊在現場等你。'},{text:'未確認病況就先請人送到五樓',why:'先到急診現場共同處理與評估安排，不先假設能夠轉送。'},{text:'沒有聯繫支援，直接獨自準備',why:'先把資深與相關團隊接上，確認現況與分工。'}],
    intro:'急診、麻醉和學長都在現場。\n沛庭醫師：「我們先把分工對清楚。」',
    steps:[{ask:'到場後先與團隊確認什麼？',options:[{text:'確認目前狀況、角色分工、器材與備援安排',good:true,support:true,reply:'分工確認完成，大家開始配合現場處理。'},{text:'大家各做各的，不交換資訊',reply:'先對齊目前狀況與分工，讓團隊一起工作。'}]},{ask:'團隊完成處置，後續如何交代？',options:[{text:'確認後續照護與負責團隊，完整記錄並交班',good:true,reply:'學長：「剛剛有把人找齊，做得好。後續我們一起交代清楚。」'},{text:'事情結束就離開，後續讓大家自己猜',reply:'把後續的照護與交接接好，這件事才算收尾。'}]}]}
};
export function createState(){return{started:false,ending:false,orAnesthesiaSaid:false,name:'小值',character:'male',temper:18,location:'f7',orRoom:null,phase:0,clock:440,energy:88,hunger:70,care:createSelfCare(),mode:'walk',accepted:false,activeDest:null,caseStep:0,caseMode:'patient',completed:[],eventErrors:{},run:null,nightWaitElapsed:0,wardCalls:{},morning:null,opening:null,pacing:null,log:[],food:createFoodState(),side:createSideActivities(),awaitingDesk:false,hearing:null,tubes:{},practiceTube:null,clinicNurseAway:true,clinicCallDeferred:false,wardNG:null,fish:null,hearingConsult:null,npx:null,npxPracticeCount:0,orLists:{},localOR:{},activeORProcedure:null,localPracticeCount:0,booking:null,bookingPracticeCount:0,contact:null,contactPracticeCount:0,stats:{trips:0,walked:0,woken:0,support:0,operations:0,retries:0,meals:0,restSeconds:0,stability:[]},sound:false,explore:false};}
export function fmt(min){const m=Math.floor(min)%1440;return`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;}
export function nextHop(graph,from,to){if(from===to)return null;const queue=[[from]];const seen=new Set([from]);while(queue.length){const p=queue.shift();for(const e of graph.edges){const n=e.from===p.at(-1)?e.to:e.bidirectional&&e.to===p.at(-1)?e.from:null;if(!n||seen.has(n))continue;const path=[...p,n];if(n===to){const first=graph.edges.find(edge=>edge.from===path[0]&&edge.to===path[1]||edge.bidirectional&&edge.to===path[0]&&edge.from===path[1]);return{next:path[1],mode:first.mode,path};}seen.add(n);queue.push(path);}}return null;}
