import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ART} from '../dist/game/art.js';
import {SPRITE_ATLASES,SCRUB_ATLASES} from '../dist/game/sprite-frames.js';
import {WARD_PLAN,wardRooms,wardRect} from '../dist/game/ward-plan.js';

for(const [id,assets] of Object.entries(ART.characters)){
  for(const asset of Object.values(assets))assert((await readFile(new URL('../dist/'+asset.slice(2),import.meta.url))).length>1000,`${id} asset missing`);
  const image=await readFile(new URL('../dist/'+assets.sprites.slice(2),import.meta.url));
  const atlas=SPRITE_ATLASES[id];assert.equal(atlas.width,image.readUInt32BE(16));assert.equal(atlas.height,image.readUInt32BE(20));assert.equal(atlas.frames.length,16);
  for(const frame of atlas.frames){assert(frame.x>=0&&frame.y>=0);assert(frame.w>40&&frame.h>120);assert(frame.x+frame.w<=atlas.width&&frame.y+frame.h<=atlas.height);}
}
const scrubs=await readFile(new URL('../dist/'+ART.scrubs.slice(2),import.meta.url));
for(const atlas of Object.values(SCRUB_ATLASES)){
  assert.equal(atlas.width,scrubs.readUInt32BE(16));assert.equal(atlas.height,scrubs.readUInt32BE(20));assert.equal(atlas.frames.length,8);
  for(const frame of atlas.frames){assert(frame.x>=0&&frame.y>=0);assert(frame.w>40&&frame.h>120);assert(frame.x+frame.w<=atlas.width&&frame.y+frame.h<=atlas.height);}
}
const scenes=await readFile(new URL('../dist/'+ART.scenes.slice(2),import.meta.url));assert.equal(scenes.readUInt32BE(16),1672);assert.equal(scenes.readUInt32BE(20),941);
assert.equal(wardRooms.length,22);assert.equal(new Set(wardRooms.map(r=>r.id)).size,22);assert(!wardRooms.some(r=>r.id==='7F04'));
for(const id of ['7F01','7F13'])assert(wardRect(wardRooms.find(r=>r.id===id)).x>0,`${id} must be on screen right`);
for(const id of ['7F25','7F15'])assert(wardRect(wardRooms.find(r=>r.id===id)).x<0,`${id} must be on screen left`);
const nurse=wardRect(WARD_PLAN.landmarks.find(r=>r.id==='護理站')),duty=wardRect(WARD_PLAN.core.find(r=>r.id==='值班室 (1)'));
assert(nurse.z>duty.z,'The station must appear below the duty rooms');
console.log('Art checks passed: both character atlases and all assets valid; all 22 ward rooms use the confirmed orientation.');
