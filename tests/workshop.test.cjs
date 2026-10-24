// Cogwright's Workshop (approved Oct 24 2026): spare Parts buy permanent machinery upgrades.
const assert=require('assert');const E=require('../game/engine.js'),P=require('../game/progression.js');
const W=P.WORKSHOP;
{const p={restorations:{atelier:2},parts:5000};assert(!P.workshopOffer(p,'frames').ok,'locked until the Atelier is reawakened')}
const p={restorations:{atelier:3},parts:100000,gateOpen:true};
assert.strictEqual(P.workshopOffer(p,'frames').cost,W.costs[0]);
for(const u of W.upgrades)for(let i=0;i<W.max;i++)assert(P.buyWorkshop(p,u.id).ok);
assert(!P.workshopOffer(p,'seal').ok,'five ranks max');
const spent=W.upgrades.length*W.costs.reduce((a,c)=>a+c,0);assert.strictEqual(p.parts,100000-spent);
{const before=p.parts;assert.strictEqual(P.buyWorkshop(p,'tooling').cost,250);assert.strictEqual(P.buyWorkshop(p,'tooling').cost,275);assert.strictEqual(p.parts,before-525)}
{const q={restorations:{atelier:3},parts:10};const o=P.workshopOffer(q,'tooling');assert(!o.ok&&/more Parts/.test(o.reason))}
// effects in battle
const base=new E.Game({restorations:{atelier:3},gateOpen:true},{mission:'outer',level:1,seed:1}),g=new E.Game(p,{mission:'outer',level:1,seed:1});
assert.strictEqual(g.maxHealth,25);assert.strictEqual(g.health,25);assert.strictEqual(base.maxHealth,20);
assert.strictEqual(g.charge-base.charge,50,'Spare Coils +50');
assert.strictEqual(g.buildCost('fire'),Math.round(E.TYPES.fire.cost*.85));assert.strictEqual(base.buildCost('fire'),E.TYPES.fire.cost);
{const t={type:'fire',tier:1,spec:null};assert(Math.abs(g.stats(t).damage/base.stats(t).damage-1.02*(1+0)/1)<0.05,'tooling ×1.02')}
{const tg={type:'water',tier:1,spent:100,acted:true};assert(g.refund(tg)>base.refund(tg),'Salvage Rig')}
// Warden Power grows
assert(P.powerRating(p)>P.powerRating({restorations:{atelier:3},gateOpen:true}));
// early send pays Quick Crank
{const q=new E.Game(p,{mission:'outer',level:1,seed:2});q.charge=1e4;const pts=[];for(let y=120;y<560&&pts.length<1;y+=10)for(let x=120;x<900&&!pts.length;x+=10)if(q.placement(x,y).ok)pts.push([x,y]);q.build('fire',{x:pts[0][0],y:pts[0][1]});q.startWave();for(let i=0;i<200&&!q.enemies.some(e=>e.alive);i++)q.step(.05);
 q.spawnQueue.length=0;const c=q.charge;const r=q.startWave(true);assert(r.ok,r.reason);assert.strictEqual(q.charge-c,25,'Quick Crank +25')}
console.log('PASS workshop: offers, costs, caps, battle effects, power and early-send Charge.');
