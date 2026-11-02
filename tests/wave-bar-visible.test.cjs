// Pin (Nov 2 2026, user: "the send the next wave button is missing in my tutorial"): the wave bar hides only during
// tutorial wave 1; pop-up toasts may stay held longer, but never the Send-wave button.
const assert=require('node:assert/strict'),fs=require('fs');const src=fs.readFileSync(__dirname+'/../game/game.js','utf8');
const quiet=src.match(/function openingQuiet\(\)\{return ([^}]*)\}/)[1];assert(/completed<1\b/.test(quiet),'wave bar quiet window must end after wave 1, got: '+quiet);
assert(/toggle\('opening-quiet',openingQuiet\(\)\)/.test(src),'the CSS class that hides the wave bar follows openingQuiet');
const css=fs.readFileSync(__dirname+'/../game/style.css','utf8');assert(!/\.opening-quiet \.wave-bar/.test(css),'the wave bar is never hidden by the quiet opening');
console.log('PASS wave bar visible after tutorial wave 1');
