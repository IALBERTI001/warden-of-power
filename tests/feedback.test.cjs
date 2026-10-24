// Playtest feedback form (Oct 23 2026): in the hub and in battles, sends to a Google Form.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const G=f=>fs.readFileSync(path.join(__dirname,'..','game',f),'utf8');
require('../game/feedback.js');const F=globalThis.WardenFeedback;assert(F&&typeof F.open==='function'&&F.CATEGORIES.includes('Bug'));
const hub=G('hub.html'),idx=G('index.html');assert(hub.includes('id="openFeedback"')&&hub.includes('feedback.js')&&hub.includes('feedback.css'));
assert(idx.includes('id="feedbackButton"')&&idx.indexOf('feedback.js')<idx.indexOf('game.js')&&idx.includes('feedback.css'));
assert(/mode:'no-cors'/.test(G('feedback.js'))&&/formResponse/.test(G('feedback.js')),'posts to the Google Form without leaving the game');
assert(/modalPaused=true/.test(G('game.js').slice(G('game.js').indexOf("feedbackButton"))),'pauses the battle while open');
console.log(`PASS: feedback form in hub and battles (${F.configured()?'connected to the Google Form':'not yet connected: copies to clipboard'}).`);
