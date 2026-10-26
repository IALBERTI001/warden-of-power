// Freeplay layer (Oct 26 2026): replaces ads.js in the freeplays.site build. Same WardenAds interface the game
// already calls (gameplay start/stop, loading), with no ads. Progress is saved through Freeplay's cloud saves
// when the player is signed in (fp.save/fp.load), and in this browser otherwise. Inert if the SDK is missing.
(function(root){'use strict';
const KEYS=['warden.profile.v1','warden.settings.v1','warden.keys.v1','warden.run.v1','warden.run.engine.v1','warden.run.outer.v1','warden.hubinfo.v1'];
function score(raw){try{const p=JSON.parse(raw)||{};const sum=o=>Object.values(o||{}).reduce((a,v)=>a+(typeof v==='number'?v:typeof v==='object'&&v?sum(v):0),0);return(p.engineBest||0)*1e6+sum(p.restorations)*1e4+sum(p.skills)*1e3+sum(p.mastery)*100+sum(p.workshop)*100+Object.keys(p.earned||{}).length*10}catch(e){return -1}}
const Ads={ready:false,busy:false,fp:null,_playing:null,_t:null,
 async init(){try{if(!root.Freeplay||!root.Freeplay.init)return false;this.fp=await root.Freeplay.init();if(!this.fp)this.fp=root.Freeplay;await this.sync();if(this._playing!=null){const p=this._playing;this._playing=null;this.gameplay(p)}}catch(e){this.fp=null}return!!this.fp},
 snapshot(){const o={};for(const k of KEYS){try{const v=localStorage.getItem(k);if(v!=null)o[k]=v}catch(e){}}return o},
 async sync(){const fp=this.fp;if(!fp||!fp.load)return;let cloud=null;try{cloud=await fp.load()}catch(e){}
  try{const local=localStorage.getItem('warden.profile.v1');
   if(cloud&&typeof cloud==='object'&&cloud['warden.profile.v1']&&(!local||score(cloud['warden.profile.v1'])>score(local))){for(const k of KEYS)if(typeof cloud[k]==='string')orig.call(localStorage,k,cloud[k]);
    if(!sessionStorage.getItem('warden.fpReload')){sessionStorage.setItem('warden.fpReload','1');root.location.reload();return}}}catch(e){}
  this.mirror=true;this.push()},
 push(){if(!this.fp||!this.fp.save||!this.mirror)return;clearTimeout(this._t);this._t=setTimeout(()=>{try{this.fp.save(this.snapshot())}catch(e){}},1500)},
 gameplay(on){on=!!on;if(!this.fp){this._playing=on;return}if(this._playing===on)return;this._playing=on;try{on?this.fp.gameplayStart():this.fp.gameplayStop()}catch(e){}},
 loadingStart(){},loadingStop(){},
 rewarded(){return Promise.resolve(false)}};
let orig=Storage.prototype.setItem;
try{Storage.prototype.setItem=function(k,v){orig.call(this,k,v);if(this===root.localStorage&&/^warden\./.test(k))Ads.push()}}catch(e){}
root.WardenAds=Ads;
const go=()=>Ads.init();if(root.Freeplay)go();else root.addEventListener('load',go);
})(typeof globalThis!=='undefined'?globalThis:this);
