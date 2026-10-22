const assert=require('node:assert/strict');
const G=require('../game/ground.js'),E=require('../game/engine.js');
for(const [x,y]of [[0,0],[325,300],[215,370],[1000,600],[-25,150],[965,550]]){const p=G.project(x,y),q=G.unproject(p.x,p.y);assert(Math.abs(q.x-x)<1e-9);assert(Math.abs(q.y-y)<1e-9)}
const tiles=G.roadMesh(E.PATH);assert(tiles.length>100);assert(tiles.some(t=>t.south));assert(tiles.some(t=>t.east));
for(let d=0;d<E.TOTAL;d+=12){const p=E.position(d);assert(tiles.some(t=>Math.hypot(t.x+12-p.x,t.y+12-p.y)<23),'Route center must stay over a stone at distance '+d)}
for(let i=1;i<tiles.length;i++)assert(tiles[i].depth>=tiles[i-1].depth);
// Projected world-space range points must invert back to the same range radius.
const origin={x:325,y:300},r=165;for(let k=0;k<20;k++){const a=k*Math.PI/10,p=G.project(origin.x+Math.cos(a)*r,origin.y+Math.sin(a)*r),q=G.unproject(p.x,p.y);assert(Math.abs(Math.hypot(q.x-origin.x,q.y-origin.y)-r)<1e-8)}
console.log('PASS: ground projection/inverse, stone coverage along the full route, road depth ordering, exposed edges, and projected range distances.');
