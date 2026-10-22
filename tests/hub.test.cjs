// Phase 2 hub loop: tutorial rewards (Parts, first-time Seals -> Resonance), replays pay less, hub assets present.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),E=require('../game/engine.js'),P=require('../game/progression.js');
const g=new E.Game({});g.combos={freeze:1,conduction:1,shatter:1};g.health=20;g.completed=5;g.finish(true);
assert.equal(g.profile.parts,80);assert.equal(g.profile.resonance,3*E.SEAL_RESONANCE);assert.deepEqual(g.profile.seals.tutorial,{cleared:true,held:true,challenge:true});
const r=new E.Game(g.profile);r.completed=5;r.finish(true);assert.equal(r.profile.parts,100,'replay pays 20 Parts');assert.equal(r.profile.resonance,120,'Seals pay Resonance only once');
const l=new E.Game({});l.completed=3;l.finish(false);assert.equal(l.profile.parts,12);assert.equal(l.profile.resonance,0);
// first tutorial clear affords the first restoration, which opens a skill branch the Resonance can buy into
const p=P.migrate(g.profile);assert(P.restore(p,'moonwell').ok);assert(P.buySkill(p,'water_saturation').ok);
for(const f of ['hub.html','hub.js','hub.css','assets/hub/hub-ruined.jpg','assets/hub/hub-restored.jpg'])assert(fs.existsSync(path.join(__dirname,'..','game',f)),f);
const html=fs.readFileSync(path.join(__dirname,'..','game','hub.html'),'utf8');for(const id of ['copySave','importSave','saveCode','testMode','resetAll','playNext','openSkills','openBadges'])assert(html.includes(`id="${id}"`),id);
console.log('PASS: tutorial pays Parts and first-time Seal Resonance, replays pay less, rewards fund the first restoration and skill; hub files and save controls present.');
