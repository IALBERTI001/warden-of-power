// Hub loop: tutorial rewards (Parts; first-time Seals pay 15 Parts each, no Resonance since Oct 22), replays pay less, hub assets present.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),E=require('../game/engine.js'),P=require('../game/progression.js');
const g=new E.Game({});g.combos={freeze:1,conduction:1,shatter:1};g.health=20;g.completed=5;g.finish(true);
assert.equal(g.profile.parts,80+3*E.SEAL_PARTS);assert.equal(g.profile.resonance||0,0,'Resonance only from the Aetherheart Engine');assert.deepEqual(g.profile.seals.tutorial,{cleared:true,held:true,challenge:true});
const r=new E.Game(g.profile);r.completed=5;r.finish(true);assert.equal(r.profile.parts,80+45+20,'replay pays 20 Parts, Seals only once');assert.equal(r.profile.resonance||0,0);
const l=new E.Game({});l.completed=3;l.finish(false);assert.equal(l.profile.parts,12);assert.equal(l.profile.resonance||0,0);
// first tutorial clear affords the gate and the first facility stage
const p=P.migrate(g.profile);assert(!P.restore(p,'moonwell').ok,'gate first');assert(P.openGate(p).ok);assert(P.restore(p,'moonwell').ok,'Parts left for the first facility stage');
for(const f of ['hub.html','hub.js','hub.css','assets/hub/hub-ruined.jpg','assets/hub/hub-restored.jpg'])assert(fs.existsSync(path.join(__dirname,'..','game',f)),f);
const html=fs.readFileSync(path.join(__dirname,'..','game','hub.html'),'utf8');for(const id of ['copySave','importSave','saveCode','testMode','resetAll','playNext','openSkills','openBadges'])assert(html.includes(`id="${id}"`),id);
console.log('PASS: tutorial pays Parts and first-time Seal Parts (no Resonance), replays pay less, rewards fund the first restoration and skill; hub files and save controls present.');
