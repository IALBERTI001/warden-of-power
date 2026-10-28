// Auto waves (Engine Trials QoL, Oct 23 2026): optional, off by default, Engine only, battle-time countdown.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const G=f=>fs.readFileSync(path.join(__dirname,'..','game',f),'utf8');
const game=G('game.js'),idx=G('index.html');
assert(idx.includes('id="autoWave"')&&idx.includes('id="autoWaveWrap"'),'toggle under the wave button');
assert(/const AUTO_DELAY=3/.test(game),'3-second countdown');
assert(/function autoWaveOn\(\)\{return ENGINE_RUN&&!!settings\.autoWave\|\|GUIDED_BATTLE\}/.test(game),'Engine Trials when chosen, or the guided campaign (Oct 28 2026)');
assert(/game\.step\(1\/60\);events\(\);autoWaveTick\(\)/.test(game),'ticks on battle time (pause and speed apply)');
assert(/autoAt=game\.time\+AUTO_DELAY/.test(game)&&/!autoArmed/.test(game),'first wave of a session is always started by the player');
assert(/\$\('autoWaveWrap'\)\.hidden=!ENGINE_RUN/.test(game));
console.log('PASS: Auto waves (Engine toggle off by default with a 3 s battle-time countdown; always on in the guided campaign with 6 s to build).');
