import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,tick,STEP} from './physics.mjs';
import {createAdventure,powersFor,updateAdventure,PETS} from './adventure.mjs';
const input=()=>({left:false,right:false,jump:false,jumpPressed:false});
test('each pet grants its own power; the temporary magnet stacks then expires',()=>{
 for(const pet of PETS){const a=createAdventure(pet.id);assert.equal(powersFor(a)[pet.key],true);}
 const a=createAdventure('bunny');a.rainbow=.5;assert.equal(powersFor(a).magnet,true);
 updateAdventure(a,{x:-1000,y:0},1);assert.equal(powersFor(a).magnet,false);assert.equal(powersFor(a).highjump,true);
});
test('Bunny jumps higher and Pengy runs faster than the baseline',()=>{
 const run=pet=>{const w=createWorld(),p=createPlayer(),i=input();p.powers=pet?powersFor(createAdventure(pet)):{};i.right=true;i.jumpPressed=true;let apex=610;for(let n=0;n<60;n++){tick(w,p,i);apex=Math.min(apex,p.y);}return {apex,vx:p.vx};};
 const normal=run();assert.ok(run('bunny').apex<normal.apex-30);assert.ok(run('pengy').vx>normal.vx);
});
test('Draggy grants exactly three jumps and Flutter caps falling speed only while held',()=>{
 const w=createWorld(),p=createPlayer(),i=input();p.powers=powersFor(createAdventure('draggy'));
 for(let j=0;j<3;j++){i.jumpPressed=true;assert.ok(tick(w,p,i).includes('jump'));}
 i.jumpPressed=true;assert.ok(!tick(w,p,i).includes('jump'));
 p.powers=powersFor(createAdventure('flutter'));p.vy=500;p.y=100;i.jump=true;tick(w,p,i);assert.equal(p.vy,125);
 i.jump=false;tick(w,p,i);assert.ok(p.vy>125);
});
test('Kitty pulls nearby candy, collection pays once, and Sparkle doubles only lollipops',()=>{
 const p={x:100,y:100,onGround:false};const a=createAdventure('kitty');a.treats=[{x:220,y:52,kind:'candy'}];
 for(let i=0;i<100;i++)updateAdventure(a,p,STEP);assert.equal(a.collected.size,1);assert.equal(a.score,1);
 const b=createAdventure('sparkle');b.treats=[{x:100,y:52,kind:'lolly'},{x:100,y:52,kind:'cupcake'}];
 updateAdventure(b,p,STEP);updateAdventure(b,p,STEP);assert.equal(b.score,7);
});
test('chests, gems, bottles and helper badge reward once per adventure',()=>{
 const a=createAdventure('bunny'),p={x:100,y:610,onGround:true};
 a.treats=Array.from({length:12},()=>({x:100,y:562,kind:'cookie'}));
 a.chests=[{x:100,y:610}];a.gems=[{x:100,y:562}];a.potions=[{x:100,y:562}];
 const events=updateAdventure(a,p,STEP);assert.equal(a.score,17);assert.equal(a.helper,true);assert.equal(a.rainbow,12);
 for(const type of ['chest','gem','potion','helper'])assert.equal(events.filter(e=>e.type===type).length,1);
 assert.equal(updateAdventure(a,p,STEP).length,0);
 const fresh=createAdventure(a.pet);assert.equal(fresh.collected.size,0);assert.equal(fresh.opened.size,0);assert.equal(fresh.rainbow,0);
});

test('gummy bears greet once and reward completed goals once without spending treats',()=>{
 const a=createAdventure('bunny'),friend=a.friends[1],p={x:friend.x,y:610,onGround:true};a.treats=[];
 const greeting=updateAdventure(a,p,STEP);assert.equal(greeting.filter(e=>e.type==='hello').length,1);
 assert.equal(updateAdventure(a,p,STEP).filter(e=>e.type==='hello').length,0);
 a.collected=new Set(Array.from({length:12},(_,i)=>i));
 assert.equal(updateAdventure(a,p,STEP).filter(e=>e.type==='friend').length,1);
 assert.equal(a.score,5);assert.equal(a.collected.size,12);assert.equal(friend.helped,true);
 updateAdventure(a,p,STEP);assert.equal(a.score,5);
 const fresh=createAdventure();assert.ok(fresh.friends.every(f=>!f.helped&&!f.met));
});
test('outfit choices default safely when opening an older or invalid preview save',()=>{
 assert.equal(createAdventure('kitty').outfit,'rose');
 assert.equal(createAdventure('invalid','invalid').outfit,'rose');
 assert.equal(createAdventure('flutter','mint').outfit,'mint');
});

test('bubble wishes wait for all five pops and grant their celebration only once',()=>{
 const a=createAdventure('bunny');a.treats=[];a.gems=[];a.potions=[];a.chests=[];a.friends=[];
 const trail=a.bubbles.filter(b=>b.group===0),p={x:0,y:0,onGround:false};
 for(const [i,b] of trail.entries()){
  Object.assign(p,{x:b.x,y:b.y+48});
  const events=updateAdventure(a,p,STEP);
  assert.equal(events.filter(e=>e.type==='bubble').length,1);
  assert.equal(events.some(e=>e.type==='wish'),i===4);
  assert.equal(a.score,(i+1)*2+(i===4?10:0));
  assert.equal(updateAdventure(a,p,STEP).length,0);
 }
 assert.equal(a.wishes.size,1);assert.ok(a.celebration>7);assert.ok(a.rainbow>7);
 updateAdventure(a,{x:-1000,y:0},9);assert.equal(a.celebration,0);assert.equal(a.rainbow,0);
 const fresh=createAdventure('bunny');assert.equal(fresh.bubblesGot.size,0);assert.equal(fresh.wishes.size,0);
});

test('bubble trails have no timeout and custom lands do not inherit adventure bubbles',async()=>{
 const a=createAdventure('bunny'),b=a.bubbles[0];
 updateAdventure(a,{x:b.x,y:b.y+48},STEP);
 updateAdventure(a,{x:-1000,y:0},120);
 assert.equal(a.bubblesGot.size,1);
 const {compileLand}=await import('./creative.mjs');
 assert.deepEqual(compileLand([]).adventure.bubbles,[]);
});
