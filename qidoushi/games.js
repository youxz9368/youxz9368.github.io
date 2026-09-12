/* 棋斗士 · 6 款人机对战游戏引擎 */
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
  function aiPlay(fn){var id=setTimeout(fn,260);(window.__T=window.__T||[]).push(id);}
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

  var GAMES = {};

  // ============ 1. 五子棋 ============
  GAMES.gomoku = {
    name:'五子棋',
    mount:function(container,cfg){
      var N=15, W=cssW(container), S=W/(N+1);
      var st=stage(container,W,W), ctx=st.ctx;
      var b=[],i,j;for(i=0;i<N;i++){b.push([]);for(j=0;j<N;j++)b[i].push(0);}
      var me=cfg.me==='white'?2:1, opp=me===1?2:1, ai=cfg.mode==='human'?'':opp;
      var turn=cfg.first==='me'?me:opp, over=false, last=null;
      var msg=bar(container);
      var ct=ctl(container,[{key:'again',label:'重开',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);

      function bar(container){var d=$('div');d.className='game-msg';container.appendChild(d);return d;}
      function ctl(container,btns){var d=$('div');d.className='game-ctl';container.appendChild(d);var o={};btns.forEach(function(x){var e=$('button');e.className='btn small '+(x.cls||'ghost');e.textContent=x.label;e.onclick=x.fn;d.appendChild(e);o[x.key]=e;});return o;}

      function draw(){
        ctx.fillStyle='#14203a';ctx.fillRect(0,0,W,W);
        ctx.strokeStyle='#5a6b8c';ctx.lineWidth=1;
        for(var r=0;r<N;r++){ctx.beginPath();ctx.moveTo(S,S+r*S);ctx.lineTo(S+(N-1)*S,S+r*S);ctx.stroke();}
        for(var c=0;c<N;c++){ctx.beginPath();ctx.moveTo(S+c*S,S);ctx.lineTo(S+c*S,S+(N-1)*S);ctx.stroke();}
        for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(b[r][c]){
          ctx.beginPath();ctx.arc(S+c*S,S+r*S,S*0.42,0,7);ctx.fillStyle=b[r][c]===1?'#222':'#f2f2f2';ctx.fill();ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.stroke();
        }
        if(last){ctx.strokeStyle='#f5c96b';ctx.lineWidth=2;ctx.strokeRect(S+last.c*S-S*0.4,S+last.r*S-S*0.4,S*0.8,S*0.8);}
      }
      function chk(r,c,col){
        var d=[[1,0],[0,1],[1,1],[1,-1]];
        for(var k=0;k<4;k++){var n=1,dr=d[k][0],dc=d[k][1];
          for(var rr=r+dr,cc=c+dc;rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr][cc]===col;rr+=dr,cc+=dc)n++;
          for(var rr2=r-dr,cc2=c-dc;rr2>=0&&rr2<N&&cc2>=0&&cc2<N&&b[rr2][cc2]===col;rr2-=dr,cc2-=dc)n++;
          if(n>=5)return true;}
        return false;
      }
      function near(r,c){for(var dr=-2;dr<=2;dr++)for(var dc=-2;dc<=2;dc++){var rr=r+dr,cc=c+dc;if(rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr][cc])return true;}return false;}
      function lineScore(r,c,col){
        var d=[[1,0],[0,1],[1,1],[1,-1]],tot=0;
        for(var k=0;k<4;k++){var dr=d[k][0],dc=d[k][1],cnt=1,open=0;
          for(var rr=r+dr,cc=c+dc;rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr][cc]===col;rr+=dr,cc+=dc)cnt++;
          if(rr>=0&&rr<N&&cc>=0&&cc<N&&b[rr][cc]===0)open++;
          for(var rr2=r-dr,cc2=c-dc;rr2>=0&&rr2<N&&cc2>=0&&cc2<N&&b[rr2][cc2]===col;rr2-=dr,cc2-=dc)cnt++;
          if(rr2>=0&&rr2<N&&cc2>=0&&cc2<N&&b[rr2][cc2]===0)open++;
          if(cnt>=5)tot+=100000;
          else if(cnt===4)tot+=open>=2?50000:8000;
          else if(cnt===3)tot+=open>=2?4000:600;
          else if(cnt===2)tot+=open>=2?500:60;
        }
        return tot;
      }
      function aiMove(){
        var best=-1,br=-1,bc=-1;
        var cand=[];for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(!b[r][c]&&near(r,c))cand.push([r,c]);
        if(!cand.length)cand.push([7,7]);
        for(var k=0;k<cand.length;k++){var r=cand[k][0],c=cand[k][1];
          var atk=lineScore(r,c,ai),def=lineScore(r,c,me);
          var sc=atk+def*0.92+Math.random()*10;
          if(sc>best){best=sc;br=r;bc=c;}
        }
        place(br,bc,ai);
      }
      function place(r,c,col){
        if(over||b[r][c])return;
        b[r][c]=col;last={r:r,c:c};draw();
        if(chk(r,c,col)){over=true;msg.textContent=(col===me?'你':'电脑')+'获胜！五子连珠 🎉';return;}
        turn=col===1?2:1;
        if(turn===me){msg.textContent='轮到你（'+(me===1?'黑':'白')+'方）落子';}
        else if(turn===ai){msg.textContent='电脑思考中…';aiPlay(function(){if(!over)aiMove();});}
        else{msg.textContent='轮到对方落子';}
      }
      function reset(){b=[];for(i=0;i<N;i++){b.push([]);for(j=0;j<N;j++)b[i].push(0);}over=false;last=null;turn=cfg.first==='me'?me:opp;draw();if(turn===ai){msg.textContent='电脑先手…';aiPlay(function(){if(!over)aiMove();});}else msg.textContent='轮到你落子';}
      st.c.onclick=function(e){
        if(over||turn!==me)return;
        var x=e.offsetX,y=e.offsetY,c=Math.round(x/S-1),r=Math.round(y/S-1);
        if(r<0||r>=N||c<0||c>=N)return;
        place(r,c,me);
      };
      draw();reset();
    }
  };

  // ============ 2. 跳棋（双人 Halma，精简棋盘） ============
  GAMES.halma = {
    name:'跳棋',
    mount:function(container,cfg){
      var W=cssW(container);
      var st=stage(container,W,W),ctx=st.ctx;
      var msg=bar(container);
      var ct=ctl(container,[{key:'again',label:'重开',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      // 轴向六边形坐标
      var DIR=[[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
      var cells=[];
      (function(){for(var q=-3;q<=3;q++)for(var r=-3;r<=3;r++)if(Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=3)cells.push([q,r]);})();
      function hexKey(q,r){return q+','+r;}
      var HOME_A={'3,-3':1,'3,-2':1,'3,-1':1,'2,-2':1,'2,-1':1,'1,-1':1};   // 红方家（东）
      var HOME_B={'-3,3':1,'-3,2':1,'-3,1':1,'-2,2':1,'-2,1':1,'-1,1':1};   // 蓝方家（西）
      function inHome(key,hm){return !!hm[key];}
      // 红=A(东→西), 蓝=B(西→东)
      var me=cfg.me==='blue'?'B':'A', opp=me==='A'?'B':'A', ai=cfg.mode==='human'?'':opp;
      var pos={A:[],B:[]}, occ={}, turn, over=false;
      var SIZE=W/ (Math.sqrt(3)*6.4);
      function px(q,r){var x=W/2+SIZE*Math.sqrt(3)*(q+r/2);var y=W/2+SIZE*1.5*r;return[x,y];}
      function dist(a,b){var q=a[0]-b[0],r=a[1]-b[1];return (Math.abs(q)+Math.abs(r)+Math.abs(q+r))/2;}
      function targetCells(col){return col==='A'?cells.filter(function(c){return inHome(hexKey(c[0],c[1]),HOME_B);}):cells.filter(function(c){return inHome(hexKey(c[0],c[1]),HOME_A);});}
      function onBoard(q,r){return Math.max(Math.abs(q),Math.abs(r),Math.abs(q+r))<=3;}
      function setup(){
        pos={A:[],B:[]};occ={};
        cells.forEach(function(c){var k=hexKey(c[0],c[1]);if(HOME_A[k]){pos.A.push([c[0],c[1]]);occ[k]='A';}});
        cells.forEach(function(c){var k=hexKey(c[0],c[1]);if(HOME_B[k]){pos.B.push([c[0],c[1]]);occ[k]='B';}});
        turn=cfg.first==='me'?me:opp;
      }
      function moves(col){
        var res=[];
        pos[col].forEach(function(p){
          var visited={};
          // 单步走（仅从起点）
          DIR.forEach(function(d){
            var nq=p[0]+d[0],nr=p[1]+d[1],nk=hexKey(nq,nr);
            if(onBoard(nq,nr)&&!occ[nk])res.push({from:p,to:[nq,nr],hop:0});
          });
          // 连续跳跃（跳后只能继续跳）
          (function hop(q,r){
            DIR.forEach(function(d){
              var nq=q+d[0],nr=r+d[1],nk=hexKey(nq,nr);
              if(!onBoard(nq,nr)||!occ[nk])return;
              var jq=nq+d[0],jr=nr+d[1],jk=hexKey(jq,jr);
              if(onBoard(jq,jr)&&!occ[jk]&&!visited[jk]){visited[jk]=1;res.push({from:p,to:[jq,jr],hop:1});hop(jq,jr);}
            });
          })(p[0],p[1]);
        });
        return res;
      }
      function doMove(m){
        var k0=hexKey(m.from[0],m.from[1]),k1=hexKey(m.to[0],m.to[1]);
        delete occ[k0];occ[k1]=turn;
        for(var i=0;i<pos[turn].length;i++){if(pos[turn][i][0]===m.from[0]&&pos[turn][i][1]===m.from[1]){pos[turn][i]=m.to;break;}}
      }
      function won(col){
        var t=targetCells(col),ok=true;
        pos[col].forEach(function(p){var k=hexKey(p[0],p[1]);var inside=t.some(function(tc){return tc[0]===p[0]&&tc[1]===p[1];});if(!inside)ok=false;});
        return ok;
      }
      function aiMove(){
        var targ=targetCells(ai),best=null,bestGain=-1e9,bestBack=1e9;
        moves(ai).forEach(function(m){
          var before=1e9;pos[ai].forEach(function(p){targ.forEach(function(t){before=Math.min(before,dist(p,t));});});
          var after=1e9;targ.forEach(function(t){after=Math.min(after,dist(m.to,t));});
          var gain=before-after;
          if(gain>bestGain||(gain===bestGain&&before<bestBack)){bestGain=gain;bestBack=before;best=m;}
        });
        if(best){doMove(best);}else{turn=turn==='A'?'B':'A';}
        afterTurn();
      }
      function afterTurn(){
        draw();
        if(won(turn)){over=true;msg.textContent=(turn===me?'你':'电脑')+'获胜！全部棋子到达对岸 🎉';return;}
        turn=turn==='A'?'B':'A';
        if(turn===me)msg.textContent='轮到你走子（点己方棋子再点目标）';
        else if(turn===ai){msg.textContent='电脑思考中…';aiPlay(aiMove);}
        else msg.textContent='轮到对方走子';
      }
      function draw(){
        ctx.fillStyle='#14203a';ctx.fillRect(0,0,W,W);
        ctx.strokeStyle='#5a6b8c';ctx.lineWidth=1;
        cells.forEach(function(c){var p=px(c[0],c[1]);ctx.beginPath();ctx.arc(p[0],p[1],SIZE*0.45,0,7);ctx.stroke();});
        // 目标区高亮
        cells.forEach(function(c){var k=hexKey(c[0],c[1]);if(HOME_B[k]){var p=px(c[0],c[1]);ctx.fillStyle='rgba(79,140,255,.18)';ctx.beginPath();ctx.arc(p[0],p[1],SIZE*0.45,0,7);ctx.fill();}});
        cells.forEach(function(c){var k=hexKey(c[0],c[1]);if(HOME_A[k]){var p=px(c[0],c[1]);ctx.fillStyle='rgba(239,83,80,.18)';ctx.beginPath();ctx.arc(p[0],p[1],SIZE*0.45,0,7);ctx.fill();}});
        pos.A.forEach(function(p){var q=px(p[0],p[1]);ctx.fillStyle='#ef5350';ctx.beginPath();ctx.arc(q[0],q[1],SIZE*0.4,0,7);ctx.fill();ctx.strokeStyle='#ffd';ctx.stroke();});
        pos.B.forEach(function(p){var q=px(p[0],p[1]);ctx.fillStyle='#4f8cff';ctx.beginPath();ctx.arc(q[0],q[1],SIZE*0.4,0,7);ctx.fill();ctx.strokeStyle='#ffd';ctx.stroke();});
        if(sel){var q=px(sel[0],sel[1]);ctx.strokeStyle='#f5c96b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(q[0],q[1],SIZE*0.5,0,7);ctx.stroke();}
      }
      var sel=null, hints=[];
      function click(e){
        if(over||turn!==me)return;
        var x=e.offsetX,y=e.offsetY,best=null,bd=1e9;
        cells.forEach(function(c){var p=px(c[0],c[1]);var d=(p[0]-x)*(p[0]-x)+(p[1]-y)*(p[1]-y);if(d<bd){bd=d;best=c;}});
        var k=hexKey(best[0],best[1]);
        if(sel){
          var hit=hints.find(function(m){return m.to[0]===best[0]&&m.to[1]===best[1];});
          if(hit){sel=null;hints=[];doMove(hit);afterTurn();return;}
          if(occ[k]===me){sel=[best[0],best[1]];hints=moves(me).filter(function(m){return m.from[0]===best[0]&&m.from[1]===best[1];});draw();return;}
          sel=null;hints=[];draw();return;
        }
        if(occ[k]===me){sel=[best[0],best[1]];hints=moves(me).filter(function(m){return m.from[0]===best[0]&&m.from[1]===best[1];});}
        else {sel=null;hints=[];}
        draw();
      }
      function reset(){setup();over=false;sel=null;hints=[];draw();if(turn===me)msg.textContent='轮到你（'+(me==='A'?'红':'蓝')+'方）走子';else if(turn===ai){msg.textContent='电脑先手…';aiPlay(aiMove);}else msg.textContent='轮到对方走子';}
      st.c.onclick=click;
      setup();draw();
      if(turn===me)msg.textContent='轮到你（'+(me==='A'?'红':'蓝')+'方）走子';else if(turn===ai){msg.textContent='电脑先手…';aiPlay(aiMove);}else msg.textContent='轮到对方走子';
    }
  };

  // ============ 3. 围棋（9路精简） ============
  GAMES.go = {
    name:'围棋',
    mount:function(container,cfg){
      var N=parseInt(cfg.size||9),W=cssW(container),S=W/(N+1);
      var st=stage(container,W,W),ctx=st.ctx;
      var b=[],i,j;for(i=0;i<N;i++){b.push([]);for(j=0;j<N;j++)b[i].push(0);}
      var me=cfg.me==='white'?2:1, opp=me===1?2:1, ai=cfg.mode==='human'?'':opp;
      var turn=cfg.first==='me'?me:opp, over=false, passes=0, cap={1:0,2:0}, koPoint=null, lastMove=null;
      var msg=bar(container);
      var ct=ctl(container,[{key:'pass',label:'虚手',fn:doPass},{key:'again',label:'重开',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);

      function starPoints(N){
        if(N===9)return [[2,2],[2,6],[6,2],[6,6],[4,4]];
        if(N===13)return [[3,3],[3,6],[3,9],[6,3],[6,6],[6,9],[9,3],[9,6],[9,9]];
        return [[3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]];
      }
      function group(r,c,col,seen){
        var q=[[r,c]],grp=[],seen=seen||{};
        seen[r+','+c]=1;
        while(q.length){var p=q.pop();grp.push(p);var rr=p[0],cc=p[1];
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=rr+d[0],nc=cc+d[1];
            if(nr>=0&&nr<N&&nc>=0&&nc<N&&b[nr][nc]===col&&!seen[nr+','+nc]){seen[nr+','+nc]=1;q.push([nr,nc]);}});
        }
        return grp;
      }
      function liberties(grp){var lib={};grp.forEach(function(p){[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=p[0]+d[0],nc=p[1]+d[1];if(nr>=0&&nr<N&&nc>=0&&nc<N&&b[nr][nc]===0)lib[nr+','+nc]=1;});});return Object.keys(lib).length;}
      function draw(){
        ctx.fillStyle='#d9b877';ctx.fillRect(0,0,W,W);
        ctx.strokeStyle='#6b5426';ctx.lineWidth=1;
        for(var r=0;r<N;r++){ctx.beginPath();ctx.moveTo(S,S+r*S);ctx.lineTo(S+(N-1)*S,S+r*S);ctx.stroke();}
        for(var c=0;c<N;c++){ctx.beginPath();ctx.moveTo(S+c*S,S);ctx.lineTo(S+c*S,S+(N-1)*S);ctx.stroke();}
        starPoints(N).forEach(function(sp){ctx.fillStyle='#6b5426';ctx.beginPath();ctx.arc(S+sp[0]*S,S+sp[1]*S,Math.max(2,S*0.07),0,7);ctx.fill();});
        for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(b[r][c]){var g=ctx.createRadialGradient(S+c*S,S+r*S,2,S+c*S,S+r*S,S*0.44);if(b[r][c]===1){g.addColorStop(0,'#555');g.addColorStop(1,'#111');}else{g.addColorStop(0,'#fff');g.addColorStop(1,'#ccc');}ctx.fillStyle=g;ctx.beginPath();ctx.arc(S+c*S,S+r*S,S*0.44,0,7);ctx.fill();}
        if(lastMove){ctx.strokeStyle='#ef5350';ctx.lineWidth=2;ctx.strokeRect(S+lastMove[1]*S-3,S+lastMove[0]*S-3,6,6);}
      }
      function tryPlace(r,c,col){
        if(b[r][c])return false;
        b[r][c]=col;
        var captured=[],capAt=null;
        var opp=col===1?2:1;
        // 吃对方
        [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];
          if(nr>=0&&nr<N&&nc>=0&&nc<N&&b[nr][nc]===opp){
            var g=group(nr,nc,opp);if(liberties(g)===0){g.forEach(function(p){b[p[0]][p[1]]=0;captured.push([p[0],p[1]]);});}
          }});
        if(captured.length===1)capAt=captured[0];
        // 自杀检查
        var self=group(r,c,col);
        if(liberties(self)===0){ b[r][c]=0; captured.forEach(function(p){b[p[0]][p[1]]=opp;}); return false; }
        // 劫（简单）：只吃一子且该点是劫点
        if(captured.length===1&&koPoint&&capAt&&koPoint[0]===capAt[0]&&koPoint[1]===capAt[1]){ b[r][c]=0; captured.forEach(function(p){b[p[0]][p[1]]=opp;}); return false; }
        cap[col]+=captured.length;
        koPoint=(captured.length===1&&capAt)?capAt:null;
        lastMove=[r,c];
        return true;
      }
      function aiMove(){
        var level=parseInt(cfg.level||2),mid=Math.floor(N/2);
        var cand=[],r,c;
        for(r=0;r<N;r++)for(c=0;c<N;c++)if(!b[r][c]){var near=false;[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];if(nr>=0&&nr<N&&nc>=0&&nc<N&&b[nr][nc])near=true;});if(near||Math.random()<0.04)cand.push([r,c]);}
        if(!cand.length)cand.push([mid,mid]);
        if(level===1){
          var pick=cand[Math.floor(Math.random()*cand.length)];
          if(tryPlace(pick[0],pick[1],ai))draw();
          afterTurn();return;
        }
        var best=null,bestSc=-1e9;
        cand.forEach(function(p){
          var rr=p[0],cc=p[1];b[rr][cc]=ai;var capN=0;var opp=ai===1?2:1;
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=rr+d[0],nc=cc+d[1];if(nr>=0&&nr<N&&nc>=0&&nc<N&&b[nr][nc]===opp){var g=group(nr,nc,opp);if(liberties(g)===0)capN+=g.length;}});
          var selfLib=liberties(group(rr,cc,ai));
          b[rr][cc]=0;
          var sc=capN*1000;
          var own=0,en=0;
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=rr+d[0],nc=cc+d[1];if(nr>=0&&nr<N&&nc>=0&&nc<N){if(b[nr][nc]===ai)own++;else if(b[nr][nc]===opp)en++;}});
          sc+=own*20+en*8;
          if(level>=3){
            if(selfLib===0)sc-=100000;
            else if(selfLib===1)sc-=300;
            else if(selfLib===2)sc-=80;
            var corner=(rr===0||rr===N-1)&&(cc===0||cc===N-1);
            var edge=rr===0||rr===N-1||cc===0||cc===N-1;
            if(corner)sc+=120;else if(edge)sc+=30;
          }
          sc-=Math.abs(rr-mid)*1-Math.abs(cc-mid)*1+Math.random()*30;
          if(sc>bestSc){bestSc=sc;best=p;}
        });
        if(best){if(tryPlace(best[0],best[1],ai))draw();}
        afterTurn();
      }
      function afterTurn(){
        msg.textContent='黑提 '+cap[1]+' · 白提 '+cap[2];
        if(turn===me){msg.textContent='轮到你落子';}
        else{msg.textContent='电脑思考中…';}
        if(!over){turn=turn===1?2:1;draw();
          if(turn===ai){aiPlay(aiMove);}else{msg.textContent='黑提 '+cap[1]+' · 白提 '+cap[2]+'（轮到你）';}}
      }
      function place(r,c,col){
        if(over)return;
        if(!tryPlace(r,c,col)){msg.textContent='此处不能落子';return;}
        passes=0;draw();
        if(turn===me)msg.textContent='黑提 '+cap[1]+' · 白提 '+cap[2]+'（电脑回合）';
        turn=turn===1?2:1;
        if(turn===ai)aiPlay(aiMove);
      }
      function doPass(){
        if(over)return;
        passes++;
        if(passes>=2){over=true;var t=territory();msg.textContent='对局结束：黑 '+t[1]+' 分 · 白 '+t[2]+' 分，'+(t[1]===t[2]?'平局':(t[1]>t[2]?'黑胜':'白胜'));return;}
        turn=turn===1?2:1;
        if(turn===ai)aiPlay(aiMove);else msg.textContent='轮到你落子';
      }
      function territory(){
        var seen={},sc={1:cap[1],2:cap[2]};
        for(var r=0;r<N;r++)for(var c=0;c<N;c++)if(!b[r][c]&&!seen[r+','+c]){
          var g=group(r,c,0,seen),owner=0;
          g.forEach(function(p){[[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=p[0]+d[0],nc=p[1]+d[1];if(nr>=0&&nr<N&&nc>=0&&nc<N&&b[nr][nc]){if(owner===0)owner=b[nr][nc];else if(owner!==b[nr][nc])owner=3;}});});
          if(owner===1||owner===2)sc[owner]+=g.length;
        }
        return sc;
      }
      function reset(){b=[];for(i=0;i<N;i++){b.push([]);for(j=0;j<N;j++)b[i].push(0);}over=false;passes=0;cap={1:0,2:0};koPoint=null;lastMove=null;turn=cfg.first==='me'?me:opp;draw();if(turn===ai){msg.textContent='电脑先手…';aiPlay(aiMove);}else msg.textContent='黑先，轮到你落子';}
      st.c.onclick=function(e){if(over||turn!==me)return;var x=e.offsetX,y=e.offsetY,c=Math.round(x/S-1),r=Math.round(y/S-1);if(r<0||r>=N||c<0||c>=N)return;place(r,c,me);};
      draw();reset();
    }
  };

  // ============ 4. 中国象棋 ============
  GAMES.xiangqi = {
    name:'中国象棋',
    mount:function(container,cfg){
      var W=cssW(container),CW=W,margin=22,cell=(CW-margin*2)/8,CH=margin*2+cell*9;
      var st=stage(container,CW,CH),ctx=st.ctx;
      var ox=margin,oy=margin,dx=cell,dy=cell;
      var msg=bar(container);
      var ct=ctl(container,[{key:'again',label:'重开',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      var VAL={R:900,N:400,C:450,B:200,A:200,P:100,K:10000};
      var CN={r:{R:'车',N:'马',B:'相',A:'仕',K:'帅',C:'炮',P:'兵'},b:{R:'车',N:'马',B:'象',A:'士',K:'将',C:'炮',P:'卒'}};
      var board=[];
      function freshBoard(){
        board=[];
        for(var r=0;r<10;r++){board.push([]);for(var c=0;c<9;c++)board[r].push(null);}
        function row(r,arr,col){for(var c=0;c<9;c++){if(arr[c])board[r][c]={t:arr[c],c:col};}}
        // 标准摆放：每方 2 车、2 马、2 相/象、2 仕/士、1 帅/将、2 炮、5 兵/卒
        row(0,['R','N','B','A','K','A','B','N','R'],'b');
        row(2,['','C','','','','','','C',''],'b');
        row(3,['P','','P','','P','','P','','P'],'b');
        row(9,['R','N','B','A','K','A','B','N','R'],'r');
        row(7,['','C','','','','','','C',''],'r');
        row(6,['P','','P','','P','','P','','P'],'r');
        // 数量校验
        ['r','b'].forEach(function(col){
          var cnt={};
          for(var rr=0;rr<10;rr++)for(var cc=0;cc<9;cc++){var p=board[rr][cc];if(p&&p.c===col)cnt[p.t]=(cnt[p.t]||0)+1;}
          if(cnt.P!==5||cnt.C!==2)console.warn('象棋棋子数量异常',col,cnt);
        });
      }
      function inPalace(r,c,col){return c>=3&&c<=5&&((col==='r'&&r>=7&&r<=9)||(col==='b'&&r>=0&&r<=2));}
      function ownSide(r,col){return col==='r'?r>=5:r<=4;}
      function kingsFacing(bd){
        var rk,bk,rr,br;var foundR=false,foundB=false;
        for(var r=0;r<10;r++)for(var c=0;c<9;c++){var p=bd[r][c];if(p&&p.t==='K'){if(p.c==='r'){rk=[r,c];foundR=true;}else{bk=[r,c];foundB=true;}}}
        if(!foundR||!foundB)return false;
        if(rk[1]!==bk[1])return false;
        var lo=Math.min(rk[0],bk[0])+1,hi=Math.max(rk[0],bk[0]);
        for(var i=lo;i<hi;i++)if(bd[i][rk[1]])return false;
        return true;
      }
      function genMoves(bd,r,c){
        var p=bd[r][c],moves=[],col=p.c;
        function push(nr,nc){if(nr<0||nr>9||nc<0||nc>8)return;if(bd[nr][nc]&&bd[nr][nc].c===col)return;moves.push([nr,nc]);}
        function slide(dirs){dirs.forEach(function(d){var nr=r+d[0],nc=c+d[1];while(nr>=0&&nr<=9&&nc>=0&&nc<=8){if(bd[nr][nc]){if(bd[nr][nc].c!==col)moves.push([nr,nc]);break;}moves.push([nr,nc]);nr+=d[0];nc+=d[1];}});}
        var D=[[1,0],[-1,0],[0,1],[0,-1]];
        switch(p.t){
          case 'R': slide(D);break;
          case 'C':
            D.forEach(function(d){var nr=r+d[0],nc=c+d[1],jumped=false;
              while(nr>=0&&nr<=9&&nc>=0&&nc<=8){
                if(!jumped){if(bd[nr][nc])jumped=true;else moves.push([nr,nc]);}
                else{if(bd[nr][nc]){if(bd[nr][nc].c!==col)moves.push([nr,nc]);break;}}
                nr+=d[0];nc+=d[1];}});
            break;
          case 'N':
            [[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0],[1,2,0,1],[1,-2,0,-1],[-1,2,0,1],[-1,-2,0,-1]].forEach(function(m){
              var lr=r+m[2],lc=c+m[3];if(!bd[lr]||!bd[lr][lc])push(r+m[0],c+m[1]);});
            break;
          case 'A': [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];if(inPalace(nr,nc,col)&&!(bd[nr][nc]&&bd[nr][nc].c===col))moves.push([nr,nc]);});break;
          case 'B': [[2,2],[2,-2],[-2,2],[-2,-2]].forEach(function(d){var nr=r+d[0],nc=c+d[1];var er=r+d[0]/2,ec=c+d[1]/2;
            if(nr<0||nr>9||nc<0||nc>8)return;if(!ownSide(nr,col))return;if(bd[er][ec])return;if(bd[nr][nc]&&bd[nr][nc].c===col)return;moves.push([nr,nc]);});break;
          case 'K':
            D.forEach(function(d){var nr=r+d[0],nc=c+d[1];if(inPalace(nr,nc,col)&&!(bd[nr][nc]&&bd[nr][nc].c===col))moves.push([nr,nc]);});
            // 将帅照面（飞将）
            [[1,0],[-1,0]].forEach(function(d){var nr=r+d[0],nc=c+d[1];
              while(nr>=0&&nr<=9){if(bd[nr][nc]){if(bd[nr][nc].t==='K'&&bd[nr][nc].c!==col)moves.push([nr,nc]);break;}nr+=d[0];}});
            break;
          case 'P':
            var fwd=col==='r'?-1:1;
            push(r+fwd,c);
            if((col==='r'&&r<=4)||(col==='b'&&r>=5)){push(r,c-1);push(r,c+1);}
            break;
        }
        return moves;
      }
      function legalMoves(bd,col){
        var all=[];
        for(var r=0;r<10;r++)for(var c=0;c<9;c++){var p=bd[r][c];if(p&&p.c===col){
          genMoves(bd,r,c).forEach(function(m){
            var nb=clone(bd),cap=nb[m[0]][m[1]];
            nb[m[0]][m[1]]=nb[r][c];nb[r][c]=null;
            if(!kingsFacing(nb))all.push({fr:[r,c],to:m,cap:cap,piece:p});
          });
        }}
        return all;
      }
      function clone(bd){return bd.map(function(row){return row.slice();});}
      function isAttacked(bd,r,c,by){
        for(var rr=0;rr<10;rr++)for(var cc=0;cc<9;cc++){var p=bd[rr][cc];if(p&&p.c===by){
          var ms=genMoves(bd,rr,cc);for(var k=0;k<ms.length;k++)if(ms[k][0]===r&&ms[k][1]===c)return true;}}
        return false;
      }
      var me=cfg.me==='black'?'b':'r', opp=me==='r'?'b':'r', ai=cfg.mode==='human'?'':opp;
      var turn,over=false,sel=null,hints=[];
      function draw(){
        ctx.fillStyle='#14203a';ctx.fillRect(0,0,CW,CH);
        ctx.strokeStyle='#5a6b8c';ctx.lineWidth=1;
        for(var r=0;r<10;r++){ctx.beginPath();ctx.moveTo(ox,oy+r*dy);ctx.lineTo(ox+8*dx,oy+r*dy);ctx.stroke();}
        for(var c=0;c<9;c++){
          if(c===0||c===8){ctx.beginPath();ctx.moveTo(ox+c*dx,oy);ctx.lineTo(ox+c*dx,oy+9*dy);ctx.stroke();}
          else{ctx.beginPath();ctx.moveTo(ox+c*dx,oy);ctx.lineTo(ox+c*dx,oy+4*dy);ctx.stroke();ctx.beginPath();ctx.moveTo(ox+c*dx,oy+5*dy);ctx.lineTo(ox+c*dx,oy+9*dy);ctx.stroke();}
        }
        ctx.beginPath();ctx.moveTo(ox+3*dx,oy);ctx.lineTo(ox+5*dx,oy+2*dy);ctx.stroke();ctx.beginPath();ctx.moveTo(ox+5*dx,oy);ctx.lineTo(ox+3*dx,oy+2*dy);ctx.stroke();
        ctx.beginPath();ctx.moveTo(ox+3*dx,oy+7*dy);ctx.lineTo(ox+5*dx,oy+9*dy);ctx.stroke();ctx.beginPath();ctx.moveTo(ox+5*dx,oy+7*dy);ctx.lineTo(ox+3*dx,oy+9*dy);ctx.stroke();
        ctx.fillStyle='#9fb0d0';ctx.font='13px sans-serif';ctx.textAlign='center';ctx.fillText('楚  河        汉  界',ox+4*dx,oy+4.5*dy);
        function drawPiece(r2,c2,p){
          var x=ox+c2*dx,y=oy+r2*dy;
          if(sel&&sel[0]===r2&&sel[1]===c2){ctx.fillStyle='rgba(245,201,107,.4)';ctx.beginPath();ctx.arc(x,y,dx*0.5,0,7);ctx.fill();}
          var R=dx*0.43;
          // 棋子投影
          ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(x+2,y+2,R,0,7);ctx.fill();
          // 棋子本体（模拟木质/塑料棋子）
          var grad=ctx.createRadialGradient(x-R*0.3,y-R*0.3,R*0.1,x,y,R);
          if(p.c==='r'){grad.addColorStop(0,'#ff8a8a');grad.addColorStop(1,'#c23a3a');}
          else{grad.addColorStop(0,'#4a5a7a');grad.addColorStop(1,'#1a2235');}
          ctx.fillStyle=grad;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
          ctx.strokeStyle=p.c==='r'?'#f0c0c0':'#8a9ab8';ctx.lineWidth=2;ctx.stroke();
          ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(x,y,R-3,0,7);ctx.stroke();
          var label=CN[p.c]&&CN[p.c][p.t];
          if(label){
            ctx.fillStyle='#fff';ctx.font='bold '+Math.round(dx*0.5)+'px "PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,x,y+1);
          }
        }
        for(var r2=0;r2<10;r2++)for(var c2=0;c2<9;c2++)if(board[r2][c2])drawPiece(r2,c2,board[r2][c2]);
        ctx.textBaseline='alphabetic';
        hints.forEach(function(m){ctx.strokeStyle='#66bb6a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(ox+m[1]*dx,oy+m[0]*dy,5,0,7);ctx.stroke();});
      }
      function evaluate(bd,col){
        var sc=0;
        for(var r=0;r<10;r++)for(var c=0;c<9;c++){var p=bd[r][c];if(p)sc+=(p.c===col?1:-1)*VAL[p.t];}
        return sc;
      }
      function negamax(bd,depth,alpha,beta,col){
        if(depth===0)return evaluate(bd,col);
        var ms=legalMoves(bd,col);
        if(!ms.length)return -999999;
        ms.sort(function(a,b){return (b.cap?VAL[b.cap.t]:0)-(a.cap?VAL[a.cap.t]:0);});
        var best=-1e9;
        for(var i=0;i<ms.length;i++){
          var m=ms[i],nb=clone(bd);
          nb[m.to[0]][m.to[1]]=nb[m.fr[0]][m.fr[1]];nb[m.fr[0]][m.fr[1]]=null;
          var sc=-negamax(nb,depth-1,-beta,-alpha,col==='r'?'b':'r');
          if(sc>best)best=sc;
          if(sc>alpha)alpha=sc;
          if(alpha>=beta)break;
        }
        return best;
      }
      function aiMove(){
        var level=parseInt(cfg.level||2),depth=level===1?1:(level===2?2:(level===3?3:4));
        var ms=legalMoves(board,ai);shuffle(ms);
        var best=null,bestSc=-1e9;
        ms.forEach(function(m){
          var nb=clone(board),cap=nb[m.to[0]][m.to[1]];
          nb[m.to[0]][m.to[1]]=nb[m.fr[0]][m.fr[1]];nb[m.fr[0]][m.fr[1]]=null;
          var sc=(depth===1)?evaluate(nb,ai):(-negamax(nb,depth-1,-1e9,1e9,ai==='r'?'b':'r'));
          if(cap&&cap.t==='K')sc+=100000;
          sc+=Math.random()*12;
          if(sc>bestSc){bestSc=sc;best=m;}
        });
        if(best){
          var cap=board[best.to[0]][best.to[1]];
          board[best.to[0]][best.to[1]]=board[best.fr[0]][best.fr[1]];board[best.fr[0]][best.fr[1]]=null;
          if(cap&&cap.t==='K'){over=true;draw();msg.textContent='电脑获胜！';return;}
        }
        afterTurn();
      }
      function afterTurn(){draw();turn=turn==='r'?'b':'r';if(turn===ai){msg.textContent='电脑思考中…';aiPlay(aiMove);}else msg.textContent='轮到你走子';}
      function click(e){
        if(over||turn!==me)return;
        var x=e.offsetX,y=e.offsetY,c=Math.round((x-ox)/dx),r=Math.round((y-oy)/dy);
        if(r<0||r>9||c<0||c>8)return;
        if(sel){
          var hit=hints.find(function(m){return m[0]===r&&m[1]===c;});
          if(hit){var cap=board[r][c];var p=board[sel[0]][sel[1]];board[r][c]=p;board[sel[0]][sel[1]]=null;sel=null;hints=[];
            if(cap&&cap.t==='K'){over=true;draw();msg.textContent='你获胜！🎉';return;}
            afterTurn();return;}
          if(board[r][c]&&board[r][c].c===me){sel=[r,c];hints=legalMoves(board,me).filter(function(m){return m.fr[0]===r&&m.fr[1]===c;}).map(function(m){return m.to;});}
          else{sel=null;hints=[];}
        }else{
          if(board[r][c]&&board[r][c].c===me){sel=[r,c];hints=legalMoves(board,me).filter(function(m){return m.fr[0]===r&&m.fr[1]===c;}).map(function(m){return m.to;});}
          else{sel=null;hints=[];}
        }
        draw();
      }
      function reset(){freshBoard();over=false;sel=null;hints=[];turn=cfg.first==='me'?me:opp;draw();if(turn===ai){msg.textContent='电脑先手…';aiPlay(aiMove);}else msg.textContent='红先，轮到你走子';}
      st.c.onclick=click;
      freshBoard();draw();reset();
    }
  };

  // ============ 5. 国际象棋 ============
  GAMES.chess = {
    name:'国际象棋',
    mount:function(container,cfg){
      var W=cssW(container),S=W/8;
      var st=stage(container,W,W),ctx=st.ctx;
      var msg=bar(container);
      var ct=ctl(container,[{key:'again',label:'重开',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      var VAL={P:100,N:320,B:330,R:500,Q:900,K:20000};
      var GLYPH={P:'♟',N:'♞',B:'♝',R:'♜',Q:'♛',K:'♚'};
      var board=[];
      function freshBoard(){
        board=[];
        for(var r=0;r<8;r++){board.push([]);for(var c=0;c<8;c++)board[r].push(null);}
        var back=['R','N','B','Q','K','B','N','R'];
        for(var c=0;c<8;c++){board[0][c]={t:back[c],c:'b'};board[7][c]={t:back[c],c:'w'};board[1][c]={t:'P',c:'b'};board[6][c]={t:'P',c:'w'};}
      }
      function clone(bd){return bd.map(function(r){return r.slice();});}
      function pseudo(bd,r,c){
        var p=bd[r][c],m=[],col=p.c;
        function push(nr,nc){if(nr<0||nr>7||nc<0||nc>7)return;if(bd[nr][nc]&&bd[nr][nc].c===col)return;m.push([nr,nc]);}
        function slide(dirs){dirs.forEach(function(d){var nr=r+d[0],nc=c+d[1];while(nr>=0&&nr<=7&&nc>=0&&nc<=7){if(bd[nr][nc]){if(bd[nr][nc].c!==col)m.push([nr,nc]);break;}m.push([nr,nc]);nr+=d[0];nc+=d[1];}});}
        var D4=[[1,0],[-1,0],[0,1],[0,-1]],D8=D4.concat([[1,1],[1,-1],[-1,1],[-1,-1]]);
        switch(p.t){
          case 'P':
            var fwd=col==='w'?-1:1,start=col==='w'?6:1;
            if(!bd[r+fwd]||!bd[r+fwd][c]){push(r+fwd,c);if(r===start&&!bd[r+2*fwd][c])push(r+2*fwd,c);}
            [[fwd,-1],[fwd,1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];if(nr>=0&&nr<=7&&nc>=0&&nc<=7&&bd[nr][nc]&&bd[nr][nc].c!==col)m.push([nr,nc]);});
            break;
          case 'N': [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]].forEach(function(d){push(r+d[0],c+d[1]);});break;
          case 'B': slide([[1,1],[1,-1],[-1,1],[-1,-1]]);break;
          case 'R': slide(D4);break;
          case 'Q': slide(D8);break;
          case 'K': D8.forEach(function(d){push(r+d[0],c+d[1]);});break;
        }
        return m;
      }
      function attacks(bd,r,c,by){
        for(var rr=0;rr<8;rr++)for(var cc=0;cc<8;cc++){var p=bd[rr][cc];if(p&&p.c===by){
          if(p.t==='P'){var fwd=p.c==='w'?-1:1;if(r===rr+fwd&&(c===cc-1||c===cc+1))return true;continue;}
          if(p.t==='N'){if((Math.abs(r-rr)===2&&Math.abs(c-cc)===1)||(Math.abs(r-rr)===1&&Math.abs(c-cc)===2))return true;continue;}
          if(p.t==='K'){if(Math.abs(r-rr)<=1&&Math.abs(c-cc)<=1)return true;continue;}
          var dR=r-rr,dC=c-cc;
          var dr=Math.sign(dR),dc=Math.sign(dC);
          var line=false;
          if(p.t==='B')line=(Math.abs(dR)===Math.abs(dC));
          else if(p.t==='R')line=(dR===0||dC===0);
          else if(p.t==='Q')line=(Math.abs(dR)===Math.abs(dC)||dR===0||dC===0);
          if(line){var nr=rr+dr,nc=cc+dc,ok=true;while(nr!==r||nc!==c){if(bd[nr][nc]){ok=false;break;}nr+=dr;nc+=dc;}if(ok)return true;}
        }}
        return false;
      }
      function kingPos(bd,col){for(var r=0;r<8;r++)for(var c=0;c<8;c++)if(bd[r][c]&&bd[r][c].t==='K'&&bd[r][c].c===col)return[r,c];return null;}
      function legalMoves(bd,col){
        var all=[],enemy=col==='w'?'b':'w';
        for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=bd[r][c];if(p&&p.c===col){
          pseudo(bd,r,c).forEach(function(m){
            var nb=clone(bd);nb[m[0]][m[1]]=nb[r][c];nb[r][c]=null;
            var k=kingPos(nb,col);
            if(k&&!attacks(nb,k[0],k[1],enemy))all.push({fr:[r,c],to:m,cap:bd[m[0]][m[1]],piece:p});
          });
        }}
        return all;
      }
      var me=cfg.me==='black'?'b':'w', opp=me==='w'?'b':'w', ai=cfg.mode==='human'?'':opp;
      var turn,over=false,sel=null,hints=[];
      function draw(){
        for(var r=0;r<8;r++)for(var c=0;c<8;c++){ctx.fillStyle=(r+c)%2?'#33415e':'#d7c8a0';ctx.fillRect(c*S,r*S,S,S);}
        if(sel){ctx.fillStyle='rgba(245,201,107,.5)';ctx.fillRect(sel[1]*S,sel[0]*S,S,S);}
        hints.forEach(function(m){ctx.fillStyle='rgba(102,187,106,.35)';ctx.fillRect(m[1]*S,m[0]*S,S,S);});
        for(var r2=0;r2<8;r2++)for(var c2=0;c2<8;c2++)if(board[r2][c2]){var p=board[r2][c2];
          ctx.fillStyle=p.c==='w'?'#f5f0e0':'#222';ctx.font=Math.round(S*0.62)+'px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText(GLYPH[p.t],c2*S+S/2,r2*S+S/2+1);
        }
        ctx.textBaseline='alphabetic';
      }
      function evaluate(bd,col){
        var sc=0;
        for(var r=0;r<8;r++)for(var c=0;c<8;c++){var p=bd[r][c];if(p){
          var v=VAL[p.t];
          // 兵在推进、轻子占中心给一点位置分
          if(p.t==='P')v+=(p.c==='w'?(7-r):r)*2;
          if(p.t==='N'||p.t==='B')v+=((r>=2&&r<=5&&c>=2&&c<=5)?6:0);
          sc+=(p.c===col?1:-1)*v;
        }}
        return sc;
      }
      function negamax(bd,depth,alpha,beta,col){
        if(depth===0)return evaluate(bd,col);
        var ms=legalMoves(bd,col);
        if(!ms.length)return -999999; // 无合法步（被将死/逼和）判劣
        ms.sort(function(a,b){return (b.cap?VAL[b.cap.t]:0)-(a.cap?VAL[a.cap.t]:0);});
        var best=-1e9;
        for(var i=0;i<ms.length;i++){
          var m=ms[i],nb=clone(bd);
          nb[m.to[0]][m.to[1]]=nb[m.fr[0]][m.fr[1]];nb[m.fr[0]][m.fr[1]]=null;
          var sc=-negamax(nb,depth-1,-beta,-alpha,col==='w'?'b':'w');
          if(sc>best)best=sc;
          if(sc>alpha)alpha=sc;
          if(alpha>=beta)break;
        }
        return best;
      }
      function aiMove(){
        var level=parseInt(cfg.level||2),depth=level===1?1:(level===2?2:3);
        var ms=legalMoves(board,ai);shuffle(ms);
        var best=null,bestSc=-1e9;
        ms.forEach(function(m){
          var nb=clone(board),cap=nb[m.to[0]][m.to[1]];
          nb[m.to[0]][m.to[1]]=nb[m.fr[0]][m.fr[1]];nb[m.fr[0]][m.fr[1]]=null;
          var sc=(depth===1)?evaluate(nb,ai):(-negamax(nb,depth-1,-1e9,1e9,ai==='w'?'b':'w'));
          if(cap&&cap.t==='K')sc+=100000;
          sc+=Math.random()*20;
          if(sc>bestSc){bestSc=sc;best=m;}
        });
        if(best){var cap=board[best.to[0]][best.to[1]];board[best.to[0]][best.to[1]]=board[best.fr[0]][best.fr[1]];board[best.fr[0]][best.fr[1]]=null;
          if(board[best.to[0]][best.to[1]].t==='P'&&(best.to[0]===0||best.to[0]===7))board[best.to[0]][best.to[1]].t='Q';
          if(cap&&cap.t==='K'){over=true;draw();msg.textContent='电脑获胜！';return;}
        }
        afterTurn();
      }
      function afterTurn(){draw();turn=turn==='w'?'b':'w';
        var ms=legalMoves(board,turn);
        if(ms.length===0){
          var k=kingPos(board,turn),enemy=turn==='w'?'b':'w';
          if(k&&attacks(board,k[0],k[1],enemy)){over=true;msg.textContent=(enemy===me?'你':'电脑')+'获胜（将死）！🎉';}
          else{over=true;msg.textContent='和棋（逼和）';}
          return;
        }
        if(turn===ai){msg.textContent='电脑思考中…';aiPlay(aiMove);}else msg.textContent='轮到你走子';}
      function click(e){
        if(over||turn!==me)return;
        var c=Math.floor(e.offsetX/S),r=Math.floor(e.offsetY/S);
        if(sel){
          var hit=hints.find(function(m){return m[0]===r&&m[1]===c;});
          if(hit){var cap=board[r][c];board[r][c]=board[sel[0]][sel[1]];board[sel[0]][sel[1]]=null;
            if(board[r][c].t==='P'&&(r===0||r===7))board[r][c].t='Q';
            sel=null;hints=[];
            if(cap&&cap.t==='K'){over=true;draw();msg.textContent='你获胜！🎉';return;}
            afterTurn();return;}
          if(board[r][c]&&board[r][c].c===me){sel=[r,c];hints=legalMoves(board,me).filter(function(m){return m.fr[0]===r&&m.fr[1]===c;}).map(function(m){return m.to;});}
          else{sel=null;hints=[];}
        }else{
          if(board[r][c]&&board[r][c].c===me){sel=[r,c];hints=legalMoves(board,me).filter(function(m){return m.fr[0]===r&&m.fr[1]===c;}).map(function(m){return m.to;});}
          else{sel=null;hints=[];}
        }
        draw();
      }
      function reset(){freshBoard();over=false;sel=null;hints=[];turn=cfg.first==='me'?me:opp;draw();if(turn===ai){msg.textContent='电脑先手…';aiPlay(aiMove);}else msg.textContent='白先，轮到你走子';}
      st.c.onclick=click;
      freshBoard();draw();reset();
    }
  };

  // ============ 6. 军棋（5×12，支持 A/B 两种棋盘样式） ============
  GAMES.junqi = {
    name:'军棋',
    mount:function(container,cfg){
      var W=cssW(container),CW=Math.min(W,360),SX=CW/5,SY=SX;
      var variant=cfg.board||'a';
      var GAP=variant==='b'?SY*1.1:0;
      var CH=SY*12+GAP;
      var st=stage(container,CW,CH),ctx=st.ctx;
      var msg=bar(container);
      var ct=ctl(container,[{key:'again',label:'重开',fn:reset},{key:'back',label:'退出',fn:function(){container.__exit&&container.__exit();}}]);
      var NAME={'-2':'军旗','-1':'地雷','0':'炸弹','1':'工兵','2':'排长','3':'连长','4':'营长','5':'团长','6':'旅长','7':'师长','8':'军长','9':'司令'};
      var CHR={'-2':'旗','-1':'雷','0':'炸','1':'兵','2':'排','3':'连','4':'营','5':'团','6':'旅','7':'师','8':'军','9':'司'};
      var VAL={'-2':9999,'-1':5,'0':5,'1':2,'2':3,'3':4,'4':5,'5':6,'6':7,'7':8,'8':9,'9':10};
      // 黑方在上（row0为后方），红方在下（row11为后方）
      // 标准棋盘（与棋类介绍图一致）：大本营在第 1/3 列，军旗在列1；A 紧凑棋盘沿用旧 0/2/4 三本营
      var TEMPLATE=(variant==='b'?[
        [-1,-2, 9,-1, 8],
        [ 7, 6, 5, 0, 4],
        [ 3,-1, 2, 1, 0]
      ]:[
        [-1, 9,-2,-1, 8],
        [ 7, 6, 5, 0, 4],
        [ 3,-1, 2, 1, 0]
      ]);
      // 行营：上下各 5 个安全岛
      var HANGYING={};['2,1','2,3','3,2','4,1','4,3','7,1','7,3','8,2','9,1','9,3'].forEach(function(k){HANGYING[k]=1;});
      // 大本营：标准棋盘每方 2 个（列1/3）；A 紧凑棋盘每方 3 个（列0/2/4）
      var DABENYING=(variant==='b'?{'0,1':1,'0,3':1,'11,1':1,'11,3':1}:{'0,0':1,'0,2':1,'0,4':1,'11,0':1,'11,2':1,'11,4':1});
      // A 紧凑棋盘：铁路在 1,4,7,10；B 标准棋盘：与介绍图一致，铁路在上下前线 1,10 及中竖线 2
      var RAIL_H=variant==='b'?[1,10]:[1,4,7,10], RAIL_V=[2];
      function rowY(r){return r*SY+(r>=6?GAP:0);}
      function rowFromY(y){if(variant!=='b')return Math.floor(y/SY);var split=rowY(6);if(y<split)return Math.floor(y/SY);return Math.floor((y-GAP)/SY);}
      var board=[];
      function freshBoard(){
        board=[];
        for(var r=0;r<12;r++){board.push([]);for(var c=0;c<5;c++)board[r].push(null);}
        for(var r=0;r<TEMPLATE.length;r++)for(var c=0;c<5;c++){
          if(TEMPLATE[r][c]===null)continue;
          board[r][c]={rank:TEMPLATE[r][c],col:'b'};
          board[11-r][c]={rank:TEMPLATE[r][c],col:'r'};
        }
      }
      var me=cfg.me==='black'?'b':'r', opp=me==='r'?'b':'r', ai=cfg.mode==='human'?'':opp;
      var turn,over=false,sel=null,hints=[];
      function movable(p){return p.rank>=0;} // 炸弹、工兵、排~司令可动；地雷(-1)、军旗(-2)不可动
      function inRail(r,c){return RAIL_H.indexOf(r)>=0 || RAIL_V.indexOf(c)>=0;}
      function key(r,c){return r+','+c;}
      function genMoves(bd,r,c){
        var p=bd[r][c],m=[];
        if(p.rank===1){ // 工兵：铁路线上可任意直行
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];
            while(nr>=0&&nr<12&&nc>=0&&nc<5){if(bd[nr][nc]){if(bd[nr][nc].col!==p.col)m.push([nr,nc]);break;}m.push([nr,nc]);nr+=d[0];nc+=d[1];}});
        }else{
          [[1,0],[-1,0],[0,1],[0,-1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];
            if(nr<0||nr>11||nc<0||nc>4)return;if(bd[nr][nc]&&bd[nr][nc].col===p.col)return;m.push([nr,nc]);});
          // 行营可与相邻对角线位置互通
          [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(d){var nr=r+d[0],nc=c+d[1];
            if(nr<0||nr>11||nc<0||nc>4)return;
            if(!(HANGYING[key(r,c)]||HANGYING[key(nr,nc)]))return;
            if(bd[nr][nc]&&bd[nr][nc].col===p.col)return;
            m.push([nr,nc]);
          });
        }
        return m;
      }
      function resolve(att,def){
        var ar=att.rank,dr=def.rank;
        if(dr===-2)return{attSurvive:true,defSurvive:false,win:true}; // 夺旗胜
        if(dr===-1){if(ar===1)return{attSurvive:true,defSurvive:false,win:false};if(ar===0)return{attSurvive:false,defSurvive:false,win:false};return{attSurvive:false,defSurvive:true,win:false};}
        if(ar===0)return{attSurvive:false,defSurvive:false,win:false};
        if(ar>dr)return{attSurvive:true,defSurvive:false,win:false};
        if(ar===dr)return{attSurvive:false,defSurvive:false,win:false};
        return{attSurvive:false,defSurvive:true,win:false};
      }
      function drawStation(r,c){
        var x=c*SX+SX/2, y=rowY(r)+SY/2;
        ctx.strokeStyle='#7c8db0';ctx.lineWidth=1;ctx.fillStyle='#1a2640';
        ctx.beginPath();ctx.arc(x,y,Math.min(SX,SY)*0.22,0,7);ctx.fill();ctx.stroke();
      }
      function drawConnection(r1,c1,r2,c2,thick,dashed){
        ctx.strokeStyle=thick?'#a0b0d0':'#4a5b7a';ctx.lineWidth=thick?3:1;
        ctx.setLineDash(dashed?[4,3]:[]);
        ctx.beginPath();ctx.moveTo(c1*SX+SX/2,rowY(r1)+SY/2);ctx.lineTo(c2*SX+SX/2,rowY(r2)+SY/2);ctx.stroke();
        ctx.setLineDash([]);
      }
      function drawTile(r,c,p,sel){
        var x=c*SX+SX/2, y=rowY(r)+SY/2, w=SX*0.72, h=SY*0.62, rx=6;
        ctx.save();ctx.translate(x,y);
        // 选中光晕
        if(sel){ctx.fillStyle='rgba(245,201,107,.35)';ctx.beginPath();ctx.roundRect(-w/2-4,-h/2-4,w+8,h+8,rx+3);ctx.fill();}
        // 木质 tile 底色
        var grad=ctx.createLinearGradient(-w/2,-h/2,w/2,h/2);
        grad.addColorStop(0,p.col==='r'?'#f3d8b6':'#b8c4d6');
        grad.addColorStop(1,p.col==='r'?'#c9a66b':'#7a8cb0');
        ctx.fillStyle=grad;ctx.strokeStyle=p.col==='r'?'#8f4d3d':'#3a4a6d';ctx.lineWidth=2;
        ctx.beginPath();ctx.roundRect(-w/2,-h/2,w,h,rx);ctx.fill();ctx.stroke();
        // 内框
        ctx.strokeStyle=p.col==='r'?'#fff4e0':'#e8eef8';ctx.lineWidth=1;
        ctx.beginPath();ctx.roundRect(-w/2+3,-h/2+3,w-6,h-6,rx-2);ctx.stroke();
        // 字
        ctx.fillStyle='#2a1a10';ctx.font='bold '+Math.round(Math.min(SX,SY)*0.32)+'px "PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText(CHR[p.rank],0,1);
        ctx.restore();
      }
      function draw(){
        ctx.fillStyle='#14203a';ctx.fillRect(0,0,CW,CH);
        // 铁路线先画（粗虚线）
        RAIL_H.forEach(function(r){drawConnection(r,0,r,4,true,true);});
        RAIL_V.forEach(function(c){drawConnection(0,c,11,c,true,true);});
        // 普通连线
        for(var r=0;r<12;r++)for(var c=0;c<5;c++){
          if(c<4)drawConnection(r,c,r,c+1,false);
          if(r<11)drawConnection(r,c,r+1,c,false);
        }
        // 行营对角线：标准棋盘B使用铁路虚线，A保持细实线
        [[2,1,3,2],[2,3,3,2],[4,1,3,2],[4,3,3,2],[7,1,8,2],[7,3,8,2],[9,1,8,2],[9,3,8,2]].forEach(function(a){drawConnection(a[0],a[1],a[2],a[3],false,variant==='b');});
        // 标准棋盘B：行营横纵铁路（虚线）覆盖在普通连线上
        if(variant==='b'){
          [[2,1,2,3],[4,1,4,3],[7,1,7,3],[9,1,9,3]].forEach(function(a){drawConnection(a[0],a[1],a[0],a[2],false,true);});
          [[2,1,4,1],[2,3,4,3],[7,1,9,1],[7,3,9,3]].forEach(function(a){drawConnection(a[0],a[1],a[2],a[1],false,true);});
        }
        // 站点
        for(var r=0;r<12;r++)for(var c=0;c<5;c++)drawStation(r,c);
        // 行营高亮
        Object.keys(HANGYING).forEach(function(k){var a=k.split(','),r=+a[0],c=+a[1];
          ctx.fillStyle='rgba(245,201,107,.18)';ctx.strokeStyle='#f5c96b';ctx.lineWidth=2;
          ctx.beginPath();ctx.arc(c*SX+SX/2,rowY(r)+SY/2,Math.min(SX,SY)*0.32,0,7);ctx.fill();ctx.stroke();
        });
        // 大本营
        Object.keys(DABENYING).forEach(function(k){var a=k.split(','),r=+a[0],c=+a[1];
          ctx.strokeStyle='#f5c96b';ctx.lineWidth=2;
          ctx.strokeRect(c*SX+3,rowY(r)+3,SX-6,SY-6);
          ctx.fillStyle='rgba(245,201,107,.12)';ctx.fillRect(c*SX+6,rowY(r)+6,SX-12,SY-12);
        });
        // 标准棋盘 B：画中央界河与前场标签
        if(variant==='b'){
          var midY=(rowY(5)+rowY(6)+SY)/2;
          ctx.fillStyle='rgba(20,32,58,.7)';ctx.fillRect(0,rowY(5)+SY,CW,GAP);
          ctx.strokeStyle='#5a6b8c';ctx.lineWidth=1;
          ctx.beginPath();ctx.moveTo(0,rowY(5)+SY);ctx.lineTo(CW,rowY(5)+SY);ctx.stroke();
          ctx.beginPath();ctx.moveTo(0,rowY(6));ctx.lineTo(CW,rowY(6));ctx.stroke();
          ctx.fillStyle='#9fb0d0';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
          ctx.fillText('山  界',CW/2,midY);
          ctx.font='12px sans-serif';ctx.fillStyle='#9fb0d0';
          ctx.fillText('前 线',CW/2,rowY(5)+SY/2);
          ctx.fillText('前 线',CW/2,rowY(6)+SY/2);
        }
        // 提示
        hints.forEach(function(m){ctx.fillStyle='rgba(102,187,106,.35)';ctx.beginPath();ctx.arc(m[1]*SX+SX/2,rowY(m[0])+SY/2,Math.min(SX,SY)*0.25,0,7);ctx.fill();});
        // 棋子
        for(var r2=0;r2<12;r2++)for(var c2=0;c2<5;c2++)if(board[r2][c2])drawTile(r2,c2,board[r2][c2],sel&&sel[0]===r2&&sel[1]===c2);
      }
      function aiMove(){
        var all=[];
        for(var r=0;r<12;r++)for(var c=0;c<5;c++){var p=board[r][c];if(p&&p.col===ai&&movable(p))genMoves(board,r,c).forEach(function(m){all.push({fr:[r,c],to:m,piece:p});});}
        shuffle(all);
        var best=null,bestSc=-1e9;
        all.forEach(function(mv){
          var def=board[mv.to[0]][mv.to[1]],sc=0;
          if(def){var res=resolve(mv.piece,def);
            if(res.win)sc+=100000;
            else if(res.attSurvive&&!res.defSurvive)sc+=VAL[def.rank]*10;
            else if(!res.attSurvive&&res.defSurvive)sc-=VAL[mv.piece.rank]*8;
            else if(!res.attSurvive&&!res.defSurvive)sc-=VAL[mv.piece.rank]*2;
          }else{
            sc+=(ai==='r'?(mv.fr[0]-mv.to[0]):(mv.to[0]-mv.fr[0]))*1;
          }
          sc+=Math.random()*15;
          if(sc>bestSc){bestSc=sc;best=mv;}
        });
        if(best){var def=board[best.to[0]][best.to[1]];
          if(def){var res=resolve(best.piece,def);
            if(res.win){board[best.to[0]][best.to[1]]=best.piece;board[best.fr[0]][best.fr[1]]=null;over=true;draw();msg.textContent='电脑获胜！';return;}
            if(res.attSurvive){board[best.to[0]][best.to[1]]=best.piece;board[best.fr[0]][best.fr[1]]=null;}
            else if(res.defSurvive){board[best.fr[0]][best.fr[1]]=null;}
            else{board[best.to[0]][best.to[1]]=null;board[best.fr[0]][best.fr[1]]=null;}
          }else{board[best.to[0]][best.to[1]]=best.piece;board[best.fr[0]][best.fr[1]]=null;}
        }
        afterTurn();
      }
      function afterTurn(){draw();turn=turn==='r'?'b':'r';if(turn===ai){msg.textContent='电脑思考中…';aiPlay(aiMove);}else msg.textContent='轮到你走子';}
      function click(e){
        if(over||turn!==me)return;
        var c=Math.floor(e.offsetX/SX),r=rowFromY(e.offsetY);
        if(c<0||c>4||r<0||r>11)return;
        if(sel){
          var hit=hints.find(function(m){return m[0]===r&&m[1]===c;});
          if(hit){var def=board[r][c];
            if(def){var res=resolve(board[sel[0]][sel[1]],def);
              if(res.win){board[r][c]=board[sel[0]][sel[1]];board[sel[0]][sel[1]]=null;sel=null;hints=[];over=true;draw();msg.textContent='你获胜！🎉';return;}
              if(res.attSurvive){board[r][c]=board[sel[0]][sel[1]];board[sel[0]][sel[1]]=null;}
              else if(res.defSurvive){board[sel[0]][sel[1]]=null;}
              else{board[r][c]=null;board[sel[0]][sel[1]]=null;}
            }else{board[r][c]=board[sel[0]][sel[1]];board[sel[0]][sel[1]]=null;}
            sel=null;hints=[];afterTurn();return;}
          if(board[r][c]&&board[r][c].col===me&&movable(board[r][c])){sel=[r,c];hints=genMoves(board,r,c);}
          else{sel=null;hints=[];}
        }else{
          if(board[r][c]&&board[r][c].col===me&&movable(board[r][c])){sel=[r,c];hints=genMoves(board,r,c);}
          else{sel=null;hints=[];}
        }
        draw();
      }
      function reset(){freshBoard();over=false;sel=null;hints=[];turn=cfg.first==='me'?me:opp;draw();if(turn===ai){msg.textContent='电脑先手…';aiPlay(aiMove);}else msg.textContent='红先，轮到你走子（夺军旗者胜）';}
      st.c.onclick=click;
      freshBoard();draw();reset();
    }
  };

  // 通用 bar / ctl 挂到 GAMES 供复用（上面各游戏已内联同名校验，保留顶层引用）
  function bar(container){var d=$('div');d.className='game-msg';container.appendChild(d);return d;}
  function ctl(container,btns){var d=$('div');d.className='game-ctl';container.appendChild(d);var o={};btns.forEach(function(x){var e=$('button');e.className='btn small '+(x.cls||'ghost');e.textContent=x.label;e.onclick=x.fn;d.appendChild(e);o[x.key]=e;});return o;}

  window.GAMES = GAMES;
})();
