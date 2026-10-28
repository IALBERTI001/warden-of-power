// CrazyGames layer (Oct 25 2026): SDK init, gameplay/loading events, progress sync through the Data module,
// optional rewarded ads, and hiding playtest-only features. Everything here is inert off CrazyGames:
// the playtest site never loads the SDK, never shows an ad and keeps saving to this browser only.
(function(root){'use strict';
const SDK_URL='https://sdk.crazygames.com/crazygames-sdk-v3.js';
function onCrazyGames(){try{const anc=root.location.ancestorOrigins;const hosts=[root.location.hostname,document.referrer,...(anc?Array.from(anc):[])].join(' ');return /crazygames\./i.test(hosts)}catch(e){return false}}
const wanted=!!root.CrazyGames||onCrazyGames()||/[?&]useLocalSdk=true/.test(root.location.search||'');
// Mark the page at once so playtest-only controls (feedback form, test tools) never flash on CrazyGames.
if(wanted)try{document.documentElement.classList.add('on-crazygames')}catch(e){}
const SAVE_KEYS=/^warden\./;
function progressScore(raw){try{const p=JSON.parse(raw)||{};const sum=o=>Object.values(o||{}).reduce((a,v)=>a+(typeof v==='number'?v:typeof v==='object'&&v?sum(v):0),0);
 return (p.engineBest||0)*1e6+sum(p.restorations)*1e4+sum(p.skills)*1e3+sum(p.mastery)*100+sum(p.workshop)*100+Object.keys(p.earned||{}).length*10+((p.parts||0)+(p.resonance||0))/1e9}catch(e){return -1}}
const Ads={/* Oct 28 2026: rewarded ads stay OFF during Basic Launch (CrazyGames disables ads there, so the offer would be a dead button). The Full Launch build sets <html data-rewards="on">; ?rewards=on tests it locally. */rewardsOn:(()=>{try{return document.documentElement.dataset.rewards==='on'||/[?&]rewards=on(&|$)/.test(location.search)}catch(e){return false}})(),ready:false,busy:false,sdk:null,_playing:null,_loading:false,
 async init(){if(!wanted)return false;try{if(!root.CrazyGames)await new Promise((ok,fail)=>{const s=document.createElement('script');s.src=SDK_URL;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  const S=root.CrazyGames.SDK;await S.init();this.sdk=S;this.ready=S.environment==='crazygames'||S.environment==='local';}catch(e){this.ready=false}
  if(this.ready){if(this._loading)this.loadingStop(true);await this.syncSaves();if(this._playing!=null){const p=this._playing;this._playing=null;this.gameplay(p)}}return this.ready},
 // Progress through the CrazyGames Data module: guest progress stays on the device, a signed-in player's progress
 // follows their account. The game keeps reading localStorage; this mirrors every warden.* key both ways.
 async syncSaves(){const S=this.sdk;if(!S||!S.data)return;let changed=false;
  try{const keys=new Set();for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(SAVE_KEYS.test(k))keys.add(k)}
   for(const k of ['warden.profile.v1','warden.settings.v1','warden.keys.v1','warden.run.v1','warden.run.engine.v1','warden.run.outer.v1','warden.hubinfo.v1'])keys.add(k);
   const cloudProfile=await S.data.getItem('warden.profile.v1'),localProfile=localStorage.getItem('warden.profile.v1');
   const cloudWins=cloudProfile&&(!localProfile||progressScore(cloudProfile)>progressScore(localProfile));
   for(const k of keys){const c=await S.data.getItem(k),l=localStorage.getItem(k);
    if(cloudWins&&c!=null&&c!==l){origSet.call(localStorage,k,c);changed=true}
    else if(!cloudWins&&l!=null&&c!==l){S.data.setItem(k,l)}}}catch(e){}
  this.mirror=true;
  if(changed){try{if(!sessionStorage.getItem('warden.cloudReload')){sessionStorage.setItem('warden.cloudReload','1');root.location.reload();return}}catch(e){}}},
 // Gameplay start/stop: called whenever a battle becomes playable or is paused, finished or left.
 gameplay(on){on=!!on;if(!this.ready){this._playing=on;return}if(this._playing===on)return;this._playing=on;try{on?this.sdk.game.gameplayStart():this.sdk.game.gameplayStop()}catch(e){}},
 loadingStart(){this._loading=true;if(this.ready)try{this.sdk.game.loadingStart()}catch(e){}},
 loadingStop(force){if(!this._loading&&!force)return;this._loading=false;if(this.ready)try{this.sdk.game.loadingStop()}catch(e){}},
 // Resolves true only when the video finished; false on error, no fill or an ad blocker. Never rewards on error.
 rewarded(hooks={}){if(!this.ready||this.busy)return Promise.resolve(false);this.busy=true;this.gameplay(false);return new Promise(done=>{let settled=false;const end=ok=>{if(settled)return;settled=true;this.busy=false;try{hooks.unmute&&hooks.unmute()}catch(e){}done(ok)};
  try{this.sdk.ad.requestAd('rewarded',{adStarted:()=>{try{hooks.mute&&hooks.mute()}catch(e){}},adFinished:()=>end(true),adError:()=>end(false)})}catch(e){end(false)}})}};
// Mirror saves to the Data module once it is ready (writes before that are picked up by syncSaves).
let origSet=null,origRemove=null;
try{origSet=Storage.prototype.setItem;origRemove=Storage.prototype.removeItem;
 if(wanted){Storage.prototype.setItem=function(k,v){origSet.call(this,k,v);if(this===root.localStorage&&Ads.mirror&&SAVE_KEYS.test(k))try{Ads.sdk.data.setItem(k,String(v))}catch(e){}};
  Storage.prototype.removeItem=function(k){origRemove.call(this,k);if(this===root.localStorage&&Ads.mirror&&SAVE_KEYS.test(k))try{Ads.sdk.data.removeItem(k)}catch(e){}}}}catch(e){}
root.WardenAds=Ads;if(wanted){Ads.loadingStart();Ads.init()}
})(typeof globalThis!=='undefined'?globalThis:this);
