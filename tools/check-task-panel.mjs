import assert from 'node:assert/strict';
import {replaceTaskList,taskScrollState} from '../dist/game/task-panel.js';
const context={},other={};let writes=0;
const list={scrollTop:0,scrollHeight:900,clientHeight:250,ownerDocument:{activeElement:null},querySelectorAll(){return[];},getBoundingClientRect(){return{top:0};},contains(){return false;},set innerHTML(html){writes++;this.markup=html.replace('disabled','disabled=""');this.scrollTop=0;},get innerHTML(){return this.markup;}};
assert(replaceTaskList(list,'<button disabled>餐點</button>',context));list.scrollTop=240;
for(let i=0;i<100;i++)assert(!replaceTaskList(list,'<button disabled>餐點</button>',context));assert.equal(writes,1);assert.equal(list.scrollTop,240,'Browser-normalized boolean attributes must not trigger repeated replacements');
assert(replaceTaskList(list,'新來電加進來',context));assert.equal(list.scrollTop,240);assert.deepEqual(taskScrollState(list),{up:true,down:true});list.scrollTop=650;assert.deepEqual(taskScrollState(list),{up:true,down:false});
assert(replaceTaskList(list,'新來電加進來',other));assert.equal(list.scrollTop,0,'New shifts reset both scroll and captured handlers');assert.deepEqual(taskScrollState(list),{up:false,down:true});list.scrollHeight=200;assert.deepEqual(taskScrollState(list),{up:false,down:false});
console.log('Task panel passed: normalized HTML does not rerender, unchanged HUD ticks preserve scroll, added work preserves position, new shifts reset context and scroll controls track bounds.');
