// Playtest feedback (Oct 2026): a small form in the hub and in battles. Sends to the developer's Google Form without
// leaving the game (POST to formResponse, no-cors), with optional game details attached. Configure FORM below.
(function(root){'use strict';
const FORM={
 // The form's /formResponse address and the entry ids of its four short-answer / paragraph questions.
 action:'https://docs.google.com/forms/d/e/1FAIpQLScA4z2wxUSarXuPQw7GGFjSEsJYWzLYe5BF8REBQnX1R1c3lg/formResponse',
 entries:{category:'1889728452',fun:'1824800366',message:'902686380',details:'260020857'}
};
const CATEGORIES=['Bug','Balance (too easy / too hard)','Confusing','Idea','Something I loved','Other'];
const configured=()=>!!(FORM.action&&FORM.entries.message);
let dlg=null,ctx=null;
function details(){let p={};try{p=JSON.parse(localStorage.getItem('warden.profile.v1')||'{}')}catch{}const P=root.WardenProgression;const g=root.WardenFeedbackGame?.();
 const parts=[`Page: ${location.pathname.split('/').pop()||'index'}${location.search}`,`Screen: ${innerWidth}x${innerHeight}`,`Browser: ${navigator.userAgent}`];
 if(g&&g.mission)parts.push(`Battle: ${g.mission}${g.level&&g.mission==='outer'?' L'+g.level:''} · wave ${g.completed} · seal ${g.health} · towers ${g.towers?.length||0} · charge ${Math.floor(g.charge||0)}`);
 if(P){try{parts.push(`Warden Power ${P.powerRating(p)} · best Engine wave ${p.engineBest||0} · Ascension ${p.ascension||0} · Tactician ${p.tacticianBest||'-'}`)}catch{}}
 parts.push(`Parts ${p.parts||0} · Resonance ${p.resonance||0} · badges ${Object.keys(p.earned||{}).length}`);return parts.join('\n')}
function build(){if(dlg)return dlg;dlg=document.createElement('dialog');dlg.id='feedbackDialog';dlg.className='feedback-dialog';dlg.setAttribute('aria-labelledby','fbTitle');
 dlg.innerHTML=`<form method="dialog" class="fb-form"><div class="fb-head"><div><span class="eyebrow">PLAYTEST</span><h2 id="fbTitle">Send feedback</h2></div><button type="button" class="fb-close" aria-label="Close">×</button></div>
 <p class="fb-lead">Thank you for testing Warden of Power! Anything helps: bugs, confusing moments, balance, ideas, what you enjoyed.</p>
 <label>What is it about?<select id="fbCategory">${CATEGORIES.map(c=>`<option>${c}</option>`).join('')}</select></label>
 <label>How fun is it so far?<span class="fb-stars" role="radiogroup" aria-label="Fun rating">${[1,2,3,4,5].map(n=>`<label class="fb-star"><input type="radio" name="fbFun" value="${n}"><span aria-hidden="true">★</span><span class="sr">${n} of 5</span></label>`).join('')}</span></label>
 <label>Your feedback<textarea id="fbMessage" rows="6" maxlength="4000" placeholder="What happened? Where were you? What did you expect?" required></textarea></label>
 <label class="fb-check"><input type="checkbox" id="fbDetails" checked> Include game details (screen, browser, where you are in the game) so we can reproduce it</label>
 <details class="fb-preview"><summary>See exactly what is sent</summary><pre id="fbDetailsText"></pre></details>
 <p class="fb-status" id="fbStatus" role="status"></p>
 <div class="fb-actions"><button type="button" class="fb-cancel">Cancel</button><button type="submit" class="fb-send primary">Send feedback</button></div></form>`;
 document.body.appendChild(dlg);
 const close=()=>{dlg.close()};dlg.querySelector('.fb-close').onclick=close;dlg.querySelector('.fb-cancel').onclick=close;
 dlg.addEventListener('close',()=>ctx?.onClose?.());
 dlg.querySelector('form').onsubmit=e=>{e.preventDefault();send()};return dlg}
async function send(){const msg=dlg.querySelector('#fbMessage').value.trim(),st=dlg.querySelector('#fbStatus');if(!msg){st.textContent='Please write a few words first.';return}
 const fun=dlg.querySelector('input[name="fbFun"]:checked')?.value||'',cat=dlg.querySelector('#fbCategory').value,det=dlg.querySelector('#fbDetails').checked?details():'(not shared)';
 if(!configured()){try{await navigator.clipboard.writeText(`[${cat}] fun ${fun||'-'}/5\n${msg}\n\n${det}`)}catch{}st.textContent='The feedback form is not connected yet. Your message was copied to the clipboard so it is not lost.';return}
 const body=new URLSearchParams();body.append(`entry.${FORM.entries.category}`,cat);if(FORM.entries.fun)body.append(`entry.${FORM.entries.fun}`,fun||'-');body.append(`entry.${FORM.entries.message}`,msg);if(FORM.entries.details)body.append(`entry.${FORM.entries.details}`,det);
 const btn=dlg.querySelector('.fb-send');btn.disabled=true;st.textContent='Sending…';
 try{await fetch(FORM.action,{method:'POST',mode:'no-cors',body});st.textContent='Sent. Thank you, Warden!';dlg.querySelector('#fbMessage').value='';dlg.querySelectorAll('input[name="fbFun"]').forEach(r=>r.checked=false);setTimeout(()=>{if(dlg.open)dlg.close()},1400)}
 catch{st.textContent='Could not send (are you offline?). Your message is still here; try again in a moment.'}finally{btn.disabled=false}}
function open(options={}){ctx=options;build();dlg.querySelector('#fbStatus').textContent='';dlg.querySelector('#fbDetailsText').textContent=details();if(options.category){const s=dlg.querySelector('#fbCategory');if([...s.options].some(o=>o.value===options.category))s.value=options.category}options.onOpen?.();dlg.showModal();setTimeout(()=>dlg.querySelector('#fbMessage').focus(),30)}
root.WardenFeedback={open,configured,FORM,CATEGORIES,details};
})(typeof globalThis!=='undefined'?globalThis:this);
