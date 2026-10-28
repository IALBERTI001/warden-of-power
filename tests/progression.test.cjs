// Phase 1 foundation: permanent power applies to every tower; purchases follow the approved rules.
const assert=require('node:assert/strict'),P=require('../game/progression.js'),E=require('../game/engine.js');
// The approved 20-node tree: 5 branches x 4 nodes, three 3-rank nodes and a capstone each.
assert.equal(P.SKILLS.length,20);for(const b of P.BRANCHES){const n=P.SKILLS.filter(s=>s.branch===b);assert.equal(n.length,4);assert.deepEqual(n.map(s=>s.maxRank),[3,3,3,1])}
// Empty profile = no change at all to the tutorial numbers.
const plain=new E.Game();assert.equal(plain.charge,165);plain.build('fire',{x:230,y:300});const t0=plain.towers[0];assert.equal(plain.stats(t0).damage,11,'Oct 28 2026 rebalance: Fire 14 -> 11');assert.equal(plain.upgradeCost(t0),83);
// An old save migrates without losing badges, counters or Parts.
const old={earned:{first_upgrade:'2026-10-20'},counters:{freeze:7},parts:80};const m=P.migrate(old);assert.equal(m.parts,80);assert.equal(m.counters.freeze,7);assert.equal(m.earned.first_upgrade,'2026-10-20');assert.equal(m.resonance,0);assert.deepEqual(m.skills,{});
// Skills: branch locked until its facility's first restoration; selecting never spends; prerequisites and costs enforced.
const p=P.migrate({parts:300,resonance:500});assert.equal(P.restore(p,'emberheart').ok,false,'gate first');assert.equal(P.openGate(p).ok,true);assert.equal(p.parts,260);p.gateOpen=false;p.parts=300;
assert.equal(P.skillOffer(p,'fire_furnace').ok,false);p.gateOpen=true;assert.equal(P.skillOffer(p,'fire_furnace').ok,true,'gate opens Fire skills');assert.equal(P.skillOffer(p,'water_saturation').ok,false);assert.equal(p.resonance,500,'checking an offer never spends');
assert.equal(P.restore(p,'emberheart').ok,false,'restoration stage 1 needs the Emberheart mission 1');p.missions={'emberheart-1':{cleared:true}};assert.equal(P.restore(p,'emberheart').ok,true);assert.equal(p.parts,260);assert.equal(p.restorations.emberheart,1);
assert.equal(P.skillOffer(p,'fire_pursuit').ok,false,'needs Furnace tuning rank 1 first');
assert.deepEqual(P.buySkill(p,'fire_furnace'),{ok:true,rank:1,cost:25});assert.equal(p.resonance,475);
assert.equal(P.buySkill(p,'fire_furnace').cost,50);assert.equal(P.buySkill(p,'fire_furnace').cost,75);assert.equal(P.buySkill(p,'fire_furnace').ok,false,'max rank 3');
assert.equal(P.buySkill(p,'fire_pursuit').ok,true);
// Every bonus strengthens towers everywhere: tutorial game with this profile.
const g=new E.Game(p);g.build('fire',{x:230,y:300});const s=g.stats(g.towers[0]);
assert(Math.abs(s.damage-11*(1+.05+.06))<1e-9,'Emberheart stage 1 (+5%) and Hot pursuit 1 (+6%)');assert(Math.abs(s.burn-3*(1+.24+.05))<1e-9,'Furnace tuning 3 (+24% burn) plus facility damage');
// Free reassignment refunds every rank at full price.
const before=p.resonance;const back=P.resetSkills(p);assert.equal(back,25+50+75+40);assert.equal(p.resonance,before+back);assert.deepEqual(p.skills,{});
// Engineering: starting Charge, discount cap 6%, refund cap 90%, Stable current every fifth wave.
const e=P.migrate({restorations:{atelier:3},skills:{eng_reserve:3,eng_fittings:3,eng_reclaim:3,eng_current:1}});const ge=new E.Game(e);
assert.equal(ge.charge,165+60+45,'Reserve capacity 3 (+60) and Atelier 3 stages (+45)');ge.build('fire',{x:230,y:300});const te=ge.towers[0];assert.equal(ge.upgradeCost(te),Math.round(83*.94));te.acted=true;assert.equal(ge.refund(te),Math.floor(60*.9));
const b=P.bonuses(e);assert.equal(b.eng.fifthWaveCharge,30);
// Ice slow cap 50%.
const ice=P.migrate({restorations:{rimeglass:1},skills:{ice_front:3}});const gi=new E.Game(ice);gi.completed=1;gi.build('ice',{x:230,y:300});assert(Math.abs(gi.stats(gi.towers[0]).slow-.30)<1e-9);
// Mastery: needs the full branch, an endless milestone and the previous tier filled.
const ms=P.migrate({resonance:10000,restorations:{stormcrown:1},skills:{lightning_wire:3,lightning_close:3,lightning_force:3,lightning_chain:1}});
assert.equal(P.masteryOffer(ms,'lightning',1).ok,false,'tier I opens at endless wave 50');ms.bestEndlessWave=50;
for(let i=0;i<10;i++)assert.equal(P.buyMastery(ms,'lightning',1).ok,true);assert.equal(P.buyMastery(ms,'lightning',1).ok,false,'tier holds 10 ranks');assert.equal(P.masteryOffer(ms,'lightning',2).ok,false,'tier II opens at wave 100');
const gl=new E.Game(ms);gl.completed=2;gl.build('lightning',{x:230,y:300});const sl=gl.stats(gl.towers[0]);assert(Math.abs(sl.damage-16*(1+.05+.18+.20))<1e-9);assert.equal(sl.chains,4);
console.log('PASS: approved 20-node tree, migration keeps old saves, offers never spend, prerequisites/caps/reset, universal bonuses reach tutorial towers, engineering economy, mastery gating.');
