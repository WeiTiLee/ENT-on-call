import assert from 'node:assert/strict';
import {releaseInputs,releasePlan} from './prepare-release.mjs';

const {html,sources}=await releaseInputs(),plan=releasePlan(html,sources);
assert.equal(html,plan.html,'Run prepare-release before publishing changed source');
assert.equal(releasePlan(plan.html,sources).html,plan.html,'Preparing an unchanged release is idempotent');
assert.equal(releasePlan(html,[...sources].reverse()).revision,plan.revision,'File enumeration order must not change the release');
const changed=sources.map(([name,data])=>[name,name==='game/local-or.js'?Buffer.concat([data,Buffer.from('\n// next release\n')]):data]);
const next=releasePlan(html,changed);
assert.notEqual(next.revision,plan.revision,'A child-module change invalidates the complete module graph');
assert.notEqual(next.imports['./game/game.js'],plan.imports['./game/game.js']);
assert.notEqual(next.imports['./game/local-or.js'],plan.imports['./game/local-or.js']);
assert.notEqual(releasePlan(html.replace('科內娛樂原型製作','科內娛樂遊戲'),sources).revision,plan.revision,'HTML changes also get a new revision');
const parsed=JSON.parse(html.match(/<script type="importmap" id="releaseImports">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(parsed.imports,plan.imports);
assert(html.indexOf('type="importmap"')<html.indexOf('type="module"'));
assert.equal(Object.keys(plan.imports).length,sources.filter(([name])=>name.endsWith('.js')).length);
for(const [name] of sources){
  if(name.endsWith('.js'))assert.equal(plan.imports['./'+name],'./'+name+'?v='+plan.revision);
  if(name.endsWith('.css'))assert(html.includes('href="./'+name+'?v='+plan.revision+'"'));
}
assert(html.includes('src="./game/game.js?v='+plan.revision+'"'));
console.log('Release passed: entry script, every child module/vendor and all styles share a content revision; changed child modules invalidate all URLs, unchanged output stays deterministic.');
