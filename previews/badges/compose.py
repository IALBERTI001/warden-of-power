"""Compose final badges: painted emblem disc (masked to a circle) under its tier's painted frame.

Usage: python3 compose.py SRC_DIR OUT_DIR
Frame inner radius is measured from each frame's transparent hole; emblems are fitted by their own disc,
so every badge in a tier shares exactly the same rim and the same face size.
"""
import json, sys, math
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)
manifest = json.load(open(Path(__file__).with_name('manifest.json')))
S = 1024

def inner_radius(frame):
    a = np.asarray(frame)[..., 3]
    c = S // 2
    radii = []
    for k in range(72):
        ang = k * math.pi / 36
        for r in range(40, S // 2):
            x, y = int(c + r * math.cos(ang)), int(c + r * math.sin(ang))
            if a[y, x] > 160:
                radii.append(r); break
    return int(np.percentile(radii, 10))  # conservative: the hole's narrowest edge

def fit_emblem(em, radius):
    a = np.asarray(em)[..., 3]
    ys, xs = np.where(a > 128)
    if len(xs) == 0:
        raise ValueError('empty emblem')
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    r_src = max(x1 - x0, y1 - y0) / 2
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    # crop to the disc, a hair inside its painted edge so no halo shows
    inset = r_src * 0.97
    box = (int(cx - inset), int(cy - inset), int(cx + inset), int(cy + inset))
    face = em.crop(box).resize((2 * radius, 2 * radius), Image.LANCZOS)
    mask = Image.new('L', (2 * radius * 4, 2 * radius * 4), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 2 * radius * 4 - 1, 2 * radius * 4 - 1), fill=255)
    mask = mask.resize((2 * radius, 2 * radius), Image.LANCZOS)
    face.putalpha(Image.fromarray(np.minimum(np.asarray(face)[..., 3], np.asarray(mask))))
    return face

frames = {}
for f in manifest['frames']:
    p = SRC / f"{f['id']}.png"
    if p.exists():
        fr = Image.open(p).convert('RGBA').resize((S, S), Image.LANCZOS)
        frames[f['tier'].lower()] = (fr, inner_radius(fr))

done, missing = [], []
for eid, name, tier, colour, concept in manifest['emblems']:
    p = SRC / f'{eid}.png'
    t = tier.lower()
    if not p.exists() or t not in frames:
        missing.append(eid); continue
    frame, rin = frames[t]
    radius = rin + 22                      # face tucks under the rim's inner lip
    face = fit_emblem(Image.open(p).convert('RGBA').resize((S, S), Image.LANCZOS), radius)
    canvas = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    canvas.alpha_composite(face, (S // 2 - radius, S // 2 - radius))
    canvas.alpha_composite(frame)
    canvas.save(OUT / f'{eid}-512.png' if False else OUT / f'{eid}-1024.png', optimize=True)
    for size in (256, 128):
        img = canvas.resize((size, size), Image.LANCZOS)
        if size <= 128:
            img = img.filter(ImageFilter.UnsharpMask(radius=0.8, percent=60, threshold=2))
        img.save(OUT / f'{eid}-{size}.png', optimize=True)
    done.append(eid)

print(json.dumps({'done': done, 'missing': missing, 'frames': {k: v[1] for k, v in frames.items()}}))
