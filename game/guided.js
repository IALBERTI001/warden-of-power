// Guided campaign (Oct 28 2026). From the tutorial to the Aetherheart finale the game plays itself between
// battles: the gate rises, facilities restore automatically when a win pays for them, and the next sector
// "comes under attack" with a countdown that drops the player straight into the next mission. Losses retry
// automatically. Endless Engine Trials, the skill tree and the Workshop are introduced after the finale.
// Pure decision logic lives here (unit-tested); the hub and battle pages call it.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WardenGuided=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const SECTORS=['moonwell','emberheart','rimeglass','stormcrown'];
const ORDER=['moonwell-1','moonwell-2','moonwell-3','emberheart-1','emberheart-2','emberheart-3','rimeglass-1','rimeglass-2','rimeglass-3','stormcrown-1','stormcrown-2','stormcrown-3','aetherheart-1'];
const FINALE='aetherheart-1';
const cleared=(p,id)=>!!p?.missions?.[id]?.cleared;
// Everyone who has not yet won the finale is guided (the user's call, Oct 28 2026), once the tutorial is held.
function active(p){return !!p?.seals?.tutorial?.cleared&&!cleared(p,FINALE)}
function nextMission(p){return ORDER.find(id=>!cleared(p,id))||null}
// What the guide does next in the hub. P = WardenProgression, C = WardenCampaign.
// gate -> any sector restoration a win has paid for -> the next mission -> (Atelier with spare Parts once all four
// sectors are reawakened) -> the finale. If Parts ever fall short, the Outer Seal earns them.
function next(p,P,C){
 if(!p?.seals?.tutorial?.cleared)return{type:'tutorial'};
 if(cleared(p,FINALE))return{type:'done'};
 if(!p.gateOpen)return P.gateOffer(p).ok?{type:'gate',cost:P.GATE.cost}:{type:'outer'};
 for(const f of SECTORS){const o=P.restorationOffer(p,f);if(o.ok)return{type:'restore',id:f,cost:o.cost,stage:(p.restorations?.[f]||0)+1}}
 const allAwake=SECTORS.every(f=>(p.restorations?.[f]||0)>=3);
 if(allAwake){const o=P.restorationOffer(p,'atelier');if(o.ok)return{type:'restore',id:'atelier',cost:o.cost,stage:(p.restorations?.atelier||0)+1}}
 const m=nextMission(p);if(m&&C.available(p,m).ok)return{type:'mission',id:m,sector:m.split('-')[0],finale:m===FINALE};
 return{type:'outer'}}
return{SECTORS,ORDER,FINALE,active,next,nextMission};
});
