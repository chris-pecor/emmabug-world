import {sanitizeLand} from './creative.mjs';
import {PETS,OUTFITS} from './adventure.mjs';
export const NAMES=['Lolli','Choco','Berry','Minty','Sprinkle','Gummy','Taffy','Cookie'];
export const REACTIONS=['♥','✦','☀'];
export const ALPHABET='ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const validCode=code=>typeof code==='string'&&code.length===4&&[...code].every(c=>ALPHABET.includes(c));
export function landId(items){let n=2166136261;for(const c of JSON.stringify(sanitizeLand(items)))n=Math.imul(n^c.charCodeAt(0),16777619);return 'custom-'+(n>>>0).toString(16).padStart(8,'0');}
export function cleanState(s){if(!s||![s.x,s.y].every(Number.isFinite))return null;
 if(!['meadow','berry','river','peaks','room'].includes(s.level)&&!/^custom-[a-f0-9]{8}$/.test(s.level))return null;
 return {x:Math.max(0,Math.min(5200,s.x)),y:Math.max(-1500,Math.min(1100,s.y)),face:s.face===-1?-1:1,onGround:s.onGround===true,
  level:s.level,outfit:OUTFITS.some(o=>o.id===s.outfit)?s.outfit:'rose',pet:PETS.some(p=>p.id===s.pet)?s.pet:'kitty',name:Number.isInteger(s.name)&&NAMES[s.name]?s.name:0};
}
let loadPromise;
function loadPeer(){if(globalThis.Peer)return Promise.resolve(globalThis.Peer);if(!loadPromise)loadPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('./vendor/peerjs.min.js',import.meta.url);script.onload=()=>resolve(globalThis.Peer);script.onerror=()=>{loadPromise=null;script.remove();reject(Error('offline'));};document.head.append(script);});return loadPromise;}
export function createFamily({snapshot,onChange=()=>{},onVisit=()=>{},onLand=()=>{},getLand=()=>[],peerLoader=loadPeer,peerOptions={}}){
 let peer=null,connections=new Map(),roster={},reactions={},interval=null,timeout=null,generation=0,host=false,slot=0,phase='solo',code='',name=0,total=0,lastHost=0,shared=null,message='Play beside your family. Pick a candy name.';
 const status=()=>({phase,code,host,slot,name,total,message,count:phase==='online'?Object.keys(roster).length:0,shared});
 const changed=()=>onChange(status());
 const send=(conn,data)=>{if(conn?.open)try{conn.send(data);}catch{}};
 const broadcast=data=>connections.forEach(conn=>send(conn,data));
 function leave(note='You can keep exploring on your own.'){generation++;clearInterval(interval);clearTimeout(timeout);interval=timeout=null;const old=peer;peer=null;connections.clear();roster={};reactions={};shared=null;phase='solo';code='';total=0;try{old?.destroy();}catch{}message=note;changed();}
 function own(){return cleanState({...snapshot(),name});}
 function reaction(who,index){if(!Number.isInteger(index)||!REACTIONS[index])return;reactions[who]={text:REACTIONS[index],until:Date.now()+2400};}
 function receiveLand(data){const items=sanitizeLand(data.items);shared={items,name:NAMES[Number.isInteger(data.name)?data.name:0]||NAMES[0]};onLand(shared);changed();}
 function start(){clearTimeout(timeout);phase='online';lastHost=Date.now();message='Your family room is open.';
  interval=setInterval(()=>{
   if(host){roster[0]=own();for(const [id,conn] of connections){if(Date.now()-conn.seen>18000){conn.close();connections.delete(id);delete roster[conn.slot];}}
    broadcast({t:'roster',roster,total});
   }else{send(connections.values().next().value,{t:'state',state:own()});if(Date.now()-lastHost>18000){leave('The candy connection went quiet. You can keep playing.');return;}}
   changed();
  },100);changed();
 }
 async function connect(isHost,joinCode){leave('Opening the candy connection…');const run=generation;host=isHost;phase='connecting';
  code=isHost?Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>ALPHABET[n%ALPHABET.length]).join(''):String(joinCode||'').trim().toUpperCase();
  if(!validCode(code)){leave('Use the four characters from your family’s room code.');return;}
  message=isHost?'Making a family room…':'Looking for your family…';changed();
  timeout=setTimeout(()=>{if(run===generation)leave('We could not connect. Check the code and internet, then try again.');},18000);
  let Peer;try{Peer=await peerLoader();}catch{if(run===generation)leave('Family play needs an internet connection. Solo play is ready.');return;}if(run!==generation)return;
  try{peer=host?new Peer('emmabug-revamp-'+code,peerOptions):new Peer(undefined,peerOptions);}catch{leave('The candy connection could not start. Solo play is ready.');return;}
  peer.on('error',()=>{if(run===generation)leave('The room could not connect. Check the code or make a new room.');});
  peer.on('disconnected',()=>{if(run===generation)leave('The connection ended. You can keep playing on your own.');});
  peer.on('open',()=>{if(run!==generation)return;
   if(host){slot=0;roster[0]=own();start();return;}
   const conn=peer.connect('emmabug-revamp-'+code,{serialization:'json',reliable:true});connections.set('host',conn);
   conn.on('data',d=>{if(run!==generation||!d||typeof d!=='object')return;
    if(d.t==='full'){leave('That room already has five friends. Try another family room.');return;}
    if(d.t==='welcome'&&Number.isInteger(d.slot)&&d.slot>=1&&d.slot<=4&&phase==='connecting'){
     slot=d.slot;const state=cleanState(d.state);if(state)onVisit(state.level,d.land?sanitizeLand(d.land):null);start();send(conn,{t:'state',state:own()});
    }
    if(d.t==='roster'&&phase==='online'){
     lastHost=Date.now();const next={};for(let i=0;i<5;i++){const state=cleanState(d.roster?.[i]);if(state)next[i]=state;}roster=next;total=Number.isFinite(d.total)?Math.max(0,Math.min(1e7,d.total)):total;changed();
    }
    if(d.t==='reaction'&&Number.isInteger(d.slot)&&d.slot>=0&&d.slot<5)reaction(d.slot,d.index);
    if(d.t==='land')receiveLand(d);
   });
   conn.on('close',()=>{if(run===generation)leave('Your family room closed. Keep exploring!');});conn.on('error',()=>{if(run===generation)leave('The candy connection dropped. Keep exploring!');});
  });
  peer.on('connection',conn=>{if(!host||run!==generation){conn.close();return;}
   if(connections.size>=4){conn.on('open',()=>{send(conn,{t:'full'});setTimeout(()=>conn.close(),300);});return;}
   let guestSlot=1;while([...connections.values()].some(c=>c.slot===guestSlot))guestSlot++;
   conn.slot=guestSlot;conn.seen=Date.now();connections.set(conn.peer,conn); // Reserve before open, including simultaneous joins.
   const drop=()=>{if(run!==generation)return;connections.delete(conn.peer);delete roster[guestSlot];changed();};
   conn.on('open',()=>{if(run!==generation)return;send(conn,{t:'welcome',slot:guestSlot,state:own(),land:snapshot().level.startsWith('custom-')?getLand():null});});
   conn.on('data',d=>{if(run!==generation||!d||typeof d!=='object')return;conn.seen=Date.now();
    if(d.t==='state'){const state=cleanState(d.state);if(state)roster[guestSlot]=state;}
    if(d.t==='candy'&&Number.isInteger(d.n)&&d.n>0&&d.n<=100)total+=d.n;
    if(d.t==='reaction'&&Number.isInteger(d.index)&&REACTIONS[d.index]){reaction(guestSlot,d.index);broadcast({t:'reaction',slot:guestSlot,index:d.index});}
    if(d.t==='land'){const safe={t:'land',items:sanitizeLand(d.items),name:roster[guestSlot]?.name||0};receiveLand(safe);broadcast(safe);}
   });conn.on('close',drop);conn.on('error',drop);
  });
 }
 return {host:()=>connect(true),join:c=>connect(false,c),leave,status,setName:n=>{if(Number.isInteger(n)&&NAMES[n]){name=n;changed();}},
  players:()=>Object.entries(roster).filter(([i])=>+i!==slot).map(([i,s])=>({...s,slot:+i,reaction:reactions[i]?.until>Date.now()?reactions[i].text:''})),
  addCandy(n){n=Math.floor(n);if(phase!=='online'||n<=0)return;if(host)total+=n;else send(connections.values().next().value,{t:'candy',n:Math.min(100,n)});},
  react(index){if(phase!=='online'||!REACTIONS[index])return;reaction(slot,index);if(host)broadcast({t:'reaction',slot,index});else send(connections.values().next().value,{t:'reaction',index});},
  share(items){if(phase!=='online')return false;const data={t:'land',items:sanitizeLand(items),name};if(host){receiveLand(data);broadcast(data);}else send(connections.values().next().value,data);return true;}
 };
}
