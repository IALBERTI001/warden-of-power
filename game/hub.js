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
 {id:'atelier',kind:'facility',x:61,y:70,mask:[935,690,220,165],text:'The Cogwright\'s workshop of gears and cranes. Restored, it gives every defense more Charge to start with and opens the Workshop, where spare Parts buy upgrades.'},
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
const TOME_SVG='<svg class="ico-tome" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 16.5h12.6v4H7z" fill="#fff3d6"/><path d="M8 17.8h11M8 19.2h11" stroke="#b89a6a" stroke-width=".7"/><path d="M7 1.8h11.1a1.5 1.5 0 0 1 1.5 1.5v13.4H7z" fill="currentColor"/><path d="M4.4 3.8a2 2 0 0 1 2-2H7.6v19.4H6.4a2 2 0 0 1-2-2z" fill="currentColor" opacity=".72"/><path d="M15.2 16.5v6.2l1.3-1.3 1.3 1.3v-6.2z" fill="#c8453a"/><path d="M13.3 4.8l3.1 4-3.1 4-3.1-4z" fill="#2a1d17"/><path d="M13.3 6.9l1.5 1.9-1.5 1.9-1.5-1.9z" fill="currentColor"/></svg>';
const C=globalThis.WardenCampaign;
function sectorMissions(f){return C?C.MISSIONS.filter(m=>m.sector===f):[]}
function missionState(m){const rec=profile.missions?.[m.id]||{},av=C.available(profile,m.id),painted=!!E.MAPS[m.id]?.painted;return{rec,av,painted,seals:['cleared','held','challenge'].filter(k=>rec[k]).length}}
function playMission(id){persist();location.href=`index.html?mission=${id}`}
function missionList(f){const ms=sectorMissions(f);const rows=ms.map(m=>{const st=missionState(m);const cls=st.rec.cleared?'held':st.av.ok?'next':'locked';return`<li class="${cls}"><div><b>${m.finale?'Finale':'Mission '+m.index} · ${escape(m.name)}</b>${st.rec.cleared?` <span class="held-tag">✓ Seals ${st.seals}/3</span>`:''}${!st.av.ok?`<small class="ready tone-hard">${escape(st.av.reason)}</small>`:!st.painted?'<small class="ready tone-warn">Map coming soon</small>':''}</div><button class="${st.av.ok&&!st.rec.cleared?'primary-btn':'hub-btn'}" id="mission-${m.id}" data-mission="${m.id}" ${st.av.ok&&st.painted?'':'disabled'}>${st.rec.cleared?'Replay':'▶ Play'}</button></li>`}).join('');
 const info=`<p>Win a mission to earn Parts. Each mission has three <b>Seals</b>, each paying +${C.SEAL_PARTS} Parts once: <b>Cleared</b>, <b>Held</b> (seal at 75% or more) and a <b>Challenge</b>. Replays pay only Seals you haven't earned.</p><ul class="hub-facts">${ms.map(m=>`<li><b>${m.finale?'Finale':'Mission '+m.index}</b>: ${m.waves} waves · first clear ${m.firstParts} Parts · Challenge: ${escape(m.challenge[1])}</li>`).join('')}</ul>`;
 return{rows:`<ul class="levels">${rows}</ul>`,info}}
// Short on Parts? Point to the optional Outer Seal defense (Oct 23 2026).
function shortOnParts(o){return o&&!o.ok&&/more Restoration Parts/.test(o.reason||'')&&profile.gateOpen?`<div class="short-parts"><p>Short on Parts? Hold the Outer Seal: a quick defense that pays Parts every level.</p><button class="hub-btn" data-goto-outer>▶ Hold the Outer Seal · Level ${outerNext()}</button></div>`:''}
// Engine Trials (Oct 23 2026): the only source of Resonance.
const EN=E.ENGINE;
function engineSection(){if(!EN.available(profile))return head('Engine Trials','engine',`<p>Resonance, which buys skills, is earned only here.</p>`)+`<p class="muted">🔒 Restore the <b>Moonwell Cisterns</b> to wake the Engine.</p>`;
 const best=profile.engineBest||0,lim=EN.limit(profile),nextM=Math.floor(best/5)+1,next=nextM*5,sv=engineRunInProgress();
 const info=`<p>A rising-wave defense with no fixed end. <b>Every 5 waves past your best banks Resonance at once</b>, and you keep it even if the seal breaks.</p>${Number.isFinite(lim)?`<p>Each restoration stage lets you go 10 waves deeper. Win the Finale to remove the limit.</p>`:''}<p>${best>=25?'<b>Overcharge:</b> Tier III towers can spend spare Charge for +15% damage per level.':'Defeat the <b>wave 25 Guardian</b> to unlock <b>Overcharge</b>: Tier III towers spend spare Charge for +15% damage per level.'}</p>`;
 return head('Engine Trials','engine',info)+`<ul class="levels"><li class="next"><div><b>Best: wave ${wfmt(best)}</b><small class="ready tone-ok">Next: wave ${next} · +${wfmt(EN.resonance(nextM))} ✦</small>${Number.isFinite(lim)?`<small>Limit: wave ${lim}</small>`:''}</div><button class="primary-btn" id="engineBtn" data-engine>${sv?`▶ Continue · wave ${sv.completed||0}`:'▶ Enter'}</button></li></ul>${ascensionBlock()}${powerBlock()}`}
function powerBlock(){const pw=P.powerRating(profile),tb=profile.tacticianBest;
 return`<div class="power-box"><p><span class="power-label">Warden Power</span> <b class="power-num">${wfmt(pw)}</b>${tb?` <small>· Best Tactician ×${tb} · ${P.tacticianRank(tb)}</small>`:''}</p>${eternalBlock()}</div>`}
function eternalBlock(){if(!P.ETERNAL.unlocked(profile))return'';const n=P.eternalRanks(profile),o=P.eternalOffer(profile);return`<div class="eternal"><div class="hub-h"><b>Eternal Mastery · ${n}/${P.ETERNAL.cap}</b>${qBtn('eternal','Eternal Mastery')}</div>${qBody('eternal',`<small>Every rank: +3% damage for every tower in Engine Trials (now ×${P.eternalFactor(profile).toFixed(2)}). After the Crown, every run pays Resonance for each 5 waves past 500, even below your best.</small>`)}${o.ok?`<span class="mastery-buy"><button class="hub-btn small" data-eternal="1">Buy rank · ${wfmt(o.cost)} ✦</button><button class="hub-btn small ghost" data-eternal="max">Max</button></span>`:`<em>${escape(o.reason)}</em>`}</div>`}
function buyEternalHub(max){let n=0;for(let k=0;k<(max?P.ETERNAL.cap:1);k++){const r=P.buyEternal(profile);if(!r.ok)break;n++}if(n){persist();toast(`Eternal Mastery +${n} (now ${P.eternalRanks(profile)}/${P.ETERNAL.cap})`,'ETERNAL MASTERY');render()}}
function ascensionBlock(){const A=EN&&E.ASCENSION;if(!A)return'';const r=A.rank(profile),best=profile.engineBest||0;if(r<1&&best<50)return'';const next=r<5?A.trials[r]:null;
 const powers=A.ranks.slice(1,r+1).map(x=>`<li><b>${x.roman==='V'?'♛':x.roman} · ${escape(x.power)}</b><small>${escape(x.text)}</small></li>`).join('');
 const cps=A.checkpoints(profile).filter(w=>w<EN.limit(profile));
 const info=`<p>Every hundred waves a <b>Warden Trial</b> guards the way: a crowned Guardian. Defeat it to <b>Ascend</b> for good: new power, a banner over the Engine, and a checkpoint to start from.</p>${r?`<p>Tower damage in Engine Trials ×${A.mult(r)}.</p><ul class="asc-powers">${powers}</ul>`:''}${cps.length?'<p>Checkpoint runs start with about half the Charge a full run would have by then.</p>':''}`;
 return`<div class="ascension-box rank-${r}">${head('Ascension','ascension',info)}${r?`<p><b>${escape(A.ranks[r].name)}</b> · ${escape(A.ranks[r].banner)}</p>`:''}
 ${next?`<p class="asc-next">Next: <b>Warden Trial ${['I','II','III','IV','V'][r]}</b> at wave ${next}${next===500?' · the Crown':''}</p>`:'<p class="asc-next"><b>The Crown of the Unbound is yours.</b></p>'}
 ${cps.length?`<div class="checkpoints"><small>Start from a checkpoint:</small><div>${cps.map(w=>`<button class="hub-btn small" data-checkpoint="${w}">▶ Wave ${w} · ${wfmt(E.ASCENSION.bank(w))} ◈</button>`).join('')}</div></div>`:''}</div>`}
function engineRunInProgress(){try{const sv=JSON.parse(localStorage.getItem('warden.run.engine.v1')||'null');return sv&&sv.status==='playing'?sv:null}catch{return null}}
function playEngine(start){persist();if(start){try{localStorage.removeItem('warden.run.engine.v1')}catch{}location.href='index.html?mission=engine&start='+start;return}location.href='index.html?mission=engine'}
function playOuter(L){persist();location.href=`index.html?mission=outer&level=${L}`}
const sealCount=()=>['cleared','held','challenge'].filter(k=>seals()[k]).length;
const bonusText=f=>f.bonus[0]==='damagePct'?`+${Math.round(f.bonus[1]*100)}% ${ELEMENT[f.branch].name} damage for every tower`:`+${f.bonus[1]} starting Charge in every defense`;
function award(id){if(!profile.earned[id]){profile.earned[id]=new Date().toISOString();const a=E.ACHIEVEMENTS.find(a=>a[0]===id);toast(a?a[1]:id,'BADGE UNLOCKED',id)}}
function toast(title,sub,badge){const el=document.createElement('div');el.className='toast'+(badge?' badge-toast':'');el.innerHTML=(badge?`<img class="toast-badge" src="${B.image(badge,128)}" alt="">`:'')+`<small></small><div></div>`;el.querySelector('small').textContent=sub;el.querySelector('div').textContent=title;$('toasts').append(el);while($('toasts').children.length>3)$('toasts').firstChild.remove();setTimeout(()=>el.remove(),5200)}
function escape(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c])}
// Info behind a "?" (Oct 24 2026): panels lead with play/upgrade buttons; explanations open on demand.
const infoOpen=(()=>{try{return JSON.parse(localStorage.getItem('warden.hubinfo.v1'))||{}}catch(e){return{}}})();
function qBtn(key,label){return`<button class="info-toggle hub-q" data-info="${key}" aria-expanded="${!!infoOpen[key]}" aria-label="About ${escape(label)}" title="About ${escape(label)}">?</button>`}
function qBody(key,html){return`<div class="hub-more" data-info-body="${key}"${infoOpen[key]?'':' hidden'}>${html}</div>`}
function head(title,key,html){return`<div class="hub-h"><h3>${title}</h3>${html?qBtn(key,title.replace(/<[^>]+>/g,'')):''}</div>${html?qBody(key,html):''}`}
function wireInfo(root){root.querySelectorAll('[data-info]').forEach(b=>b.onclick=()=>{const k=b.dataset.info,open=!infoOpen[k];infoOpen[k]=open;try{localStorage.setItem('warden.hubinfo.v1',JSON.stringify(infoOpen))}catch(e){}b.setAttribute('aria-expanded',String(open));root.querySelectorAll(`[data-info-body="${k}"]`).forEach(d=>d.hidden=!open);b.blur()})}

// ---------- pins + wallet + play-next ----------------------------------------------------------
function placeState(p){if(p.kind==='tutorial'){const n=sealCount();if(!profile.gateOpen){const o=P.gateOffer(profile);return{label:'Gate sealed · Raise it',tone:o.ok?'ready':'idle',ready:o.ok}}return{label:`Defend · earn Parts · Level ${outerNext()}`,tone:'ready'}}
 if(p.kind==='engine'){const n=['moonwell','emberheart','rimeglass','stormcrown'].filter(id=>stage(id)>=3).length;const fin=C&&C.available(profile,'aetherheart-1').ok;const awake=EN.available(profile);return{label:fin&&!profile.unboundOpen?'Finale ready':awake?`Engine Trials · best wave ${wfmt(profile.engineBest||0)}${E.ASCENSION.rank(profile)?' · '+E.ASCENSION.ranks[E.ASCENSION.rank(profile)].name:''}`:`Sealed · ${n}/4 facilities reawakened`,tone:fin&&!profile.unboundOpen?'ready':awake?'ready':'locked',ready:(fin&&!profile.unboundOpen)||(awake&&!(profile.engineBest>0))}}
 if(!profile.gateOpen)return{label:'Beyond the gate',tone:'locked',stage:0};const s=stage(p.id),o=P.restorationOffer(profile,p.id);const nm=C&&p.id!=='atelier'?sectorMissions(p.id).find(m=>!profile.missions?.[m.id]?.cleared&&C.available(profile,m.id).ok&&E.MAPS[m.id]?.painted):null;const ws=p.id==='atelier'&&P.WORKSHOP&&P.WORKSHOP.unlocked(profile);return{label:ws?'Workshop open':s>=3?'Reawakened':o.ok?`Restore · stage ${s+1}`:nm?`Mission ${nm.index} ready`:s?`Restoring · ${s}/3`:'Ruined',tone:s>=3?'ok':o.ok||nm?'ready':'idle',ready:o.ok||!!nm,stage:s}}
function render(){
 $('parts').textContent=wfmt(profile.parts||0);$('resonance').textContent=wfmt(profile.resonance||0);$('power').textContent=wfmt(P.powerRating(profile));for(const [id,min] of P.POWER_BADGES)if(P.powerRating(profile)>=min)award(id);
 const pins=$('pins');pins.innerHTML='';
 for(const p of PLACES){const st=placeState(p),el=placeEl(p);const b=document.createElement('button');b.className=`pin tone-${st.tone}`;b.style.left=p.x+'%';b.style.top=p.y+'%';b.style.setProperty('--el',ELEMENT[el].color);b.dataset.place=p.id;
  const pips=p.kind==='facility'?`<span class="pips" aria-hidden="true">${[1,2,3].map(i=>`<i class="${i<=st.stage?'on':''}"></i>`).join('')}</span>`:'';
  b.innerHTML=`<span class="pin-name">${escape(placeName(p))}</span><span class="pin-state">${st.ready?'<b class="pin-ready" aria-hidden="true">!</b> ':''}${escape(st.label)}</span>${pips}`;
  b.setAttribute('aria-label',`${placeName(p)}: ${st.label}${st.ready?'. A restoration is affordable.':''}`);b.onclick=()=>openPanel(p.id,b);pins.append(b)}
 const n=nextStep();$('playNext').innerHTML=`<small>NEXT STEP</small><span>${n.icon==='tome'?TOME_SVG+' ':''}${escape(n.label)}</span>`;$('playNext').onclick=n.go;
 if(currentPanel)openPanel(currentPanel,null,true);if(!$('skills').hidden)renderSkills();
 paint()}
function nextStep(){if(!seals().cleared)return{label:'▶ Play the tutorial',go:()=>play()};if(!profile.gateOpen){const o=P.gateOffer(profile);return o.ok?{label:`Raise the Outer Seal Gate · ${P.GATE.cost} Parts`,go:()=>openPanel('outer')}:{label:'▶ Replay the tutorial for Parts',go:()=>play()}}
 for(const id of ['moonwell','emberheart','rimeglass','stormcrown']){const o=P.restorationOffer(profile,id);if(o.ok)return{label:`Restore ${facility(id).name} · ${o.cost} Parts`,go:()=>openPanel(id)}}
 if(C){const m=C.MISSIONS.find(m=>!profile.missions?.[m.id]?.cleared&&C.available(profile,m.id).ok&&E.MAPS[m.id]?.painted);if(m)return{label:`▶ ${m.finale?'The finale':'Mission'} · ${m.name}`,go:()=>openPanel(m.finale?'aetherheart':m.sector)}}
 {const o=P.restorationOffer(profile,'atelier');if(o.ok)return{label:`Restore ${facility('atelier').name} · ${o.cost} Parts`,go:()=>openPanel('atelier')}}
 if(P.SKILLS.some(s=>P.skillOffer(profile,s.id).ok))return{label:'Learn new skills',icon:'tome',go:()=>openSkills()};
 if(P.WORKSHOP.unlocked(profile)&&['tooling',...P.WORKSHOP.upgrades.map(u=>u.id)].some(id=>P.workshopOffer(profile,id).ok))return{label:"⚙ Spend Parts at the Cogwright's Workshop",go:()=>openPanel('atelier')};
 if(EN.available(profile)&&(profile.engineBest||0)<Math.min(EN.limit(profile),500))return{label:`▶ Engine Trials · earn Resonance`,go:()=>openPanel('aetherheart')};
 if(!(profile.outer?.best))return{label:'▶ Hold the Outer Seal · Level 1 · earn Parts',go:()=>openPanel('outer')};
 return{label:`▶ Hold the Outer Seal · Level ${outerNext()}`,go:()=>openPanel('outer')}}
function play(){persist();location.href='index.html'}

// ---------- side panel -------------------------------------------------------------------------
// Cogwright's Workshop (approved Oct 24 2026): spend spare Parts once the Atelier is reawakened.
function workshopSection(){const W=P.WORKSHOP;if(!W)return'';if(!W.unlocked(profile))return`<h3>Cogwright's Workshop</h3><p class="muted">🔒 Fully reawaken the Atelier to open the Workshop.</p>`;
 const btn=(id,label)=>{const o=P.workshopOffer(profile,id);if(!o.ok&&!o.cost)return`<button class="hub-btn" disabled>${escape(label)}</button>`;return`<button class="${o.ok?'primary-btn':'hub-btn'}" data-ws="${id}" ${o.ok?'':'disabled'} title="${o.ok?'':escape(o.reason)}">${escape(label)} · ${wfmt(o.cost)} ⚙</button>`};
 const rows=W.upgrades.map(u=>{const n=P.workshopRank(profile,u.id),max=n>=W.max;const pips=Array.from({length:W.max},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('');return`<li class="${max?'held':''}"><div><b>${escape(u.name)}</b><span class="ws-pips" aria-label="${n} of ${W.max}">${pips}</span><small>${n?escape(u.short(n*u.per)):escape(u.text(u.per))}${n&&!max?` → ${escape(u.short((n+1)*u.per))}`:''}</small></div>${max?'<span class="held-tag">✓ Max</span>':btn(u.id,n?'Upgrade':'Build')}</li>`}).join('');
 const t=P.workshopRank(profile,'tooling');
 const tool=`<li class="next"><div><b>Precision Tooling${t?` · rank ${wfmt(t)}`:''}</b><small>${t?`Every tower +${t}% damage`:'+1% damage for every tower, per rank. No limit.'}</small></div>${btn('tooling','+1%')}</li>`;
 const info=`<p>Restoration Parts buy machinery here. Every upgrade is permanent and works in every defense: missions, the Outer Seal and the Engine.</p><p><b>Precision Tooling</b> has no limit: each rank adds +1% damage for every tower and costs a little more than the last.</p>`;
 return head("Cogwright's Workshop",'workshop',info)+`<ul class="levels workshop">${tool}${rows}</ul>`}
function buyWorkshopHub(id){const r=P.buyWorkshop(profile,id);if(!r.ok){toast('Not yet',r.reason);return}persist();const u=P.WORKSHOP.upgrades.find(u=>u.id===id);toast(id==='tooling'?`Precision Tooling rank ${r.rank}: every tower +${r.rank}% damage`:`${u.name} ${r.rank}/${P.WORKSHOP.max}: ${u.text(r.rank*u.per)}`,"COGWRIGHT'S WORKSHOP");render()}
let currentPanel=null,lastOpener=null;
function openPanel(id,opener,keep){const p=PLACES.find(p=>p.id===id);if(!keep&&currentPanel!==id)playAreaCue(id);currentPanel=id;if(opener)lastOpener=opener;const body=$('panelBody'),el=placeEl(p);
 const intro=p.kind==='tutorial'&&profile.gateOpen?'The south gate of the complex, raised and open. Everything that comes out of the wilds must get past you here.':p.text;
 let html=`<span class="eyebrow" style="color:${ELEMENT[el].color}">${p.kind==='facility'?ELEMENT[el].name.toUpperCase()+' FACILITY':p.kind==='engine'?'THE HEART OF THE COMPLEX':'THE SOUTH GATE'}</span><div class="hub-h title"><h2>${escape(placeName(p))}</h2>${qBtn('place-'+id,placeName(p))}</div>${qBody('place-'+id,`<p>${escape(intro)}</p>`)}`;
 if(p.kind==='tutorial'){const s=seals();const go=P.gateOffer(profile);
  if(profile.gateOpen){const next=outerNext(),best=profile.outer?.best||0;const levels=[next,...Array.from({length:Math.min(3,best)},(_,i)=>best-i)];
   html+=head('Hold the Outer Seal','outer',`<p>Monsters from the wilds try to break the gate. Hold all 8 waves to earn <b>Restoration Parts</b>. Each level is tougher and pays more.</p><p>From level 3 some monsters resist an element. Armour arrives at level 4, elites at level 6, and a boss guards every 5th level.</p><p>The raised gate gives +${P.GATE.bonus[1]} starting Charge in every defense.</p>`)+`<ul class="levels">${levels.map(L=>{const r=readiness(L),held=!!profile.outer?.cleared?.[L];return`<li class="${L===next?'next':'held'}"><div><b>Level ${L}</b>${held?' <span class="held-tag">✓ Held</span>':''}<small>${held?`${E.OUTER.replayParts(L)} Parts`:`${E.OUTER.firstParts(L)} Parts`}</small>${held?'':`<small class="ready tone-${r.tone}">${r.label}${E.OUTER.recommended(L)>E.OUTER.restorationCap?' · needs Engine skills':''}</small>`}</div><button class="${L===next?'primary-btn':'hub-btn'}" ${L===next?'id="defendBtn"':''} data-level="${L}">${L===next?'▶ Defend':'Replay'}</button></li>`}).join('')}</ul>`+head('Fire skills','fireskills',`<p>The gate's fire wards opened the Fire branch. Skills are bought with Resonance, which only the Aetherheart Engine gives.</p>`)+`<button class="hub-btn" id="panelSkills">Open Fire skills</button>`}
  else html+=head('The gate','gate',`<p>Raising it opens the road into the complex, the Outer Seal defense and the Fire skills, and gives +${P.GATE.bonus[1]} starting Charge in every defense.</p>`)+`<button class="primary-btn" id="gateBtn" ${go.ok?'':'disabled'}>Raise the gate · ${P.GATE.cost} Parts</button>${go.ok?'':`<p class="why">${escape(go.reason)}</p>`}`;
  html+=head('Training: the Broken Conduit','training',`<p>The tutorial: first clear 80 Parts, replays 20. Each Seal pays +${E.SEAL_PARTS} Parts once.</p>`)+`<button class="hub-btn" id="panelPlay">▶ Replay the tutorial</button><ul class="checklist compact">${[['cleared','Cleared'],['held','Held (75%+)'],['challenge','Freeze, chain and shatter']].map(([k,t])=>`<li class="${s[k]?'done':''}"><i aria-hidden="true">${s[k]?'✓':''}</i>${t}</li>`).join('')}</ul>`}
 else if(p.kind==='engine'){const list=['moonwell','emberheart','rimeglass','stormcrown'].map(id=>`<li class="${stage(id)>=3?'done':''}"><i aria-hidden="true">${stage(id)>=3?'✓':''}</i>Reawaken ${facility(id).name}</li>`).join('');
  if(C){const ml=missionList('aetherheart');html+=head('The finale','finale',`<p>Win the finale to open the Unbound Gate and remove the Engine's wave limit.</p>${profile.unboundOpen?'':`<ul class="checklist compact">${list}</ul>`}${ml.info}`)+ml.rows}
  html+=engineSection()}
 else{const f=facility(id),s=stage(id),o=P.restorationOffer(profile,id);
  if(C&&id!=='atelier'){const ml=missionList(id);html+=head('Missions','missions',`<p>Each mission you clear opens the next restoration stage here. ${escape(C.SECTORS[id].roleText)}</p>${ml.info}`)+ml.rows}
  if(id==='atelier'&&P.WORKSHOP.unlocked(profile))html+=workshopSection();
  html+=head('Restoration','restoration',`<p>Each stage: ${bonusText(f)}. The first stage opens the ${ELEMENT[f.branch].name} skills.</p>${id==='atelier'?"<p>Fully reawakened, it opens the <b>Cogwright's Workshop</b>, where spare Parts buy permanent upgrades.</p>":''}`);
  html+=s>=3?`<p class="reawakened">✓ Fully reawakened</p>`:`<button class="primary-btn" id="restoreBtn" ${o.ok?'':'disabled'}>Restore: ${escape(f.stages[s])} · ${f.costs[s]} Parts</button>${o.ok?'':`<p class="why">${escape(o.reason)}</p>${shortOnParts(o)}`}`;
  html+=`<ol class="stages compact">${f.stages.map((name,i)=>`<li class="${i<s?'done':i===s?'next':''}"><span class="stage-name">${i<s?'✓ ':''}${escape(name)}</span><span class="stage-cost">${i<s?'Done':f.costs[i]+' Parts'}</span></li>`).join('')}</ol>`;
  const unlocked=P.branchUnlocked(profile,f.branch);html+=`<h3>${ELEMENT[f.branch].name} skills</h3>${unlocked?`<button class="hub-btn" id="panelSkills">Open ${ELEMENT[f.branch].name} skills</button>`:`<p class="muted">🔒 Restore the first stage to open.</p>`}`}
 body.innerHTML=html;$('panel').hidden=false;wireInfo(body);
 $('panelPlay')&&($('panelPlay').onclick=play);body.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>playOuter(+b.dataset.level));body.querySelectorAll('[data-mission]').forEach(b=>b.onclick=()=>playMission(b.dataset.mission));body.querySelectorAll('[data-goto-outer]').forEach(b=>b.onclick=()=>openPanel('outer'));body.querySelectorAll('[data-engine]').forEach(b=>b.onclick=()=>playEngine());body.querySelectorAll('[data-eternal]').forEach(b=>b.onclick=()=>buyEternalHub(b.dataset.eternal==='max'));body.querySelectorAll('[data-checkpoint]').forEach(b=>b.onclick=()=>{const sv=engineRunInProgress();if(sv&&!b.dataset.armed){b.dataset.armed='1';b.textContent=`Abandon the run at wave ${sv.completed||0}? Click again`;return}playEngine(+b.dataset.checkpoint)});$('panelSkills')&&($('panelSkills').onclick=()=>openSkills(p.kind==='tutorial'?'fire':facility(id).branch));$('gateBtn')&&($('gateBtn').onclick=()=>{const r=P.openGate(profile);if(r.ok){persist();closePanelQuiet();celebrate('gate',0,1,'The Outer Seal Gate rises',`The road into the complex is open · Fire skills unlocked · +${P.GATE.bonus[1]} starting Charge in every defense`)}});
 $('restoreBtn')&&($('restoreBtn').onclick=()=>restore(id));body.querySelectorAll('[data-ws]').forEach(b=>b.onclick=()=>buyWorkshopHub(b.dataset.ws));
 document.querySelectorAll('.pin').forEach(b=>b.classList.toggle('active',b.dataset.place===id));
 if(!keep)setTimeout(()=>($('panel').querySelector('.primary-btn:not([disabled])')||$('panel').querySelector('button:not([disabled]):not(.panel-close):not(.hub-q)'))?.focus(),30)}
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
function skillCtx(){return{get profile(){return profile},get sel(){return selectedSkill},set sel(v){selectedSkill=v},$,persist,toast,after:render,sound:skillSound,context:'hub'}}
function skillSound(kind){try{if(kind==='branch'){playFanfare();return}const st=audioSettings();if(st.masterMute)return;const a=new Audio('../previews/audio-v3/tier_up.wav');a.volume=Math.max(0,Math.min(1,st.master*(kind==='max'?.9:.6)));a.play().catch(()=>{})}catch(e){}}
function renderSkills(){WardenSkillTree.render(skillCtx())}
$('openSkills').onclick=()=>openSkills();
if($('openFeedback')&&window.WardenFeedback)$('openFeedback').onclick=()=>WardenFeedback.open();
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
function closeOverlays(){let closed=false;for(const id of ['skills','badges','settings','record'])if(!$(id).hidden){$(id).hidden=true;closed=true}if(closed)(overlayOpener||skillOpener)?.focus?.();return closed}
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
 power:['Warden Power','Your strength as a Warden. It grows with everything you restore, learn and master.']};
function explain(key,anchor){const [t,d]=typeof EXPLAIN[key]==='function'?EXPLAIN[key]():EXPLAIN[key];const box=$('explain');box.innerHTML=`<button class="panel-close" aria-label="Close">×</button><h3>${t}</h3><p>${d}</p>`;box.hidden=false;const r=anchor.getBoundingClientRect();box.style.left=Math.max(12,Math.min(innerWidth-332,r.left))+'px';box.style.top=(r.bottom+10)+'px';box.querySelector('button').onclick=()=>{box.hidden=true;anchor.focus()};box.querySelector('button').focus()}
document.querySelectorAll('[data-explain]').forEach(b=>b.onclick=()=>explain(b.dataset.explain,b));

const GUIDE=[
 {id:'outer',target:()=>document.querySelector('[data-place="outer"]'),title:'The gate is still sealed',text:'You held the training ground, but the Outer Seal\'s great gate is shut. Click the <b>Outer Seal</b>.',done:()=>currentPanel==='outer'||profile.gateOpen},
 {id:'gate',target:()=>$('gateBtn'),title:'Restore with Parts',text:'Restoration Parts rebuild the complex. Raise the gate to open the road inside. Every restoration also makes <b>every tower</b> a little stronger.',done:()=>!!profile.gateOpen,fallback:()=>openPanel('outer')},
 {id:'defend',target:()=>$('defendBtn'),title:'Hold the Outer Seal for Parts',text:'Now the gate must be defended. Monsters from the wilds try to break it, in levels that get a little tougher each time. <b>This is where you earn Parts early on.</b>',ack:'Got it',fallback:()=>openPanel('outer')},
 {id:'moonwell',target:()=>document.querySelector('[data-place="moonwell"]'),title:'Your first campaign mission',text:'The <b>Moonwell Cisterns</b> hold the first campaign missions. Open them.',done:()=>currentPanel==='moonwell'||!!profile.missions?.['moonwell-1']?.cleared},
 {id:'mission',target:()=>$('mission-moonwell-1'),title:'Missions open restorations',text:'Clear a mission to earn Parts <b>and</b> open the facility\'s next restoration stage. Restoring the Moonwell also wakes the Aetherheart Engine.',ack:'Got it',fallback:()=>openPanel('moonwell')},
 {id:'power',target:()=>document.querySelector('[data-explain="power"]'),title:'Your towers are stronger',text:'<b>Warden Power</b> grows with every restoration and skill. Click any resource up here to see what it does.',ack:'Got it'},
 {id:'engine',target:()=>document.querySelector('[data-place="aetherheart"]'),title:'Resonance lives in the Engine',text:'Skills are bought with <b>Resonance</b>, and only the <b>Aetherheart Engine</b> gives it: the deeper you hold there, the more you earn and the higher you rank. Once the Moonwell\'s first stage is restored, enter <b>Engine Trials</b> here to earn it.',ack:'Start playing'}
];
let guideAnchor=null;
function guideStep(){const g=profile.hubGuide||0;return g<GUIDE.length?GUIDE[g]:null}
function advanceGuide(){profile.hubGuide=(profile.hubGuide||0)+1;persist();guideAnchor=null;tickGuide()}
function showIntro(){const s=seals(),earnedRes=(profile.resonance||0);const el=$('guideIntro');el.innerHTML=`<div class="overlay-card intro-card"><span class="eyebrow">THE OUTER SEAL HOLDS</span><h2 id="guideTitle">The Containment Complex</h2><p>Beyond the Outer Seal lies your home: an ancient complex in ruins. Between battles you rebuild it and grow your towers. Everything you earn here makes <b>every tower stronger in every battle</b>. First, its gate must be raised.</p><div class="intro-res"><div><i aria-hidden="true">⚙</i><b>Restoration Parts · ${wfmt(profile.parts||0)}</b><span>Rebuild the ruined facilities. Earned by holding the Outer Seal and winning missions.</span></div><div><i aria-hidden="true">✦</i><b>Resonance · ${earnedRes}</b><span>Learn skills that strengthen your towers. Earned only in the Aetherheart Engine.</span></div></div><p class="muted">You won ${['cleared','held','challenge'].filter(k=>s[k]).length} of 3 Seals on the tutorial (+${E.SEAL_PARTS} Parts each). Let's spend your first rewards.</p><p class="muted">New to Warden? The <b>📖 Guide</b> button (top right) explains towers, combos, enemies and the complex, with pictures.</p><div class="intro-actions"><button class="primary-btn" id="guideGo">Show me</button><button class="ghost" id="guideSkip">Skip the guide</button></div></div>`;el.hidden=false;$('guideGo').onclick=()=>{el.hidden=true;profile.hubGuide=0;profile.hubIntroSeen=true;persist();tickGuide()};$('guideSkip').onclick=()=>{el.hidden=true;profile.hubIntroSeen=true;profile.hubGuide=GUIDE.length;persist();tickGuide()};setTimeout(()=>$('guideGo').focus(),30)}
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
// Center the complex (Oct 24 2026): the painting puts the Aetherheart Engine and the gate at 41.7% of its width,
// with open grass on the right. With no panel open, slide the map right (within the side margins) so the complex
// sits in the middle of the screen; when a panel opens, slide back so the grass sits under the panel.
(function centerComplex(){const frame=$('mapFrame'),panel=$('panel');if(!frame||!panel)return;const AXIS=.417;
 const place=()=>{const W=frame.getBoundingClientRect().width,vw=innerWidth,room=Math.max(0,(vw-W)/2);const want=panel.hidden?W*(.5-AXIS):0;frame.style.setProperty('--shift',Math.round(Math.min(want,room))+'px')};
 new MutationObserver(place).observe(panel,{attributes:true,attributeFilter:['hidden']});addEventListener('resize',place);place()})();

// Best-wave pride badge (Oct 24 2026): a medal plaque under the title and a shareable record card.
function renderBest(){const b=$('bestPlaque'),best=profile.engineBest||0;if(!b||!window.WardenRecord)return;b.hidden=best<1;if(best<1)return;const t=WardenRecord.tierOf(best,profile);
 $('bestWave').textContent=wfmt(best);placeBest();$('bestTier').textContent=t.name;b.dataset.tier=t.id;const draw=()=>WardenRecord.plaque($('bestMedal'),best,profile,true);draw();document.fonts&&document.fonts.ready.then(draw)}
function openRecord(){const c=$('recordCard');openOverlay('record');const draw=()=>WardenRecord.card(c,profile,E,P);draw();document.fonts&&document.fonts.ready.then(draw);$('recordStatus').textContent='';
 const best=profile.engineBest||0,t=WardenRecord.tierOf(best,profile);
 $('recordSave').onclick=()=>{try{c.toBlob(bl=>{const a=document.createElement('a');a.href=URL.createObjectURL(bl);a.download=`warden-of-power-wave-${best}.png`;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500);$('recordStatus').textContent='Saved. Share it with your friends!'},'image/png')}catch(e){$('recordStatus').textContent='Could not save the picture in this browser.'}};
 $('recordCopy').onclick=async()=>{const text=`I held wave ${wfmt(best)} in the Aetherheart Engine in Warden of Power. ${t.name}. Can you hold deeper?`;try{await navigator.clipboard.writeText(text);$('recordStatus').textContent='Copied. Paste it anywhere!'}catch(e){$('recordStatus').textContent=text}}}
if($('bestPlaque'))$('bestPlaque').onclick=openRecord;
function placeBest(){const b=$('bestPlaque'),top=document.querySelector('.hub-top');if(!b||!top)return;b.style.top=Math.round(top.getBoundingClientRect().bottom+10)+'px'}addEventListener('resize',placeBest);document.fonts&&document.fonts.ready.then(placeBest);
{const _render=render;render=function(){_render.apply(this,arguments);try{renderBest()}catch(e){}}}
renderBest();
