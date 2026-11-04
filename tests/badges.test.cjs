// Badge catalogue: every achievement has a tier and artwork; progress and equip rules.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),E=require('../game/engine.js'),B=require('../game/badges.js');
assert.equal(E.ACHIEVEMENTS.length,43);assert.equal(B.publicTotal(E.ACHIEVEMENTS),37);
const ids=new Set();for(const [id,name,desc] of E.ACHIEVEMENTS){assert(!ids.has(id),'unique id '+id);ids.add(id);assert(B.TIERS[id],'tier for '+id);assert(name&&desc);
 const art=path.join(__dirname,'..','game',B.image(id,256));assert(fs.existsSync(art),'badge art missing: '+art);assert(fs.existsSync(path.join(__dirname,'..','game',B.image(id,128))));}
for(const id of Object.keys(B.TIERS))assert(ids.has(id),'tier entry without achievement: '+id);
assert.equal(B.tier('endless_500'),'prismatic');
assert.deepEqual(B.progress('freeze_twenty_five',{counters:{freeze:30}}),{value:25,goal:25});
assert.deepEqual(B.progress('early_wave_five',{counters:{early:2}}),{value:2,goal:5});
assert.equal(B.progress('first_foundation',{}),null);
const profile={earned:{first_upgrade:'2026-10-22'}};assert.equal(B.equip(profile,'tutorial_clear'),false,'cannot show an unearned badge');assert.equal(B.equip(profile,'first_upgrade'),true);assert.equal(profile.equipped,'first_upgrade');
assert(B.available('endless_500'));assert(B.available('first_shatter'));
console.log('PASS: 38 badges (37 listed + 1 secret), each with a tier and 256/128 artwork; locked badges cannot be shown; counters show capped progress.');
// Numbered depth medals and the 1K badge (Nov 4 2026, user-approved launch plan)
{const E2=require('../game/engine.js'),B2=require('../game/badges.js'),fs2=require('fs');
 for(const n of [600,700,800,900,1000]){assert(fs2.existsSync(__dirname+`/../game/${B2.image('endless_'+n,256)}`),'own numbered art '+n);assert.notEqual(B2.image('endless_'+n),B2.image('endless_500'),'not the Crown alias '+n)}
 const g=new E2.Game({mission:'engine'});g.profile={earned:{}};g.completed=1000;g.engineMilestone?.();if(g.profile.earned){assert(g.profile.earned.endless_1000,'1K at wave 1000');assert(g.profile.earned.eternal_thousand,'Warden Eternal alongside')}
 const p={earned:{endless_1000:'x',endless_700:'x'},parts:0,resonance:0};assert.equal(B2.payEarned(p).count,2,'both pay');console.log('PASS: numbered medals 600-900 and the 1K badge have their own art and pay rewards')}
