/* 模块：八字排盘 · AI测算（四柱八字 + 五行 + 姓名笔画五格） */
(function () {
  'use strict';

  var GAN_WX = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  var ZHI_WX = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
  var WX_ORDER = ['木', '火', '土', '金', '水'];

  // 81 数理吉凶（传统姓名学，仅作娱乐参考）
  var SHU = [null,
    ['大吉', '繁荣发达，名利双收'], ['凶', '混沌未开，进退保守'], ['吉', '进取如意，成功荣达'],
    ['凶', '破败凶变，灾难重重'], ['吉', '福寿圆满，富贵荣誉'], ['吉', '安稳余庆，福寿绵长'],
    ['吉', '刚毅果断，勇往直前'], ['吉', '意志坚刚，锲而不舍'], ['凶', '破舟进海，穷乏困苦'],
    ['凶', '万事终局，悲苦无穷'], ['吉', '挽回家运，顺风扬帆'], ['凶', '薄弱无力，谋事难成'],
    ['吉', '智略超群，才艺双全'], ['凶', '忍得苦难，亦多波折'], ['吉', '福寿双全，涵养雅量'],
    ['吉', '厚重载德，安富尊荣'], ['吉', '权威刚强，突破万难'], ['吉', '有志竟成，内外有运'],
    ['凶', '多难悲运，风云蔽日'], ['凶', '祸不单行，灾难迭至'], ['吉', '明月中天，万物确立'],
    ['凶', '秋草逢霜，怀才不遇'], ['吉', '旭日东升，门昌终兴'], ['吉', '家门余庆，财源广进'],
    ['吉', '资性英敏，才能奇特'], ['凶', '变怪奇异，英雄豪杰'], ['凶', '诽难受损，诽难缠身'],
    ['凶', '家亲缘薄，离群独处'], ['吉', '智谋兼备，成就大业'], ['凶', '绝境逢生，浮沉不定'],
    ['吉', '智勇得志，心想事成'], ['吉', '侥幸多望，贵人得助'], ['吉', '家门隆昌，白手成家'],
    ['凶', '破家亡身，灾难重重'], ['吉', '温和平静，智达通畅'], ['凶', '风浪不平，侠情波澜'],
    ['吉', '权威显达，热诚忠信'], ['凶', '磨铁成针，意志薄弱'], ['吉', '富贵荣华，财帛丰盈'],
    ['凶', '谨慎保安，保守平安'], ['吉', '德高望重，事谋顺调'], ['凶', '寒蝉在柳，十艺九不成'],
    ['凶', '散财破产，诸事不遂'], ['凶', '难用心计，灾祸频临'], ['吉', '顺风扬帆，万事如意'],
    ['凶', '罗网系身，小人陷害'], ['吉', '点铁成金，开花结果'], ['吉', '古松立鹤，德智兼备'],
    ['凶', '变怪之象，英雄豪杰'], ['凶', '小舟入海，吉凶参半'], ['吉', '盛衰交加，须防复沉'],
    ['吉', '卓识达智，理获成功'], ['凶', '忧愁困苦，事事难成'], ['凶', '石上栽花，难得有获'],
    ['凶', '善恶难分，皆遇灾难'], ['凶', '浪里行舟，历尽艰辛'], ['吉', '寒雪青松，最大吉运'],
    ['凶', '办事联手，难获成功'], ['凶', '寒鸦栖独，力量不足'], ['凶', '无谋之人，事故频发'],
    ['吉', '牡丹芙蓉，名利可得'], ['凶', '衰败之象，内外不和'], ['吉', '富贵荣华，实济人物'],
    ['凶', '骨肉分离，孤独悲愁'], ['吉', '巨流归海，富贵长寿'], ['凶', '进退维谷，屡试屡败'],
    ['吉', '利禄亨通，天赋吉运'], ['吉', '顺风扬帆，天时地利'], ['凶', '坐立不安，常陷逆境'],
    ['凶', '残菊逢霜，寂寞无欢'], ['吉', '石上金花，难得之数'], ['凶', '劳神无功，反招灾难'],
    ['吉', '志高力成，可达目的'], ['凶', '残花经霜，困难重重'], ['吉', '退守平安，自重自爱'],
    ['凶', '散财辱行，难振家声'], ['凶', '前半生吉，后半生凶'], ['凶', '晚景凄凉，难享天伦'],
    ['凶', '云头望月，身陷穷途'], ['凶', '凶星入度，穷困之数'], ['大吉', '万物回春，好运连连']
  ];

  function wxOf(p) { return [GAN_WX[p.charAt(0)] || '?', ZHI_WX[p.charAt(1)] || '?']; }
  function shuInfo(n) {
    n = ((n % 10) + 10) % 10; if (n === 0) n = 10; // 个位，0→10
    var r = SHU[n]; return r ? { code: r[0], mean: r[1] } : { code: '', mean: '' };
  }
  function wuXingOfStroke(n) {
    n = ((n % 10) + 10) % 10;
    return (n === 1 || n === 2) ? '木' : (n === 3 || n === 4) ? '火' : (n === 5 || n === 6) ? '土' : (n === 7 || n === 8) ? '金' : '水';
  }

  var nameEl = document.getElementById('pp-name');
  var birthEl = document.getElementById('pp-birth');
  var sexEl = document.getElementById('pp-sex');
  var btnGo = document.getElementById('pp-go');
  var resultEl = document.getElementById('pp-result');

  function localToInput(d) {
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + 'T' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function charStrokes(ch) {
    if (typeof cnchar === 'undefined') return 0;
    try { return cnchar.stroke(ch); } catch (e) { return 0; }
  }

  function calc() {
    var name = (nameEl.value || '').trim();
    var birthVal = birthEl.value;
    var sex = sexEl ? sexEl.value : '男';
    if (!birthVal) { alert('请先选择出生时间'); return; }
    var dt = new Date(birthVal);
    if (isNaN(dt.getTime())) { alert('出生时间格式不正确'); return; }

    var hasLunar = (typeof Solar !== 'undefined');
    var y = dt.getFullYear(), m = dt.getMonth() + 1, d = dt.getDate(), hh = dt.getHours(), mi = dt.getMinutes();
    var lunar = null;
    if (hasLunar) {
      try { lunar = Solar.fromYmdHms(y, m, d, hh, mi, 0).getLunar(); } catch (e) { lunar = null; }
    }
    var pillars = lunar ? [lunar.getYearInGanZhi(), lunar.getMonthInGanZhi(), lunar.getDayInGanZhi(), lunar.getTimeInGanZhi()] : null;

    var html = '';

    // 四柱八字
    html += '<div class="pp-block"><h3>四柱八字</h3>';
    if (pillars) {
      var labels = ['年柱', '月柱', '日柱', '时柱'];
      html += '<div class="pp-bazi">' + pillars.map(function (p, i) {
        var wx = wxOf(p);
        return '<div class="bz"><div class="bz-lab">' + labels[i] + '</div>' +
          '<div class="bz-gan">' + p.charAt(0) + '<small>' + wx[0] + '</small></div>' +
          '<div class="bz-zhi">' + p.charAt(1) + '<small>' + wx[1] + '</small></div></div>';
      }).join('') + '</div>';
      var sx = lunar.getYearShengXiao();
      html += '<p class="pp-note">生肖：' + sx + '　|　日柱纳音：' + lunar.getDayNaYin() + '</p>';
    } else {
      html += '<p class="pp-note">（农历库未加载，无法推算八字）</p>';
    }
    html += '</div>';

    // 五行分析
    if (pillars) {
      var cnt = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
      pillars.forEach(function (p) { cnt[wxOf(p)[0]]++; cnt[wxOf(p)[1]]++; });
      var max = Math.max.apply(null, WX_ORDER.map(function (w) { return cnt[w]; }));
      var min = Math.min.apply(null, WX_ORDER.map(function (w) { return cnt[w]; }));
      html += '<div class="pp-block"><h3>五行分析</h3><div class="pp-wx">';
      WX_ORDER.forEach(function (w) {
        var n = cnt[w];
        var tag = n === max ? '旺' : (n === min ? '弱' : '');
        html += '<div class="wx-item wx-' + w + '"><span class="wx-name">' + w + '</span>' +
          '<span class="wx-bar"><i style="width:' + (n * 20) + '%"></i></span>' +
          '<span class="wx-num">' + n + (tag ? ' · ' + tag : '') + '</span></div>';
      });
      html += '</div>';
      var dayGan = pillars[2].charAt(0);
      html += '<p class="pp-note">日主（日干）：<b>' + dayGan + '</b>（' + GAN_WX[dayGan] + '）— 代表你自己。五行仅供娱乐参考。</p>';
      html += '</div>';
    }

    // 大运排盘（男女顺逆不同，必须区分性别）
    if (pillars) {
      try {
        var ec = lunar.getEightChar();
        var yun = ec.getYun(sex === '女' ? 0 : 1, 1); // 1=男 0=女
        var daYun = yun.getDaYun(9);
        var shown = 0;
        html += '<div class="pp-block"><h3>大运排盘（' + sex + '命）</h3><div class="pp-dayun">';
        daYun.forEach(function (dy) {
          var gz = dy.getGanZhi();
          if (!gz) return; // 跳过「起运前」的空运
          shown++;
          var gzWx = wxOf(gz)[0];
          html += '<div class="dy-item">' +
            '<span class="dy-idx">第' + shown + '运</span>' +
            '<span class="dy-gz wx-' + gzWx + '">' + gz + '</span>' +
            '<span class="dy-meta">约 ' + dy.getStartAge() + ' 岁起 · ' + dy.getStartYear() + ' 年</span>' +
            '</div>';
        });
        html += '</div>';
        html += '<p class="pp-note">大运按 ' + (sex === '男' ? '男命阳顺阴逆、女命阳逆阴顺' : '女命阳逆阴顺、男命阳顺阴逆') +
          ' 排布；起运岁数由出生日距最近节气推算，每运十年，仅供娱乐参考。</p>';
        html += '</div>';
      } catch (e) {
        html += '<div class="pp-block"><p class="pp-note">（大运推算暂不可用：' + (e && e.message ? e.message : '未知错误') + '）</p></div>';
      }
    }

    // 姓名笔画分析
    if (name) {
      var chars = name.split('');
      var list = chars.map(function (c) { return { c: c, s: charStrokes(c) }; });
      var totalStroke = list.reduce(function (a, b) { return a + b.s; }, 0);
      html += '<div class="pp-block"><h3>姓名笔画分析</h3>';
      html += '<div class="pp-chars">' + list.map(function (it) {
        return '<span class="ch"><b>' + it.c + '</b><i>' + it.s + '画</i></span>';
      }).join('') + '<span class="ch total"><b>共</b><i>' + totalStroke + '画</i></span></div>';

      // 五格（按单姓处理：首字为姓，其余为名）
      var sStroke = list.length ? list[0].s : 0;
      var mList = list.slice(1);
      var mTotal = mList.reduce(function (a, b) { return a + b.s; }, 0);
      var tian = sStroke + 1;
      var ren = sStroke + (mList.length ? mList[0].s : 1);
      var di = mList.length === 1 ? mTotal + 1 : mTotal;
      var zong = sStroke + mTotal;
      var wai = zong - ren + 1;
      var ge = [['天格', tian], ['人格', ren], ['地格', di], ['总格', zong], ['外格', wai]];
      html += '<table class="pp-grid"><tr><th>五格</th><th>笔画</th><th>五行</th><th>81数理</th></tr>';
      ge.forEach(function (g) {
        var wi = wuXingOfStroke(g[1]);
        var si = shuInfo(g[1]);
        var cls = si.code === '凶' ? 'bad' : (si.code === '大吉' ? 'best' : 'good');
        html += '<tr><td>' + g[0] + '</td><td>' + g[1] + '</td><td class="wx-' + wi + '">' + wi + '</td>' +
          '<td class="' + cls + '">' + si.code + ' · ' + si.mean + '</td></tr>';
      });
      html += '</table>';
      html += '<p class="pp-note">注：按“单姓”规则测算（首字为姓）；复姓、特殊用字结果会有偏差，仅供娱乐。</p>';
      html += '</div>';
    } else {
      html += '<div class="pp-block"><p class="pp-note">未输入姓名，已跳过姓名笔画分析。可返回填写姓名后重测。</p></div>';
    }

    html += '<p class="hint" style="margin-top:10px">以上测算由程序依据传统术数规则推算，纯属娱乐参考，请相信科学、不迷信。</p>';
    resultEl.innerHTML = html;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  btnGo.addEventListener('click', calc);

  window.PaipanModule = {
    onEnter: function () {
      if (!birthEl.value) {
        // 预填当前北京时间
        var t = new Date(); var local = new Date(t.getTime() - t.getTimezoneOffset() * 60000);
        birthEl.value = localToInput(local);
      }
      resultEl.hidden = true;
    }
  };
})();
