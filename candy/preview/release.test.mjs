import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeLand,compileLand,readCreative,importLegacyCreative,CREATIVE_KEY} from './creative.mjs';
import {initializeReleaseStorage,RELEASE_SAVE} from './migration.mjs';
import {createFamily,cleanState,landId,validCode} from './family.mjs';
test('builder sanitizes limits and compiles every sticker into a playable world',()=>{
 const items=[0,1,2,3,4,5,6].map((t,i)=>({t,x:200+i*250,d:120}));const {world,adventure}=compileLand(items);
 assert.equal(world.platforms.length,2);assert.equal(world.springs.length,1);assert.equal(world.grumps.length,1);assert.equal(world.stars.length,1);assert.equal(adventure.treats.length,2);assert.equal(adventure.friends.length,1);
 assert.equal(sanitizeLand(Array.from({length:100},()=>({t:6,x:100,d:100}))).length,3);assert.equal(sanitizeLand([null,{t:99}]).length,0);
});
test('room placement, wallpaper, inventory archive and original builder coordinates migrate',()=>{
 const original={roomItems:[{t:0,x:600,y:480}],wallpaper:3,furnInv:{0:2},customLand:{items:[{t:0,x:800,d:120}]}};
 const room=readCreative(JSON.stringify(importLegacyCreative(original)));assert.deepEqual(room.room,[{t:0,x:50,y:75}]);assert.equal(room.wallpaper,3);assert.equal(room.legacy.furnInv[0],2);assert.equal(room.land[0].x,800);
});
test('release migration is one-time, exact-backs-up original saves and merges stars',()=>{
 const legacy=JSON.stringify({choc:65,starsGot:{0:[true,true,false]},maxLevel:1,activePet:1,activeOutfit:2,roomItems:[{t:3,x:500,y:500}],eggs:3,pets:[0,1],outfits:[0,2]});
 const data=new Map([['emmabug-candy-progress',legacy]]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
 initializeReleaseStorage(storage);const progress=JSON.parse(data.get(RELEASE_SAVE));assert.equal(progress.pet,'puppy');assert.equal(progress.outfit,'mermaid');assert.equal(progress.levels.meadow.stars,2);assert.equal(progress.levels.meadow.finished,true);
 assert.equal(data.get('emmabug-candy-progress'),legacy);assert.equal(data.get('emmabug-candy-legacy-backup'),legacy);assert.equal(JSON.parse(data.get(CREATIVE_KEY)).legacy.eggs,3);
 const saved=data.get(RELEASE_SAVE);data.set('emmabug-candy-progress','{}');initializeReleaseStorage(storage);assert.equal(data.get(RELEASE_SAVE),saved);
});
class Events{handlers={};on(e,fn){(this.handlers[e]??=[]).push(fn);}emit(e,...args){for(const f of this.handlers[e]||[])f(...args);}}
class Connection extends Events{open=false;constructor(peer){super();this.peer=peer;}send(data){if(this.open)queueMicrotask(()=>this.other.emit('data',structuredClone(data)));}close(){if(!this.open)return;this.open=false;this.other.open=false;this.emit('close');this.other.emit('close');}}
class TestPeer extends Events{static peers=new Map();static next=1;conns=[];constructor(id){super();this.id=id||'guest-'+TestPeer.next++;TestPeer.peers.set(this.id,this);queueMicrotask(()=>this.emit('open',this.id));}connect(id){const remote=TestPeer.peers.get(id);const a=new Connection(id),b=new Connection(this.id);a.other=b;b.other=a;this.conns.push(a);remote.conns.push(b);queueMicrotask(()=>{remote.emit('connection',b);queueMicrotask(()=>{a.open=b.open=true;b.emit('open');a.emit('open');});});return a;}destroy(){TestPeer.peers.delete(this.id);this.conns.forEach(c=>c.close());}}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const own=()=>({x:100,y:610,face:1,onGround:true,level:'meadow',pet:'kitty',outfit:'rose'});
test('family reserves a five-person cap, relays states/rewards/reactions/lands and falls back to solo',async t=>{
 const sessions=Array.from({length:6},()=>createFamily({snapshot:own,peerLoader:async()=>TestPeer}));t.after(()=>sessions.forEach(s=>s.leave()));
 const host=sessions[0];await host.host();await delay(10);assert.equal(host.status().phase,'online');assert.ok(validCode(host.status().code));
 await Promise.all(sessions.slice(1).map(s=>s.join(host.status().code)));await delay(240);
 assert.equal(host.status().count,5);assert.equal(sessions.filter(s=>s.status().phase==='online').length,5);assert.match(sessions[5].status().message,/five/);
 sessions[1].addCandy(4);sessions[1].react(0);sessions[1].share([{t:0,x:700,d:100}]);await delay(130);
 assert.equal(host.status().total,4);assert.equal(sessions[2].status().total,4);assert.equal(sessions[2].status().shared.items[0].x,700);assert.ok(sessions[2].players().some(p=>p.reaction==='♥'));
 host.leave();await delay(20);assert.ok(sessions.slice(1).every(s=>s.status().phase==='solo'));
});
test('stale asynchronous connection attempts cannot restart after leaving',async()=>{
 let resolve,calls=0;const session=createFamily({snapshot:own,peerLoader:()=>new Promise(r=>resolve=r)});const task=session.host();session.leave();resolve(class{constructor(){calls++;}});await task;assert.equal(calls,0);assert.equal(session.status().phase,'solo');
});
test('network states and shared land identities reject invalid content',()=>{
 assert.equal(cleanState({x:NaN,y:1}),null);assert.equal(cleanState({...own(),level:'unknown'}),null);assert.equal(cleanState({...own(),name:'typed name'}).name,0);assert.equal(landId([{t:0,x:500,d:100}]),landId([{t:0,x:500,d:100}]));assert.notEqual(landId([]),landId([{t:0,x:500,d:100}]));
});
