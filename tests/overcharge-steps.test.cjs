// Overcharge +5 / +10 (Nov 2 2026): pays the sum of each level's normal price, all or nothing.
const assert=require('node:assert/strict'),E=require('../game/engine.js');
const g=new E.Game({bestEndlessWave:30,engineBest:30},{mission:'engine'});assert(g.endless);
g.charge=1e9;const t=g.build('fire',{x:500,y:150}).ok?g.towers[0]:null;assert(t,'built');t.tier=3;
const one=[];for(let i=0;i<5;i++){t.oc=i;one.push(g.overchargeCost(t))}t.oc=0;
assert.equal(g.overchargeCostN(t,5),one.reduce((a,b)=>a+b),'+5 costs the five single prices');
const before=g.charge;const r=g.overcharge(t.id,5);assert(r.ok);assert.equal(t.oc,5);assert.equal(before-g.charge,one.reduce((a,b)=>a+b));
g.charge=g.overchargeCostN(t,10)-1;const lvl=t.oc,ch=g.charge;assert(!g.overcharge(t.id,10).ok,'all or nothing');assert.equal(t.oc,lvl);assert.equal(g.charge,ch);
assert(g.overcharge(t.id,1).ok);assert.equal(t.oc,6);
console.log('PASS overcharge steps');
