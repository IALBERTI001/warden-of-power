// Optional rewarded ads (approved for production Oct 24 2026). Only ads requested through the CrazyGames SDK.
// Off everywhere except on CrazyGames (or ?useLocalSdk=true for testing): the playtest site never shows an ad.
// Players choose every ad; the game is fully playable with ads off, unfilled or blocked.
(function(root){'use strict';
const SDK_URL='https://sdk.crazygames.com/crazygames-sdk-v3.js';
function onCrazyGames(){try{const anc=root.location.ancestorOrigins;const hosts=[root.location.hostname,document.referrer,...(anc?Array.from(anc):[])].join(' ');return /crazygames\./i.test(hosts)}catch(e){return false}}
const wanted=()=>!!root.CrazyGames||onCrazyGames()||/[?&]useLocalSdk=true/.test(root.location.search||'');
const Ads={ready:false,busy:false,
 async init(){if(!wanted())return false;try{if(!root.CrazyGames)await new Promise((ok,fail)=>{const s=document.createElement('script');s.src=SDK_URL;s.onload=ok;s.onerror=fail;document.head.appendChild(s)});
  const S=root.CrazyGames.SDK;await S.init();this.ready=S.environment==='crazygames'||S.environment==='local';}catch(e){this.ready=false}return this.ready},
 // Resolves true only when the video finished; false on error, no fill or an ad blocker. Never rewards on error.
 rewarded(hooks={}){if(!this.ready||this.busy)return Promise.resolve(false);this.busy=true;return new Promise(done=>{let settled=false;const end=ok=>{if(settled)return;settled=true;this.busy=false;try{hooks.unmute&&hooks.unmute()}catch(e){}done(ok)};
  try{root.CrazyGames.SDK.ad.requestAd('rewarded',{adStarted:()=>{try{hooks.mute&&hooks.mute()}catch(e){}},adFinished:()=>end(true),adError:()=>end(false)})}catch(e){end(false)}})}};
root.WardenAds=Ads;Ads.init();
})(typeof globalThis!=='undefined'?globalThis:this);
