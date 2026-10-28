// Oct 28 2026 QA: the live tutorial plays on the Outer Seal map; a beginner plan on its pads wins with every combo.
const assert=require('node:assert/strict');const {Game,TUTORIAL_PADS}=require('../game/engine.js');
const g=new Game({},{mission:'tutorial',map:'outer'});assert.equal(g.map.id,'outer');assert.equal(TUTORIAL_PADS.length,11);
for(const [x,y] of TUTORIAL_PADS)assert(g.placement(x,y).ok,`pad ${x},${y} buildable`);
assert(g.build('fire',0).ok);
for(let wave=1;wave<=5;wave++){if(wave===2){assert(g.build('water',1).ok);assert(g.build('ice',3).ok)}if(wave===3)assert(g.build('lightning',5).ok);
 assert(g.startWave().ok);for(let i=0;i<600*60&&g.completed<wave&&g.status==='playing';i++)g.step(1/60);assert.equal(g.completed,wave)}
assert.equal(g.status,'won');assert(g.combos.freeze>0&&g.combos.conduction>0&&g.combos.shatter>0);
console.log('PASS tutorial on the Outer Seal map: pads buildable, beginner plan wins with all combos');
