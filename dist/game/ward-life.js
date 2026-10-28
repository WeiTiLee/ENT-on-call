import {wardPoint,wardRect,wardBedPositions,wardRooms} from './ward-plan.js';
// Models, interaction approaches and labels share these coordinates.
const center=wardPoint(575,160);
export const NURSING_STATION={center,width:10.6,depth:7.6,frontZ:center.z+2.2,wingZ:center.z-.7,
  computers:[{x:-1.5,z:center.z+2},{x:1.4,z:center.z+2}],printer:{x:3.5,z:center.z+2},tablet:{x:.15,z:center.z+2},
  chair:{x:-1.5,z:center.z+.1},nurse:{x:1.4,z:center.z+.1},
  spots:{tablet:{id:'consent-tablet',x:.15,z:center.z-1.3,label:'平板',height:2.65,labelX:.15,labelZ:center.z+2},nurse:{id:'nurse',x:.3,z:center.z-2.5,label:'護理站',height:2.3,labelX:.3,labelZ:center.z+1.3},
    computer:{id:'computer',x:-1.5,z:center.z-1.2,label:'電腦',height:2.7,labelX:-1.5,labelZ:center.z+2},
    printer:{id:'printer',x:3.5,z:center.z-.6,label:'印表機',height:2.6,labelX:3.5,labelZ:center.z+2}}
};
export const WARD_EVENT_BED={room:'7F23',bed:1};
export function hasWardPatientTask({started,explore,accepted},target){return!!(started&&!explore&&accepted&&target?.dest==='f7'&&target.spot==='patient');}
export function bedPatientVisible(room,bed,morning){const p=morning?.active?morning.list.find(p=>p.nasal):null;return !(p?.room===room&&p.bed===bed&&['following','exam'].includes(morning.escort));}
export function wardEventPatientSpot(){const r=wardRooms.find(r=>r.id===WARD_EVENT_BED.room),b=wardBedPositions(r)[0];return{id:'patient',x:b.x,z:wardRect(r).z+1.28,label:'7F23A · 病人',height:2.3,labelX:b.x,labelZ:b.z};}
