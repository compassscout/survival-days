/* scene/character.js — 主角 + 电驴，及待机/骑行/睡觉/坐等动画 */
"use strict";
GAME.character = {
  group:null, bike:null, wheelF:null, wheelB:null,
  mode:'idle',   /* idle | ride | sleep | sit | eat | doc | work */
  rideDir:1
};

(function(){
/* 在 world.init 之后调用 */
GAME.character.init = function(){
  const box=GAME.world.box;
  const scene=GAME.world.scene;

  const char=new THREE.Group();
  box(.16,.5,.18,0x2b2b33,-.12,.25,0,char);
  box(.16,.5,.18,0x2b2b33,.12,.25,0,char);
  box(.5,.62,.3,0x3a6ea8,0,.81,0,char);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.26,10,10),new THREE.MeshLambertMaterial({color:0xd9a06b}));
  head.position.y=1.45; head.castShadow=true; char.add(head);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(.3,10,8,0,Math.PI*2,0,Math.PI/2),new THREE.MeshLambertMaterial({color:0xe8c46a}));
  helmet.position.y=1.52; char.add(helmet);
  char.position.set(-13,0,-7); scene.add(char);

  const bike=new THREE.Group();
  box(1.1,.14,.34,0xc94a4a,0,.5,0,bike);
  box(.14,.55,.14,0x8a8a92,.45,.78,0,bike);
  box(.5,.08,.3,0x2b2b33,-.15,.72,0,bike);
  const wg=new THREE.TorusGeometry(.32,.09,8,16);
  const tireMat=new THREE.MeshLambertMaterial({color:0x22222a});
  const wheelF=new THREE.Mesh(wg,tireMat); wheelF.position.set(.55,.32,0); wheelF.castShadow=true; bike.add(wheelF);
  const wheelB=new THREE.Mesh(wg,tireMat); wheelB.position.set(-.5,.32,0); wheelB.castShadow=true; bike.add(wheelB);
  bike.visible=false; scene.add(bike);

  this.group=char; this.bike=bike; this.wheelF=wheelF; this.wheelB=wheelB;
};

/* 每帧由 world.animate 调用 */
GAME.character.update = function(dt,t,clamp){
  const C=this, char=C.group, bike=C.bike;
  if(!char)return;

  if(C.mode==='ride'){
    bike.visible=true;
    char.position.x+=C.rideDir*dt*6.5;
    if(char.position.x>13)C.rideDir=-1;
    if(char.position.x<-13)C.rideDir=1;
    char.position.set(clamp(char.position.x,-13,13),.62,0);
    char.rotation.y=C.rideDir>0?Math.PI/2:-Math.PI/2;
    bike.position.set(char.position.x,0,0);
    bike.rotation.y=C.rideDir>0?0:Math.PI;
    C.wheelF.rotation.z-=dt*9*C.rideDir;
    C.wheelB.rotation.z-=dt*9*C.rideDir;
  }else{
    bike.visible=false;
    if(C.mode==='sleep'){
      const bedG=GAME.world.bedG;
      char.rotation.x=-Math.PI/2;
      char.position.set(bedG.position.x,.78,bedG.position.z);
    }else if(C.mode==='sit'){
      char.rotation.x=0;
      char.position.set(-10,.3,10); char.rotation.y=Math.PI*.85;
    }else{
      char.rotation.x=0;
      char.position.y=Math.sin(t*2)*.025;
    }
  }
};
})();
