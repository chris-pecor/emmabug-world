import {GROUND} from './physics.mjs';
import {OUTFITS,questNeed} from './adventure.mjs';
const TAU=Math.PI*2;
export function createRenderer(canvas) {
  let c=canvas.getContext('2d');
  let width=0,height=0,scale=1,view=0;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    width=innerWidth;height=innerHeight;
    const dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    scale=height/800;view=width/scale;
    c.setTransform(dpr,0,0,dpr,0,0);
  }
  resize();addEventListener('resize',resize);
  function ellipse(x,y,rx,ry,color,rotation=0) {c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fill();}
  function path(points,color,stroke,line=2) {c.beginPath();for(let i=0;i<points.length;i++){const p=points[i];if(i===0)c.moveTo(...p);else if(p.length===2)c.lineTo(...p);else if(p.length===4)c.quadraticCurveTo(...p);else c.bezierCurveTo(...p);}c.closePath();if(color){c.fillStyle=color;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=line;c.stroke();}}
  function line(points,color,w) {c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1)) {if(p.length===2)c.lineTo(...p);else c.quadraticCurveTo(...p);}c.lineWidth=w;c.strokeStyle=color;c.lineCap='round';c.stroke();}
  function rect(x,y,w,h,r,color) {c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
  function star(x,y,r,color,rotation=0) {const p=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5+rotation,s=i%2?r*.44:r;p.push([x+Math.cos(a)*s,y+Math.sin(a)*s]);}path(p,color);}
  function cloud(x,y,s,alpha=1) {c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha=alpha;ellipse(0,8,72,18,'#fffdf1');ellipse(-28,-1,29,25,'#fffdf1');ellipse(10,-10,35,34,'#fffdf1');ellipse(42,1,30,24,'#fffdf1');c.restore();}
  function hill(x,y,w,h,col){path([[x-w,y],[x-w*.7,y-h,x-w*.24,y-h*.85],[x+w*.3,y-h*1.05,x+w,y],[x+w,y+300],[x-w,y+300]],col);}
  function tree(x,y,s,pink=true,t=0) {
    c.save();c.translate(x,y);c.scale(s,s);
    ellipse(3,0,49,9,'#728d6320');
    path([[-8,0],[-5,-135],[5,-147],[12,0]],'#a38967');
    line([[1,-64],[-23,-108]],'#a38967',5);line([[4,-81],[32,-124]],'#a38967',5);
    const colors=pink?['#e5a9ae','#edbbc0','#f3cfce']:['#97b79b','#b2c9a4','#ced9b4'];
    ellipse(2,-160,64,57,colors[0]);ellipse(-34,-145,34,41,colors[0]);ellipse(39,-151,36,39,colors[0]);
    ellipse(-14,-177,40,32,colors[1]);ellipse(15,-190,30,26,colors[1]);ellipse(-28,-182,20,12,colors[2]);
    for(let i=0;i<7;i++) {const xx=Math.sin(i*8)*46,yy=-160+Math.cos(i*5)*30;ellipse(xx,yy,2.5,1.8,'#fff3dfb0',i);}
    if(pink && !reduced) {const drift=(t*13+x)%95;ellipse(Math.sin(t+x)*23,-110+drift,3,5,'#ecb6ba',t);}
    c.restore();
  }
  function flower(x,y,s=1,col='#f6e7cc') {c.save();c.translate(x,y);c.scale(s,s);line([[0,0],[0,-17]],'#829469',2);ellipse(4,-7,6,2,'#92a879',-.5);for(let i=0;i<5;i++){let a=i*TAU/5;ellipse(Math.cos(a)*5,-21+Math.sin(a)*5,4,4,col);}ellipse(0,-21,3,3,'#d8a654');c.restore();}
  function lolly(x,y,s=1) {c.save();c.translate(x,y);c.scale(s,s);line([[0,0],[0,-90]],'#fff3d8',8);line([[3,0],[3,-90]],'#d6bda0',2);ellipse(0,-103,32,33,'#fff2d8');c.save();c.translate(0,-103);for(let i=0;i<5;i++){c.rotate(TAU/5);path([[0,0],[7,-8,4,-31],[19,-31,27,-17],[13,-17,0,0]],'#d88e9f');}ellipse(-9,-15,7,3,'#fff9efb0',-.5);c.restore();c.restore();}
  function platform(pl,t,theme) {
    const {x,y,w,ground}=pl;
    const h=ground?205:38;
    ellipse(x+w/2,y+h+7,w*.48,9,'#85704413');
    const dough=c.createLinearGradient(0,y,0,y+h);dough.addColorStop(0,theme.dough[0]);dough.addColorStop(.3,theme.dough[1]);dough.addColorStop(1,theme.dough[2]);
    rect(x,y,w,h,ground?12:17,dough);
    if(!ground){rect(x+8,y+22,w-16,5,3,'#b88d62');line([[x+15,y+34],[x+w-15,y+34]],'#f2d6a1',2);}
    for(let i=16;i<w;i+=29) for(let j=28;j<h-10;j+=29) {ellipse(x+i+(j%2)*5,y+j,2.2,1.6,'#a9855b65');ellipse(x+i+1,y+j-2,1.4,1,'#f8dbab80');}
    // Thick icing with a scalloped edge and occasional drips.
    c.beginPath();c.moveTo(x,y+10);c.quadraticCurveTo(x,y-7,x+14,y-7);c.lineTo(x+w-14,y-7);c.quadraticCurveTo(x+w,y-7,x+w,y+9);
    for(let i=w;i>0;i-=24){const end=Math.max(0,i-24);c.quadraticCurveTo(x+(i+end)/2,y+24+((i|0)%3)*3,x+end,y+10);}c.closePath();c.fillStyle=pl.moving?'#f5d5e0':theme.icing;c.fill();
    line([[x+13,y-3],[x+w-13,y-3]],'#fffcf1',3);
    for(let i=18;i<w-10;i+=37) {line([[x+i,y+3],[x+i+4,y+5]],i%2?'#d9a0a6':'#b5c295',2);}
    if(pl.moving) {for(let i=0;i<3;i++)star(x+w/2+(i-1)*23,y+20,4,'#b67d96');}
  }
  function candy(x,y,t) {c.save();c.translate(x,y+(reduced?0:Math.sin(t*2.8+x)*4));c.rotate(-.35);path([[-10,-4],[-21,-10],[-21,10],[-10,4]],'#d68b9e');path([[10,-4],[21,-10],[21,10],[10,4]],'#d68b9e');rect(-12,-10,24,20,7,'#f1bec5');line([[-5,-7],[-5,7]],'#fff0db',5);ellipse(5,-4,4,2,'#fff5e6');c.restore();}
  function treat(t,time) {
    if(t.kind==='candy'){candy(t.x,t.y,time);return;}
    c.save();c.translate(t.x,t.y+(reduced?0:Math.sin(time*2.8+t.x)*4));
    if(t.kind==='cookie') {
      ellipse(0,0,14,13,'#ba8758');ellipse(-1,-2,13,12,'#e6bc7c');
      for(let i=0;i<6;i++)ellipse(Math.cos(i*2)*8,Math.sin(i*2)*7-2,2,2,'#9f6f51');
      ellipse(-6,-9,4,1.5,'#f7d8a1',-.5);
    } else if(t.kind==='lolly') {
      line([[0,0],[0,20]],'#ba9876',4);ellipse(0,-5,15,16,'#f7e7c2');
      c.save();c.translate(0,-5);for(let i=0;i<5;i++){c.rotate(TAU/5);path([[0,0],[7,-5,3,-15],[11,-15,14,-7],[6,-7,0,0]],'#bba0cd');}c.restore();
    } else {
      path([[-14,2],[14,2],[10,18],[-10,18]],'#c89676');
      for(let i=-7;i<10;i+=7)line([[i,6],[i*.8,15]],'#edc09a',2);
      ellipse(0,0,17,8,'#e6a6b8');ellipse(0,-7,12,8,'#f0bcc9');ellipse(0,-14,6,6,'#f5d1d5');ellipse(1,-20,4,4,'#bf758b');
      for(let i=0;i<4;i++)line([[-10+i*6,-1],[-8+i*6,1]],'#fff0c8',2);
    }
    c.restore();
  }
  function gem(x,y,time) {
    y+=reduced?0:Math.sin(time*2+x)*4;
    ellipse(x,y,23,23,'#d8eaeb4a');
    path([[x-14,y-5],[x-7,y-14],[x+7,y-14],[x+14,y-5],[x,y+15]],'#9cbecb');
    path([[x-7,y-14],[x,y-4],[x,y+15],[x-14,y-5]],'#bbdce0');
    path([[x-7,y-14],[x+7,y-14],[x,y-4]],'#e4f4ec');line([[x-13,y-5],[x+13,y-5]],'#f3f8e4',1.5);
  }
  function potion(x,y,time) {
    y+=reduced?0:Math.sin(time*2+x)*5;
    ellipse(x,y,27,27,'#fff0c570');rect(x-6,y-22,12,11,3,'#f4e0bf');
    ellipse(x,y,16,19,'#f8eed6');
    c.save();c.beginPath();c.ellipse(x,y+2,12,13,0,0,TAU);c.clip();
    ['#dfa2b5','#ebc98e','#accba8','#a9c5d4'].forEach((col,i)=>rect(x-14,y-12+i*8,28,8,0,col));c.restore();
    line([[x-8,y-8],[x-10,y-2]],'#fff8e4',3);rect(x-6,y-25,12,5,2,'#b49777');star(x+22,y-18,5,'#d3ac65');
  }
  function chest(ch,open) {
    const {x,y}=ch;ellipse(x,y,29,5,'#7a624b25');
    rect(x-25,y-33,50,32,6,'#bb8b60');rect(x-20,y-29,40,23,3,'#d7ad79');
    if(open){path([[x-26,y-34],[x-23,y-63],[x+22,y-63],[x+26,y-34]],'#c9986b');rect(x-18,y-56,36,17,3,'#e8c48b');ellipse(x,y-28,21,6,'#846448');star(x,y-43,12,'#ffe7a0');}
    else{rect(x-26,y-49,52,22,9,'#d7ab76');line([[x-24,y-29],[x+24,y-29]],'#a47753',2);}
    for(const dx of [-16,16])rect(x+dx-3,y-32,6,30,1,'#efd292');rect(x-5,y-34,10,12,2,'#ffe1a0');ellipse(x,y-29,1.5,2,'#9f7951');
  }
  function companion(a,p,time) {
    const x=a.petX,y=a.petY+(reduced?0:Math.sin(time*5)*2),id=a.pet;
    c.save();c.translate(x,y);c.scale(p.face,1);
    const color={kitty:'#d8a583',bunny:'#f9e8dc',pengy:'#8eaeb7',flutter:'#b8a0cb',draggy:'#a0bc90',sparkle:'#f6e4df',puppy:'#c7aa87',shelly:'#afc4a0'}[id];
    if(id==='flutter') {
      const flap=reduced?1:.55+Math.abs(Math.sin(time*10))*.45;
      for(const side of [-1,1]){ellipse(side*14*flap,-13,16*flap,20,'#baa4d0',side*.4);ellipse(side*12*flap,8,12*flap,13,'#d5bbdc',side*-.3);ellipse(side*15*flap,-17,6*flap,8,'#e8cee2');}
      ellipse(0,-2,3,16,'#9e829f');line([[-1,-17],[-7,-26]],'#9e829f',1.5);line([[1,-17],[7,-26]],'#9e829f',1.5);
    } else {
      if(id==='draggy') {path([[-9,-8],[-37,-31],[-28,-5],[-9,3]],'#c3d3a7');path([[2,-4],[-14,-36],[14,-17]],'#d3ddbb');}
      if(id==='kitty'||id==='sparkle')line([[-13,-5],[-31,-7,-25,-26]],id==='sparkle'?'#ce9dbd':color,7);
      ellipse(0,-7,18,16,color);ellipse(9,-26,16,16,color);
      if(id==='pengy'){ellipse(5,-8,12,13,'#fff0db');ellipse(11,-23,12,12,'#fff1de');path([[22,-26],[32,-21],[22,-18]],'#d9ad70');ellipse(-6,7,9,4,'#d9ad70');ellipse(13,7,9,4,'#d9ad70');}
      else {ellipse(-8,5,8,4,color);ellipse(12,5,8,4,color);}
      if(id==='puppy'){ellipse(-5,-31,7,16,'#a58565',-.2);ellipse(22,-28,6,15,'#a58565',.3);ellipse(21,-20,8,6,'#e1c9a9');}
      if(id==='shelly'){ellipse(-3,-12,20,17,'#849e76');for(let i=0;i<4;i++)ellipse(-15+i*8,-12+(i%2)*-5,4,5,'#aac098');}
      if(id==='kitty') {path([[-4,-34],[-5,-51],[8,-40]],color);path([[13,-40],[25,-51],[24,-31]],color);path([[-2,-38],[-2,-46],[5,-40]],'#edc0b2');}
      if(id==='bunny') {ellipse(0,-48,5,17,color,-.2);ellipse(14,-49,5,17,color,.2);ellipse(0,-48,2,10,'#e4b5bc',-.2);ellipse(14,-49,2,10,'#e4b5bc',.2);ellipse(-17,-6,7,7,'#fff4e6');}
      if(id==='sparkle'){path([[6,-39],[11,-62],[16,-39]],'#dcbf79');path([[-5,-30],[-13,-49],[3,-37]],color);line([[0,-39],[-11,-35,-13,-15]],'#d2a0c0',7);line([[-5,-36],[-15,-29,-16,-16]],'#b9b5d1',3);}
      if(id==='draggy'){path([[0,-37],[2,-48],[9,-39]],'#d2cf95');ellipse(22,-24,9,7,color);}
      ellipse(14,-28,2,2.7,'#665448');ellipse(20,-20,3,2,'#d4a09b');
    }
    if(a.rainbow>0) {c.globalAlpha=.45;star(-30,-38,7,'#d6ac61',time);star(29,-55,5,'#c391b6',-time);c.globalAlpha=1;}
    c.restore();
  }
  function spring(x,y,t) {ellipse(x,y+3,36,7,'#735d4b25');const pulse=reduced?0:Math.sin(t*2)*2;path([[x-31,y],[x-29,y-35-pulse,x,y-39-pulse],[x+28,y-34-pulse,x+31,y]],'#bd8eaf');path([[x-26,y-7],[x-22,y-35-pulse,x-2,y-33-pulse],[x+17,y-32-pulse,x+21,y-9]],'#dcb7cd');ellipse(x-11,y-25,7,3,'#f2d4e3',-.5);star(x+1,y-16,7,'#fff1d8');}
  function castle(x,y) {
    c.save();c.translate(x,y);ellipse(0,5,175,15,'#7b765520');
    for(const side of [-1,1]) {
      rect(side*105-26,-155,52,156,8,'#e7cbbb');
      rect(side*105-22,-154,10,148,3,'#f6e3cc');
      path([[side*105-38,-151],[side*105,-222],[side*105+38,-151]],'#c98097');
      line([[side*105,-220],[side*105,-249]],'#b1966c',3);
      path([[side*105,-249],[side*105+28,-242],[side*105,-232]],'#e8b267');
      rect(side*105-8,-122,16,31,8,'#aa858a');
    }
    rect(-81,-118,162,119,5,'#f4dfc4');rect(-57,-191,114,82,8,'#f7e5cb');
    path([[-72,-185],[0,-259],[72,-185]],'#d294a4');
    for(let i=-40;i<60;i+=20)line([[i,-185],[i*.16,-244]],'#e4b0b9',2);
    rect(-12,-163,24,33,12,'#c6969d');
    path([[-36,0],[-36,-47,-36,-67],[0,-105,36,-67],[36,-47,36,0]],'#ab806c');
    path([[-29,0],[-29,-53,-28,-61],[0,-89,28,-61],[29,-48,29,0]],'#d5a87f');
    line([[0,-77],[0,0]],'#ac7a60',2);ellipse(-7,-31,3,3,'#fff0b4');ellipse(7,-31,3,3,'#fff0b4');
    for(let side of [-1,1])for(let i=0;i<3;i++)rect(side*(51+i*20)-7,-127,14,16,2,'#f4dfc4');
    line([[-102,-142],[0,-110,102,-142]],'#a78369',1.5);
    for(let i=0;i<7;i++){let xx=-83+i*27,yy=-128+12*Math.sin(i/6*Math.PI);path([[xx-8,yy],[xx+8,yy-1],[xx,yy+17]],i%2?'#e5b667':'#d694a6');}
    star(0,-219,13,'#ffe8a5');flower(-145,0,1.7);flower(145,0,1.6,'#efbdc4');c.restore();
  }
  function princess(p,t,outfit='rose') {
    const dress=OUTFITS.find(o=>o.id===outfit)||OUTFITS[0];
    c.save();c.translate(p.x,p.y);c.scale(p.face,1);
    const walk=p.onGround?Math.sin(t*13)*Math.min(1,Math.abs(p.vx)/130):0;
    c.scale(1+p.squash,1-p.squash);
    // Hair, legs, shoes, and a dress with a little weight and swing.
    path([[-18,-85],[-40,-71,-30,-29],[-9,-34],[28,-27],[36,-67,15,-88]],'#95674f');
    for(const side of [-1,1]) {const offset=side*walk*8;line([[side*9,-27],[side*10+offset,-8]],'#edba9f',8);ellipse(side*10+offset+2,-5,9,5,dress.shoe);ellipse(side*10+offset+3,-7,5,2,dress.light);}
    path([[-12,-59],[-19,-39,-31,-24],[0,-11,31,-24],[20,-39,12,-59]],dress.dark);
    path([[-6,-56],[-8,-39,-19,-25],[0,-19,20,-25],[12,-41,7,-56]],dress.light);
    path([[-15,-42],[0,-32,18,-42],[23,-32],[0,-22,-25,-31]],dress.trim);
    line([[-26,-25],[0,-15,28,-25]],dress.hem,3);
    for(const side of [-1,1]) {line([[side*15,-54],[side*(24+walk*3),-36]],'#edba9f',7);ellipse(side*15,-54,7,8,dress.trim);}
    ellipse(0,-64,7,8,'#edba9f');ellipse(0,-80,22,24,'#f4c9ad');
    path([[-24,-78],[-28,-101,-4,-105],[23,-107,25,-78],[13,-87,7,-97],[-1,-83,-24,-78]],'#96664e');
    line([[-21,-83],[-20,-100,-4,-100]],'#b3805b',4);
    ellipse(-8,-79,2.1,3,'#564239');ellipse(10,-79,2.1,3,'#564239');
    ellipse(-12,-71,4.5,2.5,'#e8a194');ellipse(14,-71,4.5,2.5,'#e8a194');
    line([[-3,-70],[2,-66,7,-71]],'#aa6c65',1.5);
    path([[-15,-101],[-17,-115],[-7,-109],[0,-121],[8,-109],[17,-115],[15,-101]],'#e2b55f');
    line([[-13,-103],[13,-103]],'#ffe3a1',2);ellipse(0,-109,3,4,dress.jewel);
    if(dress.motif==='rainbow'){['#dfa1b5','#e7c38f','#b5cba5','#a3c2d4'].forEach((col,i)=>line([[-19,-33+i*3],[0,-26+i*3,19,-33+i*3]],col,3));}
    else if(dress.motif==='moon'){ellipse(0,-42,6,6,'#fff1c6');ellipse(3,-44,5,5,dress.light);}
    else if(dress.motif==='flower'){for(let i=0;i<5;i++)ellipse(Math.cos(i*TAU/5)*4,-42+Math.sin(i*TAU/5)*4,3,3,'#f9f0cb');ellipse(0,-42,2,2,'#d5a961');}
    else if(dress.motif==='sun'){for(let i=0;i<8;i++){const a=i*TAU/8;line([[Math.cos(a)*5,-42+Math.sin(a)*5],[Math.cos(a)*8,-42+Math.sin(a)*8]],'#fff2d0',1.5);}ellipse(0,-42,4,4,'#fff2d0');}
    else star(0,-42,5,'#ffebbd');
    c.restore();
  }
  function gummyFriend(friend,a,time) {
    const {x,y,color}=friend;
    c.save();c.translate(x,y);ellipse(0,2,27,6,'#745e4b20');
    const wave=friend.met&&!reduced?Math.sin(time*5)*5:0;
    for(const side of [-1,1]) {
      ellipse(side*17,-65,11,12,color);ellipse(side*15,-4,12,8,color);
      ellipse(side*24,-29-(side>0?wave:0),9,16,color,side*.5);
    }
    ellipse(0,-28,23,28,color);ellipse(0,-53,26,23,color);
    ellipse(-8,-62,11,6,'#fff7e735',-.4);ellipse(0,-23,14,17,'#fff6e52e');
    ellipse(-9,-55,2.2,3,'#715a58');ellipse(9,-55,2.2,3,'#715a58');
    ellipse(0,-45,11,8,'#fff0df55');ellipse(0,-48,3,2.5,'#90726a');
    line([[-5,-43],[0,-37,5,-43]],'#90726a',1.5);
    for(const side of [-1,1])ellipse(side*16,-45,4,2,'#e8a2a25e');
    if(friend.helped) {
      star(0,-25,10,'#efd18d');ellipse(0,-25,4,4,'#fff1bf');
      if(!reduced)star(35,-65+Math.sin(time*3)*4,6,'#d6ac61',Math.sin(time)*.1);
    }
    const need=questNeed(friend,a.pet),ready=a.collected.size>=need;
    rect(-35,-112,70,28,12,'#fff7e9');
    path([[-6,-85],[0,-78],[6,-85]],'#fff7e9');
    c.fillStyle=friend.helped?'#ac768d':'#937b61';c.font='bold 13px system-ui';c.textAlign='center';c.textBaseline='middle';
    c.fillText(friend.helped?'♥':ready?'✓  ◆':`◆ ${Math.min(need,a.collected.size)}/${need}`,0,-98);
    c.restore();
  }
  function grump(g,time) {
    c.save();c.translate(g.x,g.y);
    ellipse(0,2,25,5,'#765c4826');
    const squish=g.squashed>0?.4:1,bob=reduced||g.squashed>0?0:Math.sin(time*6)*1.5;
    c.scale(g.squashed>0?1.25:1,squish);c.translate(0,bob);
    ellipse(0,-23,24,24,'#b59ac1');ellipse(-5,-28,16,17,'#cfb6d8');ellipse(-10,-37,7,4,'#ead6e6',-.45);
    ellipse(-8,-24,2,2.6,'#705773');ellipse(8,-24,2,2.6,'#705773');
    line([[-12,-32],[-5,-29]],'#927395',2);line([[5,-29],[12,-32]],'#927395',2);
    line([[-5,-14],[0,-17,5,-14]],'#927395',1.5);
    if(g.huff>0){ellipse(29,-21,5,4,'#fff1e0');ellipse(37,-24,3,3,'#fff1e0');}
    if(g.squashed<=0)star(0,-43,5,'#fff1ca');
    c.restore();
  }
  function bunny(x,y,t) {
    c.save();c.translate(x,y);ellipse(0,0,18,4,'#7c7a5420');ellipse(0,-14,14,16,'#fff0d9');ellipse(5,-30,13,12,'#fff5e1');ellipse(0,-46,4,15,'#fff5e1',-.2);ellipse(10,-46,4,14,'#fff5e1',.2);ellipse(0,-46,1.8,9,'#edc4bf',-.2);ellipse(10,-46,1.8,9,'#edc4bf',.2);ellipse(10,-31,1.8,2,'#6d584a');ellipse(16,-27,2,1.5,'#d99fa4');ellipse(-14,-12,6,6,'#fffaed');ellipse(8,-2,9,4,'#fff0d9');c.restore();
  }
  function draw(state) {
    const {world,p,cam,collected,stars,particles,adventure}=state,t=world.time,theme=world.level.theme;
    c.clearRect(0,0,width,height);c.save();c.scale(scale,scale);
    const sky=c.createLinearGradient(0,0,0,800);sky.addColorStop(0,theme.sky[0]);sky.addColorStop(.4,theme.sky[1]);sky.addColorStop(1,theme.sky[2]);c.fillStyle=sky;c.fillRect(0,0,view,800);
    // Sun, drifting clouds, and distant scenery move at different depths.
    const sunX=view*.72-cam*.025;
    const glow=c.createRadialGradient(sunX,267,10,sunX,267,170);glow.addColorStop(0,'#f8ddb075');glow.addColorStop(1,'#f8ddb000');c.fillStyle=glow;c.fillRect(sunX-170,97,340,340);if(!theme.night)ellipse(sunX,267,44,44,'#f0cf91');
    if(theme.night){
      c.save();c.beginPath();c.arc(sunX,267,44,0,TAU);c.clip();c.beginPath();c.arc(sunX,267,44,0,TAU);c.moveTo(sunX+55,252);c.arc(sunX+17,252,38,0,TAU);c.fillStyle='#fff0d5';c.fill('evenodd');c.restore();
      for(let i=0;i<35;i++){const x=((i*173-cam*.05)%(view+40)+view+40)%(view+40);const y=270+(i*37)%175;c.globalAlpha=reduced?.7:.4+Math.abs(Math.sin(t+i))*.5;star(x,y,i%4?2:4,'#fff0d1');}c.globalAlpha=1;
    } else ellipse(sunX-13,253,12,7,'#f7e1af',-.6);
    if(theme.peaks){
      c.save();c.globalAlpha=.35;['#dfa1b5','#e7c38f','#b5cba5','#a3c2d4','#b7a6d1'].forEach((col,i)=>{c.beginPath();c.arc(view*.68-cam*.04,570,240-i*12,Math.PI,TAU);c.lineWidth=9;c.strokeStyle=col;c.stroke();});c.restore();
    }
    for(let i=-1;i<6;i++)cloud(i*430+170-cam*.09,268+(i%3)*39,.65+(i%2)*.15,.68);
    for(let i=-2;i<12;i++)hill(i*420-cam*.14,570,355,175+(i%3)*40,theme.far[i%2?1:0]);
    for(let i=-2;i<15;i++)hill(i*320-cam*.27,625,280,138+(i%3)*32,theme.near[i%2?1:0]);
    if(theme.peaks)for(let i=-1;i<8;i++){
      const x=i*330+100-cam*.2,peak=345+(i%3)*32;
      path([[x-185,600],[x,peak],[x+185,600]],i%2?theme.near[0]:theme.far[1]);
      path([[x-44,peak+61],[x,peak],[x+44,peak+61],[x+13,peak+49],[x,peak+66],[x-15,peak+49]],'#f7f0ec');
    }
    c.save();c.translate(-cam*.45,0);for(let i=-1;i<24;i++)tree(i*290+100,590,.64,i%3===0,t);c.restore();
    // Small specks give the meadow a gentle, illustrated texture.
    for(let i=0;i<85;i++){let xx=((i*193.17-cam*.35)%(view+60)+view+60)%(view+60);let yy=470+(i*37)%170;ellipse(xx,yy,1,.8,'#8ea17430');}
    c.save();c.translate(-cam,0);
    for(const pl of world.platforms) {
      if(!pl.ground || pl.x>cam+view+100 || pl.x+pl.w<cam-100)continue;
      for(let x=pl.x+110;x<pl.x+pl.w-40;x+=230) {
        if(x>world.finish-250)continue;
        tree(x,GROUND,.7+(Math.abs(x)%3)*.08,Math.floor(x/230)%2===0,t);
        if(x%3<1.5)lolly(x+80,GROUND,.58);
      }
    }
    castle(world.finish+20,GROUND);
    for(const pl of world.platforms)if(pl.x<cam+view+100&&pl.x+pl.w>cam-100)platform(pl,t,theme);
    // The gaps have a friendly river and stepping-stone sparkles.
    for(const [x,w] of world.gaps){
      rect(x,689,w,90,25,theme.water);for(let i=0;i<5;i++){const xx=x+20+i*(w-40)/5;line([[xx,705+(i%2)*21],[xx+18+Math.sin(t+i)*4,705+(i%2)*21]],'#edf1d8',2);}
    }
    if(theme.night)for(const [x,y] of world.level.floats.filter((_,i)=>i%3===0)){
      line([[x+20,y-8],[x+20,y-75]],'#b09caf',3);rect(x+9,y-92,22,24,6,'#f1d395');
      ellipse(x+20,y-79,24,28,'#f9e2a42a');rect(x+14,y-88,12,15,3,'#fff1bf');
    }
    for(const pl of world.platforms)if(pl.ground){for(let x=pl.x+43;x<pl.x+pl.w-20;x+=82){if(x<cam-30||x>cam+view+30)continue;flower(x,GROUND-4,.5+(Math.sin(x)+1)*.17,Math.sin(x)>0?'#fff5d8':'#eab0b8');}}
    adventure.treats.forEach((item,i)=>{if(!collected.has(i))treat(item,t);});
    adventure.gems.forEach((item,i)=>{if(!adventure.gemsGot.has(i))gem(item.x,item.y,t);});
    adventure.potions.forEach((item,i)=>{if(!adventure.potionsGot.has(i))potion(item.x,item.y,t);});
    adventure.chests.forEach((item,i)=>chest(item,adventure.opened.has(i)));
    if(adventure.rainbow>0){c.save();c.globalAlpha=.15;ellipse(p.x,p.y-48,76,76,'#d5afd5');c.restore();}
    if(adventure.pet==='puppy'){
      const target=world.stars.filter((_,i)=>!stars.has(i)).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];
      if(target&&Math.abs(target.x-p.x)<600){c.save();c.setLineDash([3,10]);line([[p.x,p.y-65],[(p.x+target.x)/2,Math.min(p.y,target.y)-70,target.x,target.y]],'#f5deb2',2);c.restore();}
    }
    for(const friend of state.friends||[]){if(friend.level!==state.networkLevel)continue;
      c.save();c.globalAlpha=.8;princess({x:friend.x,y:friend.y,face:friend.face,onGround:friend.onGround,vx:friend.moving?200:0,squash:0},t,friend.outfit);
      c.fillStyle='#735b73';c.font='12px system-ui';c.textAlign='center';c.fillText(friend.label,friend.x,friend.y-137);
      if(friend.reaction){c.font='26px system-ui';c.fillStyle='#bf819e';c.fillText(friend.reaction,friend.x,friend.y-163);}c.restore();
    }
    world.stars.forEach((s,i)=>{if(stars.has(i))return;const bob=reduced?0:Math.sin(t*2+s.x)*5;ellipse(s.x,s.y+bob,24,24,'#f9e3a84a');star(s.x,s.y+bob,16,'#d7a54f',Math.sin(t)*.08);star(s.x-3,s.y-4+bob,6,'#ffe7aa');});
    for(const s of world.springs)spring(s.x,s.y,t);
    bunny(400,GROUND,t);bunny(world.finish-450,GROUND,t);
    adventure.friends.forEach(friend=>gummyFriend(friend,adventure,t));
    world.grumps.forEach(g=>grump(g,t));
    // Signpost to make the first jump discoverable without reading.
    line([[850,GROUND],[850,GROUND-62]],'#ae9470',5);rect(821,GROUND-88,59,31,6,'#f5e3bd');line([[837,GROUND-72],[863,GROUND-72]],'#a58a64',3);line([[855,GROUND-80],[864,GROUND-72],[855,GROUND-65]],'#a58a64',3);
    const shadowPl=world.platforms.filter(pl=>p.x>=pl.x-5&&p.x<=pl.x+pl.w+5&&pl.y>=p.y-2).sort((a,b)=>a.y-b.y)[0];
    if(shadowPl){const a=Math.max(.08,.24-(shadowPl.y-p.y)/1000);ellipse(p.x,shadowPl.y-2,Math.max(10,24-(shadowPl.y-p.y)*.025),4,`rgba(94,76,57,${a})`);}
    companion(adventure,p,t);
    princess(p,t,adventure.outfit);
    for(const q of particles){c.globalAlpha=Math.max(0,q.life/q.max);if(q.star)star(q.x,q.y,q.size,q.color,q.life*3);else ellipse(q.x,q.y,q.size,q.size*.7,q.color,q.life);}
    c.globalAlpha=1;c.restore();
    // Foreground clumps frame the scene, below the playable surface.
    for(let i=-1;i<view/180+2;i++){let x=i*180-((cam*.75)%180);ellipse(x,786,128,52,theme.front[i%2?1:0]);for(let j=0;j<3;j++)flower(x+j*22,774,.9,'#fff0d0');}
    const fade=c.createLinearGradient(0,737,0,800);fade.addColorStop(0,'#faf4e800');fade.addColorStop(1,'#faf4e8');c.fillStyle=fade;c.fillRect(0,737,view,63);
    c.restore();
  }
  function petPortrait(id) {
    const previous=c,icon=document.createElement('canvas');icon.width=100;icon.height=100;
    c=icon.getContext('2d');
    try {companion({petX:45,petY:76,pet:id,rainbow:0},{face:1},0);return icon.toDataURL();}
    finally {c=previous;}
  }
  function outfitPortrait(id) {
    const previous=c,icon=document.createElement('canvas');icon.width=130;icon.height=160;
    c=icon.getContext('2d');
    try {princess({x:65,y:147,face:1,vx:0,onGround:true,squash:0},0,id);return icon.toDataURL();}
    finally {c=previous;}
  }
  function stickerPortrait(type) {
    const previous=c,icon=document.createElement('canvas');icon.width=100;icon.height=100;c=icon.getContext('2d');
    try {
      if(type===0)platform({x:4,y:38,w:92},0,{dough:['#dcb77e','#cfa772','#bba17a'],icing:'#fff3dd'});
      if(type===1)spring(50,75,0);
      if(type===2)treat({x:50,y:48,kind:'candy'},0);
      if(type===3)treat({x:50,y:48,kind:'lolly'},0);
      if(type===4){c.scale(.8,.8);gummyFriend({x:62,y:119,color:'#d6a5bd',helped:true},{collected:new Set()},0);}
      if(type===5)grump({x:50,y:75,squashed:0,huff:0},0);
      if(type===6)star(50,50,28,'#e0bb72');
      return icon.toDataURL();
    }finally{c=previous;}
  }
  return {draw,petPortrait,outfitPortrait,stickerPortrait,get view(){return view;},get scale(){return scale;}};
}
