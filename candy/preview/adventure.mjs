import {createRescue} from './rescue.mjs';
import {levelById} from './levels.mjs';

export const PETS = [
  {id:'puppy',name:'Puppy',color:'#c7aa87',power:'Star finder',hint:'A sparkling trail points to nearby stars.',key:'finder'},
  {id:'shelly',name:'Shelly',color:'#a8bf97',power:'Helpful heart',hint:'Bear goals need fewer treats.',key:'discount'},
  {id:'kitty',name:'Kitty',icon:'🐱',color:'#dca1a2',power:'Candy magnet',hint:'Nearby sweets fly to you.',key:'magnet'},
  {id:'bunny',name:'Bunny',icon:'🐰',color:'#e4bdd0',power:'Bigger jumps',hint:'Hop a little higher!',key:'highjump'},
  {id:'pengy',name:'Pengy',icon:'🐧',color:'#98bec7',power:'Speedy feet',hint:'Run with an extra little whoosh.',key:'speedy'},
  {id:'flutter',name:'Flutter',icon:'🦋',color:'#b5a0cf',power:'Floaty wings',hint:'Hold jump to float gently down.',key:'glide'},
  {id:'draggy',name:'Draggy',icon:'🐉',color:'#9cbd98',power:'Triple jump',hint:'Jump, jump, jump! One extra hop.',key:'triple'},
  {id:'sparkle',name:'Sparkle',icon:'🦄',color:'#dba4c8',power:'Double lollipops',hint:'Lollipops give twice the sweets.',key:'sweet'}
];
export const OUTFITS = [
  {id:'rose',name:'Rose Princess',hint:'A little pink daydream',dark:'#ca8097',light:'#e9aabb',trim:'#f1bec9',hem:'#ffdfdc',shoe:'#a86b80',jewel:'#c67d96',motif:'star'},
  {id:'lavender',name:'Moonbeam',hint:'For wishing on stars',dark:'#9882b9',light:'#c1addd',trim:'#d8c5ea',hem:'#efe1fa',shoe:'#857099',jewel:'#ab90cf',motif:'moon'},
  {id:'mint',name:'Garden Fairy',hint:'Made for meadow magic',dark:'#77a38c',light:'#aad0af',trim:'#c5dfba',hem:'#eff0d1',shoe:'#698f7a',jewel:'#8bb89a',motif:'flower'},
  {id:'sunshine',name:'Buttercup',hint:'A pocket full of sunshine',dark:'#d1a054',light:'#f0cc80',trim:'#f5dfaa',hem:'#fff1ca',shoe:'#b38b55',jewel:'#d4a757',motif:'sun'}
];
OUTFITS.push(
 {id:'rainbow',name:'Rainbow',hint:'All the colors of a wish',dark:'#b284b9',light:'#d9b5cf',trim:'#a5d0c0',hem:'#f2d390',shoe:'#997baa',jewel:'#bd91bf',motif:'rainbow'},
 {id:'mermaid',name:'Mermaid',hint:'A little sea magic',dark:'#65a5b0',light:'#96d3cc',trim:'#addddd',hem:'#dae9de',shoe:'#649fa1',jewel:'#80b9bf',motif:'flower'},
 {id:'sunset',name:'Sunset',hint:'Warm evening wishes',dark:'#ca8c85',light:'#edb395',trim:'#f2cba6',hem:'#fae0b4',shoe:'#b97e79',jewel:'#c58f9c',motif:'sun'},
 {id:'midnight',name:'Midnight',hint:'A sky full of stars',dark:'#6e6491',light:'#a59dc6',trim:'#b9b0d8',hem:'#dbd1eb',shoe:'#675b87',jewel:'#a38bc5',motif:'moon'},
 {id:'royal',name:'Royal Gold',hint:'For a queen of kindness',dark:'#bc9353',light:'#e7c276',trim:'#efd995',hem:'#fff0be',shoe:'#9e7946',jewel:'#c891a6',motif:'star'}
);
export const questNeed=(friend,pet)=>pet==='shelly'?Math.max(1,Math.ceil(friend.need*.75)):friend.need;
// Three optional, untimed bubble trails on roomy islands in each adventure.
export function bubbleTrails(level) {
  const islands=[level.grounds[0],level.grounds[Math.floor(level.grounds.length/2)],level.grounds.at(-1)];
  return islands.flatMap(([x],group)=>{
    const start=Math.max(360,Math.min(x+100,level.finish-450));
    return Array.from({length:5},(_,i)=>({x:start+i*65,y:540-Math.sin(i*Math.PI/4)*85,group}));
  });
}
export function createAdventure(pet='kitty',outfit='rose',levelId='meadow') {
  const level=levelById(levelId);
  const treats=[];
  // Every chapter has a ground trail and rewards for taking the high route.
  for(const [x,w] of level.grounds)for(let tx=Math.max(240,x+90);tx<x+w-75&&tx<level.finish-80;tx+=180)
    treats.push({x:tx,y:560,kind:['cookie','candy','lolly'][treats.length%3]});
  for(const [x,y,w] of level.floats) {
    treats.push({x:x+w*.35,y:y-50,kind:'cupcake'});
    treats.push({x:x+w*.7,y:y-55,kind:'lolly'});
  }
  const adventure={rescue:createRescue(level.id),bubbles:bubbleTrails(level),bubblesGot:new Set(),wishes:new Set(),celebration:0,levelId:level.id,pet:PETS.some(p=>p.id===pet)?pet:'kitty',outfit:OUTFITS.some(o=>o.id===outfit)?outfit:'rose',treats,collected:new Set(),score:0,
    gems:level.floats.filter((_,i)=>i%3===1).map(([x,y,w])=>({x:x+w*.15,y:y-85})),
    gemsGot:new Set(),chests:level.chests.map(x=>({x,y:610})),opened:new Set(),
    potions:level.floats.filter((_,i)=>i%6===0).map(([x,y])=>({x:x+25,y:y-88})),potionsGot:new Set(),
    friends:[
      {x:500,y:610,name:'Mallow',need:6,color:'#d6a5bd',met:false,helped:false},
      {x:1420,y:610,name:'Peaches',need:12,color:'#e3b483',met:false,helped:false},
      {x:3940,y:610,name:'Minty',need:24,color:'#a5c6a0',met:false,helped:false}
    ],rainbow:0,helper:false,petX:100,petY:590};
  adventure.friends.forEach((friend,i)=>{friend.x=level.friends[i];});
  return adventure;
}
export function powersFor(a) {
  return {[PETS.find(p=>p.id===a.pet)?.key]:true,magnet:a.pet==='kitty'||a.rainbow>0};
}
export function updateAdventure(a,p,dt) {
  const events=[];a.celebration=Math.max(0,a.celebration-dt);a.rainbow=Math.max(0,a.rainbow-dt);
  if(p.won)return events;
  const powers=powersFor(a),px=p.x,py=p.y-48;
  a.bubbles.forEach((bubble,i)=>{
    if(a.bubblesGot.has(i)||Math.hypot(bubble.x-px,bubble.y-py)>=44)return;
    a.bubblesGot.add(i);a.score+=2;
    const count=a.bubbles.filter((b,j)=>b.group===bubble.group&&a.bubblesGot.has(j)).length;
    events.push({type:'bubble',...bubble,count});
    if(count===5&&!a.wishes.has(bubble.group)){
      a.wishes.add(bubble.group);a.score+=10;a.rainbow=Math.max(a.rainbow,8);a.celebration=8;
      events.push({type:'wish',...bubble});
    }
  });
  a.treats.forEach((t,i)=>{
    if(a.collected.has(i))return;
    let d=Math.hypot(t.x-px,t.y-py);
    if(powers.magnet&&d<175) {
      const pull=1-Math.exp(-8*dt);t.x+=(px-t.x)*pull;t.y+=(py-t.y)*pull;
      d=Math.hypot(t.x-px,t.y-py);
    }
    if(d<43){a.collected.add(i);const value=t.kind==='cupcake'?3:t.kind==='lolly'?2:1;
      const points=value*(t.kind==='lolly'&&powers.sweet?2:1);a.score+=points;
      events.push({type:'treat',x:t.x,y:t.y,kind:t.kind,points});}
  });
  a.gems.forEach((g,i)=>{if(!a.gemsGot.has(i)&&Math.hypot(g.x-px,g.y-py)<44){a.gemsGot.add(i);events.push({type:'gem',...g});}});
  a.potions.forEach((b,i)=>{if(!a.potionsGot.has(i)&&Math.hypot(b.x-px,b.y-py)<44){a.potionsGot.add(i);a.rainbow=12;events.push({type:'potion',...b});}});
  a.chests.forEach((ch,i)=>{if(!a.opened.has(i)&&p.onGround&&Math.abs(ch.x-px)<48&&Math.abs(ch.y-p.y)<10){a.opened.add(i);a.score+=5;events.push({type:'chest',...ch});}});
  if(!a.helper&&a.collected.size>=12){a.helper=true;events.push({type:'helper',x:px,y:py});}
  for(const friend of a.friends) {
    if(Math.abs(friend.x-px)>75 || !p.onGround || Math.abs(friend.y-p.y)>10)continue;
    if(!friend.helped && a.collected.size>=questNeed(friend,a.pet)) {
      friend.helped=true;friend.met=true;a.score+=5;
      events.push({type:'friend',x:friend.x,y:friend.y-60,name:friend.name});
    } else if(!friend.met) {
      friend.met=true;events.push({type:'hello',x:friend.x,y:friend.y-60,name:friend.name,need:questNeed(friend,a.pet)});
    }
  }
  return events;
}
