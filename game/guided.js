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
// One new thing every mission (Oct 28 2026, approved): mission 1 of a sector brings its enemy role, mission 2 unlocks
// that sector's element at Tier III (a fork between two specialisations), mission 3 opens a second entrance and ends
// on the Guardian. While guided, the element's SECOND Tier III path (Fracture furnace, Pressure Lance, Crystal focus,
// Focused current) stays locked until that mission; the first path is open from the start (user's option 1, Oct 28 2026:
// a full lock cost upgrade-focused players wins in Moonwell 3 and the Emberheart missions). After the finale all are open.
const TIER3_AT={water:'moonwell-2',fire:'emberheart-2',ice:'rimeglass-2',lightning:'stormcrown-2'};
function tier3Locked(p,missionId){if(!active(p))return[];const at=ORDER.indexOf(missionId);return Object.keys(TIER3_AT).filter(el=>!cleared(p,TIER3_AT[el])&&!(at>=0&&at>=ORDER.indexOf(TIER3_AT[el])))}
function tier3UnlockMission(el){return TIER3_AT[el]||null}
const ROLE_NEWS={moonwell:'Divers slip under the water, out of reach',emberheart:'Shield-bearers shrug off small hits',rimeglass:'Runners: fast and fragile',stormcrown:'Splitters break in two when defeated'};
const ELEMENT={moonwell:'water',emberheart:'fire',rimeglass:'ice',stormcrown:'lightning'};
// The one-line card shown as a mission starts: {title, eyebrow} or null. paths = the element's two Tier III names.
function missionNews(missionId,pathsOf){if(missionId===FINALE)return{eyebrow:'NEW THIS MISSION',title:'Every foe returns, with the Regulator Guardian'};
 const [sector,n]=String(missionId).split('-');if(!ROLE_NEWS[sector])return null;
 if(n==='1')return{eyebrow:'NEW ENEMY',title:ROLE_NEWS[sector]};
 if(n==='2'){const el=ELEMENT[sector],names=pathsOf?pathsOf(el):null;return{eyebrow:'NEW TIER III PATH',title:`${el[0].toUpperCase()+el.slice(1)}${names?': '+names[1]:' Tier III'} unlocked`,element:el}}
 if(n==='3')return{eyebrow:'NEW THIS MISSION',title:'Two entrances, and the Guardian at the end'};return null}
return{SECTORS,ORDER,FINALE,active,next,nextMission,tier3Locked,tier3UnlockMission,missionNews};
});
