const assert=require('node:assert/strict');
const {Game,WAVES,waveProgress}=require('../game/engine.js');
assert.equal(WAVES.length,5);assert.equal(waveProgress(0),'0 / 5');assert.equal(waveProgress(5),'5 / 5');assert.equal(waveProgress(8),'5 / 5');
const g=new Game();g.build('fire',0);g.upgrade(g.towers[0].id);
for(let wave=1;wave<=5;wave++){
 if(wave===2){assert(g.build('water',1).ok);assert(g.build('ice',2).ok)}
 if(wave===3)assert(g.build('lightning',3).ok);
 assert(g.startWave().ok);
 for(let i=0;i<600*60&&g.completed<wave&&g.status==='playing';i++)g.step(1/60);
 assert.equal(g.completed,wave);
}
assert.equal(g.status,'won');assert(g.combos.freeze>0);assert(g.combos.conduction>0);assert(g.combos.shatter>0);assert(!g.startWave().ok);
console.log('PASS: five-wave beginner defense wins, affords required elements, triggers all real combos, and ends after wave five.');
