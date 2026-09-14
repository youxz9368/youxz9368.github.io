/* 模块：宝宝取名（八字五行 · 喜用神 · 五格）
 * 依赖：lunar.js（Solar/Lunar）、cnchar（笔画）、lib/date-picker.js（LYDatePicker）
 * 结构：
 *   姓氏 + 性别 + 字数（单名1字 / 双名2字）+ 当双名时的指定字（中间字 / 尾字）
 *   + 出生日期(公历/农历) + 禁忌用字
 *   → 按八字五行取喜用神，五行字库生成名字候选，过滤禁忌/同字/性别不符
 *   → 输出五行 / 寓意 / 五格(81数理)
 * 仅供文化娱乐参考，请相信科学、不迷信。
 */
(function () {
  'use strict';

  var GAN_WX = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  var ZHI_WX = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
  var WX_ORDER = ['木', '火', '土', '金', '水'];
  var SHENG = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };

  // 81 数理吉凶
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

  // 五行字库（c=字 wx=五行 mean=寓意 g=适用：m男/f女/u通用）
  var POOL = {
    '金': [
      { c: '钧', mean: '权衡公正，雷霆万钧', g: 'm' }, { c: '铭', mean: '铭记于心，感恩知礼', g: 'u' },
      { c: '锐', mean: '锐意进取，眼光敏锐', g: 'm' }, { c: '锦', mean: '锦绣前程，华美有成', g: 'u' },
      { c: '锋', mean: '锋芒内敛，才思敏捷', g: 'm' }, { c: '铃', mean: '清脆灵动，悦耳怡人', g: 'f' },
      { c: '铮', mean: '铁骨铮铮，刚正不阿', g: 'm' }, { c: '钰', mean: '珍宝美玉，贵气天成', g: 'u' },
      { c: '鑫', mean: '金多兴旺，财源广进', g: 'u' }, { c: '铠', mean: '铠甲护身，坚韧勇敢', g: 'm' },
      { c: '琛', mean: '琛宝珍藏，温润如玉', g: 'u' }, { c: '璇', mean: '璇玑美玉，聪慧灵秀', g: 'f' },
      { c: '珊', mean: '珊瑚剔透，明丽可爱', g: 'f' }, { c: '玲', mean: '玲珑剔透，乖巧机灵', g: 'f' }
    ],
    '木': [
      { c: '林', mean: '成林茂盛，生机勃勃', g: 'u' }, { c: '森', mean: '繁盛兴旺，根基深厚', g: 'u' },
      { c: '梓', mean: '良木成材，敬恭桑梓', g: 'u' }, { c: '桐', mean: '梧桐引凤，高洁雅致', g: 'f' },
      { c: '楠', mean: '楠木贵重，品格坚贞', g: 'm' }, { c: '楷', mean: '楷模世范，端正可风', g: 'm' },
      { c: '荣', mean: '荣耀兴旺，欣欣向荣', g: 'u' }, { c: '茂', mean: '枝繁叶茂，才情丰沛', g: 'm' },
      { c: '芷', mean: '香草美人，芬芳高洁', g: 'f' }, { c: '若', mean: '虚怀若谷，从容自在', g: 'u' },
      { c: '萌', mean: '萌发生长，朝气可爱', g: 'f' }, { c: '芊', mean: '草木芊芊，柔美清新', g: 'f' },
      { c: '茹', mean: '含辛茹苦，柔韧坚忍', g: 'f' }, { c: '茜', mean: '茜色明丽，活泼灵动', g: 'f' }
    ],
    '水': [
      { c: '浩', mean: '浩然正气，胸怀广阔', g: 'm' }, { c: '涵', mean: '涵养深厚，虚怀若谷', g: 'u' },
      { c: '沐', mean: '如沐春风，温润和畅', g: 'u' }, { c: '沁', mean: '沁人心脾，清新可人', g: 'f' },
      { c: '汐', mean: '潮汐有信，温柔流转', g: 'f' }, { c: '潇', mean: '潇洒俊逸，风度翩翩', g: 'm' },
      { c: '澜', mean: '波澜壮阔，气度不凡', g: 'm' }, { c: '沛', mean: '充沛丰盈，精力旺盛', g: 'u' },
      { c: '淳', mean: '淳厚质朴，返璞归真', g: 'u' }, { c: '清', mean: '清雅高洁，清正廉明', g: 'u' },
      { c: '洛', mean: '洛水清波，温婉灵秀', g: 'f' }, { c: '淑', mean: '贤淑温良，德性温雅', g: 'f' },
      { c: '洁', mean: '纯洁无瑕，冰清玉洁', g: 'u' }, { c: '淳', mean: '淳朴善良，真诚可靠', g: 'u' }
    ],
    '火': [
      { c: '炎', mean: '灼热光明，热情向上', g: 'm' }, { c: '煜', mean: '光耀夺目，前程似锦', g: 'm' },
      { c: '炜', mean: '炜烨生辉，才华外显', g: 'm' }, { c: '炫', mean: '光彩炫目，出众不凡', g: 'u' },
      { c: '灿', mean: '灿烂辉煌，笑靥如花', g: 'u' }, { c: '昕', mean: '朝阳初昕，希望满怀', g: 'f' },
      { c: '晴', mean: '晴空万里，开朗明丽', g: 'f' }, { c: '昭', mean: '昭如日月，显赫光明', g: 'm' },
      { c: '昱', mean: '昱昱日光，前景光明', g: 'u' }, { c: '暖', mean: '温暖如春，和煦可亲', g: 'f' },
      { c: '灵', mean: '灵秀聪慧，心思玲珑', g: 'u' }, { c: '烨', mean: '烨然生辉，卓尔不群', g: 'm' },
      { c: '熹', mean: '晨光熹微，温润清雅', g: 'm' }, { c: '丹', mean: '丹心一片，赤诚真挚', g: 'f' }
    ],
    '土': [
      { c: '坤', mean: '坤厚载物，包容稳健', g: 'm' }, { c: '城', mean: '众志成城，坚毅可靠', g: 'm' },
      { c: '垚', mean: '山高垚垚，根基稳固', g: 'u' }, { c: '培', mean: '培育滋养，厚德载福', g: 'u' },
      { c: '峻', mean: '高峻挺拔，气宇轩昂', g: 'm' }, { c: '岚', mean: '山岚氤氲，清雅脱俗', g: 'f' },
      { c: '婉', mean: '温婉可人，柔美娴静', g: 'f' }, { c: '怡', mean: '怡然自得，和悦安康', g: 'f' },
      { c: '恩', mean: '知恩图报，仁厚善良', g: 'u' }, { c: '安', mean: '平安喜乐，安定从容', g: 'u' },
      { c: '宇', mean: '气宇轩昂，胸怀天下', g: 'u' }, { c: '辰', mean: '星辰灿烂，时运昌隆', g: 'u' },
      { c: '屹', mean: '巍然屹立，坚定不摇', g: 'm' }, { c: '墨', mean: '书香墨韵，文采斐然', g: 'u' }
    ]
  };

  function wxOf(p) { return [GAN_WX[p.charAt(0)] || '?', ZHI_WX[p.charAt(1)] || '?']; }
  function shuInfo(n) { n = ((n % 10) + 10) % 10; if (n === 0) n = 10; var r = SHU[n]; return r ? { code: r[0], mean: r[1] } : { code: '', mean: '' }; }
  function wuXingOfStroke(n) { n = ((n % 10) + 10) % 10; return (n === 1 || n === 2) ? '木' : (n === 3 || n === 4) ? '火' : (n === 5 || n === 6) ? '土' : (n === 7 || n === 8) ? '金' : '水'; }
  function charStroke(ch) { if (typeof cnchar === 'undefined') return 0; try { return cnchar.stroke(ch); } catch (e) { return 0; } }

  // 给字库条目补 wx 字段（修复"undefined"显示问题）
  var POOL_RICH = {};
  Object.keys(POOL).forEach(function (w) {
    POOL_RICH[w] = POOL[w].map(function (e) { return { c: e.c, mean: e.mean, g: e.g, wx: w }; });
  });

  var rootEl, dpBaby;

  function onEnter() {
    rootEl = document.getElementById('babyname-wrap');
    if (!rootEl) return;
    rootEl.innerHTML =
      '<h2 class="view-title">宝宝取名</h2>' +
      '<p class="hint" style="margin-top:0">输入姓氏、性别与出生日期（公历/农历），依八字五行取喜用神，按五行字库生成名字候选。仅供文化娱乐参考，请相信科学、不迷信。</p>' +
      '<div class="pp-row"><label>宝宝姓氏</label><input id="bb-surname" type="text" placeholder="如：林（单姓）" maxlength="4"></div>' +
      '<div class="pp-row"><label>性别</label><select id="bb-sex"><option value="男">男</option><option value="女">女</option></select></div>' +
      '<div class="pp-row"><label>名字字数</label>' +
        '<span class="bb-len">' +
          '<label><input type="radio" name="bb-len" id="bb-len-1" value="1" checked> 单名（姓 + 1字）</label>' +
          '<label><input type="radio" name="bb-len" id="bb-len-2" value="2"> 双名（姓 + 2字）</label>' +
        '</span>' +
      '</div>' +
      '<div class="pp-row bb-spec-row" id="bb-spec-row" hidden>' +
        '<label>指定字</label>' +
        '<span class="bb-spec">' +
          '<select id="bb-spec-mode"><option value="middle">中间字（姓 + 指定 + ?）</option><option value="tail">尾字（姓 + ? + 指定）</option></select>' +
          '<input id="bb-spec-char" type="text" maxlength="1" placeholder="指定字">' +
        '</span>' +
      '</div>' +
      '<div class="pp-row"><label>出生日期</label><div id="bb-picker" class="bb-picker"></div></div>' +
      '<div class="pp-row"><label>禁忌用字</label><input id="bb-ban" type="text" placeholder="不喜欢的字，逗号或空格分隔，如：伟,芳" maxlength="40"></div>' +
      '<div class="bb-actions"><button id="bb-go" class="btn-primary">🔮 生成名字</button><button id="bb-reset" class="btn-ghost">重置</button></div>' +
      '<div id="bb-result" class="bb-result" hidden></div>';

    dpBaby = window.LYDatePicker.build(rootEl.querySelector('#bb-picker'));

    function updateLenUI() {
      var v = rootEl.querySelector('input[name="bb-len"]:checked').value;
      rootEl.querySelector('#bb-spec-row').hidden = (v !== '2');
    }
    rootEl.querySelectorAll('input[name="bb-len"]').forEach(function (r) {
      r.addEventListener('change', updateLenUI);
    });
    updateLenUI();

    rootEl.querySelector('#bb-go').addEventListener('click', calc);
    rootEl.querySelector('#bb-reset').addEventListener('click', onEnter);
  }

  function calc() {
    var surname = (rootEl.querySelector('#bb-surname').value || '').trim();
    if (!surname) { alert('请先填写宝宝姓氏'); return; }
    var sChar = surname.charAt(0);
    var sex = rootEl.querySelector('#bb-sex').value;
    var nameLen = rootEl.querySelector('input[name="bb-len"]:checked').value; // '1' or '2'
    var specMode = rootEl.querySelector('#bb-spec-mode').value;                // 'middle' | 'tail'
    var specCharRaw = (rootEl.querySelector('#bb-spec-char').value || '').trim();

    var solar = dpBaby.toSolar(dpBaby.getValue());
    if (!solar) { alert('出生日期无效，请重新选择'); return; }
    var lunar = solar.getLunar();
    var pillars = [lunar.getYearInGanZhi(), lunar.getMonthInGanZhi(), lunar.getDayInGanZhi(), lunar.getTimeInGanZhi()];
    var cnt = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    pillars.forEach(function (p) { cnt[wxOf(p)[0]]++; cnt[wxOf(p)[1]]++; });
    var dayGan = pillars[2].charAt(0);
    var dayWx = GAN_WX[dayGan];
    var weak = WX_ORDER.slice().sort(function (a, b) { return cnt[a] - cnt[b]; })[0];
    var shengWeak = SHENG[weak];
    var sName = surname;
    var sStroke = charStroke(sChar) || 1;

    var banRaw = (rootEl.querySelector('#bb-ban').value || '').replace(/[\s,，、;；]+/g, '');
    var ban = banRaw ? banRaw.split('').filter(function (c, i, a) { return a.indexOf(c) === i; }) : [];

    function okInPool(ch) {
      return ch.c !== sChar && ban.indexOf(ch.c) < 0 && (ch.g === 'u' || ch.g === (sex === '男' ? 'm' : 'f'));
    }

    var cands = [];
    if (nameLen === '1') {
      // ===== 单名 =====
      var seen = {};
      WX_ORDER.forEach(function (w) {
        (POOL_RICH[w] || []).filter(okInPool).forEach(function (a) {
          if (seen[a.c]) return; seen[a.c] = 1;
          var hits = (a.wx === weak ? 1 : 0) + (a.wx === shengWeak ? 1 : 0);
          cands.push({ name: sName + a.c, a: a, b: null, hits: hits });
        });
      });
      cands.sort(function (x, y) { return y.hits - x.hits; });
      cands = cands.slice(0, 16);
      cands.forEach(function (c) {
        var sa = charStroke(c.a.c);
        c.ge = { tian: sStroke + 1, ren: sStroke + sa, di: sa + 1, zong: sStroke + sa, wai: 1 };
      });
    } else {
      // ===== 双名 =====
      var specChar = specCharRaw.charAt(0);
      if (specChar && sChar === specChar) {
        alert('指定字不能与姓相同：「' + sChar + '」'); return;
      }
      if (specChar && ban.indexOf(specChar) >= 0) {
        alert('指定字「' + specChar + '」已被你列入禁忌用字'); return;
      }
      var seen2 = {};
      function tryPair(a, b, hits) {
        if (!a || !b) return;
        if (a.c === b.c) return;
        var key = (a.c || '') + '|' + (b.c || ''); if (seen2[key]) return; seen2[key] = 1;
        cands.push({ name: sName + (a.c || '') + (b.c || ''), a: a, b: b, hits: hits });
      }

      if (specChar && specMode === 'middle') {
        // 中间字固定：姓+中+末
        var fixedMid = { c: specChar, mean: '（用户指定中间字）', g: 'u', wx: wuXingOfStroke(charStroke(specChar) || 1) };
        WX_ORDER.forEach(function (w1) {
          WX_ORDER.forEach(function (w2) {
            (POOL_RICH[w1] || []).filter(okInPool).forEach(function (first) {
              if (specChar === first.c) return;
              (POOL_RICH[w2] || []).filter(okInPool).forEach(function (last) {
                if (specChar === last.c || first.c === last.c) return;
                var h = (fixedMid.wx === weak ? 1 : 0) + (fixedMid.wx === shengWeak ? 1 : 0)
                      + (last.wx === weak ? 1 : 0) + (last.wx === shengWeak ? 1 : 0);
                tryPair(fixedMid, last, h);
              });
            });
          });
        });
        // 由于中间字固定，"首选"字的差异不大；这里仍按命中数排序
      } else if (specChar && specMode === 'tail') {
        var fixedTail = { c: specChar, mean: '（用户指定尾字）', g: 'u', wx: wuXingOfStroke(charStroke(specChar) || 1) };
        WX_ORDER.forEach(function (w1) {
          (POOL_RICH[w1] || []).filter(okInPool).forEach(function (first) {
            if (specChar === first.c) return;
            var h = (first.wx === weak ? 1 : 0) + (first.wx === shengWeak ? 1 : 0)
                  + (fixedTail.wx === weak ? 1 : 0) + (fixedTail.wx === shengWeak ? 1 : 0);
            tryPair(first, fixedTail, h);
          });
        });
      } else {
        // 双名无指定字：自由组合
        WX_ORDER.forEach(function (w1) {
          WX_ORDER.forEach(function (w2) {
            (POOL_RICH[w1] || []).filter(okInPool).forEach(function (first) {
              (POOL_RICH[w2] || []).filter(okInPool).forEach(function (last) {
                if (first.c === last.c) return;
                var h = (first.wx === weak ? 1 : 0) + (first.wx === shengWeak ? 1 : 0)
                      + (last.wx === weak ? 1 : 0) + (last.wx === shengWeak ? 1 : 0);
                tryPair(first, last, h);
              });
            });
          });
        });
      }
      cands.sort(function (x, y) { return y.hits - x.hits; });
      cands = cands.slice(0, 16);
      cands.forEach(function (c) {
        var sa = charStroke(c.a.c), sb = charStroke(c.b.c);
        var tian = sStroke + 1;
        var ren = sStroke + sa;
        var di = sa + sb + 1;
        var zong = sStroke + sa + sb;
        var wai = zong - ren + 1;
        c.ge = { tian: tian, ren: ren, di: di, zong: zong, wai: wai };
      });
    }

    // ===== 渲染 =====
    var html = '';
    html += '<div class="pp-block"><h3>八字五行与喜用神</h3><div class="pp-wx">';
    WX_ORDER.forEach(function (w) {
      var tag = (w === weak) ? '（喜用）' : (w === shengWeak ? '（生用）' : '');
      html += '<div class="wx-item wx-' + w + '"><span class="wx-name">' + w + '</span><span class="wx-bar"><i style="width:' + (cnt[w] * 20) + '%"></i></span><span class="wx-num">' + cnt[w] + tag + '</span></div>';
    });
    html += '</div>';
    html += '<p class="pp-note">日主（日干）：<b>' + dayGan + '</b>（' + dayWx + '）。五行最弱为 <b>' + weak + '</b>，取名宜补 <b>' + weak + '</b>' + (shengWeak !== weak ? ' 并辅 <b>' + shengWeak + '</b>（生' + weak + '之五行）' : '') + '，以达中和平衡。</p>';
    html += '</div>';

    var lenLabel = (nameLen === '1') ? '单名' : (specCharRaw ? '双名（指定字「' + (specMode === 'middle' ? '中间' : '尾字') + '：' + specChar + '」）' : '双名');
    html += '<div class="pp-block"><h3>名字候选（' + (sex === '男' ? '男' : '女') + '宝 · 姓「' + sName + '」 · ' + lenLabel + '）</h3>';
    if (!cands.length) {
      html += '<p class="pp-note">当前字库与禁忌条件下未生成候选，请减少禁忌用字或调整指定字试试。</p>';
    } else {
      html += '<div class="bb-grid">';
      cands.forEach(function (c) {
        var geArr = [
          ['天格', c.ge.tian], ['人格', c.ge.ren], ['地格', c.ge.di],
          ['总格', c.ge.zong], ['外格', c.ge.wai]
        ];
        var geHtml = geArr.map(function (gg) {
          var wi = wuXingOfStroke(gg[1]);
          var si = shuInfo(gg[1]);
          var cls = si.code === '凶' ? 'bad' : (si.code === '大吉' ? 'best' : 'good');
          return '<span class="bb-g wx-' + wi + '">' + gg[0] + gg[1] + '<i class="' + cls + '">' + si.code + '</i></span>';
        }).join('');
        var wxLine;
        if (nameLen === '1') {
          wxLine = '<span class="wx-' + c.a.wx + '">' + c.a.wx + '</span>';
        } else if (specCharRaw && specMode === 'middle') {
          wxLine = '<span class="wx-' + c.a.wx + '">' + c.a.wx + '</span>（指定）＋<span class="wx-' + c.b.wx + '">' + c.b.wx + '</span>';
        } else if (specCharRaw && specMode === 'tail') {
          wxLine = '<span class="wx-' + c.a.wx + '">' + c.a.wx + '</span>＋<span class="wx-' + c.b.wx + '">' + c.b.wx + '</span>（指定）';
        } else {
          wxLine = '<span class="wx-' + c.a.wx + '">' + c.a.wx + '</span>＋<span class="wx-' + c.b.wx + '">' + c.b.wx + '</span>';
        }
        var meanLine = (nameLen === '1')
          ? c.a.mean
          : (c.a.mean + '；' + c.b.mean);
        html += '<div class="bb-item">' +
          '<div class="bb-name">' + c.name + '</div>' +
          '<div class="bb-wx">' + wxLine + '</div>' +
          '<div class="bb-mean">' + meanLine + '</div>' +
          '<div class="bb-ge">' + geHtml + '</div>' +
          '</div>';
      });
      html += '</div>';
    }
    html += '<p class="pp-note" style="font-style:italic">五格按「单姓' + (nameLen === '1' ? '·单名' : '') + '」规则测算；字库寓意为通用文化释义，音律与重名率请结合实际考量。仅供娱乐参考。</p>';
    html += '</div>';
    html += '<p class="hint" style="margin-top:10px">以上依八字五行与姓名学五格推算，纯属文化娱乐，请相信科学、不迷信。</p>';

    var res = rootEl.querySelector('#bb-result');
    res.innerHTML = html;
    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  window.BabyNameModule = { onEnter: onEnter };
})();
