/* 模块：男女婚配择日（克择讲义推算）
 * 依赖：lunar.js（Solar/Lunar）、lib/date-picker.js（LYDatePicker）
 * 结构：男女双方姓名+生辰（公历/农历）+性别；服务声明/隐私条款勾选后方可测算；
 *       合婚（生肖合冲刑害三合 + 五行互补）+ 推荐婚期（建除十二神 + 生肖冲煞 + 朔望）+ 预计何时结婚。
 */
(function () {
  'use strict';

  // ===== 协议条款原始文本（左右两栏展示，由 fmtAgreement 转为 HTML）=====
  var USER_AGREEMENT_RAW = `用户服务协议（付费版）
**《【灵验APP】用户服务协议》**
**最近更新日期：【202608】**
一、协议接受
欢迎使用【灵验APP】（以下简称"本应用"）。您下载、安装、注册、付费或开始使用本应用，即表示您已阅读、理解并同意本协议。若您不同意本协议，请立即停止使用。
二、服务说明
本应用提供【婚配择日 / 姓名分析 / 宝宝取名 / 文化参考】等相关功能。
本应用按"现状"提供，不保证结果绝对准确；
我们可能在不影响您主要使用的前提下优化或调整功能；
部分高级功能需付费或通过虚拟货币解锁。
三、注册与用户资料
1. 您需提供**姓名（或昵称）与出生日期（含生辰）**用于核心功能计算。您保证所填信息真实、合法、有效。
2. 您的账号、密码及设备信息由您自行保管，因保管不当导致的损失由您自行承担。
3. 如您为未成年人（未满18周岁），应在监护人陪同下使用，且不得单独进行付费操作。
四、收费与支付
1. **付费模式**：本应用可能提供一次性购买、订阅（包月/包年）、虚拟货币充值等方式。
2. **价格展示**：价格以应用内页面、应用商店或官网展示为准，可能因活动、地区、币种不同而存在差异。
3. **支付流程**：您通过应用内支付、第三方支付渠道（如微信支付、支付宝、Apple/Google/HUAWEI 等应用内购买等）完成付款。
4. **我们不收集银行卡号、密码、CVV等支付敏感信息**——这些由相应支付渠道按其自身规则处理。
5. **发票/收据**：如需发票，请按支付渠道或客服指引申请。
五、退款规则
情形	处理方式
付款成功但服务未交付（系统故障）	可申请全额退款
数字内容/计算结果已交付使用	原则上不支持无理由退款
重复扣款、明显技术错误	核实后全额退款

具体以您下单时页面提示及支付渠道规则为准。申请退款请联系【客服】QQ：6987581【邮箱：6987581@qq.com】。
六、数字内容交付说明
根据《网络购买商品七日无理由退货暂行办法》相关规定，**在线下载或已交付的数字内容，一经使用不支持无理由退货**。您在付费前请确认需求。
七、用户行为规范
您在使用本应用时不得：
1. 用于违法违规活动；
2. 传播淫秽、暴力、赌博、侵权、诽谤等内容；
3. 破解、反编译、篡改本应用；
4. 利用本应用结果从事欺骗、诈骗等损害他人权益的行为。
如您违反上述规定，我们有权限制、封禁账号或终止服务，且不承担由此产生的责任。
八、知识产权
本应用及其界面、代码、文案、图标、算法、报告模板等知识产权归【夜乐玉帝】和【归工运踢桃】所有或已取得合法授权。您仅可在个人非商业用途下使用，不得二次分发、转售或商用。
九、免责声明
1. 本应用提供的婚配择日、生辰分析、姓名分析等等**仅供娱乐和文化参考，不构成任何决策、投资、医疗或法律意见**；
2. 因设备兼容、系统版本、输入信息错误、网络异常等导致的异常，由用户自行承担；
3. 用户依据本应用结果做出的行为及后果，由用户自行负责；
4. 因不可抗力、系统故障、第三方组件问题导致的损失，本应用在法律规定范围内免责。
十、服务变更与终止
我们可因业务调整、合规要求或技术原因，暂停、变更或停止部分功能，并在合理范围内提前通知。
十一、协议修改
本协议可能会不定时进行版本更新。更新后继续使用，视为您接受修订内容。
十二、适用法律与争议解决
本协议的订立、效力、解释、履行及争议解决均适用中华人民共和国法律。因本协议产生的争议，双方应友好协商；协商不成的，任何一方可向【运营主体所在地】有管辖权的人民法院提起诉讼。
十三、联系我们
如对本协议有疑问，请联系：【客服QQ：6987581】【邮箱：6987581@QQ.com】`;
  var PRIVACY_AGREEMENT_RAW = `隐私政策（付费版）
**《【灵验APP】隐私政策》**
**最近更新日期：【202608】**
一、我们的基本原则
我们遵循**合法、正当、必要、最小必要**原则处理信息。我们尽量做到：
不收集与服务无关的个人信息；
不偷偷上传用户数据；
不出售、不出租个人信息。
二、我们收集哪些信息
（一）您主动提供的信息
为提供核心功能，您需主动填写或授权：
姓名（或昵称）**：用于生成分析报告、账号识别；
出生日期 / 生辰（含年、月、日、时）**：用于婚配择日等核心计算。
⚠️ **出生日期/生辰属于敏感个人信息**，我们会采取更严格的保护措施。
如您不提供上述信息，核心功能可能无法正常使用，但不影响浏览等基础功能。
（二）账号与安全信息
注册账号（手机号/邮箱，若采用）、登录凭证；
您设置的密码（以加密形式存储，我们无法查看明文）。
（三）交易与支付信息
订单记录、购买项目、金额、时间、交易状态；
我们不直接收集银行卡号、密码、CVV，支付由微信支付、支付宝、Apple/Google 应用内购买等渠道处理。
（四）设备与运行信息
设备型号、系统版本、应用版本、崩溃日志（用于排查问题）；
网络状态、访问时间（用于服务稳定性统计）。
三、我们如何使用信息
提供婚配择日、生辰分析、姓名分析等核心功能；
完成订单、交付数字内容、处理退款；
保存您的偏好设置、历史记录；
分析崩溃原因、改进兼容性；
在您同意时，发送服务通知。
四、我们如何处理敏感个人信息
对于**出生日期/生辰**等敏感个人信息，我们的处理依据为：
1. **履行合同所必需**（用于核心计算功能）；
2. **取得您的单独授权同意**（首次填写时明确提示）；
3. **法律法规规定的其他情形**。
除上述目的外，未经您单独同意，我们不会将敏感个人信息用于其他用途。
五、我们是否共享/上传信息
**仅在以下情况共享：**
1. 获得您明确同意；
2. 法律法规、监管部门、司法机关要求；
3. 为完成支付、退款所必需的支付渠道（如微信支付、支付宝等）；
4. 为防御安全攻击、修复严重故障所必需；
5. 应用接入的第三方SDK按其自身政策处理（如有，会单独列出）。
我们不向第三方出售个人信息。除支付、退款所需的必要信息外，您的生辰等敏感信息不会提供给无关第三方。
六、数据存储与安全
数据存储在【境内服务器 / 您本人设备】；
我们采取加密、访问控制等合理措施防止数据被非法访问、泄露、篡改或丢失；
您可在应用内删除历史记录或注销账号；
注销后，我们将在合理期限内删除或匿名化处理您的个人信息，法律法规要求保留的除外。
七、支付与第三方SDK
（一）支付渠道
本应用使用【微信支付 / 支付宝 / Apple 应用内购买 / Google Play 结算】等第三方支付服务。相关支付信息处理受其各自隐私政策约束，请另行查阅：
微信支付：https://weixin.110.qq.com/
支付宝：https://www.alipay.com/
（二）第三方SDK
如本应用集成统计、客服、推送等SDK，将在此列出名称、用途及涉及的信息类型。如未集成，本项不适用。
八、您的权利
在法律允许范围内，您有权：
查阅、更正您的个人信息；
删除您的账号及历史数据；
撤回非必要的授权同意；
注销账号；
就个人信息问题联系我们。
行使上述权利可通过应用内设置或联系【客服QQ：6987581】【邮箱：6987581@QQ.com】。
九、未成年人保护
1. 本应用主要面向成年人使用。
2. **不满14周岁的未成年人**，其个人信息（含生辰）处理须取得监护人单独同意；我们建议由监护人代为操作。
3. 如您为14周岁以上未成年人，请在监护人指导下使用，并不得单独进行付费操作。
十、政策更新
我们可能更新本政策。重大变更会通过应用内提示或发布页说明。更新后继续使用，视为接受修订内容。
十一、联系我们
隐私问题或行使权利，请联系：【客服QQ：6987581】【邮箱：6987581@QQ.com】`;
  function fmtAgreement(raw) {
    return raw.split('\n').map(function (line) {
      var t = line.trim();
      if (t === '') return '';
      var m = t.match(/^\*\*(.+)\*\*$/);
      if (m && t.indexOf('《') >= 0) return '<h3 class="ag-h">' + m[1] + '</h3>';
      if (/^[一二三四五六七八九十]+、/.test(t)) return '<h4 class="ag-h">' + t + '</h4>';
      if (t.indexOf('\t') >= 0) {
        var parts = t.split('\t');
        var isHead = parts[0].indexOf('情形') >= 0;
        return '<div class="ag-row' + (isHead ? ' ag-head' : '') + '"><span>' + parts[0] + '</span><span>' + (parts[1] || '') + '</span></div>';
      }
      var inline = t.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*\*/g, '');
      return '<p>' + inline + '</p>';
    }).join('');
  }



  function ensureModal(id, title, html) {
    var m = document.getElementById(id);
    if (m) { m.querySelector('.mg-modal-body').innerHTML = html; return m; }
    m = document.createElement('div');
    m.className = 'mg-modal'; m.id = id; m.hidden = true;
    m.innerHTML = '<div class="mg-modal-mask"></div>' +
      '<div class="mg-modal-box"><div class="mg-modal-head"><span>' + title + '</span>' +
      '<button class="mg-modal-close" type="button" aria-label="关闭">×</button></div>' +
      '<div class="mg-modal-body mg-agree-body">' + html + '</div></div>';
    document.body.appendChild(m);
    m.querySelector('.mg-modal-close').addEventListener('click', function () { m.hidden = true; });
    m.querySelector('.mg-modal-mask').addEventListener('click', function () { m.hidden = true; });
    return m;
  }

  var GAN_WX = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  var ZHI_WX = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
  var WX_ORDER = ['木', '火', '土', '金', '水'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var WEEK = ['日', '一', '二', '三', '四', '五', '六'];
  var SHENGXIAO = { '子': '鼠', '丑': '牛', '寅': '虎', '卯': '兔', '辰': '龙', '巳': '蛇', '午': '马', '未': '羊', '申': '猴', '酉': '鸡', '戌': '狗', '亥': '猪' };
  var MONTH_CN = ['', '正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];

  var CHONG = { '子': '午', '午': '子', '丑': '未', '未': '丑', '寅': '申', '申': '寅', '卯': '酉', '酉': '卯', '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳' };
  var LIUHE = [['子', '丑'], ['寅', '亥'], ['卯', '戌'], ['辰', '酉'], ['巳', '申'], ['午', '未']];
  var SANHE = [['申', '子', '辰'], ['寅', '午', '戌'], ['亥', '卯', '未'], ['巳', '酉', '丑']];
  var LIUHAI = [['子', '未'], ['丑', '午'], ['寅', '巳'], ['卯', '辰'], ['申', '亥'], ['酉', '戌']];
  var JIANCHU = ['建', '除', '满', '平', '定', '执', '破', '危', '成', '收', '开', '闭'];
  var JC_JI = { '成': '宜嫁娶、开市、入学、动土', '开': '宜嫁娶、出行、求财、开市', '满': '宜嫁娶、安葬、修造、纳财', '定': '宜嫁娶、纳采、祭祀、祈福', '危': '宜嫁娶、安床、搬迁、出行', '平': '宜嫁娶、修造、平基、安床', '执': '宜嫁娶、捕捉、修造、纳财' };
  var JC_SCORE = { '成': 30, '开': 28, '满': 22, '定': 20, '危': 18, '平': 14, '执': 12 };

  function wxOf(p) { return [GAN_WX[p.charAt(0)] || '?', ZHI_WX[p.charAt(1)] || '?']; }
  function pairOf(list, a, b) { return list.some(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); }); }
  function inTri(tri, a, b) { return tri.indexOf(a) >= 0 && tri.indexOf(b) >= 0; }
  function sanheOf(z) { for (var i = 0; i < SANHE.length; i++) if (SANHE[i].indexOf(z) >= 0) return SANHE[i]; return null; }
  function zhiOfYear(y) { return ZHI[((y - 4) % 12 + 12) % 12]; }

  // 女方行嫁大利月（按生肖地支 -> 大利月地支列表）
  var DA_LI = {
    '子': ['未', '丑'], '午': ['未', '丑'],
    '丑': ['午', '子'], '未': ['午', '子'],
    '寅': ['申', '寅'], '申': ['申', '寅'],
    '卯': ['酉', '卯'], '酉': ['酉', '卯'],
    '辰': ['戌', '辰'], '戌': ['戌', '辰'],
    '巳': ['亥', '巳'], '亥': ['亥', '巳']
  };

  function baziOf(solar) {
    var lunar = solar.getLunar();
    var pillars = [lunar.getYearInGanZhi(), lunar.getMonthInGanZhi(), lunar.getDayInGanZhi(), lunar.getTimeInGanZhi()];
    var cnt = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
    pillars.forEach(function (p) { cnt[wxOf(p)[0]]++; cnt[wxOf(p)[1]]++; });
    return {
      lunar: lunar, pillars: pillars, cnt: cnt,
      shengxiaoZhi: pillars[0].charAt(1),
      dayGan: pillars[2].charAt(0), dayGanWx: GAN_WX[pillars[2].charAt(0)]
    };
  }

  var rootEl, dpMan, dpWoman;

  function personBlock(role, title, defSex) {
    defSex = defSex || '男';
    var sel = '<select class="mg-sex">' +
      '<option value="男"' + (defSex === '男' ? ' selected' : '') + '>男</option>' +
      '<option value="女"' + (defSex === '女' ? ' selected' : '') + '>女</option>' +
      '</select>';
    return '<div class="mg-card">' +
      '<div class="mg-card-title">' + title + '</div>' +
      '<div class="pp-row"><label>姓名</label><input class="mg-name" type="text" placeholder="请输入姓名" maxlength="12"></div>' +
      '<div class="pp-row"><label>性别</label>' + sel + '</div>' +
      '<div class="pp-row"><label>生辰</label><div class="mg-picker" data-role="' + role + '"></div></div>' +
      '</div>';
  }

  function onEnter() {
    rootEl = document.getElementById('marriage-wrap');
    if (!rootEl) return;
    var agreeHtml =
      '<div class="mg-agree-wrap">' +
        '<div class="mg-agree-links">' +
          '<a id="mg-view-ua">📄 查看《用户服务协议》</a>' +
          '<a id="mg-view-pa">📄 查看《隐私协议》</a>' +
        '</div>' +
        '<label class="mg-check"><input type="checkbox" id="mg-agree-ua"> 我已阅读并同意《用户服务协议》（含付费、退款、个人信息处理等条款）</label>' +
        '<label class="mg-check"><input type="checkbox" id="mg-agree-pa"> 我已阅读并同意《隐私协议》（含信息收集、敏感信息处理、第三方SDK等条款）</label>' +
      '</div>';
    rootEl.innerHTML =
      '<h2 class="view-title">男女婚配择日</h2>' +
      '<p class="hint" style="margin-top:0">输入男女双方姓名与生辰（公历或农历均可），依克择讲义推算合婚与嫁娶吉期。仅供文化娱乐参考，请相信科学、不迷信。</p>' +
      '<div class="mg-grid">' + personBlock('man', '👨 男方', '男') + personBlock('woman', '👩 女方', '女') + '</div>' +
      agreeHtml +
      '<div class="mg-actions">' +
        '<button id="mg-go" class="btn-primary" disabled>🔮 立即合婚择日</button>' +
        '<button id="mg-reset" class="btn-ghost">重置</button>' +
      '</div>' +
      '<div id="mg-result" class="mg-result" hidden></div>' +
      '<div class="mg-counter">您是第 <span class="roll" id="marriage-counter">0</span> 位进行婚配择日的使用者</div>';

    dpMan = window.LYDatePicker.build(rootEl.querySelector('[data-role="man"]'));
    dpWoman = window.LYDatePicker.build(rootEl.querySelector('[data-role="woman"]'));

    var go = rootEl.querySelector('#mg-go');
    var ua = rootEl.querySelector('#mg-agree-ua');
    var pa = rootEl.querySelector('#mg-agree-pa');
    function refreshGo() { go.disabled = !(ua.checked && pa.checked); }
    ua.addEventListener('change', refreshGo);
    pa.addEventListener('change', refreshGo);
    refreshGo();
    go.addEventListener('click', calc);
    rootEl.querySelector('#mg-reset').addEventListener('click', onEnter);
    // 协议弹窗：查看《用户服务协议》/《隐私协议》
    var uaModal = ensureModal('mg-modal-ua', '《用户服务协议》', fmtAgreement(USER_AGREEMENT_RAW));
    var paModal = ensureModal('mg-modal-pa', '《隐私协议》', fmtAgreement(PRIVACY_AGREEMENT_RAW));
    rootEl.querySelector('#mg-view-ua').addEventListener('click', function () { uaModal.hidden = false; });
    rootEl.querySelector('#mg-view-pa').addEventListener('click', function () { paModal.hidden = false; });

    // 婚配择日计数：每日自动 +100，每次进入 +1，并做滚动动画
    var mc = rootEl.querySelector('#marriage-counter');
    if (mc && window.LYCounter) {
      window.LYCounter.daily('marriageCount', 1000000, 100);
      var mval = window.LYCounter.bump('marriageCount', 1000000, 1);
      var mroll = new window.LYCounter.Rolling(mc);
      mroll.set(mval, true);
    }
  }

  function sexOf(p) { return p.querySelector('.mg-sex').value; }

  function calc() {
    var manName = (rootEl.querySelector('.mg-grid .mg-card:nth-child(1) .mg-name').value || '男方').trim() || '男方';
    var womanName = (rootEl.querySelector('.mg-grid .mg-card:nth-child(2) .mg-name').value || '女方').trim() || '女方';
    var sMan = dpMan.toSolar(dpMan.getValue());
    var sWoman = dpWoman.toSolar(dpWoman.getValue());
    if (!sMan || !sWoman) { alert('生辰日期无效，请重新选择'); return; }
    var bMan = baziOf(sMan), bWoman = baziOf(sWoman);
    var html = '';

    // ===== 合婚分析 =====
    var mz = bMan.shengxiaoZhi, wz = bWoman.shengxiaoZhi;
    var relText, relClass, score = 60;
    if (pairOf(LIUHE, mz, wz)) { relText = '六合 · 上上吉'; relClass = 'best'; score += 16; }
    else if (inTri(sanheOf(mz), mz, wz) || inTri(sanheOf(wz), mz, wz)) { relText = '三合局 · 大吉'; relClass = 'best'; score += 12; }
    else if (pairOf(LIUHAI, mz, wz)) { relText = '六害 · 中平'; relClass = 'bad'; score -= 10; }
    else if (CHONG[mz] === wz) { relText = '六冲 · 相克'; relClass = 'bad'; score -= 20; }
    else { relText = '一般相配'; relClass = 'good'; }
    // 三刑
    var xing = (mz === '寅' && wz === '巳') || (mz === '巳' && wz === '寅') || (mz === '丑' && wz === '戌') || (mz === '戌' && wz === '丑') || (mz === '子' && wz === '卯') || (mz === '卯' && wz === '子');
    if (xing) { relText += '（兼相刑）'; score -= 8; }

    // 五行互补
    var weakMan = WX_ORDER.reduce(function (a, b) { return bMan.cnt[a] <= bMan.cnt[b] ? a : b; });
    var weakWoman = WX_ORDER.reduce(function (a, b) { return bWoman.cnt[a] <= bWoman.cnt[b] ? a : b; });
    var complement = (weakMan !== weakWoman);
    if (complement) { score += 8; }
    var grade = score >= 78 ? '上吉' : (score >= 66 ? '中吉' : (score >= 50 ? '平合' : '需调和'));
    var wxHtml = '<div class="pp-wx">';
    WX_ORDER.forEach(function (w) {
      var n = bMan.cnt[w] + bWoman.cnt[w];
      wxHtml += '<div class="wx-item wx-' + w + '"><span class="wx-name">' + w + '</span><span class="wx-bar"><i style="width:' + (n * 10) + '%"></i></span><span class="wx-num">' + n + '</span></div>';
    });
    wxHtml += '</div>';

    html += '<div class="pp-block"><h3>合婚分析（' + manName + ' ♥ ' + womanName + '）</h3>';
    html += '<div class="mg-he">';
    html += '<div class="mg-he-main"><span class="mg-rel ' + relClass + '">' + relText + '</span><span class="mg-grade">综合：' + grade + '（' + score + '分）</span></div>';
    html += '<p class="pp-note">男方生肖：' + SHENGXIAO[mz] + '（' + mz + '）　女方生肖：' + SHENGXIAO[wz] + '（' + wz + '）' +
      (complement ? '　|　双方五行短板互补，较为协调' : '　|　双方五行短板相近，宜在择日与取名中补益') + '</p>';
    html += wxHtml;
    html += '<p class="pp-note">说明：六合（子丑、寅亥、卯戌、辰酉、巳申、午未）为天地阴阳相合；三合（申子辰、寅午戌、亥卯未、巳酉丑）为三气聚合；六冲（子午、丑未、寅申、卯酉、辰戌、巳亥）主相激。以上评分仅作文化参考。</p>';
    html += '</div>'; // close mg-he
    html += '</div>'; // close pp-block

    // ===== 预计何时结婚 =====
    html += '<div class="pp-block"><h3>预计何时结婚（大利年 · 大利月）</h3>';
    html += bestYearsMonths(mz, wz, bMan, bWoman);
    html += '</div>';

    // ===== 推荐婚期 =====
    html += '<div class="pp-block"><h3>近期嫁娶吉期（未来 20 个月 · 建除十二神择吉）</h3>';
    html += recommendDates(mz, wz);
    html += '</div>';

    html += '<p class="hint" style="margin-top:10px">以上依传统克择讲义（生肖合冲、建除十二神、朔望避忌）推算，纯属民俗文化娱乐，请相信科学、不迷信。</p>';

    var res = rootEl.querySelector('#mg-result');
    res.innerHTML = html;
    res.hidden = false;
    res.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bestYearsMonths(mz, wz, bMan, bWoman) {
    // 大利年：太岁地支为双方三合/六合且不冲
    var ausp = {};
    [mz, wz].forEach(function (z) {
      ausp[z] = true;
      if (CHONG[z]) ausp[CHONG[z]] = false; // 冲则排除
      if (sanheOf(z)) sanheOf(z).forEach(function (t) { ausp[t] = (ausp[t] === undefined ? true : ausp[t]); });
      LIUHE.forEach(function (p) { if (p[0] === z) ausp[p[1]] = (ausp[p[1]] === undefined ? true : ausp[p[1]]); if (p[1] === z) ausp[p[0]] = (ausp[p[0]] === undefined ? true : ausp[p[0]]); });
    });
    var now = new Date(); var curY = now.getFullYear();
    var years = [];
    for (var y = curY; y <= curY + 12 && years.length < 4; y++) {
      var z = zhiOfYear(y);
      if (ausp[z] === true) years.push({ y: y, z: z });
    }
    var yearTxt = years.length
      ? years.map(function (o) { return '<b>' + o.y + ' 年</b>（' + SHENGXIAO[o.z] + '年 · ' + o.z + '支，三合/六合大利）'; }).join('、')
      : '（近期无明确三合/六合大利年，可参考下方吉期择日）';

    // 大利月（取女方生肖）
    var dl = DA_LI[wz] || [];
    var monthTxt = dl.length
      ? dl.map(function (mm) { return MONTH_CN[ZHI.indexOf(mm)] + '月（' + mm + '支）'; }).join('、')
      : '（无标准大利月，宜结合双方八字另择）';

    return '<p class="pp-note">女方生肖 <b>' + SHENGXIAO[wz] + '</b>，行嫁大利月：' + monthTxt + '。</p>' +
      '<p class="pp-note">大利年份（太岁与双方生肖三合/六合）：' + yearTxt + '。</p>' +
      '<p class="pp-note" style="font-style:italic">提示：民间以「女命大利月」为上选，配合当年太岁三合/六合更佳；具体仍应以双方及双方家庭商议为准。</p>';
  }

  function recommendDates(mz, wz) {
    var now = new Date();
    var start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    start.setDate(start.getDate() + 1);
    var list = [];
    for (var i = 0; i < 600; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var solar = (typeof Solar !== 'undefined') ? Solar.fromYmdHms(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12, 0, 0) : null;
      if (!solar) continue;
      var lunar = solar.getLunar();
      var dayGZ = lunar.getDayInGanZhi();
      var dayBranch = dayGZ.charAt(1);
      var monthBranch = lunar.getMonthInGanZhi().charAt(1);
      var k = ZHI.indexOf(monthBranch);
      var idx = ((ZHI.indexOf(dayBranch) - k) % 12 + 12) % 12;
      var jc = JIANCHU[idx];
      if (JC_SCORE[jc] === undefined) continue;        // 建/破/收/闭 等凶日
      if (dayBranch === CHONG[mz] || dayBranch === CHONG[wz]) continue; // 冲双方生肖
      var ld = lunar.getDay(); if (ld === 1 || ld === 15) continue;     // 朔(初一)/望(十五) 忌嫁娶
      var score = JC_SCORE[jc] + ((d.getMonth() + d.getDate()) % 5);
      list.push({
        date: d, solar: solar, lunar: lunar, jc: jc, score: score,
        dayBranch: dayBranch
      });
    }
    list.sort(function (a, b) { return b.score - a.score; });
    list = list.slice(0, 10);
    if (!list.length) return '<p class="pp-note">（近期未筛得标准吉日，可放宽条件重试）</p>';
    var rows = list.map(function (it) {
      var s = it.solar, lu = it.lunar, d = it.date;
      var g = s.getYear() + '-' + ('0' + s.getMonth()).slice(-2) + '-' + ('0' + s.getDay()).slice(-2);
      var lun = lu.getMonthInChinese() + lu.getDayInChinese();
      return '<div class="mg-date">' +
        '<div class="mg-d-main"><span class="mg-d-date">' + g + '</span><span class="mg-d-week">星期' + WEEK[d.getDay()] + '</span></div>' +
        '<div class="mg-d-sub">农历 ' + lun + '</div>' +
        '<div class="mg-d-jc"><span class="mg-jc-tag">' + it.jc + '日</span><span class="mg-d-yi">' + (JC_JI[it.jc] || '宜嫁娶') + '</span></div>' +
        '<div class="mg-d-reason">✓ 不冲双方生肖（' + SHENGXIAO[mz] + '/' + SHENGXIAO[wz] + '），建除' + it.jc + '为嫁娶吉神</div>' +
        '</div>';
    }).join('');
    return rows + '<p class="pp-note" style="font-style:italic">吉日按「成/开/满/定/危/平/执」择取，并避开冲双方生肖与朔望。排名靠前综合更优，仍请结合实际安排。</p>';
  }

  window.MarriageModule = { onEnter: onEnter };
})();
