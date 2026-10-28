import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {CASES,PHASES,LOCATIONS,nextHop,fmt,createState} from '../dist/game/ent-data.js';

const graph=JSON.parse(await readFile(new URL('../dist/game/navigation.json',import.meta.url),'utf8'));
const nodes=new Set(graph.nodes.map(n=>n.id));
for(const node of nodes)assert(LOCATIONS[node],`Missing scene metadata: ${node}`);
for(const e of graph.edges){assert(nodes.has(e.from)&&nodes.has(e.to));if(e.mode==='walk'){assert.equal(e.from.slice(1),e.to.slice(1));assert.notEqual(e.from.slice(1),'5');}if(e.mode==='elevator')assert.equal(e.from[0],e.to[0]);}
for(const from of ['f7','f5','g2','f1'])for(const to of ['f7','f5','g2','f1']){if(from===to)continue;const route=nextHop(graph,from,to);assert(route,`${from} cannot reach ${to}`);assert.equal(route.path.at(-1),to);for(let i=1;i<route.path.length;i++){const a=route.path[i-1],b=route.path[i];assert(graph.edges.some(e=>e.from===a&&e.to===b||e.bidirectional&&e.to===a&&e.from===b));}}
assert.equal(nextHop(graph,'g2','f5').path.includes('f2'),true);
assert.equal(nextHop(graph,'g2','f5').next,'f2');
assert.equal(nextHop(graph,'g2','f5').mode,'walk');
assert.equal(nextHop(graph,'f7','g2').mode,'elevator');
assert.equal(nextHop(graph,'f7','f5').mode,'elevator');
assert.equal(LOCATIONS.f1.kind,'ed');assert.equal(LOCATIONS.g2.kind,'clinic');
assert.equal(PHASES.filter(p=>p.kind==='case').length,6);
let lastClock=0;
for(const p of PHASES){assert(p.clock>=lastClock);lastClock=p.clock;assert(nodes.has(p.dest));if(p.kind==='case')assert(CASES[p.case]);}
for(const [id,c] of Object.entries(CASES)){assert(c.phone.some(o=>o.dest),`No accepted call: ${id}`);for(const o of c.phone)assert(o.dest?nodes.has(o.dest):!!o.why);assert(c.steps.length>0);for(const s of c.steps){assert(s.options.some(o=>o.good),`No progress path: ${id}`);for(const o of s.options)assert(o.reply);}}
assert.equal(fmt(1440+70),'01:10');assert.equal(fmt(1910),'07:50');assert.equal(createState().location,'f7');
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
assert(html.includes('gDisclaimer'));assert(html.includes('drcharming.net'));
console.log('ENT checks passed: all four destinations reachable, floor-5 crossing blocked, six cases have progress paths, timeline and credit valid.');
