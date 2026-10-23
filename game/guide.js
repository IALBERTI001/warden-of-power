// The Warden's Guide (Oct 23 2026): a built-in handbook for new players, opened from the hub ("Guide") and from the
// battle Help dialog. Plain words first, exact numbers second; screenshots are captured from the real game.
// Pure DOM, no build step. Exposes WardenGuide.open(chapterId?).
(function(root){
'use strict';
const IMG='assets/guide/';
const fig=(src,alt,cap,cls='')=>`<figure class="g-fig ${cls}"><img src="${IMG}${src}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${cap}</figcaption></figure>`;
const tower=t=>`<img class="g-icon" src="${IMG}tower-${t}.png" alt="" aria-hidden="true">`;
const key=k=>`<kbd>${k}</kbd>`;
const CHAPTERS=[
 {id:'start',title:'Start here',short:'Start here',html:`
  <p class="g-lead">You are a Warden. Monsters pour out of breaches and march along a road toward a <b>seal</b>. Your job: build elemental towers beside the road so nothing reaches the seal.</p>
  ${fig('battle-overview.jpg','A battle on the Outer Seal map: towers beside a winding road, monsters on the road, the seal and its health bar on the right.','A battle. Monsters enter at the left and follow the road to the seal on the right. Towers stand on open ground beside the road.','g-wide')}
  <div class="g-row">${fig('entry.jpg','A violet swirl with arrows at a furnace doorway.','<b>Where they come from:</b> a violet breach swirl with arrows pointing down the road.')}${fig('seal.jpg','A glowing seal with a health bar reading SEAL 16 / 20.','<b>What you defend:</b> the glowing seal and its health bar. It flashes when something gets through.')}</div>
  <h3>How you win</h3>
  <ul><li>Survive every wave. Each mission shows its wave count at the top (for example <b>5 / 8</b>).</li>
  <li>The seal starts at <b>20</b>. A slime or beetle that gets through costs 1, a golem 2, an elite one more.</li>
  <li><b>A boss that reaches the seal breaks it. The run is lost.</b> Bosses are worth stopping at any cost.</li></ul>
  <h3>Charge: your building money</h3>
  <p><b>Charge</b> (◈ at the top) pays for towers and upgrades. You earn it by defeating monsters and clearing waves. It resets every run.</p>
  <h3>Your first five minutes</h3>
  <ol><li>Play the tutorial. It teaches one tower at a time.</li><li>Read <a href="#" data-g="combos">Combos</a> in this guide. It is the heart of the game.</li><li>In the hub, raise the gate, then hold the Outer Seal for Restoration Parts.</li></ol>`},
 {id:'towers',title:'Your four towers',short:'Towers',html:`
  <p class="g-lead">Each tower does one thing well. On their own they are fine. <b>Together they make combos</b>, and combos win.</p>
  <table class="g-table"><thead><tr><th>Tower</th><th>Cost</th><th>What it does</th><th>Tier III paths</th></tr></thead><tbody>
  <tr><td>${tower('water')}<b>Water</b></td><td>65 ◈</td><td><b>The combo builder.</b> Light damage, and it <b>Soaks</b> enemies for 4 seconds (6 at Tier II+). Soaked does not slow. It sets up Ice and Lightning.</td><td><b>Deluge:</b> splash soaks a group.<br><b>Pressure Lance:</b> focused damage, longer range.</td></tr>
  <tr><td>${tower('ice')}<b>Ice</b></td><td>75 ◈</td><td><b>Chills</b> (slows 24% for 2.7 s at Tier I). Hits a <b>Soaked</b> enemy? It <b>Freezes</b> solid.</td><td><b>Cold front:</b> splash chill, stronger slow.<br><b>Crystal focus:</b> more damage and range.</td></tr>
  <tr><td>${tower('fire')}<b>Fire</b></td><td>60 ◈</td><td>Strong hits plus 3 seconds of <b>burning</b>. Hits a <b>Frozen</b> enemy? It <b>Shatters</b> for area damage.</td><td><b>Wildfire:</b> stronger burning.<br><b>Fracture furnace:</b> bigger shatter bursts.</td></tr>
  <tr><td>${tower('lightning')}<b>Lightning</b></td><td>90 ◈</td><td>Big direct strikes. Hits a <b>Soaked</b> enemy? It <b>chains</b> to nearby enemies.</td><td><b>Chain reaction:</b> chains through up to 5.<br><b>Focused current:</b> concentrated damage.</td></tr>
  </tbody></table>
  <p class="g-tip"><b>Remember:</b> Water does little damage by itself. Its job is to make everything else stronger. Place it first, where enemies will pass the Ice and Lightning next.</p>`},
 {id:'combos',title:'Combos: the heart of the game',short:'Combos',html:`
  <p class="g-lead"><b>Water is the combo builder.</b> It Soaks enemies. Ice and Lightning then <i>use</i> the Soak, and Fire finishes what Ice froze.</p>
  ${fig('combo-chain.jpg','Three steps: a soaked golem near a Water tower, a frozen golem in an ice shell near an Ice tower, and a golem being shattered near a Fire tower.','The full chain: <b>Water soaks</b> → <b>Ice freezes</b> the soaked enemy → <b>Fire shatters</b> the frozen enemy.','g-wide')}
  <div class="g-combos">
   <div><h4>${tower('water')}+${tower('ice')} Freeze</h4><p>Ice hits a <b>Soaked</b> enemy: the Soak is used up and the enemy <b>stops completely</b> for 1.5 seconds (0.75 for bosses).</p></div>
   <div><h4>${tower('water')}+${tower('lightning')} Conduction</h4><p>Lightning hits a <b>Soaked</b> enemy: the bolt <b>jumps</b> to nearby enemies (3 in total at Tier I). Chained enemies take 75% damage.</p></div>
   <div><h4>Freeze + ${tower('fire')} Shatter</h4><p>Fire hits a <b>Frozen</b> enemy: it <b>shatters</b>, hurting everything around it with a big burst. This is a <b>three-tower combo</b>: Water, then Ice, then Fire.</p></div>
  </div>
  <div class="g-row">${fig('combo-soak.jpg','Slimes with water droplets on a road.','Soaked: blue droplets fall from the enemy.')}${fig('combo-freeze.jpg','A beetle frozen with the label FROZEN above it.','Frozen: an ice shell and the word FROZEN.')}${fig('combo-chain-lightning.jpg','A purple lightning arc linking three soaked enemies.','Conduction: a violet arc links soaked enemies.')}</div>
  <h3>How to set up a combo</h3>
  <ol><li>Put <b>Water</b> where enemies arrive, so they get Soaked first.</li><li>Put <b>Ice</b> just after it, with ranges overlapping, so it freezes them while they are still wet.</li><li>Put <b>Fire</b> so its range covers the spot where they freeze. Fire attacks every 0.85 s, so it lands inside the 1.5 s window when it is in range.</li><li>Put <b>Lightning</b> where Soaked enemies bunch up: bends and crowded stretches.</li></ol>
  <h3>Freeze resistance</h3>
  <p>After a freeze ends, an enemy can't be frozen again for <b>4 seconds</b> (a small ring timer above it). A shatter shortens that to <b>2 seconds</b>, so a good Water-Ice-Fire setup keeps cycling.</p>
  <p class="g-tip"><b>Rule of thumb:</b> if your Fire never shatters, check that its range overlaps the place where Ice freezes things.</p>`},
 {id:'statuses',title:'Statuses at a glance',short:'Statuses',html:`
  ${fig('statuses.jpg','Five golems: dripping water, a chill ring, an ice shell, small flames, and a ring timer above the head.','Left to right: <b>Soaked</b>, <b>Chilled</b>, <b>Frozen</b>, <b>Burning</b>, <b>Freeze resistance</b>.','g-wide')}
  <table class="g-table"><thead><tr><th>Status</th><th>Looks like</th><th>What it does</th></tr></thead><tbody>
  <tr><td><b>Soaked</b></td><td>Blue droplets</td><td>No slow. Lets Ice freeze and Lightning chain. 4 s at Tier I.</td></tr>
  <tr><td><b>Chilled</b></td><td>Pale ring at the feet</td><td>Slows 24% for 2.7 s at Tier I (stronger with upgrades, never above 50%).</td></tr>
  <tr><td><b>Frozen</b></td><td>Ice shell</td><td>Can't move for 1.5 s (bosses 0.75 s). Fire shatters it.</td></tr>
  <tr><td><b>Burning</b></td><td>Small flames</td><td>Damage every moment for 3 s. Goes straight through armour and shields.</td></tr>
  <tr><td><b>Freeze resistance</b></td><td>Ring timer overhead</td><td>Can't be frozen again until the ring runs out (4 s, or 2 s after a shatter).</td></tr></tbody></table>
  <p>Select any enemy to see its exact health and statuses in the side panel.</p>`},
 {id:'building',title:'Building and upgrading',short:'Building',html:`
  <div class="g-row">${fig('place-valid.jpg','A Fire tower preview on open grass beside the road.','A good spot: open ground, clear of the road.')}${fig('place-invalid.jpg','A faded Fire tower preview with a red X on the road.','A blocked spot: a red ✕ and a grey dashed ring.')}</div>
  <ul><li>Pick a tower (click it, or press ${key('1')}–${key('4')}), then click open ground. You can build anywhere except on the road, in doorways and on walls or water.</li>
  <li>Right-click or ${key('Esc')} cancels.</li></ul>
  <h3>Upgrades</h3>
  <div class="g-row g-side">${fig('tower-panel.jpg','A tower panel showing Fire Tier II with two Tier III choices, the first outlined in gold.','Select a tower to command it. The <b>?</b> shows how it works.')}<div>
  <ul><li><b>Tier II</b>: +55% damage, longer range, faster attacks. Press ${key('U')} and it upgrades at once.</li>
  <li><b>Tier III</b>: choose one of two paths. Press ${key('U')}: both are outlined, ${key('←')} ${key('→')} picks, ${key('Enter')} (or ${key('U')} again) buys, ${key('Esc')} cancels.</li>
  <li><b>Target</b>: <i>First</i> (furthest along the road), <i>Last</i> (newest arrival), <i>Strongest</i> (most health) or <i>Nearest</i>. The badge above the tower shows its choice. ${key('T')} cycles it.</li>
  <li><b>Sell</b> (${key('X')}): a tower that hasn't fired yet refunds everything; otherwise you get 75% back.</li>
  <li><b>Overcharge</b> (Engine Trials only, unlocked by defeating the wave 25 Guardian): a Tier III tower can be overcharged again and again with Charge, +15% damage per level. ${key('U')} does it. It lasts for that run only; skills are the permanent power.</li></ul>
  <p class="g-tip">Upgrading a well-placed tower is often better than building a new one.</p></div></div>
  <h3>Pace</h3><p>Start each wave when you are ready (${key('N')}). You can send the next wave early while enemies remain. Speed: ${key('Z')} 1×, ${key('C')} 2×, ${key('V')} 5×. ${key('Space')} pauses, and you can still build and upgrade while paused.</p>`},
 {id:'enemies',title:'Know your enemies',short:'Enemies',html:`
  ${fig('enemies-basic.jpg','A slime, a beetle, a golem and a large boss golem.','Slime · Beetle · Golem · Regulator Guardian (boss)','g-wide')}
  <table class="g-table"><tbody>
  <tr><td><b>Slime</b></td><td>Slow and soft. 1 seal damage.</td></tr><tr><td><b>Beetle</b></td><td>Fast. 1 seal damage.</td></tr><tr><td><b>Golem</b></td><td>Slow and tough. 2 seal damage.</td></tr>
  <tr><td><b>Regulator Guardian</b></td><td>Boss. Very tough, freezes for only 0.75 s. <b>If it reaches the seal, the run is lost.</b></td></tr></tbody></table>
  <h3>Campaign roles</h3>
  ${fig('enemies-roles.jpg','A diver with a fin and ripple, a shield-bearer with a bronze shield, a pale runner with speed lines, a violet splitter with a glowing crack, and a small splinter.','Diver · Shield-bearer · Runner · Splitter · Splinter','g-wide')}
  <table class="g-table"><tbody>
  <tr><td><b>Diver</b> (Moonwell)</td><td>Slips under the water now and then. While submerged (just a ripple) it <b>can't be targeted</b>.</td></tr>
  <tr><td><b>Shield-bearer</b> (Emberheart)</td><td>Hits under 10 damage do only a quarter. Upgrade, use Fire and Lightning, or burn it.</td></tr>
  <tr><td><b>Runner</b> (Rimeglass)</td><td>Very fast, very fragile. Slow it with Ice or catch it early.</td></tr>
  <tr><td><b>Splitter</b> (Stormcrown)</td><td>Breaks into two smaller splinters when defeated. Splash and chains clean them up.</td></tr></tbody></table>
  <h3>Attuned foes, elites and armour</h3>
  ${fig('enemies-attuned.jpg','Four golems tinted blue, orange, white and violet, and a golem with a gold dashed ring and a star.','Tide · Ember · Rime · Storm attuned, and an Elite (gold ring and star).','g-wide')}
  <table class="g-table"><thead><tr><th>Attuned</th><th>Resists</th><th>Weak to</th></tr></thead><tbody>
  <tr><td><b>Tide</b> (blue drips)</td><td>Can't be Soaked; Water does half</td><td>Lightning +25%</td></tr>
  <tr><td><b>Ember</b> (glowing cracks)</td><td>Can't burn; Fire does half</td><td>Shatter +25%</td></tr>
  <tr><td><b>Rime</b> (frost stars)</td><td>Can't be Chilled; freezes half as long; Ice does half</td><td>Fire and burning +25%</td></tr>
  <tr><td><b>Storm</b> (sparks)</td><td>Doesn't carry chains; Lightning does half</td><td>Water +25% while Soaked</td></tr></tbody></table>
  <p><b>Elites</b> have much more health, give more Charge and cost one extra seal. <b>Armour</b> (golems, elites and bosses on harder levels) shaves a little off every hit, but at least 30% always gets through and burning ignores it. Select an enemy to read exactly what it resists.</p>`},
 {id:'complex',title:'The Containment Complex (your hub)',short:'The hub',html:`
  ${fig('hub-overview.jpg','The painted hub map with labelled places and a glowing Next step button.','Your home between battles. One <b>Next step</b> always glows at the bottom.','g-wide')}
  ${fig('hub-wallet.jpg','The top bar showing Parts, Resonance and Warden Power.','Click any of these for a short explanation.','g-wide')}
  <table class="g-table"><tbody>
  <tr><td><b>⚙ Restoration Parts</b></td><td>Rebuild the complex. Earned by holding the Outer Seal, winning missions and earning Seals.</td></tr>
  <tr><td><b>✦ Resonance</b></td><td>Buys skills. Earned <b>only in Engine Trials</b> at the Aetherheart Engine: every 5 waves past your best banks some.</td></tr>
  <tr><td><b>⬢ Warden Power</b></td><td>The total of every bonus your towers carry. It applies in every battle.</td></tr></tbody></table>
  <h3>Restoring the complex</h3>
  <p>Raise the <b>Outer Seal Gate</b> first (40 Parts). Each facility then has three restoration stages. <b>Every stage makes every tower stronger, everywhere</b> (+5% damage for that element), and its first stage opens that element's skills. In the campaign, each stage needs its mission cleared first. <b>Cogwright's Atelier</b> has no missions: rebuild it with Parts from anywhere for more starting Charge.</p>
  <div class="g-row">${fig('hub-skills.jpg','The skill tree with five branches.','Skills: five branches. Reassign them for free at any time.')}${fig('hub-badges.jpg','The badge gallery.','Badges: 28 to earn. Show your favourite on your profile.')}</div>
  <p class="g-tip"><b>Your progress saves automatically</b> in this browser. Settings → <i>Copy save code</i> moves it to another browser or PC.</p>`},
 {id:'modes',title:'Ways to play',short:'Modes',html:`
  <h3>Training: the tutorial</h3><p>Five short waves that teach each tower and combo. First clear: 80 Parts (replays 20). Its three Seals pay 15 Parts each, once.</p>
  <div class="g-row g-side">${fig('hub-outer.jpg','The Outer Seal panel listing level 4 with a Defend button and level 3 as held.','Hold the Outer Seal: pick a level and press Defend.')}<div>
  <h3>Hold the Outer Seal</h3><p><b>The best early source of Parts.</b> Levels of 8 waves, each about 15% tougher than the last:</p>
  <ul><li>From level 3, some foes are attuned. Armour from 4, elites from 6, and a boss guards every 5th level.</li><li>First hold pays 40 Parts at level 1 and 10 more per level. Replays pay less. A loss still keeps some Parts.</li><li>Each level shows a <b>recommended Warden Power</b> next to yours: Ready, Tough or Very hard.</li></ul></div></div>
  <div class="g-row g-side">${fig('hub-facility.jpg','The Moonwell Cisterns panel listing missions.','Campaign missions live in each facility panel.')}<div>
  <h3>The campaign</h3><ul><li><b>Moonwell Cisterns</b> first, then Emberheart, Rimeglass and Stormcrown in any order, then the <b>Aetherheart finale</b>.</li>
  <li>Three missions per facility, each a new map with its own enemy role. Clearing a mission opens that facility's next restoration stage.</li>
  <li>First clears pay 70, 90 and 110 Parts (finale 150). <b>Replays pay only Seals you haven't earned yet</b>, so replay for Seals and badges, not for Parts.</li><li><b>Seals</b>, 15 Parts each, once: <i>Cleared</i>, <i>Held</i> (seal at 75% or more) and a <i>Challenge</i> written on the mission.</li>
  <li>Each attempt varies a little: enemy order, which attuned foes appear, and which entrance a wave uses.</li></ul></div></div>
  ${fig('results.jpg','A results report: waves held, Parts earned, combos and new Seals.','After every battle: what you earned and what to do next.')}
  <h3>Engine Trials: where Resonance comes from</h3><p>Once the Moonwell's first stage is restored, the <b>Aetherheart Engine</b> wakes. Engine Trials is one long defense that keeps getting harder, with no fixed end.</p><ul><li><b>Every 5 waves past your best</b> banks Resonance at once, and you keep it even if the seal breaks. Resonance buys skills, and you can spend it <b>mid-run</b>: press ${key('K')} or the ✦ button to open the skill tree without leaving the battle. New ranks take effect at once.</li><li>A run can go up to <b>wave 20, +10 for every restoration stage</b> you have completed. Winning the Aetherheart finale removes the limit: that's the <b>Unbound Gate</b>, the climb to wave 500.</li><li>Your best wave is your record for badges and Mastery.</li><li>Resonance per milestone grows as you go deeper: wave 5 pays 44, wave 50 pays 170, wave 100 pays 310. <b>Reaching wave 100 pays enough to finish the whole skill tree.</b></li><li>Defeat the <b>wave 25 Guardian</b> once to unlock <b>Overcharge</b>: spend spare Charge on Tier III towers for +15% damage per level (press ${key('U')}). It resets every run and spends Charge, not Resonance.</li><li>Every Warden hits a wall eventually: enemy health compounds each wave. A full skill tree with Overcharge reaches about wave 100; beyond that, <a href="#" data-g="ascension">Ascension</a> and Mastery carry you to wave 500.</li></ul>`},
 {id:'ascension',title:'Ascension: the climb to wave 500',short:'Ascension',html:`
  <p>Engine Trials has no end, but it has a goal: <b>wave 500</b>. Every hundred waves a <b>Warden Trial</b> stands in the way: a crowned Guardian, tougher than any before it. Like every boss, if it reaches the seal the run ends.</p>
  ${fig('ascension.jpg','The Ascension card after defeating a Warden Trial.','Beat a Warden Trial and you Ascend, for good.')}
  <h3>What Ascending gives you</h3><p>Ascension is a <b>milestone, never a reset</b>: you keep everything. Each rank adds a new power in Engine Trials, multiplies your towers' damage there, and raises a banner over the Aetherheart Engine in the hub.</p>
  ${fig('ascension-banners.jpg','The Aetherheart Engine with prismatic banners and the Crown above it.','Each rank raises new banners over the Engine. Wave 500 crowns it.')}
  <ul><li><b>Ascension I · wave 100 · Ascendant Overcharge</b>: Overcharge adds +20% per level and gets cheaper to stack. Damage ×2.3.</li>
  <li><b>Ascension II · wave 200 · Resonant Combos</b>: shatter and conduction hit twice as hard; freezes last 50% longer. Damage ×4.8.</li>
  <li><b>Ascension III · wave 300 · Warden's Reserve</b>: waves and defeated enemies pay 50% more Charge. Damage ×10.</li>
  <li><b>Ascension IV · wave 400 · Elemental Concord</b>: +15% damage for every different element you have built. Damage ×16.</li>
  <li><b>The Crown · wave 500</b>: the Crown of the Unbound floats over the Engine, and the Warden Ascendant badge is yours.</li></ul>
  <h3>Checkpoints</h3><p>Once you have Ascended, the Engine panel lets you <b>start a run at wave 100, 200, 300 or 400</b> with a bank of Charge (about half what a full run would have by then). You don't have to replay hundreds of easy waves each time.</p>
  <h3>Mastery fuels the climb</h3><p>Ascension alone is not enough to reach the next Trial. Spend the Resonance from deeper milestones on <b>Mastery</b>: once a skill branch is complete, open its node in the Skill tree to buy Mastery ranks. Mastery tiers open at best waves 50, 100, 200, 300 and 400.</p>
  <ul><li>Reaching wave 100 pays enough Resonance to finish the skill tree.</li><li>Pushing toward each Trial pays for the Mastery tier you need to pass it.</li><li>Stuck short of a Trial? Push for a new best depth: every 5 waves past your best banks more Resonance.</li></ul>`},
 {id:'tips',title:'Tips from veteran Wardens',short:'Tips',html:`
  <ol class="g-tips"><li><b>Water first, always near Ice or Lightning.</b> Water alone is weak; Water with partners wins waves.</li>
  <li><b>Build where the road bends or doubles back.</b> One tower there covers two stretches.</li>
  <li><b>Overlap ranges.</b> Select a tower to see its range circle; combos only happen where circles overlap.</li>
  <li><b>Upgrade before you spread out.</b> A Tier II tower is a big jump for its cost.</li>
  <li><b>Watch the seal bar</b>, not just the enemies. If it drops, add slow (Ice) or damage near the end of the road.</li>
  <li><b>Bosses end runs.</b> Keep Fire near the end of the road, and save Charge for upgrades before boss waves.</li>
  <li><b>Read the next wave.</b> The bottom-right card names it: roles, attuned foes, elites and which entrance.</li>
  <li><b>Short on Parts?</b> Hold the Outer Seal: every level pays Parts, and your restorations make every tower stronger.</li></ol>`},
 {id:'controls',title:'Controls',short:'Controls',html:`
  <table class="g-table g-keys"><tbody>
  <tr><td>${key('1')} ${key('2')} ${key('3')} ${key('4')}</td><td>Pick Fire, Water, Ice, Lightning to build</td></tr>
  <tr><td>${key('U')}</td><td>Upgrade the selected tower (Tier III: ${key('←')} ${key('→')} then ${key('Enter')})</td></tr>
  <tr><td>${key('T')}</td><td>Change what the selected tower targets</td></tr><tr><td>${key('X')}</td><td>Sell the selected tower</td></tr>
  <tr><td>${key('N')}</td><td>Start the next wave (or send it early)</td></tr><tr><td>${key('Space')}</td><td>Pause and resume</td></tr>
  <tr><td>${key('Z')} ${key('C')} ${key('V')}</td><td>Speed 1×, 2×, 5×</td></tr><tr><td>${key('Esc')} / right-click</td><td>Cancel or deselect</td></tr><tr><td>${key('K')} or ✦</td><td>Open the skill tree without leaving the battle (pauses it; new ranks work at once)</td></tr></tbody></table>
  <p>Change any key in <b>Settings → Hotkeys</b>. In the hub, every place is a button: ${key('Tab')} moves between them and ${key('Esc')} closes panels.</p>`}
];
let dlg=null,current=0;
function store(i){try{localStorage.setItem('warden.guide.chapter',CHAPTERS[i].id)}catch{}}
function saved(){try{const id=localStorage.getItem('warden.guide.chapter');const i=CHAPTERS.findIndex(c=>c.id===id);return i<0?0:i}catch{return 0}}
function build(){if(dlg||typeof document==='undefined')return dlg;dlg=document.createElement('dialog');dlg.id='wardenGuide';dlg.className='warden-guide';dlg.setAttribute('aria-labelledby','gTitle');
 dlg.innerHTML=`<div class="g-shell"><header class="g-head"><div><span class="g-eyebrow">THE WARDEN'S GUIDE</span><h2 id="gTitle"></h2></div><label class="g-select-wrap"><span class="g-sr">Chapter</span><select id="gSelect">${CHAPTERS.map((c,i)=>`<option value="${i}">${c.short}</option>`).join('')}</select></label><button class="g-close" data-gclose aria-label="Close the guide">×</button></header>
 <nav class="g-nav" aria-label="Guide chapters"><ol>${CHAPTERS.map((c,i)=>`<li><button data-gi="${i}">${c.short}</button></li>`).join('')}</ol></nav>
 <article class="g-body" id="gBody" tabindex="0"></article>
 <footer class="g-foot"><button id="gPrev">← Previous</button><span id="gCount"></span><button id="gNext">Next →</button></footer></div>`;
 document.body.append(dlg);
 dlg.querySelector('[data-gclose]').onclick=()=>dlg.close();dlg.querySelectorAll('[data-gi]').forEach(b=>b.onclick=()=>show(+b.dataset.gi));
 dlg.querySelector('#gSelect').onchange=e=>show(+e.target.value);dlg.querySelector('#gPrev').onclick=()=>show(current-1);dlg.querySelector('#gNext').onclick=()=>show(current+1);
 dlg.addEventListener('click',e=>{const a=e.target.closest?.('[data-g]');if(a){e.preventDefault();open(a.dataset.g)}else if(e.target===dlg)dlg.close()});
 dlg.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;if(e.key==='ArrowRight'&&e.altKey){show(current+1);e.preventDefault()}if(e.key==='ArrowLeft'&&e.altKey){show(current-1);e.preventDefault()}e.stopPropagation()});
 return dlg}
function show(i){i=Math.max(0,Math.min(CHAPTERS.length-1,i));current=i;store(i);const c=CHAPTERS[i];dlg.querySelector('#gTitle').textContent=c.title;const body=dlg.querySelector('#gBody');body.innerHTML=c.html;body.scrollTop=0;
 dlg.querySelectorAll('[data-gi]').forEach(b=>{const on=+b.dataset.gi===i;b.classList.toggle('on',on);b.setAttribute('aria-current',on?'page':'false')});dlg.querySelector('#gSelect').value=String(i);
 dlg.querySelector('#gPrev').disabled=i===0;dlg.querySelector('#gNext').disabled=i===CHAPTERS.length-1;dlg.querySelector('#gCount').textContent=`${i+1} of ${CHAPTERS.length}`}
// open(): the battle screen passes its own opener so the game pauses while reading.
function open(id,opener){build();const i=id?Math.max(0,CHAPTERS.findIndex(c=>c.id===id)):saved();show(i<0?0:i);if(!dlg.open){if(opener)opener('wardenGuide');else dlg.showModal()}dlg.querySelector('#gBody').focus()}
if(typeof document!=='undefined'){if(document.body)build();else document.addEventListener('DOMContentLoaded',build)}
root.WardenGuide={open,CHAPTERS};
if(typeof module==='object'&&module.exports)module.exports={CHAPTERS};
})(typeof globalThis!=='undefined'?globalThis:this);
