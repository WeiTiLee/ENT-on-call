import {OR_ATTENDINGS} from './staff.js';
import {npxTarget} from './npx-biopsy.js';
export const OR_LIST_ROOMS=[13,16];
export function createORList(room,{npxPatient='林予安'}={}){
  if(!OR_LIST_ROOMS.includes(room))return null;
  const rows=room===13?[
    {id:'ear',patient:'王以辰',procedure:'耳內注射',attending:OR_ATTENDINGS.ear,owner:'player'},
    {id:'npx',patient:npxPatient,procedure:'NPX biopsy',attending:OR_ATTENDINGS.npx,owner:'player',active:true},
    {id:'oral',patient:'張宜庭',procedure:'Oral biopsy',attending:OR_ATTENDINGS.oral,owner:'player'}
  ]:[
    {id:'tonsil',patient:'周映彤',procedure:'扁桃腺切除術',attending:'呂主治'},
    {id:'neck',patient:'江柏安',procedure:'頸部腫塊切除術',attending:'張主治'}
  ];
  return{room,received:false,rows};
}
export function hasORList(lists,room){return OR_LIST_ROOMS.includes(room)&&!!lists[room]?.received;}
export function receivedORLists(lists){return OR_LIST_ROOMS.filter(room=>hasORList(lists,room));}
export function receiveORList(lists,room,currentRoom){const list=lists[room];if(!list||room!==currentRoom||!OR_LIST_ROOMS.includes(room))return{ok:false,first:false};const first=!list.received;list.received=true;return{ok:true,first};}
// Re-reading a copy updates its current case without regenerating or resetting clinical work.
export function syncORList(list,{npxPatient,npxDone=false,extraCase,completed=[],localCases={},activeKind='npx'}={}){
  if(list.room===13){const row=list.rows.find(r=>r.id==='npx');if(npxPatient)row.patient=npxPatient;row.note=npxDone?'已交接':'';row.active=!npxDone&&activeKind==='npx';for(const kind of ['ear','oral']){const r=list.rows.find(r=>r.id===kind),t=localCases[kind];r.note=t?.stage==='done'?(kind==='ear'?'已完成':'已交接'):'';r.active=activeKind===kind&&t?.stage!=='done';}}
  if(list.room===16&&extraCase&&!list.rows.some(r=>r.id===extraCase.id))list.rows.push({...extraCase});
  for(const row of list.rows)if(row.caseId){const done=completed.includes(row.caseId);row.note=done?'已交接':'追加 · 你協助';row.active=!done;}
  return list;
}
export function listedNPXTarget(task,room,lists){return hasORList(lists,13)?npxTarget(task,room):{dest:'f5',spot:room===13?'or-team-circulator':room?'or-exit':'or-13'};}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function orListPaper(list,{selectable=false}={}){return`<div class="or-list-paper"><div class="or-list-letterhead"><span>ENT / OPERATING LIST</span><b>${list.room}房</b></div><h2 id="modalTitle">今天的手術</h2><p class="or-list-subtitle">${list.room===13?'這間的刀由你負責，需要協助可到16房找學長。':'流動給你的手術清單'}</p><table class="or-list-table"><thead><tr><th scope="col">病人</th><th scope="col">手術</th><th scope="col">主治醫師</th></tr></thead><tbody>${list.rows.map(row=>`<tr class="${row.active?'current-case':''}"><td><b>${esc(row.patient)}</b></td><td>${selectable&&list.room===13?`<button class="or-case-link" data-local-case="${row.id}">${esc(row.procedure)} →</button>`:esc(row.procedure)}${row.note?`<small class="or-list-status">${esc(row.note)}</small>`:''}</td><td>${esc(row.attending||OR_ATTENDINGS.npx)}</td></tr>`).join('')}</tbody></table><div class="or-list-paper-footer"><span>F 棟 5 樓</span><span>ENT</span></div></div>`;}
