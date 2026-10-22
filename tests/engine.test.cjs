const assert=require('node:assert/strict');
const {Game,TYPES,TOTAL,position}=require('../game/engine.js');
function steps(game,seconds){for(let i=0;i<Math.round(seconds*60);i++)game.step(1/60)}
function shot(element,game,tier=1){return{element,stats:game.stats({type:element,tier,spec:0})}}
function enemy(game,kind='golem'){const e=game.spawn(kind,1);e.hp=e.maxHp=10000;e.distance=700;Object.assign(e,position(e.distance));return e}
{
 const g=new Game();assert.equal(g.build('ice',0).ok,false);let t=g.build('fire',0).tower;assert.equal(g.charge,105);assert.equal(g.build('fire',0).ok,false);assert.equal(g.sell(t.id).refund,60);assert.equal(g.charge,165);t=g.build('fire',0).tower;t.acted=true;assert.equal(g.sell(t.id).refund,45);assert.equal(g.profile.earned.first_foundation!==undefined,true);
}
{
 const g=new Game();g.charge=2000;const t=g.build('fire',0).tower;t.cooldown=.4;assert(g.upgrade(t.id).ok);assert.equal(t.cooldown,.4);assert.equal(g.upgrade(t.id).ok,false);assert(g.upgrade(t.id,1).ok);assert.equal(t.spec,1);assert.equal(g.upgrade(t.id,0).ok,false);
}
{
 const g=new Game();const e=enemy(g);g.hit(e,shot('ice',g));assert(e.chilled>0);assert.equal(e.frozen,0);g.hit(e,shot('water',g));g.hit(e,shot('ice',g));assert.equal(e.frozen,1.5);assert.equal(e.soaked,0);steps(g,.5);const frozen=e.frozen;g.hit(e,shot('water',g));g.hit(e,shot('ice',g));assert.equal(e.frozen,frozen);steps(g,1.1);assert(e.recovery>3.8&&e.recovery<=4);g.hit(e,shot('water',g));g.hit(e,shot('ice',g));assert.equal(e.frozen,0);steps(g,4.1);g.hit(e,shot('water',g));g.hit(e,shot('ice',g));assert.equal(e.frozen,1.5);g.hit(e,shot('fire',g));assert.equal(e.frozen,0);assert.equal(e.recovery,2);assert.equal(g.combos.shatter,1);
}
{
 const g=new Game();const e=enemy(g,'boss');g.hit(e,shot('water',g));g.hit(e,shot('ice',g));assert.equal(e.frozen,.75);
}
{
 const g=new Game();const foes=[0,1,2,3].map((_,i)=>{const e=enemy(g);e.x=100+i*60;e.y=200;return e});foes[0].soaked=4;g.hit(foes[0],shot('lightning',g,3));assert.equal(g.combos.conduction,1);assert(g.profile.earned.one_chain_four);assert(foes.every(e=>e.hp<e.maxHp));
}
{
 const g=new Game();const e=enemy(g);e.hp=1;const before=g.charge;assert(g.damage(e,2,'fire'));assert.equal(g.damage(e,2,'fire'),false);assert.equal(g.charge,before+e.reward);assert.equal(g.corpses.length,1);assert.equal(g.kills,1);
}
{
 function run(speed){const g=new Game();g.wave=4;g.completed=3;g.charge=5000;for(const [type,pad]of [['fire',0],['water',1],['ice',2],['lightning',3]]){const t=g.build(type,pad).tower;g.upgrade(t.id);g.upgrade(t.id,0)}g.startWave();for(let frame=0;frame<Math.round(75*60/speed);frame++)for(let i=0;i<speed;i++)g.step(1/60);return JSON.stringify({health:g.health,charge:g.charge,kills:g.kills,combos:g.combos,enemies:g.enemies.map(e=>[e.hp,e.distance,e.frozen,e.recovery])})}
 assert.equal(run(1),run(2));assert.equal(run(1),run(5));
}
{
 const g=new Game();g.wave=4;g.completed=3;const t=g.build('water',0).tower;const e=enemy(g);e.x=t.x+20;e.y=t.y;g.step(1);const p=g.projectiles[0];if(p){const damage=p.stats.damage;g.charge=1000;g.upgrade(t.id);assert.equal(p.stats.damage,damage)}
}
{
 const g=new Game();g.wave=4;g.completed=3;g.charge=1000;
 const t=g.build('fire',{x:410,y:280});assert(t.ok);assert.equal(t.tower.x,410);assert.equal(t.tower.y,280);assert.equal(t.tower.pad,null);
 const money=g.charge;assert.equal(g.build('ice',{x:411,y:281}).ok,false);assert.equal(g.charge,money);
 assert.equal(g.build('ice',{x:310,y:250}).ok,false);assert.equal(g.build('ice',{x:NaN,y:300}).ok,false);assert.equal(g.build('ice',{x:10,y:300}).ok,false);
 assert(g.build('water',{x:410,y:200}).ok);
}
console.log('PASS: free-coordinate placement, route/overlap/boundary validation, refunds, upgrade cooldown/specs, freeze consumption/non-extension, thaw/shatter recovery, boss resistance, conduction, one-time kills, projectile snapshots, and 1x/2x/5x deterministic outcomes.');
