import {readProgress,recordProgress} from './progress.mjs';
import {LEVELS} from './levels.mjs';
import {CREATIVE_KEY,importLegacyCreative} from './creative.mjs';
export const RELEASE_SAVE='emmabug-candy-revamp-v1';
export function migrateProgress(legacy,preview){let progress=readProgress(preview);
 if(!legacy||typeof legacy!=='object')return progress;
 const petMap=['kitty','puppy','bunny','pengy','shelly','flutter','sparkle','draggy'];
 const outfitMap=['rainbow','rose','mermaid','sunset','midnight','royal'];
 if(!preview){progress.pet=petMap[legacy.activePet]||'kitty';progress.outfit=outfitMap[legacy.activeOutfit]||'rose';}
 LEVELS.forEach((level,i)=>{const flags=legacy.starsGot?.[i];const stars=Array.isArray(flags)?flags.slice(0,3).filter(Boolean).length:0;
  if(stars||Number(legacy.maxLevel)>i)progress=recordProgress(progress,level.id,0,stars,Number(legacy.maxLevel)>i,progress.pet,progress.outfit);
 });
 progress.lastLevel=readProgress(preview).lastLevel;progress.candies=Math.max(progress.candies,Number.isFinite(legacy.choc)?legacy.choc:0);
 return progress;
}
export function initializeReleaseStorage(storage){
 if(storage.getItem(RELEASE_SAVE)!==null)return;
 const raw=storage.getItem('emmabug-candy-progress');let legacy=null;try{legacy=JSON.parse(raw);}catch{}
 // Keep the original key intact and also retain an exact snapshot before conversion.
 if(raw!==null&&storage.getItem('emmabug-candy-legacy-backup')===null)storage.setItem('emmabug-candy-legacy-backup',raw);
 const progress=migrateProgress(legacy,storage.getItem('emmabug-candy-preview-v1'));
 if(storage.getItem(CREATIVE_KEY)===null&&legacy)storage.setItem(CREATIVE_KEY,JSON.stringify(importLegacyCreative(legacy)));
 storage.setItem(RELEASE_SAVE,JSON.stringify(progress));
}
