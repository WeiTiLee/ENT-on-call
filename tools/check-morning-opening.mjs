import assert from 'node:assert/strict';
import {createMorningOpening,monthlyConferences,conferencePreviewDate,calendarToday,calendarEntry,calendarCells,checkMorningCalendar,openingTarget,conferencePaper,CONFERENCE_TYPES,CONFERENCE_PAPERS,beginConference,nextConferenceSlide,answerConference,inDiscussionRoom,tickConference,conferenceCall,openingClockRate} from '../dist/game/morning-opening.js';
import {calendarHTML,paperSlideHTML} from '../dist/game/morning-opening-ui.js';
import {WARD_PLAN,wardRect} from '../dist/game/ward-plan.js';
import {perimeterApproaches,spotDistance,sortedApproaches} from '../dist/game/interaction-points.js';
const today='2026-10-30',variants=new Set(),types=new Set(),papers=new Set(),reported=new Set();
for(let i=0;i<180;i++){
 const seed='CALENDAR-'+i,o=createMorningOpening(seed,{today});variants.add(o.conference);types.add(o.type);papers.add(o.paperId);assert.deepEqual(o,createMorningOpening(seed,{today}));assert.equal(openingTarget(o).spot,'computer');assert(!o.checked);assert(!beginConference(o,450));assert(!answerConference(o,0));
 assert(checkMorningCalendar(o));assert(!checkMorningCalendar(o));assert.equal(calendarEntry(o,today)?.id,o.conference?o.type:undefined);
 if(o.conference){assert.equal(openingTarget(o).spot,'conference');assert(!beginConference(o,449));assert.deepEqual(tickConference(o,449,{present:true}),[]);assert.deepEqual(tickConference(o,450,{present:true}),[]);assert.equal(o.attendance,'on-time');assert(beginConference(o,450));assert(!beginConference(o,450));
  const paper=conferencePaper(o);reported.add(paper.id);assert.equal(paper.slides.length,3);for(let j=0;j<3;j++){assert.equal(o.slide,j);assert(paperSlideHTML(o).includes('科內虛構'));assert(nextConferenceSlide(o));}assert.equal(o.stage,'questions');assert(!nextConferenceSlide(o));assert(!answerConference(o,1));assert.equal(o.question,0);assert.equal(o.mistakes,1);assert(answerConference(o,0));o.focused=false;assert.equal(openingTarget(o),null);o.focused=true;assert.equal(o.question,1);assert(answerConference(o,0));assert.equal(o.stage,'done');assert(!o.focused);assert(!answerConference(o,0));assert.deepEqual(tickConference(o,500),[]);
 }else{assert.equal(o.stage,'done');assert(!beginConference(o,450));assert.deepEqual(tickConference(o,500),[]);}assert.equal(openingTarget(o),null);
}
assert.equal(variants.size,2);assert.equal(types.size,4);assert.equal(papers.size,5);assert.equal(reported.size,5);assert.equal(CONFERENCE_TYPES.length,4);assert.equal(CONFERENCE_PAPERS.length,5);
for(const iso of ['2026-02-15','2024-02-29','2026-12-31','2027-01-01']){const [year,month]=iso.split('-').map(Number),cells=calendarCells(year,month-1);assert.equal(cells.length,42);assert.equal(new Set(cells.map(d=>d.date)).size,42);assert(cells.some(d=>d.date===iso));assert.equal(new Date(cells[0].date+'T12:00:00Z').getUTCDay(),0);}
assert.equal(calendarToday(new Date('2026-10-30T16:30:00Z')),'2026-10-31');
const counts=new Set(),novemberPlans=new Set();
for(let i=0;i<480;i++){
 const year=2024+Math.floor(i/120),month=String(i%12+1).padStart(2,'0'),monthKey=year+'-'+month,seed='MONTH-'+i,plan=monthlyConferences(seed,monthKey);
 counts.add(plan.length);assert(plan.length>=6&&plan.length<=8);assert.equal(new Set(plan.map(e=>e.date)).size,plan.length);assert.equal(new Set(plan.map(e=>e.type)).size,4);assert.deepEqual(plan,monthlyConferences(seed,monthKey));
 const weekCounts=new Map(),firstWeekday=new Date(monthKey+'-01T12:00:00Z').getUTCDay();
 for(const e of plan){assert(e.date.startsWith(monthKey+'-'));assert([1,2,3,4,5].includes(new Date(e.date+'T12:00:00Z').getUTCDay()));const week=Math.floor((Number(e.date.slice(-2))-1+firstWeekday)/7);weekCounts.set(week,(weekCounts.get(week)||0)+1);}
 assert([...weekCounts.values()].every(n=>n<=2));assert(weekCounts.size>=4);
 const opening=createMorningOpening(seed,{today:monthKey+'-15'}),days=calendarCells(year,Number(month)-1).filter(c=>c.inMonth),visible=days.filter(c=>calendarEntry(opening,c.date));assert.equal(visible.length,plan.length);assert.equal(opening.conference,plan.some(e=>e.date===opening.today));
 calendarEntry(opening,year+'-12-31');assert.deepEqual(days.filter(c=>calendarEntry(opening,c.date)),visible);
 for(const conference of [true,false]){const forced=createMorningOpening(seed,{today:conferencePreviewDate(monthKey+'-15'),conference});assert.equal(forced.conference,conference);assert.equal(!!calendarEntry(forced,forced.today),conference);assert.equal(days.filter(c=>calendarEntry(forced,c.date)).length,plan.length);}
 novemberPlans.add(JSON.stringify(monthlyConferences(seed,'2026-11')));
}
assert.deepEqual([...counts].sort(),[6,7,8]);assert(novemberPlans.size>100);
for(const today of ['2026-10-31','2026-11-01'])for(const conference of [true,false]){const weekend=createMorningOpening('WEEKEND',{today,conference});assert(!weekend.conference);assert.equal(calendarEntry(weekend,today),null);}
assert.equal(conferencePreviewDate('2026-10-31'),'2026-11-02');assert.equal(conferencePreviewDate('2026-11-01'),'2026-11-02');assert.equal(conferencePreviewDate('2026-11-02'),'2026-11-02');assert.equal(conferencePreviewDate('2022-12-31'),'2023-01-02');
const o=createMorningOpening('HTML',{today,conference:true}),view={year:2026,month:9};const before=calendarHTML(o,view);assert(before.includes('先點選「今天」'));assert(!before.includes('今日報告 paper'));assert(before.includes('data-calendar-date="2026-10-30"'));assert(!o.checked);checkMorningCalendar(o);assert(calendarHTML(o,{...view,selected:today}).includes(conferencePaper(o).title));
const late=createMorningOpening('LATE',{conference:true,today});checkMorningCalendar(late);assert.deepEqual(tickConference(late,451),['late']);assert.deepEqual(tickConference(late,452),[]);tickConference(late,453,{present:true});assert.equal(late.attendance,'late');assert.equal(conferenceCall(late,'late').kind,'conference');assert.equal(conferenceCall(late,'late').penalty,8);assert(beginConference(late,453));
const missed=createMorningOpening('MISSED',{conference:true,today});assert.deepEqual(tickConference(missed,470),['missed']);assert.equal(missed.stage,'missed');assert(!openingTarget(missed));assert.deepEqual(tickConference(missed,480),[]);checkMorningCalendar(missed);assert.equal(missed.stage,'missed');assert(!beginConference(missed,480));assert.equal(conferenceCall(missed,'missed').penalty,12);
const left=createMorningOpening('LEFT',{conference:true,today});checkMorningCalendar(left);tickConference(left,448,{present:true});tickConference(left,449,{present:false});assert.deepEqual(tickConference(left,451),['late']);tickConference(left,452,{present:true});assert.equal(left.attendance,'late');assert.deepEqual(tickConference(left,465),['missed']);
const r=wardRect(WARD_PLAN.core.find(r=>r.id==='討論室'));assert(inDiscussionRoom('f7',r));assert(!inDiscussionRoom('g2',r));assert(!inDiscussionRoom('f7',{x:r.x+r.w,z:r.z}));
assert.equal(openingClockRate({opening:o,clock:440}),.1);assert.equal(openingClockRate({opening:o,clock:455}),.2);assert.equal(openingClockRate({clock:440}),null);
const spot={x:0,z:3,approaches:perimeterApproaches(0,0,4,2,1)};for(const p of [{x:0,z:2},{x:0,z:-2},{x:3,z:0},{x:-3,z:0}])assert.equal(spotDistance(spot,p),0);assert.equal(sortedApproaches(spot,{x:0,z:-8})[0].z,-2);assert.equal(spotDistance(spot,{x:0,z:0},()=>false),Infinity);
console.log('Morning calendar passed: 480 month schedules with 6–8 weekday meetings, at most two per week, all four types, matching today and forced previews; 180 complete paper/attendance paths, today-click gating, leap/year grids, Taiwan date and blocked-side interaction.');
