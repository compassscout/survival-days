/* util.js — 通用小工具（无依赖，最先加载） */
"use strict";
window.GAME = window.GAME || {};

GAME.util = {
  $: id => document.getElementById(id),
  clamp: (v, lo, hi) => Math.max(lo, Math.min(hi, v))
};
