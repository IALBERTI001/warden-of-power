const assert=require('node:assert/strict'),{Guide}=require('../game/tutorial.js'),{Game}=require('../game/engine.js');
const g=new Game(),guide=new Guide();assert.equal(guide.current()[0],'place');assert(!guide.canStart(g));
g.build('fire',{x:210,y:310});guide.sync(g);assert.equal(guide.current()[0],'inspect');
guide.record('inspect');assert.equal(guide.current()[0],'upgradeView');guide.record('upgradeView');assert.equal(guide.current()[0],'upgrade');
g.upgrade(g.towers[0].id);guide.sync(g);assert.equal(guide.current()[0],'target');guide.record('target');assert.equal(guide.current()[0],'sellView');guide.record('sellView');assert(guide.canStart(g));assert.equal(guide.current()[0],'wave');
g.wave=1;guide.sync(g);assert.equal(guide.current()[0],'water');const restored=new Guide(guide.save());assert.equal(restored.current()[0],'water');restored.skip();assert.equal(restored.current()[0],'ice');
// Reaching a new wave cannot silently complete an unperformed targeting lesson.
const actions=new Guide({done:{place:true,inspect:true,upgradeView:true,upgrade:true}});g.wave=8;actions.sync(g);assert.equal(actions.current()[0],'target');
console.log('PASS: action-based lessons, first-wave readiness, explicit targeting/sell teaching, save/restore and optional skips.');
