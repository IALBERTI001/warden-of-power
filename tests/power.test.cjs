// Warden Power v2, Tactician, Eternal Mastery and the hidden badge (approved Oct 23 2026).
const assert=require('node:assert/strict'),E=require('../game/engine.js'),P=require('../game/progression.js'),B=require('../game/badges.js');
// the power curve uses the Engine's own enemy health curve
for(const w of [1,50,333,1000])assert(Math.abs(P.hpAt(w)-E.ENGINE.hp(w))<1e-9*E.ENGINE.hp(w));
const full={gateOpen:true,restorations:{moonwell:3,emberheart:3,rimeglass:3,stormcrown:3,atelier:3},skills:{},mastery:{}};for(const s of P.SKILLS)full.skills[s.id]=s.maxRank;
const mast=JSON.parse(JSON.stringify(full));for(const b of P.BRANCHES){mast.mastery[b]={};for(let t=1;t<=5;t++)mast.mastery[b][t]=10}
assert.equal(P.powerRating({}),100,'fresh Warden = 100');
const seq=[{},{...full,skills:{}},full,mast,{...mast,ascension:1},{...mast,ascension:4},{...mast,ascension:5,eternal:94}].map(P.powerRating);
for(let i=1;i<seq.length;i++)assert(seq[i]>=seq[i-1],'power never drops as you progress');
// projected depth matches the simulator measurements it was fitted to (within a few waves)
assert(Math.abs(P.projectedDepth(mast)-154)<=4);assert(Math.abs(P.projectedDepth({...mast,ascension:4})-523)<=4);
// Tactician: depth beyond standard play, as enemy-toughness multiple
const crown={...mast,ascension:5};assert(Math.abs(P.tacticianFactor(P.projectedDepth(crown),crown)-1)<.05);assert.equal(P.tacticianRank(4.2),'Legend');assert.equal(P.tacticianRank(1.2),'Adept');
// Eternal Mastery: only after the Crown, capped at 94 ranks (about x16), escalating cost
assert(!P.eternalOffer({...mast,ascension:4,resonance:1e9}).ok);const c={...crown,resonance:1e9};for(let i=0;i<120;i++)P.buyEternal(c);assert.equal(c.eternal,94);assert(Math.abs(P.eternalFactor(c)-Math.pow(1.03,94))<1e-9&&P.eternalFactor(c)>15);
assert(P.ETERNAL.cost(2)>P.ETERNAL.cost(1));
{const g=new E.Game({...crown,eternal:94},{mission:'engine',seed:1}),h=new E.Game(crown,{mission:'engine',seed:1});const t={id:1,type:'fire',x:0,y:0,tier:3,spec:0,spent:0,target:'first'};g.towers.push({...t});h.towers.push({...t});assert(Math.abs(g.stats(g.towers[0]).damage/h.stats(h.towers[0]).damage-P.eternalFactor(c))<1e-9);
 const o=new E.Game({...crown,eternal:94},{mission:'outer',level:1}),o0=new E.Game(crown,{mission:'outer',level:1});o.towers.push({...t});o0.towers.push({...t});assert.equal(o.stats(o.towers[0]).damage,o0.stats(o0.towers[0]).damage,'Eternal Mastery only in the Engine')}
// after the Crown every run pays a fifth of the milestone for waves past 500 below your best
{const g=new E.Game({...crown,engineBest:700,bestEndlessWave:700},{mission:'engine',seed:1});g.completed=600;g.engineMilestone();assert.equal(g.banked,Math.round(E.ENGINE.resonance(120)*.2));const h=new E.Game({...mast,ascension:4,engineBest:700,bestEndlessWave:700},{mission:'engine',seed:1});h.completed=450;h.engineMilestone();assert.equal(h.banked,0)}
// the wave 1000 secret
{const w=E.engineWave(1000,()=>.3,1);assert(/The Thousandth/.test(w.name)&&w.trial);const g=new E.Game({...crown},{mission:'engine',seed:1});const b=g.spawn('boss',1000,null,false,0,true);assert(b.thousandth);
 g.completed=1000;g.engineMilestone();assert(g.profile.earned.eternal_thousand);assert(g.drain().some(e=>e.type==='thousandth'))}
assert(B.HIDDEN.has('eternal_thousand')&&!B.visible('eternal_thousand',{earned:{}})&&B.visible('eternal_thousand',{earned:{eternal_thousand:'x'}}));
assert.equal(B.publicTotal(E.ACHIEVEMENTS),E.ACHIEVEMENTS.length-1,'the secret is not counted');
// Tactician badges are awarded at run end
{const g=new E.Game({...crown},{mission:'engine',seed:1});g.completed=700;g.finish(false);const r=g.drain().find(e=>e.type==='result');assert(r.tactician&&r.tactician.factor>4);assert(g.profile.earned.tactician_legend&&g.profile.earned.tactician_master)}
console.log('PASS: Warden Power (measured, monotonic, projects simulator depth), Tactician, Eternal Mastery (cap, Engine only, post-500 pay), the hidden wave-1000 badge.');
