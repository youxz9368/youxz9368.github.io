/* 模块：罗盘说明
 * A. 使用方法   B. 操作注意事项说明   C. 如何选择适合的罗盘
 * D. 罗盘构造与十九圈详解   E. 64卦完整说明（64卦图 + 释义）
 * 纯属传统文化娱乐参考，请相信科学、不迷信。
 */
(function () {
  'use strict';

  // 复用首页加载的全局《周易》六十四卦数据；缺失时降级为空（理论上不会）
  var GLOBAL_HEX = (typeof HEXAGRAM_DATA !== 'undefined') ? HEXAGRAM_DATA : [];

  // 八卦三爻（自下而上）：1=阳(实) 0=阴(断)
  var TRIGRAMS = {
    '乾': [1, 1, 1], '兑': [1, 1, 0], '离': [1, 0, 1], '震': [1, 0, 0],
    '巽': [0, 1, 1], '坎': [0, 1, 0], '艮': [0, 0, 1], '坤': [0, 0, 0]
  };
  // 八宫方阵行/列顺序（文王序即按上卦分八宫）
  var TUB = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

  var _luMap = {};
  function ensureMap() {
    if (_luMap._ready) return;
    GLOBAL_HEX.forEach(function (h) { _luMap[h.lower + '|' + h.upper] = h; });
    _luMap._ready = true;
  }
  function hexByLU(low, up) { ensureMap(); return _luMap[low + '|' + up]; }

  // 6 爻符号 SVG（自下而上：下卦三爻 + 上卦三爻）
  function hexSymbolSVG(lower, upper) {
    var W = 60, lineH = 9, gap = 4, padY = 6, padX = 6, barW = W - padX * 2;
    var full = [
      TRIGRAMS[lower][0], TRIGRAMS[lower][1], TRIGRAMS[lower][2],
      TRIGRAMS[upper][0], TRIGRAMS[upper][1], TRIGRAMS[upper][2]
    ];
    var H = padY * 2 + 6 * lineH + 5 * gap;
    var s = '<svg class="hx-sym" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">';
    for (var i = 0; i < 6; i++) {
      var y = H - padY - (i + 1) * lineH - i * gap; // i=0 为最下爻
      if (full[i] === 1) {
        s += '<rect x="' + padX + '" y="' + y.toFixed(1) + '" width="' + barW + '" height="' + lineH + '" rx="1.5" fill="#2b2b2b"/>';
      } else {
        var half = (barW - 6) / 2;
        s += '<rect x="' + padX + '" y="' + y.toFixed(1) + '" width="' + half.toFixed(1) + '" height="' + lineH + '" rx="1.5" fill="#2b2b2b"/>';
        s += '<rect x="' + (padX + half + 6).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + half.toFixed(1) + '" height="' + lineH + '" rx="1.5" fill="#2b2b2b"/>';
      }
    }
    s += '</svg>';
    return s;
  }

  function cellHtml(h) {
    if (!h) return '<div class="hx-cell hx-empty"></div>';
    return '<div class="hx-cell" data-idx="' + h.index + '" role="button" tabindex="0">' +
      '<div class="hx-idx">' + h.index + '</div>' +
      hexSymbolSVG(h.lower, h.upper) +
      '<div class="hx-name">' + h.name + '</div></div>';
  }

  function buildGrid(mode) {
    var html = '<div class="hx-grid">';
    if (mode === 'matrix') {
      html += '<div class="hx-head"></div>';
      TUB.forEach(function (u) { html += '<div class="hx-head">' + u + '</div>'; });
      TUB.forEach(function (low) {
        html += '<div class="hx-head">' + low + '</div>';
        TUB.forEach(function (up) { html += cellHtml(hexByLU(low, up)); });
      });
    } else {
      GLOBAL_HEX.forEach(function (h) { html += cellHtml(h); });
    }
    html += '</div>';
    return html;
  }

  function showDetail(h) {
    var d = document.getElementById('hx-detail');
    if (!d) return;
    if (!h) { d.innerHTML = '<p class="hint">点选上方任一卦象，查看卦名、卦辞与释义。</p>'; return; }
    var yaoHtml = (h.yao || []).map(function (y) {
      return '<li><b>' + y.yao + '</b> ' + y.text + '</li>';
    }).join('');
    d.innerHTML =
      '<div class="hx-d-head"><div class="hx-d-name">第' + h.index + '卦 · ' + h.name + '</div>' +
      '<div class="hx-d-sub">上' + h.upper + ' 下' + h.lower + '</div></div>' +
      '<div class="hx-d-symwrap">' + hexSymbolSVG(h.lower, h.upper) + '</div>' +
      '<div class="hx-d-sec"><span class="hx-d-label">卦辞</span>' + (h.guaCi || '') + '</div>' +
      '<div class="hx-d-sec"><span class="hx-d-label">释义</span>' + (h.baihua || '') + '</div>' +
      '<div class="hx-d-sec"><span class="hx-d-label">六爻</span><ul class="hx-yao">' + yaoHtml + '</ul></div>';
  }

  function render64() {
    return '<p class="hint">《周易》六十四卦，相传周文王演定后天之序。下为六十四卦图，点选任一卦象可查看卦名、上卦下卦、卦辞与本 App 白话释义。纯属传统文化娱乐参考。</p>' +
      '<div class="hx-toolbar">' +
        '<button class="hx-toggle active" data-mode="list">文王序</button>' +
        '<button class="hx-toggle" data-mode="matrix">八宫方阵</button>' +
      '</div>' +
      '<div id="hx-grid"></div>' +
      '<div id="hx-detail"><p class="hint">点选上方任一卦象，查看卦名、卦辞与释义。</p></div>';
  }

  function after64(bodyEl) {
    var grid = bodyEl.querySelector('#hx-grid');
    var toggles = bodyEl.querySelectorAll('.hx-toggle');
    if (grid) grid.innerHTML = buildGrid('list');
    function attachCells(g) {
      if (!g) return;
      g.querySelectorAll('.hx-cell').forEach(function (c) {
        var fn = function () {
          var idx = +c.getAttribute('data-idx');
          var h = null;
          for (var i = 0; i < GLOBAL_HEX.length; i++) { if (GLOBAL_HEX[i].index === idx) { h = GLOBAL_HEX[i]; break; } }
          showDetail(h);
        };
        c.addEventListener('click', fn);
        c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(); } });
      });
    }
    toggles.forEach(function (t) {
      t.addEventListener('click', function () {
        toggles.forEach(function (x) { x.classList.remove('active'); });
        t.classList.add('active');
        if (grid) grid.innerHTML = buildGrid(t.getAttribute('data-mode'));
        attachCells(grid);
      });
    });
    attachCells(grid);
    showDetail(null);
  }

  var SECTIONS = [
    {
      label: 'A. 使用方法',
      items: [
        { title: '1. 校准指针', content: '首次使用点「🧭 开启方向传感器」，让天池磁针自动指向地磁正北；若设备无传感器，可用「指针方位」滑块手动设定。' },
        { title: '2. 持稳外盘', content: '双手平托外盘（方形底座），使方盘边线与所测建筑、山体或路面的边线尽量平行对齐。' },
        { title: '3. 旋转内盘', content: '在盘面上按住拖动，旋转内盘，使天池磁针（红头）与内盘上的「子午线」重合，即完成定向。' },
        { title: '4. 读取坐向', content: '磁针所指为「坐」，正对面为「向」。本 App 会实时显示「坐 X 向 Y」，对应二十四山中的两山。' },
        { title: '5. 切换盘面', content: '点「综合 / 三合 / 三元 / 玄空」可查看不同盘面：综合19圈最全；三合三色三针；三元九运；玄空飞星。' },
        { title: '6. 取用信息', content: '结合所求之事，查阅对应圈层文字说明。本 App 为电子罗盘模拟，仅供传统文化了解与娱乐参考。' }
      ]
    },
    {
      label: 'B. 操作注意事项说明',
      items: [
        { title: '远离磁干扰', content: '罗盘附近勿放手机、钥匙、电器、磁铁、钢筋与金属家具，否则磁针偏摆、读数失真。' },
        { title: '盘面要水平', content: '持盘要平、要稳，倾斜会让磁针卡滞或回零变慢，影响坐向判断。' },
        { title: '垂直读数', content: '视线尽量垂直盘面读取，避免视差导致读错山向（差一格即差 15°）。' },
        { title: '环境与天气', content: '雷暴、强磁场、高压线附近不宜测向；阴天无妨。避免在车内（金属外壳）直接使用。' },
        { title: '隐私与边界', content: '勿擅入他人宅院、勿在敏感或涉密场所测向，尊重他人隐私与产权。' },
        { title: '电子模拟声明', content: '本 App 罗盘为电子模拟，娱乐参考，不替代专业勘测仪器与执业风水师现场判读。' }
      ]
    },
    {
      label: 'C. 如何选择适合的罗盘',
      items: [
        { title: '综合罗盘', content: '传统19圈（天池+18层），圈层最全，适合初学者与传统风水知识总览，一盘通览。' },
        { title: '三合罗盘', content: '重峦头形势、三合局与十二长生，三色标注地盘正针/红、人盘中针/绿、天盘缝针/蓝，适合杨公风水。' },
        { title: '三元罗盘', content: '重理气、三元九运与父母卦，适合三元派、玄空大卦的研习者。' },
        { title: '玄空罗盘', content: '专攻玄空飞星、洛书九宫与紫白九星，适合玄空风水使用者排盘论断。' },
        { title: '选购要点', content: '盘面正圆、字口清晰、层数标注分明、磁针灵敏且回零快；电子罗盘看传感器精度与校准方式。' },
        { title: '学习建议', content: '先熟综合盘与二十四山，再据师承与兴趣选专项盘，循序渐进，切勿急于断事。' }
      ]
    },
    {
      label: 'D. 罗盘构造与十九圈详解',
      items: [
        { title: '▎罗盘概述',
          content: '罗盘，亦被称为罗经仪，是风水探测的重要工具，被理气宗派广泛运用。' +
                   '它以盘中央的磁针为核心，外环以一系列同心圆圈构成，每一圈都蕴含着中国古人对宇宙大系统中某一层次信息的深刻理解。' +
                   '在中国古代的哲学观念中，人的气场与宇宙的气场紧密相连，和谐则吉，不和谐则凶。' +
                   '因此，他们巧妙地将宇宙中各层次的信息，诸如天上的星宿、地上的五行万物以及天干地支等元素，都精心地刻绘在罗盘之上。' +
                   '风水师通过磁针的转动，能够探寻到最适合特定人或事的方位或时间。' +
                   '尽管风水学并未直接提及"磁场"这一概念，但罗盘各圈层间所遵循的方向、方位和间隔的精妙配合，却隐含着"磁场"的深刻规律。' +
                   '以三合罗盘为例（各罗盘略有差异，但基本原理一致，主要区别在于圈层数量），它共计十九圈。' +
                   '每圈都有其特定的名称与功能，共同构成了罗盘这一深奥而精妙的探测工具。' },
        { title: '▎罗盘构造 · 天池',
          content: '罗盘主要由三个部分构成。首先是天池，也被称作海底，其核心部件是指南针。' +
                   '天池由顶针、磁针、海底线、圆柱形外盒以及玻璃盖所组成，被固定在内盘中央。' +
                   '在圆盒的底部中央，有一个尖头的顶针，而磁针的底部中央则设有一个凹孔，磁针便置放在顶针之上。' +
                   '指南针箭头所指的方位为南，另一端则指向北方。天池的底面上绘有一条红线，即海底线，其北端两侧各有一个红点，使用时需确保磁针的指北端与海底线相重合。' },
        { title: '▎罗盘构造 · 内盘',
          content: '其次是内盘，它紧邻指南针，是一个可以转动的圆盘。内盘面上刻印着许多同心的圆圈，每个圆圈代表一层，各层又被划分为不同的等份。' +
                   '格子数量因层而异，最少的一层仅分为八格，而格子最多的一层则多达三百八十四格。' +
                   '每个格子上都印有不同的字符，这些字符代表着不同的风水含义。' +
                   '罗盘的各种内容，包括风水术的各个派别的主要内容，都被精心印刻在内盘的不同盘圈（层）上，从而构成了罗盘的核心部分。' +
                   '这使得中国的罗盘成为了一部集中国术数之大成的百科全书。' +
                   '使用时需确保内盘上各圈层的内容清晰可见、准确无误，以保证测量的精确度：' +
                   '地盘二十四山的子午卯酉需与周天三百六十度的0度、180度、90度、270度精准重合；其他盘层则需依照罗盘标准进行相应设置。' +
                   '内盘的内外圆必须符合标准，放置于外盘后，间隙应适中，既不过紧也不过松，以确保灵活性与测量精度。' +
                   '内圈宜稍紧贴，以确保海底的稳固性。同时，内盘圆心应与海底同心，保持一致性。' },
        { title: '▎罗盘构造 · 外盘',
          content: '外盘为正方形框架，作为内盘的支撑与定位工具。其四边外侧中点各设一小孔，穿入红线形成天心十道，用于读取内盘盘面内容。' +
                   '天心十道必须保持相互垂直，新购罗盘在使用前需进行外盘校准。' +
                   '指南针作为测量地球磁方位角的基本工具，广泛应用于军事、航海、测绘等多个领域。' +
                   '罗盘则利用指南针的定位原理，成为测量地平方位的专用工具，在风水学中用于格龙、消砂、纳水及建筑坐向的确定。' },
        { title: '▎罗盘使用注意事项',
          content: '外盘需为标准正方形，四边无弯曲或歪斜，且内盘的圆凹应置于外盘的几何中心。' +
                   '盘面应平整且光滑，便于读取信息。' +
                   '天心十道作为读取内盘内容的指引线，其穿线孔必须精准定位于外盘四边中心。' +
                   '若罗盘配备水准泡，需确保两个水准泡的气泡均处于中心位置，以保持海底磁针与盘面的平行。' },
        { title: '▎圈1 · 天池',
          content: '天池位于罗盘中心，通常用于安置指南磁针，但也有一些罗盘使用太极图替代指南针，因此天池又被称作太极。' +
                   '其直径设计为1寸2分，象征着一年中的12个月，而深度为3分，则代表着每月的30日。' +
                   '在风水理论中，天池被视为判断两仪、分清四象、确立八卦的关键所在，因而具有经纬天地的功能。' },
        { title: '▎圈2 · 先天八卦',
          content: '先天八卦的方位布局为：乾南、坤北、离东、坎西，以及震东北、兑东南、巽西南和艮西北，每两个方位之间相隔45度，这种布局体现了四正与四维的观念。' +
                   '此外，也有罗盘采用后天八卦的方位，即离南、坎北、兑西、震东，再加上艮东北、巽东南、乾西北和坤西南，这种布局则与地支相配，用于推断来龙与座山的吉凶。' },
        { title: '▎圈3 · 洛书方位',
          content: '洛书方位遵循"戴九履一，左三右七，二四为肩，六八为足"的规则，形成九宫格局。' +
                   '这种布局使得人的出生时辰与八卦九宫相互对应，实现了时间和空间的相互转换。' +
                   '在风水学中，洛书方位对于选择吉时具有重要意义。' },
        { title: '▎圈4 · 反伏黄泉',
          content: '反伏黄泉是指八天干（甲、乙、丙、丁、庚、辛、壬、癸）中的墓杀位置。' +
                   '其口诀为："庚丁坤上是黄泉，乙丙多防巽水先。甲癸向中忧见艮，辛壬水路怕当乾"。' +
                   '在阳宅中遇到反伏黄泉的情况时，适宜通过筑墙进行遮挡；而阴宅则应考虑改变朝向以避免不利影响。' },
        { title: '▎圈5 · 坐山九星',
          content: '这九星包括贪狼、巨门、禄存、文曲、廉贞、武曲、破军、左辅和右弼，它们在风水理论中象征着不同的气场和能量。' +
                   '根据风水理论，清纯的气上升会形成星辰，而浊重的气下沉则会凝聚成山川，因此，这些九星在天体中形成星象，而在地球上则塑造了不同的地貌。' },
        { title: '▎圈6 · 天星',
          content: '风水学借助古代天文学的知识，从星宿中精心挑选了二十四颗星宿，并与二十四个方位相配合，从而构建出二十四天星盘。' +
                   '这些天星在风水学中有着重要的地位，被认为能够影响地气的运行和能量的分布。' },
        { title: '▎圈7 · 正针二十四山',
          content: '这一圈指的是地盘上的二十四个方位，通常用正针来表示。' +
                   '这些方位在风水学中有着特殊的意义，被认为与地气的流动和能量的聚集密切相关。' },
        { title: '▎圈8 · 二十四节气',
          content: '这一圈按照顺时针方向排列，与地盘正针二十四山中的十二地支相对应。' +
                   '二十四节气在风水学中代表着阴阳消长的规律和五运六气的变化，对于推算吉凶和选择时机具有重要意义。' },
        { title: '▎圈9 · 穿山七十二龙',
          content: '这一圈由六十甲子加上八干和四维组成，共七十二龙。' +
                   '在风水学中，穿山七十二龙主要用于确定坐穴的位置，避免各种不利因素如"大空亡"、"小空亡"和"小差错"等的影响。' },
        { title: '▎圈10 · 正针一百二十分金',
          content: '这一圈是在地盘正针二十四山之下设立的，每山各设五位，共计一百二十位。' +
                   '其排列方式是将六十甲子按照地支属性不同分别排入相应的地支中，这种精细的划分对于推算吉凶和选择合适的时间具有重要意义。' },
        { title: '▎圈11 · 中针二十四山',
          content: '与正针二十四山相比，中针二十四山沿逆时针方向旋转了半格，即七又二分之一度。' +
                   '这种微妙的调整使得中针的子午线能够与正针的壬子、丙午之间相对应，从而提供了另一种观察和理解地理气场的方式。' },
        { title: '▎圈12 · 透地六十龙',
          content: '这一圈首先将正盘正针二十四山的八干与四维的位置兼并到相邻的十二个地支名下；' +
                   '然后再把六十花甲依次排列到扩张后的十二地支之下，每支各排五位并顺排。' +
                   '这种复杂的排列方式在风水学中有着深刻的意义，被认为能够揭示地气的运行规律和能量的分布情况。' },
        { title: '▎圈13 · 透地奇门',
          content: '这一圈以十天干中的乙、丙、丁为三奇，以戊、己、庚、辛、壬、癸为六仪；' +
                   '三奇和六仪分别置入九宫之中，以甲统领并据此推算吉凶。' +
                   '这种奇门遁甲的方法在风水学中有着广泛的应用，被认为能够帮助人们趋吉避凶并选择合适的时间和地点进行活动。' },
        { title: '▎圈14 · 缝针二十四山',
          content: '缝针二十四山相较于正针二十四山，旋转了一格（15度），用于天盘方位的测定，常与正针、中针配合使用，构成三盘三针的体系。' },
        { title: '▎圈15 · 缝针一百二十分金',
          content: '在天盘二十四山之下，每山同样设有五位，共计一百二十位，其排列规则与正针一百二十分金相一致。' +
                   '然而，不同于正针的是，缝针的每山五位中，五位被视为不可取，而四位则可用于压煞。' +
                   '这一特殊设定旨在助力人们趋吉避凶，选择更有利的时机和方位。' },
        { title: '▎圈16 · 盈缩六十龙',
          content: '由于天体星座的实际分布与罗盘上的二十四天星排列并不完全吻合，近代风水师们为了更贴近实际的天象，依据二十八宿所占星度的宽狭，对透地六十龙进行了盈缩调整，从而发明了盈缩六十龙。' +
                   '这种调整主要用于格龙乘气，尽管其在实际应用中可能并不广泛，但仍然在某些罗盘中得以保留。' },
        { title: '▎圈17 · 宿度五行',
          content: '宿度，即浑天星度，与一年的365天相对应。' +
                   '宿度五行则是将浑天星度与五行相结合，其分位与盈缩六十龙完全一致。' +
                   '这一圈主要用于配合盈缩六十龙，确保来水度数不克制坐下度数，坐下度数不克制来龙度数，以及来水度数不克制来龙的纳音五行。' },
        { title: '▎圈18 · 天度吉凶',
          content: '这一圈将周天度数按照金、木、水、火、土的顺序循环配上五行。' +
                   '通过分析分度五行与所在星宿五行的生克关系，可以确定每个天度的吉凶属性。' },
        { title: '▎圈19 · 周天宿度',
          content: '这一圈详细排列了周天的二十八宿及其每宿所占的分度，为风水师提供了全面的天象参考。' +
                   '二十八宿按四象分为青龙（木）、白虎（金）、朱雀（火）、玄武（水）四组，每组七宿。' },
        { title: '▎罗盘校准方法',
          content: '①使用标准的量角器测量外盘的四个外角，确保它们都是九十度，且误差不超过1度。如果发现误差，需要进行打磨调整。' +
                   '②检查天心十道线是否与四条外边平行。如果不平行，需要适当调整穿线孔的位置。同时，也要检查四个穿线孔是否位于四个外边的中点，如果有偏离，应重新开孔。' +
                   '③确保天心十字线的交点准确对准磁针顶针的顶点。这是罗盘校准的关键步骤之一。' +
                   '④最后，用天心十道的四个端点对准内盘的周天0度，检查其余三个端点是否分别准确指向90度、180度和270度。如果有误差，应详细查明原因并适当调整穿线孔位置至合格为止。' }
      ]
    },
    {
      label: 'E. 64卦完整说明',
      build: render64,
      after: after64
    },
    {
      label: 'F. 子午线对齐方法',
      items: [
        { title: '▎简单回答',
          content: '并非所有罗盘都是子午线对齐 0° 和 180°，这取决于罗盘的类型和用途。' +
                   '下面按"类型差异 / 偏差来源 / 实操步骤 / 常见误区"四层展开说明。' },
        { title: '▎一、不同类型的罗盘差异',
          content: '传统风水罗盘通常不完全是以子午线（0°-180°）对齐的，原因如下：' },
        { title: '① 磁北与真北之分',
          content: '<table class="lp-help-tbl"><tr><th>类型</th><th>对齐方式</th><th>说明</th></tr>' +
                   '<tr><td>磁北罗盘</td><td>子午线对齐磁北（0°-180°）</td><td>最常见，以磁针指向为准</td></tr>' +
                   '<tr><td>真北罗盘</td><td>子午线需根据当地磁偏角校正</td><td>地理北极，需加减磁偏角</td></tr></table>' },
        { title: '② 缝针、中针、正针三盘',
          content: '传统罗盘通常有三盘：<br>' +
                   '<table class="lp-help-tbl"><tr><th>盘名</th><th>子午线位置</th><th>用途</th></tr>' +
                   '<tr><td>正针（地盘）</td><td>0°-180°（磁北）</td><td>测山向、立向</td></tr>' +
                   '<tr><td>中针（人盘）</td><td>子午线偏 7.5°（逆时针）</td><td>消砂（看山形吉凶）</td></tr>' +
                   '<tr><td>缝针（天盘）</td><td>子午线偏 7.5°（顺时针）</td><td>纳水（看水流吉凶）</td></tr></table>' +
                   '📌 关键点：中针和缝针的子午线并不是 0°-180°，而是分别偏移了 7.5°！' },
        { title: '③ 三元罗盘 vs 三合罗盘',
          content: '<table class="lp-help-tbl"><tr><th>罗盘类型</th><th>子午线对齐</th><th>特点</th></tr>' +
                   '<tr><td>三元盘</td><td>以 64 卦、384 爻分度，子午线对齐 0°-180°</td><td>蒋大鸿所传，重卦气</td></tr>' +
                   '<tr><td>三合盘</td><td>正针子午 0°-180°，缝针、中针偏移</td><td>杨公所传，重龙水配合</td></tr>' +
                   '<tr><td>综合盘</td><td>三元三合合一，正针 0°-180°</td><td>现代常用</td></tr></table>' },
        { title: '④ 现代地质罗盘 / 指南针',
          content: '<table class="lp-help-tbl"><tr><th>类型</th><th>子午线对齐</th><th>说明</th></tr>' +
                   '<tr><td>地质罗盘</td><td>0°-360°，N 在 0°/360°</td><td>测方位角</td></tr>' +
                   '<tr><td>军用罗盘</td><td>密位制（6400 密位）</td><td>非度数制</td></tr>' +
                   '<tr><td>手机电子罗盘</td><td>真北/磁北可选</td><td>依赖 GPS 校准</td></tr></table>' },
        { title: '▎二、为什么会有偏差？',
          content: '决定罗盘子午线对齐方式的，主要是"磁偏角"和"流派取舍"两个因素。' },
        { title: '① 磁偏角（最关键的因素）',
          content: '真北（地理北极）≠ 磁北（地磁北极），磁偏角 = 真北 − 磁北。<br>' +
                   '中国各地磁偏角大致范围：<br>' +
                   '· 东北地区：偏西 8°~11°<br>' +
                   '· 华北地区：偏西 4°~6°<br>' +
                   '· 华南地区：偏西 0°~3°<br>' +
                   '· 新疆地区：偏东 0°~4°<br>' +
                   '举例：北京磁偏角约偏西 5°50′，如果罗盘针指 0°（磁北），真北实际在 355° 左右，' +
                   '所以子午线若要求真北对齐，则需校正。' },
        { title: '② 风水流派差异',
          content: '<table class="lp-help-tbl"><tr><th>流派</th><th>子午线用法</th><th>说明</th></tr>' +
                   '<tr><td>杨公三合</td><td>正针磁北，缝针中针偏移</td><td>三盘并用</td></tr>' +
                   '<tr><td>蒋公三元</td><td>正针磁北为主</td><td>重 64 卦</td></tr>' +
                   '<tr><td>玄空飞星</td><td>正针磁北</td><td>重元运</td></tr>' +
                   '<tr><td>八宅</td><td>正针磁北</td><td>重大门方位</td></tr>' +
                   '<tr><td>金锁玉关</td><td>磁北为主</td><td>重砂水</td></tr></table>' },
        { title: '▎三、实际操作中的注意事项',
          content: '测向结果准不准，离不开规范操作。三步准备 + 四步对齐 + 五条避坑，分述如下。' },
        { title: '① 罗盘使用前必须校正',
          content: '✅ 检查磁针是否灵敏<br>✅ 远离铁器、电器、钢筋<br>✅ 确认当地磁偏角<br>✅ 如需真北，则加减磁偏角' },
        { title: '② 子午线对齐步骤',
          content: '第一步：放平罗盘，使天池（指南针）水平<br>' +
                   '第二步：旋转内盘，使磁针与子午线（红线）完全重合<br>' +
                   '第三步：此时子午线（0°-180°）即为磁北方向<br>' +
                   '第四步：如需真北，再根据磁偏角微调' },
        { title: '③ 常见误区',
          content: '<table class="lp-help-tbl"><tr><th>误区</th><th>正确做法</th></tr>' +
                   '<tr><td>认为所有罗盘子午线都是 0°-180°</td><td>中针、缝针偏移 7.5°</td></tr>' +
                   '<tr><td>忽略磁偏角</td><td>需根据当地磁偏角校正</td></tr>' +
                   '<tr><td>在钢筋水泥房内测</td><td>应到室外空旷处</td></tr>' +
                   '<tr><td>罗盘靠近手机</td><td>电子设备会干扰磁针</td></tr></table>' },
        { title: '▎四、总结',
          content: '· 传统风水罗盘的<b>正针（地盘）</b>：子午线对齐磁北 0°-180°（但不一定是真北）。<br>' +
                   '· <b>中针（人盘）</b>：子午线偏 7.5°（逆时针）。<br>' +
                   '· <b>缝针（天盘）</b>：子午线偏 7.5°（顺时针）。<br>' +
                   '· <b>真北对齐</b>：需根据当地磁偏角校正。<br><br>' +
                   '📌 所以，不能一概而论说所有罗盘都是子午线对齐 0° 和 180°，要看用的是哪一盘、以及是磁北还是真北。' }
      ]
    }
  ];

  function itemsHtml(items) {
    if (!items || !items.length) return '<p class="hint">暂无内容</p>';
    return items.map(function (it) {
      return '<div class="mn-item"><div class="mn-title">' + it.title + '</div>' +
             '<div class="mn-content">' + it.content + '</div></div>';
    }).join('');
  }

  function buildUI(root) {
    root.innerHTML =
      '<div class="tabs" id="lphelp-tabs">' + SECTIONS.map(function (s, i) {
        return '<button class="tab-btn' + (i === 0 ? ' active' : '') + '" data-i="' + i + '">' + s.label + '</button>';
      }).join('') + '</div>' +
      '<div class="tab-body" id="lphelp-body"></div>' +
      '<p class="hint">本栏目为传统罗盘文化科普，仅供娱乐参考，请相信科学、不迷信。</p>';

    var tabsEl = root.querySelector('#lphelp-tabs');
    var bodyEl = root.querySelector('#lphelp-body');

    function show(i) {
      tabsEl.querySelectorAll('.tab-btn').forEach(function (b, bi) {
        b.classList.toggle('active', bi === i);
      });
      var sec = SECTIONS[i];
      if (sec.build) {
        bodyEl.innerHTML = sec.build();
        if (sec.after) sec.after(bodyEl);
      } else {
        bodyEl.innerHTML = itemsHtml(sec.items);
      }
    }
    tabsEl.querySelectorAll('.tab-btn').forEach(function (b) {
      b.addEventListener('click', function () { show(+b.getAttribute('data-i')); });
    });
    show(0);
  }

  window.LuopanHelpModule = {
    onEnter: function () {
      var root = document.getElementById('lphelp-wrap');
      if (root) buildUI(root);
    }
  };
})();
