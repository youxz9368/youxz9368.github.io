/* 棋斗士 · 内容数据与棋盘示意图 */
(function(){
  // ---------- SVG 工具 ----------
  function svg(w,h,inner,viewbox){
    return '<svg viewBox="0 0 '+(viewbox||(w+' '+h))+'" xmlns="http://www.w3.org/2000/svg" style="background:#14203a">'+
      '<rect width="100%" height="100%" fill="#14203a"/>'+inner+'</svg>';
  }
  function line(x1,y1,x2,y2,c,w){c=c||'#5a6b8c';return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+c+'" stroke-width="'+(w||1)+'"/>';}
  function circle(cx,cy,r,fill,stroke,sw){return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+(sw||1)+'"/>';}
  function text(x,y,s,fs,c,b){return '<text x="'+x+'" y="'+y+'" font-size="'+(fs||11)+'" fill="'+(c||'#eaf0ff')+'" text-anchor="middle" '+(b?'font-weight="700"':'')+'>'+s+'</text>';}
  function stone(cx,cy,r,color){return circle(cx,cy,r,color, (color==='#111'?'#333':'#ccc'), 1);}

  // ---------- 1 围棋 ----------
  function boardGo(){
    var n=9, S=36, m=18, s='';
    for(var i=0;i<n;i++){
      s+=line(m+i*S, m, m+i*S, m+(n-1)*S);
      s+=line(m, m+i*S, m+(n-1)*S, m+i*S);
    }
    // 星位
    [2,4,6].forEach(function(a){[2,4,6].forEach(function(b){
      if((a===4&&b===4)||(a===2&&b===2)||(a===2&&b===6)||(a===6&&b===2)||(a===6&&b===6))
        s+=circle(m+a*S,m+b*S,2,'#5a6b8c');
    });});
    s+=stone(m+2*S,m+2*S,13,'#111');
    s+=stone(m+6*S,m+6*S,13,'#111');
    s+=stone(m+3*S,m+6*S,13,'#eee');
    s+=stone(m+5*S,m+2*S,13,'#eee');
    return svg(320,320,s);
  }

  // ---------- 2 中国象棋 ----------
  function boardXiangqi(){
    var cx=32, cy=28, dx=30, dy=30, s='';
    var x0=32, y0=28;
    for(var r=0;r<10;r++) s+=line(x0, y0+r*dy, x0+8*dx, y0+r*dy);
    for(var c=0;c<9;c++){
      if(c===0||c===8) s+=line(x0+c*dx, y0, x0+c*dx, y0+9*dy);
      else{ s+=line(x0+c*dx, y0, x0+c*dx, y0+4*dy); s+=line(x0+c*dx, y0+5*dy, x0+c*dx, y0+9*dy); }
    }
    // 九宫斜线
    s+=line(x0+3*dx,y0, x0+5*dx,y0+2*dy);
    s+=line(x0+5*dx,y0, x0+3*dx,y0+2*dy);
    s+=line(x0+3*dx,y0+7*dy, x0+5*dx,y0+9*dy);
    s+=line(x0+5*dx,y0+7*dy, x0+3*dx,y0+9*dy);
    s+=text(172, y0+4.5*dy, '楚 河        汉 界', 14, '#5a6b8c');
    function p(col,row,label,red){return circle(x0+col*dx,y0+row*dy,11, red?'#e05a5a':'#2f3d5e','#eaf0ff',1)+text(x0+col*dx,y0+row*dy+4,label,10,'#fff',true);}
    s+=p(4,9,'帅',true); s+=p(3,9,'士',true); s+=p(5,9,'士',true);
    s+=p(2,9,'相',true); s+=p(6,9,'相',true);
    s+=p(1,9,'马',true); s+=p(7,9,'马',true);
    s+=p(0,9,'车',true); s+=p(8,9,'车',true);
    s+=p(1,7,'炮',true); s+=p(7,7,'炮',true);
    s+=p(0,6,'兵',true); s+=p(2,6,'兵',true); s+=p(4,6,'兵',true); s+=p(6,6,'兵',true); s+=p(8,6,'兵',true);
    s+=p(4,0,'将',false); s+=p(3,0,'仕',false); s+=p(5,0,'仕',false);
    s+=p(2,0,'象',false); s+=p(6,0,'象',false);
    s+=p(1,0,'马',false); s+=p(7,0,'马',false);
    s+=p(0,0,'车',false); s+=p(8,0,'车',false);
    s+=p(1,2,'炮',false); s+=p(7,2,'炮',false);
    s+=p(0,3,'卒',false); s+=p(2,3,'卒',false); s+=p(4,3,'卒',false); s+=p(6,3,'卒',false); s+=p(8,3,'卒',false);
    return svg(304,320,s);
  }

  // ---------- 3 国际象棋 ----------
  function boardChess(){
    var s='', m=14, d=34;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++){
      s+='<rect x="'+(m+c*d)+'" y="'+(m+r*d)+'" width="'+d+'" height="'+d+'" fill="'+((r+c)%2?'#33415e':'#d7c8a0')+'"/>';
    }
    // 实际棋子图形（SVG 路径）
    function pcShape(type,color){
      var fill=color==='w'?'#f5f0e0':'#1a1a1a', stroke=color==='w'?'#b0a080':'#000';
      var base='<ellipse cx="0" cy="13" rx="10" ry="3" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1"/>';
      var body='';
      if(type==='P') body='<circle cx="0" cy="6" r="5" fill="'+fill+'" stroke="'+stroke+'"/><ellipse cx="0" cy="12" rx="6" ry="4" fill="'+fill+'" stroke="'+stroke+'"/>';
      else if(type==='R') body='<rect x="-6" y="4" width="12" height="10" rx="1" fill="'+fill+'" stroke="'+stroke+'"/><rect x="-7" y="2" width="14" height="3" rx="1" fill="'+fill+'" stroke="'+stroke+'"/>';
      else if(type==='N') body='<path d="M-6,13 L-4,4 L2,2 L6,8 L4,13 Z" fill="'+fill+'" stroke="'+stroke+'"/><circle cx="2" cy="5" r="1.5" fill="'+stroke+'"/>';
      else if(type==='B') body='<ellipse cx="0" cy="11" rx="6" ry="4" fill="'+fill+'" stroke="'+stroke+'"/><path d="M-3,8 L0,2 L3,8 Z" fill="'+fill+'" stroke="'+stroke+'"/>';
      else if(type==='Q') body='<ellipse cx="0" cy="11" rx="7" ry="5" fill="'+fill+'" stroke="'+stroke+'"/><circle cx="0" cy="4" r="4" fill="'+fill+'" stroke="'+stroke+'"/><circle cx="0" cy="4" r="1.5" fill="'+stroke+'"/>';
      else if(type==='K') body='<ellipse cx="0" cy="11" rx="7" ry="5" fill="'+fill+'" stroke="'+stroke+'"/><rect x="-1.5" y="1" width="3" height="9" fill="'+stroke+'"/><rect x="-4" y="4" width="8" height="3" fill="'+stroke+'"/>';
      return '<g transform="translate(0,-1)">'+base+body+'</g>';
    }
    function pc(c,r,type,color){return '<g transform="translate('+(m+c*d+d/2)+','+(m+r*d+d/2+2)+')">'+pcShape(type,color)+'</g>';}
    var back=['R','N','B','Q','K','B','N','R'];
    back.forEach(function(t,i){s+=pc(i,0,t,'b'); s+=pc(i,7,t,'w');});
    for(var c=0;c<8;c++){s+=pc(c,1,'P','b'); s+=pc(c,6,'P','w');}
    return svg(300,300,s);
  }

  // ---------- 3.5 日本将棋 ----------
  function boardShogi(){
    var s='', m=16, d=30, n=9;
    // 棋盘木色底
    s+='<rect x="'+m+'" y="'+m+'" width="'+(n*d)+'" height="'+(n*d)+'" fill="#c9a66b" rx="4" stroke="#5a3a1a" stroke-width="2"/>';
    // 格线
    for(var i=0;i<=n;i++){
      s+=line(m+i*d,m,m+i*d,m+n*d,'#5a3a1a',1);
      s+=line(m,m+i*d,m+n*d,m+i*d,'#5a3a1a',1);
    }
    // 星位
    [2,6].forEach(function(a){[2,6].forEach(function(b){ s+=circle(m+a*d,m+b*d,2,'#5a3a1a'); });});
    s+=circle(m+4*d,m+4*d,2,'#5a3a1a');
    // 棋子：五边形将棋 tile
    function pcShape(label,face){
      var fill=face==='w'?'#f5f0e0':'#2a3a5a', stroke=face==='w'?'#8a7a5a':'#1a2235', tc=face==='w'?'#2a1a10':'#eaf0ff';
      var path=face==='w'
        ?'M-13,11 L-13,-3 L0,-13 L13,-3 L13,11 Z'
        :'M-13,-11 L-13,3 L0,13 L13,3 L13,-11 Z';
      return '<path d="'+path+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="1.2"/>'+
             '<text x="0" y="4" font-size="12" fill="'+tc+'" text-anchor="middle" font-weight="700">'+label+'</text>';
    }
    function pc(c,r,label,face){return '<g transform="translate('+(m+c*d+d/2)+','+(m+r*d+d/2)+')">'+pcShape(label,face)+'</g>';}
    var back=['香','桂','銀','金','王','金','銀','桂','香'];
    back.forEach(function(t,i){ s+=pc(i,0,t,'b'); });
    s+=pc(1,1,'角','b'); s+=pc(7,1,'飛','b');
    for(var c=0;c<9;c++) s+=pc(c,2,'歩','b');
    back.forEach(function(t,i){ s+=pc(i,8,t,'w'); });
    s+=pc(7,7,'角','w'); s+=pc(1,7,'飛','w');
    for(var c=0;c<9;c++) s+=pc(c,6,'歩','w');
    return svg(348,348,s);
  }

  // ---------- 4 跳棋 ----------
  function boardHalma(){
    var s='', c=170, R=120, n=6;
    var pts=[];
    for(var i=0;i<n;i++){ var a=-Math.PI/2 + i*2*Math.PI/n; pts.push([c+R*Math.cos(a), c+R*Math.sin(a)]); }
    for(var i=0;i<n;i++){ var j=(i+1)%n; s+=line(pts[i][0],pts[i][1],pts[j][0],pts[j][1]); }
    for(var i=0;i<n;i++){ s+=line(c,c,pts[i][0],pts[i][1]); }
    // 三个角顶点放棋子示意
    var cols=['#e05a5a','#4f8cff','#66bb6a'];
    for(var i=0;i<3;i++){
      var a=-Math.PI/2 + i*2*Math.PI/3;
      var x=c+R*0.88*Math.cos(a), y=c+R*0.88*Math.sin(a);
      for(var k=0;k<3;k++){ var aa=a+k*0.9; s+=circle(c+(R*0.5*Math.cos(aa)), c+(R*0.5*Math.sin(aa)), 7, cols[i]); }
    }
    s+=circle(c,c,5,'#f5c96b');
    return svg(340,340,s);
  }

  // ---------- 5 军棋 ----------
  function boardJunqi(){
    var out='<div class="board-wrap"><img src="junqi_board.png" alt="军棋棋盘" style="width:100%;max-width:360px;display:block;margin:0 auto;border-radius:6px;background:#e8e8e8;"></div>';
    // 实际棋子图例
    var names=[['军旗','旗'],['地雷','雷'],['炸弹','炸'],['司令','司'],['军长','军'],['师长','师'],['旅长','旅'],['团长','团'],['营长','营'],['连长','连'],['排长','排'],['工兵','兵']];
    var chips='';
    names.forEach(function(n){
      chips+='<div style="display:inline-flex;align-items:center;justify-content:center;width:42px;height:56px;margin:3px;border-radius:5px;background:linear-gradient(145deg,#f3d8b6,#c9a66b);box-shadow:inset 0 0 0 1px #8f6d3d,0 2px 4px rgba(0,0,0,.35);font-size:13px;font-weight:700;color:#3e2b18;">'+n[1]+'</div>';
    });
    out+='<div style="margin:10px 0 2px;font-size:13px;color:#f5c96b;font-weight:700;text-align:center">实际棋子图例（木质 tile）</div>'+
         '<div style="text-align:center;padding:6px;background:#14203a;border-radius:8px;">'+chips+'</div>';
    return out;
  }

  // ---------- 6 海战棋 ----------
  function boardBattleship(){
    var out='<div class="board-wrap"><img src="haizhan_board.png" alt="海战棋棋盘" style="width:100%;max-width:360px;display:block;margin:0 auto;border-radius:6px;background:#4caf05;"></div>';
    out+='<div style="margin:10px 0 2px;font-size:13px;color:#f5c96b;font-weight:700;text-align:center">实际棋子</div>'+
         '<div class="board-wrap"><img src="haizhan_pieces.png" alt="海战棋棋子" style="width:100%;max-width:360px;display:block;margin:0 auto;border-radius:6px;"></div>';
    return out;
  }

  // ---------- 7 飞行棋 ----------
  function boardFeixing(){
    var s='', c=170;
    var cols=['#ef5350','#4f8cff','#66bb6a','#f5c96b'];
    // 中心十字
    var g=26;
    for(var i=-2;i<=2;i++){ s+=line(c+i*g, c-2*g, c+i*g, c+2*g, '#5a6b8c'); s+=line(c-2*g, c+i*g, c+2*g, c+i*g, '#5a6b8c'); }
    // 四角基地
    var cx4=[60,280,280,60], cy4=[60,60,280,280];
    for(var k=0;k<4;k++){
      s+='<rect x="'+(cx4[k]-34)+'" y="'+(cy4[k]-34)+'" width="68" height="68" fill="'+cols[k]+'" rx="8" opacity="0.25"/>';
      for(var r=0;r<2;r++)for(var cc=0;cc<2;cc++) s+=circle(cx4[k]-12+cc*24, cy4[k]-12+r*24, 6, cols[k]);
    }
    s+=text(c,c-2*g-10,'起点',11,'#9fb0d0');
    return svg(340,340,s);
  }

  // ---------- 8 斗兽棋 ----------
  function boardDoushou(){
    var s='', x0=30, y0=30, dx=34, dy=34;
    for(var r=0;r<9;r++) s+=line(x0, y0+r*dy, x0+6*dx, y0+r*dy);
    for(var c=0;c<7;c++) s+=line(x0+c*dx, y0, x0+c*dx, y0+8*dy);
    // 河流
    s+='<rect x="'+(x0+dx)+'" y="'+(y0+3*dy)+'" width="'+dx+'" height="'+dy+'" fill="#1f6f8b" opacity="0.5"/>';
    s+='<rect x="'+(x0+4*dx)+'" y="'+(y0+3*dy)+'" width="'+dx+'" height="'+dy+'" fill="#1f6f8b" opacity="0.5"/>';
    s+='<rect x="'+(x0+dx)+'" y="'+(y0+5*dy)+'" width="'+dx+'" height="'+dy+'" fill="#1f6f8b" opacity="0.5"/>';
    s+='<rect x="'+(x0+4*dx)+'" y="'+(y0+5*dy)+'" width="'+dx+'" height="'+dy+'" fill="#1f6f8b" opacity="0.5"/>';
    s+=text(x0+3*dx, y0+4.2*dy, '河 流', 12, '#9fd8ef');
    // 兽穴
    s+=circle(x0+3*dx, y0+0*dy, 12, '#f5c96b', '#fff', 1)+text(x0+3*dx,y0+0*dy+4,'穴',10,'#1b2a4a',true);
    s+=circle(x0+3*dx, y0+8*dy, 12, '#f5c96b', '#fff', 1)+text(x0+3*dx,y0+8*dy+4,'穴',10,'#1b2a4a',true);
    // 陷阱
    s+=circle(x0+2*dx, y0+0*dy, 11, '#ef5350', '#fff',1)+text(x0+2*dx,y0+0*dy+3,'陷',8,'#fff');
    s+=circle(x0+4*dx, y0+0*dy, 11, '#ef5350', '#fff',1)+text(x0+4*dx,y0+0*dy+3,'陷',8,'#fff');
    return svg(300,330,s);
  }

  // ---------- 9 五子棋 ----------
  function boardGomoku(){
    var n=15,S=24,m=20,s='';
    for(var i=0;i<n;i++){ s+=line(m+i*S,m,m+i*S,m+(n-1)*S); s+=line(m,m+i*S,m+(n-1)*S,m+i*S); }
    s+=stone(m+7*S,m+7*S,10,'#111'); s+=stone(m+7*S,m+8*S,10,'#eee'); s+=stone(m+6*S,m+7*S,10,'#111');
    return svg(376,376,s);
  }

  // ---------- 10 黑白棋 ----------
  function boardOthello(){
    var s='', m=20, d=36;
    for(var r=0;r<8;r++)for(var c=0;c<8;c++) s+='<rect x="'+(m+c*d)+'" y="'+(m+r*d)+'" width="'+d+'" height="'+d+'" fill="#1d6b46" stroke="#0f4f30"/>';
    s+=stone(m+3.5*d,m+3.5*d,14,'#111'); s+=stone(m+4.5*d,m+4.5*d,14,'#111');
    s+=stone(m+4.5*d,m+3.5*d,14,'#eee'); s+=stone(m+3.5*d,m+4.5*d,14,'#eee');
    return svg(328,328,s);
  }

  // ---------- 11 暗棋 ----------
  function boardAnqi(){
    var s='', x0=34, y0=30, dx=46, dy=46;
    for(var r=0;r<4;r++) s+=line(x0,y0+r*dy, x0+7*dx, y0+r*dy);
    for(var c=0;c<8;c++) s+=line(x0+c*dx,y0, x0+c*dx, y0+3*dy);
    var names=['将','士','象','马','车','炮','兵','兵'];
    for(var c=0;c<8;c++){
      s+='<rect x="'+(x0+c*dx+8)+'" y="'+(y0+8)+'" width="'+(dx-16)+'" height="'+(dy-16)+'" rx="6" fill="#3a2a2a" stroke="#6b4a3a"/>';
      s+=text(x0+c*dx+dx/2, y0+dy/2+4, names[c], 13, '#e0c090');
    }
    return svg(430,210,s);
  }

  // ---------- 12 中国麻将 144 张牌面 ----------
  function tileMajiang(x,y,top,bottom,tc,bc){
    return '<g transform="translate('+x+','+y+')">'+
      '<rect width="30" height="44" rx="4" fill="#f7f3e8" stroke="#b8a878"/>'+
      (top?'<text x="15" y="16" font-size="12" fill="'+tc+'" text-anchor="middle">'+top+'</text>':'')+
      '<text x="15" y="35" font-size="17" fill="'+bc+'" text-anchor="middle" font-weight="700">'+bottom+'</text>'+
      '</g>';
  }
  function boardMajiang(){
    var out='';
    function block(title, kinds){
      var cols=4, gapX=34, gapY=48, rows=Math.ceil(kinds.length/cols);
      var W=cols*gapX+4, H=rows*gapY+12;
      var s='';
      kinds.forEach(function(k,i){
        var r=Math.floor(i/cols), c=i%cols;
        s+=tileMajiang(c*gapX+2, r*gapY+6, k.top, k.bottom, k.tc, k.bc);
      });
      out+='<div style="margin:14px 0 2px;font-size:13px;color:#f5c96b;font-weight:700;text-align:center">'+title+'</div>'+
           '<div class="board-wrap">'+svg(W,H,s)+'</div>';
    }
    var wan=[],tiao=[],tong=[],zi=[],hua=[];
    for(var i=1;i<=9;i++){
      wan.push({top:String(i),bottom:'万',tc:'#4f8cff',bc:'#ef5350'});
      tiao.push({top:String(i),bottom:'条',tc:'#66bb6a',bc:'#66bb6a'});
      tong.push({top:String(i),bottom:'筒',tc:'#4f8cff',bc:'#4f8cff'});
    }
    var ziNames=['东','南','西','北','中','发','白'];
    var ziColors=['#3b5bdb','#3b5bdb','#3b5bdb','#3b5bdb','#ef5350','#2f9e44','#c9b98a'];
    ziNames.forEach(function(n,i){zi.push({top:'',bottom:n,tc:'#3b5bdb',bc:ziColors[i]});});
    var huaNames=['春','夏','秋','冬','梅','兰','竹','菊'];
    var huaColors=['#2f9e44','#ef5350','#f5a623','#4f8cff','#ef5350','#4f8cff','#2f9e44','#f5a623'];
    huaNames.forEach(function(n,i){hua.push({top:'',bottom:n,tc:'#3b5bdb',bc:huaColors[i]});});
    block('万 · 36 张（一~九万 各 4 张）', wan);
    block('条 · 36 张（一~九条 各 4 张）', tiao);
    block('筒 · 36 张（一~九筒 各 4 张）', tong);
    block('字牌 · 28 张（东南西北中发白 各 4 张）', zi);
    block('花牌 · 8 张（春夏秋冬梅兰竹菊 各 1 张）', hua);
    return out;
  }

  // ---------- 13 扑克 54 张牌面 ----------
  function tilePoker(x,y,rank,suit,color){
    return '<g transform="translate('+x+','+y+')">'+
      '<rect width="34" height="48" rx="4" fill="#fbfaf6" stroke="#b0a898"/>'+
      '<text x="5" y="13" font-size="12" fill="'+color+'" font-weight="700" text-anchor="start">'+rank+'</text>'+
      '<text x="5" y="25" font-size="12" fill="'+color+'" text-anchor="start">'+suit+'</text>'+
      '<text x="21" y="38" font-size="22" fill="'+color+'" text-anchor="middle">'+suit+'</text>'+
      '</g>';
  }
  function boardPoker(){
    var suits=[['♠','#222'],['♥','#d33'],['♦','#d33'],['♣','#222']];
    var ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    var gapX=38, gapY=52, W=13*gapX+4, H=5*gapY+10;
    var s='';
    suits.forEach(function(su,ri){
      ranks.forEach(function(rk,ci){
        s+=tilePoker(ci*gapX+2, ri*gapY+4, rk, su[0], su[1]);
      });
    });
    // 大小王
    s+=tilePoker(2, 4*gapY+8, 'JOKER', '★', '#d33');
    s+=tilePoker(gapX+2, 4*gapY+8, 'JOKER', '★', '#222');
    var out='<div style="margin:14px 0 2px;font-size:13px;color:#f5c96b;font-weight:700;text-align:center">桥牌 / 扑克 · 54 张（4 花色 × 13 点数 + 大小王）</div>'+
      '<div class="board-wrap">'+svg(W,H,s)+'</div>';
    return out;
  }

  // ---------- 内容定义 ----------
  window.CHESS_INTRO = [
    {id:'weiqi', name:'围棋', icon:'⚫', tag:'策略', board:boardGo, rules:[
      {h:'棋盘', p:'标准 19×19 路交叉点棋盘（本图示意 9 路），另有 9 路、13 路小棋盘。棋子下在交叉点上，黑白各一。'},
      {h:'基本走法', ul:[
        '黑先白后，双方轮流在交叉点落子，落子后不能移动。',
        '棋子落到棋盘上即固定，除非被"提"掉。',
        '相邻（上下左右）连通的同色棋子为一个"气"的共同体。'
      ]},
      {h:'气与提子', ul:[
        '一子的"气"是它上下左右相邻的交叉点。',
        '对方棋子被围到没有气，就要被"提"掉（从棋盘拿走）。',
        '自己落子不能自断最后一口气（自杀禁手，简化为禁止）。'
      ]},
      {h:'胜负', ul:[
        '以围得的"空"（地盘）与提子数计算胜负。',
        '本 App 以提子数 + 盘面控制作简易计分，适合入门练习。'
      ]},
      {h:'提示', p:'金角银边草肚皮——先占角、再占边、最后中腹。'}
    ]},
    {id:'xiangqi', name:'中国象棋', icon:'🐎', tag:'对弈', board:boardXiangqi, rules:[
      {h:'棋盘', p:'9 竖线 × 10 横线，中间"楚河汉界"。双方各 16 子：帅/将、仕/士、相/象、马、车、炮、兵/卒。'},
      {h:'走法', ul:[
        '帅/将：九宫格内直走一步，将帅不能照面。',
        '仕/士：九宫内斜走一步。',
        '相/象：走"田"字对角，不能过河，被塞"象眼"不能走。',
        '马：走"日"字，被蹩"马腿"不能走。',
        '车：横竖直线任意步，遇子即停。',
        '炮：走直线，吃子需隔一个"炮架"。',
        '兵/卒：过河前只向前，过河后可向前或横走一步。'
      ]},
      {h:'胜负', p:'把对方"帅/将"将死（无路可逃）即胜；本 App 以吃掉将/帅判胜。'},
      {h:'提示', p:'红方先走。开局重在出子、占中、护将。'}
    ]},
    {id:'guoji', name:'国际象棋', icon:'♞', tag:'对弈', board:boardChess, rules:[
      {h:'棋盘', p:'8×8 黑白相间棋盘。双方各 16 子：王、后、车、象、马、兵。'},
      {h:'走法', ul:[
        '王：横竖斜各走一格。',
        '后：横竖斜任意步，最强棋子。',
        '车：横竖任意步。',
        '象：斜线任意步。',
        '马：走"L"形（先两格再横一格），可跳子。',
        '兵：向前一格（起始可走两格），吃子走斜前方。'
      ]},
      {h:'特殊', ul:[
        '王车易位、吃过路兵（本 App 简化，暂不实现）。',
        '兵冲到对方底线可升变为后等棋子。'
      ]},
      {h:'胜负', p:'将死对方王即胜；本 App 以吃掉王判胜。白方先走。'}
    ]},
    {id:'shogi', name:'日本将棋', icon:'⛩', tag:'对弈', board:boardShogi, rules:[
      {h:'棋盘', p:'9×9 方格棋盘。双方各 20 枚棋子：玉/王将、金将、银将、桂马、香车、角行、飞车、步兵各若干。'},
      {h:'棋子走法', ul:[
        '玉将/王将：横竖斜各走一格，类似国际象棋的王。',
        '金将：横竖斜前进、横退，共 6 个方向。',
        '银将：斜向四格与正前方，走法如“Y”字。',
        '桂马：跳“桂马步”（向前两格再横向一格），可跳子。',
        '香车：直走任意格，只能向前。',
        '角行：斜线任意步。',
        '飞车：横竖任意步。',
        '步兵：每次向前走一格。'
      ]},
      {h:'持驹与打入', ul:[
        '吃掉对方棋子后，该棋子成为己方的“持驹”。',
        '持驹可以像落子一样“打入”到几乎任意空格（步兵有禁入规则）。',
        '打入的步兵不能立刻将死对方（打步詰）。',
        '棋子进入对方腹地（后三行）大多可“成”（翻面升级）。'
      ]},
      {h:'胜负', p:'将死对方玉将/王将即胜。将棋以“持驹再生”机制闻名，节奏激烈，是日本最流行的棋类。'}
    ]},
    {id:'tiaoqi', name:'跳棋', icon:'🔶', tag:'休闲', board:boardHalma, rules:[
      {h:'棋盘', p:'六角星形棋盘，最多 6 人，各占一角，每人 10 子（本 App 支持双人）。'},
      {h:'走法', ul:[
        '每次沿六个方向走一步到相邻空位。',
        '可以"跳"：隔一个子（自己或对方）跳到对面空位，可连续跳。'
      ]},
      {h:'胜负', p:'最先把本方 10 子全部走到对面角落者胜。'},
      {h:'提示', p:'搭建自己的"桥"可连续跳，走得更快。'}
    ]},
    {id:'junqi', name:'军棋（陆战棋）', icon:'🎖', tag:'策略', board:boardJunqi, rules:[
      {h:'棋盘', p:'双方各占一端，有兵站、行营（安全区）、大本营。棋子包括军旗、司令、军长、师长等、炸弹、地雷。'},
      {h:'棋子大小（从大到小）', p:'司令 > 军长 > 师长 > 旅长 > 团长 > 营长 > 连长 > 排长 > 工兵。'},
      {h:'走法', ul:[
        '棋子沿铁路/公路线走，一次一格（工兵可沿铁路走多格）。',
        '进入"行营"后对方不能攻击。',
        '军旗、地雷不能移动。'
      ]},
      {h:'战斗', ul:[
        '两子相遇比大小，大者吃掉小者；同级同归于尽。',
        '炸弹：与任何子同归于尽。',
        '地雷：只有工兵能挖，其余子撞雷即亡。'
      ]},
      {h:'胜负', p:'夺下对方"军旗"即胜。本 App 采用明棋简化对战。'}
    ]},
    {id:'haizhan', name:'海战棋', icon:'🚢', tag:'策略', board:boardBattleship, rules:[
      {h:'棋子', p:'双方各 25 枚：旗舰 1、母舰 1、战列舰 3、巡洋舰 3、驱逐舰 3、雷击舰 3、扫雷舰 3、潜艇 3、水雷 3、鱼雷 2。'},
      {h:'棋子大小', ul:[
        '潜艇 < 母舰 < 战列舰 < 巡洋舰 < 驱逐舰 < 雷击舰；',
        '雷击舰可胜潜艇；以上各舰均胜扫雷舰；',
        '扫雷舰胜水雷；水雷相当于地雷、鱼雷相当于炸弹。',
        '旗舰相当于军旗，可移动，但移动范围受限。'
      ]},
      {h:'走法', ul:[
        '棋盘上的虚线为浅水区，只有扫雷舰和鱼雷能走。',
        '在红色粗线上行走可转弯，最多走 3 格。',
        '旗舰、母舰、战列舰、巡洋舰等按大小规则攻防。'
      ]},
      {h:'胜负', p:'击沉对方旗舰即胜。'}
    ]},
    {id:'feixing', name:'飞行棋', icon:'✈', tag:'休闲', board:boardFeixing, rules:[
      {h:'棋盘', p:'十字形轨道棋盘，四角为四色基地，各 4 架飞机。'},
      {h:'玩法', ul:[
        '掷骰子，掷到 6 才能起飞，并可再掷一次。',
        '沿轨道绕一圈，先到终点者胜。',
        '棋子重叠时后到者被"撞回"基地。'
      ]},
      {h:'胜负', p:'最先把 4 架飞机全部飞抵终点者胜。'},
      {h:'提示', p:'看运气更看策略：撞回对手往往比闷头前进更划算。'}
    ]},
    {id:'doushou', name:'斗兽棋', icon:'🐘', tag:'儿童', board:boardDoushou, rules:[
      {h:'棋盘', p:'9×7 方格，中间有河流，双方各有一兽穴与三个陷阱。'},
      {h:'棋子大小（从大到小）', p:'象 > 狮 > 虎 > 豹 > 狼 > 狗 > 猫 > 鼠。'},
      {h:'走法', ul:[
        '棋子每次横竖走一格。',
        '鼠能下水（走河流格），象、狮、虎不能；虎、狮可跳过河。'
      ]},
      {h:'战斗', ul:[
        '大兽吃小兽；同级同归于尽。',
        '特殊：鼠可吃象（"老鼠吃象"）。',
        '陷阱中的兽，任何兽都能吃它。'
      ]},
      {h:'胜负', p:'先进入对方"兽穴"者胜。'}
    ]},
    {id:'wuziqi', name:'五子棋', icon:'⚪', tag:'休闲', board:boardGomoku, rules:[
      {h:'棋盘', p:'15×15 交叉点棋盘，黑先白后。'},
      {h:'走法', ul:[
        '双方轮流在交叉点落子。',
        '先在横、竖、斜任一方向上连成五子者胜。'
      ]},
      {h:'禁手（进阶）', p:'职业规则黑方有"禁手"（三三、四四等），本 App 采用无禁手自由规则。'},
      {h:'提示', p:'注意活三、冲四，攻防兼备。'}
    ]},
    {id:'heibaiqi', name:'黑白棋', icon:'◑', tag:'策略', board:boardOthello, rules:[
      {h:'棋盘', p:'8×8 方格，中间先放两黑两白（交叉）。'},
      {h:'走法', ul:[
        '落子必须"夹"住对方一子或一列，把被夹的棋子翻成己方颜色。',
        '夹：横、竖、斜任一方向，两端被己方棋子夹住中间连续的对方棋子。',
        '不能夹子的位置不能落子；无子可下则跳过。'
      ]},
      {h:'胜负', p:'棋盘下满后，棋子多者胜。'},
      {h:'提示', p:'角格是制高点——占角者几乎不可被翻。'}
    ]},
    {id:'anqi', name:'暗棋（中国象棋）', icon:'🂠', tag:'变体', board:boardAnqi, rules:[
      {h:'棋盘', p:'用中国象棋的半边棋盘（4×8 格）。'},
      {h:'玩法', ul:[
        '把所有棋子背面朝上打乱放满格子。',
        '轮流翻开任意一子，或移动己方已翻开的子。',
        '红黑双方棋子依次翻开，翻到哪方颜色就执哪方。'
      ]},
      {h:'战斗', p:'比大小（与军棋类似，但按象棋子力：将>士>象>马>车>炮>兵，兵能吃将）。'},
      {h:'胜负', p:'吃光对方棋子或逼对方无子可动者胜。'},
      {h:'提示', p:'运气与博弈并存，先翻大子占先机。'}
    ]}
  ];

  window.PUZZLE_INTRO = [
    {id:'majiang', name:'中国麻将', icon:'🀄', tag:'传统', board:boardMajiang, rules:[
      {h:'简介', p:'4 人博弈游戏，用 144 张牌，通过摸牌、打牌、吃、碰、杠凑成特定牌型胡牌。'},
      {h:'基本流程', ul:[
        '每人 13 张手牌，轮流摸一张打一张。',
        '凑齐 4 组（顺子或刻子）+ 1 对将牌即可胡牌。',
        '顺子：同花色连续三张；刻子：三张相同。'
      ]},
      {h:'胡牌牌型', p:'从简单的平胡，到清一色、七对、十三幺等番型，花样繁多。'},
      {h:'提示', p:'入门先记"4组+1对"这个胡牌骨架。'}
    ]},
    {id:'qiaopai', name:'桥牌', icon:'♠', tag:'扑克', board:boardPoker, rules:[
      {h:'简介', p:'4 人两两结对的扑克牌游戏，用 52 张牌，讲究叫牌与配合。'},
      {h:'流程', ul:[
        '发牌、叫牌（定将牌与定约）、打牌、计分。',
        '叫牌决定"将牌花色"与要赢的墩数。',
        '按顺时针出牌，同花色跟牌，大牌吃墩。'
      ]},
      {h:'定约', p:'叫到多少墩就必须赢到多少墩，否则"宕"（输）。'},
      {h:'提示', p:'桥牌是智力的巅峰，配合与算牌是关键。'}
    ]},
    {id:'huarongdao', name:'华容道', icon:'🏯', tag:'滑块', rules:[
      {h:'简介', p:'古老的滑块拼图，把"曹操"从初始位置移到下方出口。'},
      {h:'棋盘', p:'4×5 的格子，含曹操（2×2）、五虎将（1×2/2×1）、小兵（1×1）等滑块。'},
      {h:'玩法', ul:[
        '只能滑动棋子，不能拿起或跳跃。',
        '通过有限空间腾挪，把最大的"曹操"块移到出口。'
      ]},
      {h:'难度', p:'本 App 提供 5 档难度（横刀立马 / 层层设防 / 水泄不通等经典开局）。'}
    ]},
    {id:'mofang', name:'魔方', icon:'🧊', tag:'益智', rules:[
      {h:'简介', p:'3×3×3 六面立方体，每面一种颜色，打乱后复原。'},
      {h:'层先法', ul:[
        '第一步：还原底面十字（白十字）。',
        '第二步：还原第一层四角。',
        '第三步：还原中层四棱。',
        '第四步：还原顶层十字（黄十字）。',
        '第五步：顶层角块归位 + 棱块归位。'
      ]},
      {h:'提示', p:'记牢字母公式（R U R\' U\' 等），反复练习形成肌肉记忆。'},
      {h:'详情', p:'完整公式见"休闲游戏 → 魔方解法"。'}
    ]},
    {id:'eluosi', name:'俄罗斯方块', icon:'🧱', tag:'消除', rules:[
      {h:'简介', p:'经典下落消除游戏，由七种四格方块（T、L、J、S、Z、I、O）组成。'},
      {h:'玩法', ul:[
        '方块匀速下落，可左右移动、旋转、加速下坠。',
        '凑满一整行即消除并得分。',
        '方块堆到顶部则游戏结束。'
      ]},
      {h:'提示', p:'预留"长条"的位置，一次消四行得分最高。'},
      {h:'详情', p:'可直接在"休闲游戏 → 俄罗斯方块"开玩。'}
    ]},
    {id:'shudu', name:'数独', icon:'🔢', tag:'数字', rules:[
      {h:'简介', p:'9×9 数字逻辑游戏，用 1–9 填满每行每列每个 3×3 宫。'},
      {h:'规则', ul:[
        '每行 1–9 各出现一次。',
        '每列 1–9 各出现一次。',
        '每个 3×3 小九宫 1–9 各出现一次。'
      ]},
      {h:'技巧', p:'从唯一数、排除法入手，逐步推理，无需猜。'},
      {h:'提示', p:'先找"只有一个可能"的格子，再逐个击破。'}
    ]},
    {id:'siqiaoban', name:'四巧板', icon:'🧩', tag:'拼图', rules:[
      {h:'简介', p:'由 4 块真实几何板块组成：大直角梯形、小直角梯形、等腰直角三角形、异形五边形，按 1:1 与 1:√2 比例制作。'},
      {h:'玩法', p:'点击上方板块取出到下方画板；拖动移动位置；选中后可用按钮旋转、左右翻转、上下翻转；移除按钮可把板块放回上方。'},
      {h:'提示', p:'先观察目标轮廓，再尝试组合、旋转、翻转，拼出火箭、山峰、箭头等造型。'}
    ]},
    {id:'qiqiaoban', name:'七巧板', icon:'🔷', tag:'拼图', rules:[
      {h:'简介', p:'中国传统益智拼图，由 2 大三角、1 中三角、2 小三角、1 正方形、1 平行四边形组成，保持标准 1:1 与 1:√2 比例。'},
      {h:'玩法', p:'与四巧板相同：点击上方取出板块，在下方画板自由拖动；旋转与翻转辅助拼出目标图案。'},
      {h:'提示', p:'两个大三角形通常是造型的骨架，先摆好它们，再用小件填补空隙。'}
    ]}
  ];
})();
