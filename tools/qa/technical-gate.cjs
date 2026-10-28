// QA step 1: scripted session on the upload package with a stand-in CrazyGames SDK.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const B=process.env.B||'http://127.0.0.1:8767/';const OUT=process.env.OUT||'s1';require('fs').mkdirSync(OUT,{recursive:true});
const fake=()=>{window.__log=[];const st={};window.CrazyGames={SDK:{environment:'crazygames',init:async()=>{},game:{gameplayStart:()=>__log.push('start'),gameplayStop:()=>__log.push('stop'),loadingStart:()=>__log.push('loadStart'),loadingStop:()=>__log.push('loadStop')},data:{getItem:async k=>st[k]??null,setItem:(k,v)=>{st[k]=v},removeItem:k=>{delete st[k]}},ad:{requestAd:(t,cb)=>{cb.adStarted();setTimeout(()=>cb.adError('none'),100)}}}}};
(async()=>{const b=await chromium.launch();const issues=[];const hosts=new Set();
 for(const [w,h] of [[821,462],[1080,607],[1216,684],[1280,720],[1920,1080]]){const ctx=await b.newContext({viewport:{width:w,height:h}});await ctx.addInitScript(fake);const pg=await ctx.newPage();
  pg.on('pageerror',e=>issues.push(`${w} JS ${e.message}`));pg.on('console',m=>{if(m.type()==='error')issues.push(`${w} console ${m.text().slice(0,140)}`)});pg.on('request',r=>hosts.add(new URL(r.url()).host));pg.on('response',r=>{if(r.status()>=400)issues.push(`${w} HTTP ${r.status()} ${r.url()}`)});
  const t0=Date.now();await pg.goto(B);let tStart=null;for(let i=0;i<80;i++){await pg.waitForTimeout(250);if(await pg.evaluate(()=>window.__log&&__log.includes('start'))){tStart=Date.now()-t0;break}}
  await pg.waitForTimeout(600);await pg.screenshot({path:`${OUT}/${w}-tutorial.png`});
  await pg.goto(B+'hub.html?stay');await pg.evaluate(()=>localStorage.setItem('warden.profile.v1',JSON.stringify({gateOpen:true,hubIntroSeen:true,hubGuide:99,restorations:{moonwell:3,emberheart:2,atelier:3},engineBest:240,ascension:2,ascensionSeen:2,parts:1580,resonance:23456,seals:{tutorial:{cleared:true,held:true}}})));
  await pg.goto(B);await pg.waitForTimeout(1800);await pg.screenshot({path:`${OUT}/${w}-hub.png`});
  await pg.evaluate(()=>document.querySelector('.pin[data-place="moonwell"]')?.click());await pg.waitForTimeout(600);await pg.screenshot({path:`${OUT}/${w}-panel.png`});
  await pg.keyboard.press('Escape');await pg.evaluate(()=>document.getElementById('openSkills')?.click());await pg.waitForTimeout(500);await pg.screenshot({path:`${OUT}/${w}-skills.png`});
  await pg.goto(B+'index.html?mission=engine');await pg.waitForTimeout(2200);await pg.screenshot({path:`${OUT}/${w}-engine.png`});
  await pg.evaluate(()=>{game.health=0;});await pg.waitForTimeout(1500);await pg.screenshot({path:`${OUT}/${w}-results.png`});
  issues.push(`${w} first gameplayStart ${tStart}ms; log ${await pg.evaluate(()=>__log.join(' '))}`);await ctx.close()}
 console.log(issues.join('\n'));console.log('hosts',[...hosts].join(' '));await b.close()})();
