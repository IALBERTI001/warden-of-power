# Water + ice against golem: sound review 01

Pending user approval. Approved sprites, movement, death and status-treatment references remain unchanged.

Synchronized preview: `previews/water-ice-golem-audio.html`. Open locally in a browser and press Play. Pause/resume, replay, master volume and optional music are provided. The audio stem clock drives canvas time. Playback pauses when the document is hidden. Static HTML/JavaScript checking does not replace a listening and browser playback review.

The automated browser could not open the local file because its URL security policy permits HTTP/HTTPS only. No browser playback, speaker listening, or perceptual quality verification was completed by the agent. The preview is offered for user listening review; do not claim it has passed that review.

## Original audio approach

`previews/build_audio_sample.py` synthesizes original deterministic sounds from shaped noise, pitch sweeps and resonant layers. No stock recordings, external audio model, or generated voice is used. Seven separate effect files are retained for iteration and reuse: water launch/contact, ice launch/contact, golem chilled, freeze combo and golem death. The optional music is a restrained, original harmonic ambient bed for this test, not a finished soundtrack.

Water uses a rounded pressure release and short splash/plop. Ice combines a short airy release with a restrained crystalline tone. Golem chill adds a low stone resonance; death uses staggered low impacts and granular rubble. Freeze success uses a short soft crystal chord. Avoid long high-frequency ringing, sudden loudness jumps and constant repeated vocalizations.

## Timeline

1.00s ice launch; 1.45s ice contact and golem chill reaction.
2.70s water launch; 3.15s splash and soaked status.
3.70s ice launch; 4.15s freeze combo sound; consumes soaked and stops movement.
5.65s natural thaw; starts four-second freeze resistance, no special thaw sound in this sample.
5.80s water launch; 6.25s water contact reapplies soaked.
6.30s ice launch; 6.75s final impact and golem death. Recovery prevents refreezing; lethal damage still resolves. Approved stone-collapse poses then fade.

The 10.5-second sample is a scripted presentation, not implemented combat balance. It includes no fire or shatter, and does not imply that every chilled hit should play a monster reaction. The standalone effect mix, music stem and combined listening mix are WAV review files at 44.1kHz/16-bit. Final packaging and compression remain to be chosen; the combined review stems are not all intended for shipping.

## Verification and next iteration

The build reports peak level and asserts no clipped samples before writing WAVs; combined peak is approximately -12.81 dBFS. Paths, JavaScript execution, drawing calls at every transition, fixed position while frozen, and timeline phase changes were checked. These are numerical/code checks, not a claim of perceived sound quality or a live browser test.

After user review, test repeated attacks at actual combat density, add limited subtle variations, prioritize combo and death cues, limit simultaneous sounds, and duck background music when useful. Provide separate music/effect controls in the final game. Do not approve these sounds automatically because their waveforms are technically valid.
