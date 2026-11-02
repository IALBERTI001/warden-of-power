"""Aetherheart Engine map, built in layers (modular-asset-kits, Nov 2 2026).

usage: engine_build.py levels/aetherheart.json out.png [debug.png]

Layer 0  ground   one seamless brass floor over the whole screen, quilted from clean floor patches of the approved painting
Layer 3  frame    the painting's gear-and-pipe frame as four separate border pieces (top, bottom, left, right), thin, with a
                  soft inner edge and a contact shadow on the floor
Layer 2  lanes    the road kit along the exact enemy routes, its stone graded to the painting's gold road and filled with the
                  painting's own road surface
Layer 4  seal     the painted heart seal cut out as one round piece, on top
Nothing of the old painted road survives: the floor under it is new.
"""
import json, sys, os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(__file__))
from kit_road import quilt, draw_roads
from layout import fillet_path

S = 1.62


def soft_band(w, h, edge, depth, seed):
    """Alpha for a border piece: solid at the outer side, ragged soft edge `depth` px deep on the inner side."""
    rng = np.random.default_rng(seed)
    n = w if edge in ('top', 'bottom') else h
    wob = nd.gaussian_filter(rng.normal(0, 1, n), 9); wob = wob / (np.abs(wob).max() + 1e-6) * depth * 0.35
    a = np.zeros((h, w), np.float32)
    if edge == 'top':
        pos = np.arange(h)[:, None]; lim = (h - depth + wob)[None, :]
    elif edge == 'bottom':
        pos = (h - 1 - np.arange(h))[:, None]; lim = (h - depth + wob)[None, :]
    elif edge == 'left':
        pos = np.arange(w)[None, :]; lim = (w - depth + wob)[:, None]
    else:
        pos = (w - 1 - np.arange(w))[None, :]; lim = (w - depth + wob)[:, None]
    a = np.clip(1 - (pos - lim) / depth, 0, 1)
    return a


def main():
    lay = json.load(open(sys.argv[1])); out = sys.argv[2]
    P = np.asarray(Image.open(lay['painting']).convert('RGB')).astype(np.float32)
    H, W = P.shape[:2]
    yy, xx = np.mgrid[0:H, 0:W]
    old = [np.array(p, float) * S for p in lay['oldPaths']]
    oldd = cKDTree(np.vstack([np.array(fillet_path(p.tolist(), 1, 1.0)[0]) if False else p for p in old])).query(
        np.c_[xx.ravel(), yy.ravel()])[0].reshape(H, W)
    # dense old route for distance
    dense_old = []
    for r in old:
        for a, b in zip(r[:-1], r[1:]):
            n = max(1, int(np.linalg.norm(b - a)))
            dense_old += [a + (b - a) * k / n for k in range(n)]
    oldd = cKDTree(np.array(dense_old)).query(np.c_[xx.ravel(), yy.ravel()])[0].reshape(H, W)
    sc = np.array(lay['seal']['at']) * S; sr = lay['seal']['r'] * S
    sealdist = np.hypot(xx - sc[0], yy - sc[1])
    f = lay['frame']; t, b, l, r = [v * S for v in (f['top'], f['bottom'], f['left'], f['right'])]

    # ---- layer 0: ground = an approved seamless floor tile, repeated (no painted structure under it)
    rng = np.random.default_rng(lay.get('seed', 3))
    tile = Image.open(lay['floorTile']).convert('RGB')
    tw = round(lay.get('tileWorld', 240) * S); tile = tile.resize((tw, tw), Image.LANCZOS)
    T = np.asarray(tile).astype(np.float32)
    reps = (H // tw + 2, W // tw + 2)
    big = np.tile(T, (reps[0], reps[1], 1))
    ox, oy = int(rng.integers(0, tw)), int(rng.integers(0, tw))
    ground = big[oy:oy + H, ox:ox + W].copy()
    glow = np.clip(1.08 - sealdist / (W * 1.1), 0.92, 1.08)
    ground = ground * glow[..., None]
    # ---- layer 1: decals = the painting's brass medallions, cut whole and placed where the layout says
    for (sx, sy), (dx, dy) in lay.get('medallions', []):
        rr = int(lay.get('medallionR', 30) * S); cx, cy = int(sx * S), int(sy * S)
        cut = P[cy - rr:cy + rr, cx - rr:cx + rr]
        dd = np.hypot(*np.mgrid[-rr:rr, -rr:rr]); a = np.clip((rr - dd) / 8, 0, 1)[..., None]
        X0, Y0 = int(dx * S) - rr, int(dy * S) - rr
        reg = ground[Y0:Y0 + 2 * rr, X0:X0 + 2 * rr]
        ground[Y0:Y0 + 2 * rr, X0:X0 + 2 * rr] = reg * (1 - a) + cut * a
    img = ground.copy()

    # ---- layer 3: frame pieces (from the painting's own border), with a contact shadow inside
    shade = np.zeros((H, W), np.float32); frame_a = np.zeros((H, W), np.float32)
    pieces = [('top', (0, 0, W, int(t))), ('bottom', (0, H - int(b), W, H)), ('left', (0, 0, int(l), H)), ('right', (W - int(r), 0, W, H))]
    for k, (edge, (x0, y0, x1, y1)) in enumerate(pieces):
        a = soft_band(x1 - x0, y1 - y0, edge, 22, k + 1)
        frame_a[y0:y1, x0:x1] = np.maximum(frame_a[y0:y1, x0:x1], a)
    sh = nd.gaussian_filter(frame_a, 10); sh = np.roll(np.roll(sh, 8, 0), 8, 1)
    img = img * (1 - 0.45 * np.clip(sh - frame_a, 0, 1)[..., None])
    img = img * (1 - frame_a[..., None]) + P * frame_a[..., None]

    # ---- layer 2: road kit along the new routes
    routes = lay['routes']
    dense = [np.array(fillet_path(p, lay['radius'], 1.0)[0]) * S for p in routes]
    road_px = P[(oldd > 20 * S) & (oldd < 26 * S) & (sealdist > sr + 10)]
    from skimage import color
    tm = color.rgb2lab(road_px.reshape(-1, 1, 3) / 255).reshape(-1, 3); tmu, tsd = tm.mean(0), tm.std(0) + 1e-3

    def recolor(a):
        L = color.rgb2lab(np.clip(a / 255, 0, 1).reshape(-1, 1, 3)).reshape(-1, 3)
        L = (L - L.mean(0)) / (L.std(0) + 1e-3) * tsd + tmu
        return np.clip(color.lab2rgb(L.reshape(-1, 1, 3)) * 255, 0, 255).reshape(a.shape).astype(np.float32)
    rp = []; wsz = 44
    inner = (oldd < 15 * S) & (sealdist > sr + 30)
    for d in old:
        for k in range(len(d) - 1):
            for u in np.linspace(0, 1, 6):
                x, y = d[k] + (d[k + 1] - d[k]) * u
                x0, y0 = int(x - wsz / 2), int(y - wsz / 2)
                if 0 <= x0 and 0 <= y0 and x0 + wsz < W and y0 + wsz < H and inner[y0:y0 + wsz, x0:x0 + wsz].all():
                    rp.append(P[y0:y0 + wsz, x0:x0 + wsz])
    if len(rp) > 60: rp = [rp[i] for i in rng.choice(len(rp), 60, replace=False)]
    stop = sealdist < lay['seal'].get('dais', 104) * S * 0.97
    img, _ = draw_roads(img, [d.tolist() for d in dense], lay['roadHalf'] * S, Image.open(lay['strips']), stop_mask=stop,
                        seed=lay.get('seed', 3), recolor=recolor, cob_patches=rp or None)

    # ---- layer 4: the painted seal, cut along its own outline (heart, ring, gold arches and the painted road stubs between
    # them, which line up with the new routes), never as a disc of floor. Untouched pixels from the approved painting.
    hsv0 = np.asarray(Image.fromarray(P.astype(np.uint8)).convert('HSV')).astype(np.float32)
    lum = P.mean(2); gold = ((hsv0[..., 1] > 150) & (lum > 120)) | (lum < 75)
    near = sealdist < lay['seal'].get('outer', 135) * S
    filled = nd.binary_fill_holes(nd.binary_closing(gold & near, iterations=3))
    upper = (yy - sc[1]) < 35 * S / 1.62 * 1.0
    m = (filled & upper) | (nd.binary_closing(gold, iterations=2) & ~upper) | ((oldd < 24 * S) & ~upper)
    m &= sealdist < lay['seal'].get('outer', 135) * S
    m |= sealdist < lay['seal'].get('dais', 104) * S          # the whole round dais out to its dark rim
    m = nd.binary_opening(m, iterations=1)
    lab_, n_ = nd.label(m)
    if n_:
        sizes = nd.sum(m, lab_, range(1, n_ + 1)); m = np.isin(lab_, [k + 1 for k, v in enumerate(sizes) if v > 300])
    sa = nd.gaussian_filter(m.astype(np.float32), 1.6)
    ssh = np.roll(np.roll(nd.gaussian_filter(m.astype(np.float32), 9), 7, 0), 7, 1)
    img = img * (1 - 0.35 * np.clip(ssh - sa, 0, 1)[..., None])
    img = img * (1 - sa[..., None]) + P * sa[..., None]
    final = np.clip(img, 0, 255).astype(np.uint8)
    Image.fromarray(final).save(out)
    if len(sys.argv) > 3:
        dbg = Image.fromarray(final); d = ImageDraw.Draw(dbg)
        for q in dense: d.line([tuple(p) for p in q], fill=(255, 0, 255), width=2)
        dbg.save(sys.argv[3])
    print('built', out, len(rp), 'road patches')


if __name__ == '__main__':
    main()
