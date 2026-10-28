import assert from 'node:assert/strict';
import {activitySession,printerAction,tissueAction,maintenanceAction,printerModel,tissueModel,leakModel,maintenancePhone} from '../dist/game/activity-models.js';
import {createSideActivities,finishSideActivity} from '../dist/game/side-activities.js';
const jams=new Set();
for(let i=0;i<80;i++){
  const state=activitySession('printer','f7:printer','SEED-'+i);jams.add(state.jamAt);
  assert.deepEqual(state,activitySession('printer','f7:printer','SEED-'+i));
  assert.equal(printerAction(state,'remove'),'blocked');assert.equal(printerAction(state,'test'),'blocked');
  if(state.jamAt==='rear'){assert.equal(printerAction(state,'rear'),'blocked');printerAction(state,'back');}
  assert.equal(printerAction(state,state.jamAt),'found');assert(printerModel(state).includes('拉出皺掉的卡紙'));
  assert.equal(printerAction(state,'test'),'blocked');assert.equal(printerAction(state,'remove'),'removed');assert.equal(printerAction(state,'remove'),'blocked');assert.equal(printerAction(state,'test'),'blocked');
  const restored=JSON.parse(JSON.stringify(state));assert.equal(printerAction(restored,restored.jamAt),'inspect');assert.equal(printerAction(restored,'test'),'done');
}
assert.deepEqual([...jams].sort(),['rear','tray']);
const tissue=activitySession('tissue');assert.equal(tissueAction(tissue,'take'),'blocked');assert.equal(tissueAction(tissue,'test'),'blocked');assert.equal(tissueAction(tissue,'box'),'lid');assert.equal(tissueAction(tissue,'box'),'empty');assert.equal(tissueAction(tissue,'cabinet'),'cabinet');assert.equal(tissueAction(tissue,'take'),'taken');assert.equal(tissueAction(tissue,'take'),'blocked');assert.equal(tissueAction(tissue,'box'),'lid');assert.equal(tissueAction(tissue,'box'),'loaded');assert(tissueModel(tissue).includes('fresh-tissue'));assert.equal(tissueAction(tissue,'test'),'done');
const phone=activitySession('water');assert.equal(maintenanceAction(phone,'report'),'blocked');assert.equal(maintenanceAction(phone,'call'),'short');for(const n of '2000')maintenanceAction(phone,n);assert.equal(maintenanceAction(phone,'call'),'wrong');assert(!phone.connected);maintenanceAction(phone,'clear');for(const n of '3000')maintenanceAction(phone,n);assert.equal(maintenanceAction(phone,'call'),'connected');assert(maintenancePhone(phone).includes('說明位置與漏水狀況'));assert.equal(maintenanceAction(phone,'report'),'done');assert(leakModel().includes('water-drop'));
const side=createSideActivities();side.sessions['f7:printer']=activitySession('printer','f7:printer');assert.equal(finishSideActivity(side,'f7:printer'),5);assert.equal(finishSideActivity(side,'f7:printer'),0);assert.equal(finishSideActivity(side,'g2:printer'),5);
console.log('Activities passed: both seeded jam locations, visible-part prerequisites, close-and-print, cabinet-to-box refill, 3000 then report, resumable objects and once-per-place relief.');
