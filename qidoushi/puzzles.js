/* 棋斗士 · 休闲游戏：华容道 / 魔方解法 / 俄罗斯方块 */
(function(){
  function $(t,c){var e=document.createElement(t);if(c)e.className=c;return e;}
  function stage(container,w,h){
    var dpr=window.devicePixelRatio||1;
    var c=$('canvas');c.className='game';
    c.width=Math.round(w*dpr);c.height=Math.round(h*dpr);
    c.style.width=w+'px';c.style.height=h+'px';
    var ctx=c.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
    container.appendChild(c);return {c:c,ctx:ctx,w:w,h:h};
  }
  function cssW(container){var w=container.clientWidth||400;return Math.max(280,Math.min(w-12,420));}
  function bar(container){var d=$('div');d.className='game-msg';container.appendChild(d);return d;}
  function ctl(container,btns){var d=$('div');d.className='game-ctl';container.appendChild(d);var o={};btns.forEach(function(x){var e=$('button');e.className='btn small '+(x.cls||'ghost');e.textContent=x.label;e.onclick=x.fn;d.appendChild(e);o[x.key]=e;});return o;}

  var PLAYS = {};

  // ============ 华容道 ============
  PLAYS.huarongdao = {
    name:'华容道',
    mount:function(container){
      var W=cssW(container),CW=Math.min(W,340),cell=CW/4,CH=cell*5;
      var st=stage(container,CW,CH),ctx=st.ctx;
      var NAMES={C:'曹操',G:'关羽',A:'张飞',B:'赵云',D:'马超',F:'黄忠',s:'兵'};
      var SHORT={C:'曹',G:'关',A:'张',B:'赵',D:'马',F:'黄',s:'兵'};
      var COLORS={C:'#f5c96b',G:'#e05a5a',A:'#4f8cff',B:'#66bb6a',D:'#b07cf0',F:'#f09a4f',s:'#8a9bb8'};
      var LEVELS=[
        {name:'横刀立马',rows:['ACCB','ACCB','DGGF','DssF','s..s']},
        {name:'兵分三路',rows:['sCCs','sCCs','AGGB','ADFB','.DF.']},
        {name:'层层设防',rows:['ACCB','ACCB','DGGs','DssF','s..F']},
        {name:'水泄不通',rows:['CCAB','CCAB','sGGs','sDFs','.DF.']},
        {name:'小燕出巢',rows:['ACCB','ACCB','DGGF','DssF','.ss.']}
      ];
      var lv=0,pieces=[],history=[],sel=null,hints=[],moves=0;

      function parse(rows){
        var p=[],seen={};
        function take(x,y){seen[x+','+y]=1;}
        function consumed(x,y){return seen[x+','+y];}
        for(var y=0;y<5;y++)for(var x=0;x<4;x++){
          var ch=rows[y][x];
          if(ch==='.'||consumed(x,y))continue;
          if(ch==='C'){p.push({id:'C',x:x,y:y,w:2,h:2});take(x,y);take(x+1,y);take(x,y+1);take(x+1,y+1);}
          else if(ch==='G'){p.push({id:'G',x:x,y:y,w:2,h:1});take(x,y);take(x+1,y);}
          else if(ch==='s'){p.push({id:'s',x:x,y:y,w:1,h:1});take(x,y);}
          else{p.push({id:ch,x:x,y:y,w:1,h:2});take(x,y);take(x,y+1);}
        }
        return p;
      }
      function occMap(){var o={};pieces.forEach(function(p){for(var y=p.y;y<p.y+p.h;y++)for(var x=p.x;x<p.x+p.w;x++)o[x+','+y]=p;});return o;}
      function isOwn(p,x,y){return x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h;}
      function legal(p){
        var o=occMap(),res=[];
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){
          var ok=true;
          for(var y=p.y;y<p.y+p.h&&ok;y++)for(var x=p.x;x<p.x+p.w;x++){
            var nx=x+d[0],ny=y+d[1];
            if(nx<0||nx>3||ny<0||ny>4){ok=false;break;}
            if(!isOwn(p,nx,ny)&&o[nx+','+ny]){ok=false;break;}
          }
          if(ok)res.push([p.x+d[0],p.y+d[1]]);
        });
        return res;
      }
      function snap(){return pieces.map(function(p){return {id:p.id,x:p.x,y:p.y,w:p.w,h:p.h};});}
      function restore(s){pieces=s.map(function(p){return {id:p.id,x:p.x,y:p.y,w:p.w,h:p.h};});}
      function won(){var c=pieces.find(function(p){return p.id==='C';});return c.x===1&&c.y===3;}
      function draw(){
        ctx.fillStyle='#14203a';ctx.fillRect(0,0,CW,CH);
        // 网格
        ctx.strokeStyle='#33415e';ctx.lineWidth=1;
        for(var x=0;x<=4;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,CH);ctx.stroke();}
        for(var y=0;y<=5;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(CW,y*cell);ctx.stroke();}
        // 出口
        ctx.fillStyle='rgba(102,187,106,.25)';ctx.fillRect(1*cell,4*cell,2*cell,cell);
        ctx.fillStyle='#66bb6a';ctx.font='11px sans-serif';ctx.textAlign='center';ctx.fillText('出口',2*cell,4.9*cell);
        // 选中高亮
        if(sel){ctx.fillStyle='rgba(245,201,107,.35)';ctx.fillRect(sel.x*cell,sel.y*cell,sel.w*cell,sel.h*cell);}
        hints.forEach(function(h){ctx.fillStyle='rgba(102,187,106,.4)';ctx.fillRect(h[0]*cell,h[1]*cell,cell,cell);});
        pieces.forEach(function(p){
          var pad=2;
          ctx.fillStyle=COLORS[p.id];
          roundRect(ctx,p.x*cell+pad,p.y*cell+pad,p.w*cell-pad*2,p.h*cell-pad*2,6);ctx.fill();
          ctx.fillStyle='#1b2a4a';ctx.font='bold '+Math.round(cell*0.44)+'px "PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(SHORT[p.id],p.x*cell+p.w*cell/2,p.y*cell+p.h*cell/2);
        });
        ctx.textBaseline='alphabetic';
      }
      function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
      function click(e){
        if(won())return;
        var x=Math.floor(e.offsetX/cell),y=Math.floor(e.offsetY/cell);
        if(x<0||x>3||y<0||y>4)return;
        var o=occMap(),hit=o[x+','+y];
        if(sel){
          var target=hints.find(function(h){return h[0]===x&&h[1]===y;});
          if(target){history.push(snap());sel.x=target[0];sel.y=target[1];moves++;sel=null;hints=[];draw();
            if(won()){msg.textContent='🎉 过关！共 '+moves+' 步';return;}
            msg.textContent='第 '+moves+' 步 · 继续把曹操移到出口';
            return;}
          if(hit){sel=hit;hints=legal(hit);}else{sel=null;hints=[];}
        }else{
          if(hit){sel=hit;hints=legal(hit);}else{sel=null;hints=[];}
        }
        draw();
      }
      function load(i){lv=i;pieces=parse(LEVELS[i].rows);history=[];sel=null;hints=[];moves=0;draw();msg.textContent=LEVELS[i].name+' · 把曹操移到下方出口';}
      function undo(){if(!history.length)return;restore(history.pop());sel=null;hints=[];moves=Math.max(0,moves-1);draw();msg.textContent='已撤销';}
      var msg=bar(container);
      // 难度选择
      var dd=$('div');dd.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:2px 0';
      LEVELS.forEach(function(L,i){var b=$('button');b.className='btn small ghost';b.textContent=(i+1)+'.'+L.name;b.onclick=function(){load(i);};dd.appendChild(b);});
      container.appendChild(dd);
      container.appendChild(st.c);
      var ct=ctl(container,[{key:'undo',label:'撤销',fn:undo},{key:'reset',label:'重开',fn:function(){load(lv);}},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      st.c.onclick=click;
      load(0);
    }
  };

  // ============ 数字华容道（15/24 滑块） ============
  PLAYS.shuzi = {
    name:'数字华容道',
    mount:function(container){
      var W=cssW(container),CW=Math.min(W,360);
      var SIZES=[{n:4,label:'4×4（1-15）'},{n:5,label:'5×5（1-24）'}];
      var N=4,cell=CW/4,st=stage(container,CW,CW),ctx=st.ctx;
      var board=[],empty=0,moves=0,history=[],wonFlag=false;
      function solved(){var a=[];for(var i=1;i<N*N;i++)a.push(i);a.push(0);return a;}
      function isWon(){for(var i=0;i<N*N;i++){var want=(i===N*N-1)?0:i+1;if(board[i]!==want)return false;}return true;}
      function pos(idx){return [Math.floor(idx/N), idx%N];}
      function shuffle(){
        board=solved();empty=N*N-1;moves=0;wonFlag=false;history=[];var prev=-1;
        for(var i=0;i<N*N*120;i++){
          var p=pos(empty),r=p[0],c=p[1],opts=[];
          [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){
            var nr=r+d[0],nc=c+d[1];
            if(nr<0||nr>=N||nc<0||nc>=N)return;
            var idx=nr*N+nc;if(idx!==prev)opts.push(idx);
          });
          var pick=opts[Math.floor(Math.random()*opts.length)];
          board[empty]=board[pick];board[pick]=0;prev=empty;empty=pick;
        }
      }
      function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
      function draw(){
        ctx.fillStyle='#0b1226';ctx.fillRect(0,0,CW,CW);
        var pad=Math.max(2,cell*0.06);
        for(var i=0;i<N*N;i++){
          var p=pos(i),r=p[0],c=p[1],val=board[i];
          var x=c*cell,y=r*cell,w=cell-pad*2,h=cell-pad*2;
          if(val===0){ctx.fillStyle='rgba(255,255,255,0.04)';roundRect(ctx,x+pad,y+pad,w,h,8);ctx.fill();continue;}
          var done=(val===i+1);
          ctx.fillStyle=done?'#22c55e':'#33415e';
          roundRect(ctx,x+pad,y+pad,w,h,8);ctx.fill();
          ctx.fillStyle=done?'#0b1226':'#eaf0ff';
          ctx.font='bold '+Math.round(cell*0.42)+'px "PingFang SC","Microsoft YaHei",sans-serif';
          ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(String(val),c*cell+cell/2,r*cell+cell/2);
        }
        ctx.textBaseline='alphabetic';
      }
      function tryMove(idx){
        if(wonFlag)return;
        var p=pos(idx),ep=pos(empty);
        if(Math.abs(p[0]-ep[0])+Math.abs(p[1]-ep[1])!==1)return;
        history.push([idx,empty]);
        board[empty]=board[idx];board[idx]=0;empty=idx;moves++;
        draw();
        if(isWon()){wonFlag=true;msg.textContent='🎉 完成！共 '+moves+' 步';}
        else msg.textContent='第 '+moves+' 步';
      }
      function load(n){
        N=n;cell=CW/N;board=solved();empty=N*N-1;moves=0;wonFlag=false;history=[];
        draw();msg.textContent='数字华容道 '+N+'×'+N+'：点击"打乱"开始';
      }
      function undo(){
        if(!history.length||wonFlag)return;
        var last=history.pop(),a=last[0],b=last[1];
        board[a]=board[b];board[b]=0;empty=b;
        moves=Math.max(0,moves-1);draw();msg.textContent='已撤销（'+moves+' 步）';
      }
      var msg=bar(container);
      var dd=$('div');dd.style.cssText='display:flex;gap:6px;flex-wrap:wrap;justify-content:center;margin:2px 0';
      SIZES.forEach(function(s){
        var b=$('button');b.className='btn small ghost';b.textContent=s.label;
        b.onclick=function(){load(s.n);};
        dd.appendChild(b);
      });
      container.appendChild(dd);
      container.appendChild(st.c);
      var ct=ctl(container,[
        {key:'shuffle',label:'打乱',fn:function(){shuffle();draw();msg.textContent='已打乱，按顺序排好 1~'+(N*N-1)+' 即可完成';}},
        {key:'undo',label:'撤销',fn:undo},
        {key:'reset',label:'重置',fn:function(){load(N);}},
        {key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}
      ]);
      st.c.onclick=function(e){
        var x=Math.floor(e.offsetX/cell),y=Math.floor(e.offsetY/cell);
        if(x<0||x>=N||y<0||y>=N)return;
        tryMove(y*N+x);
      };
      load(4);
    }
  };

  // ============ 俄罗斯方块 ============
  PLAYS.tetris = {
    name:'俄罗斯方块',
    mount:function(container){
      var W=cssW(container),CW=Math.min(W,300),cell=CW/10,CH=cell*20;
      var st=stage(container,CW,CH),ctx=st.ctx;
      var SHAPES=[
        {m:[[1,1,1,1]],c:'#00e5ff'},
        {m:[[1,1],[1,1]],c:'#f5c96b'},
        {m:[[0,1,0],[1,1,1]],c:'#b07cf0'},
        {m:[[0,1,1],[1,1,0]],c:'#66bb6a'},
        {m:[[1,1,0],[0,1,1]],c:'#ef5350'},
        {m:[[1,0,0],[1,1,1]],c:'#4f8cff'},
        {m:[[0,0,1],[1,1,1]],c:'#f09a4f'}
      ];
      var BW=10,BH=20,board=[],cur=null,next=null,score=0,lines=0,level=1,over=false,timer=null;
      var nextC=stage(container,CW*0.4,CW*0.4);nextC.c.className='game';nextC.c.style.width=(CW*0.4)+'px';
      function blank(){var b=[];for(var y=0;y<BH;y++){b.push([]);for(var x=0;x<BW;x++)b[y].push(0);}return b;}
      function newPiece(){var s=SHAPES[Math.floor(Math.random()*SHAPES.length)];return {m:s.m.map(function(r){return r.slice();}),c:s.c,x:3,y:0};}
      function collide(p){for(var y=0;y<p.m.length;y++)for(var x=0;x<p.m[y].length;x++)if(p.m[y][x]){var bx=p.x+x,by=p.y+y;if(bx<0||bx>=BW||by>=BH)return true;if(by>=0&&board[by][bx])return true;}return false;}
      function merge(){for(var y=0;y<cur.m.length;y++)for(var x=0;x<cur.m[y].length;x++)if(cur.m[y][x]){var by=cur.y+y,bx=cur.x+x;if(by>=0)board[by][bx]=cur.c;}}
      function clearLines(){var n=0;for(var y=BH-1;y>=0;y--){if(board[y].every(function(v){return v;})){board.splice(y,1);board.unshift([]);for(var i=0;i<BW;i++)board[0].push(0);n++;y++;}}
        if(n){var add=[0,100,300,500,800][n];score+=add;lines+=n;level=Math.floor(lines/10)+1;return n;}return 0;}
      function spawn(){cur=next||newPiece();next=newPiece();if(collide(cur)){over=true;stop();msg.textContent='游戏结束！得分 '+score;}}
      function rot(m){var R=m[0].length,C=m.length,nm=[];for(var c=0;c<R;c++){nm.push([]);for(var r=C-1;r>=0;r--)nm[c].push(m[r][c]);}return nm;}
      function tryRotate(){var m=rot(cur.m),p={m:m,c:cur.c,x:cur.x,y:cur.y};for(var k=0;k<5;k++){p.x=cur.x+[0,-1,1,-2,2][k];if(!collide(p)){cur.m=m;cur.x=p.x;draw();return;}}}
      function move(dx){cur.x+=dx;if(collide(cur))cur.x-=dx;else draw();}
      function drop(){cur.y++;if(collide(cur)){cur.y--;merge();clearLines();spawn();}draw();}
      function hardDrop(){while(!collide({m:cur.m,c:cur.c,x:cur.x,y:cur.y+1}))cur.y++;merge();clearLines();spawn();draw();}
      function speed(){return Math.max(80,520-(level-1)*50);}
      function draw(){
        ctx.fillStyle='#0b1226';ctx.fillRect(0,0,CW,CH);
        ctx.strokeStyle='#1c2a48';ctx.lineWidth=1;
        for(var y=0;y<BH;y++)for(var x=0;x<BW;x++){if(board[y][x]){ctx.fillStyle=board[y][x];ctx.fillRect(x*cell,y*cell,cell-1,cell-1);}}
        if(cur&&!over){ctx.fillStyle=cur.c;for(var yy=0;yy<cur.m.length;yy++)for(var xx=0;xx<cur.m[yy].length;xx++)if(cur.m[yy][xx]&&cur.y+yy>=0)ctx.fillRect((cur.x+xx)*cell,(cur.y+yy)*cell,cell-1,cell-1);}
        // next
        var nc=nextC.ctx,nw=nextC.w;nc.fillStyle='#0b1226';nc.fillRect(0,0,nw,nw);
        if(next){var ms=Math.max(next.m.length,next.m[0].length),cs=nw/(ms+2);
          var ox=(nw-next.m[0].length*cs)/2,oy=(nw-next.m.length*cs)/2;
          nc.fillStyle=next.c;for(var a=0;a<next.m.length;a++)for(var b=0;b<next.m[a].length;b++)if(next.m[a][b])nc.fillRect(ox+b*cs,oy+a*cs,cs-1,cs-1);}
      }
      function step(){if(!over)drop();}
      function start(){board=blank();score=0;lines=0;level=1;over=false;spawn();draw();if(timer)clearInterval(timer);timer=setInterval(step,speed());(window.__T=window.__T||[]).push(timer);msg.textContent='得分 '+score+' · 等级 '+level;}
      function stop(){if(timer){clearInterval(timer);timer=null;}}
      var msg=bar(container);
      container.appendChild(nextC.c);
      var hint=$('div');hint.style.cssText='text-align:center;font-size:10px;color:#9fb0d0;margin:2px';hint.textContent='下一个';
      container.appendChild(hint);
      container.appendChild(st.c);
      // 控制按钮
      var pad=$('div');pad.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:6px;width:100%;max-width:300px';
      function kbd(key,label,fn){var b=$('button');b.className='btn small ghost';b.textContent=label;b.onclick=fn;b.setAttribute('data-key',key);pad.appendChild(b);}
      kbd('left','◀',function(){move(-1);});
      kbd('rot','↻',function(){tryRotate();});
      kbd('down','▼',function(){if(!over)drop();});
      kbd('drop','⤓',function(){if(!over)hardDrop();});
      kbd('right','▶',function(){move(1);});
      container.appendChild(pad);
      var ct=ctl(container,[{key:'start',label:'新游戏',fn:start},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      function onKey(e){if(over)return;var k=e.key;if(k==='ArrowLeft'){e.preventDefault();move(-1);}else if(k==='ArrowRight'){e.preventDefault();move(1);}else if(k==='ArrowDown'){e.preventDefault();drop();}else if(k==='ArrowUp'){e.preventDefault();tryRotate();}else if(k===' '||k==='Space'){e.preventDefault();hardDrop();}}
      document.addEventListener('keydown',onKey);
      container.__onExit=function(){stop();document.removeEventListener('keydown',onKey);};
      start();
    }
  };

  // ============ 多边形自由拼图引擎（拖拽 + 旋转 + 翻转） ============
  function polyPuzzle(container, opts){
    var PIECES = opts.pieces;
    var TARGETS = opts.targets || [];
    var SCALE = opts.scale || 1;
    var BOARD_W = opts.boardW || 360;
    var BOARD_H = opts.boardH || 360;
    var ROT_STEP = opts.rotStep || 45;
    var SVG = 'http://www.w3.org/2000/svg';
    var msg = bar(container);

    // ---- DOM ----
    var wrap = $('div'); wrap.className = 'poly-wrap';
    var tbar = $('div'); tbar.className = 'poly-target-bar';
    var tname = $('span');
    var tbtn = $('button'); tbtn.className = 'btn small ghost'; tbtn.textContent = '切换目标';
    tbar.appendChild(tname); tbar.appendChild(tbtn);

    var palette = document.createElementNS('http://www.w3.org/2000/svg','svg');
    palette.setAttribute('class','poly-palette');
    palette.setAttribute('viewBox','0 0 360 90');

    var board = document.createElementNS('http://www.w3.org/2000/svg','svg');
    board.setAttribute('class','poly-board');
    board.setAttribute('viewBox','0 0 '+BOARD_W+' '+BOARD_H);

    wrap.appendChild(tbar);
    wrap.appendChild(palette);
    wrap.appendChild(board);
    container.appendChild(wrap);

    var ctls = $('div'); ctls.className = 'poly-ctl';
    [
      {label:'↻ 旋转'+ROT_STEP+'°', fn:function(){ if(sel && !sel.pinned){ sel.angle = (sel.angle + ROT_STEP) % 360; render(); } }},
      {label:'↔ 左右翻', fn:function(){ if(sel && !sel.pinned){ sel.flipX = !sel.flipX; render(); } }},
      {label:'↕ 上下翻', fn:function(){ if(sel && !sel.pinned){ sel.flipY = !sel.flipY; render(); } }},
      {label:'🗑 移除', fn:removeSel, cls:'red'},
      {label:'↺ 重置', fn:reset}
    ].forEach(function(b){
      var e = $('button'); e.className = 'btn small '+(b.cls||'ghost'); e.textContent = b.label; e.onclick = b.fn;
      ctls.appendChild(e);
    });
    var pinBtn = $('button'); pinBtn.className = 'btn small ghost'; pinBtn.textContent = '📌 固定';
    pinBtn.onclick = function(){ togglePin(); };
    ctls.appendChild(pinBtn);
    container.appendChild(ctls);

    var targetIdx = 0;
    var placed = [];
    var sel = null;

    // target ghost layer
    var targetLayer = document.createElementNS('http://www.w3.org/2000/svg','g');
    targetLayer.setAttribute('class','target-layer');
    board.appendChild(targetLayer);

    // ---- geometry helpers ----
    function center(points){
      var minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
      points.forEach(function(p){ minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minY=Math.min(minY,p[1]); maxY=Math.max(maxY,p[1]); });
      return [(minX+maxX)/2, (minY+maxY)/2];
    }
    function transform(points, cx, cy, x, y, angle, flipX, flipY){
      var rad = angle * Math.PI / 180;
      var cos = Math.cos(rad), sin = Math.sin(rad);
      return points.map(function(p){
        var dx = p[0] - cx, dy = p[1] - cy;
        if(flipX) dx = -dx;
        if(flipY) dy = -dy;
        var rx = dx*cos - dy*sin;
        var ry = dx*sin + dy*cos;
        return [x + rx, y + ry];
      });
    }
    function scalePoints(points, s){ return points.map(function(p){ return [p[0]*s, p[1]*s]; }); }
    function ptsAttr(points){ return points.map(function(p){ return p[0].toFixed(2)+','+p[1].toFixed(2); }).join(' '); }
    function svgPoly(points, fill, cls, stroke){
      var el = document.createElementNS('http://www.w3.org/2000/svg','polygon');
      el.setAttribute('points', ptsAttr(points));
      el.setAttribute('fill', fill);
      el.setAttribute('stroke', stroke || '#1b2a4a');
      el.setAttribute('stroke-width','1.5');
      el.setAttribute('stroke-linejoin','round');
      el.setAttribute('class', cls || 'poly-piece');
      return el;
    }

    // ---- render ----
    function renderTarget(){
      targetLayer.innerHTML = '';
      if(TARGETS.length){
        TARGETS[targetIdx].draw(targetLayer);
        tname.textContent = '目标：'+TARGETS[targetIdx].name;
      } else {
        tname.textContent = '自由拼搭';
      }
    }
    function renderPalette(){
      palette.innerHTML = '';
      var used = {};
      placed.forEach(function(p){ used[p.pieceIdx] = 1; });
      var slotW = 360 / PIECES.length;
      PIECES.forEach(function(pc, i){
        var g = document.createElementNS('http://www.w3.org/2000/svg','g');
        g.style.cursor = used[i] ? 'default' : 'pointer';
        g.setAttribute('opacity', used[i] ? '0.35' : '1');
        var pts = scalePoints(pc.points, SCALE);
        // 自适应缩放到槽位，避免大板块超出上方区域
        var minX=Infinity, maxX=-Infinity, minY=Infinity, maxY=-Infinity;
        pts.forEach(function(p){ minX=Math.min(minX,p[0]); maxX=Math.max(maxX,p[0]); minY=Math.min(minY,p[1]); maxY=Math.max(maxY,p[1]); });
        var bw = Math.max(maxX-minX, 1), bh = Math.max(maxY-minY, 1);
        var fitScale = Math.min((slotW*0.72)/bw, 64/bh, 1);
        var ppts = scalePoints(pts, fitScale);
        var c = center(ppts);
        var x = slotW * (i + 0.5);
        var y = 40;
        var tpts = transform(ppts, c[0], c[1], x, y, 0, false, false);
        var poly = svgPoly(tpts, pc.color, 'poly-palette-piece', '#1b2a4a');
        g.appendChild(poly);
        // name label
        var txt = document.createElementNS('http://www.w3.org/2000/svg','text');
        txt.setAttribute('x', x); txt.setAttribute('y', 78); txt.setAttribute('text-anchor','middle');
        txt.setAttribute('fill','#9fb0d0'); txt.setAttribute('font-size','10'); txt.textContent = pc.name;
        g.appendChild(txt);
        if(!used[i]){
          g.addEventListener('pointerdown', function(ev){ ev.preventDefault(); addPiece(i); });
        }
        palette.appendChild(g);
      });
    }
    function lockBadge(cx, cy){
      var g = document.createElementNS(SVG,'g');
      g.setAttribute('transform','translate('+cx+','+cy+')');
      g.setAttribute('class','poly-lock');
      var body = document.createElementNS(SVG,'rect');
      body.setAttribute('x',-5); body.setAttribute('y',-2); body.setAttribute('width',10); body.setAttribute('height',8);
      body.setAttribute('rx',1.5); body.setAttribute('fill','#2e9e5b');
      var shackle = document.createElementNS(SVG,'path');
      shackle.setAttribute('d','M-3,-2 v-3 a3,3 0 0 1 6,0 v3');
      shackle.setAttribute('fill','none'); shackle.setAttribute('stroke','#2e9e5b'); shackle.setAttribute('stroke-width','1.5');
      g.appendChild(shackle); g.appendChild(body);
      return g;
    }
    function renderBoard(){
      // remove old pieces but keep target layer
      var old = board.querySelectorAll('.poly-piece-onboard, .poly-lock');
      old.forEach(function(el){ el.remove(); });
      placed.forEach(function(p, idx){
        var pc = PIECES[p.pieceIdx];
        var pts = scalePoints(pc.points, SCALE);
        var c = center(pts);
        var tpts = transform(pts, c[0], c[1], p.x, p.y, p.angle, p.flipX, p.flipY);
        var isSel = (sel===p);
        var strokeColor = p.pinned ? '#2e9e5b' : (isSel ? '#f5c96b' : '#1b2a4a');
        var cls = 'poly-piece-onboard' + (isSel ? ' sel' : '');
        var poly = svgPoly(tpts, pc.color, cls, strokeColor);
        poly.setAttribute('stroke-width', (p.pinned || isSel) ? '3' : '1.5');
        if(p.pinned) poly.setAttribute('stroke-dasharray','6,4');
        poly.style.cursor = p.pinned ? 'default' : 'grab';
        poly.dataset.idx = idx;
        board.appendChild(poly);
        if(p.pinned){
          var c0 = center(tpts);
          board.appendChild(lockBadge(c0[0], c0[1]));
        }
      });
    }
    function render(){ renderTarget(); renderPalette(); renderBoard(); updatePinBtn(); }
    function updatePinBtn(){
      if(!pinBtn) return;
      if(!sel){ pinBtn.textContent='📌 固定'; pinBtn.disabled=true; }
      else if(sel.pinned){ pinBtn.textContent='🔓 解锁'; pinBtn.disabled=false; }
      else { pinBtn.textContent='📌 固定'; pinBtn.disabled=false; }
    }

    // ---- actions ----
    function addPiece(idx){
      if(placed.find(function(p){ return p.pieceIdx === idx; })) return;
      placed.push({pieceIdx:idx, x:BOARD_W/2, y:BOARD_H/2, angle:0, flipX:false, flipY:false, pinned:false});
      sel = placed[placed.length-1];
      render();
      msg.textContent = '拖动板块到合适位置，选中后可旋转、翻转、固定';
    }
    function removeSel(){
      if(!sel) return;
      if(sel.pinned){ msg.textContent = '该拼块已固定，先点「解锁」再移除'; return; }
      placed = placed.filter(function(p){ return p !== sel; });
      sel = null; render();
      msg.textContent = '已移除，可从上方重新取出';
    }
    function reset(){
      placed = []; sel = null; render();
      msg.textContent = '已重置，点击上方板块开始拼图';
    }
    function togglePin(){
      if(!sel) return;
      sel.pinned = !sel.pinned;
      render();
      msg.textContent = sel.pinned ? '已固定：该拼块不可移动（点「解锁」可移动）' : '已解锁：可继续拖动/旋转/翻转';
    }

    // ---- drag ----
    var drag = null;
    function toSvg(ev){
      var pt = board.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      return pt.matrixTransform(board.getScreenCTM().inverse());
    }
    function pointInPoly(x, y, poly){
      var inside = false;
      for(var i=0, j=poly.length-1; i<poly.length; j=i++){
        var xi=poly[i][0], yi=poly[i][1];
        var xj=poly[j][0], yj=poly[j][1];
        var intersect = ((yi>y)!=(yj>y)) && (x < (xj-xi)*(y-yi)/(yj-yi)+xi);
        if(intersect) inside = !inside;
      }
      return inside;
    }
    function hitTest(pt){
      for(var i=placed.length-1; i>=0; i--){
        var p = placed[i], pc = PIECES[p.pieceIdx];
        var pts = scalePoints(pc.points, SCALE);
        var c = center(pts);
        var tpts = transform(pts, c[0], c[1], p.x, p.y, p.angle, p.flipX, p.flipY);
        if(pointInPoly(pt.x, pt.y, tpts)) return i;
      }
      return -1;
    }
    board.addEventListener('pointerdown', function(ev){
      var pt = toSvg(ev);
      var idx = hitTest(pt);
      if(idx >= 0){
        sel = placed[idx];
        if(sel.pinned){ drag = null; renderBoard(); }
        else { drag = {p:sel, sx:pt.x, sy:pt.y, ox:sel.x, oy:sel.y}; renderBoard(); }
      } else {
        sel = null; renderBoard();
      }
    });
    window.addEventListener('pointermove', function(ev){
      if(!drag) return;
      var pt = toSvg(ev);
      drag.p.x = drag.ox + (pt.x - drag.sx);
      drag.p.y = drag.oy + (pt.y - drag.sy);
      renderBoard();
    });
    window.addEventListener('pointerup', function(){ drag = null; });
    window.addEventListener('pointercancel', function(){ drag = null; });

    // ---- target cycle ----
    tbtn.onclick = function(){
      if(!TARGETS.length) return;
      targetIdx = (targetIdx + 1) % TARGETS.length;
      render();
    };

    // ---- init ----
    render();
    msg.textContent = '点击上方板块取出，在下方画板拖动、旋转、翻转；确认位置后可点「固定」锁定';
  }

  // ============ 四巧板（自由多边形拼图） ============
  PLAYS.siqiaoban = {
    name:'四巧板',
    mount:function(container){
      var PIECES = [
        {name:'大梯', color:'#f5c96b', points:[[0,0],[9,0],[6,3],[0,3]]},
        {name:'小梯', color:'#4f8cff', points:[[0,0],[5,0],[2,3],[0,3]]},
        {name:'三角', color:'#66bb6a', points:[[0,0],[3,0],[0,3]]},
        {name:'五边', color:'#ef5350', points:[[0,0],[4,0],[7,3],[6,3],[6,6]]}
      ];
      var TARGETS = [
        // 第1级：三岁
        {name:'1-1 长条', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M60,170 L300,170 L300,190 L60,190 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第2级：幼儿园
        {name:'2-1 木马', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,240 L100,210 L130,210 L160,180 L220,180 L250,210 L280,210 L280,240 L250,240 L220,270 L130,270 L100,240 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'2-2 角尺L', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,80 L220,80 L220,120 L120,120 L120,280 L80,280 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'2-3 人', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,80 L180,80 L200,120 L200,160 L220,180 L220,280 L180,280 L180,220 L140,220 L140,280 L100,280 L100,160 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'2-4 斧头', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,180 L220,180 L220,140 L260,140 L260,220 L220,220 L220,260 L100,260 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第3级：初小
        {name:'3-1 路标·箭号', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,180 L180,70 L230,120 L160,190 L290,190 L290,230 L160,230 L230,300 L180,350 L70,240 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'3-2 雁阵·箭号', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,70 L220,110 L220,150 L300,150 L300,190 L220,190 L220,230 L180,270 L140,230 L140,190 L60,190 L60,150 L140,150 L140,110 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'3-3 小船', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M60,240 L120,180 L180,180 L200,160 L240,160 L240,200 L260,220 L260,260 L200,260 L160,300 L100,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'3-4 异形石·折角矩形', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,120 L180,120 L200,140 L260,140 L260,240 L200,240 L180,260 L80,260 L80,220 L140,220 L140,160 L80,160 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第4级：高小
        {name:'4-1 喜鹊', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,250 L120,200 L160,200 L200,160 L240,160 L260,180 L260,220 L240,240 L260,260 L240,280 L200,280 L180,300 L140,300 L100,280 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'4-2 箭号·单箭号', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,70 L240,130 L210,160 L210,290 L150,290 L150,160 L120,130 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'4-3 钩', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M160,80 L220,80 L220,200 L240,220 L240,280 L180,280 L180,240 L160,220 L160,160 L100,160 L100,120 L160,120 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'4-4 菱形', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,70 L290,180 L180,290 L70,180 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第5级：初中
        {name:'5-1 双箭号·飞来去器', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,180 L180,70 L230,120 L160,190 L290,190 L290,230 L160,230 L230,300 L180,350 L70,240 L100,210 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'5-2 卜', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M160,80 L200,80 L200,240 L240,240 L240,280 L120,280 L120,240 L160,240 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'5-3 7', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,80 L240,80 L240,120 L160,160 L160,280 L120,280 L120,140 L200,110 L100,110 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'5-4 三节棍', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,90 L120,70 L160,110 L200,90 L240,130 L280,110 L300,150 L260,170 L220,190 L180,210 L140,230 L100,210 L80,170 L120,150 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第6级：高中
        {name:'6-1 鸭子', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,240 L140,170 L180,170 L220,150 L260,150 L290,180 L290,220 L250,220 L220,250 L180,250 L160,270 L120,270 L90,250 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'6-2 订书机·小人', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,80 L200,80 L220,100 L220,140 L240,140 L260,160 L260,260 L180,260 L180,220 L140,220 L140,260 L100,260 L100,160 L120,140 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'6-3 房子', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,70 L260,130 L260,150 L300,150 L300,290 L180,290 L60,290 L60,150 L100,150 L100,130 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'6-4 庭石·叠砖', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,150 L130,150 L130,110 L230,110 L230,150 L290,150 L290,210 L230,210 L230,250 L130,250 L130,210 L70,210 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第7级：大学
        {name:'7-1 桥', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,230 L130,170 L170,170 L210,140 L250,140 L290,170 L290,230 L250,230 L210,200 L150,200 L110,230 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'7-2 火箭', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,70 L240,140 L220,140 L220,280 L140,280 L140,140 L120,140 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'7-3 狗头', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,150 L140,150 L160,130 L220,130 L240,150 L280,150 L280,220 L240,220 L220,240 L160,240 L140,220 L80,220 L80,190 L120,190 L120,180 L80,180 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'7-4 台阶', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,290 L70,230 L130,230 L130,170 L190,170 L190,110 L250,110 L250,290 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        // 第8级：研究生
        {name:'8-1 火山', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,260 L130,260 L150,200 L210,200 L230,260 L290,260 L290,290 L70,290 Z M160,200 L180,140 L200,200 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          p.setAttribute('fill-rule','evenodd');
          g.appendChild(p);
        }},
        {name:'8-2 T', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,80 L280,80 L280,120 L200,120 L200,280 L160,280 L160,120 L80,120 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'8-3 箭号', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M70,180 L180,70 L290,180 L240,180 L240,290 L120,290 L120,180 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'8-4 手风琴', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,100 L120,70 L160,100 L200,70 L240,100 L280,70 L300,110 L300,260 L260,290 L220,260 L180,290 L140,260 L100,290 L60,260 L60,110 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }}
      ];
      polyPuzzle(container, {pieces:PIECES, targets:TARGETS, scale:14, boardW:320, boardH:320, rotStep:45});
    }
  };

  // ============ 七巧板（自由多边形拼图） ============
  PLAYS.qiqiaoban = {
    name:'七巧板',
    mount:function(container){
      var S2 = Math.SQRT2;
      var PIECES = [
        {name:'大三角1', color:'#f5c96b', points:[[0,0],[2,0],[0,2]]},
        {name:'大三角2', color:'#f5c96b', points:[[0,0],[2,0],[0,2]]},
        {name:'中三角', color:'#4f8cff', points:[[0,0],[S2,0],[0,S2]]},
        {name:'小三角1', color:'#66bb6a', points:[[0,0],[1,0],[0,1]]},
        {name:'小三角2', color:'#b07cf0', points:[[0,0],[1,0],[0,1]]},
        {name:'正方形', color:'#f09a4f', points:[[0,0],[1,0],[1,1],[0,1]]},
        {name:'平行四边', color:'#22d3ee', points:[[0,0],[S2,0],[S2*1.5,S2*0.5],[S2*0.5,S2*0.5]]}
      ];
      var TARGETS = [
        {name:'数字·0', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M300,90 L300,165 L275,155 L275,100 Z M300,195 L300,270 L275,260 L275,205 Z M90,300 L270,300 L260,275 L100,275 Z M60,270 L60,195 L85,205 L85,260 Z M60,90 L60,165 L85,155 L85,100 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·1', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M300,90 L300,165 L275,155 L275,100 Z M300,195 L300,270 L275,260 L275,205 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·2', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M300,90 L300,165 L275,155 L275,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z M60,270 L60,195 L85,205 L85,260 Z M90,300 L270,300 L260,275 L100,275 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·3', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M300,90 L300,165 L275,155 L275,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z M300,195 L300,270 L275,260 L275,205 Z M90,300 L270,300 L260,275 L100,275 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·4', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M60,90 L60,165 L85,155 L85,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z M300,90 L300,165 L275,155 L275,100 Z M300,195 L300,270 L275,260 L275,205 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·5', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M60,90 L60,165 L85,155 L85,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z M300,195 L300,270 L275,260 L275,205 Z M90,300 L270,300 L260,275 L100,275 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·6', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M60,90 L60,165 L85,155 L85,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z M60,270 L60,195 L85,205 L85,260 Z M90,300 L270,300 L260,275 L100,275 Z M300,195 L300,270 L275,260 L275,205 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·7', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M300,90 L300,165 L275,155 L275,100 Z M300,195 L300,270 L275,260 L275,205 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·8', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M300,90 L300,165 L275,155 L275,100 Z M300,195 L300,270 L275,260 L275,205 Z M90,300 L270,300 L260,275 L100,275 Z M60,270 L60,195 L85,205 L85,260 Z M60,90 L60,165 L85,155 L85,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'数字·9', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,60 L270,60 L260,85 L100,85 Z M300,90 L300,165 L275,155 L275,100 Z M60,90 L60,165 L85,155 L85,100 Z M90,180 L270,180 L260,205 L100,205 L100,155 L260,155 Z M300,195 L300,270 L275,260 L275,205 Z M90,300 L270,300 L260,275 L100,275 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·A', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180.0,60 L285,300 L250,300 L240,200.0 L120,200.0 L110,300 L75,300 L200.0,110 L160.0,110 Z M165.0,210.0 L195.0,210.0 L205.0,235.0 L155.0,235.0 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·B', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L255,60 L285,100 L285,160.0 L265,180.0 L285,200.0 L285,260 L255,300 L75,300 Z M110,95 L250,95 L265,115 L110,115 Z M110,195.0 L250,195.0 L265,215.0 L110,215.0 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·C', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M255,60 L285,60 L285,95 L250,95 L110,150.0 L110,210.0 L250,265 L285,265 L285,300 L255,300 L75,120 L75,240 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·D', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L255,60 L285,110 L285,250 L255,300 L75,300 Z M110,100 L245,100 L245,260 L110,260 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·E', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L285,60 L285,95 L110,95 L110,160.0 L265,160.0 L265,200.0 L110,200.0 L110,265 L285,265 L285,300 L75,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·F', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L285,60 L285,95 L110,95 L110,160.0 L265,160.0 L265,200.0 L110,200.0 L110,300 L75,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·G', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M255,60 L285,60 L285,95 L250,95 L110,150.0 L110,180.0 L265,180.0 L265,210.0 L250,265 L110,265 L75,240 L75,120 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·H', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L110,60 L110,155.0 L250,155.0 L250,60 L285,60 L285,300 L250,300 L250,205.0 L110,205.0 L110,300 L75,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·I', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M105,60 L255,60 L255,90 L195.0,90 L195.0,270 L255,270 L255,300 L105,300 L105,270 L165.0,270 L165.0,90 L105,90 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·J', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M255,60 L285,60 L285,250 L255,280 L125,280 L105,250 L250,250 L250,95 L255,95 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·K', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L110,60 L110,150.0 L255,60 L285,60 L125,180.0 L285,300 L255,300 L110,210.0 L110,300 L75,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·L', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L110,60 L110,265 L285,265 L285,300 L75,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·M', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,300 L75,60 L110,60 L180.0,120 L250,60 L285,60 L285,300 L250,300 L250,150 L180.0,210 L110,150 L110,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·N', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,300 L75,60 L110,60 L250,260 L250,60 L285,60 L285,300 L250,300 L110,100 L110,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·O', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180.0,60 L285,110 L285,250 L180.0,300 L75,250 L75,110 Z M180.0,105 L240,135 L240,225 L180.0,255 L120,225 L120,135 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·P', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L255,60 L285,100 L285,160.0 L255,180.0 L110,180.0 L110,300 L75,300 Z M110,95 L250,95 L265,115 L110,115 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·Q', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180.0,60 L285,110 L285,250 L180.0,300 L75,250 L75,110 Z M265,260 L295,290 L275,290 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·R', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L255,60 L285,100 L285,160.0 L255,180.0 L285,300 L250,300 L110,205.0 L110,300 L75,300 Z M110,95 L250,95 L265,115 L110,115 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·S', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M285,60 L285,95 L125,95 L110,115 L110,165.0 L285,165.0 L285,195.0 L255,265 L75,265 L75,300 L75,265 L255,265 L285,195.0 L285,165.0 L110,165.0 L110,115 L125,95 L285,95 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·T', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M105,60 L255,60 L255,95 L198.0,95 L198.0,300 L162.0,300 L162.0,95 L105,95 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·U', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L110,60 L110,250 L180.0,280 L250,250 L250,60 L285,60 L285,250 L180.0,300 L75,250 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·V', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L110,60 L180.0,250 L250,60 L285,60 L180.0,300 L75,60 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·W', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L105,60 L140.0,250 L180.0,280 L220.0,250 L255,60 L285,60 L255,300 L210.0,270 L180.0,300 L150.0,270 L105,300 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·X', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L105,60 L180.0,140.0 L255,60 L285,60 L205.0,180.0 L285,300 L255,300 L180.0,220.0 L105,300 L75,300 L155.0,180.0 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·Y', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L110,60 L180.0,150.0 L250,60 L285,60 L200.0,180.0 L200.0,300 L160.0,300 L160.0,180.0 L75,60 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'字母·Z', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M75,60 L285,60 L285,95 L125,95 L285,265 L285,300 L75,300 L75,265 L235,265 L75,95 L75,60 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·鼠', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,100 L150,80 L180,90 L200,120 L220,110 L240,140 L230,170 L200,190 L160,200 L130,190 L110,160 L120,130 L140,110 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·牛', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,140 L130,110 L170,110 L200,140 L230,130 L250,160 L250,200 L220,220 L180,220 L150,200 L120,200 L100,180 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·虎', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M90,200 L130,160 L170,160 L210,180 L250,170 L270,200 L250,230 L210,250 L170,250 L130,230 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·兔', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M140,190 L170,170 L190,170 L210,150 L240,150 L260,170 L260,200 L240,220 L200,220 L180,240 L150,240 L130,220 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·龙', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,200 L120,160 L160,160 L200,180 L240,160 L280,180 L260,220 L220,240 L180,240 L140,220 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·蛇', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,240 L120,220 L100,180 L120,140 L180,120 L220,140 L240,180 L220,220 L180,200 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·马', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,210 L140,170 L180,170 L220,190 L260,180 L290,210 L270,240 L220,250 L170,250 L130,230 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·羊', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,200 L140,160 L180,160 L220,190 L260,180 L280,210 L260,240 L220,250 L160,250 L120,230 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·猴', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,210 L150,190 L180,190 L210,170 L240,180 L250,210 L230,240 L190,250 L150,250 L120,230 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·鸡', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M150,220 L150,160 L190,140 L230,160 L230,220 L190,240 L160,220 L150,200 L180,160 L210,160 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·狗', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,220 L130,180 L170,180 L210,200 L250,190 L270,220 L250,250 L210,260 L160,260 L120,240 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'生肖·猪', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,220 L120,180 L150,170 L200,170 L240,180 L260,210 L240,240 L180,250 L140,250 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·人', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,60 L200,120 L230,150 L230,260 L190,260 L190,180 L170,180 L170,260 L130,260 L130,150 L160,120 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·鸟', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,180 L160,140 L200,140 L240,120 L280,140 L260,180 L220,200 L180,200 L140,220 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·鱼', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,180 L120,140 L220,140 L260,180 L260,200 L220,240 L120,240 L80,200 L260,190 L300,170 L300,210 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·船', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,220 L120,180 L240,180 L280,220 L260,250 L100,250 L140,180 L140,140 L180,140 L180,180 L220,140 L220,180 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·屋', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M100,240 L100,160 L180,100 L260,160 L260,240 L140,240 L140,190 L180,190 L180,240 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·山', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M80,260 L120,140 L180,220 L240,120 L300,260 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·心', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M180,120 L220,80 L260,120 L280,180 L180,260 L80,180 L100,120 L140,80 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·猫', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M140,210 L140,170 L170,150 L210,150 L240,170 L240,210 L220,240 L160,240 L170,150 L160,120 L180,130 L200,150 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·椅', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,240 L120,160 L160,160 L160,240 L120,160 L100,120 L180,120 L160,160 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }},
        {name:'其他·桌', draw:function(g){
          var p = document.createElementNS('http://www.w3.org/2000/svg','path');
          p.setAttribute('d','M120,240 L120,180 L100,180 L100,160 L260,160 L260,180 L240,180 L240,240 L200,180 L200,120 L160,120 L160,180 Z');
          p.setAttribute('fill','rgba(245,201,107,0.10)');
          p.setAttribute('stroke','rgba(245,201,107,0.45)'); p.setAttribute('stroke-width','2'); p.setAttribute('stroke-dasharray','5,4');
          g.appendChild(p);
        }}
      ];
      polyPuzzle(container, {pieces:PIECES, targets:TARGETS, scale:70, boardW:340, boardH:340, rotStep:45});
    }
  };

  // ============ 虚拟魔方（3D 等距投影，可试玩） ============
  PLAYS.mofang = {
    name:'虚拟魔方',
    mount:function(container){
      var W=cssW(container);
      var st=stage(container,W,W), ctx=st.ctx;
      var unit=Math.max(30,Math.min(Math.floor(W/6),64));
      var cx=W/2, cy=W/2;
      var C={U:'#f2f4f7',D:'#ffd23f',F:'#22c55e',B:'#3b82f6',R:'#ef4444',L:'#f97316'};
      var FACES=['U','D','F','B','L','R'];
      var cubies=[];
      function init(){
        cubies=[];
        for(var x=0;x<3;x++)for(var y=0;y<3;y++)for(var z=0;z<3;z++){
          cubies.push({x:x,y:y,z:z,st:{
            U:y===2?C.U:null, D:y===0?C.D:null,
            F:z===2?C.F:null, B:z===0?C.B:null,
            L:x===0?C.L:null, R:x===2?C.R:null
          }});
        }
      }
      function project(x,y,z){
        var X=x-1.5,Y=y-1.5,Z=z-1.5;
        return [cx+(X-Z)*0.866*unit, cy+(X+Z)*0.5*unit-Y*unit];
      }
      var LAYER={U:'y',D:'y',F:'z',B:'z',R:'x',L:'x'};
      var LAYERV={U:2,D:0,F:2,B:0,R:2,L:0};
      var PERM={
        U:{F:'R',R:'B',B:'L',L:'F',U:'U',D:'D'},
        D:{F:'L',L:'B',B:'R',R:'F',U:'U',D:'D'},
        F:{U:'L',R:'U',D:'R',L:'D',F:'F',B:'B'},
        B:{U:'R',R:'D',D:'L',L:'U',F:'F',B:'B'},
        R:{B:'U',U:'F',F:'D',D:'B',R:'R',L:'L'},
        L:{F:'U',D:'F',B:'D',U:'B',R:'R',L:'L'}
      };
      function rotateOnce(face){
        var axis=LAYER[face], v=LAYERV[face];
        var aff=cubies.filter(function(c){return c[axis]===v;});
        aff.forEach(function(c){
          var ox=c.x,oy=c.y,oz=c.z,nx,ny,nz;
          switch(face){
            case 'U': nx=2-oz;ny=2;nz=ox;break;
            case 'D': nx=oz;ny=0;nz=2-ox;break;
            case 'F': nx=oy;ny=2-ox;nz=2;break;
            case 'B': nx=2-oy;ny=ox;nz=0;break;
            case 'R': nx=2;ny=oz;nz=2-oy;break;
            case 'L': nx=0;ny=2-oz;nz=oy;break;
          }
          c.x=nx;c.y=ny;c.z=nz;
        });
        var perm=PERM[face];
        aff.forEach(function(c){
          var old=c.st,ns={};
          for(var k in old){ns[k]=old[perm[k]];}
          c.st=ns;
        });
      }
      function rotate(face,dir){
        var t=dir===-1?3:1;
        for(var i=0;i<t;i++)rotateOnce(face);
        draw();
      }
      function stickerPoly(x,y,z,face){
        var pts;
        if(face==='F')pts=[[x,y,3],[x+1,y,3],[x+1,y+1,3],[x,y+1,3]];
        else if(face==='U')pts=[[x,3,z],[x+1,3,z],[x+1,3,z+1],[x,3,z+1]];
        else pts=[[3,y,z],[3,y,z+1],[3,y+1,z+1],[3,y+1,z]];
        return pts.map(function(p){return project(p[0],p[1],p[2]);});
      }
      function draw(){
        ctx.fillStyle='#0b1226';ctx.fillRect(0,0,W,W);
        var order=cubies.slice().sort(function(a,b){return (a.x+a.y+a.z)-(b.x+b.y+b.z);});
        order.forEach(function(c){
          if(c.x===2)fillSticker(c,'R');
          if(c.y===2)fillSticker(c,'U');
          if(c.z===2)fillSticker(c,'F');
        });
      }
      function fillSticker(c,face){
        var col=c.st[face];if(!col)return;
        var p=stickerPoly(c.x,c.y,c.z,face);
        ctx.fillStyle=col;
        ctx.beginPath();
        ctx.moveTo(p[0][0],p[0][1]);
        for(var i=1;i<4;i++)ctx.lineTo(p[i][0],p[i][1]);
        ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(10,15,30,.35)';ctx.lineWidth=1;ctx.stroke();
      }
      function scramble(){
        var seq=[];var last='';
        for(var i=0;i<24;i++){
          var f=FACES[Math.floor(Math.random()*6)];
          if(f===last){i--;continue;}
          last=f;
          var d=Math.random()<0.5?1:-1;
          rotateOnce(f);if(d===-1){rotateOnce(f);rotateOnce(f);}
        }
        draw();msg.textContent='已打乱，试试转回来吧（下方按钮转动各层）';
      }
      function reset(){
        init();draw();msg.textContent='已复原。点击下方按钮转动各层，或点"打乱"开始试玩';
      }
      var msg=bar(container);
      var pad=$('div');pad.style.cssText='display:grid;grid-template-columns:repeat(6,1fr);gap:6px;width:100%;max-width:360px;margin:4px 0';
      FACES.forEach(function(f){
        var b1=$('button');b1.className='btn small ghost';b1.textContent=f;b1.onclick=function(){rotate(f,1);};
        var b2=$('button');b2.className='btn small ghost';b2.textContent=f+"'";b2.onclick=function(){rotate(f,-1);};
        pad.appendChild(b1);pad.appendChild(b2);
      });
      container.appendChild(pad);
      var hint=$('div');hint.style.cssText='text-align:center;font-size:11px;color:#9fb0d0;margin:2px';hint.textContent='X＝顺时针转 90°，X\'＝逆时针转 90°（前 F · 上 U · 右 R 三面可见）';
      container.appendChild(hint);
      var ct=ctl(container,[{key:'scramble',label:'打乱',fn:scramble},{key:'reset',label:'复原',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      init();draw();msg.textContent='可试玩的 3D 魔方：点按钮转动各层';
    }
  };

  window.PLAYS = PLAYS;

  // ============ 魔方解法（公式说明，纯内容） ============
  window.MOFANG_HTML = function(){
    var sec=function(t,html){return '<div class="section"><h2>'+t+'</h2>'+html+'</div>';};
    var fml=function(t,code){return '<div class="fml"><div class="t">'+t+'</div><code>'+code+'</code></div>';};
    var p='<p style="font-size:13.5px;line-height:1.9;color:#eaf0ff">';
    var h='';
    h+='<div class="rules">';
    h+='<div class="note">采用最常用的<b>层先法（CFOP 入门）</b>。字母含义：<b>R</b>右面顺时针、<b>R\'</b>右面逆时针、<b>U</b>顶面顺时针、<b>U\'</b>顶面逆时针、<b>F</b>前面、<b>B</b>后面、<b>L</b>左面、<b>D</b>底面；带 2 表示转 180°。白面为底、黄面为顶。</div>';
    h+=sec('第 1 步 · 底层白十字','<p>把四个白色棱块转到黄色顶面围成十字（先不管侧面颜色），再用 <code>R U R\' U\'</code> 或 <code>F\' U\' F</code> 把每个白棱送回底层，让侧面中心色对齐。</p>');
    h+=sec('第 2 步 · 底层四角', fml('底角归位','把目标角块放到右上角，循环：\nR U R\' U\'（右前角向上翻）\n重复直到角块正确归位。'));
    h+=sec('第 3 步 · 中层棱块', fml('中层归位','棱块在顶层 → 往右插：U R U\' R\' U\' F\' U F\n棱块在顶层 → 往左插：U\' L\' U L U F U\' F\''));
    h+=sec('第 4 步 · 顶层黄十字', fml('黄十字','一字形：F R U R\' U\' F\'\n小拐角：F U R U\' R\' F\''));
    h+=sec('第 5 步 · 顶层角块位置', fml('角块位置（换角）','U R U\' L\' U R\' U\' L\n重复 1~2 次使四个角块位置正确。'));
    h+=sec('第 6 步 · 顶层角块方向', fml('翻角','把未翻好的角放到右前，执行：R\' D\' R D（重复 2 或 4 次）\n翻好一个后转动顶层（U）处理下一个。'));
    h+=sec('第 7 步 · 顶层棱块归位', fml('换棱（三棱循环）','顺时针：R U\' R U R U R U\' R\' U\' R2\n逆时针：L\' U L\' U\' L\' U\' L\' U L U L2'));
    h+='<div class="note">提示：新手先练熟 <code>R U R\' U\'</code> 这个万能手法，90% 的情况都能用它处理。反复练习即可形成肌肉记忆。</div>';
    h+='</div>';
    return h;
  };
})();
