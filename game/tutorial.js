(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenTutorial=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const STEPS=[
['place','Raise your first fire tower','Select Fire, then place it on clear ground near the marked bend. Its range must reach the road.','[data-type="fire"]'],
['inspect','A tower is yours to command','Click your fire tower. Its command panel shows damage, range, targeting, upgrades and the sell refund.','.inspector'],
['upgradeView','Read before you spend','Press your Upgrade hotkey or focus the gold upgrade button. Compare the benefit and Charge cost.','#upgradeOne'],
['upgrade','Strengthen the defense','Purchase Tier II with the gold upgrade button. Upgrades take effect immediately without granting a free shot.','#upgradeOne'],
['target','Choose what matters','Change Target to Strongest, Last or Nearest. First means furthest along the route; Strongest means highest remaining health.','#targetMode'],
['sellView','You can change your mind','Show me highlights Sell without opening it. Press Understood to continue. An unused tower refunds fully; a tower that has fired returns 75%. Selling is optional.','#sellTower'],
['wave','Put your defense to work','Begin the first wave. Select the tower during combat: the badge above every tower identifies its targeting priority. The Battle Speed buttons at the bottom run the fight at 1×, 2× or 5×; Space pauses.','#next'],
['water','Prepare a combination','Build Water near the road. Water deals light damage and applies Soaked for 4 seconds. Soaked alone does NOT slow; it primes ice and lightning combos.','[data-type="water"]'],
['ice','Add ice to the overlap','After wave one, build Ice beside Water with overlapping coverage. Ice alone chills for 2.7 seconds, slowing by 24% at Tier I. Start wave two when both are ready.','[data-type="ice"]'],
['freeze','Watch for the freeze','Let Water soak an enemy, then Ice freeze it. The shell stops movement for 1.5 seconds. Soaked is consumed; natural thaw gives 4 seconds of resistance.',null],
['lightning','Conduct the current','After wave two, build Lightning beside Water. Wave three sends a crowd: soaked targets conduct to nearby foes. It can arc from a soaked target to nearby foes.','[data-type="lightning"]'],
['conduction','See the chain connect','Send the next wave when ready. Watch the violet arc connect enemies; the combo badge unlocks only after a real conducted hit.','#next'],
['shatter','Trade control for damage','Place Fire where it can hit frozen enemies. Shatter deals a burst and ends the freeze. Recovery is only 2 seconds instead of 4.',null],
['complete','Command the remaining defense','You can build, upgrade, sell and retarget during combat. Space pauses; speed controls offer 1×, 2× and 5×. Finish all five waves. Wave 4 practices shatter; wave 5 combines everything.','#next']
];
class Guide{
 constructor(saved={}){this.done={...(saved.done||{})};this.skipped={...(saved.skipped||{})}}
 record(action){this.done[action]=true}
 sync(game){if(game.towers.some(t=>t.type==='fire'))this.record('place');if(game.towers.some(t=>t.tier>1)){this.record('upgradeView');this.record('upgrade')}if(game.wave>0)this.record('wave');for(const type of ['water','ice','lightning'])if(game.towers.some(t=>t.type===type))this.record(type);if(game.combos.freeze)this.record('freeze');if(game.combos.conduction)this.record('conduction');if(game.combos.shatter)this.record('shatter')}
 current(){return STEPS.find(s=>!this.done[s[0]]&&!this.skipped[s[0]])||STEPS.at(-1)}
 skip(){this.skipped[this.current()[0]]=true}
 canStart(game){return game.wave>0||STEPS.findIndex(s=>s===this.current())>=6}
 save(){return{done:{...this.done},skipped:{...this.skipped}}}
}
return{Guide,STEPS};
});
