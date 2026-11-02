// Warden badges: tier, artwork path and progress for every achievement. Pure data + helpers (no DOM).
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenBadges=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TIERS={
 first_foundation:'bronze',first_upgrade:'bronze',tutorial_clear:'bronze',first_soaked_freeze:'bronze',first_conduction:'bronze',first_shatter:'bronze',all_elements_one_run:'bronze',
 all_combos_one_run:'silver',one_chain_four:'silver',one_shatter_three:'silver',perfect_campaign_mission:'silver',close_call:'silver',early_wave_five:'silver',two_elements_only:'silver',three_maps_clear:'silver',first_endless_twenty:'silver',
 restore_water:'silver',restore_fire:'silver',restore_ice:'silver',restore_lightning:'silver',endless_fifty:'silver',
 freeze_twenty_five:'gold',conduction_twenty_five:'gold',shatter_twenty_five:'gold',ten_mission_wins:'gold',engine_reborn:'gold',endless_hundred:'gold',endless_200:'gold',endless_300:'gold',endless_400:'prismatic',
 endless_500:'prismatic',endless_600:'prismatic',endless_700:'prismatic',endless_800:'prismatic',endless_900:'prismatic',
 tactician_master:'silver',tactician_grandmaster:'gold',tactician_legend:'prismatic',power_rising:'silver',power_towering:'gold',power_overwhelming:'prismatic',
 eternal_thousand:'mythic'
};
// Hidden badges are not listed and not counted until earned (the wave 1000 secret).
const HIDDEN=new Set(['eternal_thousand','endless_600','endless_700','endless_800','endless_900']);
// The secret depth badges share the Crown medal until their own art is made.
const ART={endless_600:'endless_500',endless_700:'endless_500',endless_800:'endless_500',endless_900:'endless_500'};
const TIER_LABEL={bronze:'Bronze',silver:'Silver',gold:'Gold',prismatic:'Prismatic',mythic:'Mythic'};
// Achievements that need campaign maps, restorations or endless mode, which are not playable yet.
const LATER=new Set([]);
// Cumulative counters shown as progress while locked.
const PROGRESS={freeze_twenty_five:['freeze',25],conduction_twenty_five:['conduction',25],shatter_twenty_five:['shatter',25],early_wave_five:['early',5]};
function tier(id){return TIERS[id]||'bronze'}
// Badge rewards (Nov 2 2026, user: "these badges should reward players"). Every badge pays once, by tier.
// The Thousandth (Warden Eternal) also grants the Eternal Crown: +10% damage for every tower, forever.
const REWARDS={bronze:{parts:25,resonance:0},silver:{parts:60,resonance:25},gold:{parts:150,resonance:150},prismatic:{parts:400,resonance:1000},mythic:{parts:5000,resonance:25000,crown:true}};
function reward(id){return REWARDS[tier(id)]||REWARDS.bronze}
function pay(profile,id){if(!profile||!profile.earned||!profile.earned[id])return null;profile.badgePaid=profile.badgePaid||{};if(profile.badgePaid[id])return null;const r=reward(id);
 profile.parts=(profile.parts||0)+r.parts;profile.resonance=(profile.resonance||0)+r.resonance;if(r.crown)profile.eternalCrown=true;profile.badgePaid[id]=new Date().toISOString();return r}
// Badges earned before rewards existed pay out once, the next time the game opens.
function payEarned(profile){const out={parts:0,resonance:0,count:0,crown:false};for(const id of Object.keys(profile?.earned||{})){const r=pay(profile,id);if(r){out.parts+=r.parts;out.resonance+=r.resonance;out.count++;out.crown=out.crown||!!r.crown}}return out}
function image(id,size=256){return `assets/badges/${ART[id]||id}-${size}.webp`}
function progress(id,profile){const p=PROGRESS[id];if(!p)return null;const value=Math.min(p[1],Math.floor(profile?.counters?.[p[0]]||0));return{value,goal:p[1]}}
function available(id){return !LATER.has(id)}
function visible(id,profile){return !HIDDEN.has(id)||!!profile?.earned?.[id]}
function listed(all,profile){return all.filter(a=>visible(a[0],profile))}
function publicTotal(all){return all.filter(a=>!HIDDEN.has(a[0])).length}
function equip(profile,id){if(!profile?.earned?.[id])return false;profile.equipped=id;return true}
return{REWARDS,reward,pay,payEarned,HIDDEN,visible,listed,publicTotal,TIERS,TIER_LABEL,LATER,PROGRESS,tier,image,progress,available,equip};
});
