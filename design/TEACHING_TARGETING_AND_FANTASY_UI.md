# Teaching, targeting feedback and fantasy presentation

The user considers the current playthrough the best so far, but requested actual teaching, target cues, grounded towers and a stronger fantasy interface. This does not imply approval of all existing artwork or balance numbers.

## Action-based teaching

`game/tutorial.js` tracks demonstrated actions, separately from wave number. Sequence: place Fire at a suggested valid position; click to inspect; inspect upgrade cost; purchase Tier II; change target priority; open the sell/refund confirmation (canceling is sufficient, no forced sale); start combat; build Water and Ice; resolve a real freeze; build Lightning and resolve conduction; resolve shatter; complete the remaining defense. It highlights relevant controls and marks the first recommended location. Show me helps open the relevant command; Skip this lesson is available. Hiding guidance disables the initial lesson gate.

First-wave start waits for those command lessons unless guidance is hidden/skipped. Later waves remain player-controlled so income and unlocks cannot deadlock combination teaching. Resource-shortage/unlock hints direct the player to continue waves. Progress is saved with the attempt. Existing actions infer only what the game can establish (built elements, upgraded towers and actual combos); advancing a wave does not auto-complete targeting or refund inspection.

## Visible targeting

The simulation and selected-tower reticle share `Game.chooseTarget`. The selected tower draws a thin gold focus line and an enemy reticle with the targeting rule labeled. The inspector reports whether a target is in range. This indicates the next firing choice; existing in-flight projectiles retain their original target. The overlay is limited to the selected tower to avoid battlefield clutter.

## Ground contact correction

The opaque front point of each foundation is now anchored exactly at its world ground point. Earlier deliberate 8%-height offsets are removed. A narrow contact seam replaces the broad detached oval. The same per-atlas metadata applies to all 16 tier/specialization variants. Numerical tests validate shared contact points; this is not a browser visual validation.

## Fantasy UI candidate

New `game/assets/arcane-panel-candidate.png` is an original built-in-image-tool nine-slice panel: aged gold/bronze framing, understated abstract carving, small amethyst accents, and a quiet dark plum/obsidian center. Prompt requested no text or icons. CSS uses this artwork for command panels, teaching and dialogs, with ivory/gold text and local Palatino/Book Antiqua/Georgia font fallbacks. The HUD remains inside the game. New UI artwork/palette still needs visual approval.

Tests cover lesson progression/readiness, saved progress, optional skips, all four target priorities, out-of-range/dead filtering, tower anchors, engine regressions and mocked UI initialization. Live browser/appearance/listening verification remains pending under the documented local-file tool restriction. Do not claim that these tests establish an approved artistic result.
