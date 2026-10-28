import * as THREE from '../vendor/three.module.js';
import {operatingTeam} from './or-team.js';
import {LOCATIONS} from './ent-data.js';
import {ART} from './art.js';
import {SPRITE_ATLASES,SCRUB_ATLASES} from './sprite-frames.js';
import {WARD_PLAN,wardRooms,wardPoint,wardRect,wardBedPositions,wardCorridorSegments} from './ward-plan.js';
import {bedId,bedLabel,bedApproach} from './morning-events.js';
import {NURSING_STATION,bedPatientVisible,wardEventPatientSpot} from './ward-life.js';
import {DUTY_ROOMS} from './scene-life.js';
import {createResidentRest} from './resident-rest.js';
import {createHospitalDetails} from './scene-details.js';
import {OR_DINING,OR_ROOMS,OR_WINGS,OR_INTERIORS,operatingDoor,operatingSpot} from './operating-plan.js';

const C={floor:0xb9b9b3,wall:0xb4ada0,trim:0x89755c,wood:0x9f784f,dark:0x243a50,green:0x527b7a,blue:0x537d9b,steel:0x8596a1,ivory:0xe0dbce,ink:0x35495b};

export function createWorld(canvas){
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8));
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x516271);scene.fog=new THREE.Fog(0x516271,65,140);
  const camera=new THREE.OrthographicCamera(-17,17,13,-13,.1,180);
  const sun=new THREE.DirectionalLight(0xffd7a5,2.25);sun.position.set(-15,35,18);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-36;sun.shadow.camera.right=36;sun.shadow.camera.top=36;sun.shadow.camera.bottom=-36;sun.shadow.normalBias=.05;sun.shadow.bias=-.0002;sun.shadow.radius=3;scene.add(sun,sun.target);
  const hemi=new THREE.HemisphereLight(0x91b4d4,0x34415a,1.85);scene.add(hemi);
  const fill=new THREE.DirectionalLight(0x8fb9df,.55);fill.position.set(16,9,-20);scene.add(fill);
  const ambient=new THREE.AmbientLight(0xffffff,.3);scene.add(ambient);
  const materials=new Map(),textures=new Map();let root=new THREE.Group();scene.add(root);
  let clinicNurse=null,clinicNurseAway=true;
  let clinicTubeState=null,clinicTubeGroup=null,clinicTubeKey=null;
  let morningState=null,morningGroup=null,attending=null,companion=null,followTrail=[],escortState=null;
  let wardPatients=new Map(),wardPatientTask=false;let walkArea=null;let solids=[],spots=[],labels=[],bounds={x:18,z:26},path=[],goal=null,night=false,elapsed=0,loc='f7',walked=0,interiorRoom=null;
  const offset=new THREE.Vector3(17,27,24),look=new THREE.Vector3(0,0,7);
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),ground=new THREE.Plane(new THREE.Vector3(0,1,0),0),hit=new THREE.Vector3();
  const ramp=new THREE.DataTexture(new Uint8Array([75,75,75,255,150,150,150,255,215,215,215,255,255,255,255,255]),4,1,THREE.RGBAFormat);ramp.minFilter=THREE.NearestFilter;ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
  const edgeMaterial=new THREE.LineBasicMaterial({color:0x24364d,transparent:true,opacity:.26});
  let player=resident();scene.add(player);player.position.set(7,0,17);let spriteDirection=0,lastFrame=-1;const restActor=createResidentRest(THREE,scene,player);let restZoom=null;
  const halo=new THREE.Mesh(new THREE.RingGeometry(.62,.72,40),new THREE.MeshBasicMaterial({color:0xdcb27d,transparent:true,opacity:.7,side:THREE.DoubleSide}));halo.rotation.x=-Math.PI/2;halo.position.y=.045;scene.add(halo);
  const goalRing=new THREE.Mesh(new THREE.TorusGeometry(.75,.055,6,48),new THREE.MeshBasicMaterial({color:0xe5c292}));goalRing.rotation.x=-Math.PI/2;goalRing.position.y=.09;scene.add(goalRing);

  function mat(color,roughness=.82){const key=`${color}/${roughness}`;if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness:.06}));return materials.get(key);}
  function texture(kind){if(textures.has(kind))return textures.get(kind);const can=document.createElement('canvas');can.width=can.height=256;const ctx=can.getContext('2d');ctx.fillStyle=kind==='wood'?'#c5a577':'#eeecdf';ctx.fillRect(0,0,256,256);if(kind==='wood'){for(let i=0;i<40;i++){ctx.strokeStyle=`rgba(96,65,35,${.025+(i%4)*.009})`;ctx.beginPath();ctx.moveTo(0,i*7);ctx.bezierCurveTo(70,i*7-3,160,i*7+3,256,i*7);ctx.stroke();}}else{ctx.strokeStyle='#d9d9ca';ctx.lineWidth=1;ctx.strokeRect(0,0,256,256);for(let i=0;i<120;i++){ctx.fillStyle=i%2?'#e0e0d1':'#f6f5eb';ctx.fillRect((i*73)%256,(i*117)%256,1,1);}}const t=new THREE.CanvasTexture(can);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='wood'?1:8,kind==='wood'?1:12);textures.set(kind,t);return t;}
  const wood=new THREE.MeshStandardMaterial({map:texture('wood'),color:0xc3b7a2,roughness:.86});
  const flooring=new THREE.MeshStandardMaterial({map:texture('floor'),color:0xc2ced0,roughness:.69,metalness:.035});
  const wardTiles=texture('floor').clone();wardTiles.repeat.set(.58,.58);const wardFlooring=new THREE.MeshStandardMaterial({map:wardTiles,color:0xc2cbce,roughness:.76});
  function box(x,y,z,w,h,d,color,solid=false,parent=root){const geometry=new THREE.BoxGeometry(w,h,d);const m=new THREE.Mesh(geometry,color?.isMaterial?color:mat(color));m.position.set(x,y,z);m.castShadow=h>.18;m.receiveShadow=true;if(w>.55&&h>.24&&d>.3){const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geometry),edgeMaterial);m.add(edges);}parent.add(m);if(solid)solids.push({x,z,w:w/2+.35,d:d/2+.35});return m;}
  function cyl(x,y,z,r,h,color,parent=root){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat(color));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function sphere(x,y,z,r,color,parent=root){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),mat(color));m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  function line(a,b,r,color,parent=root){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),10),mat(color));m.position.copy(new THREE.Vector3(...a).add(new THREE.Vector3(...b)).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());m.castShadow=true;parent.add(m);return m;}
  function sign(text,x,y,z,width=4,bg='#263e52',fg='#eef1dc',flat=false){const can=document.createElement('canvas');can.width=768;can.height=144;const ctx=can.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,144);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='500 49px "PingFang TC",sans-serif';ctx.fillText(text,384,75,700);const tex=new THREE.CanvasTexture(can);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(width,width*144/768),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(x,y,z);if(flat)m.rotation.x=-Math.PI/2;root.add(m);return m;}
  function plant(x,z){cyl(x,.35,z,.4,.7,0xd4cbb1);const leaves=new THREE.Group();root.add(leaves);for(let i=0;i<6;i++){const a=i*Math.PI/3;const l=sphere(x+Math.sin(a)*.3,1.1+(i%2)*.28,z+Math.cos(a)*.3,.42,i%2?0x769d69:0x8fae70,leaves);l.scale.set(.6,1.6,.75);} }
  function person(x,z,color=0x516e7e,isPlayer=false){
    const g=new THREE.Group(),legs=[],arms=[];
    for(const a of [-.18,.18]){const leg=box(a,.77,0,.26,1.3,.3,0x253447,false,g);legs.push(leg);box(a,.13,.1,.29,.18,.5,0xb4b5b3,false,g);}
    box(0,1.94,0,.77,1.12,.42,color,false,g);box(0,2.55,0,.2,.2,.2,0xd5b299,false,g);
    if(isPlayer){box(0,1.97,.23,.5,.8,.05,0xe6e0d5,false,g);box(.2,2.24,.27,.17,.2,.025,0x55798a,false,g);}
    const head=sphere(0,2.94,0,.255,0xd5b299,g);head.scale.set(.88,1.15,.88);
    for(let i=0;i<7;i++){const a=i*.9;const tuft=sphere(Math.sin(a)*.17,3.14+(i%2)*.06,Math.cos(a)*.14,.16,0x263342,g);tuft.scale.set(1,.7,1);}
    box(0,2.86,.21,.31,.14,.04,0xb9d1d2,false,g);
    for(const a of [-.48,.48]){const arm=box(a,1.97,0,.22,.95,.27,color,false,g);arms.push(arm);sphere(a,1.42,0,.115,0xd5b299,g);}
    for(const side of [-1,1])sphere(side*.082,3.0,.233,.022,0x263342,g);box(.22,2.07,.235,.17,.21,.022,0xd4e0de,false,g);box(.22,2.13,.25,.12,.035,.012,0x6e929f,false,g);box(-.23,1.72,.23,.18,.025,.02,0xb9c7c8,false,g);g.position.set(x,0,z);g.userData={legs,arms};return g;
  }
  function resident(){const g=new THREE.Group(),fallback=person(0,0,0xe2dfd6,true);fallback.scale.set(1,1,1);g.add(fallback);const map=new THREE.TextureLoader().load(ART.sprites,()=>{fallback.visible=false;});map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearFilter;map.generateMipmaps=false;map.repeat.set(.25,.25);map.offset.set(0,.75);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,alphaTest:.18,depthWrite:true,toneMapped:false}));sprite.center.set(.5,.015);sprite.scale.set(4.5,4.5,1);g.add(sprite);g.userData={legs:[],arms:[],sprite,map,character:'male',outfit:'ward',maps:new Map([['male:ward',map]]),fallback};return g;}
  function setCharacter(character){const id=character==='female'?'female':'male',outfit=loc==='f5'?'scrubs':'ward',key=id+':'+outfit;if(player.userData.character===id&&player.userData.outfit===outfit)return;let map=player.userData.maps.get(key);if(!map){map=new THREE.TextureLoader().load(outfit==='scrubs'?ART.scrubs:ART.characters[id].sprites,()=>{player.userData.fallback.visible=false;});map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.LinearFilter;map.minFilter=THREE.LinearFilter;map.generateMipmaps=false;player.userData.maps.set(key,map);}player.userData.character=id;player.userData.outfit=outfit;player.userData.map=map;player.userData.sprite.material.map=map;player.userData.sprite.material.needsUpdate=true;lastFrame=-1;}
  function restChair(id,x,z,{label='椅子 · 坐下',approach={x,z:z+1.2},height=2.6,labelX=x,labelZ=z+1.5}={}){chair(x,z,0,true);spots.push({id,x:approach.x,z:approach.z,label,height,labelX,labelZ,restPose:'sit',seat:{x,z,rotation:0}});}
  function chair(x,z,rotation=0,office=false){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);box(0,.72,0,.95,.22,1.02,office?0x3c554d:0x76aaa1,false,g);box(0,1.17,-.42,.95,.85,.15,office?0x3c554d:0x76aaa1,false,g);for(const a of [-.35,.35])for(const b of [-.32,.32])line([a,.05,b],[a,.68,b],.035,0x7a8980,g);return g;}
  function monitor(x,z,rotation=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;root.add(g);box(0,1.45,0,.75,.1,.5,0x4c5c52,false,g);box(0,1.75,0,.08,.55,.08,0x4c5c52,false,g);box(0,2.05,0,1.35,.91,.12,0x3c4e47,false,g);box(0,2.05,.07,1.18,.73,.01,0xc4dcd0,false,g);box(-.29,2.21,.08,.5,.08,.01,0x749d90,false,g);for(let i=0;i<3;i++)box(0,2.02-i*.13,.08,1,.025,.01,0xa7c5b5,false,g);box(0,1.47,.5,.96,.055,.32,0x697e71,false,g);return g;}
  function bed(x,z,patient=false){box(x,.64,z,2.8,.5,5.1,0xc7cdbd,true);box(x,1.01,z,2.65,.3,4.85,0xf2f2e5);box(x,1.2,z-1.6,2,.24,.8,0xffffff);box(x,1.2,z+.5,2.64,.17,2.8,0x91bdaf);for(const a of [-1.6,1.6])line([x+a,.6,z-1.7],[x+a,1.45,z-1.7],.045,0x9eafa2);box(x,1.05,z+2.5,2.8,1.15,.13,0xc7d1c6);if(patient){sphere(x,1.52,z-1.5,.32,0xd6ae89);box(x,1.34,z-.3,.9,.3,1.6,0xb5d2c2);} }
  function curtain(x,z,width=4,side=false){const g=new THREE.Group();root.add(g);const count=Math.round(width/.2);for(let i=0;i<count;i++){const a=(i/count-.5)*width;box(side?x:x+a,1.6,side?z+a:z,side?.13:.23,2.7,side?.23:.13,i%2?0x8dc7c4:0x7bb8b8);}line([side?x:x-width/2,3.1,side?z-width/2:z],[side?x:x+width/2,3.1,side?z+width/2:z],.035,0xb2bcb0);}
  function roomBase(w,d,color=C.floor){bounds={x:w/2,z:d/2};box(0,-.33,0,w+.4,.65,d+.4,0xbdc8b1);box(0,.015,0,w,.08,d,0xf5f3e8);box(0,.067,0,w-.2,.025,d-.2,flooring);box(0,.65,-d/2,w,1.3,.25,C.wall,true);box(-w/2,.65,0,.25,1.3,d,C.wall,true);box(w/2,.65,0,.25,1.3,d,C.wall,true);box(0,.16,d/2,w,.24,.25,C.trim);}
  function elevator(x,z){box(x,1.25,z,3.6,2.5,.6,0xb9c3b7,true);box(x,1.25,z+.33,2.7,2.25,.05,0x8c9b93);box(x,1.25,z+.37,.035,2.18,.02,0x65776d);sign(LOCATIONS[loc].code,x,2.75,z+.35,1.6,'#263e52','#d5eb9a');box(x+2.15,1.1,z,.22,.44,.2,0x637b65);spots.push({id:'elevator',x,z:z+2.2,label:'搭電梯',icon:'↕'});}
  function bridge(x,z){sign(loc.startsWith('f')?'往 G 棟 →':'← 往 F 棟',x,2.15,z,4,'#f2f3e7','#58744a');box(x,.025,z+1.1,4,.018,1.4,0xb7c99e);spots.push({id:'bridge',x,z:z+1,label:loc.startsWith('f')?'跨到 G 棟':'跨到 F 棟',icon:'↔'});}

  function printerDevice(x,y,z){
    box(x,y,z,1.24,.78,1.04,0xd1d8d4);box(x,y+.42,z,.98,.08,.82,0xa2afb1);
    box(x,y+.49,z-.06,.82,.04,.58,0xf2f0e5);box(x,y+.21,z+.53,1,.23,.04,0x304957);box(x,y+.13,z+.59,.86,.04,.23,0x83999c);
    box(x,y-.18,z+.54,1.08,.34,.04,0xbcc9c6);box(x,y-.09,z+.57,.33,.04,.025,0x71888e);box(x+.35,y+.4,z+.27,.3,.07,.22,0x365361);box(x+.31,y+.44,z+.3,.17,.02,.12,0xaec5a4);
    for(let i=0;i<6;i++)box(x+.63,y-.21+i*.065,z-.15,.025,.025,.45,0x70878b);box(x,y-.43,z,1.03,.06,.88,0x657d83);
  }
  function leak(x,z){
    const puddle=cyl(x,.09,z,.85,.025,0x648b9b);puddle.scale.z=.65;puddle.material=mat(0x83b1bf);puddle.material.transparent=true;puddle.material.opacity=.65;
    box(x,3.2,z-.6,2.6,.78,.62,0xd9ded2);box(x,3.01,z-.26,2.25,.21,.04,0x637e82);for(let i=0;i<4;i++)box(x,2.94+i*.055,z-.23,2.1,.019,.03,0xa9bcb7);box(x+.95,3.27,z-.27,.16,.05,.025,0x779d8f);
    line([x-1.23,3.1,z-.5],[x-1.32,1.6,z-.5],.055,0xb9c8bc);for(let i=0;i<4;i++){const drop=sphere(x,.4+i*.6,z,.055,0x8eb9ca);drop.scale.y=1.9;}
    const caution=box(x+1.3,.45,z+.6,.7,.88,.06,0xd4b354);caution.rotation.x=-.2;line([x+1.3,.9,z+.5],[x+1.3,.05,z+1],.035,0xb18b3c);sign('小心地滑',x+1.3,.5,z+.67,.62,'#d4b354','#675936');
  }
  function ward(){
    bounds={x:23,z:38};walkArea=WARD_PLAN.outline.map(([x,y])=>wardPoint(x,y));
    const shape=new THREE.Shape();walkArea.forEach((p,i)=>i?shape.lineTo(p.x,-p.z):shape.moveTo(p.x,-p.z));shape.closePath();
    const slab=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.42,bevelEnabled:false}),mat(0x6a7886));slab.rotation.x=-Math.PI/2;slab.position.y=-.4;slab.receiveShadow=true;root.add(slab);
    const floor=new THREE.Mesh(new THREE.ShapeGeometry(shape),wardFlooring);floor.rotation.x=-Math.PI/2;floor.position.y=.055;floor.receiveShadow=true;root.add(floor);
    for(let i=0;i<walkArea.length;i++){const a=walkArea[i],b=walkArea[(i+1)%walkArea.length];line([a.x,.25,a.z],[b.x,.25,b.z],.045,0x647786);}
    for(const room of wardRooms){const r=wardRect(room),side=room.side,inner=side>0?r.x-r.w/2:r.x+r.w/2;box(r.x,.07,r.z,r.w-.1,.025,r.d-.05,0xc4c6c1);box(r.x,.68,r.z-r.d/2,r.w,1.35,.14,C.wall,true);box(side>0?r.x+r.w/2:r.x-r.w/2,.63,r.z,.15,1.25,r.d,C.wall,true);
      const door=1.85,part=(r.d-door)/2;for(const d of [-1,1])box(inner,.63,r.z+d*(door/2+part/2),.14,1.25,part,C.wall,true);
      const beds=wardBedPositions(room);for(const b of beds){box(b.x,.53,b.z,1.82,.42,2.4,0x81939f,true);box(b.x,.84,b.z,1.78,.18,2.34,0xe1ded4);box(b.x,.99,b.z-.79,1.42,.15,.52,0xebe6d9);box(b.x,.99,b.z+.29,1.76,.11,1.42,0x7e9dac);box(b.x,.98,b.z-1.2,1.9,.76,.1,0xb2bfc1);box(b.x,.74,b.z+1.2,1.9,.5,.1,0xb2bfc1);for(const rail of [-.95,.95])box(b.x+rail,1.05,b.z,.06,.09,1.7,0xc5ced0);const figure=new THREE.Group();root.add(figure);const tone=(Number(room.id.slice(2))+b.index)%3;sphere(b.x,1.18,b.z-.75,.22,[0xd6b399,0xcba887,0xe2c4aa][tone],figure);const hair=sphere(b.x,1.23,b.z-.88,.2,[0x434851,0x67727b,0x6c5145][tone],figure);hair.scale.set(1,.5,.7);box(b.x,1.1,b.z+.05,.65,.14,1.2,[0xa5bdc6,0x9bb6b2,0xb0bfcc][tone],false,figure);wardPatients.set(bedId(room.id,b.index+1),{room:room.id,bed:b.index+1,figure});}
      for(let i=1;i<beds.length;i++){const divider=(beds[i-1].x+beds[i].x)/2;line([divider,2.25,r.z-1.9],[divider,2.25,r.z+.65],.035,0x9eafb5);for(let fold=0;fold<5;fold++)box(divider,1.36,r.z-1.75+fold*.15,.07,1.7,.17,fold%2?0x75a9ad:0x8dbdbb);}
      labels.push({id:room.id,text:room.id,x:inner-side*.8,z:r.z,height:1.6,kind:'room'});if(room.bedCount===1)chair(side*15.8,r.z,side>0?-Math.PI/2:Math.PI/2);
    }
    for(const item of WARD_PLAN.core){const r=wardRect(item),duty=item.id.startsWith('值班室'),exam=item.id==='檢查室';box(r.x,.075,r.z,r.w-.15,.025,r.d-.15,duty?0xa9aeb6:0xb1b7ba);if(!exam&&item.id!=='討論室')for(const side of [-1,1])box(r.x+side*r.w/2,.58,r.z,.13,1.16,r.d,C.wall);box(r.x,.58,r.z+r.d/2,r.w,1.16,.13,C.wall);if(exam){box(r.x-r.w/2,.58,r.z,.13,1.16,r.d,C.wall,true);const gap=2.3,part=(r.d-gap)/2;for(const side of [-1,1])box(r.x+r.w/2,.58,r.z+side*(gap/2+part/2),.13,1.16,part,C.wall,true);box(r.x,.58,r.z-r.d/2,r.w,1.16,.13,C.wall,true);chair(r.x-1.8,r.z,0,true);box(r.x-3.2,.6,r.z,1,1.2,1,0x829ea8,true);spots.push({id:'exam',x:r.x+1,z:r.z,label:'7F 檢查室',icon:'＋'});}else if(item.id==='討論室'){const gap=2.3,part=(r.d-gap)/2;box(r.x-r.w/2,.58,r.z,.13,1.16,r.d,C.wall,true);box(r.x,.58,r.z-r.d/2,r.w,1.16,.13,C.wall,true);for(const side of [-1,1])box(r.x+r.w/2,.58,r.z+side*(gap/2+part/2),.13,1.16,part,C.wall,true);solids.push({x:r.x,z:r.z,w:1.05,d:.7});spots.push({id:'discussion-snacks',x:r.x+1.5,z:r.z+.9,label:'討論室 · 餅乾',height:1.8,labelX:r.x+.4,labelZ:r.z});}
      else if(!duty){box(r.x,.58,r.z-r.d/2,r.w,1.16,.13,C.wall);solids.push({x:r.x,z:r.z,w:r.w/2+.1,d:r.d/2+.1});}else{const dutyRoom=DUTY_ROOMS[item.id],bx=r.x+.65,bz=r.z+.1;
        box(bx,.65,bz,2,.5,3.5,0x81939f,true);box(bx,1.01,bz,1.92,.28,3.4,0xe6e0d5);box(bx,1.2,bz-1.18,1.5,.2,.6,0xf1eadc);box(bx,1.2,bz+.4,1.9,.12,1.8,0x7e9dac);
        const selected=dutyRoom.character===player.userData.character;spots.push({id:selected?'sleep':'sleep-other',x:r.x+1.96,z:r.z+.6,label:dutyRoom.name+' · 躺下',height:2.4,restPose:'lie',allowedCharacter:dutyRoom.character,seat:{x:bx,z:bz}});
        labels.push({id:'toilet-'+dutyRoom.character,text:'廁所',x:r.x-1.38,z:r.z-1.0,height:1.3,kind:'core'});
      }
      labels.push({id:item.id,text:DUTY_ROOMS[item.id]?.name||item.id,x:r.x,z:r.z,height:1.5,kind:'core',columns:Math.max(2,Math.min(5,Math.floor(r.w*1.1)))});
    }
    const passage=wardRect(WARD_PLAN.crossPassage);box(passage.x,.08,passage.z,passage.w,.025,passage.d,0xcbd0c9);
    for(const x of [-4.9,4.9])for(const [from,to] of wardCorridorSegments(-22,24))line([x,1.03,from],[x,1.03,to],.055,0x8193a0);
    const station=NURSING_STATION.center,layout=NURSING_STATION;
    box(station.x,.075,station.z-.5,10.4,.03,7.4,0xc1c8c5);box(station.x,.65,layout.frontZ,layout.width,1.3,1.4,wood,true);box(station.x,1.35,layout.frontZ,layout.width+.2,.13,1.6,0xdcd4be);
    for(const side of [-1,1]){box(station.x+side*4.85,.65,layout.wingZ,.9,1.3,6.2,wood,true);box(station.x+side*4.85,1.35,layout.wingZ,1.1,.13,6.4,0xdcd4be);}
    for(const c of layout.computers)monitor(c.x,c.z,Math.PI);chair(layout.nurse.x,layout.nurse.z,0,true);const n=person(layout.nurse.x,layout.nurse.z,0x526f7b);n.rotation.y=Math.PI;root.add(n);sign('7F 護理站',station.x,1.5,layout.frontZ+.85,5,'#263e52','#eddfc1');
    restChair('rest-chair',layout.chair.x,layout.chair.z,{label:'護理站椅子 · 坐下',approach:{x:layout.chair.x,z:layout.chair.z-1.35},height:1.8,labelX:layout.chair.x,labelZ:layout.chair.z});
    box(layout.tablet.x,1.48,layout.tablet.z,.9,.12,1.25,0x233d4d);box(layout.tablet.x,1.55,layout.tablet.z,.74,.025,1.04,0xc7dfd9);for(let i=0;i<3;i++)box(layout.tablet.x,1.57,layout.tablet.z-.27+i*.2,.47,.013,.035,0x668d83);box(layout.tablet.x+.57,1.5,layout.tablet.z,.045,.045,.86,0x3b505f);spots.push({...layout.spots.tablet});
    printerDevice(layout.printer.x,1.7,layout.printer.z);leak(6.7,station.z-1);spots.push({...layout.spots.nurse},{...layout.spots.computer},{...layout.spots.printer},{id:'water',x:6.7,z:station.z-1,label:'冷氣漏水',height:2.7,labelX:8.2});

    const lifts=wardPoint(915,165);elevator(lifts.x,lifts.z);for(const dx of [-3.5,3.5]){box(lifts.x+dx,1.25,lifts.z,3.1,2.5,.6,0x82939e,true);box(lifts.x+dx,1.25,lifts.z+.33,2.6,2.2,.05,0x617482);}sign('訪客電梯廳',lifts.x,.13,lifts.z+4,7,'#c1c7c5','#3d566c',true);
    const lounge=wardRect(WARD_PLAN.landmarks.find(r=>r.id==='交誼廳'));for(const x of [-1.8,1.8])chair(lounge.x+x,lounge.z,0,true);box(lounge.x,.62,lounge.z+2,2.5,1.2,1.2,wood,true);plant(5,-30);sign('交誼廳',lounge.x,.12,lounge.z+3.5,3.6,'#c2c7c3','#3b5368',true);

    const crossing=wardPoint(WARD_PLAN.crossing.x,WARD_PLAN.crossing.y);bridge(crossing.x,crossing.z);return{x:-5.8,z:33.6};
  }
  function clinic(){roomBase(34,29);bounds={x:16.4,z:13.9};box(0,1.8,-14.3,33.7,3.6,.23,C.wall,true);
    for(let i=0;i<8;i++){const x=-13.7+i*3.8;box(x,.65,-12.9,3.7,1.3,2.05,wood,true);box(x,1.36,-12.8,3.8,.12,2.2,0xc5aa82);box(x,2.9,-13.4,3.7,1.08,1.08,wood);box(x+.8,2.8,-12.84,.07,.3,.045,0x566674);}
    cyl(3.1,1.43,-12.55,.73,.06,0xe8e5d9);cyl(3.1,1.46,-12.55,.53,.025,0x9baab1);line([3.7,1.4,-12.9],[3.7,1.95,-12.9],.07,C.steel);line([3.7,1.95,-12.9],[3.3,1.95,-12.6],.07,C.steel);for(const x of [5,5.8])box(x,2.05,-14,.4,.72,.2,0xe6e2d8);
    for(let i=0;i<6;i++)cyl(-8+i*.42,1.6,-12.6,.14,.36,i%3?0xd3dce0:0x537d9b);box(10,1.7,-12.7,.9,.65,.8,0xb87858);
    for(const [x,w] of [[-10,6.4],[-3.9,6.8]]){box(x,.7,5.9,w,1.4,3.1,wood,true);box(x,1.45,5.9,w+.2,.12,3.4,0xc5a374);}
    monitor(-10.5,6,Math.PI);monitor(-4.8,6,Math.PI);restChair('clinic-chair-2',-4.8,3,{label:'工作椅 · 坐下',approach:{x:-4.8,z:1.8},labelX:-4.8,labelZ:.4,height:2.1});restChair('clinic-chair',-10.5,3,{label:'椅子 · 坐下等 call',approach:{x:-10.5,z:1.8},labelX:-12.4,labelZ:.4,height:2.1});
    box(-2.5,1.6,5.5,1.3,.22,1,0x354b53);box(-2.5,1.8,5.45,1.4,.18,.3,0x233c48);for(let i=0;i<9;i++)box(-2.75+(i%3)*.23,1.73,5.65+Math.floor(i/3)*.15,.14,.06,.09,0xd1d9d5);box(-3.7,1.52,5.6,.8,.025,1,0xf4edda);
    printerDevice(-7.3,1.75,6.4);box(-4,1.56,5.1,.6,.13,.4,0xdce1dc);sign('全院會診 / 初診',-8,.12,8.4,5,'#c7c9c0','#3e566a',true);
    solids.push({x:1.5,z:5.8,w:1.55,d:1.15});for(const x of [.3,2.7])box(x,1.1,5.8,.12,2.2,1.6,wood);box(1.5,2.25,5.8,2.6,.1,1.8,0xd6c39c);for(const y of [.15,.85,1.55]){box(1.5,y,5.8,2.4,.08,1.6,0xe2cda7);for(let i=0;i<4;i++)box(.75+i*.5,y+.27,5.8,.32,.4,.35,[0xc39b70,0x7b9c91,0xbd796c,0xb7b48b][i]);}sign('零食櫃',1.5,2.6,5,2,'#3b5864','#eadbbb');
    for(const x of [0,8]){const z=-4.4,exam=new THREE.Group();exam.position.set(x,0,z);root.add(exam);cyl(0,.22,0,1,.42,0x293b4b,exam);box(0,.62,0,1.5,.8,1.5,0xc7cece,false,exam);box(0,1.1,.05,1.45,.28,1.6,0x233141,false,exam);const back=box(0,1.88,-.65,1.45,1.5,.23,0x233141,false,exam);back.rotation.x=-.17;box(0,2.7,-.8,.75,.55,.25,0x233141,false,exam);for(const a of [-.9,.9])box(a,1.46,.13,.18,.15,1.15,0x293e50,false,exam);box(0,.5,1.3,1,.15,.6,0x4b6171,false,exam);solids.push({x,z,w:1.3,d:1.7});
      box(x+3,.8,z,3.1,1.6,2.5,0x8e9fa9,true);box(x+3,1.64,z,3.3,.13,2.7,0xc0ccd0);box(x+2.7,1.75,z+.2,2.1,.06,1.8,0x3d87aa);for(let i=0;i<4;i++){cyl(x+2+i*.5,1.9,z-.8,.15,.4,i%2?0xcbd9dd:0xd9dfdd);line([x+2+i*.5,1.7,z+1.3],[x+2+i*.5,.3,z+1.3],.035,0x506d81);}line([x+4.5,1.9,z],[x+4.5,4.4,z],.05,C.steel);line([x+4.5,4.4,z],[x,4.2,z],.06,C.steel);cyl(x,3.6,z,.5,.15,0xd5d7cd);
    }
    box(3,.65,-9.3,2.8,1.3,1.7,0xb7c5c9,true);box(3,1.35,-9.3,3,.1,1.8,0x457f9b);monitor(3,-9.7);plant(14,-10);bed(-7,-6);curtain(-9,-6,4,true);sign('治療床',-7,1.1,-3.4,2,'#3b5864','#eadbbb');
    box(-16.7,1.5,-6,.15,3,2.7,0x758b91);sign('隔壁診間',-14,2.8,-6,2.8,'#3b5864','#eadbbb');clinicNurse=person(-14,-6,0x526f7b);root.add(clinicNurse);
    box(5.8,1.55,-12.3,.8,.25,.5,0xe3ddcc);box(5.8,1.7,-12.3,.25,.03,.08,0x687c89);
    spots.push({id:'treatment-bed',x:-4.9,z:-6,label:'治療床',patientRest:true,height:2.2},{id:'patient',x:0,z:-1.1,label:'診療椅 · 看病人',icon:'＋'},{id:'patient2',x:8,z:-1.1,label:'第二張診療椅',icon:'＋'},{id:'clinic-nurse',x:-12.8,z:-6,label:'送文件的小禾',height:3.3,labelX:-14,labelZ:-6},{id:'clinic-phone',x:-2.5,z:3,label:'電話單',height:3.5,labelX:-1.4,labelZ:4.4},{id:'desk',x:-10.5,z:1.8,label:'電腦',height:4.2,labelX:-11.3,labelZ:5.6},{id:'printer',x:-7.3,z:3,label:'印表機',height:3.1,labelX:-7.3,labelZ:5.1},{id:'snacks',x:1.5,z:3.5,label:'零食櫃',height:3.6,labelX:3.4,labelZ:5.2},{id:'tissue',x:5.8,z:-10.5,label:'洗手台 · 補衛生紙',icon:'▱'});elevator(11.5,10.6);bridge(-11.5,10.6);return{x:0,z:9};}
  function operatingSuite(r){
    const {x,z,w,d}=r,side=Math.sign(z),inner=z-side*d/2;
    box(x,.08,z,w-.2,.025,d-.2,0xabb9a6);
    box(x,1.55,z+side*d/2,w,3.1,.2,0x9caa78,true);
    for(const edge of [-1,1])box(x+edge*w/2,.8,z,.18,1.6,d,0xabb58b,true);
    for(const edge of [-1,1])box(x+edge*4.5,.7,inner,5,1.4,.18,0xa7b286,true);
    box(x,.09,inner,3.4,.035,1.3,0x829d97);
    labels.push({id:'OR'+r.number,text:r.number+'房',x:x-4.6,z:inner,height:2.3,kind:'or-room'});
    sign(r.number+'房',x,2.6,z+side*(d/2-.14),7,'#314f49','#f2e5c8');
    box(x,1.35,inner,3.7,2.7,.23,0x627f70,true);box(x,1.7,inner-side*.15,2,.65,.04,0xa9c2b8);
    if(OR_INTERIORS.includes(r.number)){
      const door=operatingDoor(r.number);spots.push({id:operatingSpot(r.number),...door,labelX:door.x+3.6,height:3.6,label:'進入 '+r.number+'房',icon:'↪',orRoom:r.number});return;
    }
    box(x,.63,z,2.35,1.1,4.8,0x9da9a4,true);box(x,1.25,z,2.55,.18,5,0x3d8e79);
    box(x,1.43,z,2.5,.16,3.9,0x4c9b89);sphere(x,1.52,z+side*1.9,.29,0xd0b099);
    for(const a of [-1,1]){line([x+a,.25,z-1.5],[x+a,.25,z+1.5],.06,0x9fb1b4);cyl(x+a,.14,z+1.6,.17,.25,0x405a61);}
    for(const a of [-1,1]){
      const lx=x+a*2.1,lz=z+side*.8;
      line([x,4.8,z+side*3],[lx,4.7,lz],.09,0xc9d0b7);line([lx,4.7,lz],[lx,3.7,lz],.07,0xb7c2b2);
      cyl(lx,3.6,lz,.93,.2,0xd9ddc5);cyl(lx,3.47,lz,.75,.035,0x88a39c);
      for(let i=0;i<6;i++){const angle=i*Math.PI/3;sphere(lx+Math.sin(angle)*.48,3.44,lz+Math.cos(angle)*.48,.12,0xfcf2c8);}
    }
    box(x+4.7,.82,z+side*1.5,2.3,1.5,2,0xbfc9c0,true);
    monitor(x+4.7,z+side*1.5,side<0?0:Math.PI);box(x+4.7,1.05,z+side*1.5,1.6,.85,.12,0x456562);
    box(x-4.8,.7,z+side*3.9,2.4,1.3,1.4,0x9eaca9,true);box(x-4.8,1.4,z+side*3.9,2.6,.13,1.6,0x4b9481);
    for(let i=0;i<3;i++)box(x-5.4+i*.5,1.5,z+side*3.9,.06,.035,.8,0xcbd1c1);
    const team=person(x+2.9,z,0x328678);team.rotation.y=-Math.PI/2;root.add(team);
    const nurse=person(x-4.8,z+side*1.4,0x487f73);nurse.rotation.y=Math.PI/2;root.add(nurse);
    // The ceiling is omitted to keep the play area visible from above.
    box(x+5.8,1.4,z+side*4.5,1.5,2.6,.4,0xc3c8ac);
    const door=operatingDoor(r.number);spots.push({id:operatingSpot(r.number),...door,labelX:door.x+3.6,height:3.6,label:'進入 '+r.number+'房',icon:'↪',orRoom:r.number});
  }
  function operatingRoom(){
    roomBase(84,60);bounds={x:41.5,z:29.4};box(0,.09,0,55,.025,7,0x779896);
    box(0,.09,21,69,.025,5,0x9cafa0);
    for(const r of OR_ROOMS)operatingSuite(r);
    for(const wing of OR_WINGS){
      const x=wing.side*31;box(x,.09,0,9,.025,50,0x879f98);
      sign('其他刀房走廊',x,.12,-23,7,'#abc1b2','#355e56',true);
      wing.numbers.forEach((number,i)=>{const z=-18+i*3.4,dx=wing.side*38;
        box(dx,1.25,z,.3,2.5,2.7,0x647f79,true);box(dx-wing.side*.18,1.25,z,.06,2.2,2,0xa5b3a1);
        labels.push({id:'OR'+number,text:number+'房',x:dx-wing.side*1.2,z,height:1.8,kind:'or-other',detail:number+'房 · 其他走廊'});
        spots.push({id:operatingSpot(number),x:dx-wing.side*2,z,labelX:dx-wing.side*5,height:3.6,label:'進入 '+number+'房',icon:'↪',orRoom:number});
      });
    }
    box(15,.75,11,6,1.5,2.5,0x8a9b87,true);monitor(15,11);restChair('rest-chair',12,8.5,{label:'椅子 · 坐下',approach:{x:12,z:7.3}});sign('刀房工作站',15,1.9,12.4,5,'#314f49','#f2e5c8');
    sign('17房 / 16房 / 15房',0,.13,-2.2,10,'#789a91','#e3e5ce',true);sign('12房 / 13房',-7,.13,2.2,8,'#789a91','#e3e5ce',true);
    const dining=OR_DINING;box(dining.x,.1,dining.z,dining.w,.04,dining.d,0xc1c4b0);
    box(34,.75,28,9,1.5,1.4,wood,true);box(34,1.53,28,9.3,.1,1.6,0xd4dbca);sign('餐廳',33,3.2,28.5,6,'#314f49','#f2e5c8');
    for(let i=0;i<4;i++){cyl(31+i*1.4,1.9,28,.26,.7,0xc7b28c);cyl(31+i*1.4,2.27,28,.28,.04,0xe8e0ca);line([31+i*1.4,2.28,28],[31+i*1.4,2.7,28],.035,0xe2d3b1);}
    box(27,1,26,2.7,.15,2,wood,true);chair(26,24.9,Math.PI);chair(28.2,24.9,Math.PI);plant(39,27);spots.push({...dining.spot});
    elevator(23,23);sign('F5 刀房主走廊',7,.13,20,10,'#adbdab','#3a5c57',true);return{x:18,z:21};
  }
  function operatingInterior(number,seniorJoined=false){
    roomBase(28,24);box(0,.09,0,23,.025,18,0xb5c4ad);box(0,1.5,-11.7,27.8,3,.22,0x9eae7c,true);
    solids.push({x:0,z:-.8,w:1.65,d:2.85});box(0,.7,-.8,1.15,.85,2.1,0xa6b8ab);box(0,1.35,-.8,2.7,.16,5.2,0x408c78);box(0,1.52,-.4,2.6,.12,4.1,0x4f9d88);sphere(0,1.65,-2.7,.35,0xd7b391);box(0,1.76,-2.7,.8,.15,.7,0x72ac94);
    for(const x of [-5.5,5.5]){solids.push({x,z:-1.5,w:1.6,d:1.25});for(const a of [-1,1])for(const b of [-1,1])box(x+a,.8,-1.5+b*.6,.07,1.4,.07,0xb8c6b7);box(x,.42,-1.5,2.1,.09,1.4,0x9aaea8);box(x,1.68,-1.5,2.7,.12,2,0x4a9583);for(let i=0;i<4;i++)box(x-.7+i*.45,1.78,-1.5,.07,.04,.8,0xd0dacf);}
    for(const role of operatingTeam(number)){const n=person(role.x,role.z,0x398775);n.rotation.y=role.id==='scrub'?.8:Math.PI;const cap=sphere(0,3.18,0,.29,0x669a88,n);cap.scale.set(1,.65,1);root.add(n);spots.push({id:'or-team-'+role.id,x:role.approach.x,z:role.approach.z,label:role.label+' · 聊一下',height:3.6,labelX:role.x,labelZ:role.z});}
    if(number===13&&seniorJoined){const senior=person(3,-.8,0x398775);senior.rotation.y=-.8;root.add(senior);}
    if(number===16){box(8,1.1,-7,2.3,2.1,1.9,0xc3cec0,true);monitor(8,-7);}monitor(4,-8);box(-9,.8,-8,3,1.6,2,0xa7b8ac,true);box(-9,1.65,-8,3.1,.1,2.1,0x548f7f);
    for(const x of [-2.5,2.5]){line([0,5.7,-7],[x,5.4,-1.8],.1,0xc6d0b6);line([x,5.4,-1.8],[x,4.1,-1.8],.09,0xc6d0b6);cyl(x,4,-1.8,1.05,.22,0xdfe3cc);cyl(x,3.86,-1.8,.85,.035,0x7d9d90);for(let i=0;i<6;i++){const a=i*Math.PI/3;sphere(x+Math.sin(a)*.6,3.8,-1.8+Math.cos(a)*.6,.15,0xfcf4d5);}}
    sign(number+'房',0,2.5,-11.3,6,'#314f49','#f2e5c8');sign('返回走廊 →',9,.13,8,5,'#b1c3ac','#375e52',true);
    box(10,1.15,10.6,3.5,2.3,.25,0x688b79);box(10,1.5,10.4,2,.6,.04,0xa9c2b8);
    box(-11, .9,-2.9,2,1.8,1.5,0xa7b8ac,true);box(-11,1.96,-2.9,1.7,.55,.85,0x293f48);for(const x of [-11.55,-10.45])cyl(x,1.98,-2.45,.18,.03,0x9bbab1).rotation.x=Math.PI/2;box(-11,2.03,-2.44,.45,.15,.035,0x8bb6a4);spots.push({id:'or-radio',x:-8.9,z:-2.9,label:'音響 · 選歌',height:2.8,labelX:-11});
    box(10,.72,1,3.2,1.4,1.5,0x849f8e,true);box(10,1.47,1,3.4,.1,1.7,0xd5ddc9);monitor(10,1);box(11.1,.65,1,.65,1.1,1.1,0x354e48);restChair('or-chair',10,2.7,{label:'電腦椅 · 坐下',approach:{x:8.5,z:3.5},labelX:9.2,labelZ:6,height:1.8});sign('住院醫師工作站',10,2.8,1,3.3,'#314f49','#f2e5c8');spots.push({id:'or-computer',x:10,z:3.4,label:'電腦',height:2.8,labelX:11.6,labelZ:5.2});
    leak(-10,5.5);spots.push({id:'water',x:-10,z:5.5,label:'天花板漏水 · 看一下',height:2.5});
    spots.push({id:'operation',x:0,z:3.7,label:'手術台 · 繼續任務',icon:'✦'},{id:'or-exit',x:9,z:7.7,label:'返回刀房走廊',icon:'↩'});
    return{x:6,z:5.8};
  }
  function emergency(){roomBase(34,27);box(0,.09,-3,29,.025,17,0xdbe3d0);for(const x of [-9,9]){bed(x,-4,true);curtain(x-2.2,-4,5.5,true);box(x+3.2,.6,-5,1.3,1.2,1.3,0xd5dccb,true);monitor(x+3.2,-5.5);box(x+3.2,1.4,-5,1.5,.08,1.5,0x9fc9c0);}
    restChair('rest-chair',-9,2,{label:'椅子 · 坐下'});box(-2,.7,-10,8,1.4,1.8,wood,true);monitor(-3,-10);monitor(0,-10);chair(-3,-8.2);chair(0,-8.2);sign('急診 / EMERGENCY',0,2.6,-12.5,8,'#b66e52','#fff6e7');sign('會診區',9,.12,.2,3.5,'#d2dac4','#6e8260',true);const d=person(5,-1,0xe1e9d9);root.add(d);const n=person(10,-6.5,0x75a99a);root.add(n);plant(-13,5);spots.push({id:'patient',x:7,z:.5,label:'急診病人',icon:'＋'});elevator(-10,9.5);bridge(10,9.5);return{x:-4,z:8.8};}
  function lobby(){roomBase(25,21);restChair('rest-chair',-7,-5);for(let i=1;i<4;i++)chair(-7+i*1.5,-5,0);plant(-10,-8);plant(10,-8);
    box(0,.07,0,2.4,.018,16,0x9cafad);for(const x of [-1.45,1.45])box(x,.085,0,.08,.02,16,0xd7c5a1);
    sign(loc.startsWith('f')?'F 棟連通區':'G 棟連通區',0,2.4,-9.9,7,'#263e52','#e5dfcf');sign(loc.startsWith('f')?'同層跨棟 →':'← 同層跨棟',0,.13,1,4,'#b9cbc7','#3b5665',true);
    box(6,2,-9.65,6.7,3.7,.22,wood,true);box(6,2,-9.48,6.3,3.3,.1,0xb8a484);sign('布告欄',6,4.25,-9.4,3.4,'#263e52','#eddfc1');
    spots.push({id:'bulletin',x:6,z:-7.3,label:'布告欄',height:3.3});elevator(-7,5.2);bridge(7,5.2);return{x:0,z:5.2};}

  function clear(){for(const material of root.userData.detailMaterials||[])material.dispose();for(const texture of root.userData.detailTextures||[])texture.dispose();root.traverse(o=>{if(o.isLineSegments)o.geometry?.dispose();if(o.isMesh){o.geometry?.dispose();if(o.material?.map&&!textures.has(o.material.map)){if(o.material.type==='MeshBasicMaterial')o.material.map.dispose();}}});scene.remove(root);root=new THREE.Group();scene.add(root);solids=[];spots=[];labels=[];path=[];wardPatients=new Map();walkArea=null;morningGroup=null;attending=null;companion=null;followTrail=[];escortState=null;clinicTubeGroup=null;clinicTubeKey=null;clinicNurse=null;}
  function build(id,{orRoom=null,returnRoom=null,seniorJoined=false}={}){setPosture('stand');clear();loc=id;setCharacter(player.userData.character);interiorRoom=id==='f5'&&OR_INTERIORS.includes(orRoom)?orRoom:null;const kind=LOCATIONS[id].kind;let spawn=kind==='ward'?ward():kind==='clinic'?clinic():kind==='or'?(interiorRoom?operatingInterior(interiorRoom,seniorJoined):operatingRoom()):kind==='ed'?emergency():lobby();const details=createHospitalDetails(THREE,root);if(kind==='ward')details.ward();else if(kind==='clinic')details.clinic();else if(kind==='or'){if(interiorRoom)details.operating(interiorRoom);else details.operatingCorridor();}else if(kind==='ed')details.emergency();else details.lobby();details.flush();if(id==='f5'&&!interiorRoom&&OR_INTERIORS.includes(returnRoom))spawn=operatingDoor(returnRoom);const overview=kind==='ward'||kind==='or'&&!interiorRoom;offset.set(kind==='ward'?8:overview?0:17,kind==='ward'?33:overview?37:27,overview?27:24);lastFrame=-1;spriteDirection=0;player.position.set(spawn.x,0,spawn.z);look.set(interiorRoom?0:spawn.x,0,interiorRoom?-1:spawn.z);camera.position.copy(look).add(offset);camera.lookAt(look);setMorning(morningState);setWardPatientTask(wardPatientTask);setClinicTube(clinicTubeState);setClinicNurseAway(clinicNurseAway);resize();return spots;}
  function setClinicNurseAway(away){
    clinicNurseAway=!!away;if(loc!=='g2'||!clinicNurse)return false;
    clinicNurse.visible=!clinicNurseAway;const present=spots.some(s=>s.id==='clinic-nurse');
    if(clinicNurseAway&&present){spots=spots.filter(s=>s.id!=='clinic-nurse');return true;}
    if(!clinicNurseAway&&!present){spots.push({id:'clinic-nurse',x:-12.8,z:-6,label:'送文件的小禾',height:3.3,labelX:-14,labelZ:-6});return true;}
    return false;
  }
  function setClinicTube(task){
    clinicTubeState=task;if(loc!=='g2')return;
    const key=task?task.caseId+'|'+task.patient.name+'|'+task.stage:'none';if(key===clinicTubeKey)return;clinicTubeKey=key;
    if(!clinicTubeGroup){clinicTubeGroup=new THREE.Group();root.add(clinicTubeGroup);}
    while(clinicTubeGroup.children.length){const child=clinicTubeGroup.children[0];child.traverse(o=>{if(o.isMesh||o.isLineSegments)o.geometry?.dispose();});clinicTubeGroup.remove(child);}
    clinicTubeGroup.visible=!!task&&task.stage!=='done';if(!clinicTubeGroup.visible)return;
    const g=clinicTubeGroup;
    if(['outpatientNG','outpatientTrach'].includes(task.caseId)){box(-5.1,1.55,5.9,.74,.02,.94,0xf2edde,false,g);for(let i=0;i<4;i++)box(-5.1,1.565,5.65+i*.13,.53,.006,.018,0x7f9599,false,g);}
    if(['outpatientNG','outpatientTrach'].includes(task.caseId)){
    box(-4.2,1.58,5.8,.55,.035,.91,0xc3d6ca,false,g);box(-4.2,1.605,5.5,.48,.01,.16,0x526f78,false,g);
    if(task.caseId==='outpatientNG'){const coil=new THREE.Mesh(new THREE.TorusGeometry(.18,.018,6,32),mat(0xf1e7cf));coil.rotation.x=Math.PI/2;coil.position.set(-4.2,1.63,5.86);g.add(coil);}else{line([-4.35,1.65,5.82],[-4.12,1.65,5.82],.045,0x9bbdb6,g);line([-4.12,1.65,5.82],[-4.05,1.65,6.04],.045,0x9bbdb6,g);}
    }
    if(task.stage!=='desk'){
      const patient=new THREE.Group();patient.position.set(0,0,-4.3);g.add(patient);
      box(0,1.65,0,.8,.86,.48,0x9eafa4,false,patient);sphere(0,2.38,0,.28,0xd7b69e,patient);const hair=sphere(0,2.56,-.04,.25,0x65716d,patient);hair.scale.y=.55;
      box(0,1.1,.32,.72,.28,.82,0x778b8f,false,patient);for(const side of [-1,1]){box(side*.22,.7,.64,.23,.7,.25,0x6a7d82,false,patient);box(side*.22,.34,.76,.25,.16,.45,0x526c77,false,patient);line([side*.48,1.93,0],[side*.55,1.35,.36],.09,0x9eafa4,patient);sphere(side*.55,1.32,.4,.09,0xd7b69e,patient);}
    }
  }
  function setWardPatientTask(active){wardPatientTask=!!active;if(loc!=='f7')return false;const present=spots.some(s=>s.id==='patient');if(present===wardPatientTask)return false;if(wardPatientTask)spots.push(wardEventPatientSpot());else spots=spots.filter(s=>s.id!=='patient');return true;}
  function setMorning(m){
    morningState=m;if(loc!=='f7')return;
    spots=spots.filter(s=>!s.morningBed);
    for(const p of wardPatients.values())p.figure.visible=bedPatientVisible(p.room,p.bed,m);
    if(!m?.active){if(morningGroup)morningGroup.visible=false;return;}
    if(!morningGroup){morningGroup=new THREE.Group();root.add(morningGroup);attending=person(0,0,0xe6e0d4);morningGroup.add(attending);companion=person(0,0,0xa2bac2);morningGroup.add(companion);
    }
    morningGroup.visible=true;
    for(const p of m.list){
      const {room,bed}=p,id=p.id;spots.push({id,...bedApproach(room,bed),label:bedLabel(p)+(m.visited.includes(id)?' ✓':''),height:2.6,morningBed:true,icon:'＋'});
    }
    const next=m.list.find(p=>!m.visited.includes(p.id));attending.visible=!!next;if(next){const b=bedApproach(next.room,next.bed);attending.position.set(b.x-.6,0,b.z+.1);}
    companion.visible=['following','exam'].includes(m.escort);
    if(m.escort!==escortState){followTrail=[];if(m.escort==='following')companion.position.set(player.position.x,0,player.position.z);escortState=m.escort;}
    if(m.escort==='exam'){const exam=spots.find(s=>s.id==='exam');companion.position.set(exam.x-1.3,0,exam.z);}
  }
  function isOpen(x,z){let inside=!walkArea;if(walkArea){for(let i=0,j=walkArea.length-1;i<walkArea.length;j=i++){const a=walkArea[i],b=walkArea[j];if((a.z>z)!==(b.z>z)&&x<(b.x-a.x)*(z-a.z)/(b.z-a.z)+a.x)inside=!inside;}}return inside&&Math.abs(x)<bounds.x-.25&&Math.abs(z)<bounds.z-.25&&!solids.some(s=>Math.abs(x-s.x)<s.w&&Math.abs(z-s.z)<s.d);}
  function tryMove(dx,dz){const p=player.position;const before=p.clone();if(isOpen(p.x+dx,p.z))p.x+=dx;if(isOpen(p.x,p.z+dz))p.z+=dz;walked+=p.distanceTo(before);return p.distanceTo(before);}
  function walkTo(x,z){const step=.8,minX=-Math.floor(bounds.x/step),maxX=Math.floor(bounds.x/step),minZ=-Math.floor(bounds.z/step),maxZ=Math.floor(bounds.z/step);const key=(a,b)=>`${a},${b}`;const nearest=(a,b)=>{let cx=Math.round(a/step),cz=Math.round(b/step);for(let r=0;r<7;r++)for(let i=-r;i<=r;i++)for(let j=-r;j<=r;j++)if(isOpen((cx+i)*step,(cz+j)*step))return[cx+i,cz+j];return null;};const start=nearest(player.position.x,player.position.z),end=nearest(x,z);if(!start||!end)return false;const queue=[start],came=new Map([[key(...start),null]]);let found=false;for(let head=0;head<queue.length&&head<7000;head++){const p=queue[head];if(p[0]===end[0]&&p[1]===end[1]){found=true;break;}for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]]){const nx=p[0]+a,nz=p[1]+b,k=key(nx,nz);if(nx<minX||nx>maxX||nz<minZ||nz>maxZ||came.has(k)||!isOpen(nx*step,nz*step))continue;if(a&&b&&(!isOpen((p[0]+a)*step,p[1]*step)||!isOpen(p[0]*step,(p[1]+b)*step)))continue;came.set(k,p);queue.push([nx,nz]);}}
    if(!found)return false;path=[];let q=end;while(q){path.unshift({x:q[0]*step,z:q[1]*step});q=came.get(key(...q));}return true;}
  function pick(clientX,clientY){const rect=canvas.getBoundingClientRect();pointer.set((clientX-rect.left)/rect.width*2-1,-(clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);if(ray.ray.intersectPlane(ground,hit))return walkTo(hit.x,hit.z);return false;}
  function resize(){const r=canvas.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);const aspect=r.width/r.height;const view=interiorRoom?11.5:13.5;camera.left=-view*aspect;camera.right=view*aspect;camera.top=view;camera.bottom=-view;camera.updateProjectionMatrix();}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas);
  function update(dt,input={},isNight=false,enabled=true){elapsed+=dt;night=isNight;let moved=0;const p=player.position;if(enabled&&restActor.posture==='stand'){let dx=input.x||0,dz=input.y||0;if(dx||dz){path=[];const l=Math.hypot(dx,dz);dx/=l;dz/=l;const vx=offset.z*dx+offset.x*dz,vz=-offset.x*dx+offset.z*dz;const len=Math.hypot(vx,vz);const speed=(input.run?7:4.6)*(input.tired?.7:1)*dt;moved=tryMove(vx/len*speed,vz/len*speed);if(moved)player.rotation.y=Math.atan2(vx,vz);}else if(path.length){const next=path[0],vx=next.x-p.x,vz=next.z-p.z,d=Math.hypot(vx,vz);if(d<.015){if(isOpen(next.x,next.z)){p.x=next.x;p.z=next.z;}path.shift();}else{const speed=Math.min(d,5.6*dt);moved=tryMove(vx/d*speed,vz/d*speed);player.rotation.y=Math.atan2(vx,vz);if(moved<.001)path=[];}}}
    if(loc==='f7'&&morningState?.escort==='following'&&companion){const tail=followTrail.at(-1)||companion.position;if(Math.hypot(p.x-tail.x,p.z-tail.z)>.25)followTrail.push({x:p.x,z:p.z});if(followTrail.length>5){const q=followTrail.shift(),dx=q.x-companion.position.x,dz=q.z-companion.position.z;companion.rotation.y=Math.atan2(dx,dz);companion.position.set(q.x,0,q.z);}}
    if(moved){const vx=Math.sin(player.rotation.y),vz=Math.cos(player.rotation.y),screenX=vx*offset.z-vz*offset.x,depth=vx*offset.x+vz*offset.z;spriteDirection=Math.abs(screenX)>Math.abs(depth)*1.1?(screenX>0?3:1):(depth>0?0:2);}
    const spriteRow=moved&&Math.floor(elapsed*7)%2?1:0,frame=spriteRow*4+spriteDirection;
    if(frame!==lastFrame){const atlas=(loc==='f5'?SCRUB_ATLASES:SPRITE_ATLASES)[player.userData.character],cell=atlas.frames[frame],map=player.userData.map;map.repeat.set(cell.w/atlas.width,cell.h/atlas.height);map.offset.set(cell.x/atlas.width,1-(cell.y+cell.h)/atlas.height);player.userData.sprite.scale.set(4.2*cell.w/cell.h,4.2,1);lastFrame=frame;}
    player.userData.sprite.material.color.set(night?0xb7cbe2:0xfff2df);
    const bob=moved?Math.sin(elapsed*11)*.05:0;player.position.y=bob;player.userData.legs.forEach((leg,i)=>leg.rotation.x=moved?Math.sin(elapsed*11+i*Math.PI)*.32:0);player.userData.arms.forEach((arm,i)=>arm.rotation.x=moved?Math.sin(elapsed*11+i*Math.PI)*.24:0);halo.position.set(p.x,.05,p.z);halo.visible=restActor.posture==='stand';restActor.update(dt,(loc==='f5'?SCRUB_ATLASES:SPRITE_ATLASES)[player.userData.character]);sun.position.set(p.x-15,35,p.z+18);sun.target.position.set(p.x,0,p.z);
    const targetLook=interiorRoom?new THREE.Vector3(0,0,-1):loc==='f7'?new THREE.Vector3(THREE.MathUtils.clamp(p.x,-8,8),0,THREE.MathUtils.clamp(p.z-3,-26,25)):new THREE.Vector3(p.x,0,p.z-2);look.lerp(targetLook,1-Math.exp(-dt*4));camera.position.copy(look).add(offset);camera.lookAt(look);sun.intensity=THREE.MathUtils.lerp(sun.intensity,night?.8:2.1,.025);hemi.intensity=THREE.MathUtils.lerp(hemi.intensity,night?.68:1.25,.025);renderer.toneMappingExposure=THREE.MathUtils.lerp(renderer.toneMappingExposure,night?.9:1.05,.025);scene.background.lerp(new THREE.Color(night?0x293e58:0x516271),.025);
    if(goal){const g=spots.find(s=>s.id===goal);goalRing.visible=!!g;if(g){goalRing.position.set(g.x,.09,g.z);goalRing.scale.setScalar(1+Math.sin(elapsed*3)*.1);}}else goalRing.visible=false;renderer.render(scene,camera);return moved;}
  function setPosture(kind,spot){if(kind==='stand'){if(restZoom!==null)camera.zoom=restZoom;restZoom=null;}else{if(restZoom===null)restZoom=camera.zoom;camera.zoom=Math.max(camera.zoom,kind==='lie'?1.45:1.2);}camera.updateProjectionMatrix();restActor.setPosture(kind,spot,(loc==='f5'?SCRUB_ATLASES:SPRITE_ATLASES)[player.userData.character]);}
  function project(s){const v=new THREE.Vector3(s.x,s.height??5.2,s.z).project(camera);const r=canvas.getBoundingClientRect();return{x:(v.x+1)/2*r.width,y:(1-v.y)/2*r.height,visible:v.z<1&&Math.abs(v.x)<1.1&&Math.abs(v.y)<1.15};}
  function nearest(){return spots.map(s=>({...s,distance:Math.hypot(s.x-player.position.x,s.z-player.position.z)})).filter(s=>s.distance<(s.morningBed?1.2:2.5)).sort((a,b)=>a.distance-b.distance)[0]||null;}
  function teleportToSpot(id){const s=spots.find(s=>s.id===id);if(!s)return false;let point=null;for(const radius of [0,.25,.5,.75,1]){for(let i=0;i<8;i++){const x=s.x+Math.cos(i*Math.PI/4)*radius,z=s.z+Math.sin(i*Math.PI/4)*radius;if(isOpen(x,z)){point={x,z};break;}}if(point)break;}if(!point)return false;path=[];player.position.set(point.x,0,point.z);followTrail=[];if(companion&&morningState?.escort==='following')companion.position.set(point.x-.8,0,point.z+.8);look.set(point.x,0,point.z);camera.position.copy(look).add(offset);camera.lookAt(look);return true;}
  return{setPosture,setRage:restActor.setRage,build,update,pick,resize,walkTo,teleportToSpot,project,nearest,setCharacter,setMorning,setWardPatientTask,setClinicTube,setClinicNurseAway,zoomBy(factor){camera.zoom=THREE.MathUtils.clamp(camera.zoom*factor,.8,1.7);camera.updateProjectionMatrix();return camera.zoom;},get spots(){return spots;},get labels(){return labels;},get position(){return{x:player.position.x,z:player.position.z};},get walked(){return walked;},setGoal(id){goal=id;},stop(){path=[];},dispose(){resizeObserver.disconnect();renderer.dispose();}};
}
