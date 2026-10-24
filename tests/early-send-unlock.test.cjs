// Bug (playtest, Oct 23 2026): sending the next tutorial wave early kept that lesson's element locked.
const assert=require('node:assert/strict'),E=require('../game/engine.js');
const g=new E.Game({});assert(g.build('fire',{x:230,y:300}).ok);g.startWave();for(let i=0;i<600&&g.spawnQueue.length;i++)g.step(1/60);
assert(g.enemies.length>0&&g.completed===0,'wave 1 still on the road');assert(!g.unlocked('water'));
assert(g.startWave(true).ok);assert(g.unlocked('water')&&g.unlocked('ice'),'Water and Ice open when wave 2 is sent early');assert(!g.unlocked('lightning'));
for(let i=0;i<600&&g.spawnQueue.length;i++)g.step(1/60);assert(g.startWave(true).ok);assert(g.unlocked('lightning'),'Lightning opens when wave 3 is sent early');
const h=new E.Game({});h.build('fire',{x:230,y:300});assert(!h.unlocked('water'),'still locked before any wave');
console.log('PASS: early sends unlock the lesson elements (Water/Ice with wave 2, Lightning with wave 3).');
