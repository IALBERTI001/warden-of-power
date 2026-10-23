# Engine Trials (built Oct 23 2026)

Approved: Campaign Loop addendum, Resonance Option A — the Engine wakes at Moonwell stage 1, a continuous rising-wave run,
Resonance every 5 waves past your best (kept on defeat), depth limit wave 20 + 10 per restoration stage, the finale
removes the limit, the ladder counts Engine runs.

## How it plays
- `index.html?mission=engine` on the Aetherheart Core map (two entrances, the heart core as the seal). Waves are generated as
  the run goes (seeded and saved, so a resumed run continues the same sequence).
- Wave content: mixed early waves; campaign roles from wave 6; attuned foes from 8 (a second kind from 18); elites from 15
  (1 → up to 3); armour from 20; a Regulator Guardian every 25 waves (a boss at the seal still ends the run).
- Limit: wave 20 + 10 per restoration stage (all five facilities count, max 170); `unboundOpen` (finale) removes it.
- Resonance: wave 5m past your best banks 30 + 10m (wave 5: 40, wave 10: 50, wave 50: 130, wave 100: 230), at once.
- Best depth sets `engineBest` and `bestEndlessWave` (Mastery tiers, endless badges at 20 / 50 / 100 / 500).

## Tuning (simulator, 22-tower bot, two seeds)
- The approved starting curve HP(w) = (1 + 0.10 w) × 1.012^w walled every player near wave 40, whatever their power: the
  floor fills by wave ~20 and spare Charge had nothing to buy. Resonance would have dried up at ~300 — a dead end.
- Changes (candidates for approval):
  - **Curve** HP(w) = (1 + 0.07 w) × 1.008^w, elites ×2.0 in the Engine.
  - **Overcharge** (Engine only): a Tier III tower can be overcharged with Charge again and again, +15% damage per level,
    cost 220 × 1.35^level. This is the plan's "more Charge per wave in deep runs" as a power source.
  - **Resonance** 30 + 10m per milestone (was 20 + 4m in the draft), so reaching ~wave 100 roughly funds the full tree.
- Result: fresh player (Moonwell 1) ~55–69 (capped at 30 until more restorations), fully restored ~80–87, full skill tree
  ~100 — the approved table's targets for those stages. Without Overcharge everyone walls at ~45–55 again.

## UI
- Hub: Aetherheart panel → Engine Trials card (best depth, limit, next milestone and its Resonance, Enter the Engine);
  pin "Engine Trials · best wave N"; next step offers it once awake; hub guide's last step points to it.
- Battle: header "Engine Trials · limit wave N", wave counter N / limit, "+X Resonance banked" toasts, Overcharge button and
  U hotkey on Tier III towers, results with waves held, Resonance banked and new best.
- Guide: Modes, Building and The hub chapters updated.

## Not yet
- Random routes for the Unbound Gate (approved direction: random generation is for the unlimited mode).
- Online ladder (needs accounts); Fractures every 50 waves; Mastery purchase UI; Engine contracts.

## Decisions 2026-10-23 (approved in Review & Approvals)
- **Overcharge unlocks after the wave 25 Guardian** (first time `bestEndlessWave` reaches 25; unlocks mid-run). Before that the tower panel shows a lock note. Overcharge spends in-run Charge, never Resonance, and resets each run.
- **Resonance milestones retuned to 30 + 14·m** (m = wave/5): wave 5 pays 44, wave 50 pays 170, wave 100 pays 310. Total through wave 100 = 3,540 ≥ full skill tree 3,525, so "reach wave 100 = full tree".
- Simulated ceilings (22-tower bot): no Overcharge ~45–55 for every profile; with Overcharge fresh 55–69, restored 79–87, full tree ~100, full tree + full Mastery ~155. Mastery (43,750 Resonance total) needs its own retune before it is built.
- Enemy HP compounds (≈17× at wave 100, ≈1,900× at wave 500), so every build has a wall; the climb to 500 needs Mastery plus future systems.
