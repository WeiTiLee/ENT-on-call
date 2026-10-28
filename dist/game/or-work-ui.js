import {BOOKING_CASES,BOOKING_SLOTS,WORK_ATTENDINGS} from './or-work.js';
import {LOCAL_PROCEDURES} from './local-or.js';
import {NPX_PATIENTS} from './npx-biopsy.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const field=(name,label,items,value)=>`<label>${label}<select data-work-field="${name}" aria-label="${label}"><option value="">請選擇</option>${items.map(i=>`<option value="${esc(i.value)}" ${value===i.value?'selected':''}>${esc(i.label)}</option>`).join('')}</select></label>`;
export function bookingMemo(t){const p=t.patient;return`<aside class="work-memo"><small>主治來電便條</small><h3>${esc(p.patient)}<span>${esc(p.id)}</span></h3><dl><dt>手術</dt><dd>${esc(p.procedure)}</dd><dt>主治</dt><dd>${esc(p.attending)}</dd><dt>時間</dt><dd>${esc(p.session)} · ${p.room}房</dd></dl><p>送出排刀申請後，把單子放桌上，診間護理師會再跟病人核對。</p></aside>`;}
export function workForm(t,{booking=false}={}){
  const d=booking?t.draft:t.orderDraft;
  const patients=booking?BOOKING_CASES.map(p=>({value:p.id,label:p.patient+' · '+p.id})):[...NPX_PATIENTS,...Object.values(LOCAL_PROCEDURES).map(c=>c.patient)].map(p=>({value:p.id,label:p.name+' · '+p.id}));
  const procedures=booking?BOOKING_CASES.map(p=>p.procedure):['鼻咽檢體病理檢查','口腔檢體病理檢查','耳內注射處置'];
  return`<div class="work-form">${field('patient','病人',patients,d.patient)}${field('procedure',booking?'手術':'Order 項目',procedures.map(p=>({value:p,label:p})),d.procedure)}${field('attending','主治醫師',WORK_ATTENDINGS.map(p=>({value:p,label:p})),d.attending)}${booking?`<fieldset class="work-slots"><legend>${t.patient.room}房 · 排程空位</legend>${BOOKING_SLOTS.filter(s=>s.room===t.patient.room).map(s=>`<button data-work-slot="${s.id}" aria-pressed="${d.slot===s.id}" ${s.occupied?'disabled':''}><span>${s.session}</span><b>${s.time}</b><small>${s.occupied?'已有手術':d.slot===s.id?'✓ 已選':'空位'}</small></button>`).join('')}</fieldset>`:''}</div>`;
}
export function bookingReview(t){const s=BOOKING_SLOTS.find(s=>s.id===t.draft.slot),p=t.patient;return`<div class="work-review"><span>${t.stage==='submitted'?'✓ 排刀申請已登記':'送出前核對'}</span><h3>${esc(p.patient)} · ${esc(p.id)}</h3><p>${esc(p.procedure)}</p><p>${esc(p.attending)} · ${p.room}房</p><b>${esc(s.session)} ${esc(s.time)}</b></div>`;}
