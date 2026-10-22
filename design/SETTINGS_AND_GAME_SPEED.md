# Settings and game speed — approved requirements

The user approved the revised sound effects from sound review 02. This approval applies to effects, not automatic approval of all proposed map music studies. Preserve approved sound identities; changes require review.

## Player controls

A clearly visible gear button opens settings from the battlefield and main menu. Provide a text/accessibility label and usable mouse/touch target. The panel must fit the browser iframe and small screens without obscuring essential controls. Keyboard navigation and visible focus are required.

- Master volume and master mute.
- Sound effects volume and mute.
- Background music volume and mute.
- Environmental ambience volume and mute, separate from music.
- Reduced visual effects and reduced motion; remove decorative motion and reduce particles without hiding essential status/combo information.
- Show tutorial guidance and control reference.
- Resume, restart attempt and return to menu. Restart/leave must warn when current unsaved run progress would be lost; banked rewards and account unlocks are preserved.

Persist preferences across sessions. Where an account/settings service exists, sync account preferences without blocking play; a local fallback remains available. Sound must remain off after reload if the player muted it. Effective volume is master multiplied by its category setting; muting does not overwrite the previous slider value. Slider changes should not unexpectedly play loud preview sounds.

Opening settings pauses a single-player attempt. Closing it resumes only if it was running before opening; it must not override an existing pause. Tab hiding pauses the attempt and its gameplay audio. Browser autoplay rules require user interaction before initial sound playback.

## Speed controls

Always offer normal **1×**, **2×**, **5×**, and a separate pause control. The selected speed is visibly highlighted and announced with a label. Keep these available during combat, away from tower-placement hit areas. Default new attempts to 1×; changing speed does not spend resources.

Simulation speed scales movement, attack cooldowns, projectile travel, status durations, damage-over-time intervals, wave timing and gameplay animation clocks consistently. Freeze remains 1.5 simulation seconds; recovery remains 4 simulation seconds after thaw and 2 after fire shatter. Thus the real-time durations shrink at higher speed. Use fixed simulation steps/substeps so high speed cannot skip collisions, freeze expiration, damage events, achievement triggers or wave completion. Avoid frame-rate-dependent results and cap runaway catch-up when a tab resumes.

Music, UI feedback, and sound playback pitch remain at normal speed. Do not play recordings at 2×/5× rate or transpose approved sounds upward. Gameplay events still trigger appropriate effects; use prioritization, grouping, cooldowns and voice limits to prevent a dense 5× mix from becoming harsh or louder. Preserve important combo/death/base-threat cues and visible status feedback. Pause should stop gameplay sounds appropriately while menu feedback stays usable.

## Competitive timing

The endless ladder ranks highest completed wave first. Any speed-normalized time tie-break uses elapsed **simulation time**, including player-controlled preparation while the simulation runs, excluding pause/settings time. The same decisions and events must give the same normalized result at 1×/2×/5×. Wall-clock completion time is not the competitive tie-break. Verify the exact timing rules before connecting the ladder service.

## Verification before release

Check saved mute/volume preferences, master/category interactions, settings pause/resume restoration, audio unlock behavior, tab pause, all three speeds, and stable control layout at supported iframe sizes. Run equivalent seeded encounters at each speed and compare outcomes, status timings and normalized leaderboard timing. Listen to crowded 5× combat and verify voice limits rather than merely checking isolated effects. These are requirements; no actual game settings UI or speed-enabled combat engine has been implemented by this document.
