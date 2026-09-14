/* 模块6：紫薇斗数排盘 —— 依据传统安星诀推算
   流程：四柱八字 → 定命宫/身宫 → 纳音起五行局 → 布十四主星(紫微系逆时针/天府系对宫顺时针) → 年干飞四化。
   纯属传统术数文化参考与娱乐，请相信科学、不迷信。 */
(function () {
  'use strict';

  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];          // 天干 0-9
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']; // 地支 0-11（寅=2）
  var GAN_WX = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  var WX_ORDER = ['木', '火', '土', '金', '水'];

  // 六十甲子纳音五行（甲子=0 … 癸亥=59，每两位同五行）
  var NAYIN = [
    '金', '金', '火', '火', '木', '木', '土', '土', '金', '金',
    '火', '火', '水', '水', '土', '土', '金', '金', '木', '木',
    '水', '水', '土', '土', '火', '火', '木', '木', '水', '水',
    '金', '金', '火', '火', '木', '木', '土', '土', '金', '金',
    '木', '木', '水', '水', '火', '火', '土', '土', '金', '金',
    '水', '水', '土', '土', '火', '火', '木', '木', '水', '水'
  ];
  // 纳音五行 → 五行局（水二局/木三局/金四局/土五局/火六局）
  var JU = { '金': 4, '木': 3, '水': 2, '火': 6, '土': 5 };

  // 十二宫（自命宫起，逆布）
  var PALACES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '事业', '田宅', '福德', '父母'];

  // 年干四化（化禄·化权·化科·化忌）
  var SIHUA = {
    '甲': ['廉贞', '破军', '武曲', '太阳'],
    '乙': ['天机', '天梁', '紫微', '太阴'],
    '丙': ['天同', '天机', '文昌', '廉贞'],
    '丁': ['太阴', '天同', '天机', '巨门'],
    '戊': ['贪狼', '太阴', '右弼', '天机'],
    '己': ['武曲', '贪狼', '天梁', '文曲'],
    '庚': ['太阳', '武曲', '太阴', '天同'],
    '辛': ['巨门', '太阳', '文曲', '文昌'],
    '壬': ['天梁', '紫微', '左辅', '武曲'],
    '癸': ['破军', '巨门', '太阴', '贪狼']
  };

  function ganzhiIndex(gi, zi) { for (var n = 0; n < 60; n++) if (n % 10 === gi && n % 12 === zi) return n; return 0; }
  // 地支 → 时辰序号（子=1…亥=12）
  function zhiHourNum(zi) { return zi + 1; }
  // 月支 → 月序（寅正，寅=1…丑=12）
  function zhiMonthNum(zi) { return ((zi - 2 + 12) % 12) + 1; }
  // 公历小时 → 时辰地支序号 0(子)…11(亥)
  function hourBranchIdx(h) { var t = (h + 1) % 24; return Math.floor(t / 2); }

  function wxTag(w) { return w; }

  // 排盘主函数
  function calcZiwei() {
    var name = (nameEl.value || '').trim();
    var sex = sexEl.value || '男';
    var birthVal = birthEl.value;
    if (!birthVal) { alert('请先选择出生时间'); return; }
    var dt = new Date(birthVal);
    if (isNaN(dt.getTime())) { alert('出生时间格式不正确'); return; }

    var y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate(), hh = dt.getHours(), mi = dt.getMinutes();
    var lunar = null, pillars = null;
    if (typeof Solar !== 'undefined') {
      try { lunar = Solar.fromYmdHms(y, m, d, hh, mi, 0).getLunar(); } catch (e) { lunar = null; }
    }
    if (lunar) {
      pillars = [lunar.getYearInGanZhi(), lunar.getMonthInGanZhi(), lunar.getDayInGanZhi(), lunar.getTimeInGanZhi()];
    }

    var html = '';
    if (!pillars) {
      resultEl.innerHTML = '<div class="pp-block"><p class="pp-note">农历库未加载，无法推算紫薇盘。</p></div>';
      resultEl.hidden = false; return;
    }

    var yearGan = pillars[0].charAt(0);
    var yearGanIdx = GAN.indexOf(yearGan);
    // 月支/时支（以节气月、时柱地支为准，与四柱一致）
    var monthZhiIdx = ZHI.indexOf(pillars[1].charAt(1));
    var hourZhiIdx = ZHI.indexOf(pillars[3].charAt(1));
    var monthNum = zhiMonthNum(monthZhiIdx);   // 寅=1
    var hourNum = zhiHourNum(hourZhiIdx);       // 子=1
    var day = lunar.getDay();                    // 农历生日

    // —— 定命宫：寅宫(2)起正月，顺数到生月，逆数到生时 ——
    var lifeP = (2 + monthNum - hourNum) % 12; if (lifeP < 0) lifeP += 12;
    var bodyP = (lifeP + (hourNum - 1)) % 12;   // 身宫

    // —— 命宫天干（五虎遁：年干推寅宫天干，顺数至命宫） ——
    var wuhu = { '甲': '丙', '乙': '戊', '丙': '庚', '丁': '壬', '戊': '甲', '己': '丙', '庚': '戊', '辛': '庚', '壬': '壬', '癸': '甲' }[yearGan];
    var lifeGanIdx = (GAN.indexOf(wuhu) + (lifeP - 2)) % 10; if (lifeGanIdx < 0) lifeGanIdx += 10;
    var lifeGan = GAN[lifeGanIdx];
    // 命宫纳音 → 五行局
    var mingNayin = NAYIN[ganzhiIndex(lifeGanIdx, lifeP)];
    var ju = JU[mingNayin];
    var juName = mingNayin + ju + '局';

    // —— 紫微星宫位：局数定寅首，顺（阳男阴女）/逆（阴男阳女）数至生日 ——
    var yang = (yearGanIdx % 2 === 0);
    var forward = (yang && sex === '男') || (!yang && sex === '女');
    var k = Math.ceil(day / ju);
    var ziweiP = forward ? (2 + (k - 1)) % 12 : (2 - (k - 1) + 120) % 12;

    // —— 布十四主星 ——
    // 紫微系（逆时针）：紫微、天机、太阳、武曲、天同、廉贞
    var starPos = {}; // 星名 → 宫位序号(0-11, 地支序)
    starPos['紫微'] = ziweiP;
    starPos['天机'] = (ziweiP - 1 + 12) % 12;
    starPos['太阳'] = (ziweiP - 2 + 12) % 12;
    starPos['武曲'] = (ziweiP - 3 + 12) % 12;
    starPos['天同'] = (ziweiP - 4 + 12) % 12;
    starPos['廉贞'] = (ziweiP - 5 + 12) % 12;
    // 天府系（天府在紫微对宫，顺时针布）：天府、太阴、贪狼、巨门、天相、天梁；七杀同宫天府，破军同宫太阴
    starPos['天府'] = (ziweiP + 6) % 12;
    starPos['七杀'] = (ziweiP + 6) % 12;
    starPos['太阴'] = (ziweiP + 1) % 12;
    starPos['破军'] = (ziweiP + 1) % 12;
    starPos['贪狼'] = (ziweiP + 2) % 12;
    starPos['巨门'] = (ziweiP + 3) % 12;
    starPos['天相'] = (ziweiP + 4) % 12;
    starPos['天梁'] = (ziweiP + 5) % 12;

    // —— 四化（年干飞化禄权科忌） ——
    var sh = SIHUA[yearGan] || ['', '', '', ''];
    var sihua = [
      { name: '化禄', star: sh[0] }, { name: '化权', star: sh[1] },
      { name: '化科', star: sh[2] }, { name: '化忌', star: sh[3] }
    ];

    // ====== 渲染 ======
    if (name) html += '<div class="pp-block"><h3>命主</h3><p class="pp-note">姓名：<b>' + escapeHtml(name) + '</b>　性别：' + sex + '　生肖：' + lunar.getYearShengXiao() + '</p></div>';

    // 四柱八字
    html += '<div class="pp-block"><h3>四柱八字</h3><div class="pp-bazi">';
    var labels = ['年柱', '月柱', '日柱', '时柱'];
    html += pillars.map(function (p, i) {
      return '<div class="bz"><div class="bz-lab">' + labels[i] + '</div>' +
        '<div class="bz-gan">' + p.charAt(0) + '<small>' + GAN_WX[p.charAt(0)] + '</small></div>' +
        '<div class="bz-zhi">' + p.charAt(1) + '<small>' + (ZHI_WX(p.charAt(1))) + '</small></div></div>';
    }).join('');
    html += '</div><p class="pp-note">日柱纳音：' + lunar.getDayNaYin() + '</p></div>';

    // 命盘概要
    html += '<div class="pp-block"><h3>命盘概要</h3>';
    html += '<div class="zw-summary">';
    html += zwItem('命宫', ZHI[lifeP] + '宫', '纳音' + mingNayin + ' · ' + juName);
    html += zwItem('身宫', ZHI[bodyP] + '宫', '一生执向');
    html += zwItem('五行局', juName, '定紫微起盘');
    html += zwItem('紫微星', '坐' + ZHI[ziweiP] + '宫', (forward ? '阳顺' : '阴逆') + '安星');
    html += '</div></div>';

    // 十二宫 + 主星
    html += '<div class="pp-block"><h3>十二宫 · 十四主星</h3><div class="zw-palaces">';
    for (var i = 0; i < 12; i++) {
      var pIdx = (lifeP - i + 12) % 12;        // 自命宫逆布
      var pName = PALACES[i];
      var stars = [];
      for (var s in starPos) if (starPos[s] === pIdx) stars.push(s);
      var isMing = (pIdx === lifeP);
      html += '<div class="zw-palace' + (isMing ? ' ming' : '') + '">';
      html += '<div class="zw-p-name">' + pName + '<span class="zw-p-zhi">' + ZHI[pIdx] + '</span></div>';
      html += '<div class="zw-p-stars">' + (stars.length ? stars.map(function (st) {
        return '<span class="zw-star' + (st === '紫微' || st === '天府' ? ' main' : '') + '">' + st + '</span>';
      }).join('') : '<span class="zw-empty">—</span>') + '</div>';
      html += '</div>';
    }
    html += '</div></div>';

    // 四化
    html += '<div class="pp-block"><h3>年干四化（' + yearGan + '年）</h3><div class="zw-sihua">';
    sihua.forEach(function (h) {
      var pos = h.star ? starPos[h.star] : -1;
      html += '<div class="zw-si"><span class="zw-si-name">' + h.name + '</span>' +
        '<span class="zw-si-star">' + (h.star || '—') + '</span>' +
        '<span class="zw-si-pos">' + (pos >= 0 ? ZHI[pos] + '宫' : '') + '</span></div>';
    });
    html += '</div><p class="pp-note">禄权科为吉，化忌多主羁绊，须看星曜庙旺与三方四正综合论断。</p></div>';

    html += '<p class="hint" style="margin-top:10px">本盘依传统安星诀推算，仅作传统文化与娱乐参考，命运掌握在自己手中，请相信科学、不迷信。</p>';

    resultEl.innerHTML = html;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function ZHI_WX(z) {
    return ({ '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' })[z] || '?';
  }
  function zwItem(k, v, note) {
    return '<div class="zw-sum"><div class="zw-sum-k">' + k + '</div><div class="zw-sum-v">' + v + '</div><div class="zw-sum-n">' + note + '</div></div>';
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  var nameEl = document.getElementById('zw-name');
  var sexEl = document.getElementById('zw-sex');
  var birthEl = document.getElementById('zw-birth');
  var resultEl = document.getElementById('zw-result');
  var btnGo = document.getElementById('zw-go');

  if (btnGo) btnGo.addEventListener('click', calcZiwei);

  window.ZiweiModule = {
    onEnter: function () {
      if (!birthEl.value) {
        var t = new Date(); var local = new Date(t.getTime() - t.getTimezoneOffset() * 60000);
        function p(n) { return (n < 10 ? '0' : '') + n; }
        birthEl.value = t.getFullYear() + '-' + p(t.getMonth() + 1) + '-' + p(t.getDate()) + 'T' + p(t.getHours()) + ':' + p(t.getMinutes());
      }
      resultEl.hidden = true;
    }
  };
})();
