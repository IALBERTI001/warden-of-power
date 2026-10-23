// Ascension (approved Oct 23 2026): Warden Trials every 100 waves, milestone ranks with new powers, checkpoints.
const assert=require('node:assert/strict'),E=require('../game/engine.js'),A=E.ASCENSION;
const rng=()=>.42;
const w100=E.engineWave(100,rng,1),w125=E.engineWave(125,rng,1);
assert(w100.trial&&/Warden Trial I/.test(w100.name)&&w100.spawns.some(s=>s.kind==='boss'&&s.trial),'wave 100 is a Warden Trial');
assert(!w125.trial&&/Regulator Guardian/.test(w125.name),'other bosses stay Guardians');
assert(/Warden Trial V/.test(E.engineWave(500,rng,1).name));assert(!E.engineWave(600,rng,1).trial,'no trials past 500');
// trial boss is tougher than a normal boss of the same wave
{const g=new E.Game({unboundOpen:true},{mission:'engine',seed:3});const a=g.spawn('boss',100),b=g.spawn('boss',100,null,false,0,true);assert(b.trial&&Math.abs(b.hp/a.hp-A.trialHp(100))<1e-9)}
// milestone grants ranks once, in order
{const p={unboundOpen:true,restorations:{moonwell:1}};const g=new E.Game(p,{mission:'engine',seed:1});g.completed=100;g.engineMilestone();
 assert.equal(g.profile.ascension,1);assert(g.profile.earned.endless_hundred);const ev=g.drain().find(e=>e.type==='ascension');assert(ev&&ev.rank===1&&ev.info.power==='Ascendant Overcharge');
 g.completed=100;g.engineMilestone();assert(!g.drain().some(e=>e.type==='ascension'),'no second grant');
 g.completed=200;g.engineMilestone();assert.equal(g.profile.ascension,2);assert(g.profile.earned.endless_200);
 g.completed=500;g.engineMilestone();assert.equal(g.profile.ascension,5);assert(g.profile.earned.endless_500)}
// powers act only in Engine Trials
{const t={id:1,type:'fire',x:0,y:0,tier:3,spec:0,spent:0,target:'first',oc:2};
 const base=new E.Game({},{mission:'engine',seed:1});base.towers.push({...t});const g1=new E.Game({ascension:1},{mission:'engine',seed:1});g1.towers.push({...t});
 const d0=base.stats(base.towers[0]).damage,d1=g1.stats(g1.towers[0]).damage;assert(Math.abs(d1/d0-A.mult(1)*(1.4/1.3))<1e-9,'Ascension I: ×2.3 and +20%/level Overcharge');
 assert(g1.overchargeCost(g1.towers[0])<base.overchargeCost(base.towers[0]),'Ascension I: cheaper Overcharge');
 const c=new E.Game({ascension:4},{mission:'outer',level:1});c.towers.push({...t,oc:0});const c0=new E.Game({},{mission:'outer',level:1});c0.towers.push({...t,oc:0});assert.equal(c.stats(c.towers[0]).damage,c0.stats(c0.towers[0]).damage,'no effect outside the Engine');
 const g4=new E.Game({ascension:4},{mission:'engine',seed:1});for(const type of ['fire','water','ice','lightning'])g4.towers.push({...t,type,oc:0});assert.equal(g4.concord(),1.6,'Elemental Concord +15% per element')}
// Warden's Reserve: +50% wave Charge
{const g=new E.Game({ascension:3},{mission:'engine',seed:1}),h=new E.Game({},{mission:'engine',seed:1});for(const x of [g,h]){x.towers.push({id:1,type:'fire',x:0,y:0,tier:1,spent:0,target:'first'});x.wave=1;x.completed=0}const c0=g.charge,c1=h.charge;for(const x of [g,h]){x.enemies=[];x.spawnQueue=[];x.step(1/60)}assert.equal(g.charge-c0,Math.round(E.ENGINE.waveCharge(1)*1.5));assert.equal(h.charge-c1,E.ENGINE.waveCharge(1))}
// checkpoints: only ascended hundreds, start at that wave with a Charge bank
{const p={unboundOpen:true,ascension:2,engineBest:240,bestEndlessWave:240};assert.deepEqual(A.checkpoints(p),[100,200]);
 const g=new E.Game(p,{mission:'engine',seed:1,start:200});assert.equal(g.start,200);assert.equal(g.wave,200);assert.equal(g.completed,200);assert(g.charge>=A.bank(200));assert(g.waveAt(200)&&g.waves[200].name==='Wave 201');
 const bad=new E.Game(p,{mission:'engine',seed:1,start:300});assert.equal(bad.start,0,'cannot start past your rank');assert.equal(bad.wave,0);
 assert.deepEqual(A.checkpoints({ascension:5}),[100,200,300,400],'no checkpoint at 500')}
console.log('PASS: Warden Trials at 100-500, ranks granted once in order, powers only in the Engine, Reserve, Concord, checkpoints.');
