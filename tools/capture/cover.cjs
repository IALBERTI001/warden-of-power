// node cover.cjs MISSION OUT.jpg [W H ZOOM CX CY]  - a busy battle frame for store covers (towers built, mixed monsters incl. role variants)
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const {open,shot,PROF2}=require('./lib.cjs');
const [mission,out]=process.argv.slice(2,4);const [W,H,Z,CX,CY]=[+(process.argv[4]||1920),+(process.argv[5]||1080),+(process.argv[6]||1),+(process.argv[7]||500),+(process.argv[8]||300)];
(async()=>{const b=await chromium.launch();const {pg}=await open(b,mission,{w:W,h:H,profile:{...PROF2,missions:{'moonwell-1':{cleared:true}}}});
 await pg.evaluate(()=>{game.charge=1e7;game.health=1e6;game.maxHealth=Math.max(game.maxHealth||0,20);const types=['fire','water','ice','lightning'];const spots=[];let n=0;
  const near=(x,y)=>{let best=1e9;for(const R of game.routes)for(let d=0;d<R.total;d+=5){const p=R.position(d);best=Math.min(best,Math.hypot(p.x-x,p.y-y))}return best};
  const cand=[];for(let y=90;y<=540;y+=7)for(let x=60;x<=900;x+=7){const dd=near(x,y);if(dd>46&&dd<80&&game.placement(x,y).ok)cand.push([x,y,dd])}
  cand.sort(()=>Math.random()-.5);for(const c of cand){if(n>=11)break;if(spots.every(s=>Math.hypot(s[0]-c[0],s[1]-c[1])>110)){const r=game.build(types[n%4],{x:c[0],y:c[1]});if(r.ok){spots.push(c);const t=game.towers[game.towers.length-1];game.upgrade(t.id);game.upgrade(t.id,n%2);n++}}}});
 const plan=['shield','slime','runner','diver','golem','splitter','beetle','shield','diver','runner','splitter','slime'];
 for(let i=0;i<+(process.env.ROLL||14)*30;i++){if(i%18===0)await pg.evaluate(([k,i,x])=>{const e=game.spawn(k,40,null,i%5===0,i%2,false,i%11===0);if(e)e.maxHp=e.hp=e.hp*x},[plan[(i/18)%plan.length],i/18,+(process.env.HPX||6)]);await pg.evaluate(([z,x,y])=>{CAP.zoom=z;CAP.cx=x;CAP.cy=y;capStep(1/30,1)},[Z,CX,CY])}
 await pg.evaluate(()=>{fx=fx.filter(v=>v.kind!=='dmg'&&v.kind!=='label');draw()});await shot(pg,out,.95);await b.close()})();
