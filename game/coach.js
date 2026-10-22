// Warden coach: in-world tutorial layer (approved Oct 22 2026; default).
// Teaches one real action at a time: objective tracker, anchored Warden callouts,
// suggested build spot with ghost tower, wave intro cards and first-combo celebrations.
// It never buys, upgrades, sells or starts a wave on the player's behalf.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WardenCoach=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

// ---- pure lesson plan (unit-testable, no DOM) --------------------------------
const LESSONS=[
 {title:'Fire & Burning',goals:[['place','Raise a Fire tower'],['inspect','Select it to command it'],['upgrade','Upgrade it to Tier II'],['target','Choose what it targets'],['sellView','Learn how selling works'],['wave','Begin wave 1']]},
 {title:'Water + Ice',goals:[['water','Build Water beside the road'],['ice','Build Ice overlapping Water'],['freeze','Freeze a golem']]},
 {title:'Lightning',goals:[['lightning','Build Lightning near Water'],['conduction','Chain lightning through a soaked crowd']]},
 {title:'Shatter',goals:[['shatter','Shatter a frozen enemy with Fire']]},
 {title:'Your Elemental Defense',goals:[['complete','Hold all five waves']]}
];
const INTROS=[
 {eyebrow:'WAVE 1 OF 5 · FIRST DEFENSE',title:'Fire & Burning',text:'Slimes are seeping through the north gate. Fire scorches them and keeps them burning for 3 seconds.',recipe:[['tower','fire'],['=',null],['result','BURN','fire']],enemy:['slime','6 slimes'],button:"Let's begin"},
 {eyebrow:'WAVE 2 OF 5 · NEW COMBINATION',title:'Hold the Line',text:'Golems are tough. Soak them with Water, then strike with Ice to freeze them solid.',recipe:[['tower','water'],['+',null],['tower','ice'],['=',null],['result','FREEZE','ice']],enemy:['golem','5 stone golems'],button:"Let's build"},
 {eyebrow:'WAVE 3 OF 5 · NEW COMBINATION',title:'Connected Crowds',text:'A swarm is coming. Lightning striking a soaked enemy leaps to the foes around it.',recipe:[['tower','water'],['+',null],['tower','lightning'],['=',null],['result','CHAIN','lightning']],enemy:['beetle','14 swarming foes'],button:"Let's build"},
 {eyebrow:'WAVE 4 OF 5 · NEW COMBINATION',title:'Shatter',text:'Freeze a golem, then hit it with Fire. The ice bursts and damages everything nearby.',recipe:[['tower','ice'],['+',null],['tower','fire'],['=',null],['result','SHATTER','fire']],enemy:['golem','6 stone golems'],button:"Let's build"},
 {eyebrow:'WAVE 5 OF 5 · FINAL TEST',title:'Your Elemental Defense',text:'Everything at once. Combine your elements, upgrade during the fight, and hold the seal.',recipe:[['tower','fire'],['tower','water'],['tower','ice'],['tower','lightning']],enemy:['mixed','16 mixed enemies'],button:'Ready'}
];
function lessonIndex(game){const busy=game.spawnQueue.length>0||game.enemies.some(e=>e.alive);return Math.max(0,Math.min(LESSONS.length-1,busy?game.wave-1:game.wave))}
function goalDone(id,game,guide){if(id==='upgrade')return !!guide.done.upgrade;if(id==='complete')return game.status==='won';return !!guide.done[id]}
function plan(game,guide){const index=lessonIndex(game),lesson=LESSONS[index];const goals=lesson.goals.map(([id,label])=>({id,label,done:goalDone(id,game,guide)}));const step=goals.find(g=>!g.done)||null;return{index,title:lesson.title,goals,step,busy:game.spawnQueue.length>0||game.enemies.some(e=>e.alive)}}
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
 let collapsed=false,dismissed={},pops=[],slowUntil=0,clock=0,lastKey='',introShown=null;

 const SPOTS={place:{x:210,y:310}};
 const TOWER_RECTS={fire:[20,0,340,457],water:[390,35,325,420],lightning:[755,0,310,457],ice:[1100,40,348,415]};
 const ENEMY_RECTS={slime:[40,515,315,270],beetle:[395,560,300,220],golem:[705,465,360,330]};
 const COLORS={fire:'#ff9a3c',water:'#5fd2ef',ice:'#a9e6ff',lightning:'#c79bff'};
 function sprite(rect,h){const c=document.createElement('canvas');const w=Math.round(h*rect[2]/rect[3]);c.width=w*2;c.height=h*2;c.style.width=w+'px';c.style.height=h+'px';const x=c.getContext('2d');if(art.base)x.drawImage(art.base,...rect,0,0,w*2,h*2);return c}
 const key=a=>keys[a]===' '?'Space':String(keys[a]).toUpperCase();
 const kbd=a=>`<kbd class="coach-key">${key(a)}</kbd>`;

 function worldToStage(x,y){const r=canvasEl.getBoundingClientRect(),s=stage.getBoundingClientRect(),p=WardenGround.project(x,y);return{x:r.left-s.left+(p.x*VIEW.scale+VIEW.x)*r.width/1000,y:r.top-s.top+(p.y*VIEW.scale+VIEW.y)*r.height/600}}
 function rectOf(node){if(!node)return null;const r=node.getBoundingClientRect(),s=stage.getBoundingClientRect();if(!r.width&&!r.height)return null;return{left:r.left-s.left,top:r.top-s.top,right:r.right-s.left,bottom:r.bottom-s.top,width:r.width,height:r.height}}
 const fireTower=()=>game.towers.find(t=>t.type==='fire')||game.towers[0];
 const selectedTower=()=>game.towers.find(t=>t.id===selected);
 const inspectorOpen=()=>!document.querySelector('.inspector').hidden;

 // What to say and where to point, for the current step.
 function message(p){
  const s=p.step;if(!s)return null;const t=selectedTower();const need=type=>Math.max(0,E.TYPES[type].cost-Math.floor(game.charge));
  const towerAnchor=tw=>tw?{world:{x:tw.x,y:tw.y-80}}:null;
  switch(s.id){
   case 'place':return{title:'Light the first defense',text:`Choose <b class="el-fire">Fire</b> ${kbd('fire')} and build it anywhere on open ground. Its flames must reach the road; the glowing spot is a good start.`,anchor:{world:{x:SPOTS.place.x+38,y:SPOTS.place.y-40}},side:'right'};
   case 'inspect':return{title:'Take command',text:'Click your Fire tower to open its command panel.',anchor:towerAnchor(fireTower()),side:'right'};
   case 'upgrade':return t&&inspectorOpen()&&document.getElementById('upgradeOne')?{title:'Make it stronger',text:`Tier II adds damage, range and speed. Compare the cost, then upgrade ${kbd('upgrade')}.`,anchor:{node:'#upgradeOne'},side:'auto'}:{title:'Make it stronger',text:'Select your Fire tower to see its upgrade.',anchor:towerAnchor(fireTower()),side:'right'};
   case 'target':return t&&inspectorOpen()&&document.getElementById('targetMode')?{title:'Choose your target',text:`Pick who it attacks first ${kbd('target')}. The badge above every tower shows its choice.`,anchor:{node:'#targetMode'},side:'auto'}:{title:'Choose your target',text:'Select a tower to change what it attacks.',anchor:towerAnchor(fireTower()),side:'right'};
   case 'sellView':return{title:'You can change your mind',text:'Selling returns all Charge if the tower never fired, and 75% after it has. Selling is optional.',anchor:t&&inspectorOpen()&&document.getElementById('sellTower')?{node:'#sellTower'}:towerAnchor(fireTower()),side:'auto',ack:'Got it'};
   case 'wave':return{title:'Defend the seal',text:`Begin wave 1 ${kbd('next')}. You can keep building, upgrading and retargeting while it runs.`,anchor:{node:'#next'},side:'above'};
   case 'water':case 'ice':case 'lightning':{const type=s.id,n=need(type);const where=type==='water'?'beside the road':type==='ice'?'so its range overlaps Water':'near Water';return{title:{water:'Prepare a combination',ice:'Add Ice to the overlap',lightning:'Conduct the current'}[type],text:`Build <b class="el-${type}">${E.TYPES[type].name}</b> ${kbd(type)} ${where}.`+(n?` <span class="coach-need">Need ${n} more Charge: let your towers earn it.</span>`:''),anchor:{node:`[data-type="${type}"]`},side:'above'}}
   case 'freeze':case 'conduction':case 'shatter':case 'complete':{if(p.busy)return null;const w=game.wave+1;const watch={freeze:'watch Water and Ice freeze a golem',conduction:'watch lightning leap through the soaked crowd',shatter:'freeze a golem, then let Fire shatter it',complete:'combine everything you have learned'}[s.id];return{title:`Wave ${w}`,text:`When you are ready, begin wave ${w} ${kbd('next')} and ${watch}.`,anchor:{node:'#next'},side:'above'}}
  }return null}

 function fadeTracker(){const r=rectOf(tracker);if(!r)return;const pts=game.towers.map(t=>worldToStage(t.x,t.y-30));if(!guide.done.place)pts.push(worldToStage(SPOTS.place.x,SPOTS.place.y));if(hover&&buildType)pts.push(worldToStage(hover.x,hover.y));const over=pts.some(q=>q.x>r.left-30&&q.x<r.right+30&&q.y>r.top-20&&q.y<r.bottom+60);tracker.classList.toggle('faded',over)}
 function renderTracker(p){const html=`<button class="coach-collapse" aria-label="${collapsed?'Expand':'Collapse'} objectives">${collapsed?'▸':'▾'}</button><span class="coach-eyebrow">TUTORIAL · WAVE ${p.index+1} OF 5</span><h3>${p.title}</h3>${collapsed?'':`<ul>${p.goals.map(g=>`<li class="${g.done?'done':g===p.step?'now':''}"><i aria-hidden="true"></i>${g.label}</li>`).join('')}</ul>`}<div class="coach-pips">${[0,1,2,3,4].map(i=>`<b class="${i<game.completed?'on':i===p.index?'cur':''}"></b>`).join('')}</div>`;if(tracker.dataset.html!==html){tracker.dataset.html=html;tracker.innerHTML=html;tracker.querySelector('.coach-collapse').onclick=()=>{collapsed=!collapsed;tracker.dataset.html=''}}}

 function place(box,anchor,side){
  const W=box.offsetWidth,H=box.offsetHeight,sw=stage.clientWidth,sh=stage.clientHeight;let x,y,arrow;
  if(anchor.world){const p=worldToStage(anchor.world.x,anchor.world.y);if(side==='right'&&p.x+24+W<sw-10){x=p.x+24;y=p.y-H/2;arrow='left'}else{x=p.x-24-W;y=p.y-H/2;arrow='right'}}
  else{const r=rectOf(document.querySelector(anchor.node));if(!r)return false;if(side==='above'){x=r.left+r.width/2-W/2;y=r.top-H-18;arrow='down'}else{if(r.left>sw/2){x=r.left-W-20;arrow='right'}else{x=r.right+20;arrow='left'}y=r.top+r.height/2-H/2}}
  const dock=rectOf(document.querySelector('.command-dock')),floor=(side==='above'||!dock)?sh-10:dock.top-8;x=Math.max(10,Math.min(sw-W-10,x));y=Math.max(70,Math.min(floor-H,y));box.style.left=x+'px';box.style.top=y+'px';box.dataset.arrow=arrow;
  if(arrow==='down'){const r=rectOf(document.querySelector(anchor.node));box.style.setProperty('--arrow-x',Math.max(20,Math.min(W-20,r.left+r.width/2-x))+'px')}else{const target=anchor.world?worldToStage(anchor.world.x,anchor.world.y).y:(()=>{const r=rectOf(document.querySelector(anchor.node));return r.top+r.height/2})();box.style.setProperty('--arrow-y',Math.max(18,Math.min(H-18,target-y))+'px')}
  return true}

 function renderCallout(p){const m=introShown===null&&!modalPaused?message(p):null;const id=p.step?.id;
  if(!m||dismissed[id]||!m.anchor){callout.hidden=true;lastKey='';return}
  const k=id+'|'+m.title+'|'+m.text;if(k!==lastKey){lastKey=k;callout.innerHTML=`<div class="coach-face" aria-hidden="true">✦</div><button class="coach-x" aria-label="Hide this hint">×</button><h4>${m.title}</h4><p>${m.text}</p>${m.ack?`<button class="coach-ack">${m.ack}</button>`:''}`;callout.querySelector('.coach-x').onclick=()=>{dismissed[id]=true;callout.hidden=true};const ack=callout.querySelector('.coach-ack');if(ack)ack.onclick=()=>{guide.record(id);save();refresh();lastKey=''}}
  callout.hidden=false;if(!place(callout,m.anchor,m.side))callout.hidden=true}

 function renderIntro(){const due=introDue(game,guide);if(due===null||modalPaused){if(introShown!==null&&due===null){intro.hidden=true;introShown=null}return}
  if(introShown===due)return;introShown=due;const c=INTROS[due];intro.innerHTML='';
  const card=el('div','coach-intro-card');card.append(el('span','coach-eyebrow',c.eyebrow),el('h2','',c.title),el('p','',c.text));
  const recipe=el('div','coach-recipe');for(const [kind,a,b] of c.recipe){if(kind==='tower'){const wrap=el('figure','coach-tower');wrap.append(sprite(TOWER_RECTS[a],92),el('figcaption','',E.TYPES[a].name));recipe.append(wrap)}else if(kind==='result')recipe.append(el('span',`coach-result el-bg-${b}`,a));else recipe.append(el('span','coach-op',kind))}card.append(recipe);
  const foe=el('div','coach-foes');const kinds=c.enemy[0]==='mixed'?['slime','beetle','golem']:[c.enemy[0]];for(const k of kinds)foe.append(sprite(ENEMY_RECTS[k],46));foe.append(el('span','',c.enemy[1]+' approach from the north gate'));card.append(foe);
  const go=el('button','coach-go',c.button);go.onclick=()=>{guide.record('intro_'+due);save();intro.hidden=true;introShown=null;canvasEl.focus?.()};card.append(go);intro.append(card);intro.hidden=false;setTimeout(()=>go.focus(),50)}

 const hook={
  timeScale(){return clock<slowUntil?0.3:1},
  event(ev){const map={freeze:['FROZEN!','#bfeeff','Water + Ice → Frozen','Soaked is consumed; movement stops. Fire can shatter it.'],arc:['CHAIN!','#dcb8ff','Water + Lightning → Conduction','The soaked target carried lightning to its neighbours.'],shatter:['SHATTER!','#ffc06a','Frozen + Fire → Shatter','Area damage! The freeze ends early.']}[ev.type];if(!map)return;const flag='celebrate_'+ev.type;if(guide.done[flag])return;guide.record(flag);const target=ev.enemy||(ev.points&&ev.points[0])||{x:500,y:300};pops.push({text:map[0],color:map[1],x:target.x,y:target.y-70,at:clock});if(!settings.reduced)slowUntil=clock+0.9;toast(map[2],'FIRST COMBINATION');const last=document.getElementById('toasts').lastElementChild;if(last){last.classList.add('combo');const d=document.createElement('p');d.textContent=map[3];last.append(d)}},
  draw(c){const now=clock;if(!guide.done.place){const sp=SPOTS.place,pulse=.5+.5*Math.sin(now*3);c.save();c.globalAlpha=.9;c.strokeStyle=`rgba(255,207,110,${.55+.45*pulse})`;c.lineWidth=2.5;c.setLineDash([7,6]);c.beginPath();c.ellipse(sp.x,sp.y,34,15,0,0,Math.PI*2);c.stroke();c.setLineDash([]);const g=c.createRadialGradient(sp.x,sp.y,2,sp.x,sp.y,40);g.addColorStop(0,'rgba(255,178,74,.35)');g.addColorStop(1,'rgba(255,178,74,0)');c.fillStyle=g;c.beginPath();c.ellipse(sp.x,sp.y,40,18,0,0,Math.PI*2);c.fill();if(!hover){c.strokeStyle='rgba(255,210,122,.45)';c.fillStyle='rgba(255,154,60,.06)';c.lineWidth=1.3;c.beginPath();c.arc(sp.x,sp.y,E.TYPES.fire.range,0,Math.PI*2);c.fill();c.stroke();c.globalAlpha=.30+.08*pulse;towerImage(c,{type:'fire',tier:1},sp.x,sp.y,75)}c.restore()}
   pops=pops.filter(p=>now-p.at<1.6);for(const p of pops){const age=now-p.at,s=age<.18?.6+age/.18*.55:age<.3?1.15-(age-.18)/.12*.15:1;c.save();c.globalAlpha=age>1.1?Math.max(0,1-(age-1.1)/.5):1;c.translate(p.x,p.y-age*18);c.scale(s,s);c.font='34px "Warden Quill", Georgia';c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.lineWidth=7;c.strokeStyle='#24162c';c.strokeText(p.text,0,0);c.fillStyle=p.color;c.fillText(p.text,0,0);c.restore()}},
  frame(dt){clock+=dt;const p=plan(game,guide);renderTracker(p);renderIntro();renderCallout(p);fadeTracker()},
  reset(){dismissed={};pops=[];slowUntil=0;introShown=null;intro.hidden=true;lastKey=''}
 };
 return hook;
}
return{LESSONS,INTROS,plan,introDue,lessonIndex,install};
});
// Approved Oct 22 2026: the in-world tutorial is the default. ?tutorial=v1 shows the earlier handbook-only flow.
if(typeof location!=='undefined'&&!/[?&]tutorial=v1(&|$)/.test(location.search||'')&&typeof game!=='undefined'&&game.mission==='tutorial')globalThis.WardenCoachHook=WardenCoach.install();
