import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {onlineRecords,onlineRecordHTML,lateralViewSVG} from '../dist/game/online-records.js';
import {createState} from '../dist/game/ent-data.js';
import {createFishCase,fishAction,fishSpot} from '../dist/game/fish-case.js';
import {createWardNG} from '../dist/game/ward-ng.js';
import {createHearingConsult} from '../dist/game/hearing-consult.js';
import {createHearingTask} from '../dist/game/hearing-game.js';
import {createTubeTask,tubeAction} from '../dist/game/clinic-tubes.js';
import {EVENTS} from '../dist/game/event-pool.js';
const s=createState();assert.deepEqual(onlineRecords(s),[]);
s.fish=createFishCase('FISH-0|');s.wardNG=createWardNG('NG');s.hearingConsult=createHearingConsult('AUDIO');s.hearing=createHearingTask('HEARING');s.tubes.outpatientNG=createTubeTask('TUBE','outpatientNG');s.practiceTube=s.tubes.outpatientNG;
let rows=onlineRecords(s);assert.equal(rows.length,5);assert.equal(new Set(rows.map(r=>r.id)).size,5);
assert(!rows.find(r=>r.id==='sudden').reportTitle,'Audiogram is not available before testing');s.hearingConsult.stage='call-patient';rows=onlineRecords(s);assert.equal(rows.find(r=>r.id==='sudden').reportTitle,'聽力圖');
for(const r of rows){const h=onlineRecordHTML(r);assert(h.includes(r.name));assert(h.includes('ENT / 電子病歷'));assert(h.includes('病歷摘要'));if(r.reportTitle)assert(onlineRecordHTML(r,{tab:'report',reportHTML:'<p>TEST</p>'}).includes('data-record-tab="report"'));}
const before=JSON.stringify(s);onlineRecords(s).forEach(r=>onlineRecordHTML(r,{tab:'report'}));assert.equal(JSON.stringify(s),before,'Reading records does not complete or mutate work');
const film=rows.find(r=>r.id==='fish');assert(onlineRecordHTML(film,{tab:'report'}).includes('ONLINE IMAGE'));assert(lateralViewSVG(false).includes('遊戲示意影像'));assert.notEqual(lateralViewSVG(true),lateralViewSVG(false));
const evil={id:'escape',name:'<img onerror=x>',title:'<script>',rows:[['<b>','<script>']]};const html=onlineRecordHTML(evil);assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('<img onerror'));
fishAction(s.fish,'send');assert.equal(fishSpot(s.fish),'desk');assert(fishAction(s.fish,'read-record').ok);assert.equal(fishSpot(s.fish),'patient');const copy=JSON.parse(JSON.stringify(s.fish));assert(copy.recordReviewed);assert(!fishAction(s.fish,'read-record').ok);
const t=s.tubes.outpatientNG;t.stage='desk-return';t.exchanged=true;assert(!t.recorded);assert.equal(tubeAction(t,'return-slip'),'done');assert(t.recorded);assert(onlineRecords(s).find(r=>r.id==='outpatientNG').rows.some(row=>row[1].includes('已寫入電子病歷')));
s.run={phases:[{case:'trachcare'}]};assert(onlineRecords(s,EVENTS).some(r=>r.id==='trachcare'));
for(const name of ['fish-case.js','ward-ng.js','hearing-consult.js','event-pool.js','game.js']){
  const src=await readFile(new URL('../dist/game/'+name,import.meta.url),'utf8');assert(!/(片子一起帶|和片子一起上去|會診資料一起帶|紀錄會一起帶下去|紀錄都帶來了|報告已送到初診間|掛號單與紀錄放回工作桌)/.test(src),'Physical record handoff remains in '+name);
}
assert.equal(EVENTS.outpatientPaperwork.spot,'desk');
console.log('Online records passed: local chart/report availability, no premature audiogram, read-only viewing, safe text, X-ray display, computer-first fish review and resume, electronic tube record on desk return, physical registration slips retained, no carried charts/images in audited events.');
