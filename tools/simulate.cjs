#!/usr/bin/env node
// Warden balance simulator (Phase 1 foundation). Plays the real engine headlessly with a fixed, readable bot
// strategy, so balance changes and account power can be measured instead of guessed.
//   node tools/simulate.cjs                     -> tutorial with an empty profile
//   node tools/simulate.cjs --profile p.json    -> same run with a saved profile's permanent bonuses
//   node tools/simulate.cjs --json              -> machine-readable result
// The bot never uses information a player could not see; it builds from a fixed plan, upgrades with spare
// Charge, and starts each wave once the previous one is cleared.
'use strict';
const fs=require('node:fs'),path=require('node:path');
const E=require(path.join(__dirname,'..','game','engine.js'));

// Build plan: element and spot, in order. Spots are valid open-floor positions near route bends.
const TUTORIAL_PLAN=[['fire',230,300],['water',410,260],['ice',440,410],['lightning',640,270],['fire',650,420],['water',840,300],['ice',850,450],['lightning',380,140],['fire',600,120]];

// For maps other than the tutorial: pick spots that cover the most road (valid, spaced), then cycle elements.
function autoPlan(g,count=12){const spots=[];for(let x=g.map.play.left+10;x<=g.map.play.right-10;x+=10)for(let y=g.map.play.top+10;y<=g.map.play.bottom-10;y+=10){if(!g.placement(x,y).ok)continue;let cover=0;for(const R of g.routes)for(let d=0;d<R.total;d+=8){const q=R.position(d);if(Math.hypot(q.x-x,q.y-y)<=150)cover++}spots.push([cover,x,y])}
 spots.sort((a,b)=>b[0]-a[0]);const chosen=[];for(const s of spots){if(chosen.every(c=>Math.hypot(c[1]-s[1],c[2]-s[2])>=95))chosen.push(s);if(chosen.length>=count)break}
 const order=['fire','water','ice','lightning'];return chosen.map((c,i)=>[order[i%4],c[1],c[2]])}
function run({profile={},mission='tutorial',level=1,seed=1,limit,start,dt=1/60,maxSeconds=3600}={}){
 const g=new E.Game(profile,{mission,level,seed,limit,start});const PLAN=mission==='tutorial'?TUTORIAL_PLAN:autoPlan(g,+(process.env.SIM_TOWERS||12));let built=0;const log=[];let t=0;
 const tryBuild=()=>{while(built<PLAN.length){const [type,x,y]=PLAN[built];if(!g.unlocked(type)||g.charge<E.TYPES[type].cost)return;const r=g.build(type,{x,y});if(!r.ok){built++;continue}built++}};
 const tryUpgrade=()=>{for(const tw of [...g.towers].sort((a,b)=>a.tier-b.tier||a.id-b.id)){if(tw.tier>=3)continue;const cost=g.upgradeCost(tw);const reserve=built<PLAN.length&&g.unlocked(PLAN[built][0])?E.TYPES[PLAN[built][0]].cost:0;if(g.charge-cost<reserve)continue;g.upgrade(tw.id,tw.tier===2?0:undefined)}};
 const tryOvercharge=()=>{if(!g.endless||built<PLAN.length)return;for(let k=0;k<200;k++){const t=[...g.towers].filter(t=>t.tier>=3).sort((a,b)=>(a.oc||0)-(b.oc||0)||a.id-b.id)[0];if(!t||g.charge<g.overchargeCost(t)+50)break;g.overcharge(t.id)}};
 let waveStart={health:g.health,time:0};
 while(g.status==='playing'&&t<maxSeconds){
  const idle=!g.spawnQueue.length&&!g.enemies.some(e=>e.alive);
  if(idle){tryBuild();for(let k=0;k<3;k++)tryUpgrade();if(process.env.SIM_OC!=='0')tryOvercharge();if(g.wave===g.completed&&g.waveAt(g.wave)){waveStart={health:g.health,time:t};g.startWave()}}
  g.step(dt);t+=dt;g.drain();
  if(g.completed>log.length+(g.start||0))log.push({wave:g.completed,name:g.waves[g.completed-1].name,sealLost:waveStart.health-g.health,seconds:+(t-waveStart.time).toFixed(1),charge:Math.floor(g.charge),towers:g.towers.length,tiers:g.towers.map(v=>v.tier).join('')});
 }
 return{status:g.status,waves:g.completed,total:g.waves.length,seal:g.health,kills:g.kills,combos:{...g.combos},seconds:+t.toFixed(1),log};
}

if(require.main===module){
 const args=process.argv.slice(2),i=args.indexOf('--profile');const profile=i>=0?JSON.parse(fs.readFileSync(args[i+1],'utf8')):{};
 const lv=args.indexOf('--level'),ms=args.indexOf('--mission');const r=run({profile,mission:ms>=0?args[ms+1]:'tutorial',level:lv>=0?+args[lv+1]:1});
 if(args.includes('--json'))console.log(JSON.stringify(r,null,2));
 else{console.log(`Result: ${r.status}  waves ${r.waves}/${r.total}  seal ${r.seal}/20  kills ${r.kills}  freezes ${r.combos.freeze}  conductions ${r.combos.conduction}  shatters ${r.combos.shatter}  ${r.seconds}s game time`);
  console.log('wave | seal lost | seconds | charge after | towers (tiers)');for(const w of r.log)console.log(`${String(w.wave).padStart(4)} | ${String(w.sealLost).padStart(9)} | ${String(w.seconds).padStart(7)} | ${String(w.charge).padStart(12)} | ${w.towers} (${w.tiers})  ${w.name}`)}
}
module.exports={run,autoPlan,PLAN:TUTORIAL_PLAN};
