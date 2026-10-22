# Player-first audio research and revised plan

October 21, 2026. Sound review 01 is **rejected by the user**: background perceived as a single irritating note; tower/shot cues too high-pitched. Approved visuals, status effects and game design are unchanged. **V2 revised sound effects are now approved by the user.** Map music studies remain candidates unless individually approved. See `SETTINGS_AND_GAME_SPEED.md` for the approved gear menu, category volume/mute controls and 1×/2×/5× requirements.

## Findings and limits

1. **Register, roughness and sharpness:** Eerola and Lahdelma, *Register impacts perceptual consonance through roughness and sharpness*, Psychonomic Bulletin & Review (2022), DOI 10.3758/s13423-021-02033-5. In an online experiment with 55 participants and chords across seven registers, both low and high extremes received lower consonance ratings than middle registers. Low-register roughness was particularly influential. Implication: reduce sharp/piercing tonal components, but do not simply transpose dense chords into bass. Separate bass from middle-register harmony. This experiment is about consonance ratings for chord stimuli, not a universal pleasant-frequency prescription or game-retention finding.
   https://pubmed.ncbi.nlm.nih.gov/34921342/

2. **Expectation and variation:** Cheung et al., *Uncertainty and Surprise Jointly Predict Musical Pleasure and Amygdala, Hippocampus, and Auditory Cortex Activity*, Current Biology (2019), DOI 10.1016/j.cub.2019.09.067. Pleasantness depended on an interaction between expected context and surprise in Western tonal chord progressions. Implication: use coherent motifs, changing harmony, question/answer phrases and occasional variation. Do not infer that random notes, maximum novelty, a particular chord sequence, or a dopamine claim guarantees engagement.
   https://www.marcus-pearce.com/assets/papers/CheungEtAl2019.pdf

3. **Prediction and uncertainty:** Gold et al., *Predictability and Uncertainty in the Pleasure of Music: A Reward for Learning?*, Journal of Neuroscience 39(47):9397–9409 (2019), DOI 10.1523/JNEUROSCI.0428-19.2019. Supports examining predictability and uncertainty rather than treating repetition as categorically good or bad. Application is a design inference: familiar musical identity with bounded variations, not a static held chord.
   https://www.jneurosci.org/content/jneuro/39/47/9397.full.pdf

4. **Practical variation:** Audiokinetic's Wwise Adventure project guide combines ambient beds with randomized intermittent elements and silence to reduce repetition; its random-container documentation supports limiting immediate repeats. These are practitioner implementation sources, not controlled experiments proving player enjoyment. Apply these principles in our browser audio system; Wwise is not a required engine dependency.
   https://www.audiokinetic.com/download/documents/WwiseProjectAdventure_en.pdf
   https://www.audiokinetic.com/en/public-library/2024.1.4_8780/?id=creating_random_container&source=Help

5. **Mix density:** Audiokinetic's optimization documentation describes playback limits and priority-based voice management. Its Double Stallion case study describes playback limits and side-chaining to keep audio from becoming crowded. Application: suppress redundant attacks before adding more loudness; preserve clear combo/death feedback and music continuity. These numerical limits must be tuned in the game.
   https://www.audiokinetic.com/en/public-library/2024.1.8_8893/?id=optimizing_cpu&source=Help
   https://www.audiokinetic.com/download/documents/customer_profiles/AK_C_PROFILE_BAMF_ENG_WEB.pdf

No source determines what this player will find pleasant. Preference, hearing, speakers, headphones, context and repetition matter. There is no scientifically guaranteed frequency, tempo, tuning system, or "pleasure chord". Research informs candidates; listener review and in-game testing decide what ships.

## Why the first test failed

The music held one unchanged harmonic texture for almost the entire sample, with little phrasing, melody or silence. Reducing its volume did not address monotony. Ice release used prominent 1175/1760 Hz tonal components and a broad high-frequency noise layer; repeated isolated ringing emphasized brightness. A numerical no-clipping result did not validate comfort. Do not repeat this mistake or claim a sound is pleasant because it was synthesized or technically valid.

## Map identities — proposed sonic studies, not new map approvals

| Sector | Musical role | Environmental cues | Avoid |
| --- | --- | --- | --- |
| Broken Conduit, tutorial | Warm plucked strings, a restrained reed-like melodic answer, changing harmony; 84 BPM study | Sparse rounded water gestures, occasional wood/copper movement | Continuous electrical hum, incessant drips, bright repetitive bells |
| Furnace Regulator | Muted wooden percussion, lower plucks and a grounded pulse; 96 BPM | Gentle pressure release and occasional mechanism ticks | Constant machinery roar, sharp metal clanks, heavy bass drone |
| Crystal Vault | Rounded wooden mallet color, spacious phrasing and quiet reed responses; 78 BPM | Sparse stone-room reflections | Shrill glass pings, long overlapping resonant tails |
| Endless Core | Familiar elemental motif in a more purposeful string-like pulse; 100 BPM | Low restrained mechanical gestures | Permanently maximum-intensity percussion or continuous alarms |

The four studies share a small original musical contour so they belong to the same complex. They are synthesized composition sketches, not sampled acoustic instruments or final mastered scores. Each has twelve bars with changing harmony, rests, modified middle/final phrases and a closing fade. They are audition excerpts, **not seamless game loops**.

## Revised effects

- **Water launch/contact:** rounded pressure and wet body, low/middle-band transient texture. No whistling tail.
- **Ice launch/contact:** short compact granular texture and restrained middle-register resonance, replacing the high bell-like release. Clear identity comes from transient texture, not a piercing sustained pitch.
- **Golem chill:** low stone strain, used on a meaningful state transition rather than on every projectile hit.
- **Freeze success:** short, softer middle-register interval/chord with low-level granular ice; once per resolved freeze transition.
- **Golem death:** weighted staggered stone impacts, quickly settling rubble; not a loud monster scream or achievement flourish.
- Build a small bank of alternate recorded/rendered takes per frequent action, selected with no immediate repeats and small bounded gain/timing changes. Pitch variation should remain subtle; do not fix repetition by wildly changing pitch or destroying identity.

The v2 repeated-fire file demonstrates an initial compact variation approach using bounded playback-rate/gain differences. It is **not** a completed multi-take bank or a full dense-wave listening test.

## Adaptive arrangement

Use independently controlled music, ambience and effects buses. Between waves, thin the percussion and allow room for ambient details. Normal waves add a quiet rhythmic layer; bosses add a contrasting layer briefly; aftermath resolves then backs off. Transitions align musically rather than restarting a track for every wave. Plan alternate phrases and rests so a returning listener does not hear one short motif unchanged indefinitely.

Priority order for competing effects starts with critical state change/base threat, combo success, death, ordinary impacts, decorative motion. Reduce/cull redundant attacks; do not audibly stutter musical playback when effect limits are hit. Initial test targets: 12 simultaneous effect voices, no more than two identical impacts within roughly 80ms, and a short golem reaction cooldown. These are proposed tuning parameters, not research-derived constants. Do not globally duck the music on every shot, which can create pumping; consider mild short ducking only for important cues.

Provide separate master/music/ambience/effects controls with saved preferences and an optional reduced-intensity mix. Never autoplay sound before user interaction. Pause/resume and tab visibility must remain consistent. Stereo gestures must also make sense in mono.

## Size and delivery

Keep source masters lossless and review samples separate from the release bundle. Use short shared mono effects, streamed/lazy-loaded map music, and small reusable environmental gestures. Starting budget proposal: roughly 1–2 MB compressed audio for the tutorial; load later sectors when needed. At 96 kb/s, a 90-second encoded track is approximately 1.08 MB before container overhead; this is arithmetic, not a measured quality result. Test an appropriate browser-supported codec and fallback before promising final sizes. Avoid bundling every WAV review, every mixdown and every stem into the initial download.

## Review deliverables

Folder: `previews/audio-v2/`. Builder: `previews/build_audio_research_v2.py`.

- `broken-conduit.wav`: approximately 36 seconds.
- `furnace-regulator.wav`: approximately 31 seconds.
- `crystal-vault.wav`: approximately 38 seconds.
- `endless-core.wav`: approximately 30 seconds.
- `warmer-combo-effects.wav`: 10.5-second synchronized-event effect mix, no music.
- `warmer-combo-with-conduit-music.wav`: the same sequence with quiet new music.
- `repeated-fire-comfort-test.wav`: 18-second repeated-effect test.
- Individual effect WAVs remain available for iteration.
- `water-ice-golem-audio-v2.html`: prior visual study with v2 audio references, preserved separately from v1.

Music studies use the same RMS target for approximate comparison, **not measured LUFS/perceptual equal loudness**. Technical checks include finite samples, peak/no-clipping assertions, durations, RMS and descriptive high-band energy. High-band energy is not a formal sharpness metric. No automatic claim of perceived quality, speaker/headphone verification or long-session comfort is made. The agent has not completed a perceptual listening review.

## Acceptance before approval/release

1. User audition: identify tracks worth developing and whether ice/water now feel comfortable and recognizable. Preserve feedback as explicit approval/rejection; don't silently replace approved audio.
2. Balanced listening comparison: match perceived loudness, use the same scene, and vary presentation order across testers. Ask about comfort, clarity, repetition, world fit and desire to turn sound off.
3. Repeated listening in actual combat at modest volume on headphones and ordinary laptop/phone speakers; include 10–15 minute sessions, crowded waves, bosses, pause/resume and mono. No need to endure discomfort to complete a test.
4. If music distracts, simplify foreground melody/density rather than just turning everything down. If shots fatigue, revise their transient, resonance and event density rather than making them inaudible.
5. Validate encoded loop joins, codec playback, CPU/voice count, size and audio clock sync. Passing no-clipping checks is necessary but insufficient.
