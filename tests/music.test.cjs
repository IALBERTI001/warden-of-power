// Nov 4 2026 (user-approved plan): each sector plays its own theme; Engine Trials play the player's pick.
const assert=require('node:assert/strict'),M=require('../game/music.js'),fs=require('node:fs'),path=require('node:path');
const none={},all={missions:{'moonwell-1':{cleared:true},'emberheart-1':{cleared:true},'rimeglass-1':{cleared:true},'stormcrown-1':{cleared:true},'aetherheart-1':{cleared:true}}};
assert.equal(M.trackFor('moonwell-2',none).id,'water');assert.equal(M.trackFor('emberheart-1',none).id,'fire');
assert.equal(M.trackFor('rimeglass-3',none).id,'ice');assert.equal(M.trackFor('stormcrown-2',none).id,'lightning');
assert.equal(M.trackFor('aetherheart-1',none).id,'engine');assert.equal(M.trackFor('tutorial',none).id,'classic');assert.equal(M.trackFor('outer',none).id,'classic');
assert.equal(M.trackFor('engine',all,'fire').id,'fire');assert.equal(M.trackFor('engine',all).id,'engine');
assert.equal(M.trackFor('engine',{missions:{'moonwell-1':{cleared:true}}},'fire').id,'classic','a locked pick falls back');
assert.ok(M.unlocked(all).some(t=>t.id===M.trackFor('engine',all,'shuffle',()=>.5).id));
assert.equal(M.pickerOpen(none),false);assert.equal(M.pickerOpen(all),true);
for(const t of M.TRACKS)if(t.id!=='classic')assert.ok(fs.existsSync(path.join(__dirname,'..','game',t.src)),t.src);
console.log('PASS music');
