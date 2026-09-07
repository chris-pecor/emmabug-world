import {createWorld} from './physics.mjs';
import {createAdventure} from './adventure.mjs';
export const CREATIVE_KEY='emmabug-candy-creative-v1';
export const FURNITURE=['Bed','Sofa','Chair','Teddy','Pony','Mirror','Painting','Plant','Piano','Books','Star Light','Rainbow','Bubbles','Crown Stand'];
export const STICKERS=['Platform','Gumdrop','Candy','Lollipop','Gummy bear','Grump','Star'];
export const LIMITS=[20,6,40,8,5,6,3];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number.isFinite(+n)?+n:a));
export function sanitizeLand(items){const counts=Array(7).fill(0);return (Array.isArray(items)?items:[]).slice(0,100).flatMap(item=>{
 if(!item||!Number.isInteger(item.t)||item.t<0||item.t>6||counts[item.t]++>=LIMITS[item.t])return [];
 return [{t:item.t,x:clamp(item.x,60,4090),d:[1,4,5].includes(item.t)?0:clamp(item.d,35,430)}];
});}
export function defaultCreative(){return {wallpaper:0,room:[{t:0,x:26,y:76},{t:7,x:80,y:73},{t:3,x:56,y:80}],land:[],legacy:null};}
export function readCreative(raw){let value;try{value=JSON.parse(raw);}catch{}if(!value||typeof value!=='object')return defaultCreative();
 return {wallpaper:Math.floor(clamp(value.wallpaper,0,3)),room:(Array.isArray(value.room)?value.room:[]).slice(0,60).flatMap(i=>i&&Number.isInteger(i.t)&&i.t>=0&&i.t<FURNITURE.length?[{t:i.t,x:clamp(i.x,6,94),y:clamp(i.y,22,94)}]:[]),land:sanitizeLand(value.land),legacy:value.legacy&&typeof value.legacy==='object'?value.legacy:null};
}
export function importLegacyCreative(old){const state=defaultCreative();
 if(Array.isArray(old.roomItems))state.room=old.roomItems.slice(0,60).filter(i=>i&&Number.isInteger(i.t)&&i.t>=0&&i.t<14).map(i=>({t:i.t,x:clamp(i.x/1200*100,6,94),y:clamp(i.y/640*100,22,94)}));
 state.wallpaper=Math.floor(clamp(old.wallpaper,0,3));state.land=sanitizeLand(old.customLand?.items);
 // Preserve the entire old inventory/progress snapshot as well as the playable conversion.
 state.legacy=old;return state;
}
export function compileLand(items,pet='kitty',outfit='rose'){
 const land=sanitizeLand(items),world=createWorld(),adventure=createAdventure(pet,outfit);
 world.level={...world.level,id:'custom',name:'Emma’s Candy Land',subtitle:'A world made by you.',landmarks:Array(5).fill('Your very own candy castle')};
 world.finish=4200;world.platforms=[{x:-300,y:610,w:4900,ground:true}];world.gaps=[];world.grumps=[];world.springs=[];world.stars=[];
 Object.assign(adventure,{levelId:'custom',treats:[],gems:[],chests:[],potions:[],friends:[]});
 for(const it of land){const y=610-it.d;
  if(it.t===0)world.platforms.push({x:it.x-80,y,w:160});
  if(it.t===1)world.springs.push({x:it.x,y:610});
  if(it.t===2||it.t===3)adventure.treats.push({x:it.x,y,kind:it.t===2?'candy':'lolly'});
  if(it.t===4)adventure.friends.push({x:it.x,y:610,name:'Gummy',need:Math.min(6,land.filter(i=>i.t===2||i.t===3).length),color:'#d6a5bd',met:false,helped:false});
  if(it.t===5)world.grumps.push({x:it.x,home:it.x,y:610,dir:1,squashed:0,huff:0,earned:false});
  if(it.t===6)world.stars.push({x:it.x,y});
 }
 return {world,adventure,land};
}
