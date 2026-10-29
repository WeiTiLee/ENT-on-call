export const OR_DINING={x:32,z:25.4,w:14,d:7.2,spot:{id:'or-dining',x:31,z:21.5,label:'餐廳 · 領取飲料',labelX:34,labelZ:26,height:3.2}};
export const OR_BOUNDS={x:76,z:61};
export const OR_NUMBERS=Array.from({length:30},(_,i)=>i+1).filter(n=>n%10!==4);
// Rows follow the left operating-suite block in the supplied floor plan.
export const OR_ROWS=[
  {id:'upper',numbers:[22,23,25],xs:[-12,0,17],z:-37.5,doorSide:'south'},
  {id:'north',numbers:[21,20,19],xs:[-12,12,27],z:-22.5,doorSide:'south'},
  {id:'main',numbers:[15,16,17,18],xs:[-12,0,12,27],z:-7.5,doorSide:'south'},
  {id:'opposite',numbers:[13,12],xs:[0,12],z:7.5,doorSide:'north'},
  {id:'lower',numbers:[8,9,10,11],xs:[-24,-12,0,12],z:22.5,doorSide:'north'},
  {id:'bottom',numbers:[7,6,5],xs:[-24,0,12],z:37.5,doorSide:'north'},
  {id:'southeast',numbers:[3,2,1],xs:[40,52,64],z:52.5,doorSide:'north'}
];
export const OR_ROOMS=[...OR_ROWS.flatMap(row=>row.numbers.map((number,i)=>({number,x:row.xs[i],z:row.z,doorSide:row.doorSide,row:row.id}))),
  ...[28,29,30].map((number,i)=>({number,x:47,z:-37.5+i*15,doorSide:'south',row:'northeast'}))].map(r=>({...r,w:10,d:9}));
// The photograph does not show 26/27 clearly; keep them outside the mapped block.
export const OR_WINGS=[{side:-1,numbers:[26,27]}];
export const OR_HALLS=[...[-30,-15,0,15,30].map(z=>({x:2,z,w:69,d:5})),{x:35,z:-7.5,w:6,d:80},{x:-32,z:0,w:5,d:65},...[-30,-15,0].map(z=>({x:42,z,w:16,d:5})),{x:49,z:45,w:34,d:5}];
export function operatingSpot(number=16){return'or-'+number;}
export function operatingLabel(number=16){return'F 棟 5 樓 · '+number+'房';}
export const OR_INTERIORS=[13,16];
export function operatingDoor(number){const r=OR_ROOMS.find(r=>r.number===number);return r?{x:r.x,z:r.z+(r.doorSide==='south'?1:-1)*(r.d/2+1.4)}:null;}
export function operatingViewTarget(target,room=null){if(!room)return target;return{...target,spot:target.dest==='f5'&&target.spot===operatingSpot(room)?'operation':'or-exit'};}
export function operatingTarget(event={},caseMode='patient'){
  return{dest:caseMode==='or'?'f5':event.dest,spot:caseMode==='or'||event.spot==='operation'?operatingSpot(event.orRoom||16):event.spot};
}
export function operatingPlanSVG(){
  const px=x=>360+x*8,py=z=>402+z*8;
  const rooms=OR_ROOMS.map(r=>`<g class="or-plan-room ${r.number===16?'ent':r.number===13?'local':''}"><rect x="${px(r.x-r.w/2)}" y="${py(r.z-r.d/2)}" width="${r.w*8}" height="${r.d*8}" rx="3"/><text x="${px(r.x)}" y="${py(r.z)+7}" class="or-plan-number">${r.number}房</text><path d="M${px(r.x)-12} ${py(r.z+(r.doorSide==='south'?1:-1)*r.d/2)}h24"/></g>`).join('');
  const halls=OR_HALLS.map(h=>`<rect x="${px(h.x-h.w/2)}" y="${py(h.z-h.d/2)}" width="${h.w*8}" height="${h.d*8}" fill="#b8c8c1"/>`).join('');
  return`<svg class="or-floorplan" viewBox="0 0 980 920" role="img" aria-label="F棟手術室區：15、16、17、18房同排，13房正對16房；僅取實際平面圖左側手術室區"><rect class="or-plan-base" x="5" y="5" width="970" height="910" rx="12"/>${halls}${rooms}<text x="490" y="34">F 棟 5 樓 · 手術室區</text><text x="490" y="58" class="or-plan-facing-label">依提供照片左側配置</text><path class="or-plan-facing" d="M360 380V424"/><text x="510" y="407" class="or-plan-facing-label">16房 ↔ 13房</text><rect class="or-plan-lift" x="${px(20)}" y="${py(19)}" width="90" height="46" rx="4"/><text x="${px(20)+45}" y="${py(19)+28}" font-size="16">F 棟電梯</text><rect class="or-plan-lift" x="${px(27)}" y="${py(25)}" width="100" height="42" rx="4"/><text x="${px(27)+50}" y="${py(25)+27}">餐廳</text><text x="110" y="${py(-18)}" class="or-plan-facing-label">延伸走廊</text><text x="110" y="${py(-14)}" class="or-plan-facing-label">26房 · 27房</text><text x="490" y="882" class="or-plan-facing-label">26、27房未清楚入鏡，另列延伸走廊；餐廳為遊戲配置。</text></svg>`;
}
