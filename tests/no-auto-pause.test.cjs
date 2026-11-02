// Pin (Nov 2 2026, user): only the player pauses. Switching tabs or windows must never set the pause.
const assert=require('node:assert/strict'),fs=require('fs');const src=fs.readFileSync(__dirname+'/../game/game.js','utf8');
const m=src.match(/document\.addEventListener\('visibilitychange',\(\)=>\{([^}]*)\}\)/);assert(m,'visibility handler present');
assert(!/paused\s*=\s*true/.test(m[1]),'tab switching must not pause: '+m[1]);
assert(!/addEventListener\('blur'[^;]*paused\s*=\s*true/.test(src),'window blur must not pause');
console.log('PASS no automatic pause');
