(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenPortals=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
// Coordinates traced from the single integrated 1000 x 600 scene.
const ENTRY={x:125,y:112,aperture:[97,55,57,59],frame:[68,23,128,93]},EXIT={x:925,y:324,aperture:[899,275,54,51],frame:[855,226,139,104]};
function layout(point){return{...point,width:point.frame[2],height:point.frame[3],left:point.frame[0],top:point.frame[1]}}
function background(){} // The tunnel interiors already belong to the painted scene.
function foreground(c,image){if(!image)return;for(const gate of[ENTRY,EXIT]){const [x,y,w,h]=gate.frame,[ax,ay,aw,ah]=gate.aperture;c.save();c.beginPath();c.rect(x,y,w,ay-y);c.rect(x,ay,ax-x,h-(ay-y));c.rect(ax+aw,ay,x+w-ax-aw,h-(ay-y));c.clip();c.drawImage(image,0,0,image.width,image.height,0,0,1000,600);c.restore()}}
function clip(c,enemy,ground,total){const gate=enemy.distance<180?ENTRY:enemy.distance>total-140?EXIT:null;if(!gate)return;const [x,y,w,h]=gate.aperture;c.beginPath();c.rect(x,y,w,h);c.rect(-500,gate.y-2,2000,2000);c.clip()}
return{ENTRY,EXIT,layout,background,foreground,clip};
});
