import {WARD_PLAN,wardRooms,wardRect,wardPoint,wardBedPositions,wardCorridorSegments} from './ward-plan.js';
import {NURSING_STATION} from './ward-life.js';
import {OR_ROOMS} from './operating-plan.js';

// Small props are instanced by material so a full ward stays inexpensive to draw.
// This layer has no collision or task data: equipment cannot close an existing route.
export function createHospitalDetails(THREE,root){
  const ink=0x304555,steel=0xa5b4bc,lightSteel=0xd0dad9,cream=0xe3dfd2,wood=0xa78a66,teal=0x668e94,navy=0x3c536c;
  const geometries={box:new THREE.BoxGeometry(1,1,1),cylinder:new THREE.CylinderGeometry(1,1,1,12),sphere:new THREE.SphereGeometry(1,12,8)};
  const batches=new Map(),materials=new Map(),scratch=new THREE.Object3D(),ownTextures=[],ownMaterials=[];
  function material(color,glow=false){const key=color+'|'+glow;if(!materials.has(key)){const m=new THREE.MeshStandardMaterial({color,roughness:.78,metalness:color===steel?.32:.04,emissive:glow?color:0,emissiveIntensity:glow?.6:0});materials.set(key,m);}return materials.get(key);}
  function part(shape,x,y,z,w,h,d,color,rx=0,ry=0,rz=0,glow=false){const key=shape+'|'+color+'|'+glow;if(!batches.has(key))batches.set(key,{shape,material:material(color,glow),matrices:[]});scratch.position.set(x,y,z);scratch.scale.set(w,h,d);scratch.rotation.set(rx,ry,rz);scratch.updateMatrix();batches.get(key).matrices.push(scratch.matrix.clone());}
  const box=(x,y,z,w,h,d,c,glow=false)=>part('box',x,y,z,w,h,d,c,0,0,0,glow);
  const cylinder=(x,y,z,r,h,c)=>part('cylinder',x,y,z,r,h,r,c);
  function rod(a,b,r,c=steel){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);scratch.position.copy(start.add(end).multiplyScalar(.5));scratch.scale.set(r,delta.length(),r);scratch.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());scratch.updateMatrix();const key='cylinder|'+c+'|false';if(!batches.has(key))batches.set(key,{shape:'cylinder',material:material(c),matrices:[]});batches.get(key).matrices.push(scratch.matrix.clone());}
  function wheel(x,z,y=.18,r=.11){part('cylinder',x,y,z,r,.1,r,ink,0,0,Math.PI/2);box(x,y+.13,z,.08,.2,.1,steel);}
  function cable(points,r=.035,color=ink){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,20,r,6,false),material(color));mesh.castShadow=true;root.add(mesh);}
  function castors(x,z,w,d){for(const a of [-1,1])for(const b of [-1,1])wheel(x+a*w/2,z+b*d/2);}
  function shadow(x,z,w,d,opacity=.18){
    let texture=ownTextures.find(t=>t.name==='contact');if(!texture){const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const ctx=canvas.getContext('2d'),g=ctx.createRadialGradient(48,48,6,48,48,46);g.addColorStop(0,'rgba(15,30,48,.72)');g.addColorStop(.5,'rgba(15,30,48,.32)');g.addColorStop(1,'rgba(15,30,48,0)');ctx.fillStyle=g;ctx.fillRect(0,0,96,96);texture=new THREE.CanvasTexture(canvas);texture.name='contact';ownTextures.push(texture);}
    const m=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});ownMaterials.push(m);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),m);mesh.rotation.x=-Math.PI/2;mesh.position.set(x,.105,z);root.add(mesh);
  }
  function surface(kind,x,y,z,w,h,rotation=0){
    let texture=ownTextures.find(t=>t.name===kind);if(!texture){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=320;const ctx=canvas.getContext('2d');ctx.fillStyle=kind==='vitals'?'#142d3a':kind==='notice'?'#c4b291':'#dbe5e5';ctx.fillRect(0,0,512,320);
      if(kind==='vitals'){ctx.strokeStyle='#29434c';ctx.lineWidth=1;for(let i=0;i<512;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,320);ctx.stroke();}for(let i=0;i<320;i+=32){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}for(let row=0;row<3;row++){ctx.strokeStyle=['#9ed9b0','#d8b879','#82bfc7'][row];ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<420;i++){const q=i%95,pulse=q>30&&q<40?-(q-30)*3:q>=40&&q<45?-30+(q-40)*10:q>=45&&q<55?20-(q-45)*2:Math.sin(i*.08)*2;const yy=65+row*85+pulse;i?ctx.lineTo(18+i,yy):ctx.moveTo(18+i,yy);}ctx.stroke();ctx.fillStyle=['#9ed9b0','#d8b879','#82bfc7'][row];ctx.font='30px monospace';ctx.fillText(['76','98','18'][row],446,75+row*85);}}
      else if(kind.startsWith('bed-')){ctx.fillStyle='#ede7d7';ctx.fillRect(0,0,512,320);ctx.fillStyle='#314f62';ctx.font='bold 240px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(kind.slice(4),256,168);}
      else if(kind==='notice'){for(let i=0;i<6;i++){const px=18+i%3*163,py=20+Math.floor(i/3)*150;ctx.fillStyle=i%2?'#e4e5d7':'#f0e8d8';ctx.fillRect(px,py,144,128);ctx.fillStyle=['#a87c62','#567c86','#8f9c78'][i%3];ctx.fillRect(px+10,py+12,124,12);for(let j=0;j<5;j++){ctx.fillStyle='#8c9a9a';ctx.fillRect(px+10,py+38+j*14,90+(j%2)*25,3);}}}
      else{ctx.fillStyle='#304c60';ctx.fillRect(0,0,512,38);ctx.fillStyle='#98b7bc';ctx.fillRect(14,54,108,248);for(let i=0;i<9;i++){ctx.fillStyle=i%2?'#b9cccc':'#d4e0da';ctx.fillRect(136,54+i*27,360,22);ctx.fillStyle='#859fa6';ctx.fillRect(148,62+i*27,110,4);ctx.fillRect(290,62+i*27,175,4);}}
      texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.name=kind;ownTextures.push(texture);
    }
    const m=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});ownMaterials.push(m);const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,h),m);mesh.position.set(x,y,z);mesh.rotation.y=rotation;root.add(mesh);
  }
  function medicalPanel(x,z,width=2.25){box(x,1.7,z,width,.32,.16,cream);box(x,1.69,z+.09,width-.16,.09,.025,navy);for(const [i,c] of [0x709c82,0xe0c46e,0x8aabc3].entries()){cylinder(x-.57+i*.3,1.83,z+.12,.065,.04,c);box(x-.57+i*.3,1.64,z+.12,.12,.06,.025,ink);}box(x+.67,1.77,z+.12,.28,.19,.025,lightSteel);}
  function ivPole(x,z,small=true){const h=small?2.45:3.5;cylinder(x,.28,z,.055,.4,steel);rod([x,.2,z],[x,h,z],.025);rod([x-.25,h-.06,z],[x+.25,h-.06,z],.025);for(const a of [0,2.1,4.2])rod([x,.3,z],[x+Math.sin(a)*.4,.16,z+Math.cos(a)*.4],.025);box(x+.16,h-.43,z,.2,.52,.12,0xc3d6d3);box(x+.16,h-.12,z,.13,.055,.1,cream);rod([x+.16,h-.68,z],[x+.12,.85,z+.12],.012,0xd6e2d8);}
  function cabinet(x,z,w=.65,h=.85,d=.65){box(x,h/2+.15,z,w,h,d,wood);box(x,h+.18,z,w+.06,.08,d+.06,cream);for(let i=0;i<2;i++){box(x,.3+i*.33,z+d/2+.015,w-.07,.025,.025,0x7b756b);box(x,.48+i*.33,z+d/2+.04,w*.3,.04,.04,steel);}shadow(x,z,w+1,d+1,.16);}
  function bottle(x,y,z,c=0x759a9d,r=.065){cylinder(x,y+.13,z,r,.26,c);cylinder(x,y+.28,z,r*.6,.05,cream);}
  function cup(x,y,z){cylinder(x,y+.12,z,.09,.24,cream);cylinder(x,y+.25,z,.1,.03,wood);rod([x,y+.25,z],[x+.02,y+.46,z],.012,cream);}
  function trolley(x,z,color=0x557e86,w=1.25){box(x,.76,z,w,1.03,.77,color);box(x,1.32,z,w+.12,.09,.86,lightSteel);for(let i=0;i<4;i++){box(x,.42+i*.22,z+.395,w-.13,.018,.02,ink);box(x,.51+i*.22,z+.425,.55,.035,.035,steel);}castors(x,z,w-.25,.55);rod([x-w*.48,1.38,z-.35],[x+w*.48,1.38,z-.35],.035);box(x-.2,1.44,z,.44,.12,.31,cream);bottle(x+.38,1.37,z);shadow(x,z,w+1,1.7,.28);}
  function bin(x,z,color=0x5c7d84){cylinder(x,.4,z,.25,.66,color);cylinder(x,.75,z,.28,.08,cream);box(x,.79,z,.32,.04,.28,color);box(x,.15,z+.24,.18,.04,.16,steel);}
  function workstation(x,z,rotation=0){
    box(x,1.48,z,.85,.03,.35,ink);for(let row=0;row<4;row++)for(let col=0;col<8;col++)box(x-.34+col*.09,1.5,z-.12+row*.07,.065,.015,.043,lightSteel);part('sphere',x+.62,1.5,z+.04,.11,.04,.16,navy);surface('work',x,2.05,z+(rotation===Math.PI?.1:-.3),1.19,.72,rotation);box(x-.78,1.51,z,.36,.05,.48,cream);for(let i=0;i<4;i++)box(x-.8,1.55,z-.16+i*.08,.24,.009,.012,0xa0afb0);cup(x+1.04,1.45,z);
  }
  function lamp(x,z){cylinder(x,1.48,z,.23,.06,ink);rod([x,1.48,z],[x+.15,2.07,z],.035,navy);rod([x+.15,2.07,z],[x+.65,2.18,z],.035,navy);box(x+.65,2.15,z,.4,.12,.22,cream);box(x+.65,2.08,z,.34,.025,.18,0xffdeb0,true);}
  function light(x,y,z,intensity=7,distance=10){const lamp=new THREE.PointLight(0xffdcab,intensity,distance,2);lamp.position.set(x,y,z);root.add(lamp);}
  function wardBed(room,b){const x=b.x,z=b.z;
    box(x,.32,z,1.48,.14,1.7,ink);for(const a of [-1,1])for(const c of [-1,1]){wheel(x+a*.67,z+c*.88,.15,.095);box(x+a*.67,.37,z+c*.88,.1,.36,.1,steel);}
    for(const side of [-1,1]){box(x+side*.93,1.12,z,.06,.06,1.72,lightSteel);for(let i=0;i<4;i++)box(x+side*.93,1.01,z-.64+i*.42,.045,.25,.045,steel);box(x+side*.98,.91,z+.69,.08,.11,.19,navy);}
    box(x,.92,z-1.21,1.91,.46,.12,navy);box(x,1.06,z-1.28,.65,.1,.025,wood);box(x,.96,z+1.23,1.91,.44,.13,0x6e8994);box(x,.97,z+1.305,.55,.18,.02,cream);
    if(room.bedCount>1)surface('bed-'+'ABC'[b.index],x,.97,z+1.32,.3,.17);
    box(x,.997,z-.36,1.72,.055,.2,0xe0ded4);for(let i=0;i<7;i++)box(x,1.054,z-.08+i*.165,1.67,.012,.014,i%2?0xa4bbc0:0x8fabb2);
    const pillow=0xf1eadd;box(x,1.08,z-.78,1.34,.055,.46,pillow);for(const side of [-1,1])box(x+side*.68,1.025,z-.78,.035,.09,.43,0xd0d1c6);
    medicalPanel(x,wardRect(room).z-wardRect(room).d/2+.16);
    const side=room.side,cx=x+side*1.25,cz=z-.84;cabinet(cx,cz,.46,.7,.48);bottle(cx,.92,cz,0x7f9eaa,.045);box(cx,.97,cz+.13,.24,.03,.16,cream);
    if(b.index===0){ivPole(x-side*1.16,z-.88);if(['7F23','7F25','7F01'].includes(room.id)){box(x-side*1.2,1.4,z-.83,.53,.39,.11,ink);surface('vitals',x-side*1.2,1.4,z-.765,.46,.3);}}
    shadow(x,z,2.9,3.3,.38);
  }
  function coreRoom(item){const r=wardRect(item),id=item.id;box(r.x,1.19,r.z-r.d/2,r.w,.09,.18,navy);box(r.x,1.19,r.z+r.d/2,r.w,.09,.18,navy);for(const side of [-1,1])box(r.x+side*r.w/2,1.19,r.z,.18,.09,r.d,navy);
    if(id.startsWith('值班室')){
      const tx=r.x-1.38,tz=r.z-1.0;box(tx,.1,tz,1.45,.04,1.7,0xc5d4d0);box(tx+.78,.62,tz,.1,1.24,1.8,cream);box(tx,.62,tz-.85,1.5,1.24,.1,cream);
      box(tx,.72,tz-.55,.64,1.15,.3,0xe4e6dd);part('sphere',tx,.52,tz,.4,.22,.55,0xf5f2e6);part('sphere',tx,.68,tz+.06,.26,.025,.34,0x728a8e);box(tx,.28,tz,.4,.42,.56,0xe1e5db);box(tx,.79,tz-.39,.17,.035,.06,steel);
      box(tx-.48,.95,tz-.45,.32,.4,.13,cream);cylinder(tx-.48,.73,tz-.32,.1,.24,0xf1e9db);box(r.x+.6,1.55,r.z-1.88,1.5,.7,.06,navy);light(r.x+.8,2.1,r.z-.7,4,6);return;
    }
    if(id==='檢查室'){trolley(r.x-3.1,r.z-.3,navy,.9);ivPole(r.x-2.6,r.z-.8);bottle(r.x-3.1,1.38,r.z-.3);return;}
    if(id==='討論室'||id.includes('教學')){for(const dz of [-.7,.7])for(const dx of [-.8,.8]){box(r.x+dx,.62,r.z+dz,.57,.14,.55,navy);box(r.x+dx,.95,r.z+dz+.23,.57,.7,.08,navy);}box(r.x,.99,r.z,1.5,.045,.65,wood);box(r.x,.68,r.z,.15,.66,.15,steel);box(r.x,1.04,r.z,.47,.02,.35,cream);if(id==='討論室'){cylinder(r.x+.25,1.19,r.z,.3,.26,0xc39d69);cylinder(r.x+.25,1.34,r.z,.32,.05,0x6f8d94);for(let i=0;i<3;i++)box(r.x-.52+i*.15,1.09,r.z+.07,.12,.12,.32,[0xc6aa77,0x8ca79c,0xbd876d][i]);}return;}
    if(id==='庫房'||id==='準備室'){for(const dx of [-r.w*.28,r.w*.28]){box(r.x+dx,1.05,r.z,.08,1.8,.68,steel);for(let row=0;row<3;row++){box(r.x+dx,.42+row*.5,r.z,r.w*.4,.06,.75,steel);for(let col=0;col<2;col++)box(r.x+dx+(col-.5)*r.w*.17,.61+row*.5,r.z,r.w*.15,.3,.53,[0x698593,0xb29779,0x849485][(row+col)%3]);}}return;}
    if(id==='污物間'||id==='污衣間'||id==='清潔間'){for(let i=0;i<Math.min(3,Math.floor(r.w/.7));i++)bin(r.x+(i-1)*.65,r.z,[0x719a98,0xb69c62,0xac796c][i]);return;}
    if(id==='茶水間'){box(r.x-.8,1,r.z,.65,1.8,.66,0xd9ddd4);box(r.x-.8,1.56,r.z+.35,.1,.06,.03,ink);cylinder(r.x+.4,1.05,r.z,.17,.44,ink);cup(r.x+.85,1,r.z);return;}
    if(id==='護理師更衣室'){for(let i=0;i<4;i++){box(r.x+(i-1.5)*.9,.95,r.z,.84,1.7,.8,0x8b9aa1);box(r.x+(i-1.5)*.9+.23,1.07,r.z+.42,.04,.22,.04,ink);}return;}
    if(id.includes('洗手')||id.includes('洗衣')){box(r.x,.75,r.z,.85,1.25,.75,cream);cylinder(r.x,1.4,r.z,.25,.03,steel);return;}
    const deskWidth=Math.max(.8,r.w*.6);box(r.x,.94,r.z,deskWidth,.12,.85,wood);for(const dx of [-1,1])for(const dz of [-1,1])box(r.x+dx*(deskWidth/2-.12),.5,r.z+dz*.3,.07,.85,.07,steel);box(r.x,1.02,r.z,.64,.025,.35,cream);cup(r.x+.5,1.01,r.z);
  }
  function ward(){
    for(const room of wardRooms){const r=wardRect(room),inner=r.x-room.side*r.w/2;for(const b of wardBedPositions(room))wardBed(room,b);
      box(r.x,1.29,r.z-r.d/2,r.w,.13,.18,navy);box(r.x,.28,r.z-r.d/2+.1,r.w,.07,.1,wood);box(inner,.15,r.z,1.1,.025,1.7,0x9faeae);
      for(let x=r.x-r.w/2+1.3;x<r.x+r.w/2;x+=1.3)box(x,.094,r.z,.015,.008,r.d-.12,0xaab5b5);for(let z=r.z-r.d/2+1.3;z<r.z+r.d/2;z+=1.3)box(r.x,.094,z,r.w-.1,.008,.015,0xaab5b5);
      const beds=wardBedPositions(room);for(let i=1;i<beds.length;i++){const x=(beds[i-1].x+beds[i].x)/2;rod([x,2.33,r.z-1.95],[x,2.33,r.z+.85],.028);for(let j=0;j<5;j++){box(x,1.55,r.z-1.72+j*.12,.1,1.5,.09,j%2?0x7a9b9e:0x95b4b2);part('cylinder',x,2.24,r.z-1.73+j*.12,.04,.035,.04,steel,0,0,Math.PI/2);}}
    }
    for(const room of WARD_PLAN.core)coreRoom(room);
    const layout=NURSING_STATION,s=layout.center,front=layout.frontZ;box(s.x,.2,front+.72,10.2,.08,.055,ink);box(s.x,1.26,front+.72,10.1,.035,.035,0xffd7a3,true);for(const x of [-4,-2,0,2,4])box(x,.75,front+.73,.018,.95,.035,0x7b674f);
    for(const c of layout.computers)workstation(c.x,c.z-.2,Math.PI);light(s.x,3.5,s.z,18,12);
    const px=layout.printer.x,pz=layout.printer.z;for(let i=0;i<3;i++)box(px,1.55+i*.03,pz+.65,.85,.018,.45,cream);
    for(let i=0;i<3;i++)box(-3.4+i*.17,1.65,front,.12,.5,.4,[0x617f95,0xad8b69,0x6e9291][i]);bottle(-4,1.43,front);cup(-.2,1.43,front);

    trolley(4.35,25.4,0x9f6e64,1.05);trolley(-3.6,20.7,teal,1.05);surface('notice',-2.4,1.75,24.7,2.8,1.4);box(-2.4,1.75,24.6,3,1.6,.12,wood);
    for(const x of [-17.9,-14.4,-10.9]){box(x,.19,32.6,2.8,.13,1.1,ink);for(let j=0;j<3;j++){box(x+(j-1)*.87,.67,32.6,.8,.18,.92,navy);box(x+(j-1)*.87,1.05,32.95,.8,.72,.12,navy);}shadow(x,32.6,3.6,1.6,.17);}
    for(const x of [-14.4,-17.9,-10.9]){for(const dx of [-1.15,1.15])box(x+dx,1.28,30, .07,2.45,.07,steel);box(x,2.55,30,2.8,.1,.16,navy);box(x,1.25,30,.025,2.3,.04,0x4e687a);box(x+1.8,1.3,30.15,.25,.38,.06,ink);box(x+1.8,1.35,30.2,.08,.08,.03,0xd5b477,true);}
    for(const x of [-4.9,4.9])for(const [from,to] of wardCorridorSegments(-22.5,22.5))box(x,.25,(from+to)/2,.07,.12,to-from,wood);
    for(const x of [-5.1,5.1])for(const [from,to] of wardCorridorSegments(-24.5,26.5))box(x,.12,(from+to)/2,.12,.015,to-from,0x91a8b2);
    const lounge=wardRect(WARD_PLAN.landmarks.find(r=>r.id==='交誼廳'));cabinet(lounge.x,lounge.z+2,2.5,1.2,1.2);cup(lounge.x-.5,1.45,lounge.z+2);box(lounge.x+.4,1.47,lounge.z+2,.65,.03,.42,cream);
  }
  function clinic(){
    for(let i=0;i<8;i++){const x=-13.7+i*3.8;for(const side of [-1,1]){box(x+side*1.82,.7,-11.86,.018,1.18,.025,0x796d60);box(x+side*1.82,2.9,-12.83,.018,1,.025,0x796d60);}for(const y of [.35,.8,1.11]){box(x,y,-11.86,3.45,.015,.02,0x927a5f);box(x+.85,y+.12,-11.82,.36,.035,.035,steel);}}
    workstation(-10.5,5.8,Math.PI);workstation(-4.8,5.8,Math.PI);box(-7.3,1.96,6.92,.65,.06,.18,ink);for(let i=0;i<3;i++)box(-7.3,1.8+i*.03,7.05,.85,.018,.45,cream);surface('notice',-10,2.9,-12.8,3.2,.9);
    for(const x of [0,8]){castors(x+3,-4.4,2.5,1.8);for(let i=0;i<5;i++){box(x+3,.4+i*.23,-3.12,2.8,.018,.025,0x607680);box(x+3,.5+i*.23,-3.09,.4,.035,.04,steel);}for(let i=0;i<5;i++){rod([x+2.35+i*.18,1.75,-4.3],[x+2.35+i*.18,1.75,-3.6],.018,steel);bottle(x+2+i*.35,1.72,-5.2,i%2?cream:0x8daeb0);}for(const dx of [-.9,.9])box(x+dx,1.4,-4.2,.17,.08,1,steel);box(x,2.77,-5.2,.67,.06,.22,0x556f80);shadow(x,-4.4,3.8,4.7,.3);ivPole(x+1.45,-6.1);for(let j=0;j<3;j++)cable([[x+2.3+j*.35,1.6,-3.1],[x+2.4+j*.35,.6,-2.8],[x+2.4+j*.35,.4,-3.2]],.023,0x4c6578);}
    for(const x of [5,5.8]){box(x,2.1,-13.87,.27,.36,.015,ink);box(x,1.64,-13.83,.17,.15,.08,cream);}box(5.8,1.78,-12.3,.08,.16,.04,cream);bin(8,-11.2,0xb18b63);bin(9,-11.2,0x719391);trolley(13,-7,teal);lamp(-12.4,5.4);
  }
  function operating(number){
    for(const dx of [-1,1])for(const dz of [-1,1])wheel(dx*1.05,-.8+dz*1.9,.2,.17);box(0,.42,-.8,1.7,.45,2.4,ink);for(let i=0;i<9;i++)box(0,1.59,-1.9+i*.34,2.42,.018,.02,i%2?0x74a79a:0x438672);
    for(const x of [-5.5,5.5]){castors(x,-1.5,2,1.3);for(let i=0;i<6;i++)rod([x-.8+i*.28,1.78,-2.05],[x-.8+i*.28,1.78,-1.35],.026,steel);for(const dx of [-1,1])rod([x+dx*1.15,1.78,-2.2],[x+dx*1.15,1.78,-.8],.025);shadow(x,-1.5,3.8,2.6,.25);}
    for(const x of number===16?[4,8]:[]){const z=x===4?-8:-7;box(x,.9,z,2.2,1.5,1.6,cream);surface('vitals',x,2.05,z+.1,1.19,.72);for(let i=0;i<3;i++)box(x,1.3-i*.27,z+.98,1.8,.2,.08,cream);for(const dx of [-.5,.5])cylinder(x+dx,1.57,z+1.04,.12,.07,0x6e9c9b);}
    if(number===13){rod([4,.3,-8],[4,1.6,-8],.055,steel);castors(4,-8,1,1);surface('vitals',4,2.05,-7.9,1.19,.72);}
    ivPole(-4,-5,false);ivPole(6,-4.8,false);if(number===16){cable([[4,1.5,-7.1],[3.3,.8,-6.2],[2,1.2,-4.5],[.4,1.6,-2.6]],.09,0xa8bdad);cable([[8,.4,-6],[8,.12,-4.5],[6,.12,-4],[6,.5,-3.6]],.045,ink);}trolley(-10,1,teal,1.5);bin(-10,-4.6,0xb29568);bin(-11,-4.6,0x74978b);
    for(const x of [-2.5,2.5]){cylinder(x,4.12,-1.8,.83,.025,0x6c9693);for(let i=0;i<10;i++){const a=i*Math.PI/5;part('sphere',x+Math.cos(a)*.62,4.16,-1.8+Math.sin(a)*.62,.12,.045,.12,0xe4efd5);}rod([x,3.5,-1.8],[x,3.1,-1.8],.04,lightSteel);rod([x-.25,3.1,-1.8],[x+.25,3.1,-1.8],.035,lightSteel);shadow(x,-1.8,3.3,3.3,.1);}
    for(let i=0;i<5;i++){box(-7.8+i*3.7,1.6,-11.5,3.5,2.7,.08,0xa8b98b);box(-7.8+i*3.7,.32,-11.4,3.5,.08,.09,steel);}surface('notice',-8,2,-11.35,2,1.3);box(9,1.3,10.35,.35,.5,.08,ink);box(9,1.3,10.29,.12,.1,.025,0xb8d3b0,true);shadow(0,-.8,6.4,8,.4);
  }
  function operatingCorridor(){for(const r of OR_ROOMS){const side=Math.sign(r.z),front=r.z-side*r.d/2;for(const dx of [-1,1]){box(r.x+dx*r.w/2,1.64,r.z,.2,.09,r.d,navy);box(r.x+dx*4.5,1.43,front,5,.09,.2,navy);}box(r.x,3.13,r.z+side*r.d/2,r.w,.09,.23,navy);if([13,16].includes(r.number)){box(r.x,2.76,front,3.9,.14,.3,steel);box(r.x,1.69,front-side*.16,2.1,.75,.03,navy);box(r.x,1.69,front-side*.18,1.9,.58,.03,0x93adb3);box(r.x,.35,front-side*.16,3.5,.38,.03,steel);box(r.x+1.2,1.05,front-side*.2,.45,.08,.08,steel);box(r.x+2.3,1.6,front-side*.24,.27,.46,.06,cream);box(r.x+2.3,1.7,front-side*.28,.1,.08,.025,0xa6c6b0,true);}}
    workstation(15,11.4);trolley(19,13.5,teal);for(const z of [-2.9,2.9])box(0,.12,z,54,.015,.08,0xc9d0b9);
  }
  function emergency(){for(const x of [-9,9]){medicalPanel(x,-7.1,3.4);ivPole(x-1.8,-5.8,false);for(const a of [-1,1])for(const b of [-1,1])wheel(x+a*1.1,-4+b*2,.18,.15);shadow(x,-4,4.5,7,.3);surface('vitals',x+3.2,2.05,-5.4,1.2,.72);}trolley(-2,-5.8,0xa36e63,1.5);bin(13,-9);workstation(-3,-9.6);workstation(0,-9.6);surface('notice',-7.5,2.3,-13,2.8,1.6);}
  function lobby(){
    surface('notice',6,2,-9.39,5.9,3.0);
    for(let i=0;i<6;i++){const x=3.55+i%3*2.04,z=-9.31;box(x,3.17-Math.floor(i/3)*1.46,z,.1,.1,.05,[0xaa7967,0x648e9b,0xb9a067][i%3]);}
    for(const x of [-11.4,11.4]){box(x,.46,-1,.07,.13,15,wood);box(x,1.2,-1,.12,.1,15,navy);for(const z of [-7,-3,1,5])box(x,.8,z,.08,.75,.09,steel);}
    for(let z=-8;z<9;z+=1.7)box(0,.09,z,23.8,.01,.025,0xa6b6b5);
    for(const x of [-9,-5,-1]){box(x,2.25,-10.2,3.5,2.5,.08,navy);box(x,2.25,-10.1,3.24,2.25,.025,0x9db6c4);box(x,2.25,-10.06,.08,2.3,.04,steel);box(x,2.25,-10.05,3.2,.08,.04,steel);}
    box(-9,.9,1,1.2,1.7,1.15,cream);box(-9,1.3,1.61,.72,.43,.03,navy);for(const x of [-9.23,-8.77]){cylinder(x,1.35,1.64,.06,.07,x<-9?0xa97768:0x739caa);box(x,1.02,1.65,.12,.06,.14,steel);}box(-9,.96,1.66,.8,.04,.13,steel);cup(-8.3,1.76,1);
    bin(10,-1,teal);bin(10,1,0xb49b69);cabinet(10,-5,1.1,.9,.8);box(10,1.11,-5,.65,.06,.5,cream);
    for(const x of [-7,-5.5,-4,-2.5]){shadow(x,-5,1.8,1.8,.2);box(x,.36,-5,.08,.52,.08,steel);}
    light(5,4,-6,10,12);light(-6,4,2,8,11);
  }
  function flush(){for(const batch of batches.values()){const mesh=new THREE.InstancedMesh(geometries[batch.shape],batch.material,batch.matrices.length);batch.matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);}root.userData.detailMaterials=[...materials.values(),...ownMaterials];root.userData.detailTextures=ownTextures;}
  return{ward,clinic,operating,operatingCorridor,emergency,lobby,flush};
}
