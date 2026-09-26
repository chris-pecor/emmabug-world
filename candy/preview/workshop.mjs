import {BUNNIES} from './rescue.mjs';
import {CREATIVE_KEY,FURNITURE,STICKERS,LIMITS,readCreative,sanitizeLand} from './creative.mjs';
import {furnitureIcon} from './furniture.mjs';
export function createWorkshop({root,renderer,openPanel,play,share,notify,preferences}){
 let raw;try{raw=localStorage.getItem(CREATIVE_KEY);}catch{}let state=readCreative(raw),mode='room',tool=0,selected=-1,undo=[],activeBunny='pip',bunnyPlay=true;
 const carePictures=Object.fromEntries(['carrot','play','sleep'].map(id=>[id,renderer.storyPortrait(id)]));
 const furniture=FURNITURE.map((_,i)=>furnitureIcon(i)),stickers=STICKERS.map((_,i)=>renderer.stickerPortrait(i));
 const items=()=>mode==='room'?state.room:state.land;
 function save(){try{localStorage.setItem(CREATIVE_KEY,JSON.stringify(state));}catch{notify('Your device could not save this change. Please keep this page open.');}}
 function remember(){undo.push(JSON.stringify(state));if(undo.length>30)undo.shift();}
 function render(){
  const room=mode==='room',names=room?FURNITURE:STICKERS,icons=room?furniture:stickers;
  root.classList.toggle('bunny-play',!!(room&&bunnyPlay&&state.bunnies.length));
  root.innerHTML=`${room&&state.bunnies.length?`<div class="room-mode"><button data-room-mode="play" aria-pressed="${bunnyPlay}">♥ Play</button><button data-room-mode="decorate" aria-pressed="${!bunnyPlay}">✿ Decorate</button></div>`:''}<div class="work-tools">${names.map((name,i)=>`<button data-tool="${i}" aria-pressed="${tool===i}" title="${name}"><img alt="" src="${icons[i]}"><span>${name}</span></button>`).join('')}</div>
  <div class="work-actions">${room?`<label>Wallpaper <select id="wallpaper"><option value="0">Rose</option><option value="1">Moonbeam</option><option value="2">Buttercup</option><option value="3">Mint</option></select></label>`:'<button id="play-land">Play my land →</button><button id="share-land">Share with family</button>'}<button id="work-undo" ${undo.length?'':'disabled'}>Undo</button><button id="work-remove" ${selected>=0?'':'disabled'}>Put selected item away</button></div>
  <p class="work-hint">Pick a picture. Tap to place. Drag to move.</p>
  <div class="work-viewport ${room?'room-viewport':'build-viewport'}"><div id="work-stage" class="work-stage ${room?'room-stage':'build-stage'}" tabindex="0" aria-label="${room?'Your room':'Your land'}. Tap to place a sticker.">${room?'<div class="room-window"></div><div class="room-rug"></div>':'<div class="build-floor"></div><span class="build-castle">Your castle ✦</span>'}</div></div>
  ${room?'<div id="bunny-care" class="bunny-care"></div>':''}
  <p class="work-hint" id="work-status" role="status">${room?'Make it cozy!':'Swipe to explore.'}</p>`;
  root.querySelectorAll('[data-room-mode]').forEach(button=>button.onclick=()=>{bunnyPlay=button.dataset.roomMode==='play';render();root.querySelector(`[data-room-mode="${bunnyPlay?'play':'decorate'}"]`).focus();});
  root.querySelectorAll('[data-tool]').forEach(button=>button.onclick=()=>{tool=+button.dataset.tool;root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.tool===tool)));});
  root.querySelector('#work-undo').onclick=()=>{if(undo.length){const bunnies=state.bunnies;state=readCreative(undo.pop());state.bunnies=bunnies;selected=-1;save();render();}};
  root.querySelector('#work-remove').onclick=()=>{if(selected>=0){remember();items().splice(selected,1);selected=-1;save();render();}};
  if(room){const wallpaper=root.querySelector('#wallpaper');wallpaper.value=state.wallpaper;wallpaper.onchange=()=>{remember();state.wallpaper=+wallpaper.value;save();paint();};}
  else{root.querySelector('#play-land').onclick=()=>{save();play(sanitizeLand(state.land));};root.querySelector('#share-land').onclick=()=>share(sanitizeLand(state.land));}
  const stage=root.querySelector('#work-stage');
  stage.onclick=e=>{
   if(room&&bunnyPlay&&state.bunnies.length)return;
   if(e.target.closest('.placed,.room-bunny'))return;
   if(items().length>=(room?60:100)||(!room&&items().filter(i=>i.t===tool).length>=LIMITS[tool])){notify('That is all of that sticker. Move one or put one away.');return;}
   remember();const pos=point(e);items().push(room?{t:tool,x:pos.x,y:pos.y}:{t:tool,x:pos.x,d:[1,4,5].includes(tool)?0:pos.d});selected=items().length-1;save();paint();
  };
  stage.onkeydown=e=>{if(selected<0||(room&&bunnyPlay&&state.bunnies.length))return;const keys={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(!keys[e.key])return;e.preventDefault();remember();const item=items()[selected],[dx,dy]=keys[e.key];
   if(room){item.x=Math.max(6,Math.min(94,item.x+dx*2));item.y=Math.max(22,Math.min(94,item.y+dy*2));}
   else{item.x=Math.max(60,Math.min(4090,item.x+dx*20));if(![1,4,5].includes(item.t))item.d=Math.max(35,Math.min(430,item.d-dy*20));}save();paint();root.querySelector('.picked')?.focus();};
  paint();
 }
 function point(e){const stage=root.querySelector('#work-stage'),rect=stage.getBoundingClientRect();
  if(mode==='room')return {x:Math.max(6,Math.min(94,(e.clientX-rect.left)/rect.width*100)),y:Math.max(22,Math.min(94,(e.clientY-rect.top)/rect.height*100))};
  return {x:Math.max(60,Math.min(4090,(e.clientX-rect.left)/rect.width*4400)),d:Math.max(35,Math.min(430,610-(e.clientY-rect.top)/rect.height*700))};
 }
 function position(el,item){if(mode==='room'){el.style.left=item.x+'%';el.style.top=item.y+'%';}else{el.style.left=item.x/4400*100+'%';el.style.top=(610-item.d)/700*100+'%';}}
 function paint(){const room=mode==='room',stage=root.querySelector('#work-stage');if(!stage)return;
  stage.dataset.wallpaper=state.wallpaper;stage.querySelectorAll('.placed,.room-princess,.room-bunny').forEach(el=>el.remove());
  if(room){const img=document.createElement('img');img.className='room-princess';img.alt='Emma in her room';img.src=renderer.outfitPortrait(preferences().outfit);stage.append(img);}
  items().forEach((item,index)=>{
   const el=document.createElement('button');el.className='placed'+(index===selected?' picked':'')+(!room&&item.t===0?' placed-platform':'');el.setAttribute('aria-label',(room?FURNITURE:STICKERS)[item.t]+' '+(index+1));
   el.innerHTML=`<img draggable="false" alt="" src="${(room?furniture:stickers)[item.t]}">`;position(el,item);stage.append(el);
   let dragging=false,moved=false,initial;
   el.onpointerdown=e=>{e.preventDefault();selected=index;initial={x:e.clientX,y:e.clientY};dragging=true;moved=false;el.setPointerCapture(e.pointerId);stage.querySelectorAll('.placed').forEach(b=>b.classList.remove('picked'));el.classList.add('picked');root.querySelector('#work-remove').disabled=false;el.focus();};
   el.onpointermove=e=>{if(!dragging)return;if(!moved&&Math.hypot(e.clientX-initial.x,e.clientY-initial.y)<4)return;if(!moved)remember();moved=true;const pos=point(e);item.x=pos.x;if(room)item.y=pos.y;else item.d=[1,4,5].includes(item.t)?0:pos.d;position(el,item);};
   const end=()=>{if(dragging){dragging=false;save();root.querySelector('#work-undo').disabled=!undo.length;}};el.onpointerup=end;el.onpointercancel=end;el.onlostpointercapture=end;
   el.onclick=e=>e.stopPropagation();
  });
  if(room)paintBunnies();
  root.querySelector('#work-undo').disabled=!undo.length;root.querySelector('#work-remove').disabled=selected<0;
 }
 function paintBunnies(){
  const panel=root.querySelector('#bunny-care'),stage=root.querySelector('#work-stage');
  if(!panel)return;
  if(!state.bunnies.length){panel.innerHTML='<p>Find the bunnies in Candy Meadow ♥</p>';return;}
  if(!state.bunnies.some(b=>b.id===activeBunny))activeBunny=state.bunnies[0].id;
  const selectedBunny=state.bunnies.find(b=>b.id===activeBunny),name=BUNNIES.find(b=>b.id===activeBunny).name;
  panel.innerHTML=`<h3>Your bunny family</h3><div class="bunny-choices">${state.bunnies.map(b=>`<button data-bunny="${b.id}" aria-pressed="${b.id===activeBunny}"><img src="${renderer.bunnyPortrait(b.id,b.mood)}" alt=""><span>${BUNNIES.find(d=>d.id===b.id).name}</span></button>`).join('')}</div><div class="bunny-care-actions"><button data-care="snack"><img src="${carePictures.carrot}" alt="">Snack</button><button data-care="play"><img src="${carePictures.play}" alt="">Play</button><button data-care="sleep"><img src="${carePictures.sleep}" alt="">Sleep</button></div><p id="bunny-care-status" role="status">${name} ${selectedBunny.mood==='sleep'?'is cozy. ♡':selectedBunny.mood==='snack'?'says crunch!':selectedBunny.mood==='play'?'says boing!':'♥'}</p>`;
  panel.querySelectorAll('[data-bunny]').forEach(button=>button.onclick=()=>{activeBunny=button.dataset.bunny;paint();panel.querySelector(`[data-bunny="${activeBunny}"]`).focus();});
  panel.querySelectorAll('[data-care]').forEach(button=>button.onclick=()=>{selectedBunny.mood=button.dataset.care;save();paint();panel.querySelector(`[data-care="${selectedBunny.mood}"]`).focus();});
  state.bunnies.forEach((b,i)=>{
   const img=document.createElement('img');img.className='room-bunny'+(b.mood==='play'?' playing':'');img.alt=BUNNIES.find(d=>d.id===b.id).name+(b.mood==='sleep'?' sleeping':'');img.src=renderer.bunnyPortrait(b.id,b.mood);img.style.left=(20+i*24)+'%';stage.append(img);
  });
 }
 return {adoptBunnies(ids){for(const b of BUNNIES)if(ids.includes(b.id)&&!state.bunnies.some(saved=>saved.id===b.id))state.bunnies.push({id:b.id,mood:'happy'});save();},open(type){mode=type;bunnyPlay=true;tool=0;selected=-1;undo=[];openPanel(type==='room'?(state.bunnies.length?'Bunny home':'Your little castle room'):'Make a little candy world');render();},getLand:()=>sanitizeLand(state.land),snapshot:()=>structuredClone(state)};
}
