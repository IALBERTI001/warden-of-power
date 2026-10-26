// Store-art capture helper (Oct 25 2026). Not part of the game build: injected by the capture script only.
// Renders the battlefield at any canvas size with a free camera, hides the HUD, and steps the game by fixed
// time so video frames are smooth and identical every run.
(function(){
 const CAP=window.CAP={cx:500,cy:300,zoom:1,w:1920,h:1080};
 globalThis.__storeCapture=true;document.body.classList.add('capture');const st=document.createElement('style');
 st.textContent='.capture .topbar,.capture .command-dock,.capture #toasts,.capture .inspector,.capture #feedback,.capture .coach-tracker,.capture .coach-callout,.capture .coach-intro,.capture #engineHint,.capture #speedHint,.capture .tower-list,.capture #towerList,.capture .edge-shade,.capture .briefing,.capture .tutorial-book-button{display:none!important}.capture #gameStage{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;transform:none!important;border:0!important;max-width:none!important;max-height:none!important}.capture #battle{width:100vw!important;height:100vh!important;object-fit:contain}';
 document.head.appendChild(st);
 const od=ctx.drawImage.bind(ctx);ctx.drawImage=function(img,...a){if(img===terrain&&a.length===2)return od(img,a[0],a[1],1000,600);return od(img,...a)};
 const orig=draw;
 window.draw=function(){canvas.width!==CAP.w&&(canvas.width=CAP.w);canvas.height!==CAP.h&&(canvas.height=CAP.h);ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#0d0a12';ctx.fillRect(0,0,CAP.w,CAP.h);
  const z=Math.max(CAP.w/1000,CAP.h/600)*CAP.zoom;const hw=CAP.w/2/z,hh=CAP.h/2/z;CAP.cx=Math.max(hw,Math.min(1000-hw,CAP.cx));CAP.cy=Math.max(hh,Math.min(600-hh,CAP.cy));ctx.setTransform(z,0,0,z,CAP.w/2-CAP.cx*z,CAP.h/2-CAP.cy*z);orig();ctx.setTransform(1,0,0,1,0,0)};
 // hi-res terrain
 window.__terrain=()=>{const K=4;const t=document.createElement('canvas');t.width=1000*K;t.height=600*K;const c=t.getContext('2d');c.scale(K,K);c.drawImage(art.map,0,0,1000,600);c.fillStyle='#10272010';c.fillRect(0,0,1000,600);terrain=t};
 window.__terrain();
 // store art stays clean: no target or tier badges over the towers
 try{window.targetBadge=function(){};window.tierMarks=function(){};window.drawSealBar=function(){}}catch(e){}
 // manual clock
 window.frame=function(){};
 window.capStep=function(dt,sim=1){try{fx=fx.filter(v=>v.kind!=='label')}catch(e){}realTime+=dt;if(ready&&!paused&&!modalPaused&&game.status==='playing'){accumulator+=dt*sim;let s=0;while(accumulator>=1/60&&s<200){game.step(1/60);events();accumulator-=1/60;s++}}draw()};
 window.capShot=function(q=.93){return canvas.toDataURL('image/jpeg',q)};
})();
