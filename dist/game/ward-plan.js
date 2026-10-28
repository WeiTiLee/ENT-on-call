import {DUTY_ROOMS} from './scene-life.js';
// Coordinates follow the supplied plan. Both axes turn so the public lifts are below.
export const WARD_PLAN={width:1200,height:1900,scale:.04,origin:{x:580,y:915},crossing:{x:700,y:40},crossPassage:{x:400,y:1070,w:360,h:45},
  leftRooms:[['7F01',88,218],['7F02',218,335],['7F03',335,442],['7F05',442,554],['7F06',554,668],['7F07',668,777],['7F08',777,887],['7F09',887,997],['7F10',997,1113],['7F11',1113,1220],['7F12',1220,1335],['7F13',1335,1465]].map(([id,y,end])=>({id,x:130,y,w:270,h:end-y,side:1})),
  rightRooms:[['7F25',330,442],['7F23',442,554],['7F22',554,668],['7F21',668,777],['7F20',777,887],['7F19',887,997],['7F18',997,1113],['7F17',1113,1220],['7F16',1220,1335],['7F15',1335,1465]].map(([id,y,end])=>({id,x:760,y,w:270,h:end-y,side:-1})),
  core:[['護理長室',462,300,80,110],['準備室',590,300,105,240],['治療室',462,410,128,105],['討論室',462,515,128,245],['庫房',590,540,105,220],['護理師更衣室',462,760,158,120],['儀器室',620,760,75,120],['檢查室',462,880,233,114],['茶水間',462,994,103,76],['污衣間',565,994,85,76],['清潔間',650,994,45,76],['洗衣烘乾室',462,1115,78,115],['污物間',540,1115,75,115],['洗手間',615,1115,80,115],['耳鼻喉科教學討論室',462,1230,118,135],['協談室',580,1230,115,135],['值班室 (2)',462,1365,113,100],['值班室 (1)',575,1365,120,100]].map(([id,x,y,w,h])=>({id,x,y,w,h})),
  landmarks:[{id:'護理站',x:455,y:95,w:240,h:145},{id:'訪客電梯廳',x:760,y:20,w:380,h:210},{id:'管道間 #02',x:760,y:235,w:240,h:95},{id:'交誼廳',x:495,y:1525,w:170,h:310},{id:'管道間 #01',x:335,y:1550,w:160,h:250},{id:'樓梯',x:665,y:1540,w:125,h:225}],
  outline:[[130,80],[355,80],[355,0],[1140,0],[1140,250],[1000,250],[1000,330],[1030,330],[1030,1470],[810,1470],[810,1790],[665,1790],[665,1835],[495,1835],[495,1800],[335,1800],[335,1550],[400,1550],[400,1470],[130,1470]]};
export const wardRooms=[...WARD_PLAN.leftRooms,...WARD_PLAN.rightRooms].map(room=>{const number=Number(room.id.slice(2));return{...room,bedCount:number>=12&&number<=20?1:number>=9&&number<=11?2:3};});
export function wardRoomType(room){return room.bedCount===1?'單人房':room.bedCount===2?'雙人房':'三床房';}
export function wardPoint(x,y){return{x:(WARD_PLAN.origin.x-x)*WARD_PLAN.scale,z:(WARD_PLAN.origin.y-y)*WARD_PLAN.scale};}
export function wardRect(r){const p=wardPoint(r.x+r.w/2,r.y+r.h/2);return{...p,w:r.w*WARD_PLAN.scale,d:r.h*WARD_PLAN.scale};}
export function wardCorridorSegments(from,to){const p=wardRect(WARD_PLAN.crossPassage);return[[from,p.z-p.d/2-.15],[p.z+p.d/2+.15,to]];}
export function wardBedPositions(room){const r=wardRect(room),inner=r.x-room.side*r.w/2;return(room.bedCount===1?[.52]:room.bedCount===2?[.32,.72]:[.23,.52,.81]).map((fraction,index)=>({x:inner+room.side*r.w*fraction,z:r.z-.65,index}));}
export function floorplanSVG(){
  const W=WARD_PLAN.width,H=WARD_PLAN.height;
  const rect=(r,kind)=>{
    const x=W-r.x-r.w,y=H-r.y-r.h,text=(DUTY_ROOMS[r.id]?.name||r.id).replace(/ /g,''),columns=Math.max(1,Math.floor((r.w-14)/28));
    const rows=kind==='room'?[text]:(text.match(new RegExp(`.{1,${columns}}`,'gu'))||[text]);
    const beds=kind==='room'?Array.from({length:r.bedCount},(_,i)=>{const bx=x+r.w/2+(i-(r.bedCount-1)/2)*66;return`<g class="plan-bed"><rect x="${bx-21}" y="${y+r.h/2+12}" width="42" height="28" rx="3"/><path d="M${bx-21},${y+r.h/2+20}h42"/></g>`;}).join(''):'';
    const font=kind==='room'?42:Math.min(28,(r.h-14)/(rows.length*1.2)),line=font*1.2,top=y+r.h/2-(kind==='room'?17:0)-(rows.length-1)*line/2;
    return`<g class="plan-${kind}"${kind==='room'?` aria-label="${r.id}，${wardRoomType(r)}"`:''}><rect x="${x}" y="${y}" width="${r.w}" height="${r.h}"/><text dominant-baseline="middle" text-anchor="middle" style="font-size:${font}px">${rows.map((row,i)=>`<tspan x="${x+r.w/2}" y="${top+i*line}">${row}</tspan>`).join('')}</text>${beds}</g>`;
  };
  const passage=WARD_PLAN.crossPassage;
  return`<svg viewBox="0 0 ${W} ${H}" class="ward-floorplan" role="img" aria-label="七樓平面圖：護理站與訪客梯在下方，值班室與交誼廳在上方，7F01至13在右側，7F25至15在左側，G棟連通口在下方電梯廳側，茶水間後方橫向走廊可通行"><path class="plan-outline" d="M${WARD_PLAN.outline.map(([x,y])=>`${W-x},${H-y}`).join('L')}Z"/>${wardRooms.map(r=>rect(r,'room')).join('')}${WARD_PLAN.core.map(r=>rect(r,'core')).join('')}${WARD_PLAN.landmarks.map(r=>rect(r,'landmark')).join('')}<path class="plan-route" d="M${W-430},${H-60}V${H-1500}H${W-730}V${H-WARD_PLAN.crossing.y}M${W-430},${H-passage.y-passage.h/2}H${W-730}"/><text x="${W-WARD_PLAN.crossing.x}" y="${H-WARD_PLAN.crossing.y}" text-anchor="middle" class="plan-crossing">↔ 往 G 棟</text></svg>`;
}
