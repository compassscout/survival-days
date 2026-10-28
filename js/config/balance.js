/* config/balance.js — 数值配置层：商品、动作、收益代价全部在这里调
 * 改数值只动这个文件，不用碰逻辑代码。
 * start() = 演出（移动角色/切机位/气泡台词），apply() = 数值结算。
 * apply() 返回 false 表示动作失败（如钱不够），不推进时段。
 */
"use strict";

/* ---- 商店装备（永久生效） ---- */
GAME.cfg.ITEMS = [
  {key:'raincoat',icon:'🌂',name:'雨衣',price:60,desc:'雨天跑单不再减收入，也不会摔伤'},
  {key:'thermos',icon:'🥤',name:'保温杯',price:45,desc:'每天饱腹衰减 -3，随时有热水喝'},
  {key:'earphone',icon:'🎧',name:'降噪耳机',price:120,desc:'每天压力 -5，休息和睡觉降压更多'},
  {key:'gym',icon:'🏋️',name:'健身月卡',price:200,desc:'每天健康 +3，睡觉额外回健康'},
  {key:'bike',icon:'🛵',name:'二手电动车',price:300,desc:'跑单收入 +15 元，精力消耗更少'},
  {key:'pc',icon:'💻',name:'二手电脑',price:500,desc:'做内容进度 +12，作品更值钱'}
];

/* ---- 六个动作 ---- */
GAME.cfg.ACTIONS = [
  {id:'run', name:'🛵 跑单', e:'+钱 · 耗精力/饱腹 · 加压力', cam:'ride',
   start(){
     const C=GAME.character;
     C.group.position.set(-13,.62,0); C.rideDir=1; C.group.rotation.y=Math.PI/2; C.mode='ride';
     GAME.world.setCam('ride');
     GAME.ui.speak(GAME.S.weather==='rain'?'雨天单多，路也难走…':'接单了，出发！');
   },
   apply(){
     const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak, clamp=GAME.util.clamp;
     let pay=45+GAME.lvRun()*3+(S.items.bike?15:0);
     if(S.weather==='rain'&&!S.items.raincoat)pay=Math.floor(pay*.8);
     S.money+=pay;
     S.energy-=S.items.bike?14:20; S.hunger-=16; S.stress+=11; S.health-=2;
     S.runExp++;
     log('跑单，进账 '+pay+' 元','up');
     if(S.hunger<=20){S.health-=14;log('饿着跑单，一阵晕眩（低血糖）','dmg');speak('眼前发黑…');}
     GAME.engine.rollEvent('run');
   }},
  {id:'eat', name:'🍜 吃一顿', e:'-12元 · 饱腹+ · 健康+', cam:'stall',
   start(){
     const C=GAME.character;
     C.group.position.set(10,0,7.4); C.group.rotation.y=0; C.mode='eat';
     GAME.world.steamG.visible=true;
     GAME.world.setCam('stall');
     GAME.ui.speak('老板，来碗面');
   },
   apply(){
     const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak;
     GAME.world.steamG.visible=false;
     if(S.money<12){log('钱不够吃这顿','dmg');speak('连饭都吃不起…');return false;}
     S.money-=12;S.hunger+=42;S.health+=4;S.stress-=5;
     log('吃了顿热乎的，饱腹 +42','up');
     GAME.engine.rollEvent('eat');
   }},
  {id:'sleep', name:'😴 睡觉', e:'回精力 · 耗饱腹 · 深夜睡才不熬夜', cam:'home',
   start(){
     GAME.character.mode='sleep';
     GAME.world.setCam('home');
     GAME.ui.speak('晚安…');
   },
   apply(){
     const S=GAME.S, log=GAME.ui.log;
     const night=(S.slot===4);
     S.energy+=night?70:35;
     S.hunger-=22;S.stress-=8+(S.items.earphone?4:0);
     S.health+=4+(S.items.gym?4:0);
     log(night?'睡了一整夜，精力大增':'补了个觉，精力 +35','up');
     if(!night&&S.energy<70)log('白天补觉，晚上更难睡着','dmg');
   }},
  {id:'rest', name:'🌳 休息', e:'降压力 · 略耗精力', cam:'park',
   start(){
     GAME.character.mode='sit';
     GAME.world.setCam('park');
     GAME.ui.speak('喘口气…');
   },
   apply(){
     const S=GAME.S, log=GAME.ui.log;
     S.stress-=14+(S.items.earphone?8:0);S.energy-=6;
     log('在公园坐了一会儿，压力下降','up');
     if(S.stress>60)log('心里乱，休息也歇不踏实','dmg');
   }},
  {id:'doc', name:'🏥 看医生', e:'-45元 · 健康+', cam:'hospital',
   start(){
     const C=GAME.character;
     C.group.position.set(13,0,-8); C.group.rotation.y=Math.PI; C.mode='doc';
     GAME.world.setCam('hospital');
     GAME.ui.speak('还是得来看看…');
   },
   apply(){
     const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak;
     if(S.money<45){log('钱不够看病','dmg');speak('看不起病…');return false;}
     S.money-=45;S.health+=34;S.stress-=8;
     log('看了医生，健康 +34','up');
   }},
  {id:'work', name:'💻 做内容', e:'作品+ · 耗精力/饱腹 · 满 100 结算', cam:'home',
   start(){
     const C=GAME.character;
     C.group.position.set(-11,0,-5.5); C.group.rotation.y=Math.PI; C.mode='work';
     GAME.world.laptopG.visible=true;
     GAME.world.setCam('home');
     GAME.ui.speak('再剪一条…');
   },
   apply(){
     const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak;
     GAME.world.laptopG.visible=false;
     const prog=26+GAME.lvWork()*4+(S.items.pc?12:0);
     S.work+=prog; S.energy-=16; S.hunger-=9; S.workExp++;
     if(S.work>=100){S.work=0;const pay=200+GAME.lvWork()*20;S.money+=pay;log('作品上线，进账 '+pay+' 元','up');speak('作品终于上线了');}
     else log('做了一版内容，进度 +'+prog,'up');
     GAME.engine.rollEvent('work');
   }}
];
