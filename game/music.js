// Music tracks (Nov 4 2026, user-approved plan): an original 8-bit theme per element plays in that sector's missions;
// once the Engine is reached the player picks the Engine Trials music (any unlocked track, or Shuffle).
// Tracks are made in code by tools/audio/chiptune.py. Pure logic here; game.js and hub.js call it.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.WardenMusic=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TRACKS=[
 {id:'classic',name:'The Broken Conduit',src:'../previews/audio-v2/broken-conduit.wav',unlock:()=>true},
 {id:'water',name:'Moonwell Cisterns',src:'assets/music/theme-water.mp3',unlock:p=>!!p?.missions?.['moonwell-1']?.cleared},
 {id:'fire',name:'Emberheart Forge',src:'assets/music/theme-fire.mp3',unlock:p=>!!p?.missions?.['emberheart-1']?.cleared},
 {id:'ice',name:'Rimeglass Vaults',src:'assets/music/theme-ice.mp3',unlock:p=>!!p?.missions?.['rimeglass-1']?.cleared},
 {id:'lightning',name:'Stormcrown Spire',src:'assets/music/theme-lightning.mp3',unlock:p=>!!p?.missions?.['stormcrown-1']?.cleared},
 {id:'engine',name:'Aetherheart Engine',src:'assets/music/theme-engine.mp3',unlock:p=>!!p?.missions?.['aetherheart-1']?.cleared}];
const SECTOR={moonwell:'water',emberheart:'fire',rimeglass:'ice',stormcrown:'lightning',aetherheart:'engine'};
const byId=id=>TRACKS.find(t=>t.id===id)||TRACKS[0];
function unlocked(p){return TRACKS.filter(t=>t.unlock(p))}
// The picker is offered once the Engine is reached (its first run is open).
function pickerOpen(p){return unlocked(p).length>1&&(!!p?.missions?.['aetherheart-1']?.cleared||(p?.engineBest||0)>0)}
// Which track a battle plays. mission: 'tutorial' | 'outer' | 'engine' | campaign id. pick: saved Engine choice.
function trackFor(mission,p,pick,rand=Math.random){
 if(mission==='engine'){const list=unlocked(p);if(pick==='shuffle')return list[Math.floor(rand()*list.length)]||TRACKS[0];const t=list.find(t=>t.id===pick);return t||(list.find(t=>t.id==='engine')||TRACKS[0])}
 const sector=String(mission||'').split('-')[0];if(SECTOR[sector])return byId(SECTOR[sector]);
 return TRACKS[0]}
return{TRACKS,SECTOR,unlocked,pickerOpen,trackFor,byId};
});
