// Build space budget (Nov 2 2026, user: "tower space has reduced tremendously"): on every map, enough non-overlapping
// towers fit within range of the route for the hardest level (about 25 at most) plus 50%. Pins the Outer Seal fix.
global.WardenCampaign=require('../game/campaign.js');const assert=require('node:assert/strict'),E=require('../game/engine.js');
const fit=map=>{const mid=Object.entries(E.MISSIONS).find(([k,v])=>v.map===map)?.[0];const g=new E.Game({},{mission:mid||'tutorial',map});g.charge=1e9;let n=0;
 for(let y=100;y<=520;y+=8)for(let x=40;x<=960;x+=8){if(!g.placement(x,y).ok)continue;if(!g.routes.some(R=>{for(let d=0;d<R.total;d+=12){const q=R.position(d);if(Math.hypot(q.x-x,q.y-y)<=160)return true}return false}))continue;if(g.build('fire',{x,y}).ok)n++}return n};
const out=[];for(const id of Object.keys(E.MAPS)){if(id==='conduit')continue;const n=fit(id);out.push(id+' '+n);assert(n>=38,`${id}: only ${n} towers fit near the route`)}
console.log('PASS map room:',out.join(', '));
