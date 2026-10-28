// Reuse the resident's own illustration for the torso and lying figure; no new character art is substituted.
export function createResidentRest(THREE,scene,player){
  const group=new THREE.Group(),body=new THREE.Group(),legs=new THREE.Group(),sleep=new THREE.Group(),steam=new THREE.Group();group.add(body,legs,sleep);scene.add(group,steam);group.visible=false;steam.visible=false;
  const torsoMaterial=new THREE.SpriteMaterial({transparent:true,alphaTest:.18,depthWrite:true,toneMapped:false});const torso=new THREE.Sprite(torsoMaterial);torso.center.set(.5,0);torso.position.y=.9;body.add(torso);
  const lieMaterial=new THREE.MeshBasicMaterial({transparent:true,alphaTest:.18,side:THREE.DoubleSide,toneMapped:false,depthWrite:true});const lying=new THREE.Mesh(new THREE.PlaneGeometry(1,1),lieMaterial);lying.rotation.x=-Math.PI/2;lying.position.y=1.36;sleep.add(lying);
  const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.85});const trousers=mat(0x273e57),shoe=mat(0xc3c5bd);
  const part=(x,y,z,w,h,d,m)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=true;legs.add(mesh);return mesh;};
  for(const side of [-1,1]){part(side*.22,.86,.36,.34,.3,.92,trousers);part(side*.22,.48,.75,.29,.65,.29,trousers);part(side*.22,.18,.88,.35,.2,.62,shoe);}
  function glyph(text,color){const can=document.createElement('canvas');can.width=can.height=128;const ctx=can.getContext('2d');ctx.font='bold 88px sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,64,100);const map=new THREE.CanvasTexture(can);return new THREE.Sprite(new THREE.SpriteMaterial({map,transparent:true,depthTest:false}));}
  const zeds=[0,1,2].map(i=>{const s=glyph('Z','#bed8df');s.scale.setScalar(.45+i*.12);sleep.add(s);return s;});
  const bursts=[0,1,2,3].map(i=>{const s=glyph(i%2?'!':'怒','#eab19b');s.scale.setScalar(.8);steam.add(s);return s;});
  let posture='stand',anchor=null,exit=null,progress=0,torsoMap=null,lieMap=null,key='',rage=false,time=0;
  function syncMap(atlas){if(!player.userData.map.image)return;const k=player.userData.character+'|'+player.userData.outfit;if(k===key)return;key=k;torsoMap?.dispose();lieMap?.dispose();torsoMap=player.userData.map.clone();lieMap=player.userData.map.clone();const f=atlas.frames[0],upper=f.h*.61;for(const map of [torsoMap,lieMap])map.needsUpdate=true;torsoMap.repeat.set(f.w/atlas.width,upper/atlas.height);torsoMap.offset.set(f.x/atlas.width,1-(f.y+upper)/atlas.height);lieMap.repeat.set(f.w/atlas.width,f.h/atlas.height);lieMap.offset.set(f.x/atlas.width,1-(f.y+f.h)/atlas.height);torsoMaterial.map=torsoMap;lieMaterial.map=lieMap;torsoMaterial.needsUpdate=lieMaterial.needsUpdate=true;torso.scale.set(2.5*f.w/upper,2.5,1);lying.scale.set(4.2*f.w/f.h,4.2,1);trousers.color.set(player.userData.outfit==='scrubs'?0x367e69:0x273e57);}
  function setPosture(kind,spot,atlas){
    if(kind==='stand'){if(posture!=='stand'&&exit)player.position.set(exit.x,0,exit.z);posture='stand';group.visible=false;player.userData.sprite.visible=true;return;}
    exit={x:player.position.x,z:player.position.z};posture=kind;anchor=spot.seat||{x:spot.x,z:spot.z};progress=0;group.visible=true;syncMap(atlas);body.visible=legs.visible=kind==='sit';sleep.visible=kind==='lie';group.position.set(exit.x,0,exit.z);legs.rotation.y=anchor.rotation||0;
    player.userData.sprite.visible=false;player.userData.fallback.visible=false;
  }
  function update(dt,atlas){time+=dt;if(posture!=='stand'){
    syncMap(atlas);progress=Math.min(1,progress+dt/0.45);const a=1-(1-progress)**3;group.position.set(THREE.MathUtils.lerp(exit.x,anchor.x,a),0,THREE.MathUtils.lerp(exit.z,anchor.z,a));player.position.set(group.position.x,0,group.position.z);body.position.y=(1-a)*.8+Math.sin(time*2)*.015;sleep.position.y=Math.sin(time*1.5)*.012;
    zeds.forEach((s,i)=>{const p=(time*.35+i*.3)%1;s.position.set(-.55-i*.15,2+p*.8,-1.5);s.material.opacity=(1-p)*.8;});
  }
    steam.visible=rage;if(rage){steam.position.set(player.position.x,0,player.position.z);bursts.forEach((s,i)=>{const a=time*3+i*Math.PI/2;s.position.set(Math.cos(a)*1.1,3.6+Math.sin(time*8+i)*.25,Math.sin(a)*.6);s.material.rotation=Math.sin(time*12+i)*.2;});player.userData.sprite.position.x=Math.sin(time*45)*.1;}else player.userData.sprite.position.x=0;
  }
  return{setPosture,update,setRage(v){rage=v;},get posture(){return posture;}};
}
