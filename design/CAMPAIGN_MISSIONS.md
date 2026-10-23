# Campaign missions (built Oct 22 2026)

From the approved Campaign & Progression Plan: four sectors of three missions plus the Aetherheart finale (13 missions).

## Maps
- 13 painted maps in `game/assets/maps/<mission>.jpg`, painted by ChatGPT from layout guides (`previews/campaign/guides`,
  brief `previews/campaign/CAMPAIGN_MAPS_BRIEF.md`, sources `previews/campaign/out`). Every route has a different shape;
  Moonwell 3, Emberheart 3, Rimeglass 3, Stormcrown 3 and the finale have two entrances.
- The paintings drift a little from the guides, so each route is **traced from its painting** (`previews/campaign/trace.py`):
  a colour model of that map's road, a least-cost path from entrance to seal, then centring and smoothing. The same tool
  marks the open floor (20-unit grid) so towers can't be placed on walls, water, lava or machinery.

## Missions (`game/campaign.js`)
| Sector | Missions | New enemy role | Attuned pool |
| --- | --- | --- | --- |
| Moonwell Cisterns | Silted Overflow · Pump Gallery · Moonwell Basin | Divers (dip under water: untargetable 1.2 s of every 4.2 s) | Ember |
| Emberheart Forge | Slag Yard · Bellows Walk · Furnace Heart | Shield-bearers (hits under 10 do a quarter; burning passes) | Ember, Tide |
| Rimeglass Vaults | Frozen Racks · Thaw Doors · Vault Core | Runners (fast, fragile) | Rime, Ember |
| Stormcrown Spire | Rod Terrace · Coil Spiral · Crown Platform | Splitters (break into two splinters) | Storm, Tide |
| Aetherheart Engine | Aetherheart Core (finale, 15 waves, boss ×1.5) | All four roles | All four |

- Waves: 10 / 12 / 15 per sector mission, 15 in the finale; mission 3 and the finale end with a guardian boss.
- Unlocks: Moonwell missions after the gate; mission N+1 needs mission N cleared **and** that facility's restoration stage N;
  each restoration stage needs its mission; other sectors after the Moonwell is reawakened (any order); the finale after all four.
  Clearing the finale opens the Unbound Gate and awards Engine Reborn.
- Rewards: first clear 70 / 90 / 110 Parts (finale 150), replays 20 / 25 / 30 (40); each Seal +15 Parts once
  (Cleared, Held 75%+, and a Challenge: all three combos / two elements only / no seal lost / all four elements in the finale).
  No Resonance (Engine only).
- A bit of RNG per attempt (seeded, saved with the run): spawn order shuffled in each wave, the attuned element drawn from the
  sector's pool, and on two-entrance maps each wave uses the left, right or both entrances (single-entrance waves are 25%
  smaller; heavy waves and the last wave always use both). Golems and Splitters are capped per wave so luck never decides a run.
- Tuning: effective level (Outer Seal scale) per mission — Moonwell 2/3/4, Emberheart 5/6/5, Rimeglass 5/6/7, Stormcrown 5/6/6,
  finale 5 — checked with `tools/simulate.cjs` on 4–6 seeds at the restorations a player is expected to have: all win, with
  seal margins that shrink toward the end of the campaign. Fully random routes are kept for the unlimited mode (later).

## Looks (candidates)
Roles reuse the approved sprites with a tint and a moving mark (diver fin + ripple and a ripple-only look while submerged,
bronze shield plate, runner speed lines, splitter crack; splinters are small). Painted role sprites can replace these later.

## Clarity: where enemies come from and what you defend (Oct 22 2026, after playtest)
- Every route ends at the **seal**: a glowing, pulsing rune circle with rising motes in the sector's colour, plus a
  **seal health bar** ("SEAL 18 / 20") right above it that flashes and shakes when something breaks through. Ends that sit
  close together (the finale's heart core) share one seal. Reduced motion: static glow, no particles or shake.
- Every route starts at a violet **breach swirl** with arrows pointing down the road.
- Furnace Heart (Emberheart 3): repainted so the right-hand monsters walk out of the furnace door down a new walkway; the old
  road end at the bare wall is closed. Moonwell 1 (Silted Overflow): monsters now come out of the painted tunnel.
- **A boss that reaches the seal breaks it: the run is lost.** Bosses now grow more slowly than other enemies
  (health ~ level strength^0.6) and the finale guardian lost its extra +50%, so a prepared defense can always stop them.
  Simulator: all campaign missions still win on every seed at expected power; Outer Seal level 11 now needs skills.

## Known
- Bellows Walk's painted entrance is in the top-left corner, beside the map title; the breach swirl marks it.
