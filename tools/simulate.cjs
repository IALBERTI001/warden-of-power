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
const PLAN=[['fire',230,300],['water',410,260],['ice',440,410],['lightning',640,270],['fire',650,420],['water',840,300],['ice',850,450],['lightning',380,140],['fire',600,120]];

function run({profile={},dt=1/60,maxSeconds=1800}={}){
 const g=new E.Game(profile);let built=0;const log=[];let t=0;
 const tryBuild=()=>{while(built<PLAN.length){const [type,x,y]=PLAN[built];if(!g.unlocked(type)||g.charge<E.TYPES[type].cost)return;const r=g.build(type,{x,y});if(!r.ok){built++;continue}built++}};
 const tryUpgrade=()=>{for(const tw of [...g.towers].sort((a,b)=>a.tier-b.tier||a.id-b.id)){if(tw.tier>=3)continue;const cost=g.upgradeCost(tw);const reserve=built<PLAN.length&&g.unlocked(PLAN[built][0])?E.TYPES[PLAN[built][0]].cost:0;if(g.charge-cost<reserve)continue;g.upgrade(tw.id,tw.tier===2?0:undefined)}};
 let waveStart={health:g.health,time:0};
 while(g.status==='playing'&&t<maxSeconds){
  const idle=!g.spawnQueue.length&&!g.enemies.some(e=>e.alive);
  if(idle){tryBuild();tryUpgrade();if(g.wave===g.completed&&g.wave<E.WAVES.length){waveStart={health:g.health,time:t};g.startWave()}}
  g.step(dt);t+=dt;g.drain();
  if(g.completed>log.length)log.push({wave:g.completed,name:E.WAVES[g.completed-1].name,sealLost:waveStart.health-g.health,seconds:+(t-waveStart.time).toFixed(1),charge:Math.floor(g.charge),towers:g.towers.length,tiers:g.towers.map(v=>v.tier).join('')});
 }
 return{status:g.status,waves:g.completed,total:E.WAVES.length,seal:g.health,kills:g.kills,combos:{...g.combos},seconds:+t.toFixed(1),log};
}

if(require.main===module){
 const args=process.argv.slice(2),i=args.indexOf('--profile');const profile=i>=0?JSON.parse(fs.readFileSync(args[i+1],'utf8')):{};
 const r=run({profile});
 if(args.includes('--json'))console.log(JSON.stringify(r,null,2));
 else{console.log(`Result: ${r.status}  waves ${r.waves}/${r.total}  seal ${r.seal}/20  kills ${r.kills}  freezes ${r.combos.freeze}  conductions ${r.combos.conduction}  shatters ${r.combos.shatter}  ${r.seconds}s game time`);
  console.log('wave | seal lost | seconds | charge after | towers (tiers)');for(const w of r.log)console.log(`${String(w.wave).padStart(4)} | ${String(w.sealLost).padStart(9)} | ${String(w.seconds).padStart(7)} | ${String(w.charge).padStart(12)} | ${w.towers} (${w.tiers})  ${w.name}`)}
}
module.exports={run,PLAN};
