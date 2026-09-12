/* 棋斗士 · 导航 / 渲染 / 游戏宿主 */
(function(){
  var GAME_LIST=[
    {id:'gomoku',name:'五子棋',icon:'⚪',tag:'连五',colors:[{key:'black',label:'黑方·先手'},{key:'white',label:'白方·后手'}]},
    {id:'halma',name:'跳棋',icon:'🔶',tag:'对岸',colors:[{key:'red',label:'红方·先手'},{key:'blue',label:'蓝方·后手'}]},
    {id:'go',name:'围棋',icon:'⚫',tag:'围地',colors:[{key:'black',label:'黑方·先手'},{key:'white',label:'白方·后手'}],
      extra:[
        {key:'size',label:'棋盘大小',def:19,options:[{v:9,label:'9 路'},{v:13,label:'13 路'},{v:19,label:'19 路'}]},
        {key:'level',label:'难度等级',def:2,options:[{v:1,label:'简单'},{v:2,label:'中等'},{v:3,label:'困难'}]}
      ]},
    {id:'xiangqi',name:'中国象棋',icon:'🐎',tag:'将死',colors:[{key:'red',label:'红方·先手'},{key:'black',label:'黑方·后手'}],
      extra:[
        {key:'level',label:'难度等级',def:2,options:[{v:1,label:'初级'},{v:2,label:'中级'},{v:3,label:'高级'},{v:4,label:'大师'}]}
      ]},
    {id:'chess',name:'国际象棋',icon:'♞',tag:'王棋',colors:[{key:'white',label:'白方·先手'},{key:'black',label:'黑方·后手'}],
      extra:[
        {key:'level',label:'难度等级',def:2,options:[{v:1,label:'初级'},{v:2,label:'中级'},{v:3,label:'高级'}]}
      ]},
    {id:'junqi',name:'军棋',icon:'🎖',tag:'夺旗',colors:[{key:'red',label:'红方·先手'},{key:'black',label:'黑方·后手'}],
      extra:[
        {key:'board',label:'棋盘玩法',def:'a',options:[{v:'a',label:'棋盘A·紧凑'},{v:'b',label:'棋盘B·标准'}]}
      ]}
  ];
  var PLAYLIST=[
    {id:'huarongdao',name:'华容道',icon:'🏯',tag:'5档难度',desc:'横刀立马等 5 个经典开局，滑动曹操出关'},
    {id:'shuzi',name:'数字华容道',icon:'🔢',tag:'可玩',desc:'4×4 / 5×5 数字滑块，打乱后按顺序排好'},
    {id:'mofang',name:'魔方解法',icon:'📖',tag:'公式',desc:'层先法完整步骤与字母公式说明'},
    {id:'mofang3d',name:'虚拟魔方',icon:'🧊',tag:'可玩',desc:'3D 魔方试玩，转动各层、打乱复原'},
    {id:'tetris',name:'俄罗斯方块',icon:'🧱',tag:'可玩',desc:'经典下落消除，即时对战体验'},
    {id:'siqiaoban',name:'四巧板',icon:'🧩',tag:'拼图',desc:'4 块真实几何板块，可拖拽、旋转、翻转'},
    {id:'qiqiaoban',name:'七巧板',icon:'🔷',tag:'拼图',desc:'标准 7 块几何板，自由拼搭各种造型'}
  ];

  var overlay=document.getElementById('overlay');
  var ovBody=document.getElementById('ov-body');
  var ovTitle=document.getElementById('ov-title');
  var modal=document.getElementById('modal');
  var modalBody=document.getElementById('modal-body');

  // ---- 导航 ----
  var navs=document.querySelectorAll('nav .nv');
  function go(p){
    document.querySelectorAll('.page').forEach(function(s){s.classList.remove('active');});
    document.getElementById('page-'+p).classList.add('active');
    navs.forEach(function(n){n.classList.toggle('on',n.getAttribute('data-p')===String(p));});
    window.scrollTo(0,0);
  }
  navs.forEach(function(n){n.addEventListener('click',function(){go(parseInt(n.getAttribute('data-p')));});});

  // ---- 渲染首页：棋类介绍 ----
  function renderChess(){
    var g=document.getElementById('chess-grid');g.innerHTML='';
    window.CHESS_INTRO.forEach(function(it){
      var c=document.createElement('div');c.className='card';
      c.innerHTML='<div class="ic">'+it.icon+'</div><h3>'+it.name+'</h3><p>'+short(it)+'</p><span class="tag">'+it.tag+'</span>';
      c.onclick=function(){openDetail(it.name,chessDetail(it));};
      g.appendChild(c);
    });
  }
  function short(it){var s=it.rules[1]&&it.rules[1].p?it.rules[1].p:(it.rules[0].p||'');return s.slice(0,26)+'…';}
  function chessDetail(it){
    var h='<div class="board-wrap">'+it.board()+'</div><div class="rules">';
    it.rules.forEach(function(s){
      h+='<h3>'+s.h+'</h3>';
      if(s.p)h+='<p>'+s.p+'</p>';
      if(s.ul)h+='<ul>'+s.ul.map(function(li){return '<li>'+li+'</li>';}).join('')+'</ul>';
    });
    return h+'</div>';
  }

  // ---- 渲染第3页：益智说明 ----
  function renderPuzzle(){
    var g=document.getElementById('puzzle-grid');g.innerHTML='';
    window.PUZZLE_INTRO.forEach(function(it){
      var c=document.createElement('div');c.className='card';
      c.innerHTML='<div class="ic">'+it.icon+'</div><h3>'+it.name+'</h3><p>'+it.rules[0].p.slice(0,26)+'…</p><span class="tag">'+it.tag+'</span>';
      c.onclick=function(){openDetail(it.name,puzzleDetail(it));};
      g.appendChild(c);
    });
  }
  function puzzleDetail(it){
    var h='';
    if(it.board)h+=it.board();
    h+='<div class="rules">';
    it.rules.forEach(function(s){
      h+='<h3>'+s.h+'</h3>';
      if(s.p)h+='<p>'+s.p+'</p>';
      if(s.ul)h+='<ul>'+s.ul.map(function(li){return '<li>'+li+'</li>';}).join('')+'</ul>';
    });
    return h+'</div>';
  }

  // ---- 渲染第2页：人机对战 ----
  function renderGames(){
    var g=document.getElementById('game-grid');g.innerHTML='';
    GAME_LIST.forEach(function(it){
      var c=document.createElement('div');c.className='card';
      c.innerHTML='<div class="ic">'+it.icon+'</div><h3>'+it.name+'</h3><p>人机对战 · 可设定先手</p><span class="tag">'+it.tag+'</span>';
      c.onclick=function(){openConfig(it);};
      g.appendChild(c);
    });
  }

  // ---- 渲染第4页：休闲游戏 ----
  function renderPlays(){
    var g=document.getElementById('play-grid');g.innerHTML='';
    PLAYLIST.forEach(function(it){
      var c=document.createElement('div');c.className='card';
      c.innerHTML='<div class="ic">'+it.icon+'</div><h3>'+it.name+'</h3><p>'+it.desc+'</p><span class="tag">'+it.tag+'</span>';
      c.onclick=function(){startPlay(it);};
      g.appendChild(c);
    });
  }

  // ---- 浮层 ----
  document.getElementById('ov-back').onclick=closeOverlay;
  function openDetail(title,html){
    ovTitle.textContent=title;
    ovBody.innerHTML=html;
    overlay.classList.add('show');
  }
  function closeOverlay(){
    var t=window.__T||[];while(t.length){clearInterval(t.pop());}
    if(ovBody.__onExit){try{ovBody.__onExit();}catch(e){}ovBody.__onExit=null;}
    ovBody.__exit=null;
    overlay.classList.remove('show');
  }

  // ---- 配置弹窗 ----
  function openConfig(game){
    var mode='ai',me=game.colors[0].key,first='me';
    var extraVals={};
    (game.extra||[]).forEach(function(e){extraVals[e.key]=e.def;});
    var h='<h3>'+game.name+' · 对战设置</h3>';
    h+='<div class="row"><label>对弈方（对手）</label><div class="seg" id="cfg-mode">'+
      '<button data-v="ai" class="on">AI 电脑</button><button data-v="human">双人对弈</button></div></div>';
    h+='<div class="row"><label>我方执子</label><div class="seg" id="cfg-me">'+
      game.colors.map(function(c,i){return '<button data-v="'+c.key+'"'+(i===0?' class="on"':'')+'>'+c.label+'</button>';}).join('')+'</div></div>';
    h+='<div class="row"><label>谁先走</label><div class="seg" id="cfg-first">'+
      '<button data-v="me" class="on">我方</button><button data-v="opp">对方</button></div></div>';
    (game.extra||[]).forEach(function(e){
      h+='<div class="row"><label>'+e.label+'</label><div class="seg" id="cfg-x-'+e.key+'">'+
        e.options.map(function(o){return '<button data-v="'+o.v+'"'+(o.v===e.def?' class="on"':'')+'>'+o.label+'</button>';}).join('')+'</div></div>';
    });
    h+='<div style="display:flex;gap:8px;margin-top:6px">'+
      '<button class="btn ghost" id="cfg-cancel">取消</button>'+
      '<button class="btn" id="cfg-start">开始对局</button></div>';
    modalBody.innerHTML=h;
    modal.classList.add('show');
    function bind(sel,cb){var d=modalBody.querySelector(sel);d.querySelectorAll('button').forEach(function(b){b.onclick=function(){d.querySelectorAll('button').forEach(function(x){x.classList.remove('on');});b.classList.add('on');cb(b.getAttribute('data-v'));};});}
    bind('#cfg-mode',function(v){mode=v;});
    bind('#cfg-me',function(v){me=v;});
    bind('#cfg-first',function(v){first=v;});
    (game.extra||[]).forEach(function(e){
      bind('#cfg-x-'+e.key,function(v){extraVals[e.key]=v;});
    });
    modalBody.querySelector('#cfg-cancel').onclick=function(){modal.classList.remove('show');};
    modalBody.querySelector('#cfg-start').onclick=function(){
      modal.classList.remove('show');
      var cfg={mode:mode,me:me,first:first};
      (game.extra||[]).forEach(function(e){cfg[e.key]=extraVals[e.key];});
      startGame(game,cfg);
    };
  }

  // ---- 启动游戏 ----
  function startGame(game,cfg){
    ovTitle.textContent=game.name+(cfg.mode==='human'?' · 双人':(cfg.first==='me'?' · 你执'+colorName(game,cfg.me):' · 电脑先手'));
    ovBody.innerHTML='';
    overlay.classList.add('show');
    ovBody.__exit=closeOverlay;
    window.GAMES[game.id].mount(ovBody,cfg);
  }
  function colorName(game,key){var f=game.colors.find(function(c){return c.key===key;});return f?f.label.split('·')[0]:'';}

  function startPlay(it){
    if(it.id==='mofang'){
      openDetail('魔方解法',window.MOFANG_HTML());
      return;
    }
    ovTitle.textContent=it.name;
    ovBody.innerHTML='';
    overlay.classList.add('show');
    ovBody.__exit=closeOverlay;
      var pid=(it.id==='tetris')?'tetris':(it.id==='mofang3d')?'mofang':(it.id==='shuzi')?'shuzi':(it.id==='siqiaoban')?'siqiaoban':(it.id==='qiqiaoban')?'qiqiaoban':'huarongdao';
      window.PLAYS[pid].mount(ovBody);
  }

  // ---- 关于页 ----
  function renderAbout(){
    document.getElementById('about-box').innerHTML=
      '<div class="biglogo">棋</div>'+
      '<h2>棋斗士</h2>'+
      '<div class="scroll-tip">掌上棋类 · 益智大全</div>'+
      '<div class="kv"><div class="k">游戏版本</div><div class="v">V1.0 202609</div></div>'+
      '<div class="kv"><div class="k">软件创作</div><div class="v">归工运踢桃</div></div>'+
      '<div class="kv"><div class="k">联系方式</div><div class="v">QQ：6987581</div></div>'+
      '<div class="desc"><b>开源声明：</b>本软件开源，可以随意传播、学习与改进。<br><br>'+
      '<b>免责声明：</b>纯属个人娱乐作品，请勿沉迷游戏。适度益智，健康娱乐。</div>'+
      '<div class="desc"><b>赞赏支持：</b>如果你喜欢「棋斗士」，欢迎扫码赞赏，支持我继续更新更多棋类与益智玩法。</div>'+
      '<img class="qr" src="'+window.WXPAY_QR+'" alt="微信赞赏码">'+
      '<div class="qr-caption">微信扫一扫 · 收款人：归工运踢桃</div>'+
      '<div class="desc"><b>建议与反馈：</b>对玩法、规则、难度有任何建议，欢迎加 QQ 6987581 交流，或通过赞赏留言反馈。你的意见是我改进的最大动力。</div>';
  }

  // ---- 初始化 ----
  renderChess();
  renderGames();
  renderPuzzle();
  renderPlays();
  renderAbout();
})();
