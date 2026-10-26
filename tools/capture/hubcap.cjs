const fs=require('fs');const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{fs.mkdirSync('seg/H',{recursive:true});const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1536,height:1024},bypassCSP:true});const pg=await ctx.newPage();pg.on('pageerror',e=>console.log('ERR',e.message));
 const prof={gateOpen:true,unboundOpen:true,hubIntroSeen:true,hubGuide:99,restorations:{moonwell:3,emberheart:3,rimeglass:3,stormcrown:3,atelier:3},engineBest:520,ascension:5,ascensionSeen:5,seals:{tutorial:{cleared:true,held:true}}};
 await pg.goto('http://127.0.0.1:8765/game/hub.html?stay');await pg.evaluate(p=>{localStorage.clear();localStorage.setItem('warden.profile.v1',JSON.stringify(p));localStorage.setItem('warden.settings.v1',JSON.stringify({masterMute:true,ambienceMute:true}))},prof);
 await pg.clock.install();
 await pg.goto('http://127.0.0.1:8765/game/hub.html?stay');
 for(let i=0;i<200;i++){await pg.clock.runFor(50);if(await pg.evaluate(()=>!!(window.HubFX&&HubFX.layerFor&&document.getElementById('hubMap').width)))break}
 await pg.clock.runFor(2000);
 const zero={gate:1,aetherheart:0,moonwell:0,emberheart:0,rimeglass:0,stormcrown:0,atelier:0};
 await pg.evaluate(z=>HubFX.setState(z),zero);await pg.clock.runFor(500);
 let f=0;const grab=async()=>{const d=await pg.evaluate(()=>document.getElementById('hubMap').toDataURL('image/jpeg',.94));fs.writeFileSync(`seg/H/f${String(f++).padStart(4,'0')}.jpg`,Buffer.from(d.split(',')[1],'base64'))};
 const log=[];
 const seq=[['moonwell',0,3,3],['emberheart',0,3,3],['rimeglass',0,3,3],['stormcrown',0,3,3],['atelier',0,3,3.2],['aetherheart',0,5,2]];
 for(const [id,a,z,sp] of seq){await pg.evaluate(([id,a,z])=>{window.__done=false;HubFX.playMoment(id,a,z,()=>{window.__done=true})},[id,a,z]);
  const start=f;for(let i=0;i<200;i++){await pg.clock.runFor(1000/30*sp);await grab();if(await pg.evaluate(()=>window.__done))break}log.push([id,start,f])}
 for(let i=0;i<45;i++){await pg.clock.runFor(1000/30);await grab()}log.push(['hold',f-45,f]);
 fs.writeFileSync('seg/H/log.json',JSON.stringify(log));console.log(JSON.stringify(log));await b.close()})();
