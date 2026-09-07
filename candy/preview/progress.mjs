import {LEVELS,levelById} from './levels.mjs';
import {PETS,OUTFITS} from './adventure.mjs';
const count=(value,max=10000)=>Number.isFinite(value)?Math.max(0,Math.min(max,Math.floor(value))):0;
export function readProgress(raw) {
  let saved={};try{saved=JSON.parse(raw)||{};}catch{}
  const progress={candies:count(saved.candies),stars:count(saved.stars,3),
    pet:PETS.some(p=>p.id===saved.pet)?saved.pet:'kitty',
    outfit:OUTFITS.some(o=>o.id===saved.outfit)?saved.outfit:'rose',
    lastLevel:levelById(saved.lastLevel).id,levels:{}};
  for(const level of LEVELS){const entry=saved.levels?.[level.id];
    if(entry && typeof entry==='object')progress.levels[level.id]={candies:count(entry.candies),stars:count(entry.stars,3),finished:entry.finished===true};
  }
  if(!progress.levels.meadow&&(progress.candies||progress.stars))
    progress.levels.meadow={candies:progress.candies,stars:progress.stars,finished:false};
  return progress;
}
export function recordProgress(progress,levelId,score,stars,finished,pet,outfit) {
  const id=levelById(levelId).id,previous=progress.levels[id]||{candies:0,stars:0,finished:false};
  return {...progress,candies:Math.max(progress.candies,count(score)),stars:Math.max(progress.stars,count(stars,3)),pet,outfit,lastLevel:id,
    levels:{...progress.levels,[id]:{candies:Math.max(previous.candies,count(score)),stars:Math.max(previous.stars,count(stars,3)),finished:previous.finished||finished===true}}};
}
