// QA step 2 (re-run): simulated new player on the live flow, 2 s thinking per action, at 1x speed.
const {chromium}=require('/opt/npm-tools/node_modules/playwright');const B=process.env.B;const OUT=process.env.OUT||'s3';require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch();const pg=await (await b.newContext({viewport:{width:1280,height:720}})).newPage();const t0=Date.now();const T=()=>((Date.now()-t0)/1000).toFixed(1);const log=[];const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 const words=async()=>pg.evaluate(()=>{const seen=new Set();let n=0;for(const el of document.querySelectorAll('body *')){for(const c of el.childNodes){if(c.nodeType!==3)continue;const t=c.textContent.trim();if(!t)continue;const r=el.getBoundingClientRect();const s=getComputedStyle(el);if(r.width<2||r.height<2||s.visibility==='hidden'||s.display==='none'||+s.opacity===0||el.closest('[hidden]')||el.closest('dialog:not([open])'))continue;if(r.bottom<0||r.top>innerHeight)continue;if(seen.has(t))continue;seen.add(t);n+=t.split(/\s+/).length}}return n});
 const shot=async n=>{await pg.screenshot({path:`${OUT}/${n}.png`});log.push(`${T()}s ${n} words=${await words()}`)};
 const think=()=>pg.waitForTimeout(2000);
 const btnText=async re=>pg.evaluate(src=>{const r=new RegExp(src,'i');const x=[...document.querySelectorAll('button')].find(b=>r.test(b.textContent)&&b.offsetParent);if(x){x.click();return true}return false},re);
 const W=async(x,y)=>pg.evaluate(([x,y])=>{const c=document.getElementById('battle');const r=c.getBoundingClientRect();const p=G.project(x,y);return[r.left+p.x*r.width/1000,r.top+p.y*r.height/600]},[x,y]);
 const place=async(key,x,y)=>{await pg.keyboard.press(key);const [a,c]=await W(x,y);await pg.mouse.click(a,c);await pg.waitForTimeout(300)};
 await pg.goto(B);await pg.waitForTimeout(1500);await shot('01-load');
 await pg.waitForTimeout(1500);await shot('02-dropped-in');
 await think();await pg.keyboard.press('u');await pg.waitForTimeout(400);await shot('03-upgraded');await shot('04-wave1');for(let i=0;i<8;i++){await pg.waitForTimeout(1500);if(await pg.evaluate(()=>game.enemies.some(e=>e.burning>0))){await pg.waitForTimeout(250);await shot('04b-first-burn');break}}
 const waitWave=async n=>{for(let s=0;s<180;s++){await pg.waitForTimeout(500);const st=await pg.evaluate(()=>({busy:game.spawnQueue.length>0||game.enemies.some(e=>e.alive),done:game.completed,frz:game.combos.freeze}));if(!st.busy&&st.done>=n)return}};
 await waitWave(1);await shot('05-wave1-done');
 await pg.waitForTimeout(1200);await shot('05b-banner');
 const pads=await pg.evaluate(()=>WardenEngine.TUTORIAL_PADS);
 await think();await place('2',175,330);await shot('06a-water');await think();await place('3',305,330);await shot('06-water-ice');
 await think();await pg.keyboard.press('Escape');await pg.keyboard.press('n');let frz=null;
 for(let s=0;s<240;s++){await pg.waitForTimeout(250);if(await pg.evaluate(()=>game.combos.freeze>0)){frz=T();await shot('07-first-freeze');break}}
 log.push(`first freeze at ${frz}s`);console.log(log.join('\n'));console.log('errors',errs);await b.close()})();
