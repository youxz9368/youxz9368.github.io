/* 模块3：中华万年历 + 数字时钟（北京时间） */
(function () {
  'use strict';

  var WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  var BAGUA_POS = { '乾': '西北', '兑': '西', '离': '南', '震': '东', '巽': '东南', '坎': '北', '艮': '东北', '坤': '西南' };
  var hasLunar = (typeof Solar !== 'undefined');

  function beijingNow() {
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utc + 8 * 3600000);
  }
  function pos(name) { return BAGUA_POS[name] ? (name + '（' + BAGUA_POS[name] + '）') : name; }

  // ---------- 时钟 ----------
  var clockTime = document.getElementById('clock-time');
  var clockDate = document.getElementById('clock-date');
  var clockWeek = document.getElementById('clock-week');
  var clockAuto = document.getElementById('clock-auto');
  var clockManual = document.getElementById('clock-manual');
  var clockInput = document.getElementById('clock-input');
  var btnClockApply = document.getElementById('btn-clock-apply');
  var offset = 0;
  var timer = null;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var t = new Date(beijingNow().getTime() + offset);
    clockTime.textContent = pad(t.getHours()) + ':' + pad(t.getMinutes()) + ':' + pad(t.getSeconds());
    clockDate.textContent = t.getFullYear() + '年' + (t.getMonth() + 1) + '月' + t.getDate() + '日';
    clockWeek.textContent = WEEK[t.getDay()];
  }

  clockAuto.addEventListener('change', function () {
    if (clockAuto.checked) {
      clockManual.hidden = true;
      offset = 0;
    } else {
      clockManual.hidden = false;
      var t = beijingNow();
      var local = new Date(t.getTime() - t.getTimezoneOffset() * 60000);
      clockInput.value = local.toISOString().slice(0, 16);
    }
  });
  btnClockApply.addEventListener('click', function () {
    if (!clockInput.value) return;
    var chosen = new Date(clockInput.value);
    if (isNaN(chosen.getTime())) return;
    var realBJ = beijingNow();
    offset = chosen.getTime() - realBJ.getTime();
    tick();
  });

  // ---------- 万年历 ----------
  var grid = document.getElementById('cal-grid');
  var titleEl = document.getElementById('cal-title');
  var detailEl = document.getElementById('cal-detail');
  var btnPrev = document.getElementById('cal-prev');
  var btnNext = document.getElementById('cal-next');
  var btnToday = document.getElementById('cal-today');
  var selDate = null;
  var cur = new Date(beijingNow().getTime());

  function lunarObj(y, m, d) {
    if (!hasLunar) return null;
    try { return Solar.fromYmd(y, m, d).getLunar(); }
    catch (e) { return null; }
  }

  function render() {
    var y = cur.getFullYear(), m = cur.getMonth() + 1;
    titleEl.textContent = y + '年' + m + '月';
    var first = new Date(y, m - 1, 1);
    var startW = first.getDay();
    var days = new Date(y, m, 0).getDate();
    var today = beijingNow();
    var html = '';
    for (var i = 0; i < startW; i++) html += '<div class="cal-cell other"></div>';
    for (var d = 1; d <= days; d++) {
      var cls = 'cal-cell';
      if (y === today.getFullYear() && m === today.getMonth() + 1 && d === today.getDate()) cls += ' today';
      if (selDate && selDate.y === y && selDate.m === m && selDate.d === d) cls += ' selected';
      var lu = lunarObj(y, m, d);
      var sub = lu ? ((lu.getJieQi() && lu.getJieQi() !== '无') ? lu.getJieQi() : lu.getDayInChinese()) : '';
      html += '<div class="' + cls + '" data-y="' + y + '" data-m="' + m + '" data-d="' + d + '">' +
        '<span class="g">' + d + '</span><span class="lunar">' + sub + '</span></div>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('.cal-cell[data-y]').forEach(function (c) {
      c.addEventListener('click', function () {
        selDate = { y: +c.dataset.y, m: +c.dataset.m, d: +c.dataset.d };
        showDetail(selDate);
        render();
      });
    });
  }

  function showDetail(s) {
    var lu = lunarObj(s.y, s.m, s.d);
    var dt = new Date(s.y, s.m - 1, s.d);
    var w = WEEK[dt.getDay()];
    var h = '<div class="hl-date"><b>' + s.y + '年' + s.m + '月' + s.d + '日</b> · ' + w + '</div>';
    if (lu) {
      h += '<div class="hl-row"><span class="hl-k">农历</span><span>' + lu.getYearInGanZhi() + '（' + lu.getYearShengXiao() + '）年 ' + lu.getMonthInChinese() + lu.getDayInChinese() + '</span></div>';
      var jq = lu.getJieQi();
      if (jq && jq !== '无') h += '<div class="hl-row"><span class="hl-k">节气</span><span class="hl-hot">' + jq + '</span></div>';
      var yi = lu.getDayYi(), ji = lu.getDayJi();
      h += '<div class="hl-row"><span class="hl-k">宜</span><span class="hl-yi">' + yi.join('、') + '</span></div>';
      h += '<div class="hl-row"><span class="hl-k">忌</span><span class="hl-ji">' + ji.join('、') + '</span></div>';
      h += '<div class="hl-row"><span class="hl-k">冲煞</span><span>冲' + lu.getDayChong() + '煞' + lu.getDaySha() + '</span></div>';
      h += '<div class="hl-row"><span class="hl-k">喜神</span><span>' + pos(lu.getDayPositionXi()) + '</span></div>';
      h += '<div class="hl-row"><span class="hl-k">福神</span><span>' + pos(lu.getDayPositionFu()) + '</span></div>';
      h += '<div class="hl-row"><span class="hl-k">财神</span><span>' + pos(lu.getDayPositionCai()) + '</span></div>';
      h += '<div class="hl-row"><span class="hl-k">纳音</span><span>' + lu.getDayNaYin() + '</span></div>';
    } else {
      h += '<div class="hl-row"><span>（农历数据未加载，仅显示公历）</span></div>';
    }
    detailEl.innerHTML = h;
  }

  btnPrev.addEventListener('click', function () {
    cur = new Date(cur.getFullYear(), cur.getMonth() - 1, 1);
    render();
  });
  btnNext.addEventListener('click', function () {
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    render();
  });
  btnToday.addEventListener('click', function () {
    cur = new Date(beijingNow().getTime());
    selDate = null;
    detailEl.innerHTML = '点击某一天，查看当日黄历（宜 / 忌 / 冲煞 / 方位）';
    render();
  });

  window.CalendarModule = {
    onEnter: function () {
      if (timer) clearInterval(timer);
      timer = setInterval(tick, 1000);
      tick();
      cur = new Date(beijingNow().getTime());
      selDate = null;
      detailEl.innerHTML = '点击某一天，查看当日黄历（宜 / 忌 / 冲煞 / 方位）';
      render();
    },
    onLeave: function () { if (timer) { clearInterval(timer); timer = null; } }
  };
})();
