import assert from 'node:assert/strict';
import {DUTY_ROOMS,canUseDutyRoom,BULLETINS} from '../dist/game/scene-life.js';
import {WARD_PLAN,wardRect,floorplanSVG} from '../dist/game/ward-plan.js';
import {layoutMarkers,overlaps} from '../dist/game/marker-layout.js';
for(const character of ['male','female']){const entry=Object.entries(DUTY_ROOMS).find(([,r])=>r.character===character);const r=wardRect(WARD_PLAN.core.find(r=>r.id===entry[0]));assert(character==='male'?r.x<0:r.x>0);assert(canUseDutyRoom({allowedCharacter:character},character));assert(!canUseDutyRoom({allowedCharacter:character},character==='male'?'female':'male'));assert(floorplanSVG().replace(/<[^>]+>/g,'').includes(entry[1].name));}
assert(canUseDutyRoom({},'female'));assert(BULLETINS.length>=4);
for(const [width,height] of [[1000,650],[617,269],[320,500]]){
 const blocked=[{left:0,right:180,top:0,bottom:60}],candidates=Array.from({length:32},(_,i)=>({key:'spot:'+i,x:Math.min(width-50,60+i%5*48),y:80+Math.floor(i/5)*29,width:130,height:30,marker:true,priority:i===0?100:50,distance:i,goal:i===0}));
 const result=layoutMarkers(candidates,{width,height,blocked,maxMarkers:4});assert(result.has('spot:0'));assert(result.size<=4);
 const rects=[...result].map(([key,p])=>{const c=candidates.find(c=>c.key===key);return{left:p.x-c.width/2,right:p.x+c.width/2,top:p.y-c.height,bottom:p.y};});for(let i=0;i<rects.length;i++){const a=rects[i];assert(a.left>=0&&a.right<=width&&a.top>=0&&a.bottom<=height);assert(!blocked.some(b=>overlaps(a,b)));for(const b of rects.slice(i+1))assert(!overlaps(a,b));}
}
console.log('Scene life passed: rotated male/female room assignment, rest restrictions, readable map names, notices, responsive non-overlapping marker layout and task priority.');
