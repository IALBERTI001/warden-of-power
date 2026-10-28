// Game-styled tooltips (Oct 28 2026): replaces browser title= tooltips (a browser default CrazyGames reviewers notice).
// Any element with data-tip shows a small parchment tip after a short hover; icon buttons also get it as their name.
(function(){if(typeof document==='undefined')return;let tip=null,timer=null,cur=null;
 const make=()=>{tip=document.createElement('div');tip.className='game-tip';tip.setAttribute('role','tooltip');tip.hidden=true;document.body.append(tip)};
 const name=el=>{if(el.dataset.tip&&!el.getAttribute('aria-label')&&!el.textContent.trim())el.setAttribute('aria-label',el.dataset.tip)};
 const show=el=>{const t=el.dataset.tip;if(!t)return;if(!tip)make();tip.textContent=t;tip.hidden=false;const r=el.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;let x=r.left+r.width/2-w/2,y=r.bottom+8;if(y+h>innerHeight-6)y=r.top-h-8;x=Math.max(6,Math.min(innerWidth-w-6,x));tip.style.left=x+'px';tip.style.top=y+'px'};
 const hide=()=>{clearTimeout(timer);timer=null;cur=null;if(tip)tip.hidden=true};
 document.addEventListener('mouseover',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');if(el===cur)return;hide();if(!el||!el.dataset.tip)return;cur=el;name(el);timer=setTimeout(()=>show(el),350)});
 document.addEventListener('focusin',e=>{const el=e.target.closest&&e.target.closest('[data-tip]');if(el&&el.dataset.tip&&el.matches(':focus-visible')){name(el);show(el)}});
 document.addEventListener('focusout',hide);document.addEventListener('mousedown',hide);addEventListener('scroll',hide,true);
 const stamp=()=>{const el=document.getElementById('buildStamp');const s=document.querySelector('script[src*="tip.js"]');const v=s&&/[?&]v=(\d{4})(\d{2})(\d{2})(\w*)/.exec(s.getAttribute('src'));if(el&&v)el.textContent=`Warden of Power · build ${v[1]}-${v[2]}-${v[3]}${v[4]}`};
 const init=()=>{document.querySelectorAll('[data-tip]').forEach(name);stamp()};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
 // No browser context menu or image drag ghosts over the game; text stays selectable only in inputs.
 document.addEventListener('contextmenu',e=>{if(!e.target.closest('input,textarea'))e.preventDefault()});
 document.addEventListener('dragstart',e=>{if(e.target.tagName==='IMG'||e.target.tagName==='CANVAS')e.preventDefault()});
})();
