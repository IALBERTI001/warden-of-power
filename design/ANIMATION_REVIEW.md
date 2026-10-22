# Enemy animation review 01

Movement treatments approved by the user. Approved character reference remains unchanged. Frame consistency cleanup remains part of production work.

Source: `art-reference/enemy-walk-candidates-v1.png`, generated with the built-in image tool using the approved sheet as an identity reference.

Prompt specification: preserve original character identity, palette, materials, outlines, light and camera; create six sequential movement poses each for the moss slime (squash, push-off, hop, landing), orange beetle (alternating articulated legs), and stone golem (alternating foot plants and arm counter-swings); transparent background; six columns, three rows; no new accessories or redesigned characters.

Preview: `previews/enemy-movement-v1.gif`. Assembly script: `previews/build_enemy_preview.py`. Left side holds position to expose pose changes; right side moves the same cycle along a path. The GIF contains 96 frames at 80ms each and loops indefinitely. The original atlas is preserved.

This tests three movement treatments, not final game assets. Generated frames have some silhouette and feature drift, especially during golem steps; strict frame consistency still needs cleanup. Atlas packing is manually defined for this preview. Directional turn frames, hit reactions, frozen states, death cycles and the boss gait remain future work. Do not present a single down-right cycle as a finished multidirectional animation set.

Endless mode is approved as part of the game direction.
