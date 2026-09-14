/* 模块1：观音抽签 + 作者专属（签诗库导出/修改） */
(function () {
  'use strict';

  // ★ 作者密码：普通使用者无法导出/修改签诗，只有输入正确密码才能进入管理。
  //   默认密码 YOURSMAKE2026（与项目签名品牌一致）；如需修改，改这一行即可。
  //   注意：安卓 WebView 不支持 window.prompt/alert，故用页面内密码框代替。
  var AUTHOR_PASSWORD = 'YOURSMAKE2026';
  var OVERRIDE_KEY = 'lingyan_guanyin_overrides';
  var authorUnlocked = false;

  var figEl = document.getElementById('guanyin-figure');
  var sticksEl = document.getElementById('tube-sticks');
  var resultEl = document.getElementById('guanyin-result');
  var btnDraw = document.getElementById('btn-draw');
  var btnReset = document.getElementById('btn-guanyin-reset');
  var tubeBody = document.querySelector('.guanyin-tube');

  // ---------- 数据合并（基础库 + 本机修改） ----------
  function getOverrides() {
    try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function getMergedData() {
    var ov = getOverrides();
    return GUANYIN_DATA.map(function (d) {
      var o = ov[d.num];
      return o ? Object.assign({}, d, o) : d;
    });
  }
  function getPoem(num) {
    var all = getMergedData();
    for (var i = 0; i < all.length; i++) if (all[i].num === num) return all[i];
    return null;
  }

  // ---------- 观音画像（BASE64 内嵌，无外部文件依赖） ----------
  function renderFigure() {
    var src = window.GUANYIN_IMG || '';
    figEl.innerHTML = '<img class="guanyin-img" src="' + src + '" alt="观音菩萨画像" />';
    // 模糊背景也使用同一张 BASE64 图，避免引用外部文件
    var stage = figEl.closest('.guanyin-stage');
    if (stage && window.GUANYIN_IMG) stage.style.setProperty('--guanyin-bg', 'url(' + window.GUANYIN_IMG + ')');
  }

  function renderSticks() {
    // 减少签枝数：32 → 12（更醒目、避免"密集恐签"）
    var html = '';
    for (var i = 0; i < 12; i++) html += '<div class="tube-stick"></div>';
    sticksEl.innerHTML = html;
  }

  // 内联 SVG 签筒（红漆竹筒+金边+签嘴+露出签枝）
  // 比旧版更精致、对比度更高，确保在 WebView 中必定可见
  // 内联 SVG 签筒：恢复 V3.0 简洁清晰的红漆竹筒 + 金边（用户确认旧版清晰可见），
  // 仅于筒口露出少量(5 支)竹签，避免“签筒外竹签过多”。
  function renderTube() {
    var canvas = document.getElementById('tube-canvas');
    if (!canvas) return;
    // 签枝画在筒内、筒口露头顶。层次（关键）：
    //   筒身后壁(整筒) → 筒口深色洞 → 签(画在洞之上，从洞里探出) → 前壁(盖住签中下段) → 金边
    // 这样签明显"插在筒里"，且 9 根都有较长一段露在筒口外。
    var stickW = 3.4;
    var xStart = 21, xEnd = 75;
    var n = 9; // 排 9 根，与参考图一致
    var step = (xEnd - xStart) / (n - 1);
    // 签顶端 y（越小越高，露出越多）；错落自然
    var tops = [12, 7, 16, 9, 18, 11, 14, 8, 13];
    var sticks = '';
    for (var i = 0; i < n; i++) {
      var x = (xStart + step * i).toFixed(2);
      var top = tops[i];
      // 签体从顶端画到筒底 y=120，中下段被前壁盖住 → 视觉上插进筒里
      sticks += '<rect x="' + x + '" y="' + top + '" width="' + stickW + '" height="' + (120 - top) + '" rx="1.2" fill="url(#stickGrad)" stroke="#a9802a" stroke-width="0.4"/>';
    }
    var svg =
      '<svg viewBox="0 0 96 150" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">' +
      '<defs>' +
      '<linearGradient id="tubeGrad" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#9e1b1b"/><stop offset="0.5" stop-color="#e0533f"/><stop offset="1" stop-color="#9e1b1b"/>' +
      '</linearGradient>' +
      '<linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#caa23e"/><stop offset="0.5" stop-color="#f4d98a"/><stop offset="1" stop-color="#caa23e"/>' +
      '</linearGradient>' +
      '<linearGradient id="stickGrad" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#d9c08a"/><stop offset="0.5" stop-color="#f6e8b8"/><stop offset="1" stop-color="#d9c08a"/>' +
      '</linearGradient>' +
      '<radialGradient id="holeGrad" cx="0.5" cy="0.4" r="0.6">' +
      '<stop offset="0" stop-color="#1a0404"/><stop offset="0.7" stop-color="#3a0a0a"/><stop offset="1" stop-color="#5a0d0d"/>' +
      '</radialGradient>' +
      '</defs>' +
      // 1) 筒身后壁（整筒，作为签的背景）
      '<path d="M14 22 L14 132 Q14 144 26 144 L70 144 Q82 144 82 132 L82 22 Z" fill="url(#tubeGrad)" stroke="#7c1414" stroke-width="1.5"/>' +
      // 2) 筒口深色洞（在筒口处，签从洞里探出）
      '<ellipse cx="48" cy="30" rx="32" ry="8" fill="url(#holeGrad)"/>' +
      // 3) 签（画在洞之上）
      sticks +
      // 4) 筒身前壁（仅遮住签中下段 y≥38 → 签插进筒里）
      '<path d="M14 38 L14 132 Q14 144 26 144 L70 144 Q82 144 82 132 L82 38 Z" fill="url(#tubeGrad)" stroke="none"/>' +
      // 高光
      '<rect x="20" y="42" width="5" height="92" rx="2.5" fill="rgba(255,255,255,0.18)"/>' +
      // 金色横纹
      '<rect x="14" y="60" width="68" height="11" fill="url(#goldGrad)"/>' +
      '<rect x="14" y="110" width="68" height="11" fill="url(#goldGrad)"/>' +
      // 中央金菱形装饰
      '<path d="M48 84 L56 94 L48 104 L40 94 Z" fill="url(#goldGrad)" stroke="#8a6a1e" stroke-width="0.8"/>' +
      // 5) 筒口金边（最上层）
      '<ellipse cx="48" cy="30" rx="34" ry="9" fill="none" stroke="#caa23e" stroke-width="1.4"/>' +
      '</svg>';
    canvas.innerHTML = svg;
  }

  function draw() {
    var num = Math.floor(Math.random() * 100) + 1;
    var data = getPoem(num);
    if (!data) return;
    var old = tubeBody.querySelector('.popped-stick');
    if (old) old.remove();
    var stick = document.createElement('div');
    stick.className = 'popped-stick';
    // 竹签上直接显示抽中的签号（与签诗编号一致，例如 66）
    stick.innerHTML = '<span class="stick-num">' + num + '</span>';
    tubeBody.appendChild(stick);

    btnDraw.disabled = true;
    setTimeout(function () {
      showResult(data);
      btnDraw.disabled = false;
      btnDraw.hidden = true;
      btnReset.hidden = false;
    }, 620);
  }

  function showResult(d) {
    resultEl.hidden = false;
    document.getElementById('gr-num').textContent = '第 ' + d.num + ' 签';
    document.getElementById('gr-level').textContent = d.level;
    document.getElementById('gr-palace').textContent = d.palace || '';
    document.getElementById('gr-title').textContent = d.title ? '〔' + d.title + '〕' : '';
    document.getElementById('gr-poem').innerHTML = (d.poem || []).map(function (p) { return '<div>' + p + '</div>'; }).join('');
    document.getElementById('gr-yixiang').textContent = d.yixiang || '';
    document.getElementById('gr-jieyue').textContent = d.jieyue || '';
    document.getElementById('gr-allusion').textContent = d.allusion || '';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function reset() {
    resultEl.hidden = true;
    var old = tubeBody.querySelector('.popped-stick');
    if (old) old.remove();
    btnDraw.hidden = false;
    btnReset.hidden = true;
  }

  // ---------- 作者管理：密码 / 导出 / 修改 ----------
  var btnAuthor = document.getElementById('btn-author');
  var panel = document.getElementById('author-panel');
  var loginBox = document.getElementById('author-login');
  var pwdInput = document.getElementById('author-pwd');
  var loginMsg = document.getElementById('author-login-msg');
  var btnLogin = document.getElementById('btn-author-login');
  var btnCancel = document.getElementById('btn-author-cancel');
  var selNum = document.getElementById('edit-num');
  var msgEl = document.getElementById('edit-msg');

  function download(content, filename, mime) {
    var blob = new Blob([content], { type: mime || 'text/plain' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // 页面内密码登录（替代 window.prompt，兼容安卓 WebView）
  function openLogin() {
    loginBox.hidden = false;
    loginMsg.textContent = '';
    pwdInput.value = '';
    setTimeout(function () { try { pwdInput.focus(); } catch (e) {} }, 50);
  }
  function closeLogin() { loginBox.hidden = true; }
  function tryLogin() {
    if (pwdInput.value === AUTHOR_PASSWORD) {
      authorUnlocked = true;
      closeLogin();
      panel.hidden = false;
      initEditor();
      msgEl.textContent = '已解锁作者管理。导出会下载当前（含本机修改）的签诗库。';
      msgEl.className = 'ap-msg ok';
    } else {
      loginMsg.textContent = '密码错误，无法进入管理。';
      pwdInput.value = '';
      try { pwdInput.focus(); } catch (e) {}
    }
  }

  btnAuthor.addEventListener('click', function () {
    if (authorUnlocked) { panel.hidden = !panel.hidden; return; }
    openLogin();
  });
  btnLogin.addEventListener('click', tryLogin);
  btnCancel.addEventListener('click', closeLogin);
  pwdInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });

  function initEditor() {
    if (selNum.options.length) return; // 只初始化一次
    var html = '';
    for (var i = 1; i <= 100; i++) html += '<option value="' + i + '">第 ' + i + ' 签</option>';
    selNum.innerHTML = html;
    loadEdit(parseInt(selNum.value, 10));
  }

  function loadEdit(num) {
    var d = getPoem(num);
    if (!d) return;
    document.getElementById('edit-level').value = d.level || '';
    document.getElementById('edit-palace').value = d.palace || '';
    document.getElementById('edit-title').value = d.title || '';
    document.getElementById('edit-poem').value = (d.poem || []).join('\n');
    document.getElementById('edit-yixiang').value = d.yixiang || '';
    document.getElementById('edit-jieyue').value = d.jieyue || '';
    document.getElementById('edit-allusion').value = d.allusion || '';
  }

  selNum.addEventListener('change', function () { loadEdit(parseInt(selNum.value, 10)); });

  document.getElementById('btn-export-js').addEventListener('click', function () {
    var data = getMergedData();
    var js = 'const GUANYIN_DATA = ' + JSON.stringify(data, null, 2) + ';\n';
    download(js, 'data-guanyin.js', 'text/javascript');
    msgEl.textContent = '已导出 data-guanyin.js（' + data.length + ' 签）。';
    msgEl.className = 'ap-msg ok';
  });
  document.getElementById('btn-export-json').addEventListener('click', function () {
    var data = getMergedData();
    download(JSON.stringify(data, null, 2), 'guanyin-data.json', 'application/json');
    msgEl.textContent = '已导出 guanyin-data.json（' + data.length + ' 签）。';
    msgEl.className = 'ap-msg ok';
  });

  document.getElementById('btn-save-edit').addEventListener('click', function () {
    var num = parseInt(selNum.value, 10);
    var poem = document.getElementById('edit-poem').value.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s.length; });
    var ov = getOverrides();
    ov[num] = {
      num: num,
      level: document.getElementById('edit-level').value.trim(),
      palace: document.getElementById('edit-palace').value.trim(),
      title: document.getElementById('edit-title').value.trim(),
      poem: poem,
      yixiang: document.getElementById('edit-yixiang').value.trim(),
      jieyue: document.getElementById('edit-jieyue').value.trim(),
      allusion: document.getElementById('edit-allusion').value.trim()
    };
    try { localStorage.setItem(OVERRIDE_KEY, JSON.stringify(ov)); } catch (e) {}
    msgEl.textContent = '第 ' + num + ' 签修改已保存到本机，重新求签即生效。';
    msgEl.className = 'ap-msg ok';
  });

  document.getElementById('btn-reset-edit').addEventListener('click', function () {
    try { localStorage.removeItem(OVERRIDE_KEY); } catch (e) {}
    loadEdit(parseInt(selNum.value, 10));
    msgEl.textContent = '已重置全部修改（恢复原始程序数据）。';
    msgEl.className = 'ap-msg ok';
  });

  btnDraw.addEventListener('click', draw);
  btnReset.addEventListener('click', reset);

  window.GuanyinModule = {
    onEnter: function () {
      renderFigure();
      renderTube();
      renderSticks();
      reset();
    }
  };
})();
