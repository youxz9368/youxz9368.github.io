/* 通用日期选择器：公历 / 农历 双模式，含时辰选择
 * 依赖：lunar.js（Lunar / Solar 全局）
 * 用法：
 *   var dp = window.LYDatePicker.build(containerEl, {id:'m1'});
 *   dp.getValue()      -> {cal:'solar'|'lunar', y, m, d, h, shichen}
 *   dp.toSolar(val)    -> Solar 实例（可用于 .getLunar() 取八字）
 *   dp.dateText(val)   -> 人类可读文本
 */
window.LYDatePicker = (function () {
  'use strict';

  var SHICHEN = [
    { n: '子时', h: 0, t: '23:00-01:00' },
    { n: '丑时', h: 2, t: '01:00-03:00' },
    { n: '寅时', h: 4, t: '03:00-05:00' },
    { n: '卯时', h: 6, t: '05:00-07:00' },
    { n: '辰时', h: 8, t: '07:00-09:00' },
    { n: '巳时', h: 10, t: '09:00-11:00' },
    { n: '午时', h: 12, t: '11:00-13:00' },
    { n: '未时', h: 14, t: '13:00-15:00' },
    { n: '申时', h: 16, t: '15:00-17:00' },
    { n: '酉时', h: 18, t: '17:00-19:00' },
    { n: '戌时', h: 20, t: '19:00-21:00' },
    { n: '亥时', h: 22, t: '21:00-23:00' }
  ];
  var LUNAR_MONTH_CN = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
  var DAY_CN = ['初', '十', '二十', '三十'];
  function dayCn(d) {
    if (d === 10) return '初十';
    if (d === 20) return '二十';
    if (d === 30) return '三十';
    if (d < 10) return '初' + '一二三四五六七八九'[d - 1];
    if (d < 20) return '十' + '一二三四五六七八九'[d - 11];
    return '廿' + '一二三四五六七八九'[d - 21];
  }

  function p2(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()); }
  function opt(v, t, sel) { return '<option value="' + v + '"' + (sel ? ' selected' : '') + '>' + t + '</option>'; }

  function toDate(solar) { return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay()); }

  // 该农历年是否有闰月，返回闰月序号(1-12)，无则 0
  function leapOfYear(y) {
    for (var k = 1; k <= 12; k++) {
      try { if (typeof Lunar !== 'undefined') Lunar.fromYmd(y, -k, 1); return k; } catch (e) {}
    }
    return 0;
  }
  // 给定 (y,m) 的下一个农历月份（m 可负表示闰月）
  function nextLunarMonth(y, m) {
    if (m < 0) return { y: y, m: -m };
    var lp = false;
    try { if (typeof Lunar !== 'undefined') Lunar.fromYmd(y, -m, 1); lp = true; } catch (e) {}
    if (lp) return { y: y, m: -m };
    if (m < 12) return { y: y, m: m + 1 };
    return { y: y + 1, m: 1 };
  }
  // 该农历月天数（29 或 30）
  function lunarDays(y, m) {
    if (typeof Lunar === 'undefined') return 30;
    var a = toDate(Lunar.fromYmd(y, m, 1).getSolar());
    var n = nextLunarMonth(y, m);
    var b = toDate(Lunar.fromYmd(n.y, n.m, 1).getSolar());
    return Math.round((b - a) / 86400000);
  }

  function shichenOptions() {
    return SHICHEN.map(function (s, i) {
      return opt(i, s.n + '（' + s.t + '）', i === 6);
    }).join('');
  }
  function yearOptions(def) {
    var s = '';
    for (var y = 1940; y <= 2043; y++) s += opt(y, y + '年', y === def);
    return s;
  }
  function monthOptions(year, selVal) {
    var leap = leapOfYear(year);
    var s = '';
    for (var m = 1; m <= 12; m++) {
      s += opt(m, LUNAR_MONTH_CN[m] + '月', selVal && selVal === m);
      if (m === leap) s += opt(-m, '闰' + LUNAR_MONTH_CN[m] + '月', selVal && selVal === -m);
    }
    return s;
  }
  function dayOptions(year, month, selVal) {
    var days = lunarDays(year, month);
    var s = '';
    for (var d = 1; d <= days; d++) s += opt(d, dayCn(d), selVal && selVal === d);
    return s;
  }

  function build(container, opts) {
    opts = opts || {};
    var id = opts.id || ('ly' + Math.random().toString(36).slice(2, 8));
    var t = new Date();

    container.innerHTML =
      '<div class="lydp">' +
        '<div class="lydp-toggle">' +
          '<button type="button" class="lydp-tab active" data-cal="solar">公历</button>' +
          '<button type="button" class="lydp-tab" data-cal="lunar">农历</button>' +
        '</div>' +
        '<div class="lydp-panel lydp-solar" data-panel="solar">' +
          '<div class="lydp-row"><label>出生日期</label><input type="date" class="lydp-date" value="' + ymd(t) + '"></div>' +
          '<div class="lydp-row"><label>出生时辰</label><select class="lydp-sh">' + shichenOptions() + '</select></div>' +
        '</div>' +
        '<div class="lydp-panel lydp-lunar" data-panel="lunar" hidden>' +
          '<div class="lydp-row"><label>农历年</label><select class="lydp-ly">' + yearOptions(2000) + '</select></div>' +
          '<div class="lydp-row"><label>农历月</label><select class="lydp-lm"></select></div>' +
          '<div class="lydp-row"><label>农历日</label><select class="lydp-ld"></select></div>' +
          '<div class="lydp-row"><label>出生时辰</label><select class="lydp-lsh">' + shichenOptions() + '</select></div>' +
        '</div>' +
      '</div>';

    var tabSolar = container.querySelector('.lydp-tab[data-cal="solar"]');
    var tabLunar = container.querySelector('.lydp-tab[data-cal="lunar"]');
    var pSolar = container.querySelector('.lydp-solar');
    var pLunar = container.querySelector('.lydp-lunar');
    var lySel = container.querySelector('.lydp-ly');
    var lmSel = container.querySelector('.lydp-lm');
    var ldSel = container.querySelector('.lydp-ld');

    function refreshLunar() {
      var y = parseInt(lySel.value, 10);
      lmSel.innerHTML = monthOptions(y, null);
      ldSel.innerHTML = dayOptions(y, parseInt(lmSel.value, 10), null);
    }
    function onTab(cal) {
      var isL = cal === 'lunar';
      tabSolar.classList.toggle('active', !isL);
      tabLunar.classList.toggle('active', isL);
      pSolar.hidden = isL;
      pLunar.hidden = !isL;
    }
    tabSolar.addEventListener('click', function () { onTab('solar'); });
    tabLunar.addEventListener('click', function () { onTab('lunar'); });
    lySel.addEventListener('change', refreshLunar);
    lmSel.addEventListener('change', function () {
      ldSel.innerHTML = dayOptions(parseInt(lySel.value, 10), parseInt(lmSel.value, 10), null);
    });
    refreshLunar();

    function getValue() {
      if (!pLunar.hidden) {
        var sc = SHICHEN[parseInt(container.querySelector('.lydp-lsh').value, 10)];
        return { cal: 'lunar', y: parseInt(lySel.value, 10), m: parseInt(lmSel.value, 10), d: parseInt(ldSel.value, 10), h: sc.h, shichen: sc.n };
      }
      var di = container.querySelector('.lydp-date');
      var sd = di.value ? new Date(di.value + 'T00:00:00') : t;
      var sc2 = SHICHEN[parseInt(container.querySelector('.lydp-sh').value, 10)];
      return { cal: 'solar', y: sd.getFullYear(), m: sd.getMonth() + 1, d: sd.getDate(), h: sc2.h, shichen: sc2.n };
    }
    function toSolarYmd(val) {
      if (val.cal === 'solar') return { y: val.y, m: val.m, d: val.d, h: val.h };
      var solar = null;
      try { solar = Lunar.fromYmd(val.y, val.m, val.d).getSolar(); } catch (e) { return null; }
      return { y: solar.getYear(), m: solar.getMonth(), d: solar.getDay(), h: val.h };
    }
    function toSolar(val) {
      var s = toSolarYmd(val);
      if (!s) return null;
      try { return Solar.fromYmdHms(s.y, s.m, s.d, s.h, 0, 0); } catch (e) { return null; }
    }
    function dateText(val) {
      var s = toSolarYmd(val);
      if (!s) return '（日期无效）';
      var head = '';
      if (val.cal === 'lunar') {
        var cn = Lunar.fromYmd(val.y, val.m, val.d);
        head = '农历' + cn.getYearInChinese() + '年' + cn.getMonthInChinese() + '月' + cn.getDayInChinese() + ' ' + val.shichen;
      } else {
        head = '公历 ' + s.y + '年' + s.m + '月' + s.d + '日 ' + val.shichen;
      }
      var tail = '';
      if (typeof Solar !== 'undefined') {
        var sm = Solar.fromYmdHms(s.y, s.m, s.d, s.h, 0, 0);
        tail = '　（' + sm.getLunar().getYearShengXiao() + '年，星期' + '日一二三四五六'.charAt(sm.getLunar().getSolar().getWeek()) + '）';
      }
      return head + tail;
    }

    return { getValue: getValue, toSolar: toSolar, toSolarYmd: toSolarYmd, dateText: dateText };
  }

  return { build: build };
})();
