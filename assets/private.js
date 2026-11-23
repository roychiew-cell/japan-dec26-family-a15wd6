'use strict';
(() => {
 const host=document.querySelector('[data-private-lock]'); if(!host)return;
 const input=host.querySelector('[data-passphrase]'), content=host.querySelector('[data-private-content]'), status=host.querySelector('[data-lock-status]');
 const bytes=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
 host.querySelector('[data-unlock]').addEventListener('click',async()=>{
  content.replaceChildren();status.textContent='Unlocking…';
  const passphrase=input.value;input.value='';
  try {
   if(!passphrase || !crypto.subtle)throw new Error('Unavailable');
   const response=await fetch('assets/private.enc.json');if(!response.ok)throw new Error('Unavailable');
   const payload=await response.json();
   if(payload.iter!==310000)throw new Error('Invalid format');
   const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(passphrase),'PBKDF2',false,['deriveKey']);
   const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:bytes(payload.salt),iterations:payload.iter,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
   const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(payload.iv)},key,bytes(payload.ct));
   const data=JSON.parse(new TextDecoder().decode(plain));content.innerHTML=data.html;status.textContent='Unlocked on this page. Lock again or close this tab when finished.';
  } catch(_){status.textContent='Could not unlock. Check the passphrase and that the encrypted file was prepared. Web Crypto requires HTTPS or localhost.';}
 });
 host.querySelector('[data-lock]').addEventListener('click',()=>{content.replaceChildren();input.value='';status.textContent='Locked.';});
})();
