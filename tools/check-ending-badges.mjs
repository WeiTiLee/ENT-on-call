import assert from 'node:assert/strict';
import {ENDING_BADGES,endingBadge,recordTravel} from '../dist/game/ending-badges.js';
import {createState} from '../dist/game/ent-data.js';
import {createStudioEnding} from '../dist/game/studio-tools.js';
const titles=['冷便當考古學家','枕頭試用失敗員','電梯里長伯','ENT易燃特有種','ENT 情緒穩定稀有種','公務課之友'];
assert.deepEqual(ENDING_BADGES.map(b=>b.title),titles);
for(const b of ENDING_BADGES){const s=createStudioEnding(b.id,'ENDING',{name:'測試',character:'female'}),before=JSON.stringify(s);const award=endingBadge(s);assert.equal(award.title,b.title);assert.equal(award.id,b.id);assert(award.reason);assert.equal(JSON.stringify(s),before);assert.equal(s.completed.length,s.run.total);assert(s.run.studio);assert.equal(s.character,'female');assert.deepEqual(endingBadge(s),award);}
const s=createState();s.stats.meals=1;s.temper=20;s.hunger=60;assert.equal(endingBadge(s).id,'calm');
s.temper=49;assert.equal(endingBadge(s).id,'calm');s.temper=50;assert.equal(endingBadge(s).id,'flammable');s.temper=20;
s.stats.trips=50;assert.equal(endingBadge(s).id,'calm','Walking across buildings is not elevator use');
s.stats.elevatorRides=7;assert.equal(endingBadge(s).id,'calm');recordTravel(s,'walk');assert.equal(s.stats.elevatorRides,7);recordTravel(s,'elevator');assert.equal(s.stats.elevatorRides,8);assert.equal(endingBadge(s).id,'elevator');assert.equal(s.stats.trips,52);
s.stats.woken=1;assert.equal(endingBadge(s).id,'elevator');s.stats.woken=2;assert.equal(endingBadge(s).id,'pillow');
s.side.completed=['f7:printer','f7:printer','f7:password'];assert.equal(endingBadge(s).id,'pillow');s.side.completed.push('g2:tissue');assert.equal(endingBadge(s).id,'maintenance');
s.temper=80;assert.equal(endingBadge(s).id,'flammable');s.temper=0;s.care.rages=1;assert.equal(endingBadge(s).id,'flammable','Calming down does not erase a rage episode');
const cold=createState();cold.stats.meals=1;cold.hunger=25;cold.temper=20;assert.equal(endingBadge(cold).id,'cold');cold.hunger=26;assert.equal(endingBadge(cold).id,'calm');cold.stats.meals=0;assert.equal(endingBadge(cold).id,'cold');
const fresh=createState();assert.equal(fresh.stats.elevatorRides,0);assert.equal(fresh.care.rages,0);assert.deepEqual(fresh.side.completed,[]);const snapshot=JSON.stringify(fresh);assert(!recordTravel(fresh,'teleport'));assert.equal(JSON.stringify(fresh),snapshot);assert.throws(()=>createStudioEnding('unknown','ENDING'));
console.log('Ending badges passed: six exact titles and reachable previews, threshold/priority cases, true elevator counts, persistent rage history, distinct side activities, read-only stable awards and fresh-run reset.');
