"""Original 8-bit element themes for Warden of Power (Nov 4 2026, user: "8-bit like the handheld RPGs we grew up with,
nostalgic, simple yet different for each element"). Every melody here is written for this game; none copies a song.

Four classic channels like an old handheld: two pulse waves (lead, harmony), a triangle-ish wave (bass) and noise (drums).
Each track is a 16-bar loop that repeats seamlessly; output WAV 44.1 kHz mono, then MP3 for the game.

usage: python3 tools/audio/chiptune.py out_dir
"""
import os, sys, subprocess
import numpy as np

SR = 44100
NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def hz(name):
    """'A4' -> 440.0; '-' = rest."""
    if name in ('-', None):
        return 0.0
    n, o = name[:-1], int(name[-1])
    return 440.0 * 2 ** ((NOTE[n] + 12 * (o + 1) - 69) / 12)


def pulse(f, n, duty):
    t = np.arange(n) / SR
    return np.where((t * f) % 1.0 < duty, 1.0, -1.0)


def tri(f, n):
    t = np.arange(n) / SR
    p = (t * f) % 1.0
    v = 4 * np.abs(p - 0.5) - 1
    return np.round(v * 7) / 7          # 4-bit stepped triangle, like the hardware


def env(n, a=0.004, d=0.08, s=0.6, r=0.03, length=None):
    e = np.ones(n)
    A = int(a * SR); D = int(d * SR); R = int(r * SR)
    if A: e[:A] = np.linspace(0, 1, A)
    if D: e[A:A + D] = np.linspace(1, s, max(1, len(e[A:A + D])))
    e[A + D:] = s
    if R and n > R: e[-R:] *= np.linspace(1, 0, R)
    return e


def voice(seq, beat, kind, vol, duty=0.5, vib=0.0, d=0.08, s=0.6):
    """seq: list of (note, beats). Returns a sample array."""
    out = []
    for name, b in seq:
        n = int(round(b * beat * SR))
        f = hz(name)
        if f == 0:
            out.append(np.zeros(n)); continue
        if vib:
            t = np.arange(n) / SR
            f = f * (1 + vib * np.sin(2 * np.pi * 5.5 * t) * np.clip((t - 0.12) * 4, 0, 1))
            ph = np.cumsum(f) / SR
            w = np.where(ph % 1.0 < duty, 1.0, -1.0) if kind == 'pulse' else (4 * np.abs(ph % 1.0 - 0.5) - 1)
        else:
            w = pulse(f, n, duty) if kind == 'pulse' else tri(f, n)
        out.append(w * env(n, d=d, s=s) * vol)
    return np.concatenate(out)


def drums(pattern, beat, bars, vol):
    """pattern: 16 steps per bar of 'k' kick, 's' snare, 'h' hat, '-' rest."""
    step = beat / 4; n = int(round(step * SR)); rng = np.random.default_rng(3)
    out = []
    for _ in range(bars):
        for c in pattern:
            x = np.zeros(n)
            if c == 'k':
                t = np.arange(n) / SR; f = 140 * np.exp(-t * 30) + 45
                x = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.exp(-t * 18) * 0.9
            elif c == 's':
                x = rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * 22) * 0.7
            elif c == 'h':
                x = rng.uniform(-1, 1, n) * np.exp(-np.arange(n) / SR * 70) * 0.35
            out.append(x)
    return np.concatenate(out) * vol


def arp(chords, beat, octave_notes, vol, duty=0.125, step=0.25):
    """Fast arpeggio over a chord list [(['C4','E4','G4'], beats), ...]."""
    seq = []
    for notes, b in chords:
        k = 0
        for _ in range(int(round(b / step))):
            seq.append((notes[k % len(notes)], step)); k += 1
    return voice(seq, beat, 'pulse', vol, duty=duty, d=0.03, s=0.35)


def mix(*parts):
    n = max(len(p) for p in parts)
    m = np.zeros(n)
    for p in parts:
        m[:len(p)] += p
    return m


def phrase(s):
    """'E5:1 G5:.5 -:.5' -> [('E5',1),('G5',.5),('-',.5)]"""
    return [(t.split(':')[0], float(t.split(':')[1])) for t in s.split()]


def bassline(roots, beat, pattern, vol):
    """roots: one note per bar; pattern: beat offsets/lengths [(octave shift, beats), ...] repeated per bar."""
    seq = []
    for r in roots:
        for sh, b in pattern:
            if sh is None:
                seq.append(('-', b)); continue
            name, o = r[:-1], int(r[-1]) + sh
            seq.append((f'{name}{o}', b))
    return voice(seq, beat, 'tri', vol, d=0.02, s=0.9)


TRACKS = {}

# Moonwell Cisterns (water): calm, flowing, D major, gentle arpeggios like moonlight on a pool.
TRACKS['water'] = dict(bpm=96, lead=phrase(
    'F#5:1 A5:.5 B5:.5 A5:1 F#5:1 '      'E5:1.5 D5:.5 E5:1 -:1 '
    'D5:1 F#5:.5 A5:.5 B5:1 D6:1 '       'C#6:2 A5:1 -:1 '
    'B5:1 A5:.5 G5:.5 F#5:1 E5:1 '       'F#5:1.5 G5:.5 A5:1 -:1 '
    'G5:1 F#5:.5 E5:.5 D5:1 C#5:1 '      'D5:3 -:1 '
    'F#5:1 A5:.5 B5:.5 A5:1 F#5:1 '      'E5:1.5 D5:.5 E5:1 -:1 '
    'D5:1 F#5:.5 A5:.5 B5:1 D6:1 '       'E6:2 C#6:1 -:1 '
    'D6:1 C#6:.5 B5:.5 A5:1 F#5:1 '      'G5:1.5 F#5:.5 E5:1 -:1 '
    'F#5:1 E5:.5 D5:.5 E5:1 C#5:1 '      'D5:3 -:1'),
    chords=[(['D4', 'F#4', 'A4'], 4), (['A3', 'C#4', 'E4'], 4), (['B3', 'D4', 'F#4'], 4), (['A3', 'C#4', 'E4'], 4),
            (['G3', 'B3', 'D4'], 4), (['D4', 'F#4', 'A4'], 4), (['E4', 'G4', 'B4'], 4), (['D4', 'F#4', 'A4'], 4)] * 2,
    roots=['D2', 'A2', 'B2', 'A2', 'G2', 'D2', 'E2', 'D2'] * 2, bass=[(0, 1.5), (1, .5), (0, 1), (1, 1)],
    drum='k-----h-s-----h-', lead_duty=0.5, vib=0.006, arp_duty=0.25)

# Emberheart Forge (fire): driving, E minor, hammer-on-anvil rhythm.
TRACKS['fire'] = dict(bpm=144, lead=phrase(
    'E5:.5 E5:.5 G5:.5 E5:.5 B5:1 A5:1 '   'G5:.5 F#5:.5 E5:.5 D5:.5 E5:2 '
    'E5:.5 E5:.5 G5:.5 B5:.5 D6:1 C6:1 '   'B5:.5 A5:.5 G5:.5 A5:.5 B5:2 '
    'C6:.5 B5:.5 A5:.5 G5:.5 A5:1 E5:1 '   'F#5:.5 G5:.5 A5:.5 F#5:.5 G5:2 '
    'A5:.5 G5:.5 F#5:.5 E5:.5 D#5:1 F#5:1 ' 'E5:3 -:1 '
    'E5:.5 E5:.5 G5:.5 E5:.5 B5:1 A5:1 '   'G5:.5 F#5:.5 E5:.5 D5:.5 E5:2 '
    'G5:.5 A5:.5 B5:.5 D6:.5 E6:1 D6:1 '   'B5:.5 A5:.5 G5:.5 A5:.5 B5:2 '
    'C6:.5 B5:.5 A5:.5 G5:.5 A5:1 E5:1 '   'F#5:.5 G5:.5 A5:.5 B5:.5 C6:2 '
    'B5:.5 A5:.5 G5:.5 F#5:.5 D#5:1 B4:1 ' 'E5:3 -:1'),
    chords=[(['E4', 'G4', 'B4'], 4), (['D4', 'F#4', 'A4'], 4), (['C4', 'E4', 'G4'], 4), (['G3', 'B3', 'D4'], 4),
            (['A3', 'C4', 'E4'], 4), (['D4', 'F#4', 'A4'], 4), (['B3', 'D#4', 'F#4'], 4), (['E4', 'G4', 'B4'], 4)] * 2,
    roots=['E2', 'D2', 'C2', 'G2', 'A2', 'D2', 'B1', 'E2'] * 2,
    bass=[(0, .5), (0, .5), (1, .5), (0, .5), (0, .5), (0, .5), (1, .5), (0, .5)],
    drum='k-h-s-h-k-k-s-h-', lead_duty=0.25, vib=0.0, arp_duty=0.125)

# Rimeglass Vaults (ice): crystalline, A minor, high sparkling arpeggios and a slow lead.
TRACKS['ice'] = dict(bpm=108, lead=phrase(
    'A5:2 C6:1 B5:1 '      'E5:3 -:1 '
    'F5:2 A5:1 G5:1 '      'C5:3 -:1 '
    'D5:2 F5:1 E5:1 '      'A5:2 G#5:2 '
    'A5:2 B5:1 C6:1 '      'B5:3 -:1 '
    'A5:2 C6:1 B5:1 '      'E6:3 -:1 '
    'F5:2 A5:1 C6:1 '      'B5:2 G5:2 '
    'D6:1.5 C6:.5 B5:1 A5:1 ' 'G#5:2 B5:2 '
    'A5:3 E5:.5 A5:.5 '    'A5:3 -:1'),
    chords=[(['A4', 'C5', 'E5'], 4), (['E4', 'G#4', 'B4'], 4), (['F4', 'A4', 'C5'], 4), (['C4', 'E4', 'G4'], 4),
            (['D4', 'F4', 'A4'], 4), (['E4', 'G#4', 'B4'], 4), (['A4', 'C5', 'E5'], 4), (['E4', 'G#4', 'B4'], 4)] * 2,
    roots=['A2', 'E2', 'F2', 'C2', 'D2', 'E2', 'A2', 'E2'] * 2, bass=[(0, 2), (1, 2)],
    drum='k-------s-----h-', lead_duty=0.125, vib=0.008, arp_duty=0.125, arp_step=0.125)

# Stormcrown Spire (lightning): fast and electric, G minor, zig-zag runs.
TRACKS['lightning'] = dict(bpm=160, lead=phrase(
    'G5:.5 A#5:.5 D6:.5 A#5:.5 G5:.5 D5:.5 G5:1 '   'F5:.5 A5:.5 C6:.5 A5:.5 F5:2 '
    'D#5:.5 G5:.5 A#5:.5 G5:.5 D#6:1 D6:1 '        'D6:.5 C6:.5 A#5:.5 A5:.5 D6:2 '
    'G5:.5 A#5:.5 D6:.5 A#5:.5 G5:.5 D5:.5 G5:1 '   'F5:.5 A5:.5 C6:.5 F6:.5 E6:1 C6:1 '
    'D#6:.5 D6:.5 C6:.5 A#5:.5 A5:.5 G5:.5 F#5:1 '   'G5:3 -:1 '
    'A#5:1 A5:.5 G5:.5 A#5:1 D6:1 '                 'C6:1 A#5:.5 A5:.5 F5:2 '
    'G5:1 F5:.5 D#5:.5 G5:1 A#5:1 '                 'A5:1 G5:.5 F#5:.5 D6:2 '
    'G5:.5 A#5:.5 D6:.5 G6:.5 F6:1 D6:1 '           'D#6:.5 D6:.5 C6:.5 A#5:.5 C6:2 '
    'A#5:.5 A5:.5 G5:.5 F#5:.5 A5:1 D5:1 '          'G5:3 -:1'),
    chords=[(['G4', 'A#4', 'D5'], 4), (['F4', 'A4', 'C5'], 4), (['D#4', 'G4', 'A#4'], 4), (['D4', 'F#4', 'A4'], 4)] * 4,
    roots=['G2', 'F2', 'D#2', 'D2'] * 4, bass=[(0, .5), (1, .5)] * 4,
    drum='k-h-s-hhk-h-s-hk', lead_duty=0.25, vib=0.0, arp_duty=0.5)

# Aetherheart Engine: heroic march for the long grind, C major, all four colours in one.
TRACKS['engine'] = dict(bpm=126, lead=phrase(
    'C5:1 E5:.5 G5:.5 C6:1.5 G5:.5 '    'A5:1 G5:.5 F5:.5 E5:2 '
    'F5:1 A5:.5 C6:.5 D6:1.5 C6:.5 '    'B5:1 A5:.5 B5:.5 G5:2 '
    'C6:1 B5:.5 A5:.5 G5:1 E5:1 '       'F5:1 E5:.5 D5:.5 E5:1 C5:1 '
    'D5:1 E5:.5 F5:.5 G5:1 A5:.5 B5:.5 ' 'C6:3 -:1 '
    'E5:1 G5:.5 C6:.5 E6:1.5 D6:.5 '    'C6:1 A5:.5 F5:.5 A5:2 '
    'D6:1 C6:.5 B5:.5 A5:1 G5:1 '       'A5:.5 B5:.5 C6:.5 D6:.5 G5:2 '
    'E6:1 D6:.5 C6:.5 B5:1 G5:1 '       'A5:1 G5:.5 F5:.5 E5:1 C5:1 '
    'F5:1 A5:.5 C6:.5 B5:1 D6:1 '       'C6:3 -:1'),
    chords=[(['C4', 'E4', 'G4'], 4), (['F4', 'A4', 'C5'], 4), (['F4', 'A4', 'C5'], 4), (['G4', 'B4', 'D5'], 4),
            (['A3', 'C4', 'E4'], 4), (['F4', 'A4', 'C5'], 4), (['G4', 'B4', 'D5'], 4), (['C4', 'E4', 'G4'], 4)] * 2,
    roots=['C2', 'F2', 'F2', 'G2', 'A2', 'F2', 'G2', 'C2'] * 2, bass=[(0, 1), (1, .5), (0, .5), (0, 1), (1, 1)],
    drum='k---s---k-k-s-h-', lead_duty=0.5, vib=0.004, arp_duty=0.25)


def render(name, t):
    beat = 60 / t['bpm']
    lead = voice(t['lead'], beat, 'pulse', 0.22, duty=t['lead_duty'], vib=t['vib'], d=0.1, s=0.7)
    # echo voice: the lead an octave down, quieter and delayed by a dotted eighth (classic handheld double)
    harm = np.zeros_like(lead); dl = int(beat * 0.75 * SR)
    harm[dl:] = lead[:-dl] * 0.28
    ar = arp(t['chords'], beat, None, 0.09, duty=t['arp_duty'], step=t.get('arp_step', 0.25))
    bass = bassline(t['roots'], beat, t['bass'], 0.26)
    bars = len(t['roots'])
    dr = drums(t['drum'], beat, bars, 0.16)
    m = mix(lead, harm, ar, bass, dr)
    L = int(round(bars * 4 * beat * SR))
    m = m[:L] if len(m) >= L else np.pad(m, (0, L - len(m)))
    # seamless loop: the echo tail that runs past the end wraps onto the start
    tail = mix(harm[L:L + dl]) if len(harm) > L else np.zeros(0)
    if len(tail): m[:len(tail)] += tail
    m = np.tanh(m * 1.1) * 0.85
    return m


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'game/assets/music'
    os.makedirs(out, exist_ok=True)
    from scipy.io import wavfile
    for name, t in TRACKS.items():
        loop = render(name, t)
        song = np.concatenate([loop, loop])        # two passes per file; the game loops the file
        wav = os.path.join(out, f'theme-{name}.wav')
        wavfile.write(wav, SR, (song * 32767).astype(np.int16))
        mp3 = wav[:-4] + '.mp3'
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav,
                        '-af', 'loudnorm=I=-22:TP=-2:LRA=7', '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '128k', mp3], check=True)
        os.remove(wav)
        print(name, f'{len(song) / SR:.1f}s')


if __name__ == '__main__':
    main()
