import test from 'node:test';
import assert from 'node:assert/strict';
import {createRescue,rescueAction,interactRescue,updateRescue,BUNNIES,BUNNY_HOME,CARROT_PATCH} from './rescue.mjs';
import {readCreative,compileLand,defaultCreative} from './creative.mjs';
import {createWorld} from './physics.mjs';
const player=x=>({x,y:610,onGround:true,won:false});
function rescueAll(r){
 for(const b of r.bunnies){if(b.kind==='picnic')interactRescue(r,player(CARROT_PATCH));
  interactRescue(r,player(b.x));if(b.stage!=='following')interactRescue(r,player(b.x));}
}
test('Pip plays peekaboo, Peaches needs a carrot, and Moon wakes to a song',()=>{
 const r=createRescue('meadow');
 assert.equal(rescueAction(r,player(620)).icon,'peek');
 assert.equal(interactRescue(r,player(620)).type,'reveal');
 assert.equal(rescueAction(r,player(620)).icon,'heart');
 assert.equal(interactRescue(r,player(620)).type,'rescue');
 assert.equal(interactRescue(r,player(620)),null);
 assert.equal(interactRescue(r,player(1560)).type,'hint');
 assert.equal(r.bunnies[1].stage,'hidden');
 assert.equal(interactRescue(r,player(CARROT_PATCH)).type,'carrot');
 assert.equal(interactRescue(r,player(1560)).type,'rescue');assert.equal(r.carrot,false);
 assert.equal(rescueAction(r,player(CARROT_PATCH)),null);
 assert.equal(rescueAction(r,player(2390)).icon,'song');
 assert.equal(interactRescue(r,player(2390)).type,'reveal');
 assert.equal(interactRescue(r,player(2390)).type,'rescue');
});
test('home needs all three friends and completion only happens once',()=>{
 const r=createRescue('meadow');assert.equal(interactRescue(r,player(BUNNY_HOME)).type,'hint');assert.equal(r.home,false);
 rescueAll(r);assert.equal(interactRescue(r,player(BUNNY_HOME)).type,'home');assert.equal(r.home,true);
 assert.equal(interactRescue(r,player(BUNNY_HOME)),null);
 assert.equal(createRescue('meadow').home,false);assert.equal(createRescue('berry'),null);assert.equal(compileLand([]).adventure.rescue,null);
});
test('interactions require proximity, accept nearby low platforms, and never fire while jumping or after winning',()=>{
 const r=createRescue('meadow');
 assert.equal(rescueAction(r,player(100)),null);
 assert.equal(rescueAction(r,{...player(620),onGround:false}),null);
 assert.equal(rescueAction(r,{...player(620),won:true}),null);
 assert.equal(rescueAction(r,{...player(620),y:200}),null);
 assert.equal(rescueAction(r,{...player(2390),y:470}).id,'moon');
 const w=createWorld('meadow');
 for(const x of [...BUNNIES.map(b=>b.x),CARROT_PATCH,BUNNY_HOME])assert.ok(w.platforms.some(pl=>pl.ground&&pl.x+40<x&&pl.x+pl.w-40>x));
});
test('followers copy jumps, recover with Emma, and keep a bounded path history',()=>{
 const r=createRescue('meadow');rescueAll(r);
 for(let i=0;i<100;i++)updateRescue(r,{x:i*5,y:400},.05);
 assert.equal(r.trail.length,45);assert.ok(r.bunnies.every(b=>b.drawY===400));
 assert.ok(r.bunnies[0].drawX>r.bunnies[1].drawX);
 const parked=r.bunnies.map(b=>b.drawX);for(let i=0;i<50;i++)updateRescue(r,{x:495,y:400},.05);assert.deepEqual(r.bunnies.map(b=>b.drawX),parked);
 for(let i=0;i<50;i++)updateRescue(r,{x:200,y:610},.05);
 assert.ok(r.bunnies.every(b=>b.drawX===200&&b.drawY===610));
});
test('bunny moods persist safely without losing existing room, wallpaper, or land saves',()=>{
 const original={...defaultCreative(),wallpaper:3,land:[{t:0,x:100,d:80}],bunnies:[{id:'pip',mood:'sleep'},{id:'pip',mood:'play'},{id:'moon',mood:'invalid'},null,{id:'unknown',mood:'snack'}]};
 const saved=readCreative(JSON.stringify(original));
 assert.deepEqual(saved.bunnies,[{id:'pip',mood:'sleep'},{id:'moon',mood:'happy'}]);assert.equal(saved.wallpaper,3);assert.deepEqual(saved.room,original.room);assert.deepEqual(saved.land,original.land);
 assert.deepEqual(readCreative('{}').bunnies,[]);assert.deepEqual(readCreative('{"bunnies":{}}').bunnies,[]);
});
