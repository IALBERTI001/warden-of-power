(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenGround=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// A shared oblique ground plane. Sprites stay upright at projected contact points.
const M={a:1,b:0,c:0,d:1,e:0,f:0};
function project(x,y){return{x:M.a*x+M.c*y+M.e,y:M.b*x+M.d*y+M.f}}
function unproject(x,y){const det=M.a*M.d-M.b*M.c;return{x:(M.d*(x-M.e)-M.c*(y-M.f))/det,y:(-M.b*(x-M.e)+M.a*(y-M.f))/det}}
function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],u=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-u*dx,y-a[1]-u*dy)}
function roadMesh(path){const tiles=[],occupied=new Set(),cell=24;for(let row=1;row<22;row++)for(let col=-2;col<44;col++){const x=col*cell,y=row*cell,dist=Math.min(...path.slice(1).map((b,i)=>segmentDistance(x+12,y+12,path[i],b)));if(dist>30)continue;const key=col+','+row;occupied.add(key);tiles.push({x,y,col,row,key,shade:((col*73+row*37)%13+13)%13})}for(const tile of tiles){tile.east=!occupied.has((tile.col+1)+','+tile.row);tile.south=!occupied.has(tile.col+','+(tile.row+1));tile.depth=project(tile.x+12,tile.y+12).y}return tiles.sort((a,b)=>a.depth-b.depth||a.col-b.col)}
function polygon(c,points,fill){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill()}
function drawRoad(c,path){const tiles=roadMesh(path);c.save();
// Fine contact shadows, not a broad dark strip floating over the scene.
for(const t of tiles){const p=project(t.x+1,t.y+1);const q=project(t.x+23,t.y+1),r=project(t.x+23,t.y+23),s=project(t.x+1,t.y+23);polygon(c,[p,q,r,s].map(v=>({x:v.x+3,y:v.y+5})),'#28302b50')}
for(const t of tiles){const lift=2.8,raw=[[t.x+.7,t.y+.7],[t.x+23.3,t.y+.7],[t.x+23.3,t.y+23.3],[t.x+.7,t.y+23.3]].map(([x,y])=>project(x,y));const top=raw.map(p=>({x:p.x,y:p.y-lift}));if(t.east)polygon(c,[top[1],top[2],raw[2],raw[1]],'#66604f');if(t.south)polygon(c,[top[2],top[3],raw[3],raw[2]],'#706752');const n=t.shade;polygon(c,top,`rgb(${111+n*2},${108+n*1.7},${91+n*1.5})`);
c.strokeStyle='#c2b99b99';c.lineWidth=.75;c.beginPath();c.moveTo(top[3].x,top[3].y);c.lineTo(top[0].x,top[0].y);c.lineTo(top[1].x,top[1].y);c.stroke();c.strokeStyle='#6e695855';c.beginPath();c.moveTo(top[1].x,top[1].y);c.lineTo(top[2].x,top[2].y);c.lineTo(top[3].x,top[3].y);c.stroke();if(n%4===0){c.strokeStyle='#6e70564d';c.lineWidth=.6;c.beginPath();c.moveTo(top[0].x+6,top[0].y+4);c.lineTo(top[2].x-7,top[2].y-7);c.stroke()}}
c.restore();}
function transform(c){c.transform(M.a,M.b,M.c,M.d,M.e,M.f)}
return{M,project,unproject,roadMesh,segmentDistance,drawRoad,transform};
});
