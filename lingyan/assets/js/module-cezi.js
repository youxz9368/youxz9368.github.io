/* 模块7：测字占卜 —— 古典测字以「拆字 + 五行 + 八法」析象。
   方法：观梅、装头、接脚、穿心、包笼、破解、添笔、减笔。仅供文化娱乐参考，请相信科学、不迷信。 */
(function () {
  'use strict';

  // 笔画数理（按笔画个位数 1-10 取象，源自传统姓名81数理之简化，仅供娱乐）
  var SHU = {
    1: ['大吉', '太极之首，万物始生，进取有成'],
    2: ['凶', '混沌未开，进退保守，宜静守'],
    3: ['吉', '旭日东升，才华显露，名利可期'],
    4: ['凶', '破败凶变，艰难多阻，须防反复'],
    5: ['吉', '福寿圆满，安稳余庆，福泽绵长'],
    6: ['吉', '安稳余庆，官贵相助，家道兴隆'],
    7: ['吉', '刚毅果断，勇往直前，权威显达'],
    8: ['吉', '意志坚刚，锲而不舍，资性英敏'],
    9: ['凶', '破舟进海，穷乏困苦，波澜起伏'],
    0: ['凶', '万事终局，悲苦无穷，宜守不宜攻']
  };

  // 部首 → 五行 + 意象（用于拆字析象，覆盖常用偏旁与变体）
  var RADICALS = [
    ['木', '木', '生机仁厚，主生长、文书、仁德'],
    ['艹', '木', '草木蔓发，主柔韧、繁衍、生机'],
    ['禾', '木', '禾稼登场，主收获、丰收、食禄'],
    ['竹', '木', '竹有节操，主清高、名节、文采'],
    ['火', '火', '光明炎上，主显达、急速、声名'],
    ['灬', '火', '烈火烹炼，主成就亦主燥急'],
    ['日', '火', '日耀中天，主光明、显扬、贵气'],
    ['忄', '火', '心性所系，主情思、急躁、明察'],
    ['心', '火', '心火内明，主思虑、智慧、情衷'],
    ['土', '土', '厚重载物，主安稳、田宅、积累'],
    ['士', '土', '士者任事，主德行、职守、稳重'],
    ['石', '土', '石坚不移，主刚固、阻滞亦主坚'],
    ['山', '土', '山岳镇守，主稳重、靠山、静守'],
    ['田', '土', '田产丰盈，主安居、产业、厚实'],
    ['金', '金', '刚锐决断，主权柄、财利、刑伤'],
    ['钅', '金', '金器成用，主锋锐、宝贵、决断'],
    ['刀', '金', '刀兵决断，主刚烈、裁断、刑伤'],
    ['刂', '金', '双刃分明，主果决、裁断之事'],
    ['戈', '金', '干戈兵事，主争斗、权柄、武事'],
    ['王', '金', '玉之温润，主贵重、才德、清贵'],
    ['水', '水', '智润流通，主智慧、口才、变通'],
    ['氵', '水', '水流不滞，主奔波、智慧、润下'],
    ['雨', '水', '雨泽普施，主恩泽、愁润、天恩'],
    ['子', '水', '子孙绵延，主嗣续、智慧、根基'],
    ['人', '金', '人者仁也，主伦常、朋助、人缘'],
    ['亻', '金', '立人之旁，主倚靠、同伴、相助'],
    ['口', '木', '口为言语，主口才、是非、饮食'],
    ['女', '水', '阴柔之象，主情感、姻缘、内助'],
    ['言', '金', '言为心声，主承诺、口舌、声名'],
    ['心', '火', '已列为火'],
    ['辶', '火', '走之远行，主动迁、出路、远谋'],
    ['彳', '木', '行步之象，主行动、历程、往来'],
    ['宀', '土', '家宅安宁，主安居、庇护、家运'],
    ['门', '木', '门户开阖，主出入、机遇、门第'],
    ['目', '木', '目能观远，主见识、观察、明察'],
    ['耳', '木', '耳听八方，主闻见、聪敏、听受'],
    ['糸', '木', '丝缕细微，主缠绕、细致、情牵'],
    ['贝', '金', '贝者财货，主资财、交易、利市'],
    ['车', '金', '车马行远，主行进、功名、运载'],
    ['舟', '水', '舟行水中，主顺流、迁转、远渡'],
    ['马', '火', '马驰千里，主奔忙、远行、显达'],
    ['牛', '土', '牛性勤恳，主耐劳、踏实、耕耘'],
    ['羊', '土', '羊主祥和，主善良、和美、祭祀'],
    ['鱼', '水', '鱼水之欢，主财利、富余、化龙'],
    ['鸟', '火', '鸟飞鸣信，主音信、高飞、声名'],
    ['虫', '土', '虫微之物，主细微、隐伏、滋生'],
    ['风', '木', '风行八面，主动荡、消息、传播'],
    ['页', '金', '页为首面，主声名、容止、头部']
  ];
  // 去重（心重复）
  var seen = {}; RADICALS = RADICALS.filter(function (r) { if (seen[r[0]]) return false; seen[r[0]] = 1; return true; });

  function wuXingOfStroke(n) {
    n = ((n % 10) + 10) % 10;
    return (n === 1 || n === 2) ? '木' : (n === 3 || n === 4) ? '火' : (n === 5 || n === 6) ? '土' : (n === 7 || n === 8) ? '金' : '水';
  }
  function shuInfo(n) {
    n = ((n % 10) + 10) % 10; if (n === 0) n = 10;
    return SHU[n] || ['', ''];
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  function detectRadicals(ch) {
    var found = [];
    RADICALS.forEach(function (r) {
      if (ch.indexOf(r[0]) >= 0) found.push({ radical: r[0], wx: r[1], mean: r[2] });
    });
    // 优先保留较长的部首（更具体）
    found.sort(function (a, b) { return b.radical.length - a.radical.length; });
    return found;
  }

  var WX_DUAN = {
    '木': '木主生发、仁厚。占得此字，多应生长、文书、仁德之事；问谋望，木旺东方春令，宜进取、施为。',
    '火': '火主光明、急速。占得此字，多应显达、声名，然性急易变；问事多应速、应显，忌拖延。',
    '土': '土主稳重、厚载。占得此字，多应安稳、田宅、积累；问事主迟滞而终成，宜守成。',
    '金': '金主刚锐、决断。占得此字，多应权柄、财利，亦主刑伤；问事多应果决、裁断。',
    '水': '水主智润、流动。占得此字，多应智慧、口才、奔波；问事多应变通、流转，忌固守。'
  };

  function calc() {
    var raw = (charEl.value || '').trim();
    if (!raw) { alert('请先写一个汉字'); return; }
    var ch = raw.charAt(0);
    var strokes = 0;
    if (typeof cnchar !== 'undefined') { try { strokes = cnchar.stroke(ch); } catch (e) { strokes = 0; } }
    var wx = wuXingOfStroke(strokes || 1);
    var si = shuInfo(strokes || 1);
    var rads = detectRadicals(ch);

    var html = '<div class="pp-block"><h3>拆字分析 · 「' + escapeHtml(ch) + '」</h3>';
    html += '<div class="cz-charbox"><span class="cz-big">' + escapeHtml(ch) + '</span>' +
      '<div class="cz-meta"><span>笔画 <b>' + strokes + '</b> 画</span>' +
      '<span>五行 <b class="wx-' + wx + '">' + wx + '</b></span>' +
      '<span class="cz-shu ' + (si[0] === '凶' ? 'bad' : 'good') + '">数理 ' + si[0] + '</span></div></div>';
    html += '<p class="pp-note">' + si[1] + '（笔画数理，供娱乐参考）</p>';

    if (rads.length) {
      html += '<div class="cz-rads"><div class="cz-rads-t">拆字·部首意象</div>';
      rads.forEach(function (r) {
        html += '<div class="cz-rad"><span class="cz-rad-x">' + r.radical + '</span>' +
          '<span class="cz-rad-wx wx-' + r.wx + '">' + r.wx + '</span>' +
          '<span class="cz-rad-m">' + r.mean + '</span></div>';
      });
      html += '</div>';
    } else {
      html += '<p class="pp-note">未匹配到常用部首，可据字形整体会意取象。</p>';
    }

    html += '<div class="pp-block" style="margin-top:12px"><h3>一字断语</h3>';
    html += '<p class="pp-note" style="font-size:14px;line-height:1.9">' + WX_DUAN[wx] + '</p>';
    html += '<p class="pp-note">会意：此字五行属' + wx + '，' + (rads.length ? ('带「' + rads[0].radical + '」之象，' + rads[0].mean + '。') : '') + '占者宜结合自身所问事类，以五行生克、字形离合参断。</p>';
    html += '</div>';

    html += '<div class="pp-block" style="margin-top:12px"><h3>古典测字八法</h3><div class="cz-bafa">';
    var bafa = [
      ['观梅', '以物象、时令、声音起卦，如「梅花易数」观花而占，触机即断。'],
      ['装头', '于字上加笔成新字，如「山」上加「人」为「仙」，取升格之象。'],
      ['接脚', '于字下添笔，如「田」下接「心」为「思」，观所生之意。'],
      ['穿心', '于字中拆穿，取中间一笔或部件另解，如「月」穿心见「二」。'],
      ['包笼', '以字外包内，观外裹内藏之象，如「囚」包「人」主困。'],
      ['破解', '将字拆散重组，离而复合，观其散复之机。'],
      ['添笔', '凭所问临时添笔，如问雨添「水」、问讼添「言」，活变取象。'],
      ['减笔', '减损笔画另成新字，如「哭」去「口」为「犬」，观所减之累。']
    ];
    bafa.forEach(function (b) {
      html += '<div class="cz-bf"><b>' + b[0] + '</b>：' + b[1] + '</div>';
    });
    html += '</div><p class="pp-note">古典测字重「机」与「象」，同一字因人因事而异解，以上八法为析象之常径。</p></div>';

    html += '<p class="hint" style="margin-top:10px">测字为传统民俗文字游戏，纯属娱乐，请相信科学、不迷信。</p>';

    resultEl.innerHTML = html;
    resultEl.hidden = false;
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  var charEl = document.getElementById('cz-char');
  var resultEl = document.getElementById('cz-result');
  var btnGo = document.getElementById('cz-go');
  if (btnGo) btnGo.addEventListener('click', calc);

  window.CeziModule = { onEnter: function () { resultEl.hidden = true; } };
})();
