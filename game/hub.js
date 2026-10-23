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

// ---------- map painting (HubFX draws stages, living effects and restoration moments) ------------
const canvas=$('hubMap');
const img={};let ready=false;
Promise.all([['ruined','assets/hub/hub-ruined.jpg'],['restored','assets/hub/hub-restored.jpg']].map(([k,src])=>new Promise((ok,bad)=>{const i=new Image();i.onload=()=>{img[k]=i;ok()};i.onerror=()=>bad(src);i.src=src}))).then(()=>HubFX.init(canvas,img.ruined,img.restored)).then(()=>{ready=true;paint()}).catch(src=>{toast('Could not load the hub painting',String(src))});
function sceneState(){const s={gate:profile.gateOpen?1:0};for(const id of ['moonwell','emberheart','rimeglass','stormcrown','atelier'])s[id]=stage(id);return s}
function paint(){if(ready&&!HubFX.isPlaying())HubFX.setState(sceneState())}
// The restoration moment: pins step aside, the area is rebuilt on screen, a banner names what changed.
function celebrate(id,from,to,title,line){if(!ready){render();return}document.body.classList.add('moment');const banner=$('momentBanner');banner.innerHTML=`<span class="eyebrow">RESTORED</span><h3></h3><p></p><small>Click or press any key to skip</small>`;banner.querySelector('h3').textContent=title;banner.querySelector('p').textContent=line;banner.hidden=true;
 setTimeout(()=>{if(HubFX.isPlaying())banner.hidden=false},reducedMotion?0:1500);
 playAreaCue(id);
 HubFX.playMoment(id,from,to,()=>{banner.hidden=true;document.body.classList.remove('moment');render()})}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const skip=()=>{if(HubFX.isPlaying())HubFX.skipMoment()};
addEventListener('keydown',e=>{if(HubFX.isPlaying()){e.preventDefault();e.stopImmediatePropagation();skip()}},true);
addEventListener('pointerdown',e=>{if(HubFX.isPlaying()){e.preventDefault();e.stopPropagation();skip()}},true);

// ---------- helpers -----------------------------------------------------------------------------
const stage=id=>Math.min(3,profile.restorations?.[id]||0);
const seals=()=>profile.seals?.tutorial||{};
const outerNext=()=>(profile.outer?.best||0)+1;
function readiness(L){const gap=P.powerSummary(profile)-E.OUTER.recommended(L);return gap>=0?{label:'Ready',tone:'ok'}:gap>=-15?{label:'Tough',tone:'warn'}:{label:'Very hard',tone:'hard'}}
const C=globalThis.WardenCampaign;
function sectorMissions(f){return C?C.MISSIONS.filter(m=>m.sector===f):[]}
function missionState(m){const rec=profile.missions?.[m.id]||{},av=C.available(profile,m.id),painted=!!E.MAPS[m.id]?.painted;return{rec,av,painted,seals:['cleared','held','challenge'].filter(k=>rec[k]).length}}
function playMission(id){persist();location.href=`index.html?mission=${id}`}
function missionList(f){return`<ul class="levels">${sectorMissions(f).map(m=>{const st=missionState(m);const cls=st.rec.cleared?'held':st.av.ok?'next':'locked';return`<li class="${cls}"><div><b>${m.finale?'Finale':'Mission '+m.index} · ${escape(m.name)}</b>${st.rec.cleared?` <span class="held-tag">✓ Cleared · Seals ${st.seals}/3</span>`:''}<small>${m.waves} waves · first clear ${m.firstParts} Parts, replays ${m.replayParts} · each Seal +${C.SEAL_PARTS}</small><small>Seals: Cleared · Held (75%+) · ${escape(m.challenge[1])}</small>${!st.av.ok?`<small class="ready tone-hard">${escape(st.av.reason)}</small>`:!st.painted?'<small class="ready tone-warn">The map is still being painted.</small>':''}</div><button class="${st.av.ok&&!st.rec.cleared?'primary-btn':'hub-btn'}" id="mission-${m.id}" data-mission="${m.id}" ${st.av.ok&&st.painted?'':'disabled'}>${st.rec.cleared?'Replay':'▶ Play'}</button></li>`}).join('')}</ul>`}
function playOuter(L){persist();location.href=`index.html?mission=outer&level=${L}`}
const sealCount=()=>['cleared','held','challenge'].filter(k=>seals()[k]).length;
const bonusText=f=>f.bonus[0]==='damagePct'?`+${Math.round(f.bonus[1]*100)}% ${ELEMENT[f.branch].name} damage for every tower`:`+${f.bonus[1]} starting Charge in every defense`;
function award(id){if(!profile.earned[id]){profile.earned[id]=new Date().toISOString();const a=E.ACHIEVEMENTS.find(a=>a[0]===id);toast(a?a[1]:id,'BADGE UNLOCKED',id)}}
function toast(title,sub,badge){const el=document.createElement('div');el.className='toast'+(badge?' badge-toast':'');el.innerHTML=(badge?`<img class="toast-badge" src="${B.image(badge,128)}" alt="">`:'')+`<small></small><div></div>`;el.querySelector('small').textContent=sub;el.querySelector('div').textContent=title;$('toasts').append(el);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>el.remove(),5200)}
function escape(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])}

// ---------- pins + wallet + play-next ----------------------------------------------------------
function placeState(p){if(p.kind==='tutorial'){const n=sealCount();if(!profile.gateOpen){const o=P.gateOffer(profile);return{label:'Gate sealed · Raise it',tone:o.ok?'ready':'idle',ready:o.ok}}return{label:`Defend · earn Parts · Level ${outerNext()}`,tone:'ready'}}
 if(p.kind==='engine'){const n=['moonwell','emberheart','rimeglass','stormcrown'].filter(id=>stage(id)>=3).length;const fin=C&&C.available(profile,'aetherheart-1').ok;return{label:profile.unboundOpen?'Unbound Gate open':fin?'Finale ready':stage('moonwell')>=1?'Stirring · the only source of Resonance':`Sealed · ${n}/4 facilities reawakened`,tone:profile.unboundOpen?'ok':fin?'ready':'locked',ready:fin&&!profile.unboundOpen}}
 if(!profile.gateOpen)return{label:'Beyond the gate',tone:'locked',stage:0};const s=stage(p.id),o=P.restorationOffer(profile,p.id);const nm=C&&p.id!=='atelier'?sectorMissions(p.id).find(m=>!profile.missions?.[m.id]?.cleared&&C.available(profile,m.id).ok&&E.MAPS[m.id]?.painted):null;return{label:s>=3?'Reawakened':o.ok?`Restore · stage ${s+1}`:nm?`Mission ${nm.index} ready`:s?`Restoring · ${s}/3`:'Ruined',tone:s>=3?'ok':o.ok||nm?'ready':'idle',ready:o.ok||!!nm,stage:s}}
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
 for(const id of ['moonwell','emberheart','rimeglass','stormcrown']){const o=P.restorationOffer(profile,id);if(o.ok)return{label:`Restore ${facility(id).name} · ${o.cost} Parts`,go:()=>openPanel(id)}}
 if(C){const m=C.MISSIONS.find(m=>!profile.missions?.[m.id]?.cleared&&C.available(profile,m.id).ok&&E.MAPS[m.id]?.painted);if(m)return{label:`▶ ${m.finale?'The finale':'Mission'} · ${m.name}`,go:()=>openPanel(m.finale?'aetherheart':m.sector)}}
 {const o=P.restorationOffer(profile,'atelier');if(o.ok)return{label:`Restore ${facility('atelier').name} · ${o.cost} Parts`,go:()=>openPanel('atelier')}}
 if(P.SKILLS.some(s=>P.skillOffer(profile,s.id).ok))return{label:'✦ Spend Resonance on skills',go:()=>openSkills()};
 if(!(profile.outer?.best))return{label:'▶ Hold the Outer Seal · Level 1 · earn Parts',go:()=>openPanel('outer')};
 return{label:`▶ Hold the Outer Seal · Level ${outerNext()}`,go:()=>openPanel('outer')}}
function play(){persist();location.href='index.html'}

// ---------- side panel -------------------------------------------------------------------------
let currentPanel=null,lastOpener=null;
function openPanel(id,opener,keep){const p=PLACES.find(p=>p.id===id);if(!keep&&currentPanel!==id)playAreaCue(id);currentPanel=id;if(opener)lastOpener=opener;const body=$('panelBody'),el=placeEl(p);
 let html=`<span class="eyebrow" style="color:${ELEMENT[el].color}">${p.kind==='facility'?ELEMENT[el].name.toUpperCase()+' FACILITY':p.kind==='engine'?'THE HEART OF THE COMPLEX':'THE SOUTH GATE'}</span><h2>${escape(placeName(p))}</h2><p>${escape(p.kind==='tutorial'&&profile.gateOpen?'The south gate of the complex, raised and open. Everything that comes out of the wilds must get past you here.':p.text)}</p>`;
 if(p.kind==='tutorial'){const s=seals();const go=P.gateOffer(profile);
  if(profile.gateOpen){const next=outerNext(),best=profile.outer?.best||0,power=P.powerSummary(profile);const levels=[next,...Array.from({length:Math.min(3,best)},(_,i)=>best-i)];
   html+=`<p class="reawakened">The gate is raised. +${P.GATE.bonus[1]} starting Charge in every defense.</p><h3>Hold the Outer Seal</h3><p>Monsters from the wilds try to break the gate. Hold all 8 waves to earn <b>Restoration Parts</b>. Each level is about 15% tougher and pays more. This is where you earn Parts early on.</p><ul class="levels">${levels.map(L=>{const r=readiness(L),held=!!profile.outer?.cleared?.[L];return`<li class="${L===next?'next':'held'}"><div><b>Level ${L}</b>${held?' <span class="held-tag">✓ Held</span>':''}<small>${held?`Replay: ${E.OUTER.replayParts(L)} Parts`:`First hold: ${E.OUTER.firstParts(L)} Parts · replays ${E.OUTER.replayParts(L)}`}</small><small class="ready tone-${r.tone}">${r.label} · recommended Warden Power +${E.OUTER.recommended(L)}% · yours +${power}%${E.OUTER.recommended(L)>E.OUTER.restorationCap?' · needs skills from the Engine':''}</small></div><button class="${L===next?'primary-btn':'hub-btn'}" ${L===next?'id="defendBtn"':''} data-level="${L}">${L===next?'▶ Defend':'Replay'}</button></li>`}).join('')}</ul><p class="muted">From level 3 some monsters are attuned to an element and resist it. Armour arrives at level 4, elites at level 6, and a boss guards every 5th level.</p><h3>Fire skills</h3><p>The gate's fire wards opened the Fire branch. Skills are bought with Resonance, which only the Aetherheart Engine gives.</p><button class="hub-btn" id="panelSkills">Open Fire skills</button>`}
  else html+=`<h3>The gate</h3><ol class="stages"><li class="next"><span class="stage-name">${P.GATE.stage}</span><span class="stage-cost">${P.GATE.cost} Parts</span><span class="stage-bonus">Opens the road into the complex, the Outer Seal defense and the Fire skills · +${P.GATE.bonus[1]} starting Charge in every defense</span></li></ol><button class="primary-btn" id="gateBtn" ${go.ok?'':'disabled'}>Raise the gate · ${P.GATE.cost} Parts</button>${go.ok?'':`<p class="why">${escape(go.reason)}</p>`}`;
  html+=`<h3>Training: the Broken Conduit</h3><ul class="checklist">${[['cleared','Cleared: win all five waves'],['held','Held: win with the seal at 75% or more'],['challenge','Challenge: trigger freeze, chain and shatter in one attempt']].map(([k,t])=>`<li class="${s[k]?'done':''}"><i aria-hidden="true">${s[k]?'✓':''}</i>${t}${s[k]?'':` <em>+${E.SEAL_PARTS} Parts</em>`}</li>`).join('')}</ul><p class="muted">The tutorial: first clear 80 Parts, replays 20.</p><button class="hub-btn" id="panelPlay">▶ Replay the tutorial</button>`}
 else if(p.kind==='engine'){const list=['moonwell','emberheart','rimeglass','stormcrown'].map(id=>`<li class="${stage(id)>=3?'done':''}"><i aria-hidden="true">${stage(id)>=3?'✓':''}</i>Reawaken ${facility(id).name}</li>`).join('');html+=(C?`<h3>The finale</h3>${missionList('aetherheart')}`:'')+`<h3>Resonance</h3><p>Resonance, which buys skills, is earned only here. ${stage('moonwell')>=1?'The Moonwell\'s first restoration sent power to the Engine and it is stirring. <b>Engine Trials</b>, a rising-wave defense that pays Resonance and counts toward the ladder, arrive in the next build.':'Restoring the Moonwell Cisterns to its first stage wakes the Engine.'}</p><h3>To unseal the Unbound Gate</h3><ul class="checklist">${list}<li><i aria-hidden="true"></i>Win the Aetherheart finale <em>arrives with the campaign</em></li></ul>`}
 else{const f=facility(id),s=stage(id),o=P.restorationOffer(profile,id);
  if(C&&id!=='atelier')html+=`<h3>Missions</h3><p>Each mission you clear opens the next restoration stage here. ${escape(C.SECTORS[id].roleText)}</p>${missionList(id)}`;
  html+=`<h3>Restoration</h3><ol class="stages">${f.stages.map((name,i)=>`<li class="${i<s?'done':i===s?'next':''}"><span class="stage-name">${i<s?'✓ ':''}${escape(name)}</span><span class="stage-cost">${i<s?'Done':f.costs[i]+' Parts'}</span><span class="stage-bonus">${bonusText(f)}</span></li>`).join('')}</ol>`;
  html+=s>=3?`<p class="reawakened">Fully reawakened. Its bonus strengthens every tower, in every mode.</p>`:`<button class="primary-btn" id="restoreBtn" ${o.ok?'':'disabled'}>Restore: ${escape(f.stages[s])} · ${f.costs[s]} Parts</button>${o.ok?'':`<p class="why">${escape(o.reason)}</p>`}`;
  const unlocked=P.branchUnlocked(profile,f.branch);html+=`<h3>${ELEMENT[f.branch].name} skills</h3>${unlocked?`<p>The ${ELEMENT[f.branch].name} branch of the skill tree is open.</p><button class="hub-btn" id="panelSkills">Open ${ELEMENT[f.branch].name} skills</button>`:`<p class="muted">Restore the first stage to open the ${ELEMENT[f.branch].name} branch of the skill tree.</p>`}`}
 body.innerHTML=html;$('panel').hidden=false;
 $('panelPlay')&&($('panelPlay').onclick=play);body.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>playOuter(+b.dataset.level));body.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>playMission(b.dataset.mission));$('panelSkills')&&($('panelSkills').onclick=()=>openSkills(p.kind==='tutorial'?'fire':facility(id).branch));$('gateBtn')&&($('gateBtn').onclick=()=>{const r=P.openGate(profile);if(r.ok){persist();closePanelQuiet();celebrate('gate',0,1,'The Outer Seal Gate rises',`The road into the complex is open · Fire skills unlocked · +${P.GATE.bonus[1]} starting Charge in every defense`)}});
 $('restoreBtn')&&($('restoreBtn').onclick=()=>restore(id));
 document.querySelectorAll('.pin').forEach(b=>b.classList.toggle('active',b.dataset.place===id));
 if(!keep)setTimeout(()=>$('panel').querySelector('button:not([disabled]):not(.panel-close)')?.focus(),30)}
function closePanel(){stopCue();$('panel').hidden=true;currentPanel=null;document.querySelectorAll('.pin').forEach(b=>b.classList.remove('active'));lastOpener?.focus?.()}
function restore(id){const r=P.restore(profile,id);if(!r.ok){toast('Not yet',r.reason);return}const f=facility(id),p=PLACES.find(p=>p.id===id);
 if(r.stage===1&&f.branch)toast(`${ELEMENT[f.branch].name} skills unlocked`,f.name);
 if(r.stage===3){toast(`${f.name} reawakened`,'RESTORATION COMPLETE');if(p.badge)award(p.badge)}
 persist();closePanelQuiet();celebrate(id,r.stage-1,r.stage,`${f.stages[r.stage-1]}`,`${f.name} · stage ${r.stage} of 3 · ${bonusText(f)}`)}
function closePanelQuiet(){$('panel').hidden=true;currentPanel=null}
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
$('openSettings').onclick=()=>{wireAmbienceControls();$('saveCode').value=saveCode();$('testMode').checked=testMode();$('testTools').hidden=!testMode();openOverlay('settings')};
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
 parts:['Restoration Parts','Earned by holding the Outer Seal (40 Parts for a first hold of level 1, more for each level) and by winning missions. Spend them to rebuild the ruined facilities. Each restored stage gives every tower a permanent bonus and the first stage opens that element\'s skills.'],
 resonance:['Resonance','Earned only in the Aetherheart Engine, at the heart of the complex: the deeper you hold there, the more you earn and the higher you rank. Spend it in Skills to make your towers stronger. You can reassign skills for free at any time.'],
 power:['Warden Power','The total of every bonus your towers carry from restorations and skills: damage, burning, range, speed and more. It applies everywhere: the tutorial, the campaign and endless. Select a tower in battle to see its own bonus.']};
function explain(key,anchor){const [t,d]=EXPLAIN[key];const box=$('explain');box.innerHTML=`<button class="panel-close" aria-label="Close">×</button><h3>${t}</h3><p>${d}</p>`;box.hidden=false;const r=anchor.getBoundingClientRect();box.style.left=Math.max(12,Math.min(innerWidth-332,r.left))+'px';box.style.top=(r.bottom+10)+'px';box.querySelector('button').onclick=()=>{box.hidden=true;anchor.focus()};box.querySelector('button').focus()}
document.querySelectorAll('[data-explain]').forEach(b=>b.onclick=()=>explain(b.dataset.explain,b));

const GUIDE=[
 {id:'outer',target:()=>document.querySelector('[data-place="outer"]'),title:'The gate is still sealed',text:'You held the training ground, but the Outer Seal\'s great gate is shut. Click the <b>Outer Seal</b>.',done:()=>currentPanel==='outer'||profile.gateOpen},
 {id:'gate',target:()=>$('gateBtn'),title:'Restore with Parts',text:'Restoration Parts rebuild the complex. Raise the gate to open the road inside. Every restoration also makes <b>every tower</b> a little stronger.',done:()=>!!profile.gateOpen,fallback:()=>openPanel('outer')},
 {id:'defend',target:()=>$('defendBtn'),title:'Hold the Outer Seal for Parts',text:'Now the gate must be defended. Monsters from the wilds try to break it, in levels that get a little tougher each time. <b>This is where you earn Parts early on.</b>',ack:'Got it',fallback:()=>openPanel('outer')},
 {id:'moonwell',target:()=>document.querySelector('[data-place="moonwell"]'),title:'Your first campaign mission',text:'The <b>Moonwell Cisterns</b> hold the first campaign missions. Open them.',done:()=>currentPanel==='moonwell'||!!profile.missions?.['moonwell-1']?.cleared},
 {id:'mission',target:()=>$('mission-moonwell-1'),title:'Missions open restorations',text:'Clear a mission to earn Parts <b>and</b> open the facility\'s next restoration stage. Restoring the Moonwell also wakes the Aetherheart Engine.',ack:'Got it',fallback:()=>openPanel('moonwell')},
 {id:'power',target:()=>document.querySelector('[data-explain="power"]'),title:'Your towers are stronger',text:'<b>Warden Power</b> shows the bonus your towers now carry, in every battle. Click any resource up here to see what it does.',ack:'Got it'},
 {id:'engine',target:()=>document.querySelector('[data-place="aetherheart"]'),title:'Resonance lives in the Engine',text:'Skills are bought with <b>Resonance</b>, and only the <b>Aetherheart Engine</b> gives it: the deeper you hold there, the more you earn and the higher you rank. Engine Trials arrive in the next build. Until then, hold the Outer Seal for Parts.',ack:'Start playing'}
];
let guideAnchor=null;
function guideStep(){const g=profile.hubGuide||0;return g<GUIDE.length?GUIDE[g]:null}
function advanceGuide(){profile.hubGuide=(profile.hubGuide||0)+1;persist();guideAnchor=null;tickGuide()}
function showIntro(){const s=seals(),earnedRes=(profile.resonance||0);const el=$('guideIntro');el.innerHTML=`<div class="overlay-card intro-card"><span class="eyebrow">THE OUTER SEAL HOLDS</span><h2 id="guideTitle">The Containment Complex</h2><p>Beyond the Outer Seal lies your home: an ancient complex in ruins. Between battles you rebuild it and grow your towers. Everything you earn here makes <b>every tower stronger in every battle</b>. First, its gate must be raised.</p><div class="intro-res"><div><i aria-hidden="true">⚙</i><b>Restoration Parts · ${profile.parts||0}</b><span>Rebuild the ruined facilities. Earned by holding the Outer Seal and winning missions.</span></div><div><i aria-hidden="true">✦</i><b>Resonance · ${earnedRes}</b><span>Learn skills that strengthen your towers. Earned only in the Aetherheart Engine.</span></div></div><p class="muted">You won ${['cleared','held','challenge'].filter(k=>s[k]).length} of 3 Seals on the tutorial (+${E.SEAL_PARTS} Parts each). Let's spend your first rewards.</p><p class="muted">New to Warden? The <b>📖 Guide</b> button (top right) explains towers, combos, enemies and the complex, with pictures.</p><div class="intro-actions"><button class="primary-btn" id="guideGo">Show me</button><button class="ghost" id="guideSkip">Skip the guide</button></div></div>`;el.hidden=false;$('guideGo').onclick=()=>{el.hidden=true;profile.hubGuide=0;profile.hubIntroSeen=true;persist();tickGuide()};$('guideSkip').onclick=()=>{el.hidden=true;profile.hubIntroSeen=true;profile.hubGuide=GUIDE.length;persist();tickGuide()};setTimeout(()=>$('guideGo').focus(),30)}
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
$('openHandbook')&&($('openHandbook').onclick=()=>WardenGuide.open());
$('openGuide').onclick=()=>{profile.hubGuide=0;profile.hubIntroSeen=false;persist();showIntro()};
setInterval(tickGuide,250);addEventListener('resize',tickGuide);
if(seals().cleared&&!profile.hubIntroSeen)setTimeout(showIntro,500);

// ---------- area sound: a short cue when you open an area -----------------------------------------
// User feedback (Oct 22): looping area sound was overbearing even one area at a time. Now opening an area plays
// its own sound once for about 3 seconds (soft fade in, fade out) and stops. Nothing loops. A restoration moment
// plays the same cue. Settings -> Sound -> Area sound volume / mute.
const AMB={moonwell:'water',emberheart:'fire',rimeglass:'ice',stormcrown:'storm',atelier:'gears'};
const CUE_LEN=3,CUE_IN=.3,CUE_OUT=.9;let cue=null;
function audioSettings(){try{return{master:.65,ambience:.35,masterMute:false,ambienceMute:false,...JSON.parse(localStorage.getItem('warden.settings.v1')||'{}')}}catch{return{master:.65,ambience:.35}}}
function stopCue(fast){if(!cue)return;const c=cue;cue=null;if(fast){c.a.pause();clearInterval(c.t);return}c.stopAt=Math.min(c.stopAt,performance.now()/1000+.25)}
function playAreaCue(id){const name=AMB[id];stopCue(true);if(!name||document.hidden)return;const s=audioSettings(),base=(s.masterMute||s.ambienceMute)?0:s.master*s.ambience;if(base<=0)return;
 const peak=Math.min(1,base*(.55+.12*stage(id))),a=new Audio(`assets/hub/ambience/amb-${name}.wav`);a.loop=false;a.volume=0;
 const start=performance.now()/1000,c={a,stopAt:start+CUE_LEN};c.t=setInterval(()=>{const now=performance.now()/1000,t=now-start,left=c.stopAt-now;
  const v=left<=0?0:peak*Math.min(1,t/CUE_IN,left/CUE_OUT);a.volume=Math.max(0,Math.min(1,v));if(left<=0){a.pause();clearInterval(c.t);if(cue===c)cue=null}},40);
 cue=c;a.play().catch(()=>{clearInterval(c.t);if(cue===c)cue=null})}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCue(true)});
function wireAmbienceControls(){const s=audioSettings();$('ambVol').value=s.ambience;$('ambMute').checked=!!s.ambienceMute;
 const write=()=>{const cur=(()=>{try{return JSON.parse(localStorage.getItem('warden.settings.v1')||'{}')}catch{return{}}})();cur.ambience=+$('ambVol').value;cur.ambienceMute=$('ambMute').checked;try{localStorage.setItem('warden.settings.v1',JSON.stringify(cur))}catch{}stopCue(true)};
 $('ambVol').oninput=write;$('ambMute').onchange=write}
