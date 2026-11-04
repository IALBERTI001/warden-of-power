// node hubshot.cjs OUT.jpg - the fully restored hub painting, for the trailer tour
const fs=require('fs');const {chromium}=require('/opt/npm-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1536,height:1024},bypassCSP:true});const pg=await ctx.newPage();
 const prof={gateOpen:true,unboundOpen:true,hubIntroSeen:true,hubGuide:99,restorations:{moonwell:3,emberheart:3,rimeglass:3,stormcrown:3,atelier:3},engineBest:520,ascension:5,ascensionSeen:5,seals:{tutorial:{cleared:true,held:true}}};
 await pg.goto('http://127.0.0.1:8765/game/hub.html?stay');await pg.evaluate(p=>{localStorage.clear();localStorage.setItem('warden.profile.v1',JSON.stringify(p));localStorage.setItem('warden.settings.v1',JSON.stringify({masterMute:true,ambienceMute:true}))},prof);
 await pg.goto('http://127.0.0.1:8765/game/hub.html?stay');await pg.waitForFunction(()=>window.HubFX&&document.getElementById('hubMap').width,null,{timeout:20000});await pg.waitForTimeout(3000);
 const d=await pg.evaluate(()=>document.getElementById('hubMap').toDataURL('image/jpeg',.95));fs.writeFileSync(process.argv[2],Buffer.from(d.split(',')[1],'base64'));
 console.log(await pg.evaluate(()=>[document.getElementById('hubMap').width,document.getElementById('hubMap').height]));await b.close()})();
