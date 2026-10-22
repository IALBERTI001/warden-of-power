# Layered entrance and exit

## Corrective revision after screenshot rejection

The user rejected the initial portal treatment. The arch faced the viewer while the approach traveled sideways, and the aperture looked pasted over paving. Do not treat that implementation as approved.

The route now starts inside the entrance and travels south/outward through its sill before turning into the courtyard. Its last leg turns north into the exit and continues inside the tunnel. Portal anchors are (35,115) and (960,430) in world space. The source and destination approach directions now match the architecture. The reveal mask is an aperture above the sill joined to the open courtyard below, not a vertical side cut. Enemy opacity changes only while inside the tunnel to prevent visible spawn/despawn pops; health bars/status ornaments are hidden there. Floating BREACH/SEAL labels were removed. Road colors were darkened toward the courtyard's stone palette. These are corrections for review, not evidence of a visual QA pass.

The user requested a foreground/background combination so enemies visibly emerge from and enter doorways rather than appearing on open paving.

New portal frame art: `game/assets/portal-frame-candidate.png`, generated with the built-in image tool. Prompt: isolated dimensional stone-and-copper arch, restrained moss, upper-left light, empty transparent aperture and shallow threshold, matching the game's painted fantasy style. This new architecture is a review candidate; existing approved assets are unchanged.

Rendering order is terrain/road, dark tunnel interior, depth-sorted units with entrance/exit reveal clipping, and the opaque arch/foreground piers. The open center of the frame is actual alpha, allowing enemies behind it to remain visible. Entry/exit positions use the shared ground projection and are aligned to the first/last horizontal route segments. Enemies start behind the entry reveal plane, emerge across it, and are progressively hidden behind the exit plane before breach removal. The two copies share one texture to minimize download cost.

New tower purchases cannot obstruct either doorway. Towers do not select monsters still behind the entrance or already fully committed to the exit tunnel. The original route, world save positions and seal damage amounts remain unchanged. Existing tower saves are retained; no previously placed tower is deleted automatically.

Tests cover transparent art aperture, clip half-planes, mid-route non-clipping, target exposure and doorway placement exclusion. Mocked rendering/combat tests pass. Actual browser visual review remains pending under the previously documented local-file tool restriction. Portal size, aperture alignment and occlusion should be judged in motion by the user before artwork approval.
