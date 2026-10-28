/* core/state.js — 游戏状态 + localStorage 存档 */
"use strict";

const SAVE_KEY = 'survival-days-3d-save';

/* 初始状态（新一局从这里开始） */
function defaultState(){
  return {
    hunger:62, energy:78, health:58, stress:22, money:60, work:0,
    day:1, slot:0, nightCount:0, nightTmp:0, end:false,
    runExp:0, workExp:0, nightAction:'', weather:'sun',
    items:{raincoat:false,thermos:false,earphone:false,gym:false,bike:false,pc:false}
  };
}

GAME.S = defaultState();

/* 等级：跑单 8 经验 1 级，创作 4 经验 1 级 */
GAME.lvRun  = () => Math.floor(GAME.S.runExp/8);
GAME.lvWork = () => Math.floor(GAME.S.workExp/4);

/* ---- 存档 ---- */
GAME.save = function(){
  if(GAME.S.end) return;
  try{ localStorage.setItem(SAVE_KEY, JSON.stringify(GAME.S)); }catch(e){}
};
GAME.load = function(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(!raw) return false;
    const d = JSON.parse(raw);
    if(!d || d.end) return false;
    const fresh = defaultState();
    Object.assign(fresh, d);
    fresh.items = Object.assign(defaultState().items, d.items||{});
    GAME.S = fresh;
    return true;
  }catch(e){ return false; }
};
GAME.clearSave = function(){
  try{ localStorage.removeItem(SAVE_KEY); }catch(e){}
};
