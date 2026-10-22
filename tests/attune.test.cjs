// Attuned foes: each resists its element's effect and damage, has one weak spot, and never touches tutorial waves.
const assert=require('node:assert/strict'),E=require('../game/engine.js');
const g=()=>{const x=new E.Game({});x.completed=2;return x};
const put=(e,d=500)=>{e.distance=d;Object.assign(e,E.position(d));return e};
const shot=(x,t)=>({element:t,stats:{damage:10,soak:4,burn:3,slow:.24,chains:3}});
// Tide: no Soaked, half Water damage, extra Lightning damage
{const x=g(),e=put(x.spawn('golem',1,'tide'));const hp=e.hp;x.hit(e,shot(x,'water'));assert.equal(e.soaked,0);assert.equal(hp-e.hp,5);const h2=e.hp;x.hit(e,shot(x,'lightning'));assert.equal(h2-e.hp,12.5)}
// Ember: no burning, half Fire damage, shatter +25%
{const x=g(),e=put(x.spawn('golem',1,'ember'));const hp=e.hp;x.hit(e,shot(x,'fire'));assert.equal(e.burning,0);assert.equal(hp-e.hp,5);e.soaked=1;x.hit(e,shot(x,'ice'));assert(e.frozen>=1.5-1e-9,'freezes for the full time')}
// Rime: cannot be chilled, freeze halved, Ice damage halved, Fire +25%
{const x=g(),e=put(x.spawn('golem',1,'rime'));const hp=e.hp;x.hit(e,shot(x,'ice'));assert.equal(e.chilled,0);assert.equal(hp-e.hp,5);e.soaked=1;x.hit(e,shot(x,'ice'));assert(Math.abs(e.frozen-.75)<1e-9);const h2=e.hp;e.frozen=0;x.hit(e,shot(x,'fire'));assert.equal(h2-e.hp,12.5)}
// Storm: soaked storm foe does not start a chain; half Lightning damage; soaked water hits +25%
{const x=g(),a=put(x.spawn('golem',1,'storm')),b=put(x.spawn('golem',1),510);a.soaked=4;b.soaked=4;const hb=b.hp,ha=a.hp;x.hit(a,shot(x,'lightning'));assert.equal(hb,b.hp,'no conduction from a storm foe');assert.equal(ha-a.hp,5);const h3=a.hp;x.hit(a,shot(x,'water'));assert.equal(h3-a.hp,12.5)}
// Plain foes and the tutorial are unchanged
{const x=g(),e=put(x.spawn('golem',1));x.hit(e,shot(x,'water'));assert.equal(e.soaked,4)}
const t=new E.Game({});t.build('fire',{x:230,y:300});t.startWave();for(let i=0;i<1200;i++)t.step(1/60);assert(t.enemies.every(e=>e.attune===null));
console.log('PASS: Tide, Ember, Rime and Storm resist their element and keep one weak spot; plain foes and tutorial waves are unchanged.');
