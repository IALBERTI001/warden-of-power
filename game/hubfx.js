// Hub scene: painted restoration stages, living effects on restored areas, and the restoration moment.
// Approved Oct 22 2026 (Contracts, Restoration Animation & Resistant Foes plan).
// Painting coordinates are 1536 x 1024. Stage art: assets/hub/stages/<facility>-stage<1|2|3>.png (crop of the box),
// gate: gate-sealed.png. Missing stage art falls back to the next painted stage, so the hub always draws.
(function(root){'use strict';
const BOXES={moonwell:[0,0,576,416],emberheart:[640,0,1136,352],rimeglass:[0,400,512,896],stormcrown:[864,192,1280,640],atelier:[704,544,1152,864],gate:[448,640,832,1024],aetherheart:[416,224,832,608]};
const COLORS={moonwell:'#5fd2ef',emberheart:'#ff9a3c',rimeglass:'#bfeeff',stormcrown:'#c79bff',atelier:'#ffd36b',gate:'#ffd36b',aetherheart:'#ffe08a'};
// Looping effects per facility and stage: [type, x, y, extra]
const LOOPS={
 gate:{1:[['flame',545,722],['flame',695,722]]},
 moonwell:{2:[['fall',430,140],['fall',360,60],['shimmer',300,160]],3:[['fall',125,215],['fall',205,215],['fall',270,160],['fall',400,200],['fall',430,140],['fall',245,100],['fountain',360,60],['fountain',240,125],['shimmer',190,270],['shimmer',420,215]]},
 emberheart:{2:[['smoke',945,20],['ember',880,195,.5]],3:[['smoke',945,20],['smoke',1045,72],['flame',945,30],['flame',1045,82],['ember',880,195,1],['ember',860,215,1]]},
 rimeglass:{2:[['glint',190,490],['glint',260,600]],3:[['glint',190,490],['glint',260,600],['glint',210,650],['glint',285,720],['glint',380,660],['snow',250,560]]},
 stormcrown:{2:[['spark',1060,330]],3:[['spark',1060,330],['spark',1045,380],['bolt',1065,248],['glint',1065,250]]},
 aetherheart:{4:[['glint',560,330],['glint',650,330]],5:[['glint',600,300],['glint',570,330],['glint',640,330],['shimmer',600,290]]},
 atelier:{2:[['window',890,700],['glint',945,722]],3:[['window',890,700],['window',840,690],['glint',945,722],['steam',1000,640],['steam',960,600]]}
};
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FX={canvas:null,ctx:null,base:null,restored:null,art:{},layers:{},state:{},moment:null,particles:[],last:0,running:false,onMoment:null};

function load(src){return new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.onerror=()=>ok(null);i.src=src})}
function feather(img,box,edge=36){const w=box[2]-box[0],h=box[3]-box[1],c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.drawImage(img,0,0,w,h);
 // soft rectangular feather so painted crops melt into the base painting
 const m=document.createElement('canvas');m.width=w;m.height=h;const mx=m.getContext('2d');mx.fillStyle='#000';mx.filter=`blur(${edge/2}px)`;mx.fillRect(edge,edge,w-2*edge,h-2*edge);
 x.globalCompositeOperation='destination-in';x.drawImage(m,0,0);return c}
function cropOf(img,box){const w=box[2]-box[0],h=box[3]-box[1],c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(img,box[0],box[1],w,h,0,0,w,h);return c}
async function init(canvas,base,restored){FX.canvas=canvas;FX.ctx=canvas.getContext('2d');FX.base=base;FX.restored=restored;
 const jobs=[];for(const id of Object.keys(BOXES)){if(id==='aetherheart'){jobs.push(Promise.all([1,2,3,4,5].map(n=>load(`assets/hub/stages/aetherheart-asc${n}.png`))).then(list=>{FX.art.aetherheart={};list.forEach((im,i)=>{if(im)FX.art.aetherheart[i+1]=feather(im,BOXES.aetherheart,48)})}));continue}if(id==='gate'){jobs.push(load('assets/hub/stages/gate-sealed.png').then(i=>{FX.art.gate={sealed:i?feather(i,BOXES.gate):null,open:null}}));continue}
  jobs.push(Promise.all([load(`assets/hub/stages/${id}-stage1.png`),load(`assets/hub/stages/${id}-stage2.png`)]).then(([a,b])=>{FX.art[id]={1:a&&feather(a,BOXES[id]),2:b&&feather(b,BOXES[id]),3:feather(cropOf(restored,BOXES[id]),BOXES[id])}}))}
 await Promise.all(jobs)}
// The best available picture for a facility stage (0 = ruined base, nothing drawn).
function layerFor(id,s){if(id==='aetherheart'){const a=FX.art.aetherheart||{};for(let k=s;k>=1;k--)if(a[k])return a[k];return null}if(id==='gate')return s>=1?null:FX.art.gate?.sealed;if(!s)return null;const a=FX.art[id]||{};for(let k=s;k<=3;k++)if(a[k])return a[k];return null}
function setState(state){FX.state={...state};compose();ensureLoop()}
let composed=null;
function compose(skip){const c=composed||(composed=document.createElement('canvas'));c.width=1536;c.height=1024;const x=c.getContext('2d');x.drawImage(FX.base,0,0);
 for(const id of Object.keys(BOXES)){if(id===skip)continue;const L=layerFor(id,FX.state[id]||0);if(L)x.drawImage(L,BOXES[id][0],BOXES[id][1])}return c}

// ---------- particles ----------
function rnd(a,b){return a+Math.random()*(b-a)}
function spawn(type,x,y,k=1){const P=FX.particles;switch(type){
 case'fall':P.push({t:'drop',x:x+rnd(-6,6),y,vx:0,vy:rnd(40,70),life:rnd(.5,.9),c:'rgba(200,245,255,',r:rnd(1.5,2.6)});break;
 case'fountain':P.push({t:'drop',x,y,vx:rnd(-18,18),vy:rnd(-60,-30),g:120,life:rnd(.6,1),c:'rgba(190,240,255,',r:rnd(1.4,2.2)});break;
 case'shimmer':P.push({t:'glint',x:x+rnd(-40,40),y:y+rnd(-15,15),life:rnd(.5,1),c:'rgba(220,250,255,',r:rnd(1.5,3)});break;
 case'smoke':P.push({t:'puff',x:x+rnd(-4,4),y,vx:rnd(4,12),vy:rnd(-22,-14),life:rnd(1.8,2.8),c:'rgba(90,80,85,',r:rnd(5,9),grow:9});break;
 case'steam':P.push({t:'puff',x:x+rnd(-4,4),y,vx:rnd(-4,6),vy:rnd(-20,-12),life:rnd(1.2,1.8),c:'rgba(235,235,240,',r:rnd(3,6),grow:8});break;
 case'ember':if(Math.random()<k)P.push({t:'spark',x:x+rnd(-14,14),y,vx:rnd(-10,10),vy:rnd(-45,-25),life:rnd(.6,1.2),c:'rgba(255,170,70,',r:rnd(1.2,2.2)});break;
 case'flame':P.push({t:'flame',x:x+rnd(-3,3),y,vx:0,vy:rnd(-30,-18),life:rnd(.25,.45),c:'rgba(255,190,90,',r:rnd(3,5)});break;
 case'glint':P.push({t:'glint',x:x+rnd(-10,10),y:y+rnd(-10,10),life:rnd(.4,.8),c:'rgba(255,255,255,',r:rnd(2,4)});break;
 case'snow':P.push({t:'drop',x:x+rnd(-140,140),y:y-rnd(80,160),vx:rnd(-6,6),vy:rnd(10,22),life:rnd(2,3.5),c:'rgba(240,250,255,',r:rnd(1,2)});break;
 case'spark':P.push({t:'zap',x:x+rnd(-18,18),y:y+rnd(-14,14),life:.18,c:'rgba(220,180,255,',r:rnd(6,12)});break;
 case'bolt':P.push({t:'bolt',x,y,life:.22,c:'rgba(235,215,255,',pts:Array.from({length:6},(_,i)=>[x+rnd(-14,14),y-12-i*18])});break;
 case'window':P.push({t:'window',x,y,life:.5,c:'rgba(255,200,110,',r:rnd(9,13)});break;
 case'dust':P.push({t:'puff',x:x+rnd(-60,60),y:y+rnd(-30,40),vx:rnd(-20,20),vy:rnd(-30,-8),life:rnd(.8,1.4),c:'rgba(170,150,120,',r:rnd(6,12),grow:14});break;
 case'sweep':P.push({t:'spark',x:x+rnd(-20,20),y:y+rnd(-20,20),vx:rnd(-30,30),vy:rnd(-60,-20),life:rnd(.5,.9),c:k,r:rnd(1.5,3)});break}}
const RATES={fall:14,fountain:10,shimmer:3,smoke:2.2,steam:2.5,ember:6,flame:14,glint:1.6,snow:3,spark:3,bolt:.5,window:2.4};
function emit(dt){if(reduced)return;for(const [id,byStage] of Object.entries(LOOPS)){const s=FX.state[id]||0;if(FX.moment&&FX.moment.id===id&&FX.moment.p<.75)continue;const set=id==='aetherheart'?byStage[s]:byStage[s>=3?3:s]||(id==='gate'&&s>=1?byStage[1]:null);if(!set)continue;
 for(const [type,x,y,k] of set){let n=RATES[type]*dt;while(n>0){if(Math.random()<n)spawn(type,x,y,k);n--}}}}
function drawParticles(x,dt){const P=FX.particles;for(let i=P.length-1;i>=0;i--){const p=P[i];p.age=(p.age||0)+dt;if(p.age>=p.life){P.splice(i,1);continue}const a=1-p.age/p.life;p.vy+=(p.g||0)*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;
 if(p.t==='puff'){const r=p.r+(p.grow||0)*p.age;x.fillStyle=p.c+(.35*a)+')';x.beginPath();x.arc(p.x,p.y,r,0,7);x.fill()}
 else if(p.t==='glint'){const r=p.r*Math.sin(Math.PI*p.age/p.life);x.strokeStyle=p.c+(.9*a)+')';x.lineWidth=1.4;x.beginPath();x.moveTo(p.x-r*2,p.y);x.lineTo(p.x+r*2,p.y);x.moveTo(p.x,p.y-r*2);x.lineTo(p.x,p.y+r*2);x.stroke()}
 else if(p.t==='zap'){x.strokeStyle=p.c+a+')';x.lineWidth=1.6;x.beginPath();x.moveTo(p.x,p.y);for(let k=0;k<3;k++)x.lineTo(p.x+rnd(-p.r,p.r),p.y+rnd(-p.r,p.r));x.stroke()}
 else if(p.t==='bolt'){x.strokeStyle=p.c+a+')';x.lineWidth=2.4;x.shadowColor='#c79bff';x.shadowBlur=10;x.beginPath();p.pts.forEach(([px,py],k)=>k?x.lineTo(px,py):x.moveTo(px,py));x.stroke();x.shadowBlur=0}
 else if(p.t==='window'){const g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2);g.addColorStop(0,p.c+(.25*Math.sin(Math.PI*p.age/p.life))+')');g.addColorStop(1,p.c+'0)');x.fillStyle=g;x.beginPath();x.arc(p.x,p.y,p.r*2,0,7);x.fill()}
 else if(p.t==='flame'){x.fillStyle=p.c+(.7*a)+')';x.beginPath();x.arc(p.x,p.y,p.r*a+1,0,7);x.fill()}
 else{x.fillStyle=(p.c.startsWith('#')?p.c:p.c+a+')');x.globalAlpha=p.c.startsWith('#')?a:1;x.beginPath();x.arc(p.x,p.y,p.r,0,7);x.fill();x.globalAlpha=1}}}

// ---------- the restoration moment ----------
// from/to are stage numbers (gate: 0 sealed -> 1 open). Skippable; reduced motion = short crossfade.
function playMoment(id,from,to,done){const dur=reduced?.6:3.2;FX.moment={id,from,to,t:0,p:0,dur,done};FX.state[id]=from;compose(id);FX.state[id]=to;ensureLoop()}
function skipMoment(){if(FX.moment){FX.moment.t=FX.moment.dur}}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2}
function drawMoment(x,dt){const m=FX.moment;m.t+=dt;m.p=Math.min(1,m.t/m.dur);const b=BOXES[m.id],cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,w=b[2]-b[0],h=b[3]-b[1];
 const oldL=layerFor(m.id,m.from),newL=layerFor(m.id,m.to);
 if(reduced){x.drawImage(composed,0,0);if(oldL)x.drawImage(oldL,b[0],b[1]);x.globalAlpha=m.p;if(m.id==='gate'){x.drawImage(cropOf(FX.base,b),b[0],b[1])}else if(newL)x.drawImage(newL,b[0],b[1]);x.globalAlpha=1;return}
 const zIn=easeInOut(Math.min(1,m.t/.6)),zOut=easeInOut(Math.max(0,(m.t-(m.dur-.6))/.6)),z=1+.32*(zIn-zOut);
 const k=zIn-zOut,clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v)),fx=clamp(768+(cx-768)*k,768/z,1536-768/z),fy=clamp(512+(cy-512)*k,512/z,1024-512/z);x.save();x.translate(768,512);x.scale(z,z);x.translate(-fx,-fy);
 x.drawImage(composed,0,0);if(oldL)x.drawImage(oldL,b[0],b[1]);
 // reveal the new stage behind a diagonal elemental sweep
 const s=Math.max(0,Math.min(1,(m.t-1.1)/1.0)),edge=b[0]-h+(w+h*2)*s;
 if(s>0){x.save();x.beginPath();x.moveTo(b[0]-h,b[1]);x.lineTo(edge,b[1]);x.lineTo(edge-h,b[3]);x.lineTo(b[0]-2*h,b[3]);x.closePath();x.clip();
  if(m.id==='gate')x.drawImage(cropOf(FX.base,b),b[0],b[1]);else if(newL)x.drawImage(newL,b[0],b[1]);x.restore();
  if(s<1){x.save();x.globalCompositeOperation='lighter';const g=x.createLinearGradient(edge-60,0,edge+20,0);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.7,COLORS[m.id]+'88');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.moveTo(edge-80,b[1]);x.lineTo(edge+20,b[1]);x.lineTo(edge-h+20,b[3]);x.lineTo(edge-h-80,b[3]);x.closePath();x.fill();x.restore();
   for(let k=0;k<4;k++)spawn('sweep',edge-h*Math.random(),b[1]+h*Math.random(),COLORS[m.id])}}
 if(m.t>.4&&m.t<1.5)for(let k=0;k<3;k++)spawn('dust',cx,cy+h*.15);
 drawParticles(x,dt);x.restore();
 // dim the rest of the complex while the moment plays
 const dim=.4*k;if(dim>0){const sx=768+(cx-fx)*z,sy=512+(cy-fy)*z,g=x.createRadialGradient(sx,sy,Math.min(w,h)*.45*z,sx,sy,Math.max(w,h)*.95*z);g.addColorStop(0,'rgba(10,6,16,0)');g.addColorStop(1,`rgba(10,6,16,${dim})`);x.fillStyle=g;x.fillRect(0,0,1536,1024)}
 if(m.p>=1){const done=m.done;FX.moment=null;compose();done&&done()}}

function frame(now){const dt=Math.min(.05,(now-(FX.last||now))/1000);FX.last=now;const x=FX.ctx;
 if(FX.moment)drawMoment(x,dt);else{x.drawImage(composed,0,0);emit(dt);drawParticles(x,dt)}
 if(FX.moment||(!reduced&&!document.hidden&&hasLoops()))requestAnimationFrame(frame);else{FX.running=false;FX.last=0}}
function hasLoops(){return Object.entries(LOOPS).some(([id,by])=>{const s=FX.state[id]||0;return by[s>=3?3:s]||(id==='gate'&&s>=1)})}
function ensureLoop(){if(!composed)return;if(!FX.running){FX.running=true;requestAnimationFrame(frame)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ensureLoop()});
root.HubFX={BOXES,init,setState,playMoment,skipMoment,layerFor,isPlaying:()=>!!FX.moment};
})(globalThis);
