import assert from 'node:assert/strict';
import {createNoseCase,noseAction,noseStageText,NOSE_VARIANTS,NOSE_EVENT} from '../dist/game/nose-case.js';
import {noseHTML,nosePhoneHTML} from '../dist/game/nose-ui.js';
import {EVENTS} from '../dist/game/event-pool.js';
import {createState} from '../dist/game/ent-data.js';
const seen=new Set();
for(let i=0;i<300;i++){
 const t=createNoseCase('NOSE-'+i);seen.add(t.variant);assert.deepEqual(t,createNoseCase('NOSE-'+i));
 assert(!noseAction(t,'finish','admit').ok);assert(!noseAction(t,'destination','f1').ok);
 for(const q of ['vitals','bleeding','transfer']){assert(noseAction(t,'ask',q).ok);assert(!noseAction(t,'ask',q).ok);}
 assert(nosePhoneHTML(t).includes('Vital signs'));assert(!noseAction(t,'destination','other').ok);
 const dest=t.variant==='unstable'?'f1':i%2?'g2':'f1';
 if(t.variant==='unstable'){assert(noseAction(t,'destination','g2').penalty);assert.equal(t.stage,'phone');}
 assert(noseAction(t,'destination',dest).accepted);assert(noseAction(t,'assess').ok);
 if(t.stage==='rescue'){assert(noseHTML(t).includes('78/46'));assert(noseAction(t,'rescue','scope').penalty);assert(!noseAction(t,'fiber').ok);assert(noseAction(t,'rescue','support').ok);if(t.stage==='transfer'){assert(noseAction(t,'transfer').travel);assert.equal(t.dest,'f1');}}
 assert.equal(t.stage,'history');assert(!noseAction(t,'fiber').ok);
 for(const q of ['medication','course'])assert(noseAction(t,'history',q).ok);
 assert(noseAction(t,'fiber').ok);assert(!noseAction(t,'scope-done').ok);assert(noseAction(t,'locate').ok);assert(!noseAction(t,'locate').ok);assert(noseAction(t,'scope-done').ok);assert(noseAction(t,'bosmin').ok);
 const pack=t.variant==='mild'?'surgicel':'merocel';assert(noseAction(t,'packing',pack==='surgicel'?'merocel':'surgicel').penalty);assert(noseAction(t,'packing',pack).ok);assert(noseAction(t,'recheck').ok);
 if(t.stage==='foley'){assert(noseAction(t,'foley','home').penalty);assert(noseAction(t,'foley','add').ok);}
 if(t.stage==='tae'){assert(noseAction(t,'tae','wait').penalty);assert(noseAction(t,'tae','refer').ok);}
 assert.equal(t.stage,'disposition');assert(noseStageText(t));assert(noseHTML(t).includes('三天後回診'));
 const plan=t.packing==='surgicel'?'followup':t.packing==='merocel'?'three-days':'admit';assert(noseAction(t,'finish',plan==='admit'?'followup':'admit').penalty);
 const resumed=JSON.parse(JSON.stringify(t));assert.equal(noseHTML(resumed),noseHTML(t));assert(noseAction(resumed,'finish',plan).completed);assert(!noseAction(resumed,'finish',plan).ok);assert(!t.finished);
}
assert.equal(seen.size,NOSE_VARIANTS.length);assert.equal(EVENTS.nose,NOSE_EVENT);assert.equal(EVENTS.nose.callType,'consult');assert.equal(createState().nose,null);
for(const dest of ['f1','g2']){const t=createNoseCase('same',{variant:'mild'});for(const q of ['vitals','bleeding','transfer'])noseAction(t,'ask',q);assert(noseAction(t,'destination',dest).accepted);}
console.log('Nose passed: 300 seeded cases, both destinations, six variants, unstable transfer guard, shock rescue/transfer, fiber gate, packing escalation, disposition, resume and single completion.');
