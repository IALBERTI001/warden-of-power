// Campaign (approved plan; built Oct 22 2026): 13 missions on painted, traced maps; unlock chain; rewards; roles; RNG.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),E=require('../game/engine.js'),C=require('../game/campaign.js'),P=require('../game/progression.js');
assert.equal(C.MISSIONS.length,13);
for(const m of C.MISSIONS){const map=E.MAPS[m.id];assert(map&&map.painted,`${m.id} painted`);assert(fs.existsSync(path.join(__dirname,'..','game',map.art)),map.art);assert(map.grid&&map.grid.length===30,'build grid');
 const g=new E.Game({},{mission:m.id,seed:1});assert.equal(g.waves.length,m.waves);for(const w of g.waves)assert(w.attunes.length<=2,'at most two attunement kinds per wave');
 for(const R of g.routes)assert(R.total>600,`${m.id} route length`)}
assert.notDeepEqual(E.MAPS['moonwell-1'].path,E.MAPS['moonwell-2'].path,'every map has its own route');
// unlock chain
const p={gateOpen:true,restorations:{},missions:{}};assert(C.available(p,'moonwell-1').ok);assert(!C.available(p,'moonwell-2').ok);assert(!C.available(p,'emberheart-1').ok,'other sectors after the Moonwell');assert(!C.available(p,'aetherheart-1').ok);
assert(!P.restorationOffer({...p,parts:999},'moonwell').ok,'stage 1 needs mission 1');p.missions['moonwell-1']={cleared:true};p.parts=999;assert(P.restorationOffer(p,'moonwell').ok);assert(!C.available(p,'moonwell-2').ok,'mission 2 needs stage 1');p.restorations.moonwell=1;assert(C.available(p,'moonwell-2').ok);
p.restorations={moonwell:3,emberheart:3,rimeglass:3,stormcrown:3};assert(C.available(p,'emberheart-1').ok);assert(C.available(p,'aetherheart-1').ok,'finale after all four reawakened');
// rewards: first clear + Seals (15 Parts each), replay smaller, never Resonance
const g=new E.Game({},{mission:'moonwell-1',seed:2});g.completed=g.waves.length;g.health=20;g.combos={freeze:1,conduction:1,shatter:1};g.finish(true);assert.equal(g.profile.parts,70+45);assert.equal(g.profile.resonance||0,0);assert.deepEqual(g.profile.missions['moonwell-1'],{cleared:true,held:true,challenge:true});
const r=new E.Game(g.profile,{mission:'moonwell-1',seed:3});r.completed=r.waves.length;r.finish(true);assert.equal(r.profile.parts,115,'replays pay nothing but new Seals');
const f=new E.Game({},{mission:'aetherheart-1',seed:1});f.completed=15;f.uses=new Set(['fire','water','ice','lightning']);f.finish(true);assert(f.profile.unboundOpen,'finale opens the Unbound Gate');assert(f.profile.earned.engine_reborn);
// roles
const d=new E.Game({},{mission:'moonwell-1',seed:1}),dv=d.spawn('diver',1);dv.distance=200;dv.dive=3.5;d.step(1/60);assert(dv.submerged&&!d.exposed(dv),'divers cannot be targeted while submerged');
const s=new E.Game({},{mission:'emberheart-1',seed:1}),sh=s.spawn('shield',1),h=sh.hp;s.damage(sh,8,'water');assert(Math.abs(h-sh.hp-2)<1e-9,'shield blocks small hits to a quarter');
const t=new E.Game({},{mission:'stormcrown-1',seed:1}),sp=t.spawn('splitter',1);sp.distance=300;const n=t.enemies.length;t.damage(sp,1e6,'fire');assert.equal(t.enemies.filter(e=>e.kind==='mini').length,2,'splitter splits in two');
// RNG: same seed same waves, different seed different waves
const a1=JSON.stringify(new E.Game({},{mission:'moonwell-3',seed:5}).waves),a2=JSON.stringify(new E.Game({},{mission:'moonwell-3',seed:5}).waves),a3=JSON.stringify(new E.Game({},{mission:'moonwell-3',seed:6}).waves);assert.equal(a1,a2);assert.notEqual(a1,a3);
// placement uses the painted floor
const gm=new E.Game({},{mission:'moonwell-1',seed:1});assert(!gm.placement(500,20).ok,'not on the walls');
console.log('PASS: 13 painted missions, unlock chain, Seal Parts, finale opens the Unbound Gate, divers/shields/splitters, seeded variety, painted build floor.');
{const l=new E.Game({},{mission:'moonwell-2',seed:1});l.completed=6;l.finish(false);assert.equal(l.profile.parts,Math.floor(90*6/12*.3),'first-attempt loss keeps a little');
 const k=new E.Game({missions:{'moonwell-2':{cleared:true}}},{mission:'moonwell-2',seed:1});k.completed=6;k.finish(false);assert.equal(k.profile.parts||0,0,'a loss after clearing pays nothing');
 const s=new E.Game({missions:{'moonwell-2':{cleared:true}}},{mission:'moonwell-2',seed:1});s.completed=12;s.health=20;s.uses=new Set(['fire','water','ice']);s.finish(true);assert.equal(s.profile.parts,15,'replay: only the new Held Seal pays');}
console.log('PASS: campaign replays pay only new Seals.');
