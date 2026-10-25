// Best-wave record (Oct 24 2026): a pride badge for your deepest Engine wave, shown in the hub and as a
// shareable image. Pure canvas drawing so the on-screen card and the saved picture are the same thing.
(function(root){'use strict';
const TIERS=[
 {min:1000,id:'mythic',name:'Warden Eternal',ring:'#fff6dc',glow:'#fff3d1',deep:'#2a2a33',ink:'#fffaf0'},
 {min:500,id:'crown',name:'Crowned Warden',ring:'#ffd36b',glow:'#c79bff',deep:'#2b1840',ink:'#fff0d1'},
 {min:100,id:'gold',name:'Ascendant Delver',ring:'#ffd36b',glow:'#f2c75c',deep:'#3a2a10',ink:'#fff0d1'},
 {min:50,id:'silver',name:'Deep Delver',ring:'#d9e3ee',glow:'#9fc4e6',deep:'#1d2a38',ink:'#f2f7ff'},
 {min:1,id:'bronze',name:'Engine Delver',ring:'#d79a5c',glow:'#c9783a',deep:'#2e1c10',ink:'#fff0d1'}];
function tierOf(best,profile){const t=TIERS.find(t=>best>=t.min)||TIERS[TIERS.length-1];if(t.id==='mythic'&&!profile?.earned?.eternal_thousand)return TIERS[1];return t}
function laurel(x,cx,cy,r,side,color){x.save();x.fillStyle=color;for(let i=0;i<10;i++){const deg=side<0?100+i*12:80-i*12,a=deg*Math.PI/180;x.save();x.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r);x.rotate(a+Math.PI/2+(side<0?-.5:.5));x.beginPath();x.ellipse(0,0,r*.055,r*.13,0,0,Math.PI*2);x.fill();x.restore()}x.restore()}
function crown(x,cx,cy,s,fill){x.save();x.fillStyle=fill;x.strokeStyle='#2a1d17';x.lineWidth=s*.06;x.beginPath();x.moveTo(cx-s,cy+s*.45);x.lineTo(cx-s,cy-s*.2);x.lineTo(cx-s*.5,cy+s*.1);x.lineTo(cx,cy-s*.55);x.lineTo(cx+s*.5,cy+s*.1);x.lineTo(cx+s,cy-s*.2);x.lineTo(cx+s,cy+s*.45);x.closePath();x.fill();x.stroke();x.restore()}
// The medal alone (also used small in the hub plaque and the results screen).
function medal(x,cx,cy,r,best,t,bare){const g=x.createRadialGradient(cx,cy-r*.3,r*.1,cx,cy,r);g.addColorStop(0,'#ffffff30');g.addColorStop(.6,'#ffffff08');g.addColorStop(1,t.deep);
 x.save();x.shadowColor=t.glow;x.shadowBlur=r*.45;x.fillStyle=t.ring;x.beginPath();x.arc(cx,cy,r*1.02,0,Math.PI*2);x.fill();x.restore();
 x.fillStyle=t.deep;x.beginPath();x.arc(cx,cy,r*.9,0,Math.PI*2);x.fill();x.fillStyle=g;x.beginPath();x.arc(cx,cy,r*.9,0,Math.PI*2);x.fill();x.strokeStyle=t.ring;x.lineWidth=r*.035;x.beginPath();x.arc(cx,cy,r*.8,0,Math.PI*2);x.stroke();
 laurel(x,cx,cy+r*.05,r*.68,1,t.ring);laurel(x,cx,cy+r*.05,r*.68,-1,t.ring);
 if(bare){if(t.id==='crown'||t.id==='mythic')crown(x,cx,cy+r*.05,r*.36,t.ring);else{x.save();x.fillStyle=t.ring;x.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.17:r*.4;x.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr)}x.closePath();x.fill();x.restore()}return}
 if(t.id==='crown'||t.id==='mythic')crown(x,cx,cy-r*.52,r*.2,t.ring);
 const s=String(best.toLocaleString());x.fillStyle=t.ink;x.textAlign='center';x.textBaseline='middle';x.font=`${Math.round(r*(s.length>4?.34:s.length>3?.46:.6))}px "Warden Quill", Georgia, serif`;x.shadowColor='#000';x.shadowBlur=r*.08;x.fillText(s,cx,cy+r*.04);x.shadowBlur=0;
 x.font=`${Math.round(r*.13)}px "Warden Quill", Georgia, serif`;x.fillStyle=t.ring;x.fillText('BEST WAVE',cx,cy+r*.42)}
function fmtDate(iso){try{return new Date(iso).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})}catch(e){return''}}
// The shareable card, 1200x630.
function card(canvas,profile,E,P){const W=1200,H=630;canvas.width=W;canvas.height=H;const x=canvas.getContext('2d'),best=profile.engineBest||0,t=tierOf(best,profile);
 const bg=x.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2b2036');bg.addColorStop(1,'#120d18');x.fillStyle=bg;x.fillRect(0,0,W,H);
 x.save();x.translate(330,315);x.globalAlpha=.16;x.fillStyle=t.glow;for(let i=0;i<24;i++){x.rotate(Math.PI/12);x.beginPath();x.moveTo(0,0);x.lineTo(700,-40);x.lineTo(700,40);x.closePath();x.fill()}x.restore();
 x.strokeStyle='#d5b369';x.lineWidth=4;x.strokeRect(14,14,W-28,H-28);x.strokeStyle='#d5b36955';x.lineWidth=2;x.strokeRect(26,26,W-52,H-52);
 medal(x,330,315,215,best,t);
 x.textAlign='left';x.textBaseline='alphabetic';x.fillStyle='#d5b369';x.font='22px "Warden Quill", Georgia, serif';x.fillText('WARDEN OF POWER · AETHERHEART ENGINE',600,150);
 x.fillStyle='#fff0d1';x.font='68px "Warden Quill", Georgia, serif';x.fillText(`Wave ${best.toLocaleString()}`,596,236);
 x.fillStyle=t.ring;x.font='34px "Warden Quill", Georgia, serif';x.fillText(t.name,600,286);
 const lines=[],r=E.ASCENSION.rank(profile);if(r)lines.push(r>=5?'Holder of the Crown of the Unbound':`${E.ASCENSION.ranks[r].name} · ${E.ASCENSION.ranks[r].banner}`);if(profile.tacticianBest)lines.push(`Tactician ×${profile.tacticianBest} · ${P.tacticianRank(profile.tacticianBest)}`);lines.push(`Warden Power ${P.powerRating(profile).toLocaleString()}`);if(profile.engineBestAt)lines.push(`Set ${fmtDate(profile.engineBestAt)}`);
 x.fillStyle='#e7d3a1';x.font='26px Georgia, serif';lines.slice(0,4).forEach((l,i)=>x.fillText(l,600,346+i*42));
 x.fillStyle='#ffd98a';x.font='30px "Warden Quill", Georgia, serif';x.fillText('Can you hold deeper?',600,548);return t}
function plaque(canvas,best,profile,bare){const s=canvas.width;const x=canvas.getContext('2d');x.clearRect(0,0,s,s);medal(x,s/2,s/2,s*.44,best,tierOf(best,profile),bare)}
root.WardenRecord={TIERS,tierOf,card,plaque,medal,fmtDate};
})(typeof globalThis!=='undefined'?globalThis:this);
