const assert=require('node:assert/strict'),P=require('../game/portals.js'),G=require('../game/ground.js'),E=require('../game/engine.js');
const entry=P.layout(P.ENTRY,G),exit=P.layout(P.EXIT,G);assert(exit.x>entry.x);assert(entry.top<entry.y);assert(exit.top<exit.y);
let rectangles=[],clips=0;const c={beginPath(){},rect(...v){rectangles.push(v)},clip(){clips++}};
P.clip(c,{distance:0},G,E.TOTAL);assert.equal(clips,1);assert.equal(rectangles[0][0],P.ENTRY.aperture[0]);assert.equal(rectangles[1][1],entry.y-2);
P.clip(c,{distance:E.TOTAL-1},G,E.TOTAL);assert.equal(clips,2);assert.equal(rectangles[2][0],P.EXIT.aperture[0]);assert.equal(rectangles[3][1],exit.y-2);
P.clip(c,{distance:700},G,E.TOTAL);assert.equal(clips,2);
const game=new E.Game();const enemy=game.spawn('slime',1);assert(!game.exposed(enemy));enemy.distance=42;assert(game.exposed(enemy));enemy.distance=E.TOTAL-46;assert(!game.exposed(enemy));
assert(!game.placement(125,100).ok);assert(!game.placement(925,340).ok);assert.equal(E.PATH[0][0],E.PATH[1][0]);assert(E.PATH[1][1]>E.PATH[0][1]);const end=E.PATH.at(-1),prev=E.PATH.at(-2);assert.equal(end[0],prev[0]);assert(end[1]<prev[1]);
console.log('PASS: entrance/exit geometry, partial reveal masks, no clipping mid-route, hidden-enemy targeting and doorway placement protection.');
