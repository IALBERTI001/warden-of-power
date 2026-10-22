// The Containment Complex: the player's home hub (Phase 2).
// Restore facilities with Restoration Parts, grow towers with Resonance, browse badges, manage saves.
'use strict';
const P=WardenProgression,E=WardenEngine,B=WardenBadges,$=id=>document.getElementById(id);
const KEYS=['warden.profile.v1','warden.settings.v1','warden.keys.v1','warden.run.v1'];
const PROFILE_KEY=KEYS[0];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- data -------------------------------------------------------------------------------
const ELEMENT={water:{name:'Water',color:'#5fd2ef'},fire:{name:'Fire',color:'#ff9a3c'},ice:{name:'Ice',color:'#a9e6ff'},lightning:{name:'Lightning',color:'#c79bff'},engineering:{name:'Engineering',color:'#e4c27a'}};
// x/y in % of the painting; mask = restored-painting ellipse [cx, cy, rx, ry] in painting pixels.
const PLACES=[
 {id:'outer',kind:'tutorial',name:'Outer Seal',x:41.7,y:80,el:'fire',text:'The south gate of the complex. You held it in the Broken Conduit; now raise its great gate to open the road inside.'},
 {id:'moonwell',kind:'facility',x:18,y:22,mask:[270,190,285,205],badge:'restore_water',text:'Tiered pools and aqueducts once fed the whole complex. Drain the silt, mend the pumps and the moonlit water will flow again.'},
 {id:'emberheart',kind:'facility',x:57,y:21,mask:[880,165,245,180],badge:'restore_fire',text:'The great furnace that tempered every tower. Clear the slag and relight it to make your Fire burn hotter.'},
 {id:'rimeglass',kind:'facility',x:15,y:63,mask:[235,640,270,215],badge:'restore_ice',text:'Half-buried vaults of crystal ice. Their cold, once freed, sharpens every Ice tower.'},
 {id:'stormcrown',kind:'facility',x:69,y:42,mask:[1075,420,205,215],badge:'restore_lightning',text:'A spire of copper coils that once caught the storms. Rewire it and Lightning will strike harder and further.'},
 {id:'atelier',kind:'facility',x:61,y:70,mask:[935,690,220,165],text:'The Cogwright\'s workshop of gears and cranes. Restored, it gives every defense more Charge to start with.'},
 {id:'aetherheart',kind:'engine',name:'Aetherheart Engine',x:41.7,y:44,el:'engineering',text:'The sealed heart of the complex. When all four elemental facilities are reawakened, the final mission opens; clearing it unseals the Unbound Gate to endless waves.'}
];
const facility=id=>P.FACILITIES.find(f=>f.id===id);
const placeName=p=>p.name||facility(p.id).name;
const placeEl=p=>p.el||facility(p.id).branch;

// ---------- save ---------------------------------------------------------------------------------
function load(){try{return P.migrate(JSON.parse(localStorage.getItem(PROFILE_KEY))||{})}catch{return P.blankProfile()}}
let profile=load();
function persist(){try{localStorage.setItem(PROFILE_KEY,JSON.stringify(profile))}catch{toast('Progress not saved','This browser is blocking storage.')}}
addEventListener('storage',e=>{if(e.key===PROFILE_KEY){profile=load();render()}});

// ---------- map painting ------------------------------------------------------------------------
const canvas=$('hubMap'),ctx=canvas.getContext('2d');
const img={};let ready=false;const fades={};
Promise.all([['ruined','assets/hub/hub-ruined.jpg'],['restored','assets/hub/hub-restored.jpg']].map(([k,src])=>new Promise((ok,bad)=>{const i=new Image();i.onload=()=>{img[k]=i;ok()};i.onerror=()=>bad(src);i.src=src}))).then(()=>{ready=true;paint()}).catch(src=>{toast('Could not load the hub painting',String(src))});
const maskCache={};
function restoredLayer(place){if(maskCache[place.id])return maskCache[place.id];const c=document.createElement('canvas');c.width=1536;c.height=1024;const x=c.getContext('2d');x.drawImage(img.restored,0,0);const [cx,cy,rx,ry]=place.mask;x.globalCompositeOperation='destination-in';x.save();x.translate(cx,cy);x.scale(rx/ry,1);const g=x.createRadialGradient(0,0,ry*.55,0,0,ry);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(0,0,ry,0,Math.PI*2);x.fill();x.restore();return maskCache[place.id]=c}
function paint(){if(!ready)return;ctx.clearRect(0,0,1536,1024);ctx.drawImage(img.ruined,0,0);let animating=false;const now=performance.now();
 for(const p of PLACES){if(p.kind!=='facility')continue;if(stage(p.id)<3)continue;const f=fades[p.id];let a=1;if(f){a=Math.min(1,(now-f)/1400);if(a<1)animating=true;else delete fades[p.id]}ctx.globalAlpha=a;ctx.drawImage(restoredLayer(p),0,0);ctx.globalAlpha=1}
 if(animating)requestAnimationFrame(paint)}

// ---------- helpers -----------------------------------------------------------------------------
const stage=id=>Math.min(3,profile.restorations?.[id]||0);
const seals=()=>profile.seals?.tutorial||{};
const sealCount=()=>['cleared','held','challenge'].filter(k=>seals()[k]).length;
const bonusText=f=>f.bonus[0]==='damagePct'?`+${Math.round(f.bonus[1]*100)}% ${ELEMENT[f.branch].name} damage for every tower`:`+${f.bonus[1]} starting Charge in every defense`;
function award(id){if(!profile.earned[id]){profile.earned[id]=new Date().toISOString();const a=E.ACHIEVEMENTS.find(a=>a[0]===id);toast(a?a[1]:id,'BADGE UNLOCKED',id)}}
function toast(title,sub,badge){const el=document.createElement('div');el.className='toast'+(badge?' badge-toast':'');el.innerHTML=(badge?`<img class="toast-badge" src="${B.image(badge,128)}" alt="">`:'')+`<small></small><div></div>`;el.querySelector('small').textContent=sub;el.querySelector('div').textContent=title;$('toasts').append(el);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>el.remove(),5200)}
function escape(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])}

// ---------- pins + wallet + play-next ----------------------------------------------------------
function placeState(p){if(p.kind==='tutorial'){const n=sealCount();if(!profile.gateOpen){const o=P.gateOffer(profile);return{label:'Gate sealed · Raise it',tone:o.ok?'ready':'idle',ready:o.ok}}return{label:`Gate open · Seals ${n}/3`,tone:'ok'}}
 if(p.kind==='engine'){const n=['moonwell','emberheart','rimeglass','stormcrown'].filter(id=>stage(id)>=3).length;return{label:`Sealed · ${n}/4 facilities reawakened`,tone:'locked'}}
 if(!profile.gateOpen)return{label:'Beyond the gate',tone:'locked',stage:0};const s=stage(p.id),o=P.restorationOffer(profile,p.id);return{label:s>=3?'Reawakened':s?`Restoring · ${s}/3`:'Ruined',tone:s>=3?'ok':o.ok?'ready':'idle',ready:o.ok,stage:s}}
function render(){
 $('parts').textContent=profile.parts||0;$('resonance').textContent=profile.resonance||0;$('power').textContent='+'+P.powerSummary(profile)+'%';
 const pins=$('pins');pins.innerHTML='';
 for(const p of PLACES){const st=placeState(p),el=placeEl(p);const b=document.createElement('button');b.className=`pin tone-${st.tone}`;b.style.left=p.x+'%';b.style.top=p.y+'%';b.style.setProperty('--el',ELEMENT[el].color);b.dataset.place=p.id;
  const pips=p.kind==='facility'?`<span class="pips" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=st.stage?'on':''}"></i>`).join('')}</span>`:'';
  b.innerHTML=`<span class="pin-name">${escape(placeName(p))}</span><span class="pin-state">${st.ready?'<b class="pin-ready" aria-hidden="true">!</b> ':''}${escape(st.label)}</span>${pips}`;
  b.setAttribute('aria-label',`${placeName(p)}: ${st.label}${st.ready?'. A restoration is affordable.':''}`);b.onclick=()=>openPanel(p.id,b);pins.append(b)}
 const n=nextStep();$('playNext').innerHTML=`<small>NEXT STEP</small><span>${escape(n.label)}</span>`;$('playNext').onclick=n.go;
 if(currentPanel)openPanel(currentPanel,null,true);if(!$('skills').hidden)renderSkills();
 paint()}
function nextStep(){if(!seals().cleared)return{label:'▶ Play the tutorial',go:()=>play()};if(!profile.gateOpen){const o=P.gateOffer(profile);return o.ok?{label:`Raise the Outer Seal Gate · ${P.GATE.cost} Parts`,go:()=>openPanel('outer')}:{label:'▶ Replay the tutorial for Parts',go:()=>play()}}
 for(const id of ['moonwell','emberheart','rimeglass','stormcrown','atelier']){const o=P.restorationOffer(profile,id);if(o.ok)return{label:`Restore ${facility(id).name} · ${o.cost} Parts`,go:()=>openPanel(id)}}
 if(P.SKILLS.some(s=>P.skillOffer(profile,s.id).ok))return{label:'✦ Spend Resonance on skills',go:()=>openSkills()};
 return{label:'▶ Replay the tutorial for more Parts',go:()=>play()}}
function play(){persist();location.href='index.html'}

// ---------- side panel -------------------------------------------------------------------------
let currentPanel=null,lastOpener=null;
function openPanel(id,opener,keep){const p=PLACES.find(p=>p.id===id);currentPanel=id;if(opener)lastOpener=opener;const body=$('panelBody'),el=placeEl(p);
 let html=`<span class="eyebrow" style="color:${ELEMENT[el].color}">${p.kind==='facility'?ELEMENT[el].name.toUpperCase()+' FACILITY':p.kind==='engine'?'THE HEART OF THE COMPLEX':'TUTORIAL'}</span><h2>${escape(placeName(p))}</h2><p>${escape(p.text)}</p>`;
 if(p.kind==='tutorial'){const s=seals();const go=P.gateOffer(profile);html+=profile.gateOpen?`<p class="reawakened">The gate is raised: the road into the complex is open. +${P.GATE.bonus[1]} starting Charge in every defense.</p><h3>Fire skills</h3><p>The gate's fire wards opened the Fire branch of the skill tree.</p><button class="hub-btn" id="panelSkills">Open Fire skills</button>`:`<h3>The gate</h3><ol class="stages"><li class="next"><span class="stage-name">${P.GATE.stage}</span><span class="stage-cost">${P.GATE.cost} Parts</span><span class="stage-bonus">Opens the road into the complex and the Fire skills · +${P.GATE.bonus[1]} starting Charge in every defense</span></li></ol><button class="primary-btn" id="gateBtn" ${go.ok?'':'disabled'}>Raise the gate · ${P.GATE.cost} Parts</button>${go.ok?'':`<p class="why">${escape(go.reason)}</p>`}`;html+=`<h3>Seals</h3><ul class="checklist">${[['cleared','Cleared: win all five waves'],['held','Held: win with the seal at 75% or more'],['challenge','Challenge: trigger freeze, chain and shatter in one attempt']].map(([k,t])=>`<li class="${s[k]?'done':''}"><i aria-hidden="true">${s[k]?'✓':''}</i>${t}${s[k]?'':` <em>+${E.SEAL_RESONANCE} Resonance</em>`}</li>`).join('')}</ul><p class="muted">First clear: 80 Restoration Parts. Replays: 20 Parts.</p><button class="hub-btn" id="panelPlay">▶ Replay the tutorial</button>`}
 else if(p.kind==='engine'){const list=['moonwell','emberheart','rimeglass','stormcrown'].map(id=>`<li class="${stage(id)>=3?'done':''}"><i aria-hidden="true">${stage(id)>=3?'✓':''}</i>Reawaken ${facility(id).name}</li>`).join('');html+=`<h3>To unseal</h3><ul class="checklist">${list}<li><i aria-hidden="true"></i>Win the Aetherheart finale <em>arrives with the campaign</em></li></ul>`}
 else{const f=facility(id),s=stage(id),o=P.restorationOffer(profile,id);
  html+=`<h3>Restoration</h3><ol class="stages">${f.stages.map((name,i)=>`<li class="${i<s?'done':i===s?'next':''}"><span class="stage-name">${i<s?'✓ ':''}${escape(name)}</span><span class="stage-cost">${i<s?'Done':f.costs[i]+' Parts'}</span><span class="stage-bonus">${bonusText(f)}</span></li>`).join('')}</ol>`;
  html+=s>=3?`<p class="reawakened">Fully reawakened. Its bonus strengthens every tower, in every mode.</p>`:`<button class="primary-btn" id="restoreBtn" ${o.ok?'':'disabled'}>Restore: ${escape(f.stages[s])} · ${f.costs[s]} Parts</button>${o.ok?'':`<p class="why">${escape(o.reason)}</p>`}`;
  const unlocked=P.branchUnlocked(profile,f.branch);html+=`<h3>${ELEMENT[f.branch].name} skills</h3>${unlocked?`<p>The ${ELEMENT[f.branch].name} branch of the skill tree is open.</p><button class="hub-btn" id="panelSkills">Open ${ELEMENT[f.branch].name} skills</button>`:`<p class="muted">Restore the first stage to open the ${ELEMENT[f.branch].name} branch of the skill tree.</p>`}`}
 body.innerHTML=html;$('panel').hidden=false;
 $('panelPlay')&&($('panelPlay').onclick=play);$('panelSkills')&&($('panelSkills').onclick=()=>openSkills(p.kind==='tutorial'?'fire':facility(id).branch));$('gateBtn')&&($('gateBtn').onclick=()=>{const r=P.openGate(profile);if(r.ok){persist();toast('The Outer Seal Gate rises','ROAD OPENED · FIRE SKILLS UNLOCKED');render()}});
 $('restoreBtn')&&($('restoreBtn').onclick=()=>restore(id));
 document.querySelectorAll('.pin').forEach(b=>b.classList.toggle('active',b.dataset.place===id));
 if(!keep)setTimeout(()=>$('panel').querySelector('button:not([disabled]):not(.panel-close)')?.focus(),30)}
function closePanel(){$('panel').hidden=true;currentPanel=null;document.querySelectorAll('.pin').forEach(b=>b.classList.remove('active'));lastOpener?.focus?.()}
function restore(id){const r=P.restore(profile,id);if(!r.ok){toast('Not yet',r.reason);return}const f=facility(id),p=PLACES.find(p=>p.id===id);
 if(r.stage===1&&f.branch)toast(`${ELEMENT[f.branch].name} skills unlocked`,f.name);
 if(r.stage===3){fades[id]=performance.now();if(reduced)delete fades[id];toast(`${f.name} reawakened`,'RESTORATION COMPLETE');if(p.badge)award(p.badge)}else toast(f.stages[r.stage-1],`${f.name} · stage ${r.stage}/3`);
 persist();render()}
document.querySelector('[data-close-panel]').onclick=closePanel;

// ---------- skill tree ------------------------------------------------------------------------
const EFFECT={burnPct:'burn damage',impactPct:'Fire impact damage',shatterPct:'shatter damage',shatterRadiusPct:'shatter radius',soakPct:'Soaked duration',speedPct:'Water attack speed',soakExtra:'extra enemy soaked per Water hit',slowPts:'points of Ice slow (cap 50%)',vsFrozenPct:'Ice damage to frozen enemies',vsBossPct:'Ice damage to bosses',damagePct:'Lightning damage',conductPct:'conduction distance',secondaryPct:'damage to chained enemies',chainExtra:'extra chain target',startingCharge:'starting Charge',upgradeDiscount:'off every upgrade (cap 6%)',refundPts:'points of sell refund (cap 90%)',fifthWaveCharge:'Charge every fifth wave cleared'};
function effectAt(s,r){if(!r)return'None yet';const v=s.value*r;const pctKeys=['burnPct','impactPct','shatterPct','shatterRadiusPct','soakPct','speedPct','vsFrozenPct','vsBossPct','damagePct','conductPct','secondaryPct','upgradeDiscount'];const label=s.key==='rangePct'?`${ELEMENT[s.branch].name} range`:EFFECT[s.key];
 if(pctKeys.includes(s.key)||s.key==='rangePct')return`${s.key==='upgradeDiscount'?'':'+'}${Math.round(v*100)}% ${label}`;if(s.key==='slowPts'||s.key==='refundPts')return`+${Math.round(v*100)} ${label}`;return`+${v} ${label}`}
let selectedSkill=null,skillOpener=null;
function openSkills(branch){skillOpener=document.activeElement;$('skills').hidden=false;if(branch){const first=P.SKILLS.find(s=>s.branch===branch&&P.rank(profile,s.id)<s.maxRank)||P.SKILLS.find(s=>s.branch===branch);selectedSkill=first.id}else if(!selectedSkill)selectedSkill=(P.SKILLS.find(s=>P.skillOffer(profile,s.id).ok)||P.SKILLS[0]).id;renderSkills();setTimeout(()=>document.querySelector(`[data-skill="${selectedSkill}"]`)?.focus(),30)}
function nodeState(s){const r=P.rank(profile,s.id);if(r>=s.maxRank)return['maxed','Mastered'];if(!P.branchUnlocked(profile,s.branch))return['locked','Locked'];const o=P.skillOffer(profile,s.id);if(o.ok)return['available',r?'Learned · next rank available':'Available'];if(r)return['learned','Learned'];return['sealed','Not yet']}
function renderSkills(){$('skillsResonance').textContent=profile.resonance||0;
 $('board').innerHTML=P.BRANCHES.map(br=>{const open=P.branchUnlocked(profile,br);const fac=P.FACILITIES.find(f=>f.branch===br);return`<div class="branch" style="--el:${ELEMENT[br].color}"><h3>${ELEMENT[br].name}</h3><p class="branch-state">${open?'Open':'Restore '+escape(fac.name)}</p>${P.SKILLS.filter(s=>s.branch===br).map(s=>{const [cls,label]=nodeState(s),r=P.rank(profile,s.id);return`<button class="node ${cls}" data-skill="${s.id}" aria-pressed="${s.id===selectedSkill}"><span class="gem" aria-hidden="true">${cls==='locked'?'🔒':cls==='maxed'?'★':s.order===4?'◆':'✦'}</span><span class="node-name">${escape(s.name)}</span><span class="node-rank">${r}/${s.maxRank} · ${label}</span></button>`}).join('')}</div>`}).join('');
 document.querySelectorAll('[data-skill]').forEach(b=>b.onclick=()=>{selectedSkill=b.dataset.skill;renderSkills();document.querySelector(`[data-skill="${selectedSkill}"]`)?.focus()});
 const s=P.SKILLS.find(s=>s.id===selectedSkill);const r=P.rank(profile,s.id),o=P.skillOffer(profile,s.id),fac=P.FACILITIES.find(f=>f.branch===s.branch);
 let mastery='';const full=P.SKILLS.filter(n=>n.branch===s.branch).every(n=>P.rank(profile,n.id)===n.maxRank);
 if(full){mastery=`<hr><h4>Mastery · ${ELEMENT[s.branch].name}</h4><ul class="mastery">${P.MASTERY.unlockWaves.map((w,i)=>{const t=i+1,mr=profile.mastery?.[s.branch]?.[t]||0,mo=P.masteryOffer(profile,s.branch,t);return`<li><span>Tier ${['I','II','III','IV','V'][i]} · ${mr}/10</span>${mo.ok?`<button class="hub-btn small" data-mastery="${t}">Buy rank · ${mo.cost} ✦</button>`:`<em>${escape(mo.reason)}</em>`}</li>`}).join('')}</ul>`}
 $('skillDetail').innerHTML=`<span class="eyebrow" style="color:${ELEMENT[s.branch].color}">${ELEMENT[s.branch].name.toUpperCase()} · NODE ${s.order} OF 4</span><h3>${escape(s.name)}</h3><div class="compare"><div><small>Now</small><b>${effectAt(s,r)}</b></div><div><small>${r>=s.maxRank?'Maximum':'Next rank'}</small><b>${r>=s.maxRank?'—':effectAt(s,r+1)}</b></div></div><p class="rank-line">Rank ${r} of ${s.maxRank}${r<s.maxRank?` · costs ${s.costs[r]} Resonance`:''}</p>${r<s.maxRank?`<button class="primary-btn" id="buySkill" ${o.ok?'':'disabled'}>Buy rank ${r+1} · ${s.costs[r]} ✦</button>${o.ok?'':`<p class="why">${escape(o.reason)}</p>`}`:'<p class="reawakened">This node is mastered.</p>'}<p class="muted">Applies to every tower in every mode: tutorial, campaign and endless.</p>${!P.branchUnlocked(profile,s.branch)?`<p class="muted">Opens when ${escape(fac.name)} reaches restoration stage 1.</p>`:''}${mastery}`;
 $('buySkill')&&($('buySkill').onclick=()=>{const res=P.buySkill(profile,s.id);if(res.ok){persist();toast(`${s.name} rank ${res.rank}`,'SKILL LEARNED');render();renderSkills();$('buySkill')?.focus()}});
 document.querySelectorAll('[data-mastery]').forEach(b=>b.onclick=()=>{const res=P.buyMastery(profile,s.branch,+b.dataset.mastery);if(res.ok){persist();toast(`Mastery rank ${res.rank}`,ELEMENT[s.branch].name.toUpperCase());render();renderSkills()}})}
$('openSkills').onclick=()=>openSkills();
let resetArmed=false;$('resetSkills').onclick=()=>{const spent=P.SKILLS.some(s=>P.rank(profile,s.id));if(!spent){toast('Nothing to reassign','You have not learned any skills yet.');return}if(!resetArmed){resetArmed=true;$('resetSkills').textContent='Click again to refund every skill';setTimeout(()=>{resetArmed=false;$('resetSkills').textContent='Reassign all (free)'},4000);return}resetArmed=false;$('resetSkills').textContent='Reassign all (free)';const back=P.resetSkills(profile);persist();toast(`${back} Resonance refunded`,'SKILLS REASSIGNED');render();renderSkills()};

// ---------- badges ----------------------------------------------------------------------------
function renderBadges(){const count=Object.keys(profile.earned).length;$('badgeSummary').textContent=`${count} / ${E.ACHIEVEMENTS.length} earned`;
 $('achievementList').innerHTML=E.ACHIEVEMENTS.map(([id,name,desc])=>{const earned=profile.earned[id],tier=B.tier(id),prog=B.progress(id,profile),equipped=profile.equipped===id;const status=earned?'Earned '+new Date(earned).toLocaleDateString():B.available(id)?(prog?`${prog.value} / ${prog.goal}`:'Available now'):'Requires later maps / endless';return`<article class="achievement ${earned?'earned':'locked'} tier-${tier}"><div class="badge-slot"><img class="badge-art ${earned?'':'is-locked'}" src="${B.image(id,256)}" alt="" width="96" height="96" loading="lazy">${earned?'':'<span class="badge-lock" aria-hidden="true">🔒</span>'}</div><div class="badge-text"><strong>${escape(name)}</strong><span class="badge-tier">${B.TIER_LABEL[tier]} · ${earned?'Earned':'Locked'}</span><p>${escape(desc)}</p>${prog&&!earned?`<div class="badge-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${prog.goal}" aria-valuenow="${prog.value}"><i style="width:${prog.value/prog.goal*100}%"></i></div>`:''}<small>${status}</small>${earned?`<button class="badge-equip" data-equip="${id}" aria-pressed="${equipped}">${equipped?'Shown on your profile':'Show on profile'}</button>`:''}</div></article>`}).join('');
 document.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{if(B.equip(profile,b.dataset.equip)){persist();renderBadges()}})}
$('openBadges').onclick=()=>{renderBadges();openOverlay('badges')};

// ---------- settings: saves + test tools --------------------------------------------------------
function saveCode(){const data={};for(const k of KEYS){try{data[k]=localStorage.getItem(k)}catch{data[k]=null}}data[PROFILE_KEY]=JSON.stringify(profile);return'WARDEN1:'+btoa(unescape(encodeURIComponent(JSON.stringify(data))))}
$('openSettings').onclick=()=>{$('saveCode').value=saveCode();$('testMode').checked=testMode();$('testTools').hidden=!testMode();openOverlay('settings')};
$('copySave').onclick=async()=>{const code=saveCode();$('saveCode').value=code;try{await navigator.clipboard.writeText(code);$('copyStatus').textContent='Copied. Paste it somewhere safe.'}catch{$('saveCode').select();$('copyStatus').textContent='Selected: press Ctrl+C to copy.'}};
$('importSave').onclick=()=>{const raw=$('saveCode').value.trim();try{if(!raw.startsWith('WARDEN1:'))throw new Error('This is not a Warden save code.');const data=JSON.parse(decodeURIComponent(escape_(atob(raw.slice(8)))));for(const k of KEYS){if(!(k in data))throw new Error('The save code is incomplete.');if(data[k]!==null)JSON.parse(data[k])}for(const k of KEYS){if(data[k]===null)localStorage.removeItem(k);else localStorage.setItem(k,data[k])}profile=load();render();$('importStatus').textContent='Save loaded.';toast('Save loaded','PROGRESS RESTORED')}catch(e){$('importStatus').textContent=e.message||'That save code could not be read.'}};
function escape_(s){return Array.from(s,c=>'%'+c.charCodeAt(0).toString(16).padStart(2,'0')).join('')}
function testMode(){try{return localStorage.getItem('warden.hub.test')==='1'}catch{return false}}
$('testMode').onchange=e=>{try{localStorage.setItem('warden.hub.test',e.target.checked?'1':'0')}catch{}$('testTools').hidden=!e.target.checked};
document.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>{const t=b.dataset.test;if(t==='parts')profile.parts=(profile.parts||0)+100;if(t==='resonance')profile.resonance=(profile.resonance||0)+100;if(t==='wave')profile.bestEndlessWave=Math.max(profile.bestEndlessWave||0,100);persist();render();toast(b.textContent,'TEST TOOL')});
let wipeArmed=false;$('resetAll').onclick=()=>{if(!wipeArmed){wipeArmed=true;$('resetAll').textContent='Click again to erase all progress';$('resetStatus').textContent='This cannot be undone.';setTimeout(()=>{wipeArmed=false;$('resetAll').textContent='Reset all progress…';$('resetStatus').textContent=''},5000);return}for(const k of KEYS){try{localStorage.removeItem(k)}catch{}}profile=P.blankProfile();persist();$('resetStatus').textContent='All progress erased.';render()};

// ---------- overlays + keyboard ------------------------------------------------------------------
let overlayOpener=null;
function openOverlay(id){overlayOpener=document.activeElement;$(id).hidden=false;setTimeout(()=>$(id).querySelector('.overlay-close')?.focus(),30)}
function closeOverlays(){let closed=false;for(const id of ['skills','badges','settings'])if(!$(id).hidden){$(id).hidden=true;closed=true}if(closed)(overlayOpener||skillOpener)?.focus?.();return closed}
document.querySelectorAll('[data-close-overlay]').forEach(b=>b.onclick=closeOverlays);
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',e=>{if(e.target===o)closeOverlays()}));
addEventListener('keydown',e=>{if(e.key==='Escape'){if(!closeOverlays()&&!$('panel').hidden)closePanel()}});

render();

// ---------- first-visit guide ----------------------------------------------------------------
// One step at a time, pointing at the real control; advances only on the real action. Stored in the profile
// (travels with save codes). Never spends anything for the player.
const EXPLAIN={
 parts:['Restoration Parts','Earned by winning missions (80 for a first win, 20 for replays). Spend them to rebuild the ruined facilities. Each restored stage gives every tower a permanent bonus and the first stage opens that element\'s skills.'],
 resonance:['Resonance','Earned once for each Seal you win on a mission (Cleared, Held, Challenge) and later in endless mode. Spend it in Skills to make your towers stronger. You can reassign skills for free at any time.'],
 power:['Warden Power','The total of every bonus your towers carry from restorations and skills: damage, burning, range, speed and more. It applies everywhere: the tutorial, the campaign and endless. Select a tower in battle to see its own bonus.']};
function explain(key,anchor){const [t,d]=EXPLAIN[key];const box=$('explain');box.innerHTML=`<button class="panel-close" aria-label="Close">×</button><h3>${t}</h3><p>${d}</p>`;box.hidden=false;const r=anchor.getBoundingClientRect();box.style.left=Math.max(12,Math.min(innerWidth-332,r.left))+'px';box.style.top=(r.bottom+10)+'px';box.querySelector('button').onclick=()=>{box.hidden=true;anchor.focus()};box.querySelector('button').focus()}
document.querySelectorAll('[data-explain]').forEach(b=>b.onclick=()=>explain(b.dataset.explain,b));

const GUIDE=[
 {id:'outer',target:()=>document.querySelector('[data-place="outer"]'),title:'The gate is still sealed',text:'You held the Outer Seal, but its great gate is shut. Click the <b>Outer Seal</b>.',done:()=>currentPanel==='outer'||profile.gateOpen},
 {id:'gate',target:()=>$('gateBtn'),title:'Restore with Parts',text:'Restoration Parts rebuild the complex. Raise the gate to open the road inside. Every restoration also makes <b>every tower</b> a little stronger.',done:()=>!!profile.gateOpen,fallback:()=>openPanel('outer')},
 {id:'skills',target:()=>$('panelSkills'),title:'Fire skills are open',text:'The gate\'s fire wards opened the <b>Fire</b> skills. Open them to spend your <b>Resonance</b>.',done:()=>!$('skills').hidden||P.SKILLS.some(s=>P.rank(profile,s.id)),fallback:()=>openPanel('outer')},
 {id:'buy',target:()=>$('buySkill'),title:'Learn your first skill',text:'Choosing a skill never spends. When you are ready, press <b>Buy</b>. You can reassign skills for free later.',done:()=>P.SKILLS.some(s=>P.rank(profile,s.id)),fallback:()=>openSkills('fire')},
 {id:'power',target:()=>document.querySelector('[data-explain="power"]'),title:'Your towers are stronger',text:'<b>Warden Power</b> shows the bonus your towers now carry, in every battle. Click any resource up here to see what it does.',ack:'Got it'},
 {id:'mission',target:()=>document.querySelector('[data-place="moonwell"]'),title:'Your first campaign mission',text:'Beyond the gate, the <b>Moonwell Cisterns</b> hold your first campaign mission and more Parts to rebuild them. The mission arrives in the next build; until then, replays of the tutorial earn Parts.',ack:'Start playing'}
];
let guideAnchor=null;
function guideStep(){const g=profile.hubGuide||0;return g<GUIDE.length?GUIDE[g]:null}
function advanceGuide(){profile.hubGuide=(profile.hubGuide||0)+1;persist();guideAnchor=null;tickGuide()}
function showIntro(){const s=seals(),earnedRes=(profile.resonance||0);const el=$('guideIntro');el.innerHTML=`<div class="overlay-card intro-card"><span class="eyebrow">THE OUTER SEAL HOLDS</span><h2 id="guideTitle">The Containment Complex</h2><p>Beyond the Outer Seal lies your home: an ancient complex in ruins. Between battles you rebuild it and grow your towers. Everything you earn here makes <b>every tower stronger in every battle</b>. First, its gate must be raised.</p><div class="intro-res"><div><i aria-hidden="true">⚙</i><b>Restoration Parts · ${profile.parts||0}</b><span>Rebuild the ruined facilities. Earned by winning missions.</span></div><div><i aria-hidden="true">✦</i><b>Resonance · ${earnedRes}</b><span>Learn skills that strengthen your towers. Earned from Seals.</span></div></div><p class="muted">You won ${['cleared','held','challenge'].filter(k=>s[k]).length} of 3 Seals on the tutorial. Let's spend your first rewards.</p><div class="intro-actions"><button class="primary-btn" id="guideGo">Show me</button><button class="ghost" id="guideSkip">Skip the guide</button></div></div>`;el.hidden=false;$('guideGo').onclick=()=>{el.hidden=true;profile.hubGuide=0;profile.hubIntroSeen=true;persist();tickGuide()};$('guideSkip').onclick=()=>{el.hidden=true;profile.hubIntroSeen=true;profile.hubGuide=GUIDE.length;persist();tickGuide()};setTimeout(()=>$('guideGo').focus(),30)}
function tickGuide(){const box=$('guideCallout');const step=guideStep();document.querySelectorAll('.guide-pulse').forEach(e=>e.classList.remove('guide-pulse'));
 if(!profile.hubIntroSeen||!step||!$('guideIntro').hidden){box.hidden=true;return}
 if(step.done&&step.done()){advanceGuide();return}
 let t=step.target();if(!t&&step.fallback){step.fallback();t=step.target()}
 if(!t||t.offsetParent===null&&getComputedStyle(t).position!=='fixed'){box.hidden=true;return}
 const overlayOpen=['badges','settings'].some(id=>!$(id).hidden);if(overlayOpen){box.hidden=true;return}
 t.classList.add('guide-pulse');
 const key=step.id;if(box.dataset.step!==key){box.dataset.step=key;box.innerHTML=`<div class="coach-face" aria-hidden="true">✦</div><span class="eyebrow">HUB GUIDE · ${(profile.hubGuide||0)+1} OF ${GUIDE.length}</span><h4>${step.title}</h4><p>${step.text}</p><div class="guide-actions">${step.ack?`<button class="primary-btn small" id="guideAck">${step.ack}</button>`:''}<button class="ghost" id="guideSkipAll">Skip guide</button></div>`;if($('guideAck'))$('guideAck').onclick=advanceGuide;$('guideSkipAll').onclick=()=>{profile.hubGuide=GUIDE.length;persist();tickGuide()}}
 box.hidden=false;const r=t.getBoundingClientRect(),W=box.offsetWidth,H=box.offsetHeight;let x=r.right+16,y=r.top+r.height/2-H/2,side='left';
 if(x+W>innerWidth-12){x=r.left-W-16;side='right'}if(x<12){x=Math.max(12,r.left+r.width/2-W/2);y=r.top-H-16;side='down';if(y<12){y=r.bottom+16;side='up'}}
 y=Math.max(12,Math.min(innerHeight-H-12,y));box.style.left=x+'px';box.style.top=y+'px';box.dataset.arrow=side}
$('openGuide').onclick=()=>{profile.hubGuide=0;profile.hubIntroSeen=false;persist();showIntro()};
setInterval(tickGuide,250);addEventListener('resize',tickGuide);
if(seals().cleared&&!profile.hubIntroSeen)setTimeout(showIntro,500);
