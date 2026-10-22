# Elemental audio revision

Player feedback: attack sounds resemble an obnoxious drum band. Replace the short low-pitched glides with material sounds, preserving earlier files for comparison.

Fire: warm filtered flame rush. Water: flowing splash with small liquid ripples. Ice: soft granular frost/friction, without piercing chimes. Lightning: irregular, filtered electrical crackle. Each launch/contact has three deterministic variations. Freeze, conduction, shatter, chilled and golem death now use the same restrained material palette. These original synthesized effects were approved by the player on October 21, 2026.

Playback uses six simultaneous voices maximum, per-effect real-time cooldowns, a global 65 ms spacing and overlap attenuation. Speed controls retain normal sample pitch; sound density is limited in real time, including at 5x. Volume/mute changes immediately affect current effects. Existing background music remains independently controlled.

Reproduce with previews/build_elemental_audio_v3.py. Preview plays Fire, Water, Ice, Lightning in that order, then an overlapping battle, without music. WAV output is stereo 32 kHz PCM16, checked for finite samples and no clipping. These technical checks do not establish subjective listening quality.
