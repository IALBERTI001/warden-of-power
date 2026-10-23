# Warden Power v2, Tactician rating, Eternal Mastery and the wave 1000 secret (approved Oct 23 2026)

## Warden Power = what you have built
100 = a fresh Warden. Every source is weighted by what it was measured to be worth in the simulator (standard play,
22-tower bot, 12 seeds, Ascension frozen per run): depth reached -> enemy health at that depth (ENGINE.hp) ->
multiplier over a fresh Warden. Rating = 100 x the product of all factors.

| Source (full) | Factor | Mean bot depth |
|---|---|---|
| Fresh Warden (gate raised) | 1 | 68 |
| Restorations (Moonwell 1.052, Emberheart 1.051, Rimeglass 1.021, Stormcrown 1.049, Atelier 1.038; per stage ^(stage/3)) | 1.23 all | 79 |
| Skill tree (per branch: fire 1.063, water 1.048, ice 1.036, lightning 1.076, engineering 1.026; by Resonance spent in the branch) | 1.28 | 92 |
| Mastery (all 250 ranks, by share of ranks) | 2.591 | 154 |
| Ascension I / II / III / IV (Crown adds no power) | 3.67 / 9.13 / 21.49 / 60.76 | 257 / 338 / 420 / 523 |
| Eternal Mastery (94 ranks, +3% each, Engine only) | x16.1 | ~820 |

Branch and facility factors split the measured group gain half equally, half by each one's own measured share (single
bonuses alone are too small to measure cleanly). Ratings: fresh 100 · restored 123 · tree 157 · Mastery 406 ·
Ascension I 1,489 · III 8,720 · Crown 24,656 · Crown + full Eternal 396,840.

Projected depth = depth where enemy health = HP(68.2) x power/100. The Outer Seal's old recommendations (sum of
percentages) are converted along a typical progression path (`legacyToRating`). Warden Trials show the power that
reaches the Trial with standard play.

## Tactician = how well you play
At the end of an Engine run (20+ waves, not stopped by the run limit): HP(depth reached) / HP(projected depth).
Apprentice <1 · Adept 1 · Expert 1.5 · Master 2 · Grandmaster 3 · Legend 4. Badges at Master, Grandmaster, Legend.
Your run to 654 with the Crown and full Mastery = x3.57, Grandmaster.

## Eternal Mastery
Opens with the Crown. 94 ranks, +3% damage for every tower in Engine Trials per rank (x16.1 at cap), cost 1,500 + 100n.
After the Crown every run pays 20% of the milestone for each 5 waves past 500 below your best (full pay for new bests).

## Wave 1000 (secret)
Wave 1000's boss is The Thousandth (white-gold, 2x Trial health). Clearing it awards the hidden Mythic badge
"Warden Eternal" (not listed or counted until earned: 32 / 31), a quiet reveal card, and turns the crown over the
Engine white-gold. Simulator check from checkpoint 400 with full Eternal Mastery: standard play 821-827; play at the
measured skill of your 654 run (x4 damage-equivalent) 991-1001; x3: 951. Wave 1000 needs everything plus a Tactician's hand.
