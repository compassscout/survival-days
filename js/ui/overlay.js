/* ui/overlay.js — 结算弹窗 */
"use strict";

(function(){
const $ = GAME.util.$;
const {GAME_DAYS} = GAME.cfg;

GAME.ui.showOverlay = function(title, text){
  const S=GAME.S;
  $('ovtitle').textContent=title; $('ovtext').textContent=text;
  $('s-day').textContent=Math.min(S.day,GAME_DAYS);
  $('s-money').textContent=Math.round(S.money); $('s-night').textContent=S.nightCount;
  $('ovskill').textContent='跑单 Lv.'+GAME.lvRun()+' · 创作 Lv.'+GAME.lvWork();
  $('overlay').classList.add('show');
};

$('restartBtn').onclick=()=>{ GAME.clearSave(); location.reload(); };
})();
