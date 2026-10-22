# Hold the Outer Seal — the early Parts defense (built Oct 22 2026)

Approved plan: Claude doc "Warden of Power — Campaign Loop: Outer Seal Defense, Incremental Strength & Engine Resonance"
(recommended set + Resonance Option A, approved in chat "ok lets do it").

## Loop
Tutorial (training) → raise the Outer Seal Gate → **Hold the Outer Seal** for Parts → restore facilities → Moonwell stage 1
wakes the Aetherheart Engine → Engine Trials (next build; the only Resonance source) → facility missions → finale → Unbound Gate.

## The map
- `game/assets/maps/outer-seal-v1.jpg` — painted in ChatGPT from `previews/outerseal/OUTER_SEAL_BRIEF.md` over the layout guide
  `previews/outerseal/outer-seal-layout-guide.png` (route in `engine.js` OUTER_PATH; the painted road matches the guide 1:1).
  Source PNG: `previews/outerseal/outer-seal-map-v1.png`.
- Monsters walk out of the forest on the left, wind through the meadow, cross the bridge and break against the gate.
- Build area: the open meadow (forest edges, moat, bridge and gate are blocked; the road keeps its 60-unit clearance).
- Candidate art — needs your approval like every map.

## Levels (engine `OUTER`, `outerWaves`)
- 8 waves per level; all four elements available from the start; any held level can be replayed.
- Incremental strength: enemy health ×1.15 per level (and +8% per wave inside a level); attuned foes from level 3 (one
  element per level, a second from level 7, never more than two kinds per wave); armour from level 4 on golems, elites and
  bosses (each hit loses 2+ damage, at least 30% always gets through, burning ignores it); elites from level 6 (×2.6 health,
  gold star ring, +1 seal damage); a boss on the last wave of every 5th level.
- Economy grows with the level so the opening never collapses: starting Charge 220 +20/level, wave-clear Charge 60 +4/level,
  kill rewards +8%/level.
- Rewards: first hold 40 Parts + 10 per level; replays 25 + 10 per level; a loss keeps half the replay reward pro-rata.
  No Resonance (Engine only).
- Recommended Warden Power per level (simulator sweeps + margin for human play): L1–3 +0%, L4 +5, L5 +10, L6 +15, L7 +20,
  L8 +25, L9 +30, L10 +45, L11 +55, L12 +70, then +15 per level. A fully restored complex is +60, so from level 12 the card
  says plainly that skills from the Engine are needed. Shown as Ready / Tough / Very hard next to the player's own power.

## Finding from the simulator
Restorations give each element about +15% damage in total — roughly one level of the approved +15%/level curve. So the
Outer Seal carries a player to about level 10–11 on restorations; deeper levels need skills (Resonance from the Engine).
That matches the approved direction: the Outer Seal is the early Parts source, the Engine powers the long climb.

## Rewards changed (approved)
- Tutorial Seals pay 15 Parts each (was 40 Resonance). Existing Resonance in a save is kept.
- Mission Seals and contracts will pay Parts; only Engine contracts pay Resonance.

## Hub
- Outer Seal panel: level list (next level + last three held) with rewards, recommended vs your Warden Power, Defend/Replay;
  the tutorial stays as Training with its Seals.
- Pin: "Defend · earn Parts · Level N". Next step falls back to the Outer Seal when nothing is affordable.
- Guide (7 steps): Outer Seal → raise the gate → Hold the Outer Seal for Parts → open the Moonwell → restore stage 1 →
  Warden Power → Resonance lives in the Engine.
- Aetherheart panel explains Resonance is earned only there; it stirs after the Moonwell's first restoration.

## Game screen
- `index.html?mission=outer&level=N`. Own saved run (`warden.run.outer.v1`), tutorial handbook and coach hidden, top bar
  "WAVE", results screen with Parts, next level reward and a Next level button. Enemy panel names elites and armour.

## Tests
`tests/outer-seal.test.cjs`; `tests/hub.test.cjs` updated for Seal Parts; `tools/simulate.cjs --mission outer --level N`.
