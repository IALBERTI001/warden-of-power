// In-world tutorial (coach) lesson plan + placement amendment. Pure logic; browser visuals verified separately.
const assert=require('node:assert/strict'),E=require('../game/engine.js'),{Guide}=require('../game/tutorial.js'),C=require('../game/coach.js');
const g=new E.Game(),guide=new Guide();
let p=C.plan(g,guide);assert.equal(p.index,0);assert.equal(p.step.id,'place');assert.equal(C.introDue(g,guide),0);
guide.record('intro_0');assert.equal(C.introDue(g,guide),null);
assert(g.build('fire',{x:230,y:300}).ok);guide.sync(g);assert.equal(C.plan(g,guide).step.id,'wave','QA Oct 28: build, then straight into wave 1');
g.upgrade(g.towers[0].id);guide.sync(g);
assert(g.startWave().ok);guide.sync(g);p=C.plan(g,guide);assert.equal(p.index,0,'wave 1 in progress stays on lesson 1');assert.equal(p.step,null);assert.equal(C.introDue(g,guide),null,'no briefing while enemies are on the route');
for(let i=0;i<60*120&&(g.spawnQueue.length||g.enemies.some(e=>e.alive));i++)g.step(1/60);
p=C.plan(g,guide);assert.equal(p.index,1);assert.equal(p.step.id,'water');assert.equal(C.introDue(g,guide),1);
// Every lesson's goals are real Guide steps (or the final win), so the tracker cannot drift from actual actions.
const ids=new Set(require('../game/tutorial.js').STEPS.map(s=>s[0]));for(const l of C.LESSONS)for(const [id] of l.goals)assert(ids.has(id),id);
assert.equal(C.LESSONS.length,E.WAVES.length);assert.equal(C.INTROS.length,E.WAVES.length);
// Placement amendment: anywhere on the visible courtyard floor except the route and doorways; route never blocked.
const h=new E.Game();
assert(h.placement(500,120).ok,'open floor near the top wall');assert(h.placement(60,450).ok,'open floor at the left edge');assert(h.placement(300,480).ok,'open floor low in the courtyard');
assert(!h.placement(125,130).ok,'entry doorway');assert(!h.placement(930,300).ok,'exit doorway');assert(!h.placement(310,300).ok,'on the route');assert(!h.placement(500,560).ok,'hidden behind the command dock');
for(let y=0;y<=600;y+=10)for(let x=0;x<=1000;x+=10)if(h.placement(x,y).ok)for(let i=0;i<E.PATH.length-1;i++){const [a,b]=[E.PATH[i],E.PATH[i+1]];const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));assert(Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy)>=60,'valid spot must leave the route clear')}
console.log('PASS: coach lesson plan follows real actions, briefings only between waves, lessons/intros match the five waves; placement allowed across the open floor, never on the route or doorways.');
