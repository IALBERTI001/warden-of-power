# Restoration animation + attuned foes (built Oct 22 2026)

Approved plan: Claude doc "Warden of Power — Contracts, Restoration Animation & Resistant Foes". Order approved: restoration animation now, attunements with the first Moonwell mission, contracts after the Moonwell sector.

## Restoration you can watch (hub)
- `game/hubfx.js` draws the hub: base (ruined) painting + the painted stage of every facility (stages 1/2 from `assets/hub/stages/<id>-stage1|2.png`, stage 3 cut from the restored painting) + the sealed gate (`gate-sealed.png`) until it is raised. Crops are feathered into the base painting.
- Stage art: generated in ChatGPT by editing crops of the approved hub concept (`previews/hub/stages/STAGES_BRIEF.md`, sources in `previews/hub/stages/src`, outputs in `previews/hub/stages/out`). Missing art falls back to the next painted stage, so the hub always draws.
- All 11 paintings are in (5 facilities × stages 1–2, plus the sealed gate), checked against the concept for size, alignment and readable progression.
- Restoration moment (~3.2 s): pins and panels step aside, the camera eases in (clamped to the painting), dust rises, an elemental sweep reveals the new stage, a banner names the stage and its bonus, the camera returns. Click or any key skips. Reduced motion: 0.6 s crossfade, no camera or particles.
- Living hub: per-stage loops — water drops and fountains, shimmer (Moonwell); smoke, flames, embers (Emberheart); glints and snow (Rimeglass); sparks and a crown bolt (Stormcrown); warm windows, glint, steam (Atelier); gate lantern flames. Stops when the tab is hidden; off with reduced motion.
- Ambience: `assets/hub/ambience/amb-{water,fire,ice,storm,gears}.wav`, 12 s seamless procedural loops (`previews/hub/build_ambience.py`, NumPy), one per restored facility, louder with each stage, soft by default. Settings → Sound → Hub ambience volume / mute (shares the game's ambience setting). Starts after the first click (browser rule). Candidate sound — needs your listening approval like the tower sounds.

## Attuned foes (engine + look)
- `engine.js` `ATTUNE` table; `spawn(kind, wave, attune)`; spawn-queue items may carry `attune`. Never used by tutorial waves.
  - Tide: cannot be Soaked; Water ×0.5; Lightning and conduction ×1.25.
  - Ember: cannot burn; Fire ×0.5, burn 0; shatter ×1.25; freezes for the full time.
  - Rime: cannot be Chilled; freeze ×0.5 duration; Ice ×0.5; Fire and burn ×1.25. Freeze contract otherwise unchanged.
  - Storm: never starts or relays a chain; Lightning and conduction ×0.5; Water ×1.25 while Soaked.
- Look (`game.js`): the approved enemy sprites tinted toward the element plus a moving shape mark (drips, glowing cracks, frost stars, sparks) so they read without colour; selecting one names the attunement and its resistances in words. Painted variants can replace the tint later.
- Test: `tests/attune.test.cjs`.

## Not yet
- Contracts: after the Moonwell sector (approved order).
- Attunements appear once campaign missions exist (Phase 3, Moonwell introduces Ember-attuned foes).
