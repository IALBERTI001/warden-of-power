// Nov 5 2026 (user playtest): after the tutorial builds the first Fire tower for the player, the Fire build ghost kept
// following the mouse. Every path that builds a tower must disarm the build cursor.
const assert=require('assert'),fs=require('fs');
const s=fs.readFileSync(__dirname+'/../game/game.js','utf8');
const re=/game\.build\(([^)]*)\);if\((\w+)\.ok\)\{([^}]{0,200})/g;let m,n=0;
while((m=re.exec(s))){n++;assert(/buildType=null/.test(m[3]),'a build path keeps the build cursor armed: '+m[0].slice(0,80))}
assert(n>=1,'build paths found');console.log('PASS: every tower build disarms the build cursor ('+n+' paths)');
