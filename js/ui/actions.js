/* ui/actions.js — 底部动作按钮栏 */
"use strict";

(function(){
const $ = GAME.util.$;
const {ACTIONS} = GAME.cfg;

GAME.ui.renderActions = function(){
  const boxEl=$('actions'); boxEl.innerHTML='';
  ACTIONS.forEach(a=>{
    const d=document.createElement('div'); d.className='act';
    d.innerHTML='<div class="n">'+a.name+'</div><div class="e">'+a.e+'</div>';
    d.onclick=()=>GAME.engine.doAction(a);
    boxEl.appendChild(d);
  });
  const shop=document.createElement('div'); shop.className='act shop';
  shop.innerHTML='<div class="n">🛒 商店</div><div class="e">花钱买省心 · 装备改变人生</div>';
  shop.onclick=()=>{ if(GAME.S.end)return; GAME.ui.renderShop(); $('shopModal').classList.add('show'); };
  boxEl.appendChild(shop);
};
})();
