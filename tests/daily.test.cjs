// Daily reward (Nov 2 2026): locked until the campaign is complete, once per local day, streak grows to day 7, a missed day pauses it, Fridays add Resonance, no pay for a clock set back.
const assert=require('node:assert/strict'),P=require('../game/progression.js');
const at=(y,m,d)=>new Date(y,m-1,d,10).getTime();
const p=P.migrate({});assert.equal(P.dailyOffer(p,at(2026,11,2)).ok,false,'locked before the finale');
p.missions={'aetherheart-1':{cleared:true}};
const mon=P.claimDaily(p,at(2026,11,2));assert(mon.ok);assert.equal(mon.day,1);assert.equal(mon.parts,20);assert.equal(mon.resonance,0);assert.equal(p.parts,20);
assert.equal(P.dailyOffer(p,at(2026,11,2)).ok,false,'once a day');
const tue=P.claimDaily(p,at(2026,11,3));assert.equal(tue.day,2);assert.equal(tue.parts,30);
P.claimDaily(p,at(2026,11,4));P.claimDaily(p,at(2026,11,5));const fri=P.claimDaily(p,at(2026,11,6));assert.equal(fri.day,5);assert(fri.friday);assert.equal(fri.resonance,50);
const gap=P.claimDaily(p,at(2026,11,9));assert(gap.missed);assert.equal(gap.day,5,'a missed day pauses the streak');
assert.equal(P.dailyOffer(p,at(2026,11,8)).ok,false,'clock set back pays nothing');
for(let d=10;d<=20;d++)P.claimDaily(p,at(2026,11,d));assert.equal(P.dailyOffer(p,at(2026,11,21)).parts,80,'capped at day 7');
const m=P.migrate(JSON.parse(JSON.stringify(p)));assert.equal(m.daily.streak,p.daily.streak,'survives save/load');
console.log('PASS daily reward');
