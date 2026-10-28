export const OR_DINING={x:32,z:25.4,w:14,d:7.2,spot:{id:'or-dining',x:31,z:21.5,label:'餐廳 · 領取飲料',labelX:34,labelZ:26,height:3.2}};
// Only the five-room relationship is confirmed; side corridors are schematic.
export const OR_NUMBERS=Array.from({length:30},(_,i)=>i+1).filter(n=>n%10!==4);
export const OR_ROOMS=[
  {number:17,x:-16,z:-10.5},{number:16,x:0,z:-10.5},{number:15,x:16,z:-10.5},
  {number:12,x:-16,z:10.5},{number:13,x:0,z:10.5}
].map(r=>({...r,w:14,d:13}));
export const OR_WINGS=[
  {side:-1,numbers:OR_NUMBERS.filter(n=>n<12)},
  {side:1,numbers:OR_NUMBERS.filter(n=>n>17)}
];
export function operatingSpot(number=16){return'or-'+number;}
export function operatingLabel(number=16){return'F 棟 5 樓 · '+number+'房';}
export const OR_INTERIORS=[13,16];
export function operatingDoor(number){const r=OR_ROOMS.find(r=>r.number===number);return r?{x:r.x,z:r.z-Math.sign(r.z)*(r.d/2+1.4)}:null;}
export function operatingViewTarget(target,room=null){if(!room)return target;return{...target,spot:target.dest==='f5'&&target.spot===operatingSpot(room)?'operation':'or-exit'};}
export function operatingTarget(event={},caseMode='patient'){
  return{dest:caseMode==='or'?'f5':event.dest,spot:caseMode==='or'||event.spot==='operation'?operatingSpot(event.orRoom||16):event.spot};
}
export function operatingPlanSVG(){
  const rooms=OR_ROOMS.map(r=>{const x=390+r.x*10-65,y=r.z<0?65:270;return`<g class="or-plan-room ${r.number===16?'ent':r.number===13?'local':''}"><rect x="${x}" y="${y}" width="130" height="110" rx="5"/><text x="${x+65}" y="${y+66}" class="or-plan-number">${r.number}房</text><path d="M${x+46},${r.z<0?y+110:y}h38"/></g>`;}).join('');
  const wings=OR_WINGS.map(w=>{const x=w.side<0?16:650;return`<g class="or-plan-wing"><rect x="${x}" y="53" width="114" height="340" rx="7"/><text x="${x+57}" y="86">其他走廊</text>${w.numbers.map((n,i)=>`<text class="or-wing-number" x="${x+32+(i%2)*50}" y="${125+Math.floor(i/2)*44}">${n}房</text>`).join('')}</g>`;}).join('');
  return`<svg class="or-floorplan" viewBox="0 0 780 470" role="img" aria-label="刀房平面：上排由左至右為17房、16房、15房，下排為12房、13房，16房與13房正對面；其他刀房位於兩側走廊，右側設有餐廳，無4、14、24號"><rect class="or-plan-base" x="5" y="5" width="770" height="460" rx="12"/><path class="or-plan-hall" d="M130 223H650M150 223V420H610V223"/>${wings}${rooms}<text x="390" y="229" class="or-plan-corridor">主走廊</text><path class="or-plan-facing" d="M390 184V259"/><text x="470" y="250" class="or-plan-facing-label">16房 ↔ 13房</text><rect class="or-plan-lift" x="475" y="398" width="124" height="43" rx="4"/><text x="537" y="425">F 棟電梯</text><rect class="or-plan-lift" x="614" y="398" width="144" height="43" rx="4"/><text x="686" y="425">餐廳</text><text x="205" y="442">依來電指定房號前往</text></svg>`;
}
