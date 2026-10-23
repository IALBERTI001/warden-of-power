# Ascension — the climb to wave 500 (approved Oct 23 2026, built v1)

Milestone, never a reset. Lives in Engine Trials only.

## Warden Trials
- Waves 100, 200, 300, 400, 500 end with a **Warden Trial**: a crowned Guardian (gold ring + crown + "WARDEN TRIAL" label,
  enemy panel line). HP = that wave's Guardian × 1.2 (Trial I) or × 1.5 (II–V). Reaching the seal ends the run, like every boss.
- Clearing the wave raises `profile.ascension` to wave/100 (once, in order) and awards the badge:
  I `endless_hundred` Centurion · II `endless_200` Banner Bearer · III `endless_300` Gilded Warden · IV `endless_400` Prism Ascendant ·
  Crown `endless_500` Warden Ascendant.

## Powers (Engine Trials only, take effect the moment you Ascend, even mid-run)
| Rank | Power | Effect | Tower damage |
|---|---|---|---|
| I | Ascendant Overcharge | +20%/level (was 15%), cost ×1.30/level (was 1.35) | ×2.3 |
| II | Resonant Combos | shatter & conduction ×2, freezes +50% | ×4.8 |
| III | Warden's Reserve | wave Charge and kill rewards +50% | ×10 |
| IV | Elemental Concord | +15% per distinct element built (max +60%) | ×16 |
| Crown | Crowned Warden | the crown over the Engine | — |

## Checkpoints
Start a run at any ascended hundred (100–400) from the Engine panel, with a Charge bank of 300 + 6·w²
(about half of what a full run has earned by then: simulator ~110k by wave 100, ~226k by 150). Resonance still pays only past your best.

## Economy (Resonance 30 + 14m per milestone)
Earned by wave 100: 3,540 (tree 3,525) · 200: 12,680 · 300: 27,420 · 400: 47,760 · 500: 73,700.
Mastery (5 branches × 5 tiers × 10 ranks, cost 40·tier + 10·rank) totals 43,750; tiers open at best waves 50/100/200/300/400.
No rebalance was needed: each push toward the next Trial pays for the Mastery needed to pass it.

## Simulator (22-tower bot, from the checkpoint, 3 seeds; "mastery" = ranks filled per branch across tiers)
| From | Mastery | Reached |
|---|---|---|
| Full tree, no rank | 0 | passes Trial I most runs (94–160) |
| Ascension I @100 | 5 | 177–198 (short: earn more Mastery) |
| Ascension I @100 | 15 | 260+ (passes Trial II) |
| Ascension II @200 | 20 | 291–360 |
| Ascension II @200 | 30 | 355–360 (passes Trial III) |
| Ascension III @300 | 35 | 391–460 |
| Ascension III @300 | 45 | 460 (passes Trial IV) |
| Ascension IV @400 | 45–50 | 505–533 (claims the Crown) |
Expected Mastery when a player reaches each Trial on the normal Resonance curve: ~13 at 200, ~30 at 300, ~47 at 400, 50 at 500.

## The moment
- Battle: "ASCENSION n" card (badge medal, banner line, new power, ×damage, checkpoint unlocked), its own fanfare
  (`assets/audio/ascension.wav`, v1 candidate), battlefield paused while open.
- Hub: on the next visit the Engine area plays the restoration-style moment and raises the new banners
  (`assets/hub/stages/aetherheart-asc1..5.png`, v1 candidates), banner "ASCENDED" / "CROWNED", fanfare.
- Engine panel: Ascension box with rank, powers, next Trial, checkpoint buttons. Guide chapter "Ascension".
