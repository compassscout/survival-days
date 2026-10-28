/* core/engine.js — 回合引擎：动作执行、时段推进、随机事件、生死判定 */
"use strict";
GAME.engine = {};

(function(){
const {clamp} = GAME.util;
const {GAME_DAYS} = GAME.cfg;

/* ---- 生死判定 ---- */
function checkDeath(){
  const S=GAME.S;
  if(S.end)return true;
  let death=null;
  if(S.hunger<=0){S.hunger=0;death=['饿垮了','饥饿到头，身体先撑不住了。'];}
  else if(S.energy<=0){S.energy=0;death=['累垮了','连续透支，再也站不起来。'];}
  else if(S.health<=0){S.health=0;death=['身体垮了','长期透支，健康被自己耗光了。'];}
  if(death){S.end=true;GAME.ui.log(death[1],'dmg');endGame(death[0],death[1]+' 第 '+S.day+' 天。');return true;}
  return false;
}

function endGame(title,text){
  GAME.S.end=true;
  GAME.clearSave();
  GAME.ui.showOverlay(title,text);
}

function finish(){
  const S=GAME.S;
  let rating;
  if(S.health>=70&&S.money>=100)rating='稳扎稳打 · 作息和口袋都守住了';
  else if(S.health>=50)rating='熬过来了 · 健康还行，但可以更好';
  else rating='伤痕累累 · 活着，但代价太大';
  const verdict=S.money>=120?'活得还行，攒下了 '+Math.round(S.money)+' 块。':(S.health>=60?'钱不多，但身体没垮，这已经是赢了。':'勉强活着，身体在透支边缘。');
  endGame('活过第 30 天 · '+rating,'三十天，你靠一次次跑单活了下来。攒下 '+Math.round(S.money)+' 块，熬了 '+S.nightCount+' 个夜。'+verdict);
}

/* ---- 新的一天：衰减 + 天气 ---- */
function newDay(){
  const S=GAME.S, log=GAME.ui.log;
  S.hunger-=6-(S.items.thermos?3:0);
  S.energy-=5;
  if(S.items.earphone)S.stress-=5;
  if(S.items.gym)S.health+=3;
  if(S.hunger<=20){S.health-=4;log('吃不上饭，体力在流失','dmg');}
  if(S.money<=0){S.stress+=10;log('钱包见底，压力上来了','dmg');}
  S.weather=Math.random()<.3?'rain':'sun';
  GAME.world.rainPts.visible=(S.weather==='rain');
  if(S.weather==='rain')log('今天下雨，跑单更难了','dmg');
}

/* ---- 推进一个时段 ---- */
GAME.engine.advance = function(){
  const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak;
  if(S.slot===4&&S.nightAction!=='sleep'){S.nightTmp++;S.nightCount++;log('深夜还在硬撑，熬了个夜','dmg');}
  S.slot++;
  if(S.slot>=5){
    S.slot=0;S.day++;
    if(S.nightTmp>0){
      S.energy-=Math.min(28,25+5*S.nightTmp);S.health-=6*S.nightTmp;S.stress+=12*S.nightTmp;
      log('昨晚熬夜，今天头晕眼花','dmg');speak('身体在记这笔账…');
    }
    S.nightTmp=0;
    newDay();
    if(S.day>GAME_DAYS){GAME.ui.render();finish();return;}
  }
  S.hunger=clamp(S.hunger,0,100);S.energy=clamp(S.energy,0,100);
  S.health=clamp(S.health,0,100);S.stress=clamp(S.stress,0,100);
  if(!checkDeath()){GAME.ui.render();GAME.save();}
};

/* ---- 随机事件 ---- */
GAME.engine.rollEvent = function(after){
  const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak;
  const r=Math.random();
  if(after==='run'){
    if(GAME.lvRun()>=5&&r<.04){log('老骑手的预判：躲过了一张罚单','up');return;}
    if(r<.09){S.money-=30;S.stress+=6;log('逆行被交警拦下，罚单 -30 元','dmg');speak('心疼…');}
    else if(r<.17){S.money-=15;S.stress+=8;log('顾客差评：汤洒了，扣款 -15 元','dmg');speak('有苦说不出');}
    else if(r<.25){const tip=S.weather==='rain'?30:20;S.money+=tip;log('顾客打赏 +'+tip+' 元','up');speak('遇到好心人了');}
    else if(r<.32&&S.weather==='rain'&&!S.items.raincoat){S.health-=8;log('雨天路滑，摔了一跤（健康 -8）','dmg');speak('疼…');}
  }else if(after==='eat'&&r<.1){
    S.hunger=clamp(S.hunger+8,0,100);log('老板多送了个鸡腿，饱腹 +8','up');speak('今天运气不错');
  }else if(after==='work'&&r<.15){
    S.work=clamp(S.work+10,0,100);log('灵感来了，作品进度 +10','up');speak('这条感觉能火');
  }
};

/* ---- 执行动作（演出 2.4s 后结算） ---- */
let acting=false;
GAME.engine.doAction = function(a){
  if(acting||GAME.S.end)return;
  acting=true;document.body.classList.add('busy');
  GAME.S.nightAction=a.id;
  a.start();
  setTimeout(()=>{
    const ok=a.apply();
    if(ok!==false)GAME.engine.advance();else GAME.ui.render();
    acting=false;document.body.classList.remove('busy');
  },2400);
};
})();
