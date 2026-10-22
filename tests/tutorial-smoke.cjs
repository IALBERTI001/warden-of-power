// Browser-independent UI integration smoke test. Not a substitute for visual QA.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const registry=new Map(),all=[],storage=new Map();
const drawing=new Proxy({}, {get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.dataset={};this.children=[];this.style={};this.listeners={};this.classList={toggle(){}};this.open=false;this.value='';this.checked=false;all.push(this)}
 set innerHTML(s){this.html=s;for(const m of s.matchAll(/id="([^"]+)"/g))registry.set(m[1],new Element())}
 get innerHTML(){return this.html||''}
 append(...v){this.children.push(...v)}
 addEventListener(k,fn){this.listeners[k]=fn}
 setAttribute(){}getContext(){return drawing}getBoundingClientRect(){return{left:0,top:0,width:1000,height:600}}
 querySelector(tag){if(!this.subs)this.subs={};return this.subs[tag]||(this.subs[tag]=new Element(tag))}
 querySelectorAll(){return[]}
 showModal(){this.open=true}close(){this.open=false;this.listeners.close?.()}
 focus(){}remove(){}get firstChild(){return this.children[0]}
}
const html=fs.readFileSync('game/index.html','utf8');for(const m of html.matchAll(/id="([^"]+)"/g))registry.set(m[1],new Element(m[1]==='battle'?'canvas':'div'));
const dialogs=['settings','confirm','badges','tiers','result','help'].map(id=>registry.get(id));
const document={getElementById(id){return registry.get(id)||null},createElement(tag){return new Element(tag)},querySelectorAll(selector){if(selector==='dialog')return dialogs;if(selector==='[data-type]')return all.filter(e=>e.dataset.type);if(selector==='#padButtons button')return registry.get('padButtons').children;if(selector==='dialog[open]')return dialogs.filter(e=>e.open);return[]},querySelector(selector){if(selector==='dialog[open]')return dialogs.find(e=>e.open)||null;if(selector==='.briefing')return registry.get('lessonText');if(selector==='.controls-note p')return registry.get('feedback');if(selector==='.inspector')return registry.get('selection');return null},addEventListener(){},hidden:false};
class Img{constructor(){this.width=1448;this.height=1086}set src(s){this.path=s;this.onload?.()}}
class Audio{constructor(){this.paused=true;this.ended=false;this.currentTime=0}play(){this.paused=false;return Promise.resolve()}pause(){this.paused=true}}
const context={WardenEngine:require('../game/engine.js'),WardenGround:require('../game/ground.js'),WardenTowerLayout:require('../game/tower-layout.js'),WardenPortals:require('../game/portals.js'),WardenTutorial:require('../game/tutorial.js'),WardenBadges:require('../game/badges.js'),document,localStorage:{getItem(k){return storage.get(k)||null},setItem(k,v){storage.set(k,v)},removeItem(k){storage.delete(k)}},Image:Img,Audio,matchMedia(){return{matches:false}},performance:{now:()=>1000},requestAnimationFrame(){},setTimeout(){},window:{addEventListener(){}},console};vm.createContext(context);
vm.runInContext(fs.readFileSync('game/game.js','utf8'),context);
setImmediate(()=>{
 const run=s=>vm.runInContext(s,context);
 assert.equal(run('ready'),true);assert.equal(registry.get('loading').hidden,true);
 run('buildAt(0)');assert.equal(run('game.towers.length'),1);assert.equal(run('game.charge'),105);
 run("guide.done={place:true,inspect:true,upgradeView:true,upgrade:true,target:true};");run('bookPage=5');const chargeBefore=run('game.charge');registry.get('showLesson').onclick();assert.equal(registry.get('confirm').open,false);assert.equal(run('game.charge'),chargeBefore);assert.equal(run('game.towers.length'),1);assert.equal(run('settings.guide'),false);registry.get('tutorialBookButton').onclick();assert.equal(run('bookPage'),5);assert.equal(run('settings.guide'),true);registry.get('previousPage').onclick();assert.equal(run('bookPage'),4);registry.get('nextPage').onclick();assert.equal(run('bookPage'),5);run('turnPage(100)');assert.equal(run('bookPage'),13);run('turnPage(-100)');assert.equal(run('bookPage'),0);run('bookPage=5');registry.get('ackLesson').onclick();assert.equal(run('guide.done.sellView'),true);
 run('upgrade()');assert.equal(run('game.towers[0].tier'),2);
 run('game.charge=1000;upgrade(0)');assert.equal(run('game.towers[0].tier'),3);
 run('settingsUI();openModal("settings")');assert.equal(run('modalPaused'),true);registry.get('settings').close();assert.equal(run('modalPaused'),false);
 run('guide.done={place:true,inspect:true,upgradeView:true,upgrade:true,target:true,sellView:true};nextWave();for(let i=0;i<180;i++)game.step(1/60);events();refresh();draw()');assert.equal(run('game.wave'),1);
 run('game.wave=4;game.completed=3;game.charge=1000;setType("water");buildAt(1);upgrade();upgrade(1);draw();save()');
 assert.equal(run('game.towers[1].tier'),3);assert(storage.has('warden.run.v1'));run('showBadges()');assert(registry.get('achievementList').innerHTML.includes('Just Chilling'));assert(registry.get('achievementList').innerHTML.includes('assets/badges/first_soaked_freeze-256.png'));assert(registry.get('achievementList').innerHTML.includes('Warden Ascendant'));
 run("game.wave=5;game.completed=5;game.status='won';game.emit('result',{won:true,parts:80});events();refresh()");
 assert.equal(registry.get('wave').textContent,'5 / 5');assert(registry.get('resultBody').innerHTML.includes('5 / 5'));assert(!registry.get('resultBody').innerHTML.includes('/8'));assert.equal(registry.get('next').innerHTML,'Tutorial complete');assert(registry.get('nextWave').textContent.includes('5 / 5'));
 run("modalPaused=false;paused=false;soundUnlocked=true;voicePool.length=0;lastSounds={};lastVoiceAt=-1000;performance.now=()=>3000;sound('fire_launch');");
 assert.equal(run('voicePool.length'),1);assert(/audio-v3\/fire_launch_[012]\.wav$/.test(run('voicePool[0].src')));
 let audioClock=3500;for(const name of ['water_launch','ice_launch','lightning_launch','freeze_combo','shatter_combo','conduction_combo'])run("performance.now=()=>"+(audioClock+=600)+";sound('"+name+"',true)");
 assert(run('voicePool.length')<=6);
 run('settings.effectsMute=true;syncAudio()');assert(run('voicePool.every(v=>v.paused&&v.volume===0)'));
 console.log('PASS: UI initializes, loads assets, builds and upgrades towers, opens/closes settings, starts combat, renders all tower tiers, saves run and shows achievement catalog. Browser visual/listening QA still required.');
});
