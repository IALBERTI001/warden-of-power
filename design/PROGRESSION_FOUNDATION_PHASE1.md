# Phase 1 — Progression foundation (built Oct 22 2026, overnight)

Part of the approved Campaign & Progression Plan (Claude doc "Warden of Power — Campaign & Progression Plan").
Invisible plumbing: with an empty profile the game plays exactly as before (all earlier tests unchanged).

## What exists now
- `game/progression.js` — permanent account power, pure functions:
  - The approved 20-node skill tree (5 branches x 4 nodes: three 3-rank nodes + capstone, approved effects and caps).
  - Five facilities (Moonwell Cisterns, Emberheart Forge, Rimeglass Vaults, Stormcrown Spire, Cogwright's Atelier), 3 restoration stages each, paid in Restoration Parts; each stage adds a permanent bonus.
  - Mastery tiers I–V per branch, 10 ranks each, opened by completing endless waves 50/100/200/300/400.
  - Offers never spend (`skillOffer`, `restorationOffer`, `masteryOffer`); buying is separate (`buySkill`, `restore`, `buyMastery`). Free reassignment: `resetSkills` refunds every rank.
  - Branch unlock: a skill branch opens when its facility reaches restoration stage 1.
  - `migrate()` upgrades old saves without losing badges, counters or Parts.
  - `bonuses(profile)` = one aggregate of every bonus with its sources (for the tower breakdown).
- `game/engine.js` — every tower everywhere uses the bonuses (tutorial, future campaign, endless): damage, burn, range, attack speed, soak, slow (cap 50%), chains, shatter damage/radius, conduction distance/secondary damage, Overflow extra soak, ice vs frozen/bosses, starting Charge, upgrade discount (cap 6%), sell refund (cap 90%), Stable current (+Charge every fifth wave).
- Tower panel shows "Damage includes +N% Warden power" when bonuses apply.
- `tools/simulate.cjs` — headless balance simulator on the real engine; deterministic bot with a fixed build plan. `node tools/simulate.cjs [--profile file.json] [--json]`.

## Gate result
- Simulator replays the tutorial deterministically: won 5/5, seal 20/20, 104.5 s game time, all three combos.
- A strong account (all restorations + several skills) clears it in 95.1 s; a maxed foundation tree in 88.5 s.
- Finding for tuning: a maxed account kills before combos form (freezes fall from 11 to 2). Intended for replays (your universal-buff rule), but the tutorial's teaching moments rely on combos; consider making first-time tutorial play use base stats only, or keep combo lessons forgiving.

## Starting targets (simulator will tune)
Restoration stage costs 40/80/140 Parts (Atelier 30/60/110); element facilities +5% that element's damage per stage; Atelier +15 starting Charge per stage; Mastery +2% element damage per rank (Engineering +1% all damage), rank cost 40 x tier + 10 x rank.

## Not built yet (next phases)
Earning Resonance, the hub screen and skill tree UI (Phase 2), campaign missions (Phases 3–4), endless (Phase 5+).
Tests: `tests/progression.test.cjs`, `tests/simulator.test.cjs`.
