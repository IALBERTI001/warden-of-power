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
 {id:'aetherheart',kind:'engine',name:'Aetherheart Engine',x:41.7,y:24,el:'engineering',text:'The sealed heart of the complex. When all four elemental facilities are reawakened, the final mission opens; clearing it unseals the Unbound Gate to endless waves.'}
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
Promise.all([['ruined','assets/hub/hub-ruined.jpg'],['restored','assets/hub/hub-restored.jpg']].map(([k,src])=>new Promise((ok,bad)=>{const i=new Image();i.onload=()=>{img[k]=i;ok()};i.onerror=()=>bad(src);i.src=src}))).then(()=>HubFX.init(canvas,img.ruined,img.restored)).then(()=>{ready=true;paint();ascensionMoment()}).catch(src=>{toast('Could not load the hub painting',String(src))});
function sceneState(){const s={gate:profile.gateOpen?1:0,aetherheart:profile.earned?.eternal_thousand&&profile.thousandthSeen?6:Math.max(0,Math.min(5,profile.ascensionSeen??(profile.ascension||0)))};for(const id of ['moonwell','emberheart','rimeglass','stormcrown','atelier'])s[id]=stage(id);return s}
function paint(){if(ready&&!HubFX.isPlaying())HubFX.setState(sceneState())}
// The restoration moment: pins step aside, the area is rebuilt on screen, a banner names what changed.
function celebrate(id,from,to,title,line,eyebrow='RESTORED'){if(!ready){render();return}document.body.classList.add('moment');const banner=$('momentBanner');banner.innerHTML=`<span class="eyebrow">${eyebrow}</span><h3></h3><p></p><small>Click or press any key to skip</small>`;banner.querySelector('h3').textContent=title;banner.querySelector('p').textContent=line;banner.hidden=true;
 setTimeout(()=>{if(HubFX.isPlaying())banner.hidden=false},reducedMotion?0:1500);
 if(id==='aetherheart')playFanfare();else playAreaCue(id);
 HubFX.playMoment(id,from,to,()=>{banner.hidden=true;document.body.classList.remove('moment');render()})}
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Ascension moment in the hub: the first visit after a Warden Trial raises the new banners over the Engine.
function ascensionMoment(){if(profile.earned?.eternal_thousand&&!profile.thousandthSeen){profile.thousandthSeen=true;persist();celebrate('aetherheart',5,6,'Warden Eternal','The crown above the Aetherheart Engine turns white-gold. No Warden was ever meant to stand here.','THE THOUSANDTH WAVE');return}const r=E.ASCENSION.rank(profile),seen=Math.max(0,Math.min(5,profile.ascensionSeen??0));if(r<=seen){if(profile.ascensionSeen===undefined&&r===0)return;if(profile.ascensionSeen!==r){profile.ascensionSeen=r;persist()}return}
 const A=E.ASCENSION.ranks[r];profile.ascensionSeen=r;persist();
 celebrate('aetherheart',seen,r,A.name,r<5?`${A.banner} now fly over the Aetherheart Engine. New power: ${A.power}.`:'The Crown of the Unbound floats above the Aetherheart Engine.',r<5?'ASCENDED':'CROWNED')}
const skip=()=>{if(HubFX.isPlaying())HubFX.skipMoment()};
addEventListener('keydown',e=>{if(HubFX.isPlaying()){e.preventDefault();e.stopImmediatePropagation();skip()}},true);
addEventListener('pointerdown',e=>{if(HubFX.isPlaying()){e.preventDefault();e.stopPropagation();skip()}},true);

// ---------- helpers -----------------------------------------------------------------------------
const stage=id=>Math.min(3,profile.restorations?.[id]||0);
const seals=()=>profile.seals?.tutorial||{};
const outerNext=()=>(profile.outer?.best||0)+1;
function outerRec(L){return P.legacyToRating(E.OUTER.recommended(L))}
function readiness(L){const have=P.powerRating(profile),need=outerRec(L);return have>=need?{label:'Ready',tone:'ok'}:have>=need/1.25?{label:'Tough',tone:'warn'}:{label:'Very hard',tone:'hard'}}
const C=globalThis.WardenCampaign;
function sectorMissions(f){return C?C.MISSIONS.filter(m=>m.sector===f):[]}
function missionState(m){const rec=profile.missions?.[m.id]||{},av=C.available(profile,m.id),painted=!!E.MAPS[m.id]?.painted;return{rec,av,painted,seals:['cleared','held','challenge'].filter(k=>rec[k]).length}}
function playMission(id){persist();location.href=`index.html?mission=${id}`}
function missionList(f){return`<ul class="levels">${sectorMissions(f).map(m=>{const st=missionState(m);const cls=st.rec.cleared?'held':st.av.ok?'next':'locked';return`<li class="${cls}"><div><b>${m.finale?'Finale':'Mission '+m.index} · ${escape(m.name)}</b>${st.rec.cleared?` <span class="held-tag">✓ Cleared · Seals ${st.seals}/3</span>`:''}<small>${m.waves} waves · first clear ${m.firstParts} Parts · each Seal +${C.SEAL_PARTS} once · replays pay only Seals you haven't earned</small><small>Seals: Cleared · Held (75%+) · ${escape(m.challenge[1])}</small>${!st.av.ok?`<small class="ready tone-hard">${escape(st.av.reason)}</small>`:!st.painted?'<small class="ready tone-warn">The map is still being painted.</small>':''}</div><button class="${st.av.ok&&!st.rec.cleared?'primary-btn':'hub-btn'}" id="mission-${m.id}" data-mission="${m.id}" ${st.av.ok&&st.painted?'':'disabled'}>${st.rec.cleared?'Replay':'▶ Play'}</button></li>`}).join('')}</ul>`}
// Short on Parts? Point to the optional Outer Seal defense (Oct 23 2026).
function shortOnParts(o){return o&&!o.ok&&/more Restoration Parts/.test(o.reason||'')&&profile.gateOpen?`<div class="short-parts"><p>Short on Parts? Hold the Outer Seal: a quick defense that pays Parts every level.</p><button class="hub-btn" data-goto-outer>▶ Hold the Outer Seal · Level ${outerNext()}</button></div>`:''}
// Engine Trials (Oct 23 2026): the only source of Resonance.
const EN=E.ENGINE;
function engineSection(){if(!EN.available(profile))return`<h3>Engine Trials</h3><p>Resonance, which buys skills, is earned only here. Restore the <b>Moonwell Cisterns</b> to its first stage to wake the Engine.</p>`;
 const best=profile.engineBest||0,lim=EN.limit(profile),nextM=Math.floor(best/5)+1,next=nextM*5;
 return`<h3>Engine Trials</h3><p>A rising-wave defense with no fixed end. <b>Every 5 waves past your best banks Resonance at once</b>, and you keep it even if the seal breaks.</p><ul class="levels"><li class="next stack"><div><b>Best depth: wave ${best}</b><small>Run limit: ${Number.isFinite(lim)?`wave ${lim} (+10 for every restoration stage; the finale removes it)`:'none: the Unbound Gate is open'}</small><small class="ready tone-ok">Next: wave ${next} banks ${EN.resonance(nextM)} Resonance</small></div><button class="primary-btn" id="engineBtn" data-engine ${Number.isFinite(lim)&&best>=lim?'':''}> ${(()=>{const sv=engineRunInProgress();return sv?`▶ Continue run · wave ${sv.completed||0}`:'▶ Enter the Engine'})()}</button></li></ul>${powerBlock()}${ascensionBlock()}<p class="muted">${best>=25?'<b>Overcharge unlocked:</b> in the Engine, Tier III towers can spend spare Charge for +15% damage per level.':'🔒 Defeat the <b>wave 25 Guardian</b> to unlock <b>Overcharge</b>: Tier III towers spend spare Charge for +15% damage per level.'}</p>`}
function powerBlock(){const pw=P.powerRating(profile),proj=P.projectedDepth(profile),tb=profile.tacticianBest;const r=E.ASCENSION.rank(profile);const next=r<5?E.ASCENSION.trials[r]:null;
 return`<h3>Your Warden Power</h3><div class="power-box"><p><b class="power-num">${pw.toLocaleString()}</b> <small>(100 = a fresh Warden)</small></p><p>With standard play this reaches about <b>wave ${proj}</b>.${tb?` Best Tactician <b>×${tb}</b> · ${P.tacticianRank(tb)}.`:''}</p>${next?`<p class="muted">Warden Trial at wave ${next}: recommended power <b>${P.powerForDepth(next+5).toLocaleString()}</b> with standard play${tb&&tb>1?`, about ${Math.round(P.powerForDepth(next+5)/tb).toLocaleString()} at your Tactician rating`:''}.</p>`:''}${eternalBlock()}</div>`}
function eternalBlock(){if(!P.ETERNAL.unlocked(profile))return'';const n=P.eternalRanks(profile),o=P.eternalOffer(profile);return`<div class="eternal"><b>Eternal Mastery · ${n}/${P.ETERNAL.cap}</b><small>Every rank: +3% damage for every tower in Engine Trials (now ×${P.eternalFactor(profile).toFixed(2)}). After the Crown, every run pays Resonance for each 5 waves past 500, even below your best.</small>${o.ok?`<span class="mastery-buy"><button class="hub-btn small" data-eternal="1">Buy rank · ${o.cost.toLocaleString()} ✦</button><button class="hub-btn small ghost" data-eternal="max">Max</button></span>`:`<em>${escape(o.reason)}</em>`}</div>`}
function buyEternalHub(max){let n=0;for(let k=0;k<(max?P.ETERNAL.cap:1);k++){const r=P.buyEternal(profile);if(!r.ok)break;n++}if(n){persist();toast(`Eternal Mastery +${n} (now ${P.eternalRanks(profile)}/${P.ETERNAL.cap})`,'ETERNAL MASTERY');render()}}
function ascensionBlock(){const A=EN&&E.ASCENSION;if(!A)return'';const r=A.rank(profile),best=profile.engineBest||0;if(r<1&&best<50)return'';const next=r<5?A.trials[r]:null;
 const powers=A.ranks.slice(1,r+1).map(x=>`<li><b>${x.roman==='V'?'♛':x.roman} · ${escape(x.power)}</b><small>${escape(x.text)}</small></li>`).join('');
 const cps=A.checkpoints(profile).filter(w=>w<EN.limit(profile));
 return`<h3>Ascension</h3><div class="ascension-box rank-${r}">${r?`<p><b>${escape(A.ranks[r].name)}</b> · ${escape(A.ranks[r].banner)} fly over the Engine. Tower damage in Engine Trials ×${A.mult(r)}.</p><ul class="asc-powers">${powers}</ul>`:'<p>Every hundred waves a <b>Warden Trial</b> guards the way: a crowned Guardian. Defeat it to <b>Ascend</b> for good: new power, a banner over the Engine, and a checkpoint to start from.</p>'}
 ${next?`<p class="asc-next">Next: <b>Warden Trial ${['I','II','III','IV','V'][r]}</b> at wave ${next}${next===500?' · the Crown':''}</p>`:'<p class="asc-next"><b>The Crown of the Unbound is yours.</b> Keep climbing as deep as you dare.</p>'}
 ${cps.length?`<div class="checkpoints"><small>Start a run from an ascended checkpoint (you start with ${'about half'} the Charge a full run would have by then):</small><div>${cps.map(w=>`<button class="hub-btn small" data-checkpoint="${w}">▶ Wave ${w} · ${E.ASCENSION.bank(w).toLocaleString()} ◈</button>`).join('')}</div></div>`:''}</div>`}
function engineRunInProgress(){try{const sv=JSON.parse(localStorage.getItem('warden.run.engine.v1')||'null');return sv&&sv.status==='playing'?sv:null}catch{return null}}
function playEngine(start){persist();if(start){try{localStorage.removeItem('warden.run.engine.v1')}catch{}location.href='index.html?mission=engine&start='+start;return}location.href='index.html?mission=engine'}
function playOuter(L){persist();location.href=`index.html?mission=outer&level=${L}`}
const sealCount=()=>['cleared','held','challenge'].filter(k=>seals()[k]).length;
const bonusText=f=>f.bonus[0]==='damagePct'?`+${Math.round(f.bonus[1]*100)}% ${ELEMENT[f.branch].name} damage for every tower`:`+${f.bonus[1]} starting Charge in every defense`;
function award(id){if(!profile.earned[id]){profile.earned[id]=new Date().toISOString();const a=E.ACHIEVEMENTS.find(a=>a[0]===id);toast(a?a[1]:id,'BADGE UNLOCKED',id)}}
function toast(title,sub,badge){const el=document.createElement('div');el.className='toast'+(badge?' badge-toast':'');el.innerHTML=(badge?`<img class="toast-badge" src="${B.image(badge,128)}" alt="">`:'')+`<small></small><div></div>`;el.querySelector('small').textContent=sub;el.querySelector('div').textContent=title;$('toasts').append(el);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>el.remove(),5200)}
function escape(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])}

// ---------- pins + wallet + play-next ----------------------------------------------------------
function placeState(p){if(p.kind==='tutorial'){const n=sealCount();if(!profile.gateOpen){const o=P.gateOffer(profile);return{label:'Gate sealed · Raise it',tone:o.ok?'ready':'idle',ready:o.ok}}return{label:`Defend · earn Parts · Level ${outerNext()}`,tone:'ready'}}
 if(p.kind==='engine'){const n=['moonwell','emberheart','rimeglass','stormcrown'].filter(id=>stage(id)>=3).length;const fin=C&&C.available(profile,'aetherheart-1').ok;const awake=EN.available(profile);return{label:fin&&!profile.unboundOpen?'Finale ready':awake?`Engine Trials · best wave ${profile.engineBest||0}${E.ASCENSION.rank(profile)?' · '+E.ASCENSION.ranks[E.ASCENSION.rank(profile)].name:''}`:`Sealed · ${n}/4 facilities reawakened`,tone:fin&&!profile.unboundOpen?'ready':awake?'ready':'locked',ready:(fin&&!profile.unboundOpen)||(awake&&!(profile.engineBest>0))}}
 if(!profile.gateOpen)return{label:'Beyond the gate',tone:'locked',stage:0};const s=stage(p.id),o=P.restorationOffer(profile,p.id);const nm=C&&p.id!=='atelier'?sectorMissions(p.id).find(m=>!profile.missions?.[m.id]?.cleared&&C.available(profile,m.id).ok&&E.MAPS[m.id]?.painted):null;return{label:s>=3?'Reawakened':o.ok?`Restore · stage ${s+1}`:nm?`Mission ${nm.index} ready`:s?`Restoring · ${s}/3`:'Ruined',tone:s>=3?'ok':o.ok||nm?'ready':'idle',ready:o.ok||!!nm,stage:s}}
function render(){
 $('parts').textContent=profile.parts||0;$('resonance').textContent=profile.resonance||0;$('power').textContent=P.powerRating(profile).toLocaleString();for(const [id,min] of P.POWER_BADGES)if(P.powerRating(profile)>=min)award(id);
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
 if(EN.available(profile)&&(profile.engineBest||0)<Math.min(EN.limit(profile),500))return{label:`▶ Engine Trials · earn Resonance`,go:()=>openPanel('aetherheart')};
 if(!(profile.outer?.best))return{label:'▶ Hold the Outer Seal · Level 1 · earn Parts',go:()=>openPanel('outer')};
 return{label:`▶ Hold the Outer Seal · Level ${outerNext()}`,go:()=>openPanel('outer')}}
function play(){persist();location.href='index.html'}

// ---------- side panel -------------------------------------------------------------------------
let currentPanel=null,lastOpener=null;
function openPanel(id,opener,keep){const p=PLACES.find(p=>p.id===id);if(!keep&&currentPanel!==id)playAreaCue(id);currentPanel=id;if(opener)lastOpener=opener;const body=$('panelBody'),el=placeEl(p);
 let html=`<span class="eyebrow" style="color:${ELEMENT[el].color}">${p.kind==='facility'?ELEMENT[el].name.toUpperCase()+' FACILITY':p.kind==='engine'?'THE HEART OF THE COMPLEX':'THE SOUTH GATE'}</span><h2>${escape(placeName(p))}</h2><p>${escape(p.kind==='tutorial'&&profile.gateOpen?'The south gate of the complex, raised and open. Everything that comes out of the wilds must get past you here.':p.text)}</p>`;
 if(p.kind==='tutorial'){const s=seals();const go=P.gateOffer(profile);
  if(profile.gateOpen){const next=outerNext(),best=profile.outer?.best||0,power=P.powerRating(profile);const levels=[next,...Array.from({length:Math.min(3,best)},(_,i)=>best-i)];
   html+=`<p class="reawakened">The gate is raised. +${P.GATE.bonus[1]} starting Charge in every defense.</p><h3>Hold the Outer Seal</h3><p>Monsters from the wilds try to break the gate. Hold all 8 waves to earn <b>Restoration Parts</b>. Each level is about 15% tougher and pays more. This is where you earn Parts early on.</p><ul class="levels">${levels.map(L=>{const r=readiness(L),held=!!profile.outer?.cleared?.[L];return`<li class="${L===next?'next':'held'}"><div><b>Level ${L}</b>${held?' <span class="held-tag">✓ Held</span>':''}<small>${held?`Replay: ${E.OUTER.replayParts(L)} Parts`:`First hold: ${E.OUTER.firstParts(L)} Parts · replays ${E.OUTER.replayParts(L)}`}</small><small class="ready tone-${r.tone}">${r.label} · recommended Warden Power ${outerRec(L).toLocaleString()} · yours ${power.toLocaleString()}${E.OUTER.recommended(L)>E.OUTER.restorationCap?' · needs skills from the Engine':''}</small></div><button class="${L===next?'primary-btn':'hub-btn'}" ${L===next?'id="defendBtn"':''} data-level="${L}">${L===next?'▶ Defend':'Replay'}</button></li>`}).join('')}</ul><p class="muted">From level 3 some monsters are attuned to an element and resist it. Armour arrives at level 4, elites at level 6, and a boss guards every 5th level.</p><h3>Fire skills</h3><p>The gate's fire wards opened the Fire branch. Skills are bought with Resonance, which only the Aetherheart Engine gives.</p><button class="hub-btn" id="panelSkills">Open Fire skills</button>`}
  else html+=`<h3>The gate</h3><ol class="stages"><li class="next"><span class="stage-name">${P.GATE.stage}</span><span class="stage-cost">${P.GATE.cost} Parts</span><span class="stage-bonus">Opens the road into the complex, the Outer Seal defense and the Fire skills · +${P.GATE.bonus[1]} starting Charge in every defense</span></li></ol><button class="primary-btn" id="gateBtn" ${go.ok?'':'disabled'}>Raise the gate · ${P.GATE.cost} Parts</button>${go.ok?'':`<p class="why">${escape(go.reason)}</p>`}`;
  html+=`<h3>Training: the Broken Conduit</h3><ul class="checklist">${[['cleared','Cleared: win all five waves'],['held','Held: win with the seal at 75% or more'],['challenge','Challenge: trigger freeze, chain and shatter in one attempt']].map(([k,t])=>`<li class="${s[k]?'done':''}"><i aria-hidden="true">${s[k]?'✓':''}</i>${t}${s[k]?'':` <em>+${E.SEAL_PARTS} Parts</em>`}</li>`).join('')}</ul><p class="muted">The tutorial: first clear 80 Parts, replays 20.</p><button class="hub-btn" id="panelPlay">▶ Replay the tutorial</button>`}
 else if(p.kind==='engine'){const list=['moonwell','emberheart','rimeglass','stormcrown'].map(id=>`<li class="${stage(id)>=3?'done':''}"><i aria-hidden="true">${stage(id)>=3?'✓':''}</i>Reawaken ${facility(id).name}</li>`).join('');html+=engineSection()+(C?`<h3>The finale</h3>${missionList('aetherheart')}`:'')+`<h3>To unseal the Unbound Gate</h3><ul class="checklist">${list}<li class="${profile.unboundOpen?'done':''}"><i aria-hidden="true">${profile.unboundOpen?'✓':''}</i>Win the Aetherheart finale</li></ul>`}
 else{const f=facility(id),s=stage(id),o=P.restorationOffer(profile,id);
  if(C&&id!=='atelier')html+=`<h3>Missions</h3><p>Each mission you clear opens the next restoration stage here. ${escape(C.SECTORS[id].roleText)}</p>${missionList(id)}`;
  html+=`<h3>Restoration</h3><ol class="stages">${f.stages.map((name,i)=>`<li class="${i<s?'done':i===s?'next':''}"><span class="stage-name">${i<s?'✓ ':''}${escape(name)}</span><span class="stage-cost">${i<s?'Done':f.costs[i]+' Parts'}</span><span class="stage-bonus">${bonusText(f)}</span></li>`).join('')}</ol>`;
  html+=s>=3?`<p class="reawakened">Fully reawakened. Its bonus strengthens every tower, in every mode.</p>`:`<button class="primary-btn" id="restoreBtn" ${o.ok?'':'disabled'}>Restore: ${escape(f.stages[s])} · ${f.costs[s]} Parts</button>${o.ok?'':`<p class="why">${escape(o.reason)}</p>${shortOnParts(o)}`}`;
  const unlocked=P.branchUnlocked(profile,f.branch);html+=`<h3>${ELEMENT[f.branch].name} skills</h3>${unlocked?`<p>The ${ELEMENT[f.branch].name} branch of the skill tree is open.</p><button class="hub-btn" id="panelSkills">Open ${ELEMENT[f.branch].name} skills</button>`:`<p class="muted">Restore the first stage to open the ${ELEMENT[f.branch].name} branch of the skill tree.</p>`}`}
 body.innerHTML=html;$('panel').hidden=false;
 $('panelPlay')&&($('panelPlay').onclick=play);body.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>playOuter(+b.dataset.level));body.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>playMission(b.dataset.mission));body.querySelectorAll('[data-goto-outer]').forEach(b=>b.onclick=()=>openPanel('outer'));body.querySelectorAll('[data-engine]').forEach(b=>b.onclick=()=>playEngine());body.querySelectorAll('[data-eternal]').forEach(b=>b.onclick=()=>buyEternalHub(b.dataset.eternal==='max'));body.querySelectorAll('[data-checkpoint]').forEach(b=>b.onclick=()=>{const sv=engineRunInProgress();if(sv&&!b.dataset.armed){b.dataset.armed='1';b.textContent=`Abandon the run at wave ${sv.completed||0}? Click again`;return}playEngine(+b.dataset.checkpoint)});$('panelSkills')&&($('panelSkills').onclick=()=>openSkills(p.kind==='tutorial'?'fire':facility(id).branch));$('gateBtn')&&($('gateBtn').onclick=()=>{const r=P.openGate(profile);if(r.ok){persist();closePanelQuiet();celebrate('gate',0,1,'The Outer Seal Gate rises',`The road into the complex is open · Fire skills unlocked · +${P.GATE.bonus[1]} starting Charge in every defense`)}});
 $('restoreBtn')&&($('restoreBtn').onclick=()=>restore(id));
 document.querySelectorAll('.pin').forEach(b=>b.classList.toggle('active',b.dataset.place===id));
 if(!keep)setTimeout(()=>$('panel').querySelector('button:not([disabled]):not(.panel-close)')?.focus(),30)}
function closePanel(){$('panel').hidden=true;currentPanel=null;document.querySelectorAll('.pin').forEach(b=>b.classList.remove('active'));lastOpener?.focus?.()}
function restore(id){const r=P.restore(profile,id);if(!r.ok){toast('Not yet',r.reason);return}const f=facility(id),p=PLACES.find(p=>p.id===id);
 if(r.stage===1&&f.branch)toast(`${ELEMENT[f.branch].name} skills unlocked`,f.name);
 if(r.stage===3){toast(`${f.name} reawakened`,'RESTORATION COMPLETE');if(p.badge)award(p.badge)}
 persist();closePanelQuiet();celebrate(id,r.stage-1,r.stage,`${f.stages[r.stage-1]}`,`${f.name} · stage ${r.stage} of 3 · ${bonusText(f)}`)}
function closePanelQuiet(){$('panel').hidden=true;currentPanel=null}
document.querySelector('[data-close-panel]').onclick=closePanel;

// ---------- skill tree ------------------------------------------------------------------------
const EFFECT=WardenSkillTree.EFFECT,effectAt=WardenSkillTree.effectAt;
let selectedSkill=null,skillOpener=null;
function openSkills(branch){skillOpener=document.activeElement;$('skills').hidden=false;if(branch){const first=P.SKILLS.find(s=>s.branch===branch&&P.rank(profile,s.id)<s.maxRank)||P.SKILLS.find(s=>s.branch===branch);selectedSkill=first.id}else if(!selectedSkill)selectedSkill=(P.SKILLS.find(s=>P.skillOffer(profile,s.id).ok)||P.SKILLS[0]).id;renderSkills();setTimeout(()=>document.querySelector(`[data-skill="${selectedSkill}"]`)?.focus(),30)}
function nodeState(s){return WardenSkillTree.nodeState(skillCtx(),s)}
function skillCtx(){return{get profile(){return profile},get sel(){return selectedSkill},set sel(v){selectedSkill=v},$,persist,toast,after:render,context:'hub'}}
function renderSkills(){WardenSkillTree.render(skillCtx())}
$('openSkills').onclick=()=>openSkills();
let resetArmed=false;$('resetSkills').onclick=()=>{const spent=P.SKILLS.some(s=>P.rank(profile,s.id));if(!spent){toast('Nothing to reassign','You have not learned any skills yet.');return}if(!resetArmed){resetArmed=true;$('resetSkills').textContent='Click again to refund every skill';setTimeout(()=>{resetArmed=false;$('resetSkills').textContent='Reassign all (free)'},4000);return}resetArmed=false;$('resetSkills').textContent='Reassign all (free)';const back=P.resetSkills(profile);persist();toast(`${back} Resonance refunded`,'SKILLS REASSIGNED');render();renderSkills()};

// ---------- badges ----------------------------------------------------------------------------
function renderBadges(){const count=Object.keys(profile.earned).filter(id=>E.ACHIEVEMENTS.some(a=>a[0]===id)).length;$('badgeSummary').textContent=`${count} / ${B.publicTotal(E.ACHIEVEMENTS)} earned`;
 $('achievementList').innerHTML=B.listed(E.ACHIEVEMENTS,profile).map(([id,name,desc])=>{const earned=profile.earned[id],tier=B.tier(id),prog=B.progress(id,profile),equipped=profile.equipped===id;const status=earned?'Earned '+new Date(earned).toLocaleDateString():B.available(id)?(prog?`${prog.value} / ${prog.goal}`:'Available now'):'Requires later maps / endless';return`<article class="achievement ${earned?'earned':'locked'} tier-${tier}"><div class="badge-slot"><img class="badge-art ${earned?'':'is-locked'}" src="${B.image(id,256)}" alt="" width="96" height="96" loading="lazy">${earned?'':'<span class="badge-lock" aria-hidden="true">🔒</span>'}</div><div class="badge-text"><strong>${escape(name)}</strong><span class="badge-tier">${B.TIER_LABEL[tier]} · ${earned?'Earned':'Locked'}</span><p>${escape(desc)}</p>${prog&&!earned?`<div class="badge-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${prog.goal}" aria-valuenow="${prog.value}"><i style="width:${prog.value/prog.goal*100}%"></i></div>`:''}<small>${status}</small>${earned?`<button class="badge-equip" data-equip="${id}" aria-pressed="${equipped}">${equipped?'Shown on your profile':'Show on profile'}</button>`:''}</div></article>`}).join('');
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
 power:()=>['Warden Power',`Your true strength. <b>100 is a fresh Warden</b>; ${P.powerRating(profile).toLocaleString()} means your towers can handle enemies ${(P.powerRating(profile)/100).toLocaleString(undefined,{maximumFractionDigits:1})}× as tough. It counts restorations, skills, Mastery, Ascension and Eternal Mastery, each weighted by how much it was measured to help.<br><br>With <b>standard play</b> this power reaches about <b>wave ${P.projectedDepth(profile)}</b> in Engine Trials.${profile.tacticianBest?` Your best <b>Tactician</b> rating is ×${profile.tacticianBest} (${P.tacticianRank(profile.tacticianBest)}): how far beyond standard play your placement, combos and timing carried you.`:' Finish an Engine run to earn a <b>Tactician</b> rating: how far your placement, combos and timing carry you beyond standard play.'}`]};
function explain(key,anchor){const [t,d]=typeof EXPLAIN[key]==='function'?EXPLAIN[key]():EXPLAIN[key];const box=$('explain');box.innerHTML=`<button class="panel-close" aria-label="Close">×</button><h3>${t}</h3><p>${d}</p>`;box.hidden=false;const r=anchor.getBoundingClientRect();box.style.left=Math.max(12,Math.min(innerWidth-332,r.left))+'px';box.style.top=(r.bottom+10)+'px';box.querySelector('button').onclick=()=>{box.hidden=true;anchor.focus()};box.querySelector('button').focus()}
document.querySelectorAll('[data-explain]').forEach(b=>b.onclick=()=>explain(b.dataset.explain,b));

const GUIDE=[
 {id:'outer',target:()=>document.querySelector('[data-place="outer"]'),title:'The gate is still sealed',text:'You held the training ground, but the Outer Seal\'s great gate is shut. Click the <b>Outer Seal</b>.',done:()=>currentPanel==='outer'||profile.gateOpen},
 {id:'gate',target:()=>$('gateBtn'),title:'Restore with Parts',text:'Restoration Parts rebuild the complex. Raise the gate to open the road inside. Every restoration also makes <b>every tower</b> a little stronger.',done:()=>!!profile.gateOpen,fallback:()=>openPanel('outer')},
 {id:'defend',target:()=>$('defendBtn'),title:'Hold the Outer Seal for Parts',text:'Now the gate must be defended. Monsters from the wilds try to break it, in levels that get a little tougher each time. <b>This is where you earn Parts early on.</b>',ack:'Got it',fallback:()=>openPanel('outer')},
 {id:'moonwell',target:()=>document.querySelector('[data-place="moonwell"]'),title:'Your first campaign mission',text:'The <b>Moonwell Cisterns</b> hold the first campaign missions. Open them.',done:()=>currentPanel==='moonwell'||!!profile.missions?.['moonwell-1']?.cleared},
 {id:'mission',target:()=>$('mission-moonwell-1'),title:'Missions open restorations',text:'Clear a mission to earn Parts <b>and</b> open the facility\'s next restoration stage. Restoring the Moonwell also wakes the Aetherheart Engine.',ack:'Got it',fallback:()=>openPanel('moonwell')},
 {id:'power',target:()=>document.querySelector('[data-explain="power"]'),title:'Your towers are stronger',text:'<b>Warden Power</b> is your true strength: 100 is a fresh Warden, and every restoration and skill raises it. Click any resource up here to see what it does.',ack:'Got it'},
 {id:'engine',target:()=>document.querySelector('[data-place="aetherheart"]'),title:'Resonance lives in the Engine',text:'Skills are bought with <b>Resonance</b>, and only the <b>Aetherheart Engine</b> gives it: the deeper you hold there, the more you earn and the higher you rank. Once the Moonwell\'s first stage is restored, enter <b>Engine Trials</b> here to earn it.',ack:'Start playing'}
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
const CUE_LEN=3.5,CUE_IN=.3,CUE_OUT=.9;let cue=null;
function audioSettings(){try{return{master:.65,ambience:.35,masterMute:false,ambienceMute:false,...JSON.parse(localStorage.getItem('warden.settings.v1')||'{}')}}catch{return{master:.65,ambience:.35}}}
function stopCue(fast){if(!cue)return;const c=cue;cue=null;if(fast){c.a.pause();clearInterval(c.t);return}c.stopAt=Math.min(c.stopAt,performance.now()/1000+.25)}
function playFanfare(){try{const st=audioSettings();if(st.masterMute)return;const a=new Audio('assets/audio/ascension.wav');a.volume=Math.max(0,Math.min(1,st.master*.9));a.play().catch(()=>{})}catch{}}
function playAreaCue(id){const name=AMB[id];stopCue(true);if(!name||document.hidden)return;const s=audioSettings(),base=(s.masterMute||s.ambienceMute)?0:s.master*s.ambience;if(base<=0)return;
 const peak=Math.min(1,base*(.55+.12*stage(id))),a=new Audio(`assets/hub/ambience/amb-${name}.wav`);a.loop=false;a.volume=0;
 const start=performance.now()/1000,c={a,stopAt:start+CUE_LEN};c.t=setInterval(()=>{const now=performance.now()/1000,t=now-start,left=c.stopAt-now;
  const v=left<=0?0:peak*Math.min(1,t/CUE_IN,left/CUE_OUT);a.volume=Math.max(0,Math.min(1,v));if(left<=0){a.pause();clearInterval(c.t);if(cue===c)cue=null}},40);
 cue=c;a.play().catch(()=>{clearInterval(c.t);if(cue===c)cue=null})}
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopCue(true)});
function wireAmbienceControls(){const s=audioSettings();$('ambVol').value=s.ambience;$('ambMute').checked=!!s.ambienceMute;
 const write=()=>{const cur=(()=>{try{return JSON.parse(localStorage.getItem('warden.settings.v1')||'{}')}catch{return{}}})();cur.ambience=+$('ambVol').value;cur.ambienceMute=$('ambMute').checked;try{localStorage.setItem('warden.settings.v1',JSON.stringify(cur))}catch{}stopCue(true)};
 $('ambVol').oninput=write;$('ambMute').onchange=write}
