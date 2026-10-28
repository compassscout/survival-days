/* main.js — 启动入口 */
"use strict";

(function(){
const $ = GAME.util.$;

if(!window.THREE){
  $('fallback').style.display='flex';
  return;
}

try{
  GAME.world.init();
  GAME.character.init();
}catch(e){
  $('fallback').style.display='flex';
  return;
}

/* 有存档则继续，否则新开局 */
const resumed = GAME.load();

GAME.ui.renderActions();
GAME.ui.render();

if(resumed){
  /* 恢复存档时同步天气演出 */
  GAME.world.rainPts.visible=(GAME.S.weather==='rain');
  GAME.ui.log('读档成功，继续第 '+GAME.S.day+' 天。');
}else{
  GAME.ui.log('第 1 天开始了。目标：活过 30 天。');
  GAME.ui.speak('新的一天，先想想怎么活。');
}

GAME.world.animate();

setTimeout(()=>{ $('hint').style.opacity=0; },6000);
})();
