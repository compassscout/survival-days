/* scene/world.js — 城市、灯光、天气、昼夜渲染循环 */
"use strict";
GAME.world = {};

(function(){
const {$, clamp} = GAME.util;
const {CAMS, PALETTES} = GAME.cfg;

/* 场景共享引用（其它模块通过 GAME.world.* 访问） */
let renderer, scene, camera, clock;
let sunL, ambL, sunMesh, moonMesh, stars, rainPts, laptopG, steamG, bedG;
const lampHeads = [], lampPts = [], winMats = [];

/* 相机目标（平滑过渡） */
const camPos   = new THREE.Vector3(17,11,17);
const camLookT = new THREE.Vector3(0,1,0);
const curLook  = new THREE.Vector3(0,1,0);

/* 当前天色（逐帧向目标时段过渡） */
const cur = {
  sky:new THREE.Color(0xf2b880), fog:new THREE.Color(0xf2b880),
  sun:new THREE.Color(0xffd9a0), si:.85, ai:.5
};
const targetSunPos = new THREE.Vector3(-18,7,6);
const tmpColor = new THREE.Color();

/* ---- 建模小工具 ---- */
function mat(c){ return new THREE.MeshLambertMaterial({color:c}); }
function noFog(m){ m.fog=false; return m; }
function box(w,h,d,c,x,y,z,parent){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));
  m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true;
  (parent||scene).add(m); return m;
}
GAME.world.box = box;
GAME.world.noFog = noFog;

/* ---- 初始化 ---- */
GAME.world.init = function(){
  scene=new THREE.Scene();
  scene.background=cur.sky;
  scene.fog=new THREE.Fog(0xf2b880,30,75);
  camera=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,.1,200);
  camera.position.copy(camPos);
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setSize(innerWidth,innerHeight);
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  $('c').appendChild(renderer.domElement);
  clock=new THREE.Clock();

  ambL=new THREE.AmbientLight(0xffffff,.5); scene.add(ambL);
  scene.add(new THREE.HemisphereLight(0xcfe8ff,0x3a4a3a,.35));
  sunL=new THREE.DirectionalLight(0xffd9a0,.85);
  sunL.position.set(-18,7,6);
  sunL.castShadow=true;
  sunL.shadow.mapSize.set(1024,1024);
  sunL.shadow.camera.left=-30; sunL.shadow.camera.right=30;
  sunL.shadow.camera.top=30;  sunL.shadow.camera.bottom=-30;
  sunL.shadow.camera.far=90;
  scene.add(sunL);

  /* 地面与道路 */
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(90,90),mat(0x2e4a32));
  ground.rotation.x=-Math.PI/2; ground.receiveShadow=true; scene.add(ground);
  const roadM=mat(0x33333c);
  const r1=new THREE.Mesh(new THREE.PlaneGeometry(40,4.6),roadM);
  r1.rotation.x=-Math.PI/2; r1.position.y=.01; r1.receiveShadow=true; scene.add(r1);
  const r2=new THREE.Mesh(new THREE.PlaneGeometry(4.6,40),roadM);
  r2.rotation.x=-Math.PI/2; r2.position.y=.01; r2.receiveShadow=true; scene.add(r2);
  for(let i=-2;i<=2;i++){
    const z=new THREE.Mesh(new THREE.PlaneGeometry(.5,3.6),noFog(new THREE.MeshBasicMaterial({color:0x8a8a92})));
    z.rotation.x=-Math.PI/2; z.position.set(i*1.1,.02,3.9); scene.add(z);
  }

  /* 背景楼群（带窗） */
  const winGeo=new THREE.PlaneGeometry(.55,.7);
  function building(x,z,w,h,d,c){
    box(w,h,d,c,x,h/2,z);
    const cols=Math.max(2,Math.floor(w/1.4)), rows=Math.max(2,Math.floor(h/1.6));
    for(let r=0;r<rows;r++)for(let ci=0;ci<cols;ci++){
      if(Math.random()<.25)continue;
      const wm=noFog(new THREE.MeshBasicMaterial({color:0x2a2f3a}));
      const win=new THREE.Mesh(winGeo,wm);
      win.position.set(x-w/2+.9+ci*(w-1.8)/Math.max(1,cols-1), .9+r*(h-1.6)/Math.max(1,rows-1), z+d/2+.02);
      scene.add(win); winMats.push(wm);
    }
  }
  building(-22,-20,7,13,6,0x4a4a58); building(-12,-22,6,9,6,0x55505e);
  building(2,-22,8,15,7,0x474552);   building(13,-21,6,8,6,0x525a66);
  building(22,-14,6,11,6,0x4a4a58);  building(23,2,6,14,7,0x50545e);
  building(22,14,7,10,6,0x474552);   building(-23,16,6,12,6,0x55505e);
  building(-24,2,6,9,6,0x4c505c);    building(-20,22,7,8,6,0x4a4a58);

  /* 家 */
  box(4.5,2.8,4,0x8a6f52,-13,1.4,-10);
  const roof=new THREE.Mesh(new THREE.ConeGeometry(3.6,1.8,4),mat(0x6b4a3a));
  roof.position.set(-13,3.7,-10); roof.rotation.y=Math.PI/4; roof.castShadow=true; scene.add(roof);
  bedG=new THREE.Group();
  box(1.9,.45,1,0x5a6a8a,0,.22,0,bedG);
  box(.5,.5,.9,0xe8e0d0,-.6,.5,0,bedG);
  bedG.position.set(-15.8,0,-7); scene.add(bedG);
  box(1.6,.1,.9,0x6b5a44,-11,1,-6.5);
  box(.15,1,.15,0x6b5a44,-11.6,.5,-6.5); box(.15,1,.15,0x6b5a44,-10.4,.5,-6.5);
  laptopG=new THREE.Group();
  box(.7,.05,.5,0x2a2a32,0,0,0,laptopG);
  const lscr=new THREE.Mesh(new THREE.PlaneGeometry(.65,.45),noFog(new THREE.MeshBasicMaterial({color:0x8fd0ff})));
  lscr.position.set(0,.25,-.22); lscr.rotation.x=-.3; laptopG.add(lscr);
  laptopG.position.set(-11,1.08,-6.5); laptopG.visible=false; scene.add(laptopG);

  /* 饭摊 */
  box(2.6,1,1.4,0x7a5a40,10,.5,9);
  const canopy=new THREE.Mesh(new THREE.ConeGeometry(2.3,1.1,4),mat(0xc96a5a));
  canopy.position.set(10,2.4,9); canopy.rotation.y=Math.PI/4; canopy.castShadow=true; scene.add(canopy);
  box(.14,2,.14,0x5a4a3a,8.9,1,9.8); box(.14,2,.14,0x5a4a3a,11.1,1,8.2);
  steamG=new THREE.Group();
  for(let i=0;i<3;i++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(.16,6,6),new THREE.MeshBasicMaterial({color:0xd8d8e0,transparent:true,opacity:.6}));
    s.position.set(9.6+i*.4,1.3,9); steamG.add(s);
  }
  steamG.visible=false; scene.add(steamG);

  /* 医院 */
  box(5,4.5,4.5,0xd8d8de,13,2.25,-11);
  box(1.5,.5,.12,0xc94a4a,13,3.4,-8.72); box(.5,1.5,.12,0xc94a4a,13,3.4,-8.72);

  /* 配送站 */
  box(3.6,2.6,3,0xc9a24c,0,1.3,-13.5);
  box(4.2,.4,3.6,0x8a7430,0,2.8,-13.5);

  /* 公园：树 + 长椅 */
  function tree(x,z){
    const t=new THREE.Group();
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.24,1.2,6),mat(0x6b4a3a));
    trunk.position.y=.6; trunk.castShadow=true; t.add(trunk);
    const leaf=new THREE.Mesh(new THREE.ConeGeometry(1.1,2.2,7),mat(0x3f6b3a));
    leaf.position.y=2.2; leaf.castShadow=true; t.add(leaf);
    t.position.set(x,0,z); scene.add(t);
  }
  tree(-13,12); tree(-7,13); tree(-15,8); tree(7,-13); tree(-7,-14); tree(16,12); tree(5,14);
  box(1.8,.12,.5,0x7a5a40,-10,.55,10);
  box(.12,.55,.5,0x5a4a3a,-10.7,.28,10); box(.12,.55,.5,0x5a4a3a,-9.3,.28,10);

  /* 路灯 */
  function lamp(x,z,withLight){
    const g=new THREE.Group();
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,3.4,6),mat(0x3a3a44));
    pole.position.y=1.7; pole.castShadow=true; g.add(pole);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.22,8,8),noFog(new THREE.MeshBasicMaterial({color:0x555560})));
    head.position.y=3.5; g.add(head); lampHeads.push(head.material);
    if(withLight){
      const pl=new THREE.PointLight(0xffd98a,0,15);
      pl.position.y=3.5; g.add(pl); lampPts.push(pl);
    }
    g.position.set(x,0,z); scene.add(g);
  }
  lamp(-6,3.6,true); lamp(6,-3.6,true); lamp(-6,-3.6,false); lamp(6,3.6,false);

  /* 太阳 / 月亮 / 星星 */
  sunMesh=new THREE.Mesh(new THREE.SphereGeometry(1.6,12,12),noFog(new THREE.MeshBasicMaterial({color:0xffd98a})));
  scene.add(sunMesh);
  moonMesh=new THREE.Mesh(new THREE.SphereGeometry(1.1,12,12),noFog(new THREE.MeshBasicMaterial({color:0xe6e2cf})));
  moonMesh.position.set(9.6,25.6,-22.4); moonMesh.visible=false; scene.add(moonMesh);
  const starGeo=new THREE.BufferGeometry(), sp=[];
  for(let i=0;i<350;i++){
    const a=Math.random()*Math.PI*2, r=45+Math.random()*25, y=10+Math.random()*35;
    sp.push(Math.cos(a)*r,y,Math.sin(a)*r);
  }
  starGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
  stars=new THREE.Points(starGeo,noFog(new THREE.PointsMaterial({color:0xcdd6f4,size:.35})));
  stars.visible=false; scene.add(stars);

  /* 雨 */
  const rainGeo=new THREE.BufferGeometry(), rp=[];
  for(let i=0;i<900;i++) rp.push((Math.random()-.5)*44,Math.random()*22,(Math.random()-.5)*44);
  rainGeo.setAttribute('position',new THREE.Float32BufferAttribute(rp,3));
  rainPts=new THREE.Points(rainGeo,noFog(new THREE.PointsMaterial({color:0x9db4d0,size:.14,transparent:true,opacity:.75})));
  rainPts.visible=false; scene.add(rainPts);

  /* 导出共享引用 */
  Object.assign(GAME.world, {
    renderer, scene, camera, clock, sunL, ambL,
    sunMesh, moonMesh, stars, rainPts, laptopG, steamG, bedG,
    lampHeads, lampPts, winMats
  });

  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
};

/* ---- 机位切换 ---- */
GAME.world.setCam = function(name){
  const c=CAMS[name];
  camPos.set(c.p[0],c.p[1],c.p[2]);
  camLookT.set(c.l[0],c.l[1],c.l[2]);
};

/* ---- 渲染循环 ---- */
GAME.world.animate = function(){
  requestAnimationFrame(GAME.world.animate);
  const S=GAME.S;
  const dt=Math.min(clock.getDelta(),.05), t=clock.elapsedTime;

  /* 昼夜过渡 */
  const P=PALETTES[S.slot], k=1-Math.pow(.0018,dt);
  cur.sky.lerp(tmpColor.setHex(P.sky),k);
  cur.fog.lerp(tmpColor.setHex(P.fog),k);
  cur.sun.lerp(tmpColor.setHex(P.sun),k);
  cur.si+=(P.si*(S.weather==='rain'?.45:1)-cur.si)*k;
  cur.ai+=(P.ai-cur.ai)*k;
  scene.fog.color.copy(cur.fog);
  sunL.color.copy(cur.sun); sunL.intensity=cur.si; ambL.intensity=cur.ai;
  targetSunPos.set(P.sunPos[0],P.sunPos[1],P.sunPos[2]);
  sunL.position.lerp(targetSunPos,k);
  sunMesh.position.copy(sunL.position).multiplyScalar(1.6);
  sunMesh.material.color.copy(cur.sun);
  sunMesh.visible=!P.star;
  moonMesh.visible=P.star; stars.visible=P.star;
  lampHeads.forEach(m=>m.color.setHex(P.lamp?0xffd98a:0x555560));
  lampPts.forEach(l=>l.intensity=P.lamp?.9:0);
  winMats.forEach(m=>m.color.setHex(P.win?0xffd98a:0x2a2f3a));

  /* 雨 */
  if(rainPts.visible){
    const pos=rainPts.geometry.attributes.position;
    for(let i=0;i<pos.count;i++){
      let y=pos.getY(i)-dt*16;
      if(y<0)y=22;
      pos.setY(i,y);
    }
    pos.needsUpdate=true;
  }

  /* 蒸汽 */
  if(steamG.visible){
    steamG.children.forEach(s=>{
      s.position.y+=dt*.9;
      s.material.opacity=Math.max(0,.65-(s.position.y-1.3)/1.6);
      if(s.position.y>2.9){s.position.y=1.3;s.material.opacity=.6;}
      s.scale.setScalar(1+(s.position.y-1.3)*.5);
    });
  }

  /* 角色行为 */
  GAME.character.update(dt,t,clamp);

  /* 相机 */
  camera.position.lerp(camPos,1-Math.pow(.006,dt));
  curLook.lerp(camLookT,1-Math.pow(.006,dt));
  camera.lookAt(curLook);

  renderer.render(scene,camera);
};
})();
