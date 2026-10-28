import {ATTENDING_NAMES} from './staff.js';
import {seededRandom} from './event-deck.js';
import {LOCAL_PROCEDURES} from './local-or.js';

export const BOOKING_CASES=[
  {patient:'林以安',id:'OP-201',procedure:'NPX biopsy',attending:'黃主治',session:'明日上午',room:13},
  {patient:'陳語晴',id:'OP-202',procedure:'Oral biopsy',attending:'羅主治',session:'明日下午',room:13},
  {patient:'許承恩',id:'OP-203',procedure:'耳內注射',attending:'王主治',session:'明日上午',room:13},
  {patient:'張宜安',id:'OP-204',procedure:'SMP',attending:'蔡主治',session:'明日上午',room:16},
  {patient:'李思涵',id:'OP-205',procedure:'FESS',attending:'徐主治',session:'明日下午',room:16},
  {patient:'吳柏廷',id:'OP-206',procedure:'tonsillectomy',attending:'葉主治',session:'明日上午',room:16},
  {patient:'周心妤',id:'OP-207',procedure:'tumor wide excision',attending:'呂主治',session:'明日下午',room:16},
  {patient:'劉子謙',id:'OP-208',procedure:'neck dissection',attending:'張主治',session:'明日上午',room:16},
  {patient:'鄭明哲',id:'OP-209',procedure:'tracheostomy',attending:'羅主治',session:'明日下午',room:16}
];
export const WORK_ATTENDINGS=ATTENDING_NAMES;
export const BOOKING_SLOTS=[
  {id:'am-taken',room:13,session:'明日上午',time:'09:00',occupied:true},
  {id:'am-open',room:13,session:'明日上午',time:'10:30',occupied:false},
  {id:'pm-open',room:13,session:'明日下午',time:'13:30',occupied:false},
  {id:'16-am-taken',room:16,session:'明日上午',time:'09:00',occupied:true},
  {id:'16-am-open',room:16,session:'明日上午',time:'10:30',occupied:false},
  {id:'16-pm-open',room:16,session:'明日下午',time:'13:30',occupied:false}
];
export function createBooking(seed,{practice=false}={}){
  const patient={...BOOKING_CASES[Math.floor(seededRandom(seed+'|booking')()*BOOKING_CASES.length)]};
  return{practice,patient,stage:'phone',draft:{patient:'',procedure:'',attending:'',slot:''},mistakes:0,feedback:''};
}
export function bookingAction(t,action,value){
  if(t.stage==='done')return{ok:false,message:'這份排刀單已放回桌上。'};
  const fail=message=>{t.feedback=message;t.mistakes++;return{ok:false,message,penalty:true};};
  if(action==='accept'&&t.stage==='phone'){t.stage='draft';return{ok:true};}
  if(action==='edit'&&t.stage==='draft'&&Object.hasOwn(t.draft,value?.field)){t.draft[value.field]=value.value;t.feedback='';return{ok:true};}
  if(action==='review'&&t.stage==='draft'){
    if(t.draft.patient!==t.patient.id)return fail('先對病人姓名與病歷號，這不是主治交代的那位。');
    if(t.draft.procedure!==t.patient.procedure)return fail('手術名稱和電話便條不同，再核對一次。');
    if(t.draft.attending!==t.patient.attending)return fail('主治醫師要和這通電話的交代一致。');
    const slot=BOOKING_SLOTS.find(s=>s.id===t.draft.slot);
    if(!slot||slot.occupied||slot.room!==t.patient.room||slot.session!==t.patient.session)return fail('選主治指定房間與時段的空位；已排滿的時段不能使用。');
    t.stage='review';t.feedback='';return{ok:true};
  }
  if(action==='back'&&t.stage==='review'){t.stage='draft';return{ok:true};}
  if(action==='submit'&&t.stage==='review'){t.stage='submitted';return{ok:true};}
  if(action==='leave-slip'&&t.stage==='submitted'){t.stage='done';return{ok:true,completed:true};}
  return{ok:false,message:'先完成目前這一步。'};
}
export function bookingSpot(){return'desk';}
export function placeNPXOrder(t,room){
  if(room!==13||!t||t.stage==='verify')return{ok:false,message:'先在13房核對這台的病人。'};
  if(t.orderPlaced)return{ok:true,first:false};
  if(t.orderDraft.patient!==t.patient.id||t.orderDraft.procedure!==(LOCAL_PROCEDURES[t.kind]?.order||'鼻咽檢體病理檢查')||t.orderDraft.attending!==t.attending)return{ok:false,message:'病人、order項目與主治醫師都要和本台資料一致。'};
  t.orderPlaced=true;return{ok:true,first:true};
}
