import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from './levels.mjs';
import {createWorld,createPlayer,tick,STEP,createStepper} from './physics.mjs';
import {createAdventure} from './adventure.mjs';
import {readProgress,recordProgress} from './progress.mjs';
for(const level of LEVELS) {
 test(`${level.name}: a basic no-powers route reaches the castle without recovery`,()=>{
  const w=createWorld(level.id),p=createPlayer(),input={left:false,right:true,jumpPressed:false};let rescues=0;
  for(let n=0;n<120*45&&!p.won;n++){if(n%66===0)input.jumpPressed=true;rescues+=tick(w,p,input).filter(e=>e==='rescue').length;}
  assert.equal(p.won,true);assert.equal(rescues,0);
 });
 test(`${level.name}: all stars can be reached from nearby platforms with ordinary jumps`,()=>{
  for(const target of level.stars){let reached=false;
   const bases=createWorld(level.id).platforms.map((pl,i)=>({pl,i})).filter(({pl})=>target[0]>pl.x-300&&target[0]<pl.x+pl.w+300&&pl.y>target[1]);
   outer:for(const {pl,i} of bases)for(const offset of [.2,.5,.8])for(const extra of [24,42,60]){
    const w=createWorld(level.id),p=createPlayer(),input={left:false,right:false,jumpPressed:false};
    Object.assign(p,{x:pl.x+pl.w*offset,y:pl.y,onGround:true,stand:i});
    for(let n=0;n<240;n++){
     input.right=p.x<target[0]-10;input.left=p.x>target[0]+10;input.jumpPressed=n===0||n===extra;
     tick(w,p,input);
     if(Math.hypot(p.x-target[0],p.y-55-target[1])<48){reached=true;break outer;}
    }
   }
   assert.equal(reached,true,`unreachable star at ${target}`);
  }
 });
 test(`${level.name}: grounded rewards sit on land and runtime state is isolated`,()=>{
  const w=createWorld(level.id),a=createAdventure('kitty','rose',level.id);
  for(const item of [...a.chests,...a.friends,...w.grumps,...w.springs])
   assert.ok(w.platforms.some(pl=>pl.ground&&item.x>pl.x&&item.x<pl.x+pl.w),`unsupported item at ${item.x}`);
  a.collected.add(0);a.treats[0].x=-1000;w.platforms[0].x=-9999;
  const fresh=createAdventure('kitty','rose',level.id);assert.equal(fresh.collected.size,0);assert.notEqual(fresh.treats[0].x,-1000);assert.notEqual(createWorld(level.id).platforms[0].x,-9999);
 });
}
test('progress preserves per-level personal bests, completion, and preferences',()=>{
 let p=readProgress(null);p=recordProgress(p,'meadow',25,2,true,'bunny','mint');
 p=recordProgress(p,'berry',15,1,true,'flutter','lavender');
 p=recordProgress(p,'meadow',5,0,false,'kitty','rose');
 const loaded=readProgress(JSON.stringify(p));
 assert.deepEqual(loaded.levels.meadow,{candies:25,stars:2,finished:true});
 assert.deepEqual(loaded.levels.berry,{candies:15,stars:1,finished:true});assert.equal(loaded.lastLevel,'meadow');
});
test('old preview saves migrate without inventing completed levels; invalid values normalize',()=>{
 const old=readProgress('{"candies":20,"stars":2,"pet":"flutter","outfit":"mint"}');
 assert.deepEqual(old.levels.meadow,{candies:20,stars:2,finished:false});assert.equal(old.pet,'flutter');
 assert.equal(readProgress('{broken').lastLevel,'meadow');
 assert.equal(readProgress('{"stars":900,"lastLevel":"missing","levels":{"berry":{"stars":-8}}}').levels.berry.stars,0);
});
test('moving-platform routes remain frame-rate independent in every adventure',()=>{
 for(const level of LEVELS){const positions=[30,60,120].map(hz=>{
  const w=createWorld(level.id),p=createPlayer(),i={left:false,right:true,jumpPressed:false};let step=0;
  const runner=createStepper(dt=>{if(step++%66===0)i.jumpPressed=true;tick(w,p,i,dt);});
  for(let n=0;n<hz*6;n++)runner.advance(1/hz);return {x:p.x,y:p.y};
 });assert.deepEqual(positions[0],positions[1]);assert.deepEqual(positions[1],positions[2]);}
});

test('counting doors have unique answer choices and child-sized arithmetic in every world',async()=>{
 const {puzzleFor}=await import('./puzzles.mjs');
 for(const level of LEVELS){const q=puzzleFor(level.id);assert.equal(q.answer,q.op==='+'?q.a+q.b:q.a-q.b);assert.ok(q.answer>0&&q.answer<=10);assert.equal(new Set(q.choices).size,3);assert.ok(q.choices.includes(q.answer));}
});

test('extended chapters provide crossings and rewards all the way to each castle',()=>{
 for(const level of LEVELS){
  const a=createAdventure('bunny','rose',level.id);
  assert.ok(level.finish>=7300);
  assert.ok(level.grounds.length>=7);
  assert.ok(level.floats.filter(pl=>pl[3]>0).length>=4);
  assert.equal(level.stars.length,3);
  assert.ok(level.stars[2][0]>level.finish*.75);
  for(const items of [a.treats,a.gems,a.potions,a.chests,a.friends])
   assert.ok(items.some(item=>item.x>level.finish*.75),'the final chapter needs rewards');
  assert.ok(a.treats.every(item=>item.x<level.finish));
  assert.ok(level.grounds.some(([x,w])=>x<level.finish&&x+w>level.finish+100));
 }
});
