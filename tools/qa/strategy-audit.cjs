// Strategy-fun audit (strategy-game-fun skill): one mission x build plans; JSON lines. Usage: node tools/qa/strategy-audit.cjs moonwell-1 "fire+water+ice+lightning:seed=1" "fire:seed=1" ...
// Strategy-fun audit runner: one mission x several build plans; prints JSON lines.
global.WardenCampaign=require(__dirname+'/../../game/campaign.js');
const E=require(__dirname+'/../../game/engine.js'),P=require(__dirname+'/../../game/progression.js'),C=require(__dirname+'/../../game/campaign.js'),G=require(__dirname+'/../../game/guided.js');
// guided profile at the moment each mission is played
function profileFor(mid){let p=P.migrate({});p.seals={tutorial:{cleared:true}};p.parts=80;for(let i=0;i<80;i++){const a=G.next(p,P,C);if(a.type==='gate'){P.openGate(p);continue}if(a.type==='restore'){P.restore(p,a.id);continue}if(a.type==='mission'){if(a.id===mid)return p;const m=C.mission(a.id);p.missions=p.missions||{};p.missions[a.id]={cleared:true};p.parts+=m.firstParts+C.SEAL_PARTS;continue}break}return p}
function spots(g,count,worst){const s=[];for(let x=g.map.play.left+10;x<=g.map.play.right-10;x+=10)for(let y=g.map.play.top+10;y<=g.map.play.bottom-10;y+=10){if(!g.placement(x,y).ok)continue;let cover=0;for(const R of g.routes)for(let d=0;d<R.total;d+=8){const q=R.position(d);if(Math.hypot(q.x-x,q.y-y)<=150)cover++}if(cover>0)s.push([cover,x,y])}
 s.sort((a,b)=>worst?a[0]-b[0]:b[0]-a[0]);const ch=[];for(const c of s){if(ch.every(d=>Math.hypot(d[1]-c[1],d[2]-c[2])>=95))ch.push(c);if(ch.length>=count)break}return ch}
function run(mission,order,{spec=0,worst=false,seed=1,count=12}={}){const profile=JSON.parse(JSON.stringify(profileFor(mission)));const g=new E.Game(profile,{mission,seed});const sp=spots(g,count,worst);const PLAN=sp.map((c,i)=>[order[i%order.length],c[1],c[2]]);
 let built=0,t=0;const waves=[];let ws={h:g.health};
 const tryBuild=()=>{while(built<PLAN.length){const [type,x,y]=PLAN[built];if(!g.unlocked(type)||g.charge<E.TYPES[type].cost)return;const r=g.build(type,{x,y});built++;if(!r.ok)continue}};
 const tryUp=()=>{for(const tw of [...g.towers].sort((a,b)=>a.tier-b.tier||a.id-b.id)){if(tw.tier>=3)continue;const cost=g.upgradeCost(tw);const reserve=built<PLAN.length?E.TYPES[PLAN[built][0]].cost:0;if(g.charge-cost<reserve)continue;g.upgrade(tw.id,tw.tier===2?spec:undefined)}};
 while(g.status==='playing'&&t<2400){const idle=!g.spawnQueue.length&&!g.enemies.some(e=>e.alive);if(idle){tryBuild();for(let k=0;k<3;k++)tryUp();if(g.wave===g.completed&&g.waveAt(g.wave)){ws={h:g.health};g.startWave()}}g.step(1/60);t+=1/60;g.drain();if(g.completed>waves.length)waves.push(ws.h-g.health)}
 return{mission,order:order.join('+'),spec,worst,seed,status:g.status,waves:g.completed,total:g.waves.length,seal:g.health,secs:Math.round(t),combos:g.combos,lost:waves}}
if(process.env.PATCH){for(const kv of process.env.PATCH.split(';')){const [k,v]=kv.split('=');const [t,f]=k.split('.');E.TYPES[t][f]=+v}}
if(process.env.TUNE)Object.assign(E.CAMP_TUNE,JSON.parse(process.env.TUNE));
const [mission,...builds]=process.argv.slice(2);
for(const b of builds){const [ord,opt]=b.split(':');const o={};if(opt)for(const kv of opt.split(',')){const [k,v]=kv.split('=');o[k]=v==='true'?true:isNaN(+v)?v:+v}console.log(JSON.stringify(run(mission,ord.split('+'),o)))}
