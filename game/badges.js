// Warden badges: tier, artwork path and progress for every achievement. Pure data + helpers (no DOM).
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.WardenBadges=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const TIERS={
 first_foundation:'bronze',first_upgrade:'bronze',tutorial_clear:'bronze',first_soaked_freeze:'bronze',first_conduction:'bronze',first_shatter:'bronze',all_elements_one_run:'bronze',
 all_combos_one_run:'silver',one_chain_four:'silver',one_shatter_three:'silver',perfect_campaign_mission:'silver',close_call:'silver',early_wave_five:'silver',two_elements_only:'silver',three_maps_clear:'silver',first_endless_twenty:'silver',
 restore_water:'silver',restore_fire:'silver',restore_ice:'silver',restore_lightning:'silver',endless_fifty:'silver',
 freeze_twenty_five:'gold',conduction_twenty_five:'gold',shatter_twenty_five:'gold',ten_mission_wins:'gold',engine_reborn:'gold',endless_hundred:'gold',
 endless_500:'prismatic'
};
const TIER_LABEL={bronze:'Bronze',silver:'Silver',gold:'Gold',prismatic:'Prismatic'};
// Achievements that need campaign maps, restorations or endless mode, which are not playable yet.
const LATER=new Set(['perfect_campaign_mission','close_call','two_elements_only','three_maps_clear','ten_mission_wins','first_endless_twenty','restore_water','restore_fire','restore_ice','restore_lightning','engine_reborn','endless_fifty','endless_hundred','endless_500']);
// Cumulative counters shown as progress while locked.
const PROGRESS={freeze_twenty_five:['freeze',25],conduction_twenty_five:['conduction',25],shatter_twenty_five:['shatter',25],early_wave_five:['early',5]};
function tier(id){return TIERS[id]||'bronze'}
function image(id,size=256){return `assets/badges/${id}-${size}.png`}
function progress(id,profile){const p=PROGRESS[id];if(!p)return null;const value=Math.min(p[1],Math.floor(profile?.counters?.[p[0]]||0));return{value,goal:p[1]}}
function available(id){return !LATER.has(id)}
function equip(profile,id){if(!profile?.earned?.[id])return false;profile.equipped=id;return true}
return{TIERS,TIER_LABEL,LATER,PROGRESS,tier,image,progress,available,equip};
});
