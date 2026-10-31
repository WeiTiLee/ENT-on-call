import {NIGHT_WARD_IDS,NIGHT_REPEAT_IDS,WARD_ORDER_REQUESTS,nightCaseId} from './night-ward-calls.js';
import {EVENTS,EVENT_VERSION,CATEGORIES,OUTPATIENT_IDS,LOCAL_OR_IDS,OR_WORK_IDS,FIXED_ORDER_IDS} from './event-pool.js';
import {MORNING_IDS,MORNING_CASES} from './morning-events.js';
import {PHASES,LOCATIONS} from './ent-data.js';
import {operatingLabel} from './operating-plan.js';

export const PARTY_QUOTA={urgent:2,routine:5,odd:2,daily:3};
const DRAW_QUOTA={...PARTY_QUOTA,routine:1,daily:1};
export const TEAMS=['A','B','C'];
function hash(text){let h=2166136261;for(const c of text){h^=c.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function seededRandom(seed){let h=hash(String(seed));return()=>{h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};}
function shuffle(items,rng){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function orderedChoices(items,seed){return shuffle(items,seededRandom(seed));}
export function newSeed(){const a=new Uint32Array(1);crypto.getRandomValues(a);return'ENT-'+a[0].toString(36).toUpperCase().padStart(6,'0');}
export function normalizeSeed(value){return String(value||'').normalize('NFKC').trim().toUpperCase().slice(0,24)||'ENT-2026';}
const pool=category=>Object.keys(EVENTS).filter(id=>!OR_WORK_IDS.includes(id)&&!FIXED_ORDER_IDS.includes(id)&&!EVENTS[id].nightOnly&&EVENTS[id].category===category);
const pair=(a,b)=>[a,b].sort().join('');
// Prefer unused events, then balance overlap between pairs of teams.
export function partyDecks(seed){
  const rng=seededRandom(EVENT_VERSION+'|'+normalizeSeed(seed)),hands=TEAMS.map((_,i)=>[OUTPATIENT_IDS[(hash(normalizeSeed(seed))+i)%3]]),usage=new Map(OUTPATIENT_IDS.map(id=>[id,1])),overlap={AB:0,AC:0,BC:0};
  for(const [category,quota] of Object.entries(DRAW_QUOTA)){
    const ids=pool(category);
    for(let i=0;i<quota;i++)for(const team of shuffle([0,1,2],rng)){
      const candidates=shuffle(ids.filter(id=>!hands[team].includes(id)),rng);
      const cost=id=>{const counts={...overlap};for(let other=0;other<3;other++)if(other!==team&&hands[other].includes(id))counts[pair(TEAMS[team],TEAMS[other])]++;
        const values=Object.values(counts);return[(usage.get(id)||0),Math.max(...values),values.reduce((sum,n)=>sum+n*n,0)];};
      candidates.sort((a,b)=>{const x=cost(a),y=cost(b);return x[0]-y[0]||x[1]-y[1]||x[2]-y[2];});
      const chosen=candidates[0];for(let other=0;other<3;other++)if(other!==team&&hands[other].includes(chosen))overlap[pair(TEAMS[team],TEAMS[other])]++;
      hands[team].push(chosen);usage.set(chosen,(usage.get(chosen)||0)+1);
    }
  }
  return Object.fromEntries(TEAMS.map((team,i)=>[team,[...MORNING_IDS,hands[i][0],LOCAL_OR_IDS[(hash(normalizeSeed(seed)+'|or')+i)%3],...FIXED_ORDER_IDS,...shuffle(hands[i].slice(1),seededRandom(normalizeSeed(seed)+'|order|'+team))]]));
}
// Outpatient work opens the day; the senior's OR call belongs to the afternoon.
export function buildTimeline(ids,seed='NIGHT'){
  const phases=[{...PHASES.find(p=>p.id==='morning')},{id:'morning-work',kind:'morning-work',clock:450,title:'跟著主治，開始查房',description:'依 patient list 逐床查房。08:30 診間會通知門診工作，病房待辦會保留。',dest:'f7',spot:'nurse',destination:'7F 病房 · patient list'}];
  const outpatient=ids.find(id=>OUTPATIENT_IDS.includes(id));
  const orEvents=ids.filter(id=>OR_WORK_IDS.includes(id));
  const busy=ids.some(id=>NIGHT_REPEAT_IDS.includes(id));
  const rest=ids.filter(id=>!MORNING_IDS.includes(id)&&id!==outpatient&&!OR_WORK_IDS.includes(id)&&!FIXED_ORDER_IDS.includes(id)&&!EVENTS[nightCaseId(id)].nightOnly);
  const clinic=rest.filter(id=>EVENTS[id].category==='routine'||EVENTS[id].daytime),day=rest.filter(id=>EVENTS[id].category==='daily');
  const night=rest.filter(id=>!clinic.includes(id)&&!day.includes(id));
  const ward=ids.filter(id=>NIGHT_WARD_IDS.includes(nightCaseId(id))),rng=seededRandom(seed+'|night-timing'),jobs=Array(night.length+ward.length);
  if(busy){
    jobs[1]='wardConsent';const extensions=ward.filter(id=>nightCaseId(id)==='wardExtend');
    [Math.floor(jobs.length*.6),jobs.length-3,jobs.length-1].forEach((position,i)=>{if(extensions[i])jobs[position]=extensions[i];});
    const orders=ward.filter(id=>nightCaseId(id)==='wardOrder'),main=[...night];let useMain=true;
    for(let i=0;i<jobs.length;i++)if(!jobs[i]){jobs[i]=(useMain?main.shift()||orders.shift():orders.shift()||main.shift());useMain=!useMain;}
  }else{const positions=[1,Math.floor(jobs.length/2),jobs.length-2];ward.forEach((id,i)=>jobs[positions[i]]=id);let n=0;for(let i=0;i<jobs.length;i++)if(!jobs[i])jobs[i]=night[n++];}
  const nightCalls=busy?jobs.map((id,i)=>({id,clock:Math.round(1065+i*780/(jobs.length-1))})):ward.length?jobs.map((id,i)=>({id,clock:Math.round(1110+i*720/Math.max(1,jobs.length-1)+(i&&i<jobs.length-1?Math.round(rng()*12)-6:0))})):night.map((id,i)=>({id,clock:Math.round(1110+i*690/Math.max(1,night.length-1))}));
  const requests=shuffle(WARD_ORDER_REQUESTS,seededRandom(seed+'|ward-orders'));let requestIndex=0;
  const scheduled=[{id:outpatient,clock:510},...clinic.map((id,i)=>({id,clock:id==='booking'?690:555+i*35})),{id:'lunchOrder',clock:990},{id:'dinner-break',clock:1080},...day.map((id,i)=>({id,clock:930+i*35})),...orEvents.map((id,i)=>({id,clock:id==='orSenior'?813:810+i*40,...(id==='orSenior'?{afterCase:orEvents[0]}:{})})),...nightCalls].sort((a,b)=>a.clock-b.clock);
  let slept=false;
  for(const {id,clock,afterCase} of scheduled){
    if(!slept&&clock>=1445){phases.push({...PHASES.find(p=>p.id==='sleep')});slept=true;}
    if(id==='dinner-break'){phases.push({...PHASES.find(p=>p.id==='dinner')});continue;}
    const base=nightCaseId(id),c=EVENTS[base];phases.push({id,case:base,kind:'case',clock,...(afterCase?{afterCase}:{}),...(base==='wardOrder'?{requestId:requests[requestIndex++%requests.length].id}:{}),title:c.title,description:c.requiresDesk?'回到 2G 初診間工作桌，坐下後接聽別科病房的電話。':c.phoneOnly?'接聽並回覆這通電話，即可完成事件。':'先接電話，確認目的地與工作內容。',dest:c.dest,spot:c.spot,destination:c.phoneOnly?'電話回覆即可':c.dest==='f5'?operatingLabel(c.orRoom||16):LOCATIONS[c.dest].code+' · '+LOCATIONS[c.dest].name});
  }
  phases.push({...PHASES.find(p=>p.id==='finish')});return phases;
}
export function createRun({mode='random',seed,team='A'}={}){
  mode=mode==='party'?'party':'random';seed=normalizeSeed(seed||newSeed());team=TEAMS.includes(team)?team:'A';let ids;
  let orPlan=null;
  if(mode==='party')ids=partyDecks(seed)[team];
  else{const rng=seededRandom(seed),quota={urgent:3,routine:2,odd:3,daily:1};
    const first=OUTPATIENT_IDS[Math.floor(rng()*3)],local=shuffle(LOCAL_OR_IDS,rng);orPlan={kind:rng()<.5?'three-local':'local-and-16',ids:[]};orPlan.ids=orPlan.kind==='three-local'?local:[...local.slice(0,2),'orSenior'];ids=[...MORNING_IDS,first,...orPlan.ids,...FIXED_ORDER_IDS,...shuffle(Object.entries(quota).flatMap(([category,size])=>shuffle(pool(category).filter(id=>id!==first),rng).slice(0,size)),rng),...NIGHT_WARD_IDS,...NIGHT_REPEAT_IDS];}
  return{mode,seed,orPlan,team:mode==='party'?team:'',ids,phases:buildTimeline(ids,seed),total:ids.length,maxScore:ids.length*10,fingerprint:hash(EVENT_VERSION+'|'+seed+'|'+team+'|'+ids.join(',')).toString(16).toUpperCase().padStart(8,'0'),categories:Object.fromEntries(Object.keys(CATEGORIES).map(c=>[c,ids.filter(id=>(EVENTS[nightCaseId(id)]||MORNING_CASES[id]).category===c).length]))};
}
export function eventPoints(id,errors={}){return Math.max(0,10-2*(errors[id]||0));}
export function resultScore(completed,errors={}){return[...new Set(completed)].reduce((sum,id)=>sum+eventPoints(id,errors),0);}

