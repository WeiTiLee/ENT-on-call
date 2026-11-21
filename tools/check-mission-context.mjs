import assert from 'node:assert/strict';
import {openingOwnsMission,missionContext} from '../dist/game/mission-context.js';
const s={started:true,location:'f5',orRoom:13,mode:'walk',accepted:false,opening:{focused:true,checked:false,stage:'calendar'}};
assert(openingOwnsMission(s));assert.equal(missionContext(s).title,'13房');
for(const mode of ['music','calendar','records','or-list','supply']){const t={...s,mode};assert(!openingOwnsMission(t));assert(missionContext(t));}
assert.equal(missionContext({...s,mode:'music'},{track:{title:'今天也很好'},playing:true}).title,'播放中：今天也很好');
assert.equal(missionContext({...s,mode:'music'},{track:{title:'天亮以前'},playing:true}).title,'播放中：天亮以前');
assert(!openingOwnsMission({...s,accepted:true}),'An unfinished opening cannot overwrite an accepted case');assert.equal(missionContext({...s,accepted:true}),null);
assert.equal(missionContext(s,{hasCalls:true}),null,'Queued calls keep the mission frame');assert.equal(missionContext({...s,location:'f7',orRoom:null}),null);
for(const stage of ['done','missed'])assert(!openingOwnsMission({...s,opening:{...s.opening,stage}}));
assert.equal(missionContext({...s,ending:true}),null);assert.equal(missionContext({...s,started:false}),null);
console.log('Mission context passed: opening priority yields to accepted work, active screens and pending calls; early room-13 exploration shows current context without completing morning tasks.');
