import assert from 'node:assert/strict';
import {createState} from '../dist/game/ent-data.js';
import {createMorning,printPatientList,visitPatient} from '../dist/game/morning-events.js';
import {createMorningOpening} from '../dist/game/morning-opening.js';
import {createRun} from '../dist/game/event-deck.js';
import {tickShiftClock,releaseDueCalls} from '../dist/game/call-scheduler.js';
import {remainingORWork,dayClockCeiling,spendShiftTime,dayPacingHint,NIGHT_START} from '../dist/game/day-pacing.js';
import {createLocalOR,tickLocalRest} from '../dist/game/local-or.js';
for(let seed=0;seed<120;seed++){
 const s=createState();Object.assign(s,{started:true,run:createRun({seed:'PACE-'+seed}),opening:createMorningOpening('PACE',{conference:false}),morning:createMorning('PACE'),mode:'walk'});assert.equal(s.clock,440);printPatientList(s.morning);s.clock=509;tickShiftClock(s,1000);assert(s.clock<=535);assert(releaseDueCalls(s).some(p=>p.clock===510),'08:30 phone still arrives with unfinished rounds');spendShiftTime(s,5000);assert.equal(s.clock,535);for(const p of s.morning.list)visitPatient(s.morning,p.id);s.morning.escort='done';assert.equal(dayClockCeiling(s),539);spendShiftTime(s,100);assert.equal(s.clock,539);s.location='g2';tickShiftClock(s,1);assert(s.pacing.clinicArrived);assert(s.clock>539);assert(dayPacingHint(s).includes('初診間'));
 s.clock=810;const jobs=remainingORWork(s);assert.equal(jobs.length,3);spendShiftTime(s,5000);assert.equal(s.clock,1045);assert(!releaseDueCalls(s).some(p=>p.clock>=NIGHT_START));for(const p of jobs.slice(0,-1))s.completed.push(p.id);spendShiftTime(s,10);assert.equal(s.clock,1045);s.completed.push(jobs.at(-1).id);spendShiftTime(s,5);assert.equal(s.clock,1050);assert(dayPacingHint(s).includes('值班'));spendShiftTime(s,15);assert(releaseDueCalls(s).some(p=>p.clock===1065));
}
const t=createLocalOR('ear','REST');t.stage='rest';t.restStarted=true;assert(tickLocalRest(t,10));assert.equal(t.restElapsed,10,'The OR pacing ceiling cannot deadlock the real-time patient rest');
const n=createState();n.clock=800;spendShiftTime(n,10);assert.equal(n.clock,810);n.started=true;n.explore=true;n.opening=createMorningOpening('EXP');spendShiftTime(n,10);assert.equal(n.clock,820);
console.log('Day pacing passed: 120 varied shifts, 08:30 calls during unfinished rounds, 08:55/08:59 morning buffers, 17:25 unfinished-OR buffer, final-procedure release, 17:30 night boundary, no early night calls, preserved rest timer and isolated exploration.');
