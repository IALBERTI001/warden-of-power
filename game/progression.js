// Warden progression: permanent account power (Phase 1 foundation of the approved Campaign & Progression Plan).
// Pure data + functions, no DOM. Every bonus applies to every tower everywhere (tutorial, campaign, endless).
// Skill catalogue = the approved 20-node tree (design/ENDGAME_SKILL_TREE.md). All costs and restoration/mastery
// values are STARTING TARGETS for the balance simulator, not final balance.
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenProgression=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const ELEMENTS=['fire','water','ice','lightning'];
const BRANCHES=['fire','water','ice','lightning','engineering'];
// node: [id, branch, order, name, maxRank, costs[], effect key, per-rank value, cap?]
const SKILLS=[
 ['fire_furnace','fire',1,'Furnace tuning',3,[25,50,75],'burnPct',.08],
 ['fire_pursuit','fire',2,'Hot pursuit',3,[40,65,90],'impactPct',.06],
 ['fire_fracture','fire',3,'Thermal fracture',3,[55,80,105],'shatterPct',.10],
 ['fire_blast','fire',4,'Blast chamber',1,[120],'shatterRadiusPct',.20],
 ['water_saturation','water',1,'Deep saturation',3,[25,50,75],'soakPct',.10],
 ['water_reach','water',2,'Long reach',3,[40,65,90],'rangePct',.04],
 ['water_valve','water',3,'Pressure valve',3,[55,80,105],'speedPct',.05],
 ['water_overflow','water',4,'Overflow',1,[120],'soakExtra',1],
 ['ice_front','ice',1,'Cold front',3,[25,50,75],'slowPts',.02,.50],
 ['ice_brittle','ice',2,'Brittle targets',3,[40,65,90],'vsFrozenPct',.10],
 ['ice_focus','ice',3,'Crystal focus',3,[55,80,105],'rangePct',.04],
 ['ice_calc','ice',4,'Cold calculation',1,[120],'vsBossPct',.20],
 ['lightning_wire','lightning',1,'Live wire',3,[25,50,75],'damagePct',.06],
 ['lightning_close','lightning',2,'Close connection',3,[40,65,90],'conductPct',.08],
 ['lightning_force','lightning',3,'Conductive force',3,[55,80,105],'secondaryPct',.08],
 ['lightning_chain','lightning',4,'Chain reaction',1,[120],'chainExtra',1],
 ['eng_reserve','engineering',1,'Reserve capacity',3,[25,50,75],'startingCharge',20],
 ['eng_fittings','engineering',2,'Efficient fittings',3,[40,65,90],'upgradeDiscount',.02,.06],
 ['eng_reclaim','engineering',3,'Reclamation',3,[55,80,105],'refundPts',.05,.90],
 ['eng_current','engineering',4,'Stable current',1,[120],'fifthWaveCharge',30]
].map(([id,branch,order,name,maxRank,costs,key,value,cap])=>({id,branch,order,name,maxRank,costs,key,value,cap}));
// Facilities: three stages each, paid with Restoration Parts. Each stage adds a permanent bonus.
const FACILITIES=[
 {id:'moonwell',name:'Moonwell Cisterns',branch:'water',stages:['Drain the cisterns','Repair the pumps','Reawaken the Moonwell'],costs:[40,80,140],bonus:['damagePct',.05]},
 {id:'emberheart',name:'Emberheart Forge',branch:'fire',stages:['Clear the slag','Relight the forge','Reawaken the Emberheart'],costs:[40,80,140],bonus:['damagePct',.05]},
 {id:'rimeglass',name:'Rimeglass Vaults',branch:'ice',stages:['Thaw the doors','Rebuild the racks','Reawaken the Rimeglass'],costs:[40,80,140],bonus:['damagePct',.05]},
 {id:'stormcrown',name:'Stormcrown Spire',branch:'lightning',stages:['Raise the rods','Rewire the coils','Reawaken the Stormcrown'],costs:[40,80,140],bonus:['damagePct',.05]},
 {id:'atelier',name:"Cogwright's Atelier",branch:'engineering',stages:['Sweep the workshop','Restore the lathes','Reawaken the Atelier'],costs:[30,60,110],bonus:['startingCharge',15]}
];
// The Outer Seal Gate: the first restoration every Warden makes. Opens the road into the complex.
const GATE={name:'Outer Seal Gate',stage:'Raise the gate',cost:40,bonus:['startingCharge',10]};
// Mastery: tiers I-V per branch, 10 ranks each, unlocked by completing endless waves. Bounded and expandable.
const MASTERY={unlockWaves:[50,100,200,300,400],ranks:10,perRank:{fire:['damagePct',.02],water:['damagePct',.02],ice:['damagePct',.02],lightning:['damagePct',.02],engineering:['allDamagePct',.01]},cost:(tier,rank)=>40*tier+10*rank};

function blankProfile(){return{earned:{},counters:{freeze:0,conduction:0,shatter:0,early:0},parts:0,resonance:0,skills:{},restorations:{},mastery:{},bestEndlessWave:0,progressionVersion:2}}
// Upgrade an older save in place: keeps earned badges, counters and Parts; adds the new fields.
function migrate(profile={}){const p={...blankProfile(),...profile};p.skills={...(profile.skills||{})};p.restorations={...(profile.restorations||{})};p.mastery=JSON.parse(JSON.stringify(profile.mastery||{}));p.progressionVersion=2;return p}
const skill=id=>SKILLS.find(s=>s.id===id);
const rank=(p,id)=>Math.max(0,Math.min(skill(id)?.maxRank||0,Math.floor(p.skills?.[id]||0)));
// Raising the Outer Seal Gate relights its fire wards: the Fire branch opens first (the tutorial's first element).
function branchUnlocked(p,branch){if(branch==='fire'&&p.gateOpen)return true;const f=FACILITIES.find(f=>f.branch===branch);return (p.restorations?.[f.id]||0)>=1}
// What buying the next rank needs. Selecting/inspecting never spends; only buySkill does.
function skillOffer(p,id){const s=skill(id);if(!s)return{ok:false,reason:'Unknown skill.'};const r=rank(p,id);if(r>=s.maxRank)return{ok:false,reason:'Maximum rank.',rank:r};if(!branchUnlocked(p,s.branch))return{ok:false,reason:s.branch==='fire'?'Raise the Outer Seal Gate or restore the Emberheart Forge first.':`Restore the ${FACILITIES.find(f=>f.branch===s.branch).name} first.`,rank:r,cost:s.costs[r]};const prev=SKILLS.find(n=>n.branch===s.branch&&n.order===s.order-1);if(prev&&rank(p,prev.id)<1)return{ok:false,reason:`Needs ${prev.name} rank 1.`,rank:r,cost:s.costs[r]};const cost=s.costs[r];if((p.resonance||0)<cost)return{ok:false,reason:`Needs ${cost-(p.resonance||0)} more Resonance.`,rank:r,cost};return{ok:true,rank:r,cost}}
function buySkill(p,id){const o=skillOffer(p,id);if(!o.ok)return o;p.resonance-=o.cost;p.skills[id]=o.rank+1;return{ok:true,rank:o.rank+1,cost:o.cost}}
// Free reassignment between attempts: every rank refunded at full price.
function resetSkills(p){let back=0;for(const s of SKILLS){const r=rank(p,s.id);for(let i=0;i<r;i++)back+=s.costs[i]}p.resonance=(p.resonance||0)+back;p.skills={};return back}
function gateOffer(p){if(p.gateOpen)return{ok:false,reason:'The gate is open.'};if((p.parts||0)<GATE.cost)return{ok:false,reason:`Needs ${GATE.cost-(p.parts||0)} more Restoration Parts.`,cost:GATE.cost};return{ok:true,cost:GATE.cost}}
function openGate(p){const o=gateOffer(p);if(!o.ok)return o;p.parts-=o.cost;p.gateOpen=true;return{ok:true,cost:o.cost}}
function restorationOffer(p,id){const f=FACILITIES.find(f=>f.id===id);if(!f)return{ok:false,reason:'Unknown facility.'};if(!p.gateOpen)return{ok:false,reason:'Raise the Outer Seal Gate first.'};const stage=p.restorations?.[id]||0;if(stage>=f.stages.length)return{ok:false,reason:'Fully restored.',stage};const cost=f.costs[stage];if((p.parts||0)<cost)return{ok:false,reason:`Needs ${cost-(p.parts||0)} more Restoration Parts.`,stage,cost};return{ok:true,stage,cost,next:f.stages[stage]}}
function restore(p,id){const o=restorationOffer(p,id);if(!o.ok)return o;p.parts-=o.cost;p.restorations[id]=o.stage+1;return{ok:true,stage:o.stage+1,cost:o.cost}}
function masteryTierOpen(p,tier){return (p.bestEndlessWave||0)>=MASTERY.unlockWaves[tier-1]}
function masteryRanks(p,branch,tier){return Math.max(0,Math.min(MASTERY.ranks,Math.floor(p.mastery?.[branch]?.[tier]||0)))}
function masteryOffer(p,branch,tier){if(!BRANCHES.includes(branch)||tier<1||tier>MASTERY.unlockWaves.length)return{ok:false,reason:'Unknown mastery.'};const foundation=SKILLS.filter(s=>s.branch===branch).every(s=>rank(p,s.id)===s.maxRank);if(!foundation)return{ok:false,reason:'Complete this branch of the skill tree first.'};if(!masteryTierOpen(p,tier))return{ok:false,reason:`Complete endless wave ${MASTERY.unlockWaves[tier-1]} to open this tier.`};if(tier>1&&masteryRanks(p,branch,tier-1)<MASTERY.ranks)return{ok:false,reason:'Fill the previous tier first.'};const r=masteryRanks(p,branch,tier);if(r>=MASTERY.ranks)return{ok:false,reason:'Tier complete.'};const cost=MASTERY.cost(tier,r+1);if((p.resonance||0)<cost)return{ok:false,reason:`Needs ${cost-(p.resonance||0)} more Resonance.`,cost};return{ok:true,cost,rank:r}}
function buyMastery(p,branch,tier){const o=masteryOffer(p,branch,tier);if(!o.ok)return o;p.resonance-=o.cost;p.mastery[branch]=p.mastery[branch]||{};p.mastery[branch][tier]=o.rank+1;return{ok:true,cost:o.cost,rank:o.rank+1}}

// One aggregate of every permanent bonus. Each entry also lists its sources for the tower breakdown.
function bonuses(profile){const p=migrate(profile||{});const b={el:{},eng:{startingCharge:0,upgradeDiscount:0,refundPts:0,fifthWaveCharge:0},allDamagePct:0,sources:[]};for(const e of ELEMENTS)b.el[e]={damagePct:0,impactPct:0,burnPct:0,shatterPct:0,shatterRadiusPct:0,soakPct:0,soakExtra:0,rangePct:0,speedPct:0,slowPts:0,vsFrozenPct:0,vsBossPct:0,conductPct:0,secondaryPct:0,chainExtra:0};
 const add=(branch,key,value,source)=>{if(!value)return;if(branch==='engineering'){if(key==='allDamagePct')b.allDamagePct+=value;else b.eng[key]=(b.eng[key]||0)+value}else b.el[branch][key]=(b.el[branch][key]||0)+value;b.sources.push({branch,key,value,source})};
 for(const s of SKILLS){const r=rank(p,s.id);if(r){let v=s.value*r;add(s.branch,s.key,v,`${s.name} ${r}/${s.maxRank}`)}}
 if(p.gateOpen)add('engineering',GATE.bonus[0],GATE.bonus[1],GATE.name);
 for(const f of FACILITIES){const st=Math.min(f.stages.length,p.restorations[f.id]||0);if(st)add(f.branch,f.bonus[0],f.bonus[1]*st,`${f.name} ${st}/3`)}
 for(const br of BRANCHES)for(let t=1;t<=MASTERY.unlockWaves.length;t++){const r=masteryRanks(p,br,t);if(r){const [key,per]=MASTERY.perRank[br];add(br,key,per*r,`Mastery ${['I','II','III','IV','V'][t-1]} ${r}/10`)}}
 // caps from the approved tree
 for(const e of ELEMENTS){b.el[e].slowPts=Math.min(b.el[e].slowPts,.50)}b.eng.upgradeDiscount=Math.min(b.eng.upgradeDiscount,.06);b.eng.refundPts=Math.min(b.eng.refundPts,.15);
 return b}
// Total percentage added to an element's direct damage, used for the "Warden power" line.
function damageBonus(b,type){const e=b.el[type];return e.damagePct+(type==='fire'?e.impactPct:0)+b.allDamagePct}
// Warden Power: the total of every percentage bonus your towers carry (damage, burn, shatter, range, speed, soak, slow...).
const PCT_KEYS=['damagePct','impactPct','burnPct','shatterPct','shatterRadiusPct','soakPct','rangePct','speedPct','slowPts','vsFrozenPct','vsBossPct','conductPct','secondaryPct'];
function powerSummary(profile){const b=bonuses(profile);let t=b.allDamagePct*ELEMENTS.length+b.eng.upgradeDiscount+b.eng.refundPts;for(const e of ELEMENTS)for(const k of PCT_KEYS)t+=b.el[e][k]||0;return Math.round(t*100)}
return{ELEMENTS,BRANCHES,SKILLS,FACILITIES,GATE,gateOffer,openGate,MASTERY,blankProfile,migrate,rank,branchUnlocked,skillOffer,buySkill,resetSkills,restorationOffer,restore,masteryOffer,buyMastery,masteryTierOpen,bonuses,damageBonus,powerSummary};
});
