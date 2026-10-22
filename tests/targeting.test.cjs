const assert=require('node:assert/strict'),{Game}=require('../game/engine.js');
const g=new Game();g.charge=1000;const t=g.build('fire',{x:210,y:310}).tower;
const a=g.spawn('slime'),b=g.spawn('golem'),c=g.spawn('beetle');
Object.assign(a,{x:200,y:300,distance:200,hp:25});Object.assign(b,{x:220,y:315,distance:300,hp:120});Object.assign(c,{x:215,y:310,distance:250,hp:40});
t.target='first';assert.equal(g.chooseTarget(t).id,b.id);t.target='last';assert.equal(g.chooseTarget(t).id,a.id);t.target='strongest';assert.equal(g.chooseTarget(t).id,b.id);t.target='nearest';assert.equal(g.chooseTarget(t).id,c.id);c.alive=false;assert.notEqual(g.chooseTarget(t)?.id,c.id);a.x=b.x=900;assert.equal(g.chooseTarget(t),null);
console.log('PASS: shared simulation/reticle selector for first, last, strongest, nearest, dead and out-of-range enemies.');
