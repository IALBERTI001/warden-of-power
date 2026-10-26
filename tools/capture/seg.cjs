// node seg.cjs CONFIG.json  -> frames in cfg.out ; config: {mission,w,h,sec,cam:[[t,z,cx,cy]...],pre,wave,gap,plan,show:{type,x,y,at:[t2,t3],spec},noAuto,routes}
const fs=require('fs');const {chromium}=require('/opt/npm-tools/node_modules/playwright');const {open,shot,PROF2}=require('./lib.cjs');
const C=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
(async()=>{fs.mkdirSync(C.out,{recursive:true});const b=await chromium.launch();const {ctx,pg}=await open(b,C.mission,{w:C.w,h:C.h,profile:PROF2});
 const built=await pg.evaluate(C=>{game.charge=1e7;const show=C.show;const types=['water','ice','fire','lightning','ice','water','fire','lightning','ice','fire','water','lightning'];let n=0;const spots=[];
  const routes=C.routes??game.routes.length;
  for(let ri=0;ri<routes;ri++){const R=game.routes[ri];const near=(x,y)=>{let best=1e9,bd=0;for(let d=0;d<R.total;d+=4){const p=R.position(d);const h=Math.hypot(p.x-x,p.y-y);if(h<best){best=h;bd=d}}return bd<(C.dmin??200)||bd>(C.dmax??1e9)?1e9:best};
   const cand=[];for(let y=110;y<=520;y+=6)for(let x=40;x<=960;x+=6){if(routes>1&&(ri?x<520:x>480))continue;const dd=near(x,y);if(dd>48&&dd<95&&game.placement(x,y).ok)cand.push([x,y,dd])}
   cand.sort((a,b)=>a[2]-b[2]);let k=0;for(const c of cand){if(k>=(C.per??10))break;if(show&&Math.hypot(show.x-c[0],show.y-c[1])<95)continue;if(spots.every(s=>Math.hypot(s[0]-c[0],s[1]-c[1])>80)&&game.placement(c[0],c[1]).ok){spots.push(c);const r=game.build(types[n%types.length],{x:c[0],y:c[1]});if(r.ok){const t=game.towers[game.towers.length-1];game.upgrade(t.id);game.upgrade(t.id,n%2)}n++;k++}}}
  return spots.map(s=>[Math.round(s[0]),Math.round(s[1])])},C);
 const plan=(C.plan||'golem,slime,beetle,slime,golem,slime,beetle,golem,slime,slime').split(',');const gap=C.gap||0.8;let k=0,t=0;
 const tick=async dt=>{t+=dt;if(t>=gap){t=0;await pg.evaluate(([kind,w,r])=>{game.spawn(kind,w,null,false,r)},[plan[k%plan.length],C.wave||150,k%game_routes]);k++}};
 const game_routes=C.routes??await pg.evaluate(()=>game.routes.length);
 for(let i=0;i<(C.pre??8)*30;i++){await tick(1/30);await pg.evaluate(()=>capStep(1/30,1))}
 let showId=null;if(C.show){showId=await pg.evaluate(s=>{const r=game.build(s.type,{x:s.x,y:s.y});if(!r.ok)return 'ERR '+r.reason;const t=game.towers[game.towers.length-1];fx.push({kind:'tierup',x:t.x,y:t.y,at:game.time,life:.9,color:WardenEngine.TYPES[t.type].color,text:'BUILT',small:true});CAP.showTier=x=>x.id===t.id;return t.id},C.show);console.log('show',showId)}
 const done=new Set();
 for(let f=0;f<C.sec*30;f++){await tick(1/30);const tt=f/30;
  if(C.show)for(const [i,at] of C.show.at.entries())if(tt>=at&&!done.has(i)){done.add(i);console.log('up',await pg.evaluate(([id,spec])=>JSON.stringify(game.upgrade(id,spec)),[showId,C.show.spec??0]))}
  const K=C.cam;let a=K[0],c=K[K.length-1];for(let i=0;i<K.length-1;i++)if(tt>=K[i][0]&&tt<=K[i+1][0]){a=K[i];c=K[i+1];break}
  const u=c[0]>a[0]?Math.min(1,Math.max(0,(tt-a[0])/(c[0]-a[0]))):0,e=u*u*(3-2*u);
  await pg.evaluate(([z,x,y])=>{CAP.zoom=z;CAP.cx=x;CAP.cy=y;capStep(1/30,1)},[a[1]+(c[1]-a[1])*e,a[2]+(c[2]-a[2])*e,a[3]+(c[3]-a[3])*e]);
  await shot(pg,`${C.out}/f${String(f).padStart(4,'0')}.jpg`,.93)}
 console.log('towers',JSON.stringify(built));await b.close()})();
