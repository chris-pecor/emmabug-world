import {NAMES,REACTIONS} from './family.mjs';
export function createFamilyUI({root,family,openPanel,playShared,follow,notify}){
 root.innerHTML=`<p id="family-status" role="status"></p><div class="name-grid">${NAMES.map((n,i)=>`<button data-name="${i}" aria-pressed="false">${n}</button>`).join('')}</div><div id="family-connect"><button id="host-family" class="primary">Make a family room</button><label class="join-label">Family room code <input id="family-code" maxlength="4" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="ABCD"></label><button id="join-family" class="primary">Join family</button></div><div id="family-connected" hidden><p id="family-summary"></p><label class="invite-label">Invite link <input id="family-invite" readonly></label><button id="copy-invite">Copy invite</button><button id="follow-family">Go to the host’s adventure</button><button id="play-shared" hidden>Play the shared candy land</button><div class="reaction-buttons">${REACTIONS.map((r,i)=>`<button data-reaction="${i}" aria-label="Send ${['love','celebration','hello'][i]}">${r}</button>`).join('')}</div></div><button id="leave-family" hidden>Leave family room</button><p class="family-note">Up to five family members. Preset names and reactions only. Solo play always stays available.</p>`;
 root.querySelectorAll('[data-name]').forEach(b=>b.onclick=()=>{family.setName(+b.dataset.name);try{localStorage.setItem('emmabug-revamp-family-name',b.dataset.name);}catch{}});
 root.querySelector('#host-family').onclick=()=>family.host();
 root.querySelector('#join-family').onclick=()=>family.join(root.querySelector('#family-code').value);
 root.querySelector('#leave-family').onclick=()=>family.leave();
 root.querySelector('#copy-invite').onclick=async()=>{const input=root.querySelector('#family-invite');try{await navigator.clipboard.writeText(input.value);notify('Invite link copied. Share it with your family.');}catch{input.focus();input.select();notify('Select and copy this invite link for your family.');}};
 root.querySelector('#follow-family').onclick=follow;
 root.querySelector('#play-shared').onclick=()=>{const shared=family.status().shared;if(shared)playShared(shared.items);};
 root.querySelectorAll('[data-reaction]').forEach(b=>b.onclick=()=>family.react(+b.dataset.reaction));
 function update(s){root.querySelector('#family-status').textContent=s.message;root.querySelector('#family-connect').hidden=s.phase!=='solo';root.querySelector('#family-connected').hidden=s.phase!=='online';root.querySelector('#leave-family').hidden=s.phase==='solo';
  root.querySelector('#family-summary').textContent=`Room ${s.code} · ${s.count}/5 friends · ${s.total} shared sweets`;
  const url=new URL(location.href);url.search='';url.hash='';url.searchParams.set('room',s.code);root.querySelector('#family-invite').value=url.href;
  root.querySelector('#play-shared').hidden=!s.shared;root.querySelector('#follow-family').hidden=s.host;
  root.querySelectorAll('[data-name]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.name===s.name)));
 }
 const invite=new URL(location.href).searchParams.get('room');if(invite)root.querySelector('#family-code').value=invite.toUpperCase().slice(0,4);
 return {update,open(){openPanel('A little family togetherness');update(family.status());root.querySelector('#family-code').focus();}};
}
