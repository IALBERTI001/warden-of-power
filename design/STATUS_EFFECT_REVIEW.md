# Status effect preview — review 03

Movement, death, and the soaked → frozen → shattered effect treatment are approved. The expanded status gallery below awaits approval for its additional effects.

Preview: `previews/status-combos-v1.gif`. Rebuild using `previews/build_status_preview.py` with the bundled Pillow runtime.

Shows the approved slime movement poses at enlarged and gameplay scale. Water contact introduces droplets while movement continues; ice contact creates a translucent faceted shell and stops movement and the pose cycle; fire contact breaks the ice, throws shards and releases a short steam puff; the surviving slime resumes movement. No death or kill credit is implied by shattering alone.

The preview reuses the existing approved water, ice and fire projectile sprites. Droplets, ice enclosure and steam are code-drawn runtime-style effects, composited over the original enemy pixels without repainting the character. An image-generated effects sheet and background-removal attempt were inspected but not selected because the backgrounds were unsuitable for overlays. Their prompt requested a six-cell reusable water splash, droplet, open ice shell, ice shard, steam and fire-impact atlas matching the reference. That sheet is not an approved or consuming project asset.

This verifies presentation and timing, not game combat logic. Effect intensity and projectile timings in this original demonstration are illustrative; its freeze hold predates the approved balance below. Final effects should use pooled particles, bounded counts, pause/speed-aware timers and priority for critical combo feedback. Profile achievements trigger from resolved combat events, never from the preview animation. The GIF is a review artifact and should not be shipped in the game bundle; it is not a measure of incremental runtime asset size.

## Approved freeze balance

- Ice alone chills; freezing requires a soaked enemy and an ice hit.
- A successful freeze consumes soaked.
- Start playtesting at 1.5 seconds frozen, with no extension from additional ice hits.
- Natural thaw starts a 4-second recovery; fire shatter starts a **2-second recovery**, per the subsequently approved adjustment. Another freeze cannot occur during recovery. Shatter cannot bypass this recovery.
- Water/ice control sacrifices damage compared with fire/lightning. Validate with actual build comparisons.
- Bosses have shorter freezes and communicated resistance, not unexplained immunity. Exact boss timings remain to be tuned.
- Timings are approved starting values for playtesting, not a declaration that balance testing is finished.

## Expanded gallery — review 04

Rebuild: `previews/build_all_status_previews.py`.

- `previews/all-status-effects-v1.gif`: burning (rising embers, warm pulse and flame marker), soaked (existing approved droplets plus marker), chilled (foot frost, slower movement and snowflake), frozen (existing approved shell and stopped movement). Each includes enlarged and gameplay-size views. The frozen example transitions after 1.5 seconds into recovery, which expires 4 seconds later.
- `previews/all-combo-effects-v1.gif`: conducted lightning visibly connects three soaked enemies with brief sparks; approved shatter shows breaking ice, steam and resumed movement; a separate thaw example shows the full 1.5-second freeze and 4-second resistance countdown. Recovery uses a fading crossed snowflake and diminishing ring.

No persistent lightning debuff or stun is introduced. Burning and chilled durations, damage tick frequency, slow strength, status stacking and icon priority still need game balance specifications. Preview effects are composited from existing sprites and procedural overlays; no new per-enemy status sprite sheets were added. GIFs are eight-second looping review artifacts, not gameplay assets or evidence of implemented combat systems.
