const assert=require('node:assert/strict'),L=require('../game/tower-layout.js');
for(const type of ['fire','water','ice','lightning'])for(const [tier,spec]of [[1,null],[2,null],[3,0],[3,1]])for(const width of [60,75,95]){
 const p=L.placement(type,tier,spec,300,250,width);
 const opaqueFront=p.y+p.height*L.front(type,tier,spec);
 assert(Math.abs(opaqueFront-p.frontY)<1e-8);
 assert(p.y<250&&opaqueFront>250,'Sprite rises above the click point; its front corner sits just below it.');
 assert.equal(p.centerY,250,'The click point is the centre of the foundation (footprint marker and range circle).');
 assert(opaqueFront-250<=30,'Foundation front stays within the footprint marker.');
}
console.log('PASS: all 16 tower variants centre their foundation on the placement point and share the same ground anchor across sizes.');
