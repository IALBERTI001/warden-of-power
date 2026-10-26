const fs=require('fs');const {chromium}=require('/opt/npm-tools/node_modules/playwright');
const CAPJS=fs.readFileSync('/home/claude/warden-of-power/tools/capture/capture.js','utf8');
const BASE='http://127.0.0.1:8765/game/';
const PROFILE={gateOpen:true,unboundOpen:true,hubIntroSeen:true,hubGuide:99,restorations:{moonwell:3,emberheart:3,rimeglass:3,stormcrown:3,atelier:3},skills:{},missions:{},engineBest:300,ascension:3,ascensionSeen:3,seals:{tutorial:{cleared:true,held:true,challenge:true}}};
async function open(b,mission,{w=1920,h=1080,profile=PROFILE,skillsFull=true}={}){const ctx=await b.newContext({viewport:{width:w,height:h},bypassCSP:true});const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
 await pg.goto(BASE+'hub.html?stay');await pg.evaluate(([p,full])=>{localStorage.clear();if(full){for(const s of WardenProgression.SKILLS)p.skills[s.id]=s.maxRank}localStorage.setItem('warden.profile.v1',JSON.stringify(p));localStorage.setItem('warden.settings.v1',JSON.stringify({guide:false,speedHintSeen:true,engineHintSeen:true,master:0,masterMute:true,reduced:false}))},[profile,skillsFull]);
 await pg.goto(BASE+'index.html?mission='+mission);await pg.waitForFunction(()=>typeof ready!=='undefined'&&ready,null,{timeout:20000});await pg.addScriptTag({content:CAPJS});await pg.evaluate(([w,h])=>{CAP.w=w;CAP.h=h},[w,h]);return {ctx,pg}}
async function shot(pg,file,q=.93){const d=await pg.evaluate(q=>capShot(q),q);fs.writeFileSync(file,Buffer.from(d.split(',')[1],'base64'))}
const PROF2={...PROFILE,ascension:0,ascensionSeen:0,engineBest:150,skills:{}};
module.exports={open,shot,PROFILE,PROF2};
