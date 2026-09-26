import {BUNNIES,rescueAction,interactRescue,updateRescue} from './rescue.mjs';
import {createWorld,createPlayer,createStepper,tick,SAVE_KEY} from './physics.mjs';
import {PETS,OUTFITS,createAdventure,powersFor,updateAdventure} from './adventure.mjs';
import {LEVELS} from './levels.mjs';
import {puzzleFor} from './puzzles.mjs';
import {readProgress,recordProgress} from './progress.mjs';
import {CREATIVE_KEY,compileLand} from './creative.mjs';
import {createWorkshop} from './workshop.mjs';
import {createFamily,NAMES,landId} from './family.mjs';
import {createFamilyUI} from './family-ui.mjs';
import {RELEASE_SAVE,initializeReleaseStorage} from './migration.mjs';
import {createRenderer} from './art.mjs';
const $=id=>document.getElementById(id);
const isPreview=location.pathname.includes('/preview/'),activeSave=isPreview?SAVE_KEY:RELEASE_SAVE;
try{if(!isPreview)initializeReleaseStorage(localStorage);}catch{}
let activeLand=[],familyUI=null,extraPanel='',remoteDraw=new Map();
const renderer=createRenderer($('game'));
const outfitPortraits=Object.fromEntries(OUTFITS.map(outfit=>[outfit.id,renderer.outfitPortrait(outfit.id)]));
let closetTab='friends',gateSolved=false;
const petPortraits=Object.fromEntries(PETS.map(pet=>[pet.id,renderer.petPortrait(pet.id)]));
let world=createWorld(),p=createPlayer(),cam=0,collected=new Set(),stars=new Set(),particles=[];
let paused=false,muted=true,audio=null,wonDelay=0,messageTime=5,best=readProgress(null);
try {best=readProgress(localStorage.getItem(activeSave));}catch{}
world=createWorld(best.lastLevel);
let adventure=createAdventure(best.pet,best.outfit,world.level.id);collected=adventure.collected;
const input={left:false,right:false,jump:false,jumpPressed:false};
const storyPictures=Object.fromEntries(['peek','carrot','song','heart','home','play','sleep'].map(id=>[id,renderer.storyPortrait(id)]));
const bunnyPictures=Object.fromEntries(BUNNIES.map(b=>[b.id,renderer.bunnyPortrait(b.id)]));
let rescueDisplay='';
const rescueGoal=document.createElement('button');rescueGoal.id='rescue-goal';rescueGoal.hidden=true;
const rescueButton=document.createElement('button');rescueButton.id='rescue-action';rescueButton.hidden=true;
document.body.append(rescueGoal,rescueButton);
const rescuePanel=document.createElement('div');rescuePanel.id='rescue-panel';rescuePanel.hidden=true;
$('resume').before(rescuePanel);
function updateRescueUI(){
  const r=adventure.rescue,action=rescueAction(r,p);
  rescueGoal.hidden=!r||paused;rescueButton.hidden=!action||paused;
  const key=r?r.bunnies.map(b=>b.stage).join(',')+r.home:'';
  if(r&&key!==rescueDisplay){
    rescueDisplay=key;
    rescueGoal.innerHTML=r.bunnies.map(b=>`<span class="bunny-check ${b.stage==='following'?'found':''}"><img src="${bunnyPictures[b.id]}" alt="${b.name}${b.stage==='following'?', found':', hiding'}"><b aria-hidden="true">${b.stage==='following'?'♥':'?'}</b></span>`).join('')+`<span class="bunny-goal-home">→<img src="${storyPictures.home}" alt="Home"></span>`;
    rescueGoal.setAttribute('aria-label',r.home?'Visit your bunny family':`Bunny picture clues. ${r.bunnies.filter(b=>b.stage==='following').length} of 3 found.`);
  }
  if(action&&rescueButton.dataset.action!==action.label){rescueButton.dataset.action=action.label;rescueButton.innerHTML=`<img src="${storyPictures[action.icon]}" alt=""><span>${action.label}</span>`;}

}
function showRescueJournal(){
  const r=adventure.rescue;if(!r)return;
  showModal();rescuePanel.hidden=false;
  $('modal-eyebrow').textContent='BUNNY FRIENDS';
  $('modal-title').textContent=r.home?'Home together!':'Find the bunnies';
  $('modal-copy').textContent=r.home?'Let’s play!':'Look for ears!';
  rescuePanel.innerHTML=`<div class="rescue-friends">${r.bunnies.map((b,i)=>`<div><img src="${storyPictures[['peek','carrot','song'][i]]}" alt="${['Look in the bush','Offer a carrot','Sing a song'][i]}"><small>${['Peek','Feed','Sing'][i]}</small><span aria-hidden="true">↓</span><img src="${bunnyPictures[b.id]}" alt="${b.name}" class="${b.stage==='following'?'':'undiscovered'}"><b>${b.name}</b></div>`).join('')}</div>${r.home?`<button id="visit-bunnies" class="primary picture-room"><img src="${storyPictures.home}" alt="">My bunny room →</button>`:''}`;
  if(r.home)$('visit-bunnies').onclick=()=>workshop.open('room');
  $('resume').textContent='Let’s go! →';
}
function meetBunny(){
  if(paused)return;const event=interactRescue(adventure.rescue,p);if(!event)return;
  unlock();toast(event.text,5);burst(p.x,p.y-60,18);sound(event.type==='reveal'?660:950,.22);
  if(event.type==='reveal'&&event.id==='moon')[660,830,740,990].forEach((f,i)=>sound(f,.25,i*.2));
  if(event.type==='home'){
    workshop.adoptBunnies(BUNNIES.map(b=>b.id));adventure.celebration=12;
    [660,830,990,1320].forEach((f,i)=>sound(f,.3,i*.15));burst(p.x,p.y-110,50);
    // Give the parade a moment before inviting Emma into pretend play.
    toast('Home together! ♥',5);
  }
  if(event.type==='hint'&&rescueAction(adventure.rescue,p)?.id==='home')showRescueJournal();
  updateRescueUI();
}
rescueGoal.onclick=showRescueJournal;rescueButton.onclick=meetBunny;
const keys=new Set(),pointers=new Map();
const mapping={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'jump',w:'jump',W:'jump',' ':'jump'};
function syncInput() {
  const previous=input.jump;
  for(const action of ['left','right','jump'])input[action]=[...keys].some(k=>mapping[k]===action)||[...pointers.values()].includes(action);
  if(input.jump&&!previous)input.jumpPressed=true;
  document.querySelectorAll('[data-control]').forEach(el=>el.classList.toggle('held',input[el.dataset.control]));
}
function clearInput(){keys.clear();pointers.clear();syncInput();input.jumpPressed=false;}
function unlock(){if(!audio && !muted)try{audio=new (window.AudioContext||window.webkitAudioContext)();}catch{}if(audio?.state==='suspended')audio.resume().catch(()=>{});}
function sound(f=700,d=.12,delay=0) {
  if(muted||!audio)return;
  const now=audio.currentTime+delay,o=audio.createOscillator(),g=audio.createGain();
  o.type='sine';o.frequency.setValueAtTime(f,now);o.frequency.exponentialRampToValueAtTime(f*.7,now+d);
  g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(.08,now+.01);g.gain.exponentialRampToValueAtTime(.0001,now+d);
  o.connect(g);g.connect(audio.destination);o.start(now);o.stop(now+d+.02);
}
function toast(text,seconds=3){$('message').textContent=text;$('message').style.opacity=1;messageTime=seconds;}
function burst(x,y,n=12,colors=['#e6a2b2','#f2d283','#fdf4d8','#adc7a1']) {
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=40+Math.random()*150,max=.5+Math.random()*.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-90,life:max,max,size:3+Math.random()*4,color:colors[i%colors.length],star:i%3===0});}
}
function updateHUD(){
  $('candies').textContent=adventure.score;
  const pet=PETS.find(p=>p.id===adventure.pet);
  $('pet-icon').innerHTML=`<img src="${petPortraits[pet.id]}" alt="">`;$('pet-name').textContent=pet.name;$('pet-power').textContent=pet.power;
  $('stars').innerHTML=world.stars.map((_,i)=>i).map(i=>`<span class="${stars.has(i)?'found':''}">${stars.has(i)?'★':'☆'}</span>`).join('');
  $('stars').setAttribute('aria-label',`${stars.size} of ${world.stars.length} stars`);
}
function saveBest(){
  best=world.level.id==='custom'?{...best,pet:adventure.pet,outfit:adventure.outfit}:recordProgress(best,world.level.id,adventure.score,stars.size,gateSolved,adventure.pet,adventure.outfit);
  try{localStorage.setItem(activeSave,JSON.stringify(best));}catch{}
}
function updateChapter(){
  $('level-title').textContent=world.level.name;$('level-subtitle').textContent=adventure.rescue?'Three little bunnies. One happy home.':world.level.subtitle;
  document.title=`${world.level.name} · Emmabug's World`;
  $('game').setAttribute('aria-label',`${world.level.name}. Use arrows or A and D to move and Space or Up to jump.`);
}
function showModal(win=false){
  rescuePanel.hidden=true;
  extraPanel='';$('creative-panel').hidden=true;$('family-panel').hidden=true;
  paused=true;clearInput();$('modal').hidden=false;$('math-panel').hidden=true;$('resume').hidden=false;$('pet-panel').hidden=true;$('map-panel').hidden=true;$('modal').classList.remove('pet-modal','map-modal','workshop-modal','family-modal');
  $('next-level').hidden=!win;
  $('next-level').textContent=world.level.id==='peaks'?'Choose another adventure →':'Next adventure →';
  $('modal-eyebrow').textContent=win?'MADE OF A LITTLE MAGIC':'TAKE YOUR TIME';
  $('modal-title').textContent=win?'You did it, Emma!':'A little breather';
  $('modal-copy').textContent=win?`${adventure.score} sweets, ${stars.size} shining stars, ${adventure.gemsGot.size} gems, and one wonderful adventure. Your best here: ${best.levels[world.level.id]?.candies||0} sweets and ${best.levels[world.level.id]?.stars||0} stars.`:'Your adventure will be right here.';
  $('resume').textContent=win?'Another little adventure ↻':'Keep exploring →';
  $('pause').setAttribute('aria-label','Resume game');$('resume').focus();
}
function resume(){extraPanel='';paused=false;$('modal').hidden=true;clearInput();stepper.reset();last=performance.now();$('pause').setAttribute('aria-label','Pause game');$('game').focus({preventScroll:true});}
function startLevel(id){
  saveBest();const {pet,outfit}=adventure;world=createWorld(id);p=createPlayer();
  adventure=createAdventure(pet,outfit,world.level.id);collected=adventure.collected;cam=0;
  stars.clear();particles=[];wonDelay=0;gateSolved=false;updateHUD();updateChapter();resume();saveBest();
  toast(adventure.rescue?'Find the bunnies! ♥':'Jump through five shiny bubbles to make a rainbow wish!',6);
}
function restart(){if(world.level.id==='custom')playCustom(activeLand);else startLevel(world.level.id);}
function showMap(){
  saveBest();showModal();$('modal').classList.add('map-modal');$('map-panel').hidden=false;
  $('modal-eyebrow').textContent='FOUR PLACES TO FIND YOUR MAGIC';$('modal-title').textContent='Where shall we wander?';
  $('modal-copy').textContent='Your friends and favorite dress come too.';
  $('level-grid').innerHTML=LEVELS.map((level,i)=>{const record=best.levels[level.id]||{};return `<button data-level="${level.id}" class="level-card ${world.level.id===level.id?'selected':''}" style="--map-sky:${level.theme.sky[1]};--map-hill:${level.theme.near[0]};--map-accent:${level.accent}" aria-label="Play ${level.name}"><span class="map-art"><i>${level.symbol}</i></span><small>ADVENTURE 0${i+1} ${record.finished?'· COMPLETE':''}</small><b>${level.name}</b><span class="map-stars">${'★'.repeat(record.stars||0)}${'☆'.repeat(3-(record.stars||0))}</span></button>`;}).join('');
  $('level-grid').querySelectorAll('[data-level]').forEach(button=>button.addEventListener('click',()=>startLevel(button.dataset.level)));
  $('level-grid').querySelector(`[data-level="${world.level.id}"]`).focus();
}
$('map-button').addEventListener('click',showMap);
$('next-level').addEventListener('click',()=>{const i=LEVELS.findIndex(l=>l.id===world.level.id);if(i<LEVELS.length-1)startLevel(LEVELS[i+1].id);else showMap();});
function openCastle(){
  gateSolved=true;resume();saveBest();wonDelay=1.8;
  toast('The whole kingdom is cheering for you!',5);
  [660,830,990,1320].forEach((f,i)=>sound(f,.3,i*.12));burst(p.x,p.y-110,70);
}
function showCountingDoor(){
  showModal();$('math-panel').hidden=false;$('resume').hidden=true;
  $('modal-eyebrow').textContent='A LITTLE COUNTING MAGIC';$('modal-title').textContent='The wishing door';
  $('modal-copy').textContent='How many sweets? Tap a number to open the castle.';
  const puzzle=puzzleFor(world.level.id);
  $('math-equation').textContent=`${puzzle.a} ${puzzle.op} ${puzzle.b} = ?`;
  const dots=n=>'<i>◆</i>'.repeat(n);
  $('counting-sweets').innerHTML=puzzle.op==='+'?`<span>${dots(puzzle.a)}</span><b>+</b><span>${dots(puzzle.b)}</span>`:`<span>${dots(puzzle.answer)}<s>${dots(puzzle.b)}</s></span>`;
  $('puzzle-hint').textContent='Take your time. You can count the sweets!';
  $('math-answers').innerHTML=puzzle.choices.map(n=>`<button data-answer="${n}" aria-label="${n} sweets">${n}</button>`).join('');
  $('math-answers').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
    if(Number(button.dataset.answer)===puzzle.answer)openCastle();
    else {$('puzzle-hint').textContent='Nearly! Count the sweets and try again. You’ve got this.';sound(420,.1);}
  }));
  $('math-answers').querySelector('button').focus();
}
$('magic-door').addEventListener('click',openCastle);
function renderPets(){
  $('pet-grid').innerHTML=PETS.map(pet=>`<button data-pet="${pet.id}" class="pet-card ${adventure.pet===pet.id?'selected':''}" aria-pressed="${adventure.pet===pet.id}"><span><img src="${petPortraits[pet.id]}" alt=""></span><b>${pet.name}</b><strong>${pet.power}</strong><small>${pet.hint}</small></button>`).join('');
  $('treasure-bag').innerHTML=`<span>◆ <b>${collected.size}/${adventure.treats.length}</b> treats found</span><span>○ <b>${adventure.bubblesGot.size}/${adventure.bubbles.length}</b> wish bubbles · ${adventure.wishes.size} trails completed</span><span>♦ <b>${adventure.gemsGot.size}/${adventure.gems.length}</b> gems</span><span>▣ <b>${adventure.opened.size}/${adventure.chests.length}</b> treasure chests</span><span>♥ <b>${adventure.friends.filter(f=>f.helped).length}/${adventure.friends.length}</b> bears helped</span><span>${adventure.helper?'★ Meadow helper!':`✿ Find ${Math.max(0,12-collected.size)} more treats for a helper badge`}</span>`;
  $('pet-grid').querySelectorAll('[data-pet]').forEach(button=>button.addEventListener('click',()=>{
    adventure.pet=button.dataset.pet;p.powers=powersFor(adventure);
    // Switching friends in the air cannot refill spent jumps.
    if(p.onGround)p.jumps=p.powers.triple?3:2;else p.jumps=Math.min(p.jumps,p.powers.triple?2:1);
    saveBest();updateHUD();renderPets();sound(900);$('pet-grid').querySelector(`[data-pet="${adventure.pet}"]`).focus();
  }));
}
function renderOutfits(){
  $('outfit-grid').innerHTML=OUTFITS.map(outfit=>`<button data-outfit="${outfit.id}" class="outfit-card ${adventure.outfit===outfit.id?'selected':''}" aria-pressed="${adventure.outfit===outfit.id}"><img src="${outfitPortraits[outfit.id]}" alt=""><b>${outfit.name}</b><small>${outfit.hint}</small></button>`).join('');
  $('outfit-grid').querySelectorAll('[data-outfit]').forEach(button=>button.addEventListener('click',()=>{
    adventure.outfit=button.dataset.outfit;saveBest();renderOutfits();sound(1000);
    $('outfit-grid').querySelector(`[data-outfit="${adventure.outfit}"]`).focus();
  }));
}
function showClosetTab(tab){
  closetTab=tab;const dressup=tab==='outfits';
  $('pet-grid').hidden=dressup;$('outfit-grid').hidden=!dressup;
  $('friends-tab').setAttribute('aria-pressed',String(!dressup));$('outfits-tab').setAttribute('aria-pressed',String(dressup));
  $('modal-eyebrow').textContent=dressup?'A LITTLE EVERYDAY ENCHANTMENT':'A FRIEND MAKES IT SWEETER';
  $('modal-title').textContent=dressup?'A dress for every daydream':'Your little adventuring team';
  $('modal-copy').textContent=dressup?'Pick your favorite. It is ready to wear.':'Pick a friend. Bring their magic along.';
  document.querySelector('.pet-note').textContent=dressup?'Every outfit is yours. Dress up any time!':'Every friend is ready to play. Pick one!';
  renderPets();renderOutfits();
}
$('friends-tab').addEventListener('click',()=>showClosetTab('friends'));
$('outfits-tab').addEventListener('click',()=>showClosetTab('outfits'));
$('pet-button').addEventListener('click',()=>{
  if(p.won)return;showModal();$('modal').classList.add('pet-modal');$('pet-panel').hidden=false;
  showClosetTab(closetTab);$(closetTab==='friends'?'friends-tab':'outfits-tab').focus();
});
$('resume').addEventListener('click',()=>{unlock();if(p.won)restart();else resume();});
$('restart').addEventListener('click',restart);
$('pause').addEventListener('click',()=>{if(paused)resume();else showModal();});
$('sound').addEventListener('click',()=>{muted=!muted;unlock();$('sound').textContent=muted?'♫':'♪';$('sound').setAttribute('aria-label',muted?'Turn sound on':'Turn sound off');$('sound').setAttribute('aria-pressed',String(!muted));if(!muted)sound(800);});
addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();if(p.won)return;if(paused)resume();else showModal();return;}
  if(paused) {
    if(e.key==='Tab') {const focusable=[...$('modal').querySelectorAll('button,a')].filter(el=>el.getClientRects().length);const first=focusable[0],last=focusable.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    return;
  }
  if(e.key.toLowerCase()==='e'&&!e.repeat&&!e.target.closest('button,a,input,select')){e.preventDefault();meetBunny();return;}
  if(!mapping[e.key]||e.target.closest('button,a,input,select'))return;
  e.preventDefault();keys.add(e.key);syncInput();unlock();
});
addEventListener('keyup',e=>{keys.delete(e.key);syncInput();});
// Keep keyboard play available after clicking UI controls.
addEventListener('pointerup',e=>{if(e.target.closest('button') && $('modal').hidden)e.target.blur();});
document.querySelectorAll('[data-control]').forEach(el=>{
  el.addEventListener('pointerdown',e=>{if(paused)return;e.preventDefault();el.setPointerCapture(e.pointerId);pointers.set(e.pointerId,el.dataset.control);syncInput();unlock();});
  const release=e=>{pointers.delete(e.pointerId);syncInput();};
  el.addEventListener('pointerup',release);el.addEventListener('pointercancel',release);el.addEventListener('lostpointercapture',release);
  el.addEventListener('contextmenu',e=>e.preventDefault());
});
addEventListener('blur',()=>{clearInput();if(!paused&&!p.won)showModal();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();saveBest();if(!paused&&!p.won)showModal();}stepper.reset();last=performance.now();});
function update(dt){
  p.powers=powersFor(adventure);
  const previousScore=adventure.score;
  const events=tick(world,p,input,dt);
  updateRescue(adventure.rescue,p,dt,world.platforms);
  const petTargetX=p.x-p.face*48,petTargetY=p.y-(adventure.pet==='flutter'||adventure.pet==='draggy'?65:12);
  adventure.petX+=(petTargetX-adventure.petX)*(1-Math.exp(-7*dt));adventure.petY+=(petTargetY-adventure.petY)*(1-Math.exp(-7*dt));
  const found=updateAdventure(adventure,p,dt);
  for(const item of found){
    burst(item.x,item.y,item.type==='treat'?8:26);
    if(item.type==='treat')sound(750+(adventure.score%5)*80);
    if(item.type==='bubble'){sound(660+item.count*110,.16);toast(`Pop! ${item.count}/5 bubbles in this wish trail.`,2);}
    if(item.type==='wish'){[660,830,990,1320].forEach((f,i)=>sound(f,.25,i*.12));burst(item.x,item.y,45);toast('A wish came true! +10 sweets and a rainbow party!',5);}
    if(item.type==='gem'){sound(1300,.2);toast('A tiny jewel for your treasure bag!');}
    if(item.type==='potion'){sound(1000,.3);toast('Rainbow magic! Sweets come to you for 12 seconds.');}
    if(item.type==='chest'){sound(900,.3);sound(1200,.3,.15);toast('A little treasure! Five bonus sweets.');}
    if(item.type==='hello'){sound(600,.15);toast(`${item.name}: Find ${item.need} treats, then come say hello!`,4);}
    if(item.type==='friend'){sound(1000,.3);sound(1300,.3,.15);toast(`${item.name} says thank you! Five bonus sweets.`,4);}
    if(item.type==='helper'){sound(1400,.3);toast('Twelve treats! You earned your Meadow Helper badge.',4);}
  }
  if(found.length)updateHUD();
  $('magic-meter').hidden=adventure.rainbow<=0;$('magic-seconds').textContent=Math.ceil(adventure.rainbow);
  if((p.powers.glide&&input.jump&&p.vy>0)||adventure.rainbow>0){if(Math.random()<dt*22)burst(p.x,p.y-50,1);}

  for(const event of events){
    if(event==='bop'){adventure.score+=3;updateHUD();sound(780,.18);burst(p.x,p.y,18);toast('Boop! Three little sweets for you.');}
    if(event==='boing'){sound(780,.18);burst(p.x,p.y,8);}
    if(event==='jump'){sound(540);burst(p.x,p.y,5,['#fff1d6']);}
    if(event==='land')burst(p.x,p.y,5,['#e6d2a5','#fff4da']);
    if(event==='spring'){sound(850,.22);toast('Boing! A little extra magic.');burst(p.x,p.y,18);}
    if(event==='rescue'){cam=Math.max(0,p.x-renderer.view*.3);sound(500,.2);toast('Back on your feet. You’ve got this!');burst(p.x,p.y-40,20);}
    if(event==='win')showCountingDoor();
  }
  world.stars.forEach((s,i)=>{if(!stars.has(i)&&Math.hypot(p.x-s.x,p.y-55-s.y)<48){stars.add(i);sound(1100,.25);sound(1400,.25,.1);burst(s.x,s.y,26,['#e6b956','#fff1bd']);toast('A shining star, just for you!');updateHUD();}});
  for(const q of particles){q.life-=dt;q.vy+=230*dt;q.x+=q.vx*dt;q.y+=q.vy*dt;}particles=particles.filter(q=>q.life>0);
  family.addCandy(adventure.score-previousScore);
  const target=Math.max(0,Math.min(world.finish+260-renderer.view,p.x-renderer.view*.32));
  cam+=(target-cam)*(1-Math.exp(-5*dt));
  $('progress').style.width=`${Math.min(100,p.x/world.finish*100)}%`;
  const label=world.level.landmarks[Math.min(4,Math.floor(p.x/world.finish*5))];
  if($('landmark').textContent!==label)$('landmark').textContent=label;
  messageTime-=dt;if(messageTime<=0)$('message').style.opacity=0;
  if(wonDelay>0){wonDelay-=dt;if(wonDelay<=0)showModal(true);}
}
function networkLevel(){return world.level.id==='custom'?landId(activeLand):world.level.id;}
function playCustom(items){saveBest();const compiled=compileLand(items,adventure.pet,adventure.outfit);world=compiled.world;adventure=compiled.adventure;activeLand=compiled.land;p=createPlayer();collected=adventure.collected;
 stars.clear();particles=[];cam=0;wonDelay=0;gateSolved=false;updateHUD();updateChapter();resume();toast('Your very own candy world!',4);
}
function showExtra(id,title,kind){showModal();extraPanel=id;$(id).hidden=false;$('modal').classList.add(kind);$('modal-title').textContent=title;$('modal-eyebrow').textContent='A PLACE FOR YOUR IMAGINATION';$('modal-copy').textContent='';}
const peerOptions=(['localhost','127.0.0.1'].includes(location.hostname)?globalThis.CANDY_PEER_OPTIONS:null)||{};
const family=createFamily({snapshot:()=>({x:p.x,y:p.y,face:p.face,onGround:p.onGround,level:networkLevel(),pet:adventure.pet,outfit:adventure.outfit}),getLand:()=>activeLand,peerOptions,
 onChange:status=>{familyUI?.update(status);$('family-pill').hidden=status.phase!=='online';$('family-open').textContent=`${status.code} · ${status.count}/5 · ${status.total} sweets`;},
 onVisit:(level,land)=>{if(level.startsWith('custom-')&&land)playCustom(land);else if(LEVELS.some(l=>l.id===level))startLevel(level);},
 onLand:()=>toast('A family candy land is ready! Open Family play to visit.',4)
});
const workshop=createWorkshop({root:$('creative-panel'),renderer,notify:toast,preferences:()=>adventure,
 openPanel:title=>showExtra('creative-panel',title,'workshop-modal'),play:playCustom,
 share:items=>{if(family.share(items))toast('Your candy land is shared with your family.');else{familyUI.open();toast('Make or join a family room first, then share your land.');}}
});
familyUI=createFamilyUI({root:$('family-panel'),family,notify:toast,openPanel:title=>showExtra('family-panel',title,'family-modal'),playShared:playCustom,
 follow:()=>{const host=family.players().find(f=>f.slot===0);if(!host)return;
  if(host.level.startsWith('custom-')){const shared=family.status().shared;if(shared&&landId(shared.items)===host.level)playCustom(shared.items);else toast('Ask the host to share their homemade land.');}
  else if(LEVELS.some(l=>l.id===host.level))startLevel(host.level);
 }
});
try{const chosen=Number(localStorage.getItem('emmabug-revamp-family-name'));if(Number.isInteger(chosen))family.setName(chosen);}catch{}
$('room-button').onclick=()=>workshop.open('room');$('builder-button').onclick=()=>workshop.open('build');$('family-button').onclick=()=>familyUI.open();$('family-open').onclick=()=>familyUI.open();
document.querySelectorAll('[data-quick-reaction]').forEach(button=>button.onclick=()=>family.react(+button.dataset.quickReaction));
$('photo-button').onclick=()=>{const canvas=$('game');canvas.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='emmabug-candy-world.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Your candy-world picture is ready.');});};
addEventListener('pagehide',()=>{saveBest();family.leave();});
const stepper=createStepper(update);let last=performance.now();
function frame(now){const dt=(now-last)/1000;last=now;if(!paused)stepper.advance(dt);
 const peers=family.players(),live=new Set(peers.map(f=>f.slot));for(const slot of remoteDraw.keys())if(!live.has(slot))remoteDraw.delete(slot);
 const friends=peers.map(f=>{let draw=remoteDraw.get(f.slot);if(!draw||draw.level!==f.level)draw={x:f.x,y:f.y,level:f.level};const moving=Math.abs(f.x-draw.x)>1,k=1-Math.exp(-12*Math.min(dt,.1));draw.x+=(f.x-draw.x)*k;draw.y+=(f.y-draw.y)*k;remoteDraw.set(f.slot,draw);return {...f,...draw,moving,label:NAMES[f.name]};});
 updateRescueUI();
 renderer.draw({world,p,cam,collected,stars,particles,adventure,friends,networkLevel:networkLevel()});requestAnimationFrame(frame);
}
updateHUD();updateChapter();toast(adventure.rescue?'Find the bunnies! ♥':'Jump through five shiny bubbles to make a rainbow wish!',6);requestAnimationFrame(frame);
// Explicit, read-only diagnostics for local browser checks.
window.candyPreview={snapshot:()=>({level:world.level.id,x:p.x,y:p.y,onGround:p.onGround,won:p.won,gateSolved,paused,extraPanel,creative:workshop.snapshot(),family:family.status(),candies:adventure.score,treats:collected.size,stars:stars.size,time:world.time,pet:adventure.pet,outfit:adventure.outfit,bears:adventure.friends.filter(f=>f.helped).length,bops:world.grumps.filter(g=>g.earned).length,powers:p.powers,gems:adventure.gemsGot.size,chests:adventure.opened.size,rainbow:adventure.rainbow,bubbles:adventure.bubblesGot.size,wishes:adventure.wishes.size,celebration:adventure.celebration,rescue:adventure.rescue?{bunnies:adventure.rescue.bunnies.map(b=>({id:b.id,stage:b.stage})),carrot:adventure.rescue.carrot,home:adventure.rescue.home,action:rescueAction(adventure.rescue,p)?.id}:null})};

if(new URL(location.href).searchParams.has('room'))familyUI.open();
