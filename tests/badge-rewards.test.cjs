// Badge rewards (Nov 2 2026): every badge pays once by tier; wave 1000 pays big and grants the Eternal Crown (+10% damage).
const assert=require('node:assert/strict'),B=require('../game/badges.js'),E=require('../game/engine.js');
const g=new E.Game({});const p0=g.profile.parts||0;g.award('first_foundation');assert.equal(g.profile.parts-p0,25,'bronze pays 25 Parts');
g.award('first_foundation');assert.equal(g.profile.parts-p0,25,'pays once');
const p={earned:{eternal_thousand:'x',close_call:'x'},parts:0,resonance:0};const r=B.payEarned(p);assert.equal(r.count,2);assert.equal(p.parts,5060);assert.equal(p.resonance,25025);assert(p.eternalCrown);
assert.equal(B.payEarned(p).count,0,'retroactive pay is once');
const a=new E.Game({}),b=new E.Game({eternalCrown:true});const ta={type:'fire',tier:1},tb={type:'fire',tier:1};assert(Math.abs(b.stats(tb).damage/a.stats(ta).damage-1.10)<1e-9,'crown +10% damage');
console.log('PASS badge rewards');
