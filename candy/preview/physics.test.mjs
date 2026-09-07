import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorld,createPlayer,createStepper,tick,STEP,GROUND,FINISH} from './physics.mjs';
const controls=()=>({left:false,right:false,jumpPressed:false});
const advance=(w,p,i,seconds)=>{for(let n=0;n<Math.round(seconds/STEP);n++)tick(w,p,i);};

test('same input timeline gives the same position at 30, 60, and 120 Hz',()=>{
  const results=[30,60,120].map(hz=>{
    const w=createWorld(),p=createPlayer(),i=controls();i.right=true;
    let count=0;
    const stepper=createStepper(dt=>{if(count===24||count===78)i.jumpPressed=true;tick(w,p,i,dt);count++;});
    for(let f=0;f<hz*2;f++)stepper.advance(1/hz);
    return {x:p.x,y:p.y,vx:p.vx,vy:p.vy,count};
  });
  assert.deepEqual(results[0],results[1]);assert.deepEqual(results[1],results[2]);
});
test('a jump pressed just before landing fires on the following step',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();
 Object.assign(p,{y:605,vy:400,onGround:false,coyote:0,jumps:0});i.jumpPressed=true;
 advance(w,p,i,STEP*3);
 assert.ok(p.vy<0);assert.ok(p.y<GROUND);assert.equal(p.jumps,1);
});
test('edge grace allows a late ground jump and one extra jump',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();
 Object.assign(p,{x:1005,y:610,onGround:false,coyote:.1,jumps:2});i.jumpPressed=true;
 tick(w,p,i);assert.equal(p.jumps,1);assert.ok(p.vy<0);
 i.jumpPressed=true;tick(w,p,i);assert.equal(p.jumps,0);
 advance(w,p,i,.08);const before=p.vy;i.jumpPressed=true;tick(w,p,i);assert.ok(p.vy>before);
});
test('falling lands on the uppermost crossed platform regardless of array order',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();
 w.platforms=[{x:0,y:610,w:500,ground:true},{x:0,y:600,w:500}];
 Object.assign(p,{y:595,vy:1100,onGround:false});tick(w,p,i,.02);
 assert.equal(p.y,600);assert.equal(p.stand,1);
});
test('moving platform carries an idle rider without drifting off',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();const index=w.platforms.findIndex(pl=>pl.moving);
 // Establish its initial location before placing a rider.
 tick(w,p,i);const pl=w.platforms[index];
 Object.assign(p,{x:pl.x+70,y:pl.y,onGround:true,stand:index});
 advance(w,p,i,3);
 assert.ok(Math.abs(p.x-pl.x-70)<1e-6);assert.equal(p.onGround,true);
});
test('falling returns to the last safe ground and leaves controls responsive',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();
 Object.assign(p,{x:1100,y:919,vy:500,safeX:700,onGround:false});
 assert.ok(tick(w,p,i).includes('rescue'));assert.equal(p.x,700);assert.equal(p.y,GROUND);
 i.jumpPressed=true;tick(w,p,i);assert.ok(p.vy<0);
});
test('catch-up is bounded and reset clears leftover simulation time',()=>{
 let steps=0;const runner=createStepper(()=>steps++);runner.advance(10);assert.equal(steps,12);
 runner.advance(STEP/2);runner.reset();runner.advance(STEP/2);assert.equal(steps,12);
});
test('a simple repeat-jump route reaches the castle without pet powers',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();i.right=true;let rescued=0;
 for(let n=0;n<120*35&&!p.won;n++){
   if(n%66===0)i.jumpPressed=true;
   rescued+=tick(w,p,i).filter(e=>e==='rescue').length;
 }
 assert.equal(p.won,true);assert.ok(p.x>=FINISH);assert.equal(rescued,0);
});

test('grumps bounce a descending player and award a reward only on their first bop',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();
 const g={x:400,home:400,y:610,dir:1,squashed:0,huff:0,earned:false};w.grumps=[g];
 Object.assign(p,{x:400,y:560,vy:900,onGround:false,coyote:0,jumps:0});
 const events=tick(w,p,i);assert.ok(events.includes('bop'));assert.equal(p.y,566);assert.equal(p.vy,-540);assert.equal(p.onGround,false);assert.equal(g.earned,true);
 g.squashed=0;Object.assign(p,{x:g.x,y:560,vy:900,onGround:false,coyote:0,jumps:0});
 const again=tick(w,p,i);assert.ok(again.includes('boing'));assert.ok(!again.includes('bop'));
});
test('side contact only makes a grump huff and cannot move or hurt the player',()=>{
 const w=createWorld(),p=createPlayer(),i=controls();
 w.grumps=[{x:p.x+25,home:p.x+25,y:610,dir:1,squashed:0,huff:0,earned:false}];
 const x=p.x,events=tick(w,p,i);assert.ok(events.includes('huff'));assert.equal(p.x,x);assert.equal(p.y,610);assert.equal(p.vy,0);assert.ok(!events.includes('bop'));
});
