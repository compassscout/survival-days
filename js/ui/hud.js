/* ui/hud.js — 状态栏、日志、气泡台词 */
"use strict";
GAME.ui = {};

(function(){
const {$, clamp} = GAME.util;
const {SLOTS, GAME_DAYS} = GAME.cfg;

GAME.ui.log = function(msg, cls){
  const d=document.createElement('div'); d.className='l';
  d.innerHTML='<span class="t">D'+GAME.S.day+'·'+SLOTS[GAME.S.slot]+'</span><span>'+(cls?'<span class="'+cls+'">'+msg+'</span>':msg)+'</span>';
  const box=$('log'); box.prepend(d);
  while(box.children.length>9)box.lastChild.remove();
};

let speakTimer=null;
GAME.ui.speak = function(t){
  const el=$('thought'); el.textContent=t; el.classList.add('show');
  clearTimeout(speakTimer);
  speakTimer=setTimeout(()=>el.classList.remove('show'),2200);
};

GAME.ui.render = function(){
  const S=GAME.S;
  $('day').textContent=S.day;
  $('slotName').textContent=SLOTS[S.slot];
  $('weather').textContent=S.weather==='rain'?'🌧 下雨':'☀ 晴';
  $('dayfill').style.width=(S.day/GAME_DAYS*100)+'%';
  $('lvRun').textContent=GAME.lvRun(); $('lvWork').textContent=GAME.lvWork();
  $('v-hunger').textContent=Math.round(S.hunger);
  $('b-hunger').style.width=clamp(S.hunger,0,100)+'%';
  $('b-hunger').style.background=S.hunger<25?'var(--bad)':S.hunger<50?'var(--warn)':'var(--acc2)';
  $('v-energy').textContent=Math.round(S.energy);
  $('b-energy').style.width=clamp(S.energy,0,100)+'%';
  $('b-energy').style.background=S.energy<25?'var(--bad)':S.energy<50?'var(--warn)':'var(--acc)';
  $('v-health').textContent=Math.round(S.health);
  $('b-health').style.width=clamp(S.health,0,100)+'%';
  $('b-health').style.background=S.health<30?'var(--bad)':S.health<55?'var(--warn)':'var(--acc2)';
  $('v-money').textContent=Math.round(S.money);
  $('b-money').style.width=clamp(Math.round(S.money/300*100),2,100)+'%';
  $('b-money').style.background=S.money<40?'var(--bad)':'#8fb0c9';
  $('v-stress').textContent=Math.round(S.stress);
  $('b-stress').style.width=clamp(S.stress,0,100)+'%';
  $('b-stress').style.background=S.stress>70?'var(--bad)':'var(--warn)';
  $('v-work').textContent=Math.round(S.work);
  $('b-work').style.width=clamp(S.work,0,100)+'%';
  $('b-work').style.background='#b08fcf';
};
})();
