// Hold the Outer Seal (approved Oct 22 2026): its own map, levelled defense, incremental strength, Parts rewards.
const assert=require('node:assert/strict'),E=require('../game/engine.js');
const t=new E.Game({});assert.equal(t.mission,'tutorial');assert.equal(t.route.total,E.TOTAL,'tutorial route unchanged');assert.equal(t.waves,E.WAVES);assert(!t.unlocked('ice'),'tutorial still unlocks elements by lesson');
const g=new E.Game({},{mission:'outer',level:1});assert.equal(g.map.id,'outer');assert.notDeepEqual(g.map.path,E.PATH,'not the tutorial map');assert.equal(g.waves.length,8);assert(['fire','water','ice','lightning'].every(x=>g.unlocked(x)),'all elements open');
assert(!g.placement(240,300).ok,'road blocked');assert(g.placement(370,320).ok,'meadow buildable');assert(!g.placement(880,250).ok,'gate kept clear');
// incremental strength
const hp=L=>{const x=new E.Game({},{mission:'outer',level:L});return x.spawn('slime',1).maxHp};assert(Math.abs(hp(2)/hp(1)-1.15)<1e-9,'+15% health per level');assert(hp(10)>hp(9));
const w=L=>E.outerWaves(L);assert(w(2).every(v=>!v.attunes.length),'no attuned foes before level 3');assert(w(3).some(v=>v.attunes.length),'attuned from level 3');assert(w(9).every(v=>v.attunes.length<=2),'at most two attunement kinds per wave');
const armor=L=>{const x=new E.Game({},{mission:'outer',level:L});return x.spawn('golem',1).armor};assert.equal(armor(3),0);assert(armor(4)>0,'armour from level 4');
assert(w(5).every(v=>!v.elites),'no elites before 6');assert(w(6).some(v=>v.elites),'elites from level 6');assert(w(5)[7].spawns.some(s=>s.kind==='boss')&&!w(4)[7].spawns.some(s=>s.kind==='boss'),'boss every 5th level');
// armour cuts small hits, not burn
const a=new E.Game({},{mission:'outer',level:4}),gl=a.spawn('golem',1),h0=gl.hp;a.damage(gl,5,'water');assert(Math.abs(h0-gl.hp-3)<1e-9,'armour 2 cuts a 5-damage hit to 3');const h1=gl.hp;a.damage(gl,1,'water');assert(Math.abs(h1-gl.hp-.3)<1e-9,'at least 30% gets through');const h2=gl.hp;a.damage(gl,2,'burn');assert(Math.abs(h2-gl.hp-2)<1e-9,'burn ignores armour');
// rewards
const r=new E.Game({},{mission:'outer',level:1});r.completed=8;r.finish(true);assert.equal(r.profile.parts,40);assert.equal(r.profile.resonance||0,0,'no Resonance outside the Engine');assert.equal(r.profile.outer.best,1);
const r2=new E.Game(r.profile,{mission:'outer',level:1});r2.completed=8;r2.finish(true);assert.equal(r2.profile.parts,65,'replay 25');
const r3=new E.Game(r2.profile,{mission:'outer',level:3});r3.completed=8;r3.finish(true);assert.equal(r3.profile.parts,65+60,'level 3 first clear 60');
const l=new E.Game({},{mission:'outer',level:2});l.completed=4;l.finish(false);assert.equal(l.profile.parts,Math.floor(35*4/8*.5),'partial Parts on a loss');assert.equal(l.profile.outer?.best||0,0);
// a full level plays to the gate: an undefended run loses health at the gate
const u=new E.Game({},{mission:'outer',level:1});u.towers.push({id:999,type:'fire',x:-500,y:-500,tier:1,cooldown:9e9});u.startWave();for(let i=0;i<60*120&&u.status==='playing';i++)u.step(1/60);assert(u.health<20,'enemies reach the gate');
console.log('PASS: Outer Seal map and levels, +15%/level, attuned from 3, armour from 4, elites from 6, boss every 5th, Parts 40/25 +10 per level, no Resonance.');
// A boss that reaches the seal breaks it outright (Oct 22 2026); other enemies only chip it.
{const g=new E.Game({},{mission:'outer',level:5});g.wave=8;const b=g.spawn('boss',8);b.distance=g.routeOf(b).total-.1;g.step(1/30);assert.equal(g.health,0);assert.equal(g.status,'lost','boss at the seal = instant loss');
 const h=new E.Game({},{mission:'outer',level:5});h.wave=1;const s=h.spawn('golem',1);s.distance=h.routeOf(s).total-.1;h.step(1/30);assert.equal(h.health,18,'a golem only chips the seal');}
console.log('PASS: boss at the seal is an instant loss.');
