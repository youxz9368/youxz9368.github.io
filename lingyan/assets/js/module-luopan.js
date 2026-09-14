/* 模块：罗盘（实物图 / 综合19圈 / 三合彩色三针 / 三元 / 玄空）
 * 结构：
 *   外盘(方形底座) + 内盘（实物图作为静态层、综合/三合/三元/玄空作为可旋转内盘）
 *   + 红色十字基线（盖在所有盘面上，过中心）
 *   + 中心小磁针（实物模式下更小更精致，受限于照片中金色金属框范围内）
 * 五种盘面均加"十字红色细线"作基线（过中心点、长度=盘面）。
 * 综合19圈按"每3-4圈"成识别色环带；外圈 360° 密刻度（每1°小线、每5°银色、每10°红长+度数）。
 * 三合罗盘采用"地盘正针/红 + 人盘中针/绿 + 天盘缝针/蓝"三色标注（参考图2）。
 * 本模块为电子罗盘模拟，纯属传统文化娱乐参考，请相信科学、不迷信。
 */
(function () {
  'use strict';

  var CX = 160, CY = 160;
  var RED = '#c0392b', INK = '#3a2a1a', GOLD = '#b5892f', GOLD2 = '#c9a227', GREY = '#8a6a2a';
  var CROSS = '#e02b2b';
  var C_WATER = '#2f6fb0', C_WOOD = '#2e8b57', C_FIRE = '#c0392b', C_GOLD = '#b5892f', C_EARTH = '#8a6a2a';

  // 二十四山（子起正北顺时针）
  var SHAN24 = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
                '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
  var BAGUA_HOU = { '坎': 0, '艮': 45, '震': 90, '巽': 135, '离': 180, '坤': 225, '兑': 270, '乾': 315 };
  var BAGUA_XIAN = { '乾': 180, '坤': 0, '离': 90, '坎': 270, '震': 45, '兑': 225, '巽': 315, '艮': 135 };

  function pt(r, deg) {
    var a = deg * Math.PI / 180;
    return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
  }
  function esc(s) {
    return String(s).replace(/[&<>]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c];
    });
  }
  function baguaItems(map, color) {
    return Object.keys(map).map(function (k) { return { t: k, deg: map[k], c: color || RED }; });
  }

  // ---------- 综合罗盘：19 圈数据 ----------
  var R2_XIAN = baguaItems(BAGUA_XIAN, GOLD);
  var R3_LUOSHU = [
    { t: '一', deg: 0, c: GOLD }, { t: '八', deg: 45, c: GOLD },
    { t: '三', deg: 90, c: GOLD }, { t: '四', deg: 135, c: GOLD },
    { t: '九', deg: 180, c: GOLD }, { t: '二', deg: 225, c: GOLD },
    { t: '七', deg: 270, c: GOLD }, { t: '六', deg: 315, c: GOLD }
  ];
  var R4_FANFU = [
    { t: '甲癸', deg: 45, c: RED }, { t: '乙丙', deg: 135, c: RED },
    { t: '庚丁', deg: 225, c: RED }, { t: '辛壬', deg: 315, c: RED }
  ];
  var R5_JXS = [
    { t: '贪狼', deg: 0, c: C_WATER }, { t: '左辅', deg: 45, c: GREY },
    { t: '禄存', deg: 90, c: C_WOOD }, { t: '文曲', deg: 135, c: C_WOOD },
    { t: '右弼', deg: 180, c: C_FIRE }, { t: '巨门', deg: 225, c: '#3a3a3a' },
    { t: '破军', deg: 270, c: C_GOLD }, { t: '武曲', deg: 315, c: '#7a7a7a' }
  ];
  var R6_TIANXING = ['角', '亢', '氐', '房', '心', '尾', '箕', '斗', '牛', '女', '虚', '危',
                     '室', '壁', '奎', '娄', '胃', '昴', '毕', '觜', '参', '井', '鬼', '柳']
                     .map(function (n, i) { return { t: n, deg: i * 15, c: INK }; });
  var R7_SHAN24 = SHAN24.map(function (n, i) {
    var c = (n === '子' || n === '午' || n === '卯' || n === '酉') ? RED
          : (n === '乾' || n === '坤' || n === '艮' || n === '巽') ? GOLD : INK;
    return { t: n, deg: i * 15, c: c };
  });
  var R8_JIEQI = ['立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
                  '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪', '冬至', '小寒', '大寒']
                  .map(function (n, i) { return { t: n, deg: 45 + i * 15, c: INK }; });
  function gen72Long() {
    var arr = [];
    var labels = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
                  '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
    for (var i = 0; i < 72; i++) {
      var idx = Math.floor(i / 3) % 24;
      var sub = i % 3;
      var t = (sub === 0) ? labels[idx] : (sub === 1 ? '+' : '-');
      arr.push({ t: t, deg: i * 5, c: INK });
    }
    return arr;
  }
  var R9_72LONG = gen72Long();
  function gen120() {
    var arr = [];
    var labels = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
                  '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
    for (var i = 0; i < 120; i++) {
      var show = (i % 5 === 0);
      arr.push({ t: show ? labels[Math.floor(i / 5)] : '', deg: i * 3, c: show ? GREY : null });
    }
    return arr;
  }
  var R10_FENJIN = gen120();
  var R11_ZHONG = SHAN24.map(function (n, i) {
    var c = (n === '子' || n === '午' || n === '卯' || n === '酉') ? '#7a2a1a'
          : (n === '乾' || n === '坤' || n === '艮' || n === '巽') ? '#8a7a2a' : '#5a4a3a';
    return { t: n, deg: i * 15 - 7.5, c: c };
  });
  function gen60() {
    var arr = [];
    var labels = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    for (var i = 0; i < 60; i++) {
      var idx = Math.floor(i / 5) % 12;
      var sub = i % 5;
      var t = (sub === 0) ? labels[idx] : (sub === 1 ? '+' : sub === 2 ? '+' : sub === 3 ? '-' : '-');
      arr.push({ t: t, deg: i * 6, c: INK });
    }
    return arr;
  }
  var R12_TOUDI = gen60();
  var R13_QIMEN = [
    { t: '戊', deg: 0, c: GREY }, { t: '己', deg: 225, c: GREY },
    { t: '庚', deg: 90, c: GREY }, { t: '辛', deg: 135, c: GREY },
    { t: '壬', deg: 45, c: GREY }, { t: '癸', deg: 315, c: GREY },
    { t: '丁', deg: 270, c: RED }, { t: '丙', deg: 225, c: RED },
    { t: '乙', deg: 180, c: RED }
  ];
  var R14_FENG = SHAN24.map(function (n, i) {
    var c = (n === '子' || n === '午' || n === '卯' || n === '酉') ? '#1a3a7a'
          : (n === '乾' || n === '坤' || n === '艮' || n === '巽') ? '#5a6a8a' : '#3a4a5a';
    return { t: n, deg: i * 15 + 15, c: c };
  });
  function gen120feng() {
    var arr = [];
    var labels = ['子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳', '丙',
                  '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥', '壬'];
    for (var i = 0; i < 120; i++) {
      var show = (i % 5 === 0);
      arr.push({ t: show ? labels[Math.floor(i / 5)] : '', deg: i * 3 + 15, c: show ? '#5a6a8a' : null });
    }
    return arr;
  }
  var R15_FENGFENJIN = gen120feng();
  function gen60y() {
    var arr = [];
    var labels = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    for (var i = 0; i < 60; i++) {
      var idx = Math.floor(i / 5) % 12;
      var sub = i % 5;
      var t = (sub === 0) ? labels[idx] : (sub === 1 ? '+' : sub === 2 ? '+' : sub === 3 ? '-' : '-');
      arr.push({ t: t, deg: i * 6 + 3, c: INK });
    }
    return arr;
  }
  var R16_YINGSUO = gen60y();
  var R17_SUXING = [
    { t: '角', deg: 0, c: C_WOOD }, { t: '亢', deg: 12, c: C_WOOD },
    { t: '氐', deg: 25, c: C_WOOD }, { t: '房', deg: 37, c: C_WOOD },
    { t: '心', deg: 50, c: C_WOOD }, { t: '尾', deg: 62, c: C_WOOD },
    { t: '箕', deg: 80, c: C_WOOD },
    { t: '斗', deg: 100, c: C_WATER }, { t: '牛', deg: 125, c: C_WATER },
    { t: '女', deg: 135, c: C_WATER }, { t: '虚', deg: 145, c: C_WATER },
    { t: '危', deg: 155, c: C_WATER }, { t: '室', deg: 170, c: C_WATER },
    { t: '壁', deg: 185, c: C_WATER },
    { t: '奎', deg: 200, c: C_GOLD }, { t: '娄', deg: 215, c: C_GOLD },
    { t: '胃', deg: 225, c: C_GOLD }, { t: '昴', deg: 240, c: C_GOLD },
    { t: '毕', deg: 252, c: C_GOLD }, { t: '觜', deg: 270, c: C_GOLD },
    { t: '参', deg: 272, c: C_GOLD },
    { t: '井', deg: 285, c: C_FIRE }, { t: '鬼', deg: 315, c: C_FIRE },
    { t: '柳', deg: 317, c: C_FIRE }, { t: '星', deg: 330, c: C_FIRE },
    { t: '张', deg: 335, c: C_FIRE }, { t: '翼', deg: 350, c: C_FIRE },
    { t: '轸', deg: 10, c: C_FIRE }
  ];
  var R19_ZHOUTIAN = [
    { t: '角', deg: 0, du: '12' }, { t: '亢', deg: 12, du: '10' },
    { t: '氐', deg: 22, du: '10' }, { t: '房', deg: 32, du: '8' },
    { t: '心', deg: 40, du: '6' }, { t: '尾', deg: 46, du: '19' },
    { t: '箕', deg: 65, du: '11' },
    { t: '斗', deg: 76, du: '26' }, { t: '牛', deg: 102, du: '7' },
    { t: '女', deg: 109, du: '11' }, { t: '虚', deg: 120, du: '10' },
    { t: '危', deg: 130, du: '18' }, { t: '室', deg: 148, du: '17' },
    { t: '壁', deg: 165, du: '11' },
    { t: '奎', deg: 176, du: '16' }, { t: '娄', deg: 192, du: '12' },
    { t: '胃', deg: 204, du: '16' }, { t: '昴', deg: 220, du: '12' },
    { t: '毕', deg: 232, du: '17' }, { t: '觜', deg: 249, du: '2' },
    { t: '参', deg: 251, du: '12' },
    { t: '井', deg: 263, du: '30' }, { t: '鬼', deg: 293, du: '2' },
    { t: '柳', deg: 295, du: '15' }, { t: '星', deg: 310, du: '7' },
    { t: '张', deg: 317, du: '18' }, { t: '翼', deg: 335, du: '19' },
    { t: '轸', deg: 354, du: '18' }
  ];

  var ZH_RINGS = [
    { r: 46, items: R2_XIAN, size: 7, label: '圈2 先天八卦' },
    { r: 52, items: R3_LUOSHU, size: 6, label: '圈3 洛书方位' },
    { r: 58, items: R4_FANFU, size: 6, label: '圈4 反伏黄泉' },
    { r: 64, items: R5_JXS, size: 5.5, label: '圈5 坐山九星' },
    { r: 70, items: R6_TIANXING, size: 5.5, label: '圈6 天星' },
    { r: 78, items: R7_SHAN24, size: 9, label: '圈7 正针二十四山', bold: true },
    { r: 86, items: R8_JIEQI, size: 5, label: '圈8 二十四节气' },
    { r: 92, items: R9_72LONG, size: 4.5, label: '圈9 穿山七十二龙' },
    { r: 98, items: R10_FENJIN, size: 4, label: '圈10 正针一百二十分金' },
    { r: 105, items: R11_ZHONG, size: 6, label: '圈11 中针二十四山' },
    { r: 111, items: R12_TOUDI, size: 4.5, label: '圈12 透地六十龙' },
    { r: 117, items: R13_QIMEN, size: 5.5, label: '圈13 透地奇门' },
    { r: 124, items: R14_FENG, size: 6, label: '圈14 缝针二十四山' },
    { r: 130, items: R15_FENGFENJIN, size: 4, label: '圈15 缝针一百二十分金' },
    { r: 136, items: R16_YINGSUO, size: 4.5, label: '圈16 盈缩六十龙' },
    { r: 142, items: R17_SUXING, size: 5, label: '圈17 宿度五行' },
    { r: 148, items: R19_ZHOUTIAN, size: 5, label: '圈19 周天宿度' }
  ];

  // ---------- 三合罗盘 ----------
  var R_SANHE = {
    inner: [
      { r: 52, items: baguaItems(BAGUA_XIAN, GOLD), size: 7, label: '先天八卦' },
      { r: 60, items: (function () {
          var names = ['长生', '沐浴', '冠带', '临官', '帝旺', '衰', '病', '死', '墓', '绝', '胎', '养'];
          return names.map(function (n, i) { return { t: n, deg: i * 30, c: INK }; });
        })(), size: 6, label: '十二长生' }
    ],
    red: SHAN24.map(function (n, i) {
      var c = (n === '子' || n === '午' || n === '卯' || n === '酉') ? '#9e1b1b'
            : (n === '乾' || n === '坤' || n === '艮' || n === '巽') ? '#7a1a1a' : RED;
      return { t: n, deg: i * 15, c: c };
    }),
    green: SHAN24.map(function (n, i) {
      var c = (n === '子' || n === '午' || n === '卯' || n === '酉') ? '#1a7a3a'
            : (n === '乾' || n === '坤' || n === '艮' || n === '巽') ? '#0a5a2a' : '#2e8b57';
      return { t: n, deg: i * 15 + 7.5, c: c };
    }),
    blue: SHAN24.map(function (n, i) {
      var c = (n === '子' || n === '午' || n === '卯' || n === '酉') ? '#1a3a9e'
            : (n === '乾' || n === '坤' || n === '艮' || n === '巽') ? '#0a2a7a' : '#2f6fb0';
      return { t: n, deg: i * 15 + 15, c: c };
    })
  };

  var R_SANYUAN = {
    outer: (function () {
      var names = ['一白', '二黑', '三碧', '四绿', '五黄', '六白', '七赤', '八白', '九紫'];
      var col = { '一白': '#3a3a3a', '二黑': '#3a3a3a', '三碧': C_WOOD, '四绿': C_WOOD,
                  '五黄': C_FIRE, '六白': '#7a7a7a', '七赤': C_GOLD, '八白': '#7a7a7a', '九紫': '#9e1b1b' };
      return names.map(function (n, i) { return { t: n, deg: i * 40, c: col[n] }; });
    })(),
    inner: baguaItems(BAGUA_HOU, RED)
  };

  var R_XUANKONG = {
    outer: (function () {
      var names = ['一', '二', '三', '四', '五', '六', '七', '八', '九'];
      return names.map(function (n, i) { return { t: n, deg: i * 40, c: INK }; });
    })(),
    inner: (function () {
      var names = ['贪狼', '巨门', '禄存', '文曲', '廉贞', '武曲', '破军', '左辅', '右弼'];
      return names.map(function (n, i) { return { t: n, deg: i * 40, c: RED }; });
    })()
  };

  // ---------- 通用工具 ----------
  function ringBand(r1, r2, color, opacity) {
    opacity = opacity == null ? 0.5 : opacity;
    return '<path fill="' + color + '" fill-rule="evenodd" opacity="' + opacity + '" ' +
      'd="M ' + CX + ' ' + (CY - r2) +
      ' A ' + r2 + ' ' + r2 + ' 0 1 1 ' + CX + ' ' + (CY + r2) +
      ' A ' + r2 + ' ' + r2 + ' 0 1 1 ' + CX + ' ' + (CY - r2) +
      ' Z M ' + CX + ' ' + (CY - r1) +
      ' A ' + r1 + ' ' + r1 + ' 0 1 0 ' + CX + ' ' + (CY + r1) +
      ' A ' + r1 + ' ' + r1 + ' 0 1 0 ' + CX + ' ' + (CY - r1) +
      ' Z"/>';
  }

  function denseTicks360(opts) {
    opts = opts || {};
    var rOut = opts.rOut || 151;
    var rMain = opts.rMain || 145;
    var rMid = opts.rMid || 148;
    var rMin = opts.rMin || 150;
    var numR = opts.numR || 137;
    var showEvery = opts.showEvery || 30;
    var showNums = opts.showNums != false;
    var s = '';
    for (var d = 0; d < 360; d++) {
      if (d % 5 === 0) continue;
      var p1 = pt(rOut, d), p2 = pt(rMin, d);
      s += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) +
           '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
           '" stroke="#7a6a5a" stroke-width="0.35"/>';
    }
    for (var d5 = 0; d5 < 360; d5 += 5) {
      if (d5 % 10 === 0) continue;
      var p1 = pt(rOut, d5), p2 = pt(rMid, d5);
      s += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) +
           '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
           '" stroke="#a8a8a8" stroke-width="0.7"/>';
    }
    for (var d10 = 0; d10 < 360; d10 += 10) {
      var p1 = pt(rOut, d10), p2 = pt(rMain, d10);
      s += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) +
           '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
           '" stroke="' + RED + '" stroke-width="1.2"/>';
    }
    if (showNums) {
      for (var dn = 0; dn < 360; dn += showEvery) {
        var p = pt(numR, dn);
        var fs = (dn % 90 === 0) ? 6.5 : 5;
        s += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + fs * 0.34).toFixed(1) +
             '" font-size="' + fs + '" font-weight="' + (dn % 90 === 0 ? 'bold' : 'normal') +
             '" fill="' + INK + '" text-anchor="middle" font-family="serif">' + dn + '</text>';
      }
    }
    return s;
  }

  function redCross() {
    return '<g id="lp-red-cross" pointer-events="none">' +
      '<line x1="' + CX + '" y1="11" x2="' + CX + '" y2="309" stroke="' + CROSS + '" stroke-width="1.6" opacity="0.9"/>' +
      '<line x1="11" y1="' + CY + '" x2="309" y2="' + CY + '" stroke="' + CROSS + '" stroke-width="1.6" opacity="0.9"/>' +
      '<circle cx="' + CX + '" cy="' + CY + '" r="4" fill="none" stroke="' + CROSS + '" stroke-width="1"/>' +
      '</g>';
  }

  function ringLines(r1, r2, color, width) {
    var s = '';
    if (r1) s += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r1 + '" fill="none" stroke="' + (color || GOLD) + '" stroke-width="' + (width || 0.6) + '"/>';
    if (r2) s += '<circle cx="' + CX + '" cy="' + CY + '" r="' + r2 + '" fill="none" stroke="' + (color || GOLD) + '" stroke-width="' + (width || 0.6) + '"/>';
    return s;
  }
  function labels(r, arr, size, weight) {
    var s = '';
    arr.forEach(function (it) {
      if (!it.t) return;
      var p = pt(r, it.deg);
      s += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + size * 0.34).toFixed(1) +
           '" font-size="' + size + '" font-weight="' + (weight || 'normal') +
           '" fill="' + it.c + '" text-anchor="middle" font-family="KaiTi,STKaiti,serif" ' +
           'text-rendering="geometricPrecision" letter-spacing="0.3">' + esc(it.t) + '</text>';
    });
    return s;
  }

  // ---------- 综合罗盘：19 圈 + 4 段识别色环带 + 360° 密刻度 ----------
  function dialZonghe() {
    var s = '';
    var bands = [
      { r1: 43, r2: 67, c: '#f5e8b6' },
      { r1: 69, r2: 95, c: '#dbeede' },
      { r1: 96, r2: 120, c: '#dde3f3' },
      { r1: 122, r2: 145, c: '#f3d8d8' }
    ];
    s += '<g id="lp-zh-bands">';
    bands.forEach(function (b) { s += ringBand(b.r1, b.r2, b.c, 0.5); });
    s += '</g>';
    s += '<g id="lp-zh-ticks">' + denseTicks360({ rOut: 151, rMain: 145, rMid: 148, rMin: 150, numR: 138, showEvery: 30 }) + '</g>';
    s += '<g id="lp-zh-rings">';
    for (var i = 0; i < ZH_RINGS.length; i++) {
      s += ringLines(ZH_RINGS[i].r + 2.5, null, GOLD, 0.4);
    }
    s += '</g>';
    s += '<g id="lp-zh-labels">';
    ZH_RINGS.forEach(function (rg) {
      s += labels(rg.r, rg.items, rg.size, rg.bold ? 'bold' : 'normal');
    });
    s += '</g>';
    var wx5 = [C_GOLD, C_WOOD, C_WATER, C_FIRE, C_EARTH];
    var wxSeg = '';
    for (var d = 0; d < 360; d += 6) {
      var c = wx5[Math.floor(d / 6) % 5];
      var rad = 146;
      var a1 = (d - 90) * Math.PI / 180, a2 = (d + 6 - 90) * Math.PI / 180;
      var x1 = CX + rad * Math.cos(a1), y1 = CY + rad * Math.sin(a1);
      var x2 = CX + rad * Math.cos(a2), y2 = CY + rad * Math.sin(a2);
      var x3 = CX + (rad - 2) * Math.cos(a2), y3 = CY + (rad - 2) * Math.sin(a2);
      var x4 = CX + (rad - 2) * Math.cos(a1), y4 = CY + (rad - 2) * Math.sin(a1);
      wxSeg += '<path d="M' + x1.toFixed(1) + ',' + y1.toFixed(1) +
               ' A' + rad + ',' + rad + ' 0 0 1 ' + x2.toFixed(1) + ',' + y2.toFixed(1) +
               ' L' + x3.toFixed(1) + ',' + y3.toFixed(1) +
               ' A' + (rad - 2) + ',' + (rad - 2) + ' 0 0 0 ' + x4.toFixed(1) + ',' + y4.toFixed(1) +
               ' Z" fill="' + c + '" opacity="0.45"/>';
    }
    s += '<g id="lp-wuxing-seg">' + wxSeg + '</g>';
    return s;
  }

  function dialSanhe() {
    var s = '';
    s += '<g id="lp-outtick">' + denseTicks360({ rOut: 151, rMain: 145, rMid: 148, rMin: 150, numR: 138, showEvery: 30 }) + '</g>';
    s += ringLines(54, null, GOLD, 0.6);
    s += labels(46, R_SANHE.inner[0].items, 7, 'normal');
    s += ringLines(64, null, GOLD, 0.6);
    s += labels(60, R_SANHE.inner[1].items, 6, 'normal');
    s += ringLines(70, null, GOLD, 0.6);
    s += labels(78, R_SANHE.red, 7, 'bold');
    s += labels(86, R_SANHE.green, 7, 'bold');
    s += labels(94, R_SANHE.blue, 7, 'bold');
    s += ringLines(102, null, GOLD, 0.6);
    s += labels(112, [
      { t: '红', deg: 0, c: RED }, { t: '绿', deg: 90, c: C_WOOD },
      { t: '蓝', deg: 180, c: '#2f6fb0' }
    ], 7, 'bold');
    s += labels(112, [
      { t: '正', deg: 30, c: INK }, { t: '中', deg: 120, c: INK },
      { t: '缝', deg: 210, c: INK }
    ], 6, 'normal');
    s += labels(112, [
      { t: '针', deg: 60, c: INK }, { t: '针', deg: 150, c: INK },
      { t: '针', deg: 240, c: INK }
    ], 6, 'normal');
    s += ringLines(122, null, GOLD, 0.6);
    s += labels(132, [
      { t: '地盘', deg: 0, c: RED }, { t: '人盘', deg: 7.5, c: C_WOOD },
      { t: '天盘', deg: 15, c: '#2f6fb0' },
      { t: '正针', deg: 30, c: INK }, { t: '中针', deg: 37.5, c: INK },
      { t: '缝针', deg: 45, c: INK }
    ], 6, 'normal');
    return s;
  }

  function dialSanyuan() {
    var s = '';
    s += '<g id="lp-outtick">' + denseTicks360({ rOut: 151, rMain: 145, rMid: 148, rMin: 150, numR: 138, showEvery: 30 }) + '</g>';
    s += ringLines(104, null, GOLD, 0.6);
    s += labels(96, R_SANYUAN.outer, 9, 'bold');
    s += ringLines(80, null, GOLD, 0.6);
    s += labels(70, R_SANYUAN.inner, 8, 'bold');
    return s;
  }

  function dialXuankong() {
    var s = '';
    s += '<g id="lp-outtick">' + denseTicks360({ rOut: 151, rMain: 145, rMid: 148, rMin: 150, numR: 138, showEvery: 30 }) + '</g>';
    s += ringLines(104, null, GOLD, 0.6);
    s += labels(96, R_XUANKONG.outer, 10, 'bold');
    s += ringLines(80, null, GOLD, 0.6);
    s += labels(70, R_XUANKONG.inner, 8, 'bold');
    return s;
  }

  // ---------- 实物罗盘：圆形裁切的照片（金属环 + 粉色十字线 + NESW 标记全部由图片自带） ----------
  // 照片比例：r=775（贴满 1600×1600），玻璃罩 r≈68（0.0877×r），金属圈 r≈125（0.161×r）
  // SVG 中 disk clipPath r=150 ⇒ 玻璃罩 ≈ 13.1px、金属圈 ≈ 24.1px。中心磁针限 r<10。
  function dialReal() {
    var b64 = (typeof window !== 'undefined' && window.LUOPAN_REAL_IMG) ? window.LUOPAN_REAL_IMG : '';
    if (!b64) return '<text x="' + CX + '" y="' + CY + '" text-anchor="middle" fill="#c0392b">实物图未加载</text>';
    var side = 285, off = (320 - side) / 2; // 17.5 居中；盘面缩小到 ~90%，留出与正方形外框间距
    return '<image href="' + b64 + '" x="' + off + '" y="' + off + '" width="' + side + '" height="' + side + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#lp-real-clip)"/>' +
           '<circle cx="160" cy="160" r="135" fill="none" stroke="' + GOLD + '" stroke-width="1.5" opacity="0.85"/>';
  }

  // ---------- 中心标记：实物模式 / 标准模式 ----------
  // 实物模式：磁针必须 ≤ 中央玻璃罩 r≈13，故整体限 r<10（之前 ±16 超出太多）
  function realMarker() {
    var cx = 157.5, cy = 159.2; // V3.1.10 照片十字线中心（实测西偏7px/北偏2px）
    var hy = 21, hw = 5.4;      // 3× 放大（原 ±7 / ±1.8）
    return '<g id="lp-needle" transform="rotate(0 ' + cx + ' ' + cy + ')">' +
      '<polygon points="' + cx + ',' + (cy - hy) + ' ' + (cx - hw) + ',' + cy + ' ' + (cx + hw) + ',' + cy + '" fill="#c8102e" stroke="#7a1a0a" stroke-width="0.5"/>' +
      '<polygon points="' + cx + ',' + (cy + hy) + ' ' + (cx - hw) + ',' + cy + ' ' + (cx + hw) + ',' + cy + '" fill="#2a2a2a" stroke="#000" stroke-width="0.5"/>' +
      '<line x1="' + cx + '" y1="' + (cy - hy + 1) + '" x2="' + cx + '" y2="' + (cy + hy - 1) + '" stroke="#b5892f" stroke-width="0.6" opacity="0.6"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="#d6b365" stroke="#7a5a1a" stroke-width="0.6"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="2.5" fill="#fff8ea"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="1" fill="#c8102e"/>' +
      '</g>';
    // 注：NESW 大字由图片外圈自带，中心不再叠加，避免和图片字冲突
  }
  function standardMarker() {
    var tianchi =
      '<circle cx="160" cy="160" r="42" fill="url(#lp-tianchi)" stroke="' + GOLD + '" stroke-width="2"/>' +
      '<circle cx="160" cy="160" r="33" fill="none" stroke="' + RED + '" stroke-width="0.8" opacity="0.7"/>';
    var ticks = '<g id="lp-tianchi-ticks" pointer-events="none">';
    for (var d = 0; d < 360; d += 5) {
      var isLong = (d % 30 === 0), isMid = (d % 10 === 0);
      var rOut = 33, rIn = isLong ? 28 : (isMid ? 30 : 31.5);
      var p1 = pt(rOut, d), p2 = pt(rIn, d);
      var sw = isLong ? 1.0 : (isMid ? 0.6 : 0.35);
      var col = isLong ? RED : GOLD;
      ticks += '<line x1="' + p1[0].toFixed(1) + '" y1="' + p1[1].toFixed(1) +
               '" x2="' + p2[0].toFixed(1) + '" y2="' + p2[1].toFixed(1) +
               '" stroke="' + col + '" stroke-width="' + sw + '"/>';
    }
    [['北', 0], ['东', 90], ['南', 180], ['西', 270]].forEach(function (m) {
      var p = pt(24, m[1]);
      ticks += '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 3.5 * 0.34).toFixed(1) +
               '" font-size="3.6" fill="' + RED + '" text-anchor="middle" font-family="KaiTi,serif" text-rendering="geometricPrecision">' + m[0] + '</text>';
    });
    ticks += '</g>';
    var needle =
      '<g id="lp-needle" transform="rotate(0 160 160)">' +
        '<polygon points="160,128 156,160 164,160" fill="url(#lp-needle-n)" stroke="#7a1a0a" stroke-width="0.3"/>' +
        '<polygon points="160,192 156,160 164,160" fill="url(#lp-needle-s)" stroke="#000" stroke-width="0.3"/>' +
        '<line x1="160" y1="135" x2="160" y2="185" stroke="' + GOLD + '" stroke-width="0.4" opacity="0.6"/>' +
        '<circle cx="160" cy="160" r="5" fill="' + GOLD + '" stroke="#7a5a1a" stroke-width="0.6"/>' +
        '<circle cx="160" cy="160" r="2.5" fill="#fff8ea"/>' +
        '<circle cx="160" cy="160" r="1" fill="' + RED + '"/>' +
      '</g>';
    return tianchi + ticks + needle;
  }

  // ---------- 骨架：chrome + 三个分组（#lp-static, #lp-dial, #lp-marker）+ 红十字 ----------
  function skeleton() {
    return '' +
      '<svg class="lp-svg" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<radialGradient id="lp-face" cx="50%" cy="50%" r="55%">' +
            '<stop offset="0%" stop-color="#fbf2da"/>' +
            '<stop offset="55%" stop-color="#f3e3bd"/>' +
            '<stop offset="100%" stop-color="#d8c088"/>' +
          '</radialGradient>' +
          '<radialGradient id="lp-tianchi" cx="50%" cy="50%" r="55%">' +
            '<stop offset="0%" stop-color="#fffdf3"/>' +
            '<stop offset="80%" stop-color="#f7e8c2"/>' +
            '<stop offset="100%" stop-color="#d8c088"/>' +
          '</radialGradient>' +
          '<linearGradient id="lp-needle-n" x1="50%" y1="0%" x2="50%" y2="100%">' +
            '<stop offset="0%" stop-color="#e64a3a"/>' +
            '<stop offset="100%" stop-color="#9c2419"/>' +
          '</linearGradient>' +
          '<linearGradient id="lp-needle-s" x1="50%" y1="0%" x2="50%" y2="100%">' +
            '<stop offset="0%" stop-color="#3a3a3a"/>' +
            '<stop offset="100%" stop-color="#0a0a0a"/>' +
          '</linearGradient>' +
          // 实物图圆形裁切（盘面缩小到 ~90%：clip r=135，留出与正方形外框间距）
          '<clipPath id="lp-real-clip"><circle cx="160" cy="160" r="135"/></clipPath>' +
        '</defs>' +
        '<rect x="10" y="10" width="300" height="300" rx="16" fill="#f3e3bd" stroke="' + GOLD + '" stroke-width="4"/>' +
        '<rect x="18" y="18" width="284" height="284" rx="12" fill="none" stroke="' + GOLD2 + '" stroke-width="1.5"/>' +
        '<circle cx="32" cy="32" r="3.2" fill="' + GOLD + '" stroke="#7a5a1a" stroke-width="0.6"/>' +
        '<circle cx="288" cy="32" r="3.2" fill="' + GOLD + '" stroke="#7a5a1a" stroke-width="0.6"/>' +
        '<circle cx="32" cy="288" r="3.2" fill="' + GOLD + '" stroke="#7a5a1a" stroke-width="0.6"/>' +
        '<circle cx="288" cy="288" r="3.2" fill="' + GOLD + '" stroke="#7a5a1a" stroke-width="0.6"/>' +
        '<circle cx="160" cy="10" r="2.2" fill="#7a5a1a"/>' +
        '<circle cx="160" cy="310" r="2.2" fill="#7a5a1a"/>' +
        '<circle cx="10" cy="160" r="2.2" fill="#7a5a1a"/>' +
        '<circle cx="310" cy="160" r="2.2" fill="#7a5a1a"/>' +
        '<line x1="160" y1="12" x2="160" y2="308" stroke="' + GOLD + '" stroke-width="0.8" opacity="0.45"/>' +
        '<line x1="12" y1="160" x2="308" y2="160" stroke="' + GOLD + '" stroke-width="0.8" opacity="0.45"/>' +
        '<circle cx="160" cy="160" r="149" fill="url(#lp-face)"/>' +
        '<circle cx="160" cy="160" r="150" fill="none" stroke="' + GOLD + '" stroke-width="1.2"/>' +
        '<circle cx="160" cy="160" r="146" fill="none" stroke="' + GOLD + '" stroke-width="0.5"/>' +
        // 静态层：实物图（不旋转，覆盖于 face 之上）
        '<g id="lp-static"></g>' +
        // 可旋转内盘：综合/三合/三元/玄空
        '<g id="lp-dial" transform="rotate(0 160 160)"></g>' +
        // 红色十字基线（盖在所有盘面上）
        redCross() +
        // 中心标记层：实物=精致小指针；其他=标准天池+大指针
        '<g id="lp-marker"></g>' +
      '</svg>';
  }

  // ---------- 交互状态 ----------
  var needleDeg = 0, rot = 0, sensorOn = false, sensorHandler = null;
  var typeKey = 'real';
  var svgEl = null, staticEl = null, dialEl = null, markerEl = null, needleEl = null,
      readoutEl = null, headingEl = null, sensorBtn = null;

  function setRot(v) {
    rot = ((v % 360) + 360) % 360;
    if (dialEl) dialEl.setAttribute('transform', 'rotate(' + rot.toFixed(1) + ' 160 160)');
    // 实物罗盘：旋转的是照片底图（#lp-static 内的 image），磁针保持指向不变
    if (typeKey === 'real' && staticEl) staticEl.setAttribute('transform', 'rotate(' + rot.toFixed(1) + ' 160 160)');
    updateReadout();
  }
  function setNeedle(v) {
    needleDeg = ((v % 360) + 360) % 360;
    // 实物模式下磁针中心在照片十字线 (157.5,159.2)，旋转须绕该点，否则会偏心抖动
    var ncx = (typeKey === 'real') ? 157.5 : 160, ncy = (typeKey === 'real') ? 159.2 : 160;
    if (needleEl) needleEl.setAttribute('transform', 'rotate(' + needleDeg.toFixed(1) + ' ' + ncx + ' ' + ncy + ')');
    if (headingEl) headingEl.value = Math.round(needleDeg);
    updateReadout();
  }
  function updateReadout() {
    if (!readoutEl) return;
    var idx = Math.round((((needleDeg - rot) % 360) + 360) % 360 / 15) % 24;
    var sit = SHAN24[idx], face = SHAN24[(idx + 12) % 24];
    readoutEl.textContent = '坐 ' + sit + ' 　向 ' + face + '　｜　指针方位 ' + Math.round(needleDeg) + '°　｜　内盘 ' + Math.round(rot) + '°';
  }

  function fillDial() {
    if (!staticEl || !dialEl) return;
    // 实物模式下隐藏我画的十字基线（图片自带粉色十字线，会和我的重叠）
    var crossEl = svgEl ? svgEl.querySelector('#lp-red-cross') : null;
    if (crossEl) crossEl.style.display = (typeKey === 'real') ? 'none' : 'inline';
    if (typeKey === 'real') {
      staticEl.innerHTML = dialReal();
      dialEl.innerHTML = '';
    } else {
      staticEl.innerHTML = '';
      staticEl.setAttribute('transform', '');
      var inner = '';
      if (typeKey === 'zonghe') inner = dialZonghe();
      else if (typeKey === 'sanhe') inner = dialSanhe();
      else if (typeKey === 'sanyuan') inner = dialSanyuan();
      else if (typeKey === 'xuankong') inner = dialXuankong();
      dialEl.innerHTML = inner;
    }
    fillMarker();
  }
  function fillMarker() {
    if (!markerEl) return;
    markerEl.innerHTML = (typeKey === 'real') ? realMarker() : standardMarker();
    needleEl = svgEl.querySelector('#lp-needle');
  }

  function enableSensor() {
    function handler(e) {
      var h = (typeof e.webkitCompassHeading === 'number') ? e.webkitCompassHeading
              : (360 - (e.alpha || 0));
      setNeedle(Math.round(h));
    }
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().then(function (state) {
        if (state === 'granted') {
          window.addEventListener('deviceorientation', handler);
          sensorHandler = handler; sensorOn = true;
          if (sensorBtn) sensorBtn.textContent = '🧭 关闭方向传感器';
        } else {
          if (sensorBtn) sensorBtn.textContent = '⚠️ 传感器未授权';
        }
      }).catch(function () { if (sensorBtn) sensorBtn.textContent = '⚠️ 传感器不可用'; });
    } else {
      window.addEventListener('deviceorientation', handler);
      sensorHandler = handler; sensorOn = true;
      if (sensorBtn) sensorBtn.textContent = '🧭 关闭方向传感器';
    }
  }
  function disableSensor() {
    if (sensorHandler) window.removeEventListener('deviceorientation', sensorHandler);
    sensorHandler = null; sensorOn = false;
    if (sensorBtn) sensorBtn.textContent = '🧭 开启方向传感器';
  }

  var SUB_TEXT = {
    real: '实物罗盘 · 照片底图 + 自绘精致磁针（金色框内）',
    zonghe: '综合罗盘 · 传统19圈 · 入门总览',
    sanhe: '三合罗盘 · 红正针·绿中针·蓝缝针',
    sanyuan: '三元罗盘 · 三元九运·父母卦',
    xuankong: '玄空罗盘 · 飞星·洛书九宫'
  };

  function buildUI(root) {
    root.innerHTML =
      '<div class="lp-compass" id="lp-compass">' + skeleton() + '</div>' +
      '<div class="lp-types" id="lp-types">' +
        '<button class="lp-type active" data-t="real">实物罗盘</button>' +
        '<button class="lp-type" data-t="zonghe">综合罗盘</button>' +
        '<button class="lp-type" data-t="sanhe">三合罗盘</button>' +
        '<button class="lp-type" data-t="sanyuan">三元罗盘</button>' +
        '<button class="lp-type" data-t="xuankong">玄空罗盘</button>' +
      '</div>' +
      '<div class="lp-sub" id="lp-sub"></div>' +
      '<div class="lp-readout" id="lp-readout">坐 — 　向 —</div>' +
      '<div class="lp-controls">' +
        '<button id="lp-sensor" class="btn-ghost">🧭 开启方向传感器</button>' +
        '<label>指针方位 <input type="range" id="lp-heading" min="0" max="359" value="0"></label>' +
        '<button id="lp-reset" class="btn-ghost">内盘归零</button>' +
      '</div>' +
      '<p class="hint">外盘为方形底座，内盘为刻度圈层（可拖动旋转），天池指南针指针随方位变化；五种盘面均加十字红色基线（过圆心、长=盘面）便于方位对位。' +
      '本罗盘为电子模拟，纯属传统文化娱乐参考，请相信科学、不迷信。</p>';

    svgEl = root.querySelector('#lp-compass svg');
    staticEl = svgEl.querySelector('#lp-static');
    dialEl = svgEl.querySelector('#lp-dial');
    markerEl = svgEl.querySelector('#lp-marker');
    readoutEl = root.querySelector('#lp-readout');
    headingEl = root.querySelector('#lp-heading');
    sensorBtn = root.querySelector('#lp-sensor');
    var subEl = root.querySelector('#lp-sub');

    root.querySelectorAll('.lp-type').forEach(function (b) {
      b.addEventListener('click', function () {
        root.querySelectorAll('.lp-type').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        typeKey = b.getAttribute('data-t');
        fillDial();
        subEl.textContent = SUB_TEXT[typeKey];
      });
    });
    subEl.textContent = SUB_TEXT[typeKey];

    var dragging = false, startAng = 0, startRot = 0;
    function angleOf(e) {
      var rect = svgEl.getBoundingClientRect();
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
      return Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180 / Math.PI;
    }
    svgEl.addEventListener('pointerdown', function (e) {
      dragging = true; svgEl.setPointerCapture(e.pointerId);
      startAng = angleOf(e); startRot = rot;
    });
    svgEl.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      setRot(startRot + (angleOf(e) - startAng));
    });
    function endDrag() { dragging = false; }
    svgEl.addEventListener('pointerup', endDrag);
    svgEl.addEventListener('pointercancel', endDrag);

    headingEl.addEventListener('input', function () { setNeedle(+headingEl.value); });
    root.querySelector('#lp-reset').addEventListener('click', function () { setRot(0); });
    sensorBtn.addEventListener('click', function () {
      if (sensorOn) disableSensor(); else enableSensor();
    });

    fillDial();
    setRot(0);
    setNeedle(0);
  }

  window.LuopanModule = {
    onEnter: function () {
      var root = document.getElementById('lp-wrap');
      if (!root) return;
      buildUI(root);
    },
    onLeave: function () { disableSensor(); }
  };
})();
