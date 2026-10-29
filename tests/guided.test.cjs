// Guided campaign: a fresh save walks from the tutorial to the finale with automatic restorations and never
// stalls for Parts, assuming only the minimum reward per win (first clear + the Cleared seal).
const assert=require('node:assert/strict');
global.WardenCampaign=require('../game/campaign.js');
const P=require('../game/progression.js'),C=require('../game/campaign.js'),G=require('../game/guided.js');
let p=P.migrate({});
assert.equal(G.active(p),false,'not guided before the tutorial');assert.equal(G.next(p,P,C).type,'tutorial');
p.seals={tutorial:{cleared:true}};p.parts=80;assert.equal(G.active(p),true);
const log=[];let outer=0;
for(let i=0;i<80;i++){const a=G.next(p,P,C);log.push(a.type+(a.id?':'+a.id:''));
 if(a.type==='done')break;
 if(a.type==='gate'){assert(P.openGate(p).ok);continue}
 if(a.type==='restore'){assert(P.restore(p,a.id).ok,a.id);continue}
 if(a.type==='mission'){const m=C.mission(a.id);p.missions=p.missions||{};p.missions[a.id]={cleared:true};p.parts+=m.firstParts+C.SEAL_PARTS;continue}
 if(a.type==='outer'){outer++;p.parts+=40;continue}
 assert.fail('unexpected '+a.type)}
assert.equal(G.next(p,P,C).type,'done');assert.equal(G.active(p),false,'guided ends with the finale');
assert.equal(outer,0,'the guided run never needs an Outer Seal detour for Parts');
assert.deepEqual(log.filter(s=>s.startsWith('mission')).map(s=>s.slice(8)),G.ORDER,'missions in campaign order');
for(const f of G.SECTORS)assert.equal(p.restorations[f],3,f+' reawakened');
assert.equal(log[0],'gate');assert.equal(log[1],'mission:moonwell-1');assert.equal(log[2],'restore:moonwell');
console.log('PASS: guided campaign goes tutorial -> gate -> 13 missions with automatic restorations -> finale, no Parts stalls.',log.length,'steps');

// Oct 28 2026: one new thing per mission (Tier III opens at each sector's mission 2 while guided)
{const assert=require('assert');const G=require('../game/guided.js');const E=require('../game/engine.js');
 const p={seals:{tutorial:{cleared:true}},missions:{}};
 assert.deepStrictEqual(G.tier3Locked(p,'moonwell-1'),['water','fire','ice','lightning']);
 assert.deepStrictEqual(G.tier3Locked(p,'moonwell-2'),['fire','ice','lightning']);
 assert.deepStrictEqual(G.tier3Locked(p,'stormcrown-2'),[]);
 const q={seals:{tutorial:{cleared:true}},missions:{'emberheart-2':{cleared:true}}};assert.ok(!G.tier3Locked(q,'outer').includes('fire'));
 const done={seals:{tutorial:{cleared:true}},missions:{'aetherheart-1':{cleared:true}}};assert.deepStrictEqual(G.tier3Locked(done,'moonwell-1'),[]);
 assert.strictEqual(G.missionNews('moonwell-1').eyebrow,'NEW ENEMY');
 assert.strictEqual(G.missionNews('moonwell-2',el=>E.TYPES[el].paths).title,'Water: Pressure Lance unlocked');
 assert.ok(/Two entrances/.test(G.missionNews('rimeglass-3').title));
 assert.ok(G.missionNews('aetherheart-1'));
 const g=new E.Game({},{mission:'outer',level:1});g.tier3Lock=['fire'];g.charge=9999;const r=g.build('fire',(()=>{for(let y=100;y<560;y+=10)for(let x=60;x<940;x+=10)if(g.placement(x,y).ok)return{x,y}})());
 const t=g.towers[0];assert.ok(t,'built');assert.ok(g.upgrade(t.id).ok);const u=g.upgrade(t.id,1);assert.strictEqual(u.ok,false,'second path locked');assert.ok(u.locked);
 assert.ok(g.upgrade(t.id,0).ok,'first path open');
 {const h=new E.Game({},{mission:'outer',level:1});h.tier3Lock=[];h.charge=9999;h.build('fire',{x:t.x,y:t.y});const v=h.towers[0];h.upgrade(v.id);assert.ok(h.upgrade(v.id,1).ok,'unlocked: second path open')}
 console.log('guided Tier III second-path locks and mission news ok')}
