/* 模块2：周易摇卦（铜钱：乾隆通宝） */
(function () {
  'use strict';

  // 八卦：三爻（自下而上，即 index0=初爻/最下，index1=中爻，index2=上爻/最上），1=阳(实) 0=阴(断)
  // 口诀（自下而上读）：
  //   乾三连  ☰ 实实实      [1,1,1]
  //   兑上缺  ☱ 实实断(顶断) [1,1,0]
  //   离中虚  ☲ 实断实(中断) [1,0,1]
  //   震仰盂  ☳ 实断断(底实、顶两断) [1,0,0]
  //   巽下断  ☴ 断实实(底断、顶两实) [0,1,1]
  //   坎中满  ☵ 断实断(中实)   [0,1,0]
  //   艮覆碗  ☶ 断断实(顶实、底两断) [0,0,1]
  //   坤六断  ☷ 断断断      [0,0,0]
  var TRIGRAMS = {
    '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
    '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0]
  };
  function trigramName(lines3) {
    var keys = Object.keys(TRIGRAMS);
    for (var i = 0; i < keys.length; i++) {
      var t = TRIGRAMS[keys[i]];
      if (t[0] === lines3[0] && t[1] === lines3[1] && t[2] === lines3[2]) return keys[i];
    }
    return '?';
  }

  // 八卦图 SVG（先天八卦方位 / 伏羲八卦）
  // 口诀：天地定位（乾上坤下）· 山泽通气（艮右下兑左上）· 雷风相薄（震左下巽右上）· 水火不相射（离左坎右）
  // 顺时针 8 方位 i=0..7：顶(南)乾 → 右上(西南)巽 → 右(西)坎 → 右下(西北)艮 → 底(北)坤 → 左下(东北)震 → 左(东)离 → 左上(东南)兑
  // 字标与卦象共用同一 order，严格锁死（修正原"字对图错"——只要 order 对就一致）。
  // 卦辞摘自《周易》传统注释，括号为万物类象。
  var BAGUA_QIANCI = {
    '乾': '乾为天，刚健中正',
    '兑': '兑为泽，喜悦和悦',
    '离': '离为火，光明附着',
    '震': '震为雷，奋起警醒',
    '巽': '巽为风，谦逊柔顺',
    '坎': '坎为水，险陷重智',
    '艮': '艮为山，止止笃实',
    '坤': '坤为地，柔顺包容'
  };
  function baguaSVG() {
    var W = 320, C = W / 2, R = 118; // 八边形顶点到中心
    var order = ['乾', '巽', '坎', '艮', '坤', '震', '离', '兑'];
    var s = '<svg viewBox="0 0 ' + W + ' ' + W + '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;display:block">';
    // 白底
    s += '<rect x="0" y="0" width="' + W + '" height="' + W + '" fill="#ffffff"/>';
    // 红色八边形外框（按 -90° 起 + 45° 步进的 8 顶点）
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var ang = (-90 + i * 45) * Math.PI / 180;
      pts.push((C + Math.cos(ang) * R).toFixed(2) + ',' + (C + Math.sin(ang) * R).toFixed(2));
    }
    s += '<polygon points="' + pts.join(' ') + '" fill="#ffffff" stroke="#c8161d" stroke-width="6" stroke-linejoin="miter"/>';
    // 内圈细线（淡灰）
    s += '<polygon points="' + pts.join(' ') + '" fill="none" stroke="#e8d4d4" stroke-width="1" transform="scale(' + (R - 8) / R + ')" transform-origin="' + C + ' ' + C + '"/>';
    // 八边方向文字+卦象
    var lineR = R * 0.62; // 卦象中心距八边形中心
    var nameR = R * 0.82; // 字标位置
    for (var j = 0; j < 8; j++) {
      var a = (-90 + j * 45) * Math.PI / 180;
      var cxL = C + Math.cos(a) * lineR, cyL = C + Math.sin(a) * lineR;
      var cxN = C + Math.cos(a) * nameR, cyN = C + Math.sin(a) * nameR;
      s += trigramGroup(cxL, cyL, a, TRIGRAMS[order[j]], order[j]);
      s += '<text x="' + cxN.toFixed(1) + '" y="' + cyN.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" '
         + 'font-family="KaiTi,STKaiti,serif" font-weight="bold" font-size="22" fill="#1a1a1a">' + order[j] + '</text>';
    }
    // 外圈卦辞小字（围绕八边形四角）
    var ciR = R * 1.16;
    for (var k = 0; k < 8; k++) {
      var ak = (-90 + k * 45 + 22.5) * Math.PI / 180; // 插在两个卦之间的外圈
      var cxC = C + Math.cos(ak) * ciR, cyC = C + Math.sin(ak) * ciR;
      s += '<text x="' + cxC.toFixed(1) + '" y="' + cyC.toFixed(1) + '" text-anchor="middle" dominant-baseline="central" '
         + 'font-family="KaiTi,STKaiti,serif" font-size="10" fill="#5a4040">' + BAGUA_QIANCI[order[k]] + '</text>';
    }
    // 中央太极图
    s += taiji(C, C, 32);
    s += '</svg>';
    return s;
  }
  // 单卦渲染：卦象（三爻）垂直对齐（始终横线水平） + 字标大字（黑）紧邻
  function trigramGroup(cx, cy, angleRad, lines3, name) {
    var lineW = 30, lineH = 5, gap = 7;
    var yStart = cy - (lineH * 3 + gap * 2) / 2;
    var s = '<g>';
    for (var i = 0; i < 3; i++) {
      var v = lines3[2 - i]; // index0=底爻 → 自上而下排时取 2-i
      var y = yStart + i * (lineH + gap);
      if (v === 1) {
        s += '<rect x="' + (cx - lineW / 2) + '" y="' + y + '" width="' + lineW + '" height="' + lineH + '" rx="1" fill="#c8161d"/>';
      } else {
        var segW = (lineW - 4) / 2;
        s += '<rect x="' + (cx - lineW / 2) + '" y="' + y + '" width="' + segW + '" height="' + lineH + '" rx="1" fill="#c8161d"/>';
        s += '<rect x="' + (cx + 2) + '" y="' + y + '" width="' + segW + '" height="' + lineH + '" rx="1" fill="#c8161d"/>';
      }
    }
    s += '</g>';
    return s;
  }
  // 太极阴阳鱼：标准「头尾相交」互锁式
  // 黑鱼头在下(下半小圆)、尾绕右侧上行收尖于顶；白鱼头在上、尾绕左侧下行。
  // 两条鱼以 S 形曲线分界，互相含抱(各含一鱼眼)，绝非上下镜像。
  function taiji(cx, cy, r) {
    var s = '<g>';
    // 外圈白底 + 描边，保证在任意背景下完整可见
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r + 1) + '" fill="#ffffff" stroke="#3a2a1a" stroke-width="1"/>';
    // 阴(黑)鱼整片：右大半圆 + 下方鱼头(下半小圆右半) - 上方缺口(上半小圆左半)
    s += '<path d="M' + cx + ' ' + (cy - r) +
      ' A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) +
      ' A' + (r / 2) + ' ' + (r / 2) + ' 0 0 1 ' + cx + ' ' + cy +
      ' A' + (r / 2) + ' ' + (r / 2) + ' 0 0 0 ' + cx + ' ' + (cy - r) + ' Z" fill="#1f1f1f"/>';
    // 阳(白)鱼头眼中的鱼眼：黑鱼(位居白区·上方)→ 黑点；白鱼(位居黑区·下方)→ 白点
    s += '<circle cx="' + cx + '" cy="' + (cy - r / 2) + '" r="' + (r / 5) + '" fill="#1f1f1f"/>';
    s += '<circle cx="' + cx + '" cy="' + (cy + r / 2) + '" r="' + (r / 5) + '" fill="#ffffff"/>';
    s += '</g>';
    return s;
  }
  function trigramBox(cx, cy, lines3, name) {
    var w = 22, h = 18, gap = 5;
    var x0 = cx - w / 2, y0 = cy - (h + 2 * gap) / 2;
    var s = '<g>';
    for (var i = 0; i < 3; i++) {
      // 数组 index0=底爻、index2=顶爻；第 i 行从顶部往下排，故取 lines3[2-i]
      var v = lines3[2 - i];
      var y = y0 + i * gap;
      if (v === 1) {
        s += '<rect x="' + x0 + '" y="' + y + '" width="' + w + '" height="3" rx="1" fill="#9e1b1b"/>';
      } else {
        s += '<rect x="' + x0 + '" y="' + y + '" width="' + (w / 2 - 2) + '" height="3" rx="1" fill="#9e1b1b"/>';
        s += '<rect x="' + (x0 + w / 2 + 2) + '" y="' + y + '" width="' + (w / 2 - 2) + '" height="3" rx="1" fill="#9e1b1b"/>';
      }
    }
    s += '<text x="' + cx + '" y="' + (y0 + h + 11) + '" text-anchor="middle" font-size="9" fill="#9e1b1b" font-family="KaiTi,serif">' + name + '</text>';
    s += '</g>';
    return s;
  }

  // 乾隆通宝铜钱：BASE64 内嵌 SVG（由 assets/js/coin-images.js 提供 window.COIN_IMG={zi,bei,idle}）
  function coinImg(face) {
    var key = (face === '背') ? 'bei' : 'zi';
    return '<img class="coin-svg" src="' + (window.COIN_IMG ? window.COIN_IMG[key] : '') + '" alt="' + (face === '背' ? '背面' : '字面') + '" />';
  }

  // 状态
  var yaoLines = [];
  var castCount = 0;
  var coinEls = Array.prototype.slice.call(document.querySelectorAll('.coin'));
  var btnCast = document.getElementById('btn-cast');
  var castCountEl = document.getElementById('cast-count');
  var castInfo = document.getElementById('cast-info');
  var drawArea = document.getElementById('hex-draw');
  var resultEl = document.getElementById('hex-result');
  var btnReset = document.getElementById('btn-hex-reset');

  function setCoin(el, face) {
    el.classList.add('flip');
    setTimeout(function () {
      el.innerHTML = coinImg(face) +
        '<span class="ctext">' + (face === '背' ? '背面' : '字面') + '</span>';
      el.classList.toggle('bei', face === '背');
      el.classList.remove('flip');
    }, 250);
  }

  function cast() {
    if (castCount >= 6) return;
    var faces = [];
    var yang = 0;
    coinEls.forEach(function (el) {
      var isZi = Math.random() < 0.5;
      faces.push(isZi);
      if (isZi) yang++;
      setCoin(el, isZi ? '字' : '背');
    });
    var val, changing = false, type;
    if (yang === 3) { val = 1; changing = true; type = '老阳(○)'; }
    else if (yang === 2) { val = 1; type = '少阳(—)'; }
    else if (yang === 1) { val = 0; type = '少阴(--)' }
    else { val = 0; changing = true; type = '老阴(×)'; }

    setTimeout(function () {
      yaoLines.push({ val: val, changing: changing, type: type });
      drawLineEl(val, changing);
      castCount++;
      castCountEl.textContent = Math.min(castCount + 1, 6);
      castInfo.textContent = '第 ' + castCount + ' 爻：' + type + '（已得 ' + castCount + '/6 爻）';
      if (castCount >= 6) {
        btnCast.disabled = true;
        btnCast.textContent = '六爻已成';
        setTimeout(showResult, 400);
      }
    }, 300);
  }

  function drawLineEl(val, changing) {
    var d = document.createElement('div');
    d.className = 'hex-line' + (val === 0 ? ' yin' : '');
    if (val === 1) {
      d.innerHTML = '<div style="width:76px;height:8px;background:#3a2a1a;border-radius:2px;"></div>';
    } else {
      d.innerHTML = '<div style="width:34px;height:8px;background:#3a2a1a;border-radius:2px;"></div>' +
        '<div style="width:34px;height:8px;background:#3a2a1a;border-radius:2px;"></div>';
    }
    if (changing) {
      var dot = document.createElement('div');
      dot.style.cssText = 'position:absolute;right:-14px;top:1px;width:9px;height:9px;border-radius:50%;background:#c0392b;';
      d.style.position = 'relative';
      d.appendChild(dot);
    }
    drawArea.appendChild(d);
  }

  function showResult() {
    var lower = [yaoLines[0].val, yaoLines[1].val, yaoLines[2].val];
    var upper = [yaoLines[3].val, yaoLines[4].val, yaoLines[5].val];
    var lowerName = trigramName(lower), upperName = trigramName(upper);
    var hex = null;
    for (var i = 0; i < HEXAGRAM_DATA.length; i++) {
      if (HEXAGRAM_DATA[i].lower === lowerName && HEXAGRAM_DATA[i].upper === upperName) { hex = HEXAGRAM_DATA[i]; break; }
    }
    resultEl.hidden = false;
    if (!hex) {
      document.getElementById('hr-name').textContent = '未知卦';
      document.getElementById('hr-code').textContent = '下卦' + lowerName + ' 上卦' + upperName;
      document.getElementById('hr-guaci').innerHTML = '<span class="gr-label">【卦辞】</span>未在库中匹配到对应卦象。';
      document.getElementById('hr-yao').innerHTML = '';
      document.getElementById('hr-baihua').textContent = '';
      return;
    }
    document.getElementById('hr-name').textContent = hex.name;
    document.getElementById('hr-code').textContent = '下卦' + lowerName + ' · 上卦' + upperName + ' · 第' + hex.index + '卦';
    document.getElementById('hr-guaci').innerHTML = '<span class="gr-label">【卦辞】</span>' + hex.guaCi;
    var yaoHtml = '';
    (hex.yao || []).forEach(function (y) {
      yaoHtml += '<div><span class="y">' + y.yao + '</span>' + y.text + '</div>';
    });
    document.getElementById('hr-yao').innerHTML = yaoHtml;
    document.getElementById('hr-baihua').textContent = '【释义】' + (hex.baihua || '');
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    btnReset.hidden = false;
  }

  function reset() {
    yaoLines = []; castCount = 0;
    castCountEl.textContent = '1';
    castInfo.textContent = '已得 0 爻';
    drawArea.innerHTML = '';
    resultEl.hidden = true;
    btnReset.hidden = true;
    btnCast.disabled = false;
    btnCast.innerHTML = '掷铜钱（第 <span id="cast-count">1</span>/6 爻）';
    castCountEl = document.getElementById('cast-count');
    coinEls.forEach(function (el) {
      el.innerHTML = coinImg('idle') + '<span class="ctext">待摇</span>';
      el.classList.remove('bei');
    });
  }

  btnCast.addEventListener('click', cast);
  btnReset.addEventListener('click', reset);

  window.HexagramModule = {
    onEnter: function () {
      document.getElementById('hex-bagua').innerHTML = baguaSVG();
      reset();
    }
  };
})();
