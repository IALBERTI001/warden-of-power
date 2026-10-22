(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenTowerLayout=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Opaque foundation front points measured in each atlas cell, not its transparent edge.
const BASE={fire:.9781,water:.9762,ice:.9807,lightning:.9781};
const WATER=[.9586,.9586,.9641];
const UPGRADED={fire:[.9976,.9976,.9976],ice:[.9809,.9976,.9785],lightning:[.9378,.9426,.9402]};
function front(type,tier,spec){if(tier===1)return BASE[type];const index=tier===2?0:spec===0?1:2;return type==='water'?WATER[index]:UPGRADED[type][index]}
// The click point is the CENTRE of the diamond foundation (where the footprint marker and range circle are drawn).
// Measured on the approved sprites: the foundation's side corners (its centre line) sit ~0.235 of the drawn height above its front corner.
const FOUNDATION_HALF_DEPTH=.235;
function placement(type,tier,spec,x,y,width){const height=width*1.27,bottom=front(type,tier,spec),frontY=y+height*FOUNDATION_HALF_DEPTH;return{x:x-width/2,y:frontY-height*bottom,width,height,frontY,groundY:y,centerY:y}}
// This illustration is not an equal-column atlas. Keep neighboring towers out.
const WATER_FRAMES=[{x:0,w:635,anchor:330},{x:635,w:690,anchor:920},{x:1325,w:847,anchor:1620}];
function waterFrame(tier,spec,x,y,width,imageWidth=2172,imageHeight=724){const index=tier===2?0:spec===0?1:2,f=WATER_FRAMES[index],scale=imageWidth/2172,layout=placement('water',tier,spec,x,y,width),pixelScale=width*1.24/724;return{source:[f.x*scale,0,f.w*scale,imageHeight],destination:[x-(f.anchor-f.x)*pixelScale,layout.y,f.w*pixelScale,layout.height]}}
return{front,placement,waterFrame,FOUNDATION_HALF_DEPTH};
});
