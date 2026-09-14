/* 灵验APP · 主控制器：三页导航 + 第2页模块子视图 */
(function () {
  'use strict';

  var pages = {
    home: document.getElementById('page-home'),
    hall: document.getElementById('page-hall'),
    about: document.getElementById('page-about')
  };
  var btnBack = document.getElementById('btn-back');
  var hallGrid = document.getElementById('hall-grid');
  var hallModules = document.getElementById('hall-modules');
  var hallModule = null;

  function showOnly(page) {
    Object.keys(pages).forEach(function (k) {
      pages[k].classList.toggle('active', k === page);
    });
    window.scrollTo(0, 0);
  }

  function updateBack() {
    if (pages.hall.classList.contains('active')) {
      btnBack.style.visibility = 'visible';
      btnBack.textContent = hallModule ? '‹ 功能大厅' : '‹ 首页';
    } else if (pages.about.classList.contains('active')) {
      btnBack.style.visibility = 'visible';
      btnBack.textContent = '‹ 首页';
    } else {
      btnBack.style.visibility = 'hidden';
    }
  }

  function leaveCalendar() {
    if (window.CalendarModule && window.CalendarModule.onLeave) window.CalendarModule.onLeave();
    if (window.LuopanModule && window.LuopanModule.onLeave) window.LuopanModule.onLeave();
  }

  function goHome() {
    leaveCalendar();
    showOnly('home');
    hallModule = null;
    hallGrid.hidden = false;
    hallModules.hidden = true;
    updateBack();
    // 首页累计使用者滚动计数（每次回到首页重新播放滚动动画）
    var hc = document.getElementById('user-counter-home');
    if (hc && window.LYCounter) {
      var roll = new window.LYCounter.Rolling(hc);
      roll.set(window.LYCounter.read('userCount', 10000000), true);
    }
  }

  function openHall() {
    leaveCalendar();
    showOnly('hall');
    hallModule = null;
    hallGrid.hidden = false;
    hallModules.hidden = true;
    updateBack();
  }

  function openAbout() {
    leaveCalendar();
    showOnly('about');
    if (window.AboutModule) window.AboutModule.onEnter();
    updateBack();
  }

  // 首页两个大按钮
  document.querySelectorAll('[data-page]').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-page');
      if (p === 'hall') openHall();
      else if (p === 'about') openAbout();
    });
  });

  // 功能大厅卡片
  document.querySelectorAll('#hall-grid .module-card').forEach(function (card) {
    card.addEventListener('click', function () { openModule(card.getAttribute('data-go')); });
  });

  function openModule(name) {
    leaveCalendar();
    hallModule = name;
    hallGrid.hidden = true;
    hallModules.hidden = false;
    hallModules.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + name);
    });
    window.scrollTo(0, 0);
    // 累计使用者计数：每次点击任意功能模块 +1（持久化）
    if (window.LYCounter) window.LYCounter.bump('userCount', 10000000, 1);
    if (name === 'guanyin' && window.GuanyinModule) window.GuanyinModule.onEnter();
    if (name === 'hexagram' && window.HexagramModule) window.HexagramModule.onEnter();
    if (name === 'calendar' && window.CalendarModule) window.CalendarModule.onEnter();
    if (name === 'paipan' && window.PaipanModule) window.PaipanModule.onEnter();
    if (name === 'bazi' && window.MnemonicsModule) window.MnemonicsModule.render('bazi');
    if (name === 'fengshui' && window.MnemonicsModule) window.MnemonicsModule.render('fengshui');
    if (name === 'ziwei' && window.ZiweiModule) window.ZiweiModule.onEnter();
    if (name === 'cezi' && window.CeziModule) window.CeziModule.onEnter();
    if (name === 'luopan' && window.LuopanModule) window.LuopanModule.onEnter();
    if (name === 'luopan-help' && window.LuopanHelpModule) window.LuopanHelpModule.onEnter();
    if (name === 'marriage' && window.MarriageModule) window.MarriageModule.onEnter();
    if (name === 'babyname' && window.BabyNameModule) window.BabyNameModule.onEnter();
    updateBack();
  }

  btnBack.addEventListener('click', function () {
    if (pages.hall.classList.contains('active')) {
      if (hallModule) openHall(); // 返回大厅网格
      else goHome();
    } else if (pages.about.classList.contains('active')) {
      goHome();
    }
  });

  // 第3页：赞助 · 反馈
  window.AboutModule = (function () {
    var QQ = '6987581', QQMAIL = '6987581@qq.com';
    var KEY_FB = 'lingyan.feedback';

    function $(id) { return document.getElementById(id); }
    function copyText(t, okMsg, msgId) {
      var done = function (m) { var el = $(msgId); if (el) { el.textContent = m; el.className = 'msg ok'; } };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { done(okMsg); }, function () { fallback(t, okMsg, msgId); });
      } else fallback(t, okMsg, msgId);
    }
    function fallback(t, okMsg, msgId) {
      var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta);
      ta.select(); try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      var el = $(msgId); if (el) { el.textContent = okMsg; el.className = 'msg ok'; }
    }

    function renderFeedback() {
      var list = [];
      try { list = JSON.parse(localStorage.getItem(KEY_FB) || '[]'); } catch (e) {}
      $('fb-list').innerHTML = list.length
        ? list.map(function (f) {
            return '<div style="margin-bottom:8px"><b>[' + f.type + ']</b> ' + escapeHtml(f.text) +
              '<br><span class="sub">' + f.time + '</span></div>';
          }).join('')
        : '<div class="sub">还没有反馈记录，快来当第一个提建议的人吧！</div>';
    }
    function escapeHtml(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function onEnter() {
      // 收款码：注入 BASE64 内嵌图片（无外部文件依赖）
      if (window.SPONSOR_QR) { var qr = $('sponsor-qr'); if (qr) qr.src = window.SPONSOR_QR; }
      // 赞助金额选择
      $('sponsor-amounts').addEventListener('click', function (e) {
        var b = e.target.closest('.amt'); if (!b) return;
        document.querySelectorAll('.amt').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active'); $('sponsor-custom').value = '';
      });
      $('sponsor-go').onclick = function () {
        var m = $('sponsor-msg');
        var custom = parseInt($('sponsor-custom').value, 10);
        var sel = (document.querySelector('.amt.active') || {}).dataset;
        var v = custom || (sel ? parseInt(sel.v, 10) : 0);
        if (!v || v < 1 || v > 100) { m.textContent = '请选择或输入 1~100 元之间的金额哦'; m.className = 'msg err'; return; }
        m.innerHTML = '💝 谢谢你的 <b>¥' + v + '</b> 心意！请用微信扫描上方收款码，金额填 <b>' + v + '</b> 元即可完成赞助！';
        m.className = 'msg ok';
      };
      $('sponsor-qq').onclick = function () { copyText(QQ, '已复制作者 QQ：' + QQ, 'sponsor-msg'); };
      $('sponsor-mail').onclick = function () { copyText(QQMAIL, '已复制作者 QQ邮箱：' + QQMAIL, 'sponsor-msg'); };

      // 反馈
      $('fb-types').addEventListener('click', function (e) {
        var b = e.target.closest('.fbt'); if (!b) return;
        document.querySelectorAll('.fbt').forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
      });
      $('fb-submit').onclick = function () {
        var type = (document.querySelector('.fbt.active') || {}).dataset;
        type = type ? type.v : '其他';
        var text = $('fb-text').value.trim();
        if (!text) { $('fb-list').innerHTML = '<div class="msg err" style="padding:6px">请先填写反馈内容哦～</div>'; return; }
        var list = [];
        try { list = JSON.parse(localStorage.getItem(KEY_FB) || '[]'); } catch (e) {}
        list.unshift({ type: type, text: text, time: new Date().toLocaleString('zh-CN') });
        try { localStorage.setItem(KEY_FB, JSON.stringify(list)); } catch (e) {}
        $('fb-text').value = '';
        renderFeedback();
      };
      renderFeedback();

      // 累计使用者滚动计数：从 0 滚动到当前值（每次进入重新播放滚动动画）
      var uc = $('user-counter');
      if (uc && window.LYCounter) {
        var roll = new window.LYCounter.Rolling(uc);
        var val = window.LYCounter.read('userCount', 10000000);
        roll.set(val, true);
      }
    }

    return { onEnter: onEnter };
  })();

  // 初始进入首页
  goHome();
})();
