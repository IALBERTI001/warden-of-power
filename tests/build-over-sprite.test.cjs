// Pin (Nov 2 2026, user): with an element selected, a click on a legal build spot builds even when it lands on the
// sprite of the tower below it; it must not open that tower instead.
const assert=require('node:assert/strict'),fs=require('fs');const src=fs.readFileSync(__dirname+'/../game/game.js','utf8');
assert(/if\(buildType&&\(game\.placement\(p\.x,p\.y\)\.ok\|\|/.test(src),'legal spot wins over a tower sprite while building');
console.log('PASS build over a tower sprite');
