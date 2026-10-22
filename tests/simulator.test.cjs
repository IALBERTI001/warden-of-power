// Phase 1 gate: the balance simulator replays the tutorial exactly (deterministic) and permanent power helps.
const assert=require('node:assert/strict'),S=require('../tools/simulate.cjs');
const a=S.run(),b=S.run();assert.deepEqual(a,b,'same inputs, same result');
assert.equal(a.status,'won');assert.equal(a.waves,5);assert.equal(a.total,5);assert(a.combos.freeze>0&&a.combos.conduction>0&&a.combos.shatter>0,'all three combos happen with the plain bot');
const strong={restorations:{moonwell:3,emberheart:3,rimeglass:3,stormcrown:3,atelier:3},skills:{fire_pursuit:3,fire_furnace:3,lightning_wire:3,water_valve:3,eng_reserve:3}};
const c=S.run({profile:strong});assert.equal(c.status,'won');assert(c.seconds<a.seconds,'a stronger account clears the tutorial faster');
console.log(`PASS: simulator deterministic; tutorial 5/5 (${a.seconds}s, seal ${a.seal}); stronger account ${c.seconds}s.`);
