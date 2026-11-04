// node trailer.cjs MISSION OUTDIR W H SECONDS  (CAM env: [[t,zoom,cx,cy],...]) - trailer frames: the cover battle, then a camera move
const fs=require('fs');
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const {open,shot,PROF2}=require('./lib.cjs');
const [mission,out]=process.argv.slice(2,4);const [W,H,SEC]=[+process.argv[4],+process.argv[5],+process.argv[6]];const CAM=JSON.parse(process.env.CAM);const Z=CAM[0][1],CX=CAM[0][2],CY=CAM[0][3];fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch();const {pg}=await open(b,mission,{w:W,h:H,profile:{...PROF2,missions:{'moonwell-1':{cleared:true}}}});
 await pg.evaluate(()=>{game.charge=1e7;game.health=1e6;game.maxHealth=Math.max(game.maxHealth||0,20);const types=['fire','water','ice','lightning'];const spots=[];let n=0;
  const near=(x,y)=>{let best=1e9;for(const R of game.routes)for(let d=0;d<R.total;d+=5){const p=R.position(d);best=Math.min(best,Math.hypot(p.x-x,p.y-y))}return best};
  const cand=[];for(let y=90;y<=540;y+=7)for(let x=60;x<=900;x+=7){const dd=near(x,y);if(dd>46&&dd<80&&game.placement(x,y).ok)cand.push([x,y,dd])}
  cand.sort(()=>Math.random()-.5);for(const c of cand){if(n>=11)break;if(spots.every(s=>Math.hypot(s[0]-c[0],s[1]-c[1])>110)){const r=game.build(types[n%4],{x:c[0],y:c[1]});if(r.ok){spots.push(c);const t=game.towers[game.towers.length-1];game.upgrade(t.id);game.upgrade(t.id,n%2);n++}}}});
 const GAP=+(process.env.GAP||18);const plan=['shield','slime','runner','diver','golem','splitter','beetle','shield','diver','runner','splitter','slime'];let k=0;
 const spawn=async i=>{if(i%GAP===0){await pg.evaluate(([kk,j,x])=>{const e=game.spawn(kk,40,null,j%5===0,j%2,false,j%11===0);if(e)e.maxHp=e.hp=e.hp*x},[plan[k%plan.length],k,+(process.env.HPX||14)]);k++}};
 for(let i=0;i<+(process.env.ROLL||26)*30;i++){await spawn(i);await pg.evaluate(([z,x,y])=>{CAP.zoom=z;CAP.cx=x;CAP.cy=y;capStep(1/30,1)},[Z,CX,CY])}
 for(let f=0;f<SEC*30;f++){await spawn(f);const tt=f/30;let a=CAM[0],c=CAM[CAM.length-1];for(let i=0;i<CAM.length-1;i++)if(tt>=CAM[i][0]&&tt<=CAM[i+1][0]){a=CAM[i];c=CAM[i+1];break}
  const u=c[0]>a[0]?Math.min(1,Math.max(0,(tt-a[0])/(c[0]-a[0]))):0,e=u*u*(3-2*u);
  await pg.evaluate(([z,x,y])=>{CAP.zoom=z;CAP.cx=x;CAP.cy=y;game.health=1e6;capStep(1/30,1);fx=fx.filter(v=>v.kind!=='dmg'&&v.kind!=='label');draw()},[a[1]+(c[1]-a[1])*e,a[2]+(c[2]-a[2])*e,a[3]+(c[3]-a[3])*e]);
  await shot(pg,`${out}/f${String(f).padStart(4,'0')}.jpg`,.92)}
 await b.close()})();
