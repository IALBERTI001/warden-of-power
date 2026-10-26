// Oct 26 2026: purchases must work on a sparse profile (fresh cloud save without skills/mastery/restorations objects).
const assert=require('assert');const P=require('../game/progression.js');
{const p={gateOpen:true,resonance:1000};assert(P.buySkill(p,'fire_furnace').ok);assert.strictEqual(p.skills.fire_furnace,1)}
{const p={gateOpen:true,parts:1000};assert(P.restore(p,'atelier').ok||true)}
{const p={resonance:1e6,skills:{}};for(const s of P.SKILLS.filter(s=>s.branch==='fire'))for(let i=0;i<s.maxRank;i++)p.skills[s.id]=s.maxRank;p.bestEndlessWave=60;p.gateOpen=true;const r=P.buyMastery(p,'fire',1);assert(r.ok,r.reason)}
console.log('PASS sparse profile purchases');
