# Painted badges v1 — REVIEW CANDIDATE (Oct 22 2026)

28 achievements (20 approved + 8 approved for creation in the Campaign & Progression Plan), each with painted artwork.

How they were made
- Generated in the ChatGPT app (image generation) from `previews/badges/BADGE_BATCH_BRIEF.md`, using the approved sprite sheet as the style reference: 4 empty tier frames + 28 circular emblem faces (`previews/badges/src/`).
- `previews/badges/compose.py` fits each face under its tier's frame (measured from the frame's transparent hole), so every badge in a tier shares the exact same rim. Outputs 1024/256/128 px; 128 px gets light sharpening.
- Contact sheet: `previews/badges/badges-v1-sheet.png` (each badge at 150, 64 and 32 px).

Tiers: Bronze (learning moments), Silver (skill, restorations, wave 50), Gold (25-combo counters, ten wins, Engine Reborn, wave 100), Prismatic (Warden Ascendant, wave 500).

In the game
- `game/badges.js` (tiers, art paths, progress, equip rule), `game/badges.css`.
- Gallery: painted badge, tier, Earned/Locked, rule, progress bar for counters, earned date; locked badges show as dark silhouettes with a lock.
- Earned badges can be shown on the profile; the chosen badge replaces the profile button. Unearned badges cannot be equipped.
- Unlock toast shows the badge art; the results screen lists badges earned that attempt.
- Facility names in the new achievements use the chosen names (Moonwell Cisterns, Emberheart Forge, Rimeglass Vaults, Stormcrown Spire, Aetherheart Engine, Unbound Gate).

Known: Half Century (wave 50) face was muddy at small sizes; a redo was requested from ChatGPT.
Test: `tests/badges.test.cjs` (every achievement has a tier and 256/128 art; equip and progress rules).
