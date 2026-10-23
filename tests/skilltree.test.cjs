// Skill tree inside battles (QoL, Oct 23 2026): one shared module drives the hub and the battle dialog.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const G=f=>fs.readFileSync(path.join(__dirname,'..','game',f),'utf8');
globalThis.WardenProgression=require('../game/progression.js');require('../game/skilltree.js');const T=globalThis.WardenSkillTree,P=globalThis.WardenProgression;
assert(typeof T.render==='function'&&T.EFFECT.burnPct==='burn damage');
const p=P.blankProfile();p.gateOpen=true;p.restorations.emberheart=1;p.resonance=500;const id=T.firstSelectable(p,'fire');assert(P.SKILLS.find(s=>s.id===id).branch==='fire');
assert.deepEqual(T.nodeState({profile:p},P.SKILLS.find(s=>s.id===id)),['available','Available']);
const idx=G('index.html'),hub=G('hub.html'),game=G('game.js');
assert(idx.includes('id="skillsDialog"')&&idx.includes('id="skillsButton"')&&idx.indexOf('skilltree.js')<idx.indexOf('game.js')&&idx.includes('skilltree.css'));
assert(hub.indexOf('progression.js')<hub.indexOf('skilltree.js')&&hub.indexOf('skilltree.js')<hub.indexOf('hub.js'));
assert(/game\.bonus=window\.WardenProgression\?WardenProgression\.bonuses\(game\.profile\)/.test(game),'bonuses recomputed after a mid-run purchase');
assert(/e\.key==='k'/.test(game)&&/\$\('skillsButton'\)\.hidden=TUT/.test(game),'K opens it; hidden in the tutorial');
console.log('PASS: shared skill tree module, battle dialog + K hotkey, bonuses recomputed mid-run, hidden in the tutorial.');
