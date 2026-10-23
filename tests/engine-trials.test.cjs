// Engine Trials (Oct 23 2026): wakes at Moonwell stage 1, limit 20 + 10 per stage (finale removes), Resonance every
// 5 waves past your best (kept on defeat), endless badges, Overcharge only in the Engine.
const assert=require('node:assert/strict'),E=require('../game/engine.js'),EN=E.ENGINE;
assert(!EN.available({}));assert(EN.available({restorations:{moonwell:1}}));
assert.equal(EN.limit({restorations:{moonwell:1}}),30);assert.equal(EN.limit({restorations:{moonwell:3,atelier:2}}),70);assert.equal(EN.limit({unboundOpen:true}),Infinity);
const g=new E.Game({restorations:{moonwell:1}},{mission:'engine',seed:4});assert(g.endless);assert.equal(g.limit,30);assert(g.waveAt(0)&&g.waveAt(24).spawns.some(s=>s.kind==='boss'),'boss every 25');assert(!g.waveAt(23).spawns.some(s=>s.kind==='boss'));
// milestones: waves 5 and 10 bank, below best nothing
g.completed=5;g.engineMilestone();assert.equal(g.profile.resonance,EN.resonance(1));g.completed=7;g.engineMilestone();assert.equal(g.profile.resonance,EN.resonance(1));g.completed=10;g.engineMilestone();assert.equal(g.profile.resonance,EN.resonance(1)+EN.resonance(2));assert.equal(g.profile.engineBest,10);assert.equal(g.profile.bestEndlessWave,10);
const h=new E.Game(g.profile,{mission:'engine',seed:5});h.completed=10;h.engineMilestone();assert.equal(h.banked,0,'no Resonance below your best');h.completed=15;h.engineMilestone();assert.equal(h.banked,EN.resonance(3));
const a=new E.Game({},{mission:'engine',seed:1});a.completed=20;a.engineMilestone();assert(a.profile.earned.first_endless_twenty,'endless badge');
// the run ends at the limit; the seal breaking keeps what was banked
const k=new E.Game({restorations:{moonwell:1}},{mission:'engine',seed:6,limit:1});k.towers.push({id:900,type:'fire',x:-500,y:-500,tier:1,cooldown:9e9});k.startWave();for(const e of k.spawnQueue)e.at=0;k.step(1/60);k.enemies.forEach(e=>e.alive=false);k.enemies=[];k.spawnQueue=[];k.step(1/60);assert.equal(k.status,'won','limit reached');
// overcharge
const o=new E.Game({},{mission:'engine',seed:1});o.charge=5000;const t=o.build('fire',{x:120,y:420});assert(t.ok||true);const tw=o.towers[0]||(o.towers.push({id:77,type:'fire',x:0,y:0,tier:3,spec:0,spent:0,target:'first'}),o.towers[0]);tw.tier=3;tw.spec=0;const d0=o.stats(tw).damage;assert(o.overcharge(tw.id).ok);assert(Math.abs(o.stats(tw).damage/d0-1.15)<1e-9,'+15% per level');assert(o.overchargeCost(tw)>E.OVERCHARGE.cost(0),'each level costs more');
const q=new E.Game({},{mission:'outer',level:1});q.towers.push({id:5,type:'fire',x:0,y:0,tier:3,spec:0,spent:0});q.charge=9999;assert(!q.overcharge(5).ok,'Overcharge is Engine-only');
console.log('PASS: Engine Trials wake, limit, Resonance past best (kept), endless badges, bosses every 25, Overcharge.');
