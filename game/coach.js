// Warden coach: in-world tutorial layer (approved Oct 22 2026; default).
// Teaches one real action at a time: objective tracker, anchored Warden callouts,
// suggested build spot with ghost tower, wave intro cards and first-combo celebrations.
// Oct 28 2026 (CrazyGames Strategy Field Study): the player is dropped in. A Fire tower already stands and
// wave 1 is already marching; the first decision is an upgrade the game points at. New elements arrive as
// short banners instead of briefing cards, and combo goals are quests that pay Charge.
// After the opening it never buys, upgrades, sells or starts a wave on the player's behalf.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WardenCoach=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

// ---- pure lesson plan (unit-testable, no DOM) --------------------------------
const LESSONS=[
 {title:'Fire & Burning',goals:[['upgrade','Upgrade your Fire tower'],['hold1','Hold wave 1']]}, /* Oct 28: dropped in, the first decision is an upgrade */
 {title:'Water + Ice',goals:[['water','Build Water on the glowing spot'],['ice','Build Ice beside it'],['freeze','Freeze a golem',40]]},
 {title:'Lightning',goals:[['lightning','Build Lightning near Water'],['conduction','Chain lightning through a crowd',40]]},
 {title:'Shatter',goals:[['shatter','Shatter a frozen enemy with Fire',60]]},
 {title:'Your Elemental Defense',goals:[['complete','Hold all five waves']]}
];
const INTROS=[
 {eyebrow:'WAVE 1 OF 5 · FIRST DEFENSE',title:'Fire & Burning',text:'Slimes creep out of the forest. Fire burns them.',recipe:[['tower','fire'],['=',null],['result','BURN','fire']],enemy:['slime','6 slimes'],button:"Let's begin"},
 {eyebrow:'NEW ELEMENTS · WAVE 2',title:'Hold the Line',text:'Soak golems with Water, then freeze them with Ice.',recipe:[['tower','water'],['+',null],['tower','ice'],['=',null],['result','FREEZE','ice']],enemy:['golem','5 stone golems'],button:"Let's build"},
 {eyebrow:'NEW ELEMENT · WAVE 3',title:'Connected Crowds',text:'Lightning leaps through soaked enemies.',recipe:[['tower','water'],['+',null],['tower','lightning'],['=',null],['result','CHAIN','lightning']],enemy:['beetle','14 swarming foes'],button:"Let's build"},
 {eyebrow:'NEW COMBO · WAVE 4',title:'Shatter',text:'Hit a frozen golem with Fire to shatter it.',recipe:[['tower','ice'],['+',null],['tower','fire'],['=',null],['result','SHATTER','fire']],enemy:['golem','6 stone golems'],button:"Let's build"},
 {eyebrow:'FINAL WAVE',title:'Your Elemental Defense',text:'Everything at once. Hold the seal!',recipe:[['tower','fire'],['tower','water'],['tower','ice'],['tower','lightning']],enemy:['mixed','16 mixed enemies'],button:'Ready'}
];
function lessonIndex(game){const busy=game.spawnQueue.length>0||game.enemies.some(e=>e.alive);return Math.max(0,Math.min(LESSONS.length-1,busy?game.wave-1:game.wave))}
function goalDone(id,game,guide){if(id==='upgrade')return !!guide.done.upgrade||game.towers.some(t=>t.tier>1);if(id==='hold1')return game.completed>=1;if(id==='complete')return game.status==='won';return !!guide.done[id]}
function plan(game,guide){const index=lessonIndex(game),lesson=LESSONS[index];const goals=lesson.goals.map(([id,label,reward])=>({id,label,reward:reward||0,done:goalDone(id,game,guide)}));const step=goals.find(g=>!g.done)||null;return{index,title:lesson.title,goals,step,busy:game.spawnQueue.length>0||game.enemies.some(e=>e.alive)}}
function introDue(game,guide){if(game.status!=='playing'||game.wave>=INTROS.length)return null;if(game.spawnQueue.length||game.enemies.some(e=>e.alive))return null;return guide.done['intro_'+game.wave]?null:game.wave}

// ---- browser layer ----------------------------------------------------------
function install(){
 if(typeof document==='undefined'||typeof game==='undefined')return null;
 document.body.classList.add('tut-v2');
 const stage=document.getElementById('gameStage'),canvasEl=document.getElementById('battle');
 const el=(tag,cls,html)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(html!==undefined)e.innerHTML=html;return e};
 // Book becomes optional reference: closed on first visit to the new tutorial.
 if(!settings.coachV2Seen){settings.coachV2Seen=true;settings.guide=false;store('warden.settings.v1',settings);refresh()}

 const tracker=el('section','coach-tracker');tracker.setAttribute('aria-label','Tutorial objectives');stage.append(tracker);
 const callout=el('div','coach-callout');callout.setAttribute('role','status');callout.hidden=true;stage.append(callout);
 const intro=el('div','coach-intro');intro.hidden=true;intro.setAttribute('role','dialog');intro.setAttribute('aria-label','Wave briefing');stage.append(intro);
 let collapsed=false,dismissed={},pops=[],slowUntil=0,clock=0,lastKey='',introShown=null,dropAt=0,bannerUntil=0;
 const hand=el('div','coach-hand');hand.setAttribute('aria-hidden','true');hand.innerHTML='<svg viewBox="0 0 48 56" width="40" height="46"><path d="M18 4c3 0 5 2 5 5v15l3-1c3-1 5 1 6 2l2-1c3-1 5 1 6 3l1 0c3 0 5 2 5 5v8c0 8-6 14-14 14h-4c-5 0-9-2-12-6L6 36c-2-2-1-5 1-6 2-2 5-1 7 1l1 1V9c0-3 0-5 3-5z" fill="#fff6e2" stroke="#2a1d17" stroke-width="3" stroke-linejoin="round"/></svg>';hand.hidden=true;stage.append(hand);

 const SPOTS=game.map.id==='outer'?{place:{x:370,y:290},water:{x:175,y:330},ice:{x:305,y:330},lightning:{x:175,y:240}}:{place:{x:210,y:310}}; /* QA Oct 28: a glowing spot for every new tower, near the entrance so the first freeze comes fast */
 const spotFor=()=>{const s=plan(game,guide).step;return s&&SPOTS[s.id]&&!game.towers.some(t=>Math.hypot(t.x-SPOTS[s.id].x,t.y-SPOTS[s.id].y)<40)?{id:s.id,...SPOTS[s.id]}:null};
 const TOWER_RECTS={fire:[20,0,340,457],water:[390,35,325,420],lightning:[755,0,310,457],ice:[1100,40,348,415]};
 const ENEMY_RECTS={slime:[40,515,315,270],beetle:[395,560,300,220],golem:[705,465,360,330]};
 const COLORS={fire:'#ff9a3c',water:'#5fd2ef',ice:'#a9e6ff',lightning:'#c79bff'};
 function sprite(rect,h){const c=document.createElement('canvas');const w=Math.round(h*rect[2]/rect[3]);c.width=w*2;c.height=h*2;c.style.width=w+'px';c.style.height=h+'px';const x=c.getContext('2d');if(art.base)x.drawImage(art.base,...rect,0,0,w*2,h*2);return c}
 const key=a=>keys[a]===' '?'Space':String(keys[a]).toUpperCase();
 const kbd=a=>`<kbd class="coach-key">${key(a)}</kbd>`;

 /* Oct 28: the stage may be CSS-scaled on small windows; convert screen pixels back to stage pixels */
 const k=()=>{const s=stage.getBoundingClientRect();return stage.offsetWidth?s.width/stage.offsetWidth:1};
 function worldToStage(x,y){const r=canvasEl.getBoundingClientRect(),s=stage.getBoundingClientRect(),p=WardenGround.project(x,y),f=k();return{x:(r.left-s.left+(p.x*VIEW.scale+VIEW.x)*r.width/1000)/f,y:(r.top-s.top+(p.y*VIEW.scale+VIEW.y)*r.height/600)/f}}
 function rectOf(node){if(!node)return null;const r=node.getBoundingClientRect(),s=stage.getBoundingClientRect(),f=k();if(!r.width&&!r.height)return null;return{left:(r.left-s.left)/f,top:(r.top-s.top)/f,right:(r.right-s.left)/f,bottom:(r.bottom-s.top)/f,width:r.width/f,height:r.height/f}}
 const fireTower=()=>game.towers.find(t=>t.type==='fire')||game.towers[0];
 const selectedTower=()=>game.towers.find(t=>t.id===selected);
 const inspectorOpen=()=>!document.querySelector('.inspector').hidden;

 // What to say and where to point, for the current step.
 function message(p){
  const s=p.step;if(!s)return null;const t=selectedTower();const need=type=>Math.max(0,E.TYPES[type].cost-Math.floor(game.charge));
  const towerAnchor=tw=>tw?{world:{x:tw.x,y:tw.y-80}}:null;
  switch(s.id){
   case 'place':return{title:'Light the first defense',text:`Pick <b class="el-fire">Fire</b> ${kbd('fire')} and build on the glowing spot.`,anchor:{world:{x:SPOTS.place.x+38,y:SPOTS.place.y-40}},side:'right'};
   case 'inspect':return{title:'Take command',text:'Click your Fire tower to open its command panel.',anchor:towerAnchor(fireTower()),side:'right'};
   case 'upgrade':{if(t&&inspectorOpen()&&document.getElementById('upgradeOne'))return{title:'Upgrade it!',text:`Press ${kbd('upgrade')} or click.`,anchor:{node:'#upgradeOne'},side:'auto',hand:true};const ft=fireTower();if(!ft)return null;const cost=game.upgradeCost(ft),short=Math.max(0,cost-Math.floor(game.charge));/* Oct 28: one button on the hint, no panel full of stats */return{title:'Upgrade it!',text:short?`<span class="coach-need">Need ${short} more Charge.</span>`:'',anchor:towerAnchor(ft),side:'right',hand:!short,handAt:{node:'.coach-callout .coach-act'},action:{label:`Tier II · ${cost} ◈`,disabled:!!short,run:()=>{const keep=selected;selected=ft.id;upgrade();selected=keep===ft.id?null:keep;refresh()}}}}
   case 'hold1':return null;
   case 'target':return t&&inspectorOpen()&&document.getElementById('targetMode')?{title:'Choose your target',text:`Pick who it attacks first ${kbd('target')}. The badge above every tower shows its choice.`,anchor:{node:'#targetMode'},side:'auto'}:{title:'Choose your target',text:'Select a tower to change what it attacks.',anchor:towerAnchor(fireTower()),side:'right'};
   case 'sellView':return{title:'You can change your mind',text:'Selling returns all Charge if the tower never fired, and 75% after it has. Selling is optional.',anchor:t&&inspectorOpen()&&document.getElementById('sellTower')?{node:'#sellTower'}:towerAnchor(fireTower()),side:'auto',ack:'Got it'};
   case 'wave':return{title:'Defend the seal',text:`Start the wave ${kbd('next')}. Faster: 2× ${kbd('double')} or 5× ${kbd('fast')}.`,anchor:{node:'#next'},side:'above'};
   case 'water':case 'ice':case 'lightning':{const type=s.id,n=need(type);const where=type==='water'?'beside the road':type==='ice'?'so its range overlaps Water':'near Water';const sp=SPOTS[type];return{title:`New: ${E.TYPES[type].name}!`,text:`Build it ${kbd(type)} ${sp?'on the glow':where}.`+(n?` <span class="coach-need">Need ${n} more Charge.</span>`:''),anchor:sp?{world:{x:sp.x+38,y:sp.y-40}}:{node:`[data-type="${type}"]`},side:sp?'right':'above',hand:true,handAt:sp?{world:{x:sp.x,y:sp.y}}:null}}
   case 'freeze':case 'conduction':case 'shatter':case 'complete':{if(p.busy)return null;const w=game.wave+1;const watch={freeze:'watch Water and Ice freeze a golem',conduction:'watch lightning leap through the soaked crowd',shatter:'freeze a golem, then let Fire shatter it',complete:'combine everything you have learned'}[s.id];return{title:`Wave ${w}`,text:`Send it ${kbd('next')}`,anchor:{node:'#next'},side:'above',hand:true}}
  }return null}

 function fadeTracker(){const r=rectOf(tracker);if(!r)return;const pts=game.towers.map(t=>worldToStage(t.x,t.y-30));{const SP=spotFor();if(SP)pts.push(worldToStage(SP.x,SP.y))}if(hover&&buildType)pts.push(worldToStage(hover.x,hover.y));const over=pts.some(q=>q.x>r.left-30&&q.x<r.right+30&&q.y>r.top-20&&q.y<r.bottom+60);tracker.classList.toggle('faded',over)}
 function renderTracker(p){const html=`<button class="coach-collapse" aria-label="${collapsed?'Expand':'Collapse'} objectives">${collapsed?'▸':'▾'}</button><span class="coach-eyebrow">TUTORIAL · WAVE ${p.index+1} OF 5</span><h3>${p.title}</h3>${collapsed?'':`<ul>${p.goals.map(g=>`<li class="${g.done?'done':g===p.step?'now':''}"><i aria-hidden="true"></i>${g.label}${g.reward?` <em class="coach-reward">+${g.reward} ◈</em>`:''}</li>`).join('')}</ul>`}<div class="coach-pips">${[0,1,2,3,4].map(i=>`<b class="${i<game.completed?'on':i===p.index?'cur':''}"></b>`).join('')}</div>`;if(tracker.dataset.html!==html){tracker.dataset.html=html;tracker.innerHTML=html;tracker.querySelector('.coach-collapse').onclick=()=>{collapsed=!collapsed;tracker.dataset.html=''}}}

 function place(box,anchor,side){
  const W=box.offsetWidth,H=box.offsetHeight,sw=stage.clientWidth,sh=stage.clientHeight;let x,y,arrow;
  if(anchor.world){const p=worldToStage(anchor.world.x,anchor.world.y);if(side==='right'&&p.x+24+W<sw-10){x=p.x+24;y=p.y-H/2;arrow='left'}else{x=p.x-24-W;y=p.y-H/2;arrow='right'}}
  else{const r=rectOf(document.querySelector(anchor.node));if(!r)return false;if(side==='above'){x=r.left+r.width/2-W/2;y=r.top-H-18;arrow='down'}else{if(r.left>sw/2){x=r.left-W-20;arrow='right'}else{x=r.right+20;arrow='left'}y=r.top+r.height/2-H/2}}
  const dock=rectOf(document.querySelector('.command-dock')),floor=(side==='above'||!dock)?sh-10:dock.top-8;x=Math.max(10,Math.min(sw-W-10,x));y=Math.max(70,Math.min(floor-H,y));box.style.left=x+'px';box.style.top=y+'px';box.dataset.arrow=arrow;
  if(arrow==='down'){const r=rectOf(document.querySelector(anchor.node));box.style.setProperty('--arrow-x',Math.max(20,Math.min(W-20,r.left+r.width/2-x))+'px')}else{const target=anchor.world?worldToStage(anchor.world.x,anchor.world.y).y:(()=>{const r=rectOf(document.querySelector(anchor.node));return r.top+r.height/2})();box.style.setProperty('--arrow-y',Math.max(18,Math.min(H-18,target-y))+'px')}
  return true}

 function renderHand(m){if(!m||!m.hand){hand.hidden=true;return}const at=m.handAt||m.anchor;let x,y;if(at.world){const q=worldToStage(at.world.x,at.world.y);x=q.x;y=q.y}else{const r=rectOf(document.querySelector(at.node));if(!r){hand.hidden=true;return}x=r.left+r.width*.84;y=r.top+r.height*.62}hand.style.left=x+'px';hand.style.top=y+'px';hand.hidden=false}
 function renderCallout(p){const m=introShown===null&&!modalPaused?message(p):null;const id=p.step?.id;renderHand(m&&!dismissed[id]?m:null);
  if(!m||dismissed[id]||!m.anchor){callout.hidden=true;lastKey='';return}
  const k=id+'|'+m.title+'|'+m.text+'|'+(m.action?m.action.label+m.action.disabled:'');if(k!==lastKey){lastKey=k;callout.innerHTML=`<div class="coach-face" aria-hidden="true">✦</div><button class="coach-x" aria-label="Hide this hint">×</button><h4>${m.title}</h4>${m.text?`<p>${m.text}</p>`:''}${m.ack?`<button class="coach-ack">${m.ack}</button>`:''}${m.action?`<button class="coach-act primary" ${m.action.disabled?'disabled':''}>${m.action.label} <kbd class="coach-key">${key('upgrade')}</kbd></button>`:''}`;const act=callout.querySelector('.coach-act');if(act)act.onclick=()=>{m.action.run();lastKey=''};callout.__act=m.action||null;callout.querySelector('.coach-x').onclick=()=>{dismissed[id]=true;callout.hidden=true};const ack=callout.querySelector('.coach-ack');if(ack)ack.onclick=()=>{guide.record(id);save();refresh();lastKey=''}}
  callout.hidden=false;if(!place(callout,m.anchor,m.side))callout.hidden=true}

 function renderIntro(){if(bannerUntil&&clock>bannerUntil){bannerUntil=0;intro.hidden=true}const due=introDue(game,guide);if(due===null||modalPaused)return;
  guide.record('intro_'+due);save();if(due===0)return;const c=INTROS[due];intro.innerHTML='';intro.classList.add('coach-banner');bannerUntil=clock+4.5;
  const card=el('div','coach-intro-card');card.append(el('span','coach-eyebrow',c.eyebrow),el('h2','',c.title));
  const recipe=el('div','coach-recipe');for(const [kind,a,b] of c.recipe){if(kind==='tower'){const wrap=el('figure','coach-tower');wrap.append(sprite(TOWER_RECTS[a],92),el('figcaption','',E.TYPES[a].name));recipe.append(wrap)}else if(kind==='result')recipe.append(el('span',`coach-result el-bg-${b}`,a));else recipe.append(el('span','coach-op',kind))}card.append(recipe);
  const foe=el('div','coach-foes');const kinds=c.enemy[0]==='mixed'?['slime','beetle','golem']:[c.enemy[0]];for(const k of kinds)foe.append(sprite(ENEMY_RECTS[k],46));foe.append(el('span','',c.enemy[1]+' incoming'));card.append(foe);
  intro.append(card);intro.hidden=false}

 const hook={
  timeScale(){return clock<slowUntil?0.3:1},
  action(){const a=callout.__act;return a&&!callout.hidden&&!a.disabled?()=>{a.run();lastKey=''}:null},
  event(ev){if(ev.type==='upgrade'&&game.wave<=1&&game.towers.length===1){selected=null;setTimeout(()=>refresh(),0)}if(ev.type==='impact'&&ev.element==='fire'&&ev.enemy&&!guide.done.celebrate_burn){/* QA Oct 28: first burn gets its own pop so wave 1 has a visible payoff */guide.record('celebrate_burn');pops.push({text:'BURNING!',color:'#ffb35c',x:ev.enemy.x,y:ev.enemy.y-60,at:clock});return}const map={freeze:['FROZEN!','#bfeeff','Water + Ice → Frozen','Soaked is consumed; movement stops. Fire can shatter it.'],arc:['CHAIN!','#dcb8ff','Water + Lightning → Conduction','The soaked target carried lightning to its neighbours.'],shatter:['SHATTER!','#ffc06a','Frozen + Fire → Shatter','Area damage! The freeze ends early.']}[ev.type];if(!map)return;const flag='celebrate_'+ev.type;if(guide.done[flag])return;guide.record(flag);const target=ev.enemy||(ev.points&&ev.points[0])||{x:500,y:300};pops.push({text:map[0],color:map[1],x:target.x,y:target.y-70,at:clock});if(!settings.reduced)slowUntil=clock+0.9;toast(map[2],'FIRST COMBINATION');const last=document.getElementById('toasts').lastElementChild;if(last){last.classList.add('combo');const d=document.createElement('p');d.textContent=map[3];last.append(d)}},
  draw(c){const now=clock;const SP=spotFor();if(SP){const sp=SP,TY=SP.id==='place'?'fire':SP.id,pulse=.5+.5*Math.sin(now*3);c.save();c.globalAlpha=.9;c.strokeStyle=`rgba(255,207,110,${.55+.45*pulse})`;c.lineWidth=2.5;c.setLineDash([7,6]);c.beginPath();c.ellipse(sp.x,sp.y,34,15,0,0,Math.PI*2);c.stroke();c.setLineDash([]);const g=c.createRadialGradient(sp.x,sp.y,2,sp.x,sp.y,40);g.addColorStop(0,'rgba(255,178,74,.35)');g.addColorStop(1,'rgba(255,178,74,0)');c.fillStyle=g;c.beginPath();c.ellipse(sp.x,sp.y,40,18,0,0,Math.PI*2);c.fill();if(!hover){c.strokeStyle='rgba(255,210,122,.45)';c.fillStyle='rgba(255,154,60,.06)';c.lineWidth=1.3;c.beginPath();c.arc(sp.x,sp.y,E.TYPES[TY].range,0,Math.PI*2);c.fill();c.stroke();c.globalAlpha=.30+.08*pulse;towerImage(c,{type:TY,tier:1},sp.x,sp.y,75)}c.restore()}
   pops=pops.filter(p=>now-p.at<1.6);for(const p of pops){const age=now-p.at,s=age<.18?.6+age/.18*.55:age<.3?1.15-(age-.18)/.12*.15:1;c.save();c.globalAlpha=age>1.1?Math.max(0,1-(age-1.1)/.5):1;c.translate(p.x,p.y-age*18);c.scale(s,s);c.font='34px "Warden Quill", Georgia';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=7;c.strokeStyle='#24162c';c.strokeText(p.text,0,0);c.fillStyle=p.color;c.fillText(p.text,0,0);c.restore()}},
  frame(dt){clock+=dt;
   if(!game.__dropin&&game.status==='playing'&&game.wave===0&&!game.towers.length&&!game.completed){game.__dropin=true;const sp=SPOTS.place;const r=game.build('fire',{x:sp.x,y:sp.y});if(r.ok){guide.record('place');guide.record('intro_0');refresh();dropAt=clock+1.2}}
   if(dropAt&&clock>=dropAt){dropAt=0;if(game.wave===0&&game.status==='playing')nextWave()}
   const p=plan(game,guide);
   for(const g of p.goals)if(g.done&&g.reward&&!guide.done['reward_'+g.id]){guide.record('reward_'+g.id);game.charge+=g.reward;toast(`+${g.reward} Charge`,'QUEST COMPLETE');save();refresh()}
   renderTracker(p);renderIntro();renderCallout(p);fadeTracker()},
  reset(){dismissed={};pops=[];slowUntil=0;introShown=null;intro.hidden=true;lastKey='';dropAt=0;bannerUntil=0;hand.hidden=true}
 };
 return hook;
}
return{LESSONS,INTROS,plan,introDue,lessonIndex,install};
});
// Approved Oct 22 2026: the in-world tutorial is the default. ?tutorial=v1 shows the earlier handbook-only flow.
if(typeof location!=='undefined'&&!/[?&]tutorial=v1(&|$)/.test(location.search||'')&&typeof game!=='undefined'&&game.mission==='tutorial')globalThis.WardenCoachHook=WardenCoach.install();
