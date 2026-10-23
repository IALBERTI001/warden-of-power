// The Warden's Guide (Oct 23 2026): chapters present, every picture shipped, opened from the hub and the battle screen.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {CHAPTERS}=require('../game/guide.js');const G=p=>path.join(__dirname,'..','game',p);
const ids=CHAPTERS.map(c=>c.id);for(const need of ['start','towers','combos','statuses','building','enemies','complex','modes','tips','controls'])assert(ids.includes(need),need);
for(const c of CHAPTERS){for(const m of c.html.matchAll(/assets\/guide\/[^"']+|\$\{IMG\}/g));const refs=[...c.html.matchAll(/(?:fig\('|tower-)([a-z0-9-]+)(?:\.jpg|')/g)];}
const src=fs.readFileSync(G('guide.js'),'utf8');for(const m of src.matchAll(/fig\('([^']+)'/g))assert(fs.existsSync(G('assets/guide/'+m[1])),m[1]);for(const t of ['fire','water','ice','lightning'])assert(fs.existsSync(G(`assets/guide/tower-${t}.png`)));
for(const m of src.matchAll(/data-g="([a-z]+)"/g))assert(ids.includes(m[1]),'link '+m[1]);
assert(/Water is the combo builder/.test(src),'combos chapter says Water builds combos');assert(/three-tower combo/.test(src),'shatter explained as three towers');
const hub=fs.readFileSync(G('hub.html'),'utf8'),idx=fs.readFileSync(G('index.html'),'utf8');assert(hub.includes('id="openHandbook"')&&hub.includes('guide.js'));assert(idx.includes('helpOpenGuide')&&idx.indexOf('guide.js')<idx.indexOf('game.js'),'guide loads before game.js');
console.log(`PASS: ${CHAPTERS.length} chapters, every screenshot shipped, opened from the hub and the battle Help.`);
