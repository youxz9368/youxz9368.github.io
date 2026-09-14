/* 灵验APP · 滚动计数工具
 * 提供：
 *   LYCounter.bump(key, base, n)        —— 读取并累加 n，返回新值（持久化到 localStorage）
 *   LYCounter.daily(key, base, perDay)  —— 每日自动累加（自上次打开起，每过一天 +perDay）
 *   LYCounter.read(key, base)           —— 读取当前值
 *   LYCounter.Rolling(el)               —— 滚动数字动画对象（每位 0-9 竖排 strip + translateY 过渡）
 * 所有计数以 localStorage 持久化，键前缀 lingyan.，无外部依赖，离线可用。
 */
(function () {
  'use strict';

  var PREFIX = 'lingyan.';

  function store() {
    try { return window.localStorage; } catch (e) { return null; }
  }

  function read(key, base) {
    var s = store();
    var v = null;
    if (s) { try { v = s.getItem(PREFIX + key); } catch (e) { v = null; } }
    if (v === null || v === undefined) return base;
    var n = parseInt(v, 10);
    return isNaN(n) ? base : n;
  }

  function write(key, val) {
    var s = store();
    if (s) { try { s.setItem(PREFIX + key, String(val)); } catch (e) {} }
  }

  // 读取并 +n，写回，返回新值
  function bump(key, base, n) {
    n = (typeof n === 'number' && n) ? n : 1;
    var v = read(key, base) + n;
    write(key, v);
    return v;
  }

  function ymd(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }

  function dayDiff(a, b) {
    var pa = String(a).split('-'), pb = String(b).split('-');
    var da = new Date(+pa[0], +pa[1] - 1, +pa[2]);
    var db = new Date(+pb[0], +pb[1] - 1, +pb[2]);
    return Math.round((db - da) / 86400000);
  }

  // 每日自动累加：自上次记录日期起，每过一整天 +perDay（跨多天则累加多份）
  function daily(key, base, perDay) {
    var s = store();
    var last = null;
    if (s) { try { last = s.getItem(PREFIX + key + '.lastDay'); } catch (e) {} }
    var today = new Date();
    var tk = ymd(today);
    if (last && last !== tk) {
      var days = dayDiff(last, tk);
      if (days > 0) {
        var v = read(key, base) + perDay * days;
        write(key, v);
      }
    }
    if (s) { try { s.setItem(PREFIX + key + '.lastDay', tk); } catch (e) {} }
    return read(key, base);
  }

  // ===== 滚动数字 =====
  function Rolling(el) {
    this.el = el;
    this.value = -1;
    this.cols = [];
  }

  Rolling.prototype.set = function (num, animate) {
    num = Math.max(0, Math.floor(num || 0));
    var str = String(num);
    if (this.value < 0 || String(this.value).length !== str.length) {
      this._rebuild(str);
    }
    for (var i = 0; i < str.length; i++) {
      var d = +str[i];
      var col = this.cols[i];
      col.strip.style.transition = animate ? 'transform .9s cubic-bezier(.2,.85,.25,1)' : 'none';
      col.strip.style.transform = 'translateY(' + (-d * 10) + '%)';
    }
    this.value = num;
  };

  Rolling.prototype._rebuild = function (str) {
    this.el.innerHTML = '';
    this.cols = [];
    for (var i = 0; i < str.length; i++) {
      var col = document.createElement('span');
      col.className = 'roll-col';
      var strip = document.createElement('span');
      strip.className = 'roll-strip';
      for (var k = 0; k < 10; k++) {
        var s = document.createElement('span');
        s.textContent = k;
        strip.appendChild(s);
      }
      col.appendChild(strip);
      this.el.appendChild(col);
      this.cols.push({ col: col, strip: strip });
    }
  };

  window.LYCounter = {
    bump: bump,
    daily: daily,
    read: read,
    write: write,
    Rolling: Rolling
  };
})();
