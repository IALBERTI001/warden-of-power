// Badge catalogue: every achievement has a tier and artwork; progress and equip rules.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),E=require('../game/engine.js'),B=require('../game/badges.js');
assert.equal(E.ACHIEVEMENTS.length,28);
const ids=new Set();for(const [id,name,desc] of E.ACHIEVEMENTS){assert(!ids.has(id),'unique id '+id);ids.add(id);assert(B.TIERS[id],'tier for '+id);assert(name&&desc);
 const art=path.join(__dirname,'..','game',B.image(id,256));assert(fs.existsSync(art),'badge art missing: '+art);assert(fs.existsSync(path.join(__dirname,'..','game',B.image(id,128))));}
for(const id of Object.keys(B.TIERS))assert(ids.has(id),'tier entry without achievement: '+id);
assert.equal(B.tier('endless_500'),'prismatic');
assert.deepEqual(B.progress('freeze_twenty_five',{counters:{freeze:30}}),{value:25,goal:25});
assert.deepEqual(B.progress('early_wave_five',{counters:{early:2}}),{value:2,goal:5});
assert.equal(B.progress('first_foundation',{}),null);
const profile={earned:{first_upgrade:'2026-10-22'}};assert.equal(B.equip(profile,'tutorial_clear'),false,'cannot show an unearned badge');assert.equal(B.equip(profile,'first_upgrade'),true);assert.equal(profile.equipped,'first_upgrade');
assert(!B.available('endless_500'));assert(B.available('first_shatter'));
console.log('PASS: 28 badges, each with a tier and 256/128 artwork; locked badges cannot be shown; counters show capped progress.');
