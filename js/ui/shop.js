/* ui/shop.js — 商店弹窗 */
"use strict";

(function(){
const $ = GAME.util.$;
const {ITEMS} = GAME.cfg;

GAME.ui.renderShop = function(){
  const S=GAME.S, log=GAME.ui.log, speak=GAME.ui.speak;
  $('shopMoney').textContent=Math.round(S.money);
  const box=$('shopItems'); box.innerHTML='';
  ITEMS.forEach(it=>{
    const owned=S.items[it.key];
    const d=document.createElement('div');
    d.className='shopitem'+(owned?' owned':'');
    d.innerHTML='<div class="ic">'+it.icon+'</div><div class="inf"><div class="nm">'+it.name+'</div><div class="ds">'+it.desc+'</div></div>';
    const btn=document.createElement('button');
    btn.textContent=owned?'已拥有':'¥'+it.price;
    btn.disabled=owned||S.money<it.price;
    btn.onclick=()=>{
      if(S.items[it.key]||S.money<it.price)return;
      S.money-=it.price; S.items[it.key]=true;
      log('买下了'+it.name,'up'); speak(it.name+'，到手！');
      GAME.ui.renderShop(); GAME.ui.render(); GAME.save();
    };
    d.appendChild(btn); box.appendChild(d);
  });
};

$('shopClose').onclick=()=>$('shopModal').classList.remove('show');
$('shopModal').addEventListener('click',e=>{ if(e.target.id==='shopModal')$('shopModal').classList.remove('show'); });
})();
