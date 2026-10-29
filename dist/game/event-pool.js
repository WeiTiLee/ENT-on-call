import {FISH_EVENT} from './fish-case.js';
import {NIGHT_WARD_EVENTS} from './night-ward-calls.js';
import {CASES as ORIGINAL_CASES} from './ent-data.js';

export const EVENT_VERSION='15';
export const FIXED_ORDER_IDS=['lunchOrder','drink'];
export const CATEGORIES={urgent:'緊急／時效性會診',routine:'門診與一般工作',odd:'特殊與荒謬情境',daily:'科內日常'};
const step=(ask,text,reply,bad,why,extra={})=>({ask,options:[{text,reply,good:true,...extra},{text:bad,reply:why}]});
const clinicSource='1F 急診 · 柏宇醫師';
function medical({title,category='routine',dest='g2',spot='patient',source=clinicSource,patient,call,intro,phoneText,phoneBad,phoneWhy,steps,brief}){
  return{title,category,dest,spot,source,patient,call,intro,steps,brief,tag:CATEGORIES[category],urgent:category==='urgent',
    phone:[{text:phoneText||'補齊病況與經過，確認地點後到場評估',dest,reply:'資訊已補齊，請到 '+({g2:'2G 初診間',f1:'1F 急診',f7:'7F 病房'}[dest]||dest)+'。',support:category==='urgent'},
      {text:phoneBad,why:phoneWhy},{text:'沒有確認病況，只回「晚點再說」',why:'先問清楚目前病況、地點與聯絡方式，再安排處理。'}]};
}
function daily({title,dest='g2',spot='desk',source='2G 初診間 · 小禾',call,intro,steps=[],phoneOnly=false,phone,effect={},brief,orRoom}){
  return{title,category:'daily',dest,spot,source,orRoom,patient:'值班中的小事',tag:'科內日常',urgent:false,call,intro,steps,phoneOnly,effect,brief,
    phone:phone||[{text:'好，我過去看看。',dest,reply:'東西和現場都留給你了。'},{text:'先釐清狀況，安排空檔處理。',dest,reply:'小禾：「好，我先等你。」'}]};
}
function outpatient(data){return{...data,category:'routine',dest:'g2',spot:data.spot||'patient',outpatient:true,daytime:true,source:'2G 初診間 · 小禾護理師',tag:'門診工作',urgent:false,
  phone:[{text:'拋下病房病人，直接下樓',dest:'g2',outpatientAction:'leave',reply:'你先往樓下走。未完成的查房與清鼻子，仍留在病房待辦。'},{text:'請病人稍等一下，我先查完房再下樓',dest:'g2',outpatientAction:'finish-rounds',reply:'小禾：「好，我先請病人等一下，你查完房再下來。」'},{text:'直接掛電話',dest:'g2',outpatientAction:'hangup',reply:'你掛掉電話。過了一下，診間的分機又打來了。'}]};}
const categoryOf={fish:'routine',blueberry:'urgent',nose:'routine',tonsil:'urgent',cockroach:'odd',airway:'urgent'};
const destOf={fish:'g2',blueberry:'f1',nose:'g2',tonsil:'f7',cockroach:'g2',airway:'f1'};
const briefOf={fish:'魚刺、病史與最後一餐的誓言。',blueberry:'會診單只有兩個字，呼吸狀況不能只看標題。',nose:'衛生紙的量不能代替完整評估。',tonsil:'術後出血到場評估，接上學長與刀房。',cockroach:'耳朵裡的不速之客，取出後睡意也不見了。',airway:'急診、麻醉與學長共同到場，確認分工。'};
export const EVENTS={
  ...NIGHT_WARD_EVENTS,
  ...Object.fromEntries(Object.entries(ORIGINAL_CASES).map(([id,c])=>[id,{...c,category:categoryOf[id],dest:destOf[id],spot:'patient',orRoom:['tonsil','airway'].includes(id)?16:undefined,brief:briefOf[id]}])),
  fish:FISH_EVENT,
  sudden:medical({title:'病房會診：突然聽不到',category:'urgent',dest:'g2',source:'院內病房 · 病房護理師',patient:'成人 · 突然出現單側聽力下降',
    call:'病人說聽不清楚，目前狀況穩定，想請 ENT 評估。發作時間與左／右／雙耳還需要問清楚。',
    phoneText:'問清發作時間與左／右／雙耳，請原病房聯絡聽力室儘速安排聽檢',phoneBad:'當作耳屎，直接排下個月門診',phoneWhy:'突然聽力下降要及時評估，不能未檢查就當成耳屎。',
    intro:'病人：「鬧鐘沒壞，我另一邊耳朵聽得到。」\n你心想：這次真的不是鬧鐘的問題。',
    brief:'病房安排聽檢，聽力室通知後叫病人進來；依聽力圖與耳鏡發現，接續突發性聽損或耳垢情境。',
    steps:[step('先補哪些資訊？','確認發作時間、左右側、伴隨症狀並安排檢查','資訊已整理，接上學長與聽力評估。','只把手機音量調到最大測試','音量不能代替適當檢查。'),
      step('團隊安排下一步後，怎麼交代？','說明評估安排、後續追蹤與需及時回報的變化','病人：「原來不是忍一忍就好。」\n你心想：今天要把時間問清楚的，不只下班時間。','只說「多睡一覺再看看」','先完成適當評估與明確後續安排。')]}),
  vertigo:medical({title:'房間在轉，我沒有',dest:'f1',patient:'成人 · 持續眩暈，尚待現場評估',
    call:'病人說整個房間在轉，還有噁心。請一起到急診評估，還沒確認原因。',
    phoneBad:'只聽到眩暈，就直接當成耳石問題',phoneWhy:'先確認時序、現況與伴隨症狀，不憑眩暈兩字下結論。',
    intro:'病人：「整間都在轉。」\n柏宇：「我們醫院今天沒有開旋轉餐廳。」',
    brief:'眩暈先釐清時序與伴隨症狀，不搶著貼診斷。',
    steps:[step('現場怎麼開始？','確認症狀時序、神經症狀與目前狀況，和急診分工評估','資訊補齊，團隊安排合適評估。','沒問伴隨症狀就先做固定處置','不同原因的眩暈要先分辨現況。'),
      step('病人仍不穩，接下來？','協助安全照護、避免跌倒，確認後續負責團隊','病人坐穩了，你的待辦清單還在轉。','請他自己走一圈證明有沒有好','先顧安全，再依評估安排後續。')]}),
  ng:medical({title:'NG 放不進去的病房會診',source:'院內病房 · 病房護理師',patient:'病房病人 · NG 放置困難，現況穩定',
    call:'ENT 醫師你好，這裡是病房。病人的 NG 放不進去，目前狀況穩定，想請你協助評估。',
    phoneBad:'什麼都不問，叫當科自己再試試看',phoneWhy:'先確認需求、既往病史與已做過的嘗試，再決定安排。',
    intro:'病人已到初診間，原病房的會診與病歷在線上系統查看。\n你先核對身分，再看這次放置困難的經過。',
    brief:'接聽 8G 胸腔科、12F 腫瘤科或 8F 感染科來電，問清先前嘗試與頭頸癌病史；安排到 2G，完成後回覆原病房。',
    steps:[step('先確認什麼？','確認適應需求、相關病史、既往嘗試與團隊支援','團隊了解現況，安排合適協助。','把上一次失敗的方式無限重播','先評估困難原因與支援安排。'),
      step('團隊完成放置後，能直接使用嗎？','依院內流程完成位置確認、記錄與交接後再安排使用','位置確認與紀錄整理完成，回到工作桌回覆原病房。','只因為病人沒有咳嗽就說可以用了','沒有咳嗽不能代替位置確認。')]}),
  otalgia:medical({title:'耳朵痛，棉花棒不是解答',patient:'成人 · 耳痛，初評狀況穩定',
    call:'病人耳朵痛，說最近常自己清耳朵。現在穩定，想請 ENT 評估。',
    phoneBad:'還沒看過，就建議再用力挖一下',phoneWhy:'先確認疼痛與相關病史，不能未檢查就叫病人自行處理。',
    intro:'病人：「我很愛乾淨，每天都挖。」\n你心想：耳朵可能希望你少一點勤勞。',
    brief:'耳痛與自我清耳史，先檢查再決定處理。',
    steps:[step('到診後先做什麼？','問清症狀、清耳方式與相關狀況，再檢查耳部','檢查結果與病史整理完成。','先比賽誰的棉花棒比較長','器具長度不是評估重點。'),
      step('評估完成，怎麼收尾？','交代適當照護、追蹤與需要再回報的變化','病人：「所以今天先不要再挖？」\n你終於覺得這通有被聽進去。','只把棉花棒換成別的尖東西','先提供合適照護與追蹤安排。')]}),
  hoarse:medical({title:'聲音沙啞，不是麥克風壞了',patient:'成人 · 聲音沙啞，呼吸平順',
    call:'病人聲音沙啞一段時間，呼吸目前平順，請 ENT 評估。',
    phoneBad:'只聽聲音就說是唱歌唱太多',phoneWhy:'聲音變化仍需釐清時序與相關病史。',
    intro:'病人：「我只是昨天唱比較久。」\n小禾：「比較久是到幾點？」\n病人：「早餐時間。」',
    brief:'沙啞的時序與伴隨症狀，別只把鍋推給 KTV。',
    steps:[step('先釐清哪些資訊？','確認持續時間、伴隨症狀與相關病史，再安排評估','病人終於把「一陣子」換成了日期。','直接用一句「休息就好」結束','先完成病史與合適評估。'),
      step('團隊完成評估後？','說明照護與追蹤安排，交代若出現新狀況如何求助','你心想：今晚自己的聲帶，也想申請休息。','先幫他報名下一場歌唱比賽','後續照護與追蹤先交代清楚。')]}),
  trachcare:medical({title:'氣切照護，先把基準問清楚',dest:'f7',source:'7F 病房 · 可晴護理師',patient:'已知氣切病人 · 現況穩定，痰量較平常增加',
    call:'氣切病人痰比平常多，目前呼吸與監測數值穩定。想請你到場評估，原本照護紀錄在電子病歷可以看。',
    phoneBad:'沒看目前狀況，就只照昨天的紀錄處理',phoneWhy:'先確認現在與原本的差異，再到場共同評估。',
    intro:'可晴：「昨天跟今天的照護紀錄，電子病歷裡都看得到。」\n你心想：有人把前情提要整理好，真的很重要。',
    brief:'比較平常與現在的差異，確認照護、支援與交接。',
    steps:[step('床邊先和護理師確認什麼？','確認呼吸現況、基準差異、照護紀錄與需要的支援','團隊依現況完成評估與照護安排。','只看痰的顏色就決定全部處理','現況與整體評估不能省略。'),
      step('後續怎麼接好？','交代監測重點、負責團隊與狀況變化時的回報方式','可晴：「這樣下一班就接得上了。」','事情做完，回報方式讓大家自行猜測','明確交代何時及向誰回報。')]}),
  nasaltrauma:medical({title:'鼻子撞到了，先別急著拍照',patient:'成人 · 撞傷鼻部，現況穩定',
    call:'病人撞到鼻子，外觀腫、覺得鼻塞，目前穩定。想請 ENT 評估。',
    phoneBad:'只憑自拍照就決定沒有問題',phoneWhy:'外觀照片不能代替病史與適當檢查。',
    intro:'病人：「我先給你看撞之前的照片。」\n你：「好，也先告訴我怎麼撞的。」',
    brief:'鼻部外傷釐清經過與症狀，外觀不是全部。',
    steps:[step('開始評估時要做什麼？','確認受傷經過、相關症狀並安排合適檢查','病史與檢查結果已整理。','只比較撞前撞後的照片哪張好看','先處理病人的受傷狀況。'),
      step('後續安排好了，怎麼交代？','說明處理結果、追蹤時間及需及時回報的變化','病人放下手機。你也希望待辦能跟著放下。','只說「消腫再說」，沒有任何安排','後續照護與追蹤要說清楚。')]}),
  infantfish:medical({title:'六個月？你說的是月？',category:'odd',dest:'f1',patient:'六個月嬰兒 · 家長說吃魚後擔心異物，現在呼吸平順',
    call:'家長說六個月的小朋友吃過魚，現在擔心有異物。請到急診一起評估，月齡已再確認，目前呼吸平順。',
    phoneText:'確認月齡、進食經過與現況，到 1F 和團隊評估',phoneBad:'只顧驚訝月齡，忘了問病況',phoneWhy:'月齡讓你驚訝，評估仍要依經過與現在狀況進行。',
    intro:'你：「六個月？」\n柏宇：「對，我也問了兩次。」\n你心想：先把嘴巴合起來，病史還沒問完。',
    brief:'科內熟悉的震驚開場，仍按現況認真評估。',
    steps:[step('見到家長後先確認什麼？','問清食物、時間、嗆咳與其他症狀，和團隊評估','細節已補齊，團隊安排後續。','把所有時間拿來評論怎麼會吃魚','先把嬰兒的評估與照護接好。'),
      step('安排完成後，如何回覆家長？','清楚說明後續安排與需回報的變化，不以玩笑取代交代','你把「幾個月」寫進紀錄，確認自己真的沒有聽錯。','只留下一句「太扯了」就走','驚訝留在內心，照護交代完整。')]}),
  lego:medical({title:'鼻孔裡的樂高，不是新套件',category:'odd',spot:'patient2',patient:'兒童 · 家長確認為塑膠玩具，初評穩定',
    call:'小朋友鼻孔有塑膠玩具，目前穩定。家長帶了同款零件，請 ENT 評估。',
    phoneBad:'沒有確認物品種類就叫家長自己挖',phoneWhy:'先確認物品、現況與位置，避免盲目嘗試。',
    intro:'家長：「我帶了一模一樣的。」\n小禾：「很好，這個比會診單畫得清楚。」',
    brief:'同款零件是線索，先確認種類與位置再處理。',
    steps:[step('處理前先確認什麼？','確認物品來源、數量與是否可能為電池或磁鐵，檢查後安排處理','種類與現況已確認，團隊完成適當處理。','直接把另一個零件也塞進去比較','不要增加異物，先把現況評估清楚。'),
      step('處理完成後，還要做什麼？','確認後續狀況與照護安排，向家長說清楚','你心想：這套積木的鼻孔擴充包，今天先下架。','只問他下一個想組哪一款','先完成照護交代。')]}),
  bead:medical({title:'耳朵不是珠寶盒',category:'odd',patient:'兒童 · 塑膠珠珠入耳，初評穩定',
    call:'小朋友說把珠珠放進耳朵。目前穩定，家長帶了材料袋，請 ENT 評估。',
    phoneBad:'沒看位置，先讓他跳一跳就算處理完',phoneWhy:'先確認物品、位置與耳部狀況。',
    intro:'病童：「因為它剛剛好。」\n你心想：尺寸剛好，真的不是放進去的理由。',
    brief:'手作材料變耳部異物，讓孩子配合比猜顏色重要。',
    steps:[step('要怎麼開始？','確認物品與耳部狀況，協助孩子配合，再安排適當處理','材料種類與位置確認，團隊完成處理。','先和孩子猜哪個顏色比較漂亮','先把評估與配合方式接好。'),
      step('收尾要交代什麼？','確認處理後狀況與後續照護，向家長說明','珠珠回到袋子。耳朵維持原廠設定。','只把珠珠包起來當紀念品','紀念品之前，先完成後續交代。')]}),
  cotton:medical({title:'棉花棒只出來半支',category:'odd',patient:'成人 · 清耳後懷疑棉花遺留，初評穩定',
    call:'病人清耳後發現棉花棒少了一端，現在穩定。想請 ENT 檢查。',
    phoneBad:'叫他再塞一支，把前一支找出來',phoneWhy:'不要再增加器具或異物，先檢查目前狀況。',
    intro:'病人：「我沒有很用力。」\n小禾：「先把剩下那半支給我們看。」',
    brief:'半支棉花棒是線索，不要讓第二支也失蹤。',
    steps:[step('現場先怎麼做？','確認清耳經過與耳部狀況，檢查後再安排處理','團隊確認現況並完成適當處理。','拿第二支棉花棒盲找第一支','先看清楚，再安排合適處理。'),
      step('怎麼完成這件會診？','確認後續狀況、照護與紀錄','棉花棒恢復完整，你的睡眠還沒有。','只替棉花棒拍重逢照','先完成後續照護交代。')]}),
  outpatientPaperwork:outpatient({title:'樓下門診有殘冊要算',spot:'desk',patient:'門診 · 聽障鑑定文件',
    call:'醫師，樓下門診有聽障殘冊要請你幫忙算，資料已經備好了，麻煩來 2G 初診間。',
    intro:'小禾把鑑定文件放到桌上。你把查房名單收好，在電腦開啟線上聽力圖。',
    brief:'08:30 門診工作：核對聽力資料與文件。',
    steps:[step('開始處理殘冊前，先確認什麼？','核對病人、聽力資料與文件是否齊全，再依院內流程計算','資料核對後，進入四頻讀值、計算與 b230 分級，交給診間護理師才完成。','還沒看資料，就直接幫所有欄位打勾','先核對資料，再處理文件。')]}),
  outpatientTrach:outpatient({title:'樓下門診有氣切管要換',patient:'門診 · 預約更換氣切管，現況穩定',
    call:'醫師，樓下門診有預約換氣切管的病人。氣切管跟掛號單放診間桌上了，麻煩按單上的名字叫進來。',
    intro:'小禾：「氣切管跟掛號單放桌上了，麻煩按單上的名字叫病人進來。」',
    brief:'08:30 門診工作：預約更換氣切管。',
    steps:[step('更換前先確認什麼？','核對身分、目前狀況、原管資料及器材，確認支援安排後處理','依院內流程完成更換，確認處理後狀況並留下紀錄。','不確認管子與現況，拿到哪支就換哪支','先把人、管子、器材與支援確認清楚。')]}),
  outpatientNG:outpatient({title:'樓下門診有鼻胃管要換',patient:'門診 · 預約更換鼻胃管，現況穩定',
    call:'醫師，樓下門診有預約換鼻胃管的病人。NG 跟掛號單放診間桌上了，麻煩按單上的名字叫進來。',
    intro:'小禾：「NG 跟掛號單放桌上了，麻煩按單上的名字叫病人進來。」',
    brief:'08:30 門診工作：預約更換鼻胃管。',
    steps:[step('開始更換前，先確認什麼？','核對身分、換管需求與相關病史，完成後依院內流程確認位置及交代','換管與位置確認流程完成，紀錄及後續照護已交代。','沒確認資料，放完就直接說可以使用','核對資料、位置確認與交接都要接好。')] }),
  booking:{...daily({title:'主治來電：幫我排一台刀',dest:'g2',spot:'desk',source:'2G 門診 · 主治醫師',
    call:'幫我排一台刀，病人、手術和時間我跟你說。記下來，到初診間電腦送出排刀申請，把單子放桌上，護理師會再跟病人核對。',
    intro:'主治的電話交代留在便條上。先核對病人、手術與主治醫師，再找指定時段的空位。',
    brief:'上午主治來電：記下交代，到初診間電腦核對病人、手術、主治與空位，送出排刀申請後把單子放桌上，護理師再跟病人核對。',
    phone:[{text:'記下病人、術式與時段，回電腦完成排刀申請',dest:'g2',reply:'主治：「排好把單子放桌上，護理師會再跟病人核對，謝謝。」'}],
    steps:[step('送出前核對什麼？','核對病人、手術、主治與指定時段，送出後將單子放桌上','排刀申請已登記，單子已放桌上。','還沒看名字就隨便排一格','先把電話交代與系統資料逐項對好。')]}),category:'routine',daytime:true,tag:'門診工作'},
  contact:{...daily({title:'主治來電：幫我打個電話',dest:'g2',spot:'clinic-phone',source:'門診 · 主治醫師',
    call:'幫我聯絡一位醫師，病人和要問的事情我跟你說。電話單在初診間工作桌上。',intro:'先看主治的便條，再翻桌上的電話單，找對醫師與院內簡碼。',brief:'隨機請託：影像科看片、整形外科 combine、牙科評估；查電話單、撥簡碼，再轉達病人與事項。',
    phone:[{text:'記下聯絡對象、病人與事項，回桌邊查電話單',dest:'g2',reply:'主治：「電話單在桌上，謝謝。」'}],
    steps:[step('這通電話要找誰、說什麼？','核對科別、醫師與簡碼，接通後轉達正確病人及事項','對方已收到請託。','隨便找個同姓醫師就講','先對照便條與電話單。')]}),category:'routine',daytime:true,tag:'主治交代的工作'},
  drink:{...daily({title:'流動問：要不要訂飲料？',dest:'f5',spot:'or-team-circulator',source:'刀房 · 流動',phoneOnly:true,call:'流動：「要不要一起訂飲料？出房後到右邊餐廳拿，別忙到忘了。」',brief:'進入刀房後由流動詢問；可選擇訂或不訂，出房後到右側餐廳領取。',
    phone:[{text:'無糖去冰，謝謝。',dest:'f5',reply:'流動：「無糖去冰，出房後去右邊餐廳拿。」',effect:{drink:true,drinkName:'無糖去冰茶'}},{text:'微糖少冰，今天需要一點甜。',dest:'f5',reply:'流動：「微糖少冰，幫你記了。出房到右邊餐廳拿。」',effect:{drink:true,drinkName:'微糖少冰茶'}},{text:'幫我留瓶水就好，謝謝。',dest:'f5',reply:'流動：「好，出房到右邊餐廳拿水。」',effect:{drink:true,drinkName:'瓶裝水'}},{text:'今天先不訂，謝謝。',dest:'f5',reply:'流動：「好，那我先送單了。」'}]}),trigger:'or-entry'},
  takoyaki:daily({title:'章魚燒到了，現在還是熱的',dest:'f7',spot:'nurse',source:'7F 病房 · 可晴護理師',phoneOnly:true,call:'章魚燒到了，要幫你留一盒嗎？溫度我只能先幫你顧到這裡。',brief:'留一盒章魚燒，回護理站才有吃到的機會。',
    phone:[{text:'幫我留一盒，我找空檔回去。',dest:'f7',reply:'可晴：「有幫你留，溫度沒有辦法一起留。」',effect:{meal:true}},{text:'這次先不用留，謝謝。',dest:'f7',reply:'可晴：「好，先忙完手邊的事。」'}]}),
  popcorn:daily({title:'爆米花口味投票',dest:'f7',source:'7F 病房 · 可晴護理師',phoneOnly:true,call:'醫師，團購爆米花！芥末、焦糖、烏龍茶、巧克力，這次要哪一種？',brief:'芥末、焦糖、烏龍茶、巧克力；口味選擇比今日空檔多。',
    phone:[...['芥末','焦糖','烏龍茶','巧克力'].map(flavor=>({text:flavor+'，謝謝。',dest:'f7',reply:'可晴：「'+flavor+'，幫你登記好了，到貨再通知。」',effect:{popcorn:true}})),{text:'這次先不跟，先忙手邊的事。',dest:'f7',reply:'可晴：「好，有需要下次再跟。」'}]}),
  orassist:daily({title:'13 號刀房：NPX biopsy',dest:'f5',spot:'operation',orRoom:13,source:'5F · 13房流動',call:'這裡是 13 房流動，你的 NPX biopsy 準備好了，請到 13 號刀房。需要協助可以到 16 房找學長。記得搭 F 棟電梯，五樓不能跨棟。',
    intro:'流動：「這台是 NPX biopsy，資料在這裡。」\n刷手：「要器械再跟我說。」',brief:'13房 NPX biopsy：鋪單、packing、找病灶、向刷手拿 biopsy cup，完成取樣、止血及檢體交接。',
    phone:[{text:'收到，確認是 13 房的 NPX biopsy，我現在過去。',dest:'f5',reply:'流動：「對，13 房，我們準備好了。」'},{text:'先把手邊病人安頓好，再上 13 房。',dest:'f5',reply:'流動：「好，請到 13 房，這台是 NPX biopsy。」'}],
    steps:[step('先確認這一台的資料','核對病人與 NPX biopsy 工作內容，再開始','核對後接續鋪單、packing、找病灶與器械交接。','還沒確認就開始拿器械','先把這一台的病人與工作對好。')]}),
  lunchOrder:daily({title:'晚餐便當，要訂哪一個？',dest:'f7',spot:'nurse',source:'7F 病房 · 可晴護理師',phoneOnly:true,call:'醫師，晚餐便當要收單了！正式值班前先幫你訂。你要雞腿、排骨還是蔬食？18:00 後放護理站，記得來吃。',brief:'16:30 病房固定來電訂晚餐，18:00 後到護理站領取。',
    phone:['雞腿','排骨','蔬食'].map(flavor=>({text:flavor+'便當，謝謝。',dest:'f7',reply:'可晴：「'+flavor+'便當，記好了。18:00 後放護理站，先吃飽再忙。」',effect:{meal:true,mealName:flavor+'便當'}}))}),
  missinginfo:daily({title:'會診內容只有：ENT',source:'院內分機 · 尚待確認',phoneOnly:true,call:'喂，ENT 嗎？這邊有一個……欸等一下。',brief:'先把來電地點、病況與回撥方式問回來。',
    phone:[{text:'確認來電單位、病人現況、問題與回撥分機。',dest:'g2',reply:'資訊終於補齊，已聯絡正確負責團隊。\n你心想：完整的會診，有時候要從重新認識彼此開始。'},{text:'猜一個樓層，直接出發。',why:'地點與狀況都不清楚，先釐清再安排。'},{text:'只回「我就是」，然後一起沉默。',why:'先問清單位、現況、問題與聯絡方式。'}]})
};


const localCall=(kind,name)=>({...EVENTS.orassist,localProcedure:kind,title:'13 號刀房：'+name,patient:'13房 · '+name,call:'這裡是13房流動，你的'+name+'準備好了，請到13房。需要協助可以到16房找學長。',intro:'流動：「這台是'+name+'，資料在這裡。」',brief:kind==='ear'?'噴local、鋪單、確認前下方、向刷手拿注射器，完成注射、交代並休息10分鐘。':'戴頭燈、鋪單、找病灶、局部麻醉、向刷手拿器械，完成取樣、電燒止血及檢體交接。',phone:[{text:'收到，確認是13房的'+name+'，我現在過去。',dest:'f5',reply:'流動：「對，13房，資料和用品都準備好了。」'},{text:'先把手邊病人安頓好，再上13房。',dest:'f5',reply:'流動：「好，請到13房，這台是'+name+'。」'}],category:'routine',tag:'下午刀房工作'});
EVENTS.orassist.localProcedure='npx';EVENTS.orEar=localCall('ear','耳內注射');EVENTS.orOral=localCall('oral','Oral biopsy');
export const LOCAL_OR_IDS=['orassist','orEar','orOral'];
export const OUTPATIENT_IDS=['outpatientPaperwork','outpatientTrach','outpatientNG'];
EVENTS.orassist.category='routine';EVENTS.orassist.tag='下午刀房工作';
EVENTS.sudden.requiresDesk=true;EVENTS.sudden.daytime=true;EVENTS.ng.requiresDesk=true;EVENTS.missinginfo.requiresDesk=true;
for(const id of ['ng','trachcare'])EVENTS[id].daytime=true;

EVENTS.outpatientPaperwork.spot='desk';EVENTS.outpatientPaperwork.brief='讀取左右耳四頻聽力、計算障礙比率，選好 b230 分級後交給診間護理師。';

// This is help with an ongoing case in room 16, including after the anaesthesia cutoff.
EVENTS.orSenior={...EVENTS.orassist,title:'16房學長：過來幫我一下',orRoom:16,localProcedure:undefined,source:'5F · 16房流動',patient:'周映彤 · 正在進行中的扁桃腺手術',call:'這裡是16房流動。學長說等你13房這台收好，過來幫忙拉鉤、抽吸，這台還沒結束。',intro:'學長：「13房那台收好了？來，幫我把視野顧一下。」\n刷手：「要器械跟我說。」',brief:'完成一台13房手術後，流動通知到16房，接上學長正在進行的手術並協助操作。',phone:[{text:'13房這台已收好，我過去16房。',dest:'f5',reply:'流動：「好，是16房，這台還在進行。」'},{text:'收到16房，我先把手邊工作交代好。',dest:'f5',reply:'流動：「學長在16房等你，先把手邊病人安頓好。」'}],steps:[step('進16房，先接哪一段？','核對正在進行的手術與學長交代，再協助視野','學長：「幫我拉鉤、抽吸，慢慢來。」','沒確認就拿器械往前衝','先問清楚這一台目前進度與需要協助的工作。')]};
EVENTS.orSenior.steps[0].options.find(o=>o.good).action='or';
export const OR_WORK_IDS=[...LOCAL_OR_IDS,'orSenior'];
