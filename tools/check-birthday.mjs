import assert from 'node:assert/strict';
import {BIRTHDAY_PEOPLE,birthdayEvent,clinicPlanSVG,CLINIC_OUTLINE} from '../dist/game/birthday.js';
import {EVENTS} from '../dist/game/event-pool.js';
import {buildTimeline} from '../dist/game/event-deck.js';
const people=new Set();
for(let i=0;i<300;i++){const seed='BIRTHDAY-'+i,c=birthdayEvent(seed);assert.deepEqual(c,birthdayEvent(seed));assert.equal(c.dest,'g2');assert.equal(c.spot,'audiology');assert.equal(c.phone.length,3);assert.equal(c.phone.filter(o=>o.finish).length,1);assert(!c.phone[2].effect);assert(!c.phone[0].finish&&!c.phone[1].finish);assert(!c.phoneOnly);people.add(BIRTHDAY_PEOPLE.find(n=>c.intro.includes(n)));const phase=buildTimeline(['outpatientPaperwork','popcorn'],seed).find(p=>p.case==='popcorn');assert.equal(phase.clock,720);assert.equal(phase.spot,'audiology');}
assert.equal(people.size,3);assert(!people.has(undefined));assert.equal(EVENTS.popcorn.title,'中午聽力室慶生');assert(!EVENTS.popcorn.brief.includes('爆米花'));assert(clinicPlanSVG().includes('左上聽力室、右上走廊、右下初診間'));assert(CLINIC_OUTLINE.some(([x,z])=>x<-30&&z<-30));
console.log('Birthday passed: seeded three honorees, attend/decline routes, noon scheduling, 2G audiology destination and clinic map orientation.');
