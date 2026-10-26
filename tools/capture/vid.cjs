// node vid.cjs OUT W H SECONDS  (CAM env: [[t,zoom,cx,cy],...])  frames + metrics
const fs=require('fs');const {chromium}=require('/opt/npm-tools/node_modules/playwright');const {open,shot,PROF2}=require('./lib.cjs');
const [out,W,H,SEC]=[process.argv[2],+process.argv[3],+process.argv[4],+process.argv[5]];const CAM=JSON.parse(process.env.CAM);const WAVE=+(process.env.WAVE||150);
(async()=>{fs.mkdirSync(out,{recursive:true});const b=await chromium.launch();const {ctx,pg}=await open(b,'engine',{w:W,h:H,profile:PROF2});
 await pg.evaluate(()=>{game.charge=1e7;const spots=[];const types=['water','ice','fire','lightning','ice','water','fire','lightning','ice','fire','water','lightning'];
  for(const [ri,R] of game.routes.entries()){const near=(x,y)=>{let best=1e9,bd=0;for(let d=0;d<R.total;d+=4){const p=R.position(d);const h=Math.hypot(p.x-x,p.y-y);if(h<best){best=h;bd=d}}return bd<260?1e9:best};
   const cand=[];for(let y=150;y<=470;y+=6)for(let x=(ri?530:40);x<=(ri?960:470);x+=6){const dd=near(x,y);if(dd>48&&dd<95&&game.placement(x,y).ok)cand.push([x,y,dd])}
   cand.sort((a,b)=>a[2]-b[2]);let n=0;for(const c of cand){if(n>=10)break;if(spots.every(s=>Math.hypot(s[0]-c[0],s[1]-c[1])>80)&&game.placement(c[0],c[1]).ok){spots.push(c);const r=game.build(types[n%types.length],{x:c[0],y:c[1]});if(r.ok){const t=game.towers[game.towers.length-1];game.upgrade(t.id);game.upgrade(t.id,n%2)}n++}}}
 });
 const plan=(process.env.PLAN||'golem,slime,beetle,slime,golem,slime,beetle,golem,slime,slime').split(',');const gap=+(process.env.GAP||0.8);
 // pre-roll so the field is busy at frame 0
 const pre=+(process.env.PRE||9);let k=0,t=0;
 const tick=async(dt,record,f)=>{t+=dt;if(t>=gap){t=0;await pg.evaluate(([kind,w,k])=>{game.spawn(kind,w,null,false,k%2)},[plan[k%plan.length],WAVE,k]);k++}};
 for(let i=0;i<pre*30;i++){await tick(1/30);await pg.evaluate(()=>capStep(1/30,1))}
 const metr=[];
 for(let f=0;f<SEC*30;f++){await tick(1/30);const tt=f/30;let a=CAM[0],c=CAM[CAM.length-1];for(let i=0;i<CAM.length-1;i++)if(tt>=CAM[i][0]&&tt<=CAM[i+1][0]){a=CAM[i];c=CAM[i+1];break}
  const u=c[0]>a[0]?Math.min(1,Math.max(0,(tt-a[0])/(c[0]-a[0]))):0,e=u*u*(3-2*u);
  await pg.evaluate(([z,x,y])=>{CAP.zoom=z;CAP.cx=x;CAP.cy=y;capStep(1/30,1)},[a[1]+(c[1]-a[1])*e,a[2]+(c[2]-a[2])*e,a[3]+(c[3]-a[3])*e]);
  metr.push(await pg.evaluate(()=>{const v=e=>{const z=Math.max(CAP.w/1000,CAP.h/600)*CAP.zoom;return Math.abs(e.x-CAP.cx)<CAP.w/2/z&&Math.abs(e.y-CAP.cy)<CAP.h/2/z};return{frozen:game.enemies.filter(e=>e.alive&&e.frozen>0&&v(e)).length,alive:game.enemies.filter(e=>e.alive&&v(e)).length,fx:fx.filter(q=>['shatter','arc'].includes(q.kind)&&v(q.points?q.points[0]:q)).length}}));
  await shot(pg,`${out}/f${String(f).padStart(4,'0')}.jpg`,.93)}
 fs.writeFileSync(`${out}/metrics.json`,JSON.stringify(metr));await b.close()})();
