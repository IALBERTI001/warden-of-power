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
