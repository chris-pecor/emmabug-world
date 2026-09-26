export const BUNNIES = [
  {id:'pip',name:'Pip',color:'#fff0d9',x:620,kind:'bush',clue:'Little pawprints lead to a rustling pink bush.'},
  {id:'peaches',name:'Peaches',color:'#eac19d',x:1560,kind:'picnic',clue:'A hungry bunny is near the picnic basket. Pick a carrot on the way!'},
  {id:'moon',name:'Moon',color:'#cfc4e5',x:2390,kind:'bed',clue:'Look for two sleepy ears beneath the giant flower.'}
];
export const BUNNY_HOME=2730;
export const CARROT_PATCH=1290;
export function createRescue(levelId){
  return levelId==='meadow'?{bunnies:BUNNIES.map(b=>({...b,stage:'hidden',drawX:b.x,drawY:610})),carrot:false,home:false,trail:[],trailClock:0}:null;
}
export function rescueAction(r,p){
  if(!r||p.won||!p.onGround||Math.abs(p.y-610)>165)return null;
  if(!r.carrot&&r.bunnies[1].stage!=='following'&&Math.abs(p.x-CARROT_PATCH)<85)
    return {id:'carrot',icon:'carrot',label:'Pick'};
  for(const b of r.bunnies){
    if(b.stage==='following'||Math.abs(p.x-b.x)>90)continue;
    if(b.kind==='bush')return {id:b.id,icon:b.stage==='hidden'?'peek':'heart',label:b.stage==='hidden'?'Peek':'Hello!'};
    if(b.kind==='picnic')return {id:b.id,icon:'carrot',label:r.carrot?'Feed':'Carrots ←'};
    return {id:b.id,icon:b.stage==='hidden'?'song':'heart',label:b.stage==='hidden'?'Sing':'Come along'};
  }
  if(!r.home&&Math.abs(p.x-BUNNY_HOME)<110)return {id:'home',icon:'home',label:'Home'};
  return null;
}
export function interactRescue(r,p){
  const action=rescueAction(r,p);if(!action)return null;
  if(action.id==='carrot'){r.carrot=true;return {type:'carrot',text:'For Peaches! →'};}
  if(action.id==='home'){
    if(r.bunnies.some(b=>b.stage!=='following'))return {type:'hint',text:'Who is missing?'};
    r.home=true;return {type:'home',text:'Home together! ♥'};
  }
  const b=r.bunnies.find(b=>b.id===action.id);
  if(b.kind==='picnic'&&!r.carrot)return {type:'hint',text:'Carrots ←'};
  if(b.stage==='hidden'&&b.kind!=='picnic'){
    b.stage='awake';return {type:'reveal',id:b.id,text:b.kind==='bush'?'Peekaboo, Pip!':'Good morning, Moon!'};
  }
  b.stage='following';if(b.kind==='picnic')r.carrot=false;
  return {type:'rescue',id:b.id,text:`Hello, ${b.name}! ♥`};
}
export function rescueHint(r){
  if(r.home)return 'Everyone is home! Visit your bunnies in My room.';
  const next=r.bunnies.find(b=>b.stage!=='following');
  return next?next.clue:'Three little friends! Follow the path to the bunny cottage.';
}
export function updateRescue(r,p,dt,platforms=[]){
  if(!r)return;
  // Followers replay Emma's path, including jumps and safe recoveries.
  r.trailClock+=dt;
  if(r.trailClock>=.05){
    r.trailClock%=.05;const last=r.trail.at(-1),distance=last?Math.hypot(p.x-last.x,p.y-last.y):Infinity;
    if(distance>250)r.trail.length=0;
    if(distance>3){r.trail.push({x:p.x,y:p.y});if(r.trail.length>45)r.trail.shift();}
  }
  r.bunnies.filter(b=>b.stage==='following').forEach((b,i)=>{
    const target=r.trail[Math.max(0,r.trail.length-1-(i+1)*7)]||p;
    const resting=p.onGround&&Math.abs(p.vx||0)<1,stand=platforms[p.stand];
    if(resting&&stand){
      b.drawX=Math.max(stand.x+18,Math.min(stand.x+stand.w-18,p.x-(p.face||1)*(i+1)*28));b.drawY=stand.y;
    }else{b.drawX=target.x;b.drawY=target.y;}
  });
}
