// Rest point (Oct 24 2026): every 100 Engine waves emits a breather event; never at a checkpoint start.
const assert=require('assert');const E=require('../game/engine.js');
const ev=(g)=>g.drain().filter(e=>e.type==='restPoint');
{const g=new E.Game({unboundOpen:true,restorations:{moonwell:1}},{mission:'engine',seed:1});g.drain();
 for(const w of [99,100,150,200]){g.completed=w;g.engineMilestone();const r=ev(g);assert.strictEqual(r.length,w%100===0?1:0,`wave ${w}`);if(r.length)assert.strictEqual(r[0].wave,w)}}
{const g=new E.Game({unboundOpen:true,ascension:2,engineBest:250},{mission:'engine',seed:1,start:200});g.drain();g.completed=200;g.engineMilestone();assert.strictEqual(ev(g).length,0,'no rest at the checkpoint you started from');g.completed=300;g.engineMilestone();assert.strictEqual(ev(g).length,1)}
console.log('PASS rest point: every 100 waves, not at the starting checkpoint.');
