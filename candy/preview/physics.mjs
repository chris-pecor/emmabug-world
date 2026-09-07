import {levelById} from './levels.mjs';
export const STEP = 1 / 120;
export const GROUND = 610;
export const FINISH = 4210;
export const SAVE_KEY = 'emmabug-candy-preview-v1';
export const CANDY = [
  [240,560],[350,560],[460,560],[630,465],[770,365],[940,450],
  [1090,405],[1270,560],[1390,560],[1570,440],[1830,420],
  [2010,440],[2210,560],[2350,420],[2550,320],[2760,420],
  [2940,560],[3100,560],[3300,455],[3490,365],[3690,475],[3930,560]
];
export function createWorld(levelId='meadow') {
  const level=levelById(levelId);
  const grounds=level.grounds.map(([x,w])=>({x,y:GROUND,w,ground:true}));
  return {level,finish:level.finish,time:0,
    platforms:[...grounds,...level.floats.map(([x,y,w,amp])=>({x,y,w,...(amp?{moving:true,base:x,amp}: {})}))],
    gaps:grounds.slice(0,-1).map((pl,i)=>[pl.x+pl.w,grounds[i+1].x-pl.x-pl.w]),
    grumps:level.grumps.map((x,i)=>({x,home:x,y:GROUND,dir:i%2?-1:1,squashed:0,huff:0,earned:false})),
    springs:level.springs.map(x=>({x,y:GROUND})),
    stars:level.stars.map(([x,y])=>({x,y}))
  };
}
export function createPlayer() {
  return {x:145,y:GROUND,vx:0,vy:0,face:1,onGround:true,stand:0,
    powers:{},jumps:2,coyote:.12,buffer:0,safeX:145,squash:0,won:false};
}
export function tick(world, p, input, dt = STEP) {
  const events = [];
  world.time += dt;
  for (let i=0; i<world.platforms.length; i++) {
    const pl=world.platforms[i], old=pl.x;
    if (pl.moving) pl.x=pl.base+Math.sin(world.time*1.15)*pl.amp;
    if (p.onGround && p.stand===i) p.x+=pl.x-old;
  }
  p.squash *= Math.exp(-12*dt);
  if(p.won) { p.vx=0; return events; }
  for(const g of world.grumps) {
    g.squashed=Math.max(0,g.squashed-dt);g.huff=Math.max(0,g.huff-dt);
    if(g.squashed>0)continue;
    g.x+=g.dir*32*dt;
    if(g.x>g.home+55){g.x=g.home+55;g.dir=-1;}
    if(g.x<g.home-55){g.x=g.home-55;g.dir=1;}
  }
  const powers=p.powers||{},maxJ=powers.triple?3:2;
  if(p.onGround)p.jumps=maxJ;
  const dir=Number(input.right)-Number(input.left);
  const target=dir*310*(powers.speedy?1.25:1), rate=dir ? 1900 : 2500;
  p.vx += Math.sign(target-p.vx)*Math.min(Math.abs(target-p.vx),rate*dt);
  if(dir) p.face=dir;
  p.coyote=p.onGround ? .12 : Math.max(0,p.coyote-dt);
  p.buffer=input.jumpPressed ? .14 : Math.max(0,p.buffer-dt);
  input.jumpPressed=false;
  if(p.buffer>0 && (p.coyote>0 || p.jumps>0)) {
    p.jumps=p.coyote>0 ? maxJ-1 : p.jumps-1;
    p.vy=-665*(powers.highjump?1.17:1); p.onGround=false; p.stand=-1; p.coyote=0; p.buffer=0;
    p.squash=-.16; events.push('jump');
  }
  const prevY=p.y;
  p.vy=Math.min(1100,p.vy+1750*dt);
  if(powers.glide&&input.jump&&p.vy>125)p.vy=125;
  p.x=Math.max(20,Math.min(world.finish+100,p.x+p.vx*dt));
  p.y+=p.vy*dt;
  p.onGround=false; p.stand=-1;
  // Find the first surface crossed, independent of platform array order.
  let landing=-1, top=Infinity;
  for(let i=0;i<world.platforms.length;i++) {
    const pl=world.platforms[i];
    if(p.x+16<=pl.x || p.x-16>=pl.x+pl.w) continue;
    if(p.vy>=0 && prevY<=pl.y+.5 && p.y>=pl.y && pl.y<top) {top=pl.y;landing=i;}
  }
  let bounced=null;
  for(const g of world.grumps) {
    const gy=g.y-44;
    if(g.squashed<=0 && Math.abs(p.x-g.x)<36 && p.vy>0 && prevY<=gy+.5 && p.y>=gy && gy<top) {
      bounced=g;top=gy;landing=-1;
    }
  }
  if(bounced) {
    p.y=top;p.vy=-540;p.coyote=0;p.jumps=maxJ-1;p.squash=-.15;
    bounced.squashed=5;events.push(bounced.earned?'boing':'bop');bounced.earned=true;
  }
  if(landing>=0) {
    if(p.vy>220) {p.squash=Math.min(.24,p.vy/3300);events.push('land');}
    p.y=top;p.vy=0;p.onGround=true;p.stand=landing;p.jumps=maxJ;
    const pl=world.platforms[landing];
    if(pl.ground && p.x>pl.x+45 && p.x<pl.x+pl.w-45) p.safeX=p.x;
  }
  for(const g of world.grumps) {
    if(g.squashed<=0 && g.huff===0 && Math.abs(p.x-g.x)<42 && p.y>g.y-30 && p.y<g.y+5) {
      g.huff=.9;g.dir=p.x<g.x?1:-1;events.push('huff');
    }
  }
  for(const spring of world.springs) {
    if(p.onGround && Math.abs(p.x-spring.x)<30) {
      p.vy=-980;p.onGround=false;p.stand=-1;p.coyote=0;p.jumps=maxJ-1;
      p.squash=-.2;events.push('spring');
    }
  }
  if(p.y>920) {
    p.x=p.safeX;p.y=GROUND;p.vx=0;p.vy=0;p.onGround=true;
    p.stand=world.platforms.findIndex(pl=>pl.ground && p.x>=pl.x && p.x<=pl.x+pl.w);
    p.jumps=maxJ;p.coyote=.12;p.buffer=0;events.push('rescue');
  }
  if(p.x>=world.finish && p.onGround) {p.won=true;events.push('win');}
  return events;
}
// Bounded catch-up avoids a giant leap when returning from another tab.
export function createStepper(update) {
  let accumulator=0;
  return {
    advance(seconds) {
      accumulator+=Math.max(0,Math.min(seconds,.1));
      while(accumulator+1e-10>=STEP) {update(STEP);accumulator-=STEP;}
    },
    reset() {accumulator=0;}
  };
}
