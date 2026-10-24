// Tower list (Engine Trials QoL, Oct 23 2026): every tower in a stack; clicking a row opens its normal upgrade window.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const G=f=>fs.readFileSync(path.join(__dirname,'..','game',f),'utf8');
const idx=G('index.html'),game=G('game.js'),css=G('style.css');
assert(idx.includes('id="towerList"')&&idx.includes('id="towerListButton"')&&idx.includes('id="towerSort"')&&idx.includes('id="towerRows"'));
assert(/\$\('towerListButton'\)\.hidden=!ENGINE_RUN/.test(game),'Engine Trials only');
assert(/function refresh\(\)\{markSkillsButton\(\);renderTowerList\(\);/.test(game),'kept in sync with every refresh');
assert(/b\.onclick=\(\)=>\{selected=\+b\.dataset\.tower/.test(game),'a row selects its tower, which opens the normal upgrade window');
assert(/body\.tower-list-open \.inspector/.test(css),'the upgrade window sits beside the list');
assert(/game\.ocPer\(\)\*100/.test(game),'Overcharge text follows Ascension I (+20%)');
console.log('PASS: tower list (Engine only, synced, row opens the upgrade window beside it, sorts).');
