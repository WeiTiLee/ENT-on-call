import {createRun} from './event-deck.js';
import {NIGHT_WARD_IDS} from './night-ward-calls.js';
import {EVENTS,LOCAL_OR_IDS} from './event-pool.js';
import {MORNING_CASES,createMorning,printPatientList,visitPatient} from './morning-events.js';
import {createState,PHASES,LOCATIONS} from './ent-data.js';
import {orderFood,releaseORDrinks,collectFood} from './meal-breaks.js';

// The prototype's authoring link is separate from the normal player entry.
export const studioEnabled=params=>params.get('studio')==='1';
export const STUDIO_GROUPS=[
  {title:'白天事件',ids:['rounds','nasal-cleaning','outpatientPaperwork','outpatientNG','outpatientTrach','ng','sudden','booking','contact',...LOCAL_OR_IDS,'orSenior']},
  {title:'值班事件',ids:['fish','nose','tonsil','airway','blueberry','cockroach','lego','infantfish','bead','cotton','vertigo','otalgia','hoarse','trachcare','nasaltrauma',...NIGHT_WARD_IDS]},
  {title:'科內日常',ids:['lunchOrder','drink','takoyaki','popcorn','missinginfo']}
];
export const STUDIO_SCENES=[
  {id:'ward',label:'7F 病房',location:'f7'},
  {id:'clinic',label:'2G 初診間',location:'g2'},
  {id:'or-hall',label:'5F 刀房走廊',location:'f5'},
  {id:'or13',label:'13房',location:'f5',room:13},
  {id:'or16',label:'16房',location:'f5',room:16},
  {id:'ed',label:'1F 急診',location:'f1'},
  {id:'bridge',label:'7G 連通層／公告',location:'g7',spot:'bulletin'}
];
export const STUDIO_EGGS=[
  {id:'clinic-printer',label:'診間印表機',location:'g2',spot:'printer',activity:'printer'},
  {id:'ward-printer',label:'病房印表機',location:'f7',spot:'printer',activity:'printer'},
  {id:'tissue',label:'補衛生紙',location:'g2',spot:'tissue',activity:'tissue'},
  {id:'ward-leak',label:'護理站冷氣漏水',location:'f7',spot:'water',activity:'water'},
  {id:'or13-leak',label:'13房漏水',location:'f5',room:13,spot:'water',activity:'water'},
  {id:'or16-leak',label:'16房漏水',location:'f5',room:16,spot:'water',activity:'water'},
  {id:'password',label:'系統強制改密碼',location:'g2',spot:'desk',activity:'password'}
];
export const STUDIO_DINING_STATES=[['not-ordered','尚未訂飲料'],['waiting','已訂／尚未出房'],['ready','飲料可領取'],['collected','已領取'],['declined','今天不訂']];
const allCases={...EVENTS,...MORNING_CASES};
export function createStudioEvent(id,seed,{character='male',name='小值'}={}){
  const c=allCases[id];if(!c)throw new Error('找不到這個試玩事件');
  const morning=id==='rounds'||id==='nasal-cleaning',clock=morning?450:id==='lunchOrder'?990:id==='drink'||LOCAL_OR_IDS.includes(id)||id==='orSenior'?810:STUDIO_GROUPS[1].ids.includes(id)?1140:555;
  const s=createState();s.name=name;s.character=character;s.started=true;s.energy=100;s.hunger=100;s.temper=0;s.clock=clock;s.location=c.dest;
  const p={id,case:morning?undefined:id,kind:morning?'morning-work':id==='drink'?'studio-drink':'case',clock,title:c.title,description:'單項試玩；可按「直達下一步」跳到目前的互動位置。',dest:c.dest,spot:c.spot||'nurse',destination:'製作檢視 · '+c.title};
  const phases=id==='rounds'?[{...PHASES.find(p=>p.id==='morning')},p]:[p];
  if(morning){s.morning=createMorning(seed);if(id==='rounds')s.morning.escort='done';else{printPatientList(s.morning);for(const patient of s.morning.list)visitPatient(s.morning,patient.id);s.morning.focus='nasal';}}
  if(id==='drink'){s.orRoom=13;p.orRoom=13;}
  s.run={mode:'studio',studio:true,testId:id,seed,team:'',ids:[id],phases,total:1,maxScore:10,fingerprint:'STUDIO',categories:{}};
  return s;
}
export function createStudioDining(state,seed,profile={}){
  if(!STUDIO_DINING_STATES.some(([id])=>id===state))throw new Error('找不到這個餐廳狀態');
  const s=createState();Object.assign(s,profile,{started:true,explore:true,location:'f5',clock:850,energy:75,hunger:60,temper:30});
  s.run={mode:'studio',studio:true,testId:null,seed,team:'',ids:[],phases:[{id:'studio-dining',kind:'studio-scene',clock:850,dest:'f5',spot:'or-dining',title:'餐廳狀態檢視',description:'測試訂單的顯示與領取，沒有正式成績。',destination:'5F 刀房右側 · 餐廳'}],total:0,maxScore:0,fingerprint:'STUDIO',categories:{}};
  if(['waiting','ready','collected'].includes(state)){orderFood(s.food,'drink',{drink:true,drinkName:'無糖去冰茶'},s.clock);s.food.drinkResponded=true;if(state!=='waiting')releaseORDrinks(s.food,s.clock);if(state==='collected')collectFood(s.food,'drink',s.clock,'or');}
  if(state==='declined')s.food.drinkResponded=true;
  return s;
}
export function createStudioSandbox(target,seed,profile={}){
  if(!LOCATIONS[target.location]||target.room&&![13,16].includes(target.room))throw new Error('找不到這個檢視場景');
  const s=createStudioDining('not-ordered',seed,profile);s.location=target.location;s.orRoom=target.room||null;
  s.run.phases=[{id:'studio-scene',kind:'studio-scene',clock:s.clock,dest:s.location,spot:target.spot||(s.orRoom?'operation':'elevator'),title:target.label||'場景檢視',description:'自由檢視場景。可隨時從製作台選擇單一事件或彩蛋。',destination:'製作模式 · 不計正式成績'}];
  return s;
}

export function createStudioNightWait(seed,profile={}){
  const s=createStudioEvent('wardOrder',seed,profile),p=s.run.phases[0];s.clock=1445;s.location='g2';
  s.run.phases=[{...PHASES.find(p=>p.id==='sleep')},{...p,clock:1475}];s.run.nightPreview=true;
  return s;
}

export function createStudioConcurrent(seed,profile={}){
  const s=createStudioEvent('fish',seed,profile);s.location='g2';
  s.run.testId=null;s.run.concurrentPreview=true;s.run.ids=['fish','wardOrder','wardExtend'];s.run.total=3;s.run.maxScore=30;
  s.run.phases=s.run.ids.map((id,i)=>({...createStudioEvent(id,seed,profile).run.phases[0],clock:1140+i*6}));
  s.run.phases.push({...PHASES.find(p=>p.id==='finish')});return s;
}

export function createStudioShift(section,seed,profile={}){
  const run=createRun({seed}),s=createState();Object.assign(s,profile,{started:true,energy:100,hunger:100,temper:0,clock:section==='night'?1035:810,location:section==='night'?'g2':'f5'});
  const phases=run.phases.filter(p=>p.kind==='case'&&(section==='night'?p.clock>=1020:p.dest==='f5'));
  s.run={...run,mode:'studio',studio:true,concurrentPreview:true,testId:null,phases:[...phases,{...PHASES.find(p=>p.id==='finish')}],ids:phases.map(p=>p.id),total:phases.length,maxScore:phases.length*10};return s;
}
