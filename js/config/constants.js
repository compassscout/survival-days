/* config/constants.js — 固定常量：时段、天数、机位、昼夜调色板 */
"use strict";
GAME.cfg = GAME.cfg || {};

/* 一天的 5 个时段 */
GAME.cfg.SLOTS = ["清晨", "上午", "下午", "傍晚", "深夜"];

/* 通关天数 */
GAME.cfg.GAME_DAYS = 30;

/* 机位（p=相机位置，l=注视点） */
GAME.cfg.CAMS = {
  overview:{p:[17,11,17],   l:[0,1,0]},
  ride:    {p:[2,6.5,11],   l:[0,1,0]},
  home:    {p:[-6.5,4.5,-1],l:[-13,1,-8]},
  stall:   {p:[4.5,4,15.5], l:[10,1.2,9]},
  hospital:{p:[6.5,5,-2],   l:[13,1.5,-9]},
  park:    {p:[-4,4.2,16],  l:[-10,1,10]}
};

/* 5 个时段对应的天色 / 光照 / 太阳位置（与 SLOTS 一一对应） */
GAME.cfg.PALETTES = [
  {sky:0xf2b880, fog:0xf2b880, sun:0xffd9a0, si:.85, ai:.5,  lamp:false, win:false, star:false, sunPos:[-18,7,6]},
  {sky:0x8fc3e8, fog:0x9fcbe8, sun:0xfff3dd, si:1.15,ai:.65, lamp:false, win:false, star:false, sunPos:[-4,22,8]},
  {sky:0x84aede, fog:0x93b8de, sun:0xffeec8, si:1.05,ai:.6,  lamp:false, win:false, star:false, sunPos:[10,17,6]},
  {sky:0xd97e52, fog:0xd98a60, sun:0xff9c5a, si:.55, ai:.42, lamp:true,  win:true,  star:false, sunPos:[20,5,4]},
  {sky:0x141824, fog:0x141824, sun:0x8fa0ff, si:.16, ai:.3,  lamp:true,  win:true,  star:true,  sunPos:[6,16,-14]}
];
