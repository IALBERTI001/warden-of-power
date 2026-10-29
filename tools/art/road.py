#!/usr/bin/env python3
"""Draw a cobblestone road onto a roadless painted map, exactly along the game's enemy route.

Why: a painted road always drifts a few pixels from the route, so towers can stand on it and enemies walk off it.
Here the road is built from the route itself, at exactly ROAD_WORLD units wide (the no-build rule lets a tower base come
no closer than 30 units to the route centre, so a 54-unit road leaves a small, even gap), with texture cut from straight
painted road strips (scaled uniformly, never stretched), and it stops under painted structures listed in PROTECT.

usage: road.py <roadless.png> <strips.png> <route.json> <out.png> [protect x0,y0,x1,y1 ...]
  roadless.png  painting at the game's map size (Warden: 1620x971 for the 1000x600 world)
  strips.png    texture sheet: straight horizontal road strips on flat magenta
  route.json    {"path": [[x,y],...]} in world units (exported from the engine)
  protect       pixel boxes where the road must not be drawn (bridge deck and posts, gate)
"""
import sys, json, numpy as np
from PIL import Image
from scipy.spatial import cKDTree

ROAD_WORLD = 54          # road width including kerbs, world units
WORLD = (1000, 600)

def strips_from_sheet(sheet):
    """Find the straight strips between magenta bands; return each strip cropped to its road rows."""
    a = np.asarray(sheet.convert('RGB')).astype(int)
    mag = (a[..., 0] > 200) & (a[..., 1] < 80) & (a[..., 2] > 200)
    rows = mag.mean(axis=1) < 0.05                      # rows that are (almost) all road
    out, y = [], 0
    while y < len(rows):
        if rows[y]:
            y0 = y
            while y < len(rows) and rows[y]: y += 1
            if y - y0 > 40:
                band = a[y0:y]
                cols = mag[y0:y].mean(axis=0) < 0.05
                xs = np.flatnonzero(cols)
                trim = 3                                          # drop edge rows/cols that carry magenta spill
                out.append(band[trim:-trim, xs.min() + trim:xs.max() + 1 - trim].astype(np.float32))
        y += 1
    return out

def long_tile(strips, height, xf=40):
    """Scale every strip uniformly to the road height and join them end to end with cross-fades."""
    parts = []
    for s in strips:
        h, w = s.shape[:2]
        k = height / h
        im = Image.fromarray(np.clip(s, 0, 255).astype(np.uint8)).resize((max(2, round(w * k)), height), Image.LANCZOS)
        parts.append(np.asarray(im).astype(np.float32))
    t = parts[0]
    for p in parts[1:] + [parts[0]]:                 # last join wraps back to the first strip: seamless loop
        a = np.linspace(0, 1, xf)[None, :, None]
        t = np.concatenate([t[:, :-xf], t[:, -xf:] * (1 - a) + p[:, :xf] * a, p[:, xf:]], axis=1)
    first = parts[0].shape[1] - xf
    return t[:, first:]                               # drop the duplicated start so the tile wraps cleanly

def main():
    bg_p, sheet_p, route_p, out_p = sys.argv[1:5]
    protect = [tuple(map(float, b.split(','))) for b in sys.argv[5:]]
    bg = np.asarray(Image.open(bg_p).convert('RGB')).astype(np.float32)
    H_, W_ = bg.shape[:2]
    sx, sy = W_ / WORLD[0], H_ / WORLD[1]
    if abs(sx / sy - 1) > 0.01: raise SystemExit('map is not scaled uniformly: %.4f vs %.4f' % (sx, sy))
    half = ROAD_WORLD / 2 * sx                        # road half-width in pixels
    tile = long_tile(strips_from_sheet(Image.open(sheet_p)), int(round(2 * half)))
    TL, TH = tile.shape[1], tile.shape[0]

    P = np.array(json.load(open(route_p))['path'], float) * [sx, sy]
    d = np.hypot(*np.diff(P, axis=0).T); s = np.concatenate([[0], np.cumsum(d)])
    S = np.arange(0, s[-1], 0.5)
    X = np.interp(S, s, P[:, 0]); Y = np.interp(S, s, P[:, 1])
    tx, ty = np.gradient(X), np.gradient(Y); n = np.hypot(tx, ty); tx /= n; ty /= n
    nx, ny = -ty, tx

    yy, xx = np.mgrid[0:H_, 0:W_]
    dist, idx = cKDTree(np.c_[X, Y]).query(np.c_[xx.ravel(), yy.ravel()], distance_upper_bound=half + 14)
    near = np.isfinite(dist)
    ii = idx[near]; px = xx.ravel()[near].astype(float); py = yy.ravel()[near].astype(float)
    v = (px - X[ii]) * nx[ii] + (py - Y[ii]) * ny[ii]
    u = S[ii]

    x = np.mod(u, TL); yv = np.clip(v + TH / 2, 0, TH - 1.001)
    x0 = np.floor(x).astype(int); y0 = np.floor(yv).astype(int); fx = (x - x0)[:, None]; fy = (yv - y0)[:, None]
    x1 = (x0 + 1) % TL; y1 = y0 + 1
    col = tile[y0, x0] * (1 - fx) * (1 - fy) + tile[y0, x1] * fx * (1 - fy) + tile[y1, x0] * (1 - fx) * fy + tile[y1, x1] * fx * fy

    av = np.abs(v)
    alpha = np.clip((half - av) / 1.5, 0, 1)
    shadow = np.clip(1 - (av - half) / 10.0, 0, 1) * (av >= half) * 0.30
    for (bx0, by0, bx1, by1) in protect:
        m = (px >= bx0) & (px <= bx1) & (py >= by0) & (py <= by1)
        alpha[m] = 0; shadow[m] = 0

    img = bg.reshape(-1, 3).copy(); flat = np.flatnonzero(near); base = img[flat]
    base = base * (1 - shadow[:, None]) + np.array([38, 32, 18]) * shadow[:, None]
    base = base * (1 - alpha[:, None]) + col * alpha[:, None]
    img[flat] = base
    Image.fromarray(np.clip(img.reshape(H_, W_, 3), 0, 255).astype(np.uint8)).save(out_p)
    print('road %.1f px wide (%d world units), texture tile %dx%d px, route %.0f px' % (2 * half, ROAD_WORLD, TL, TH, S[-1]))

if __name__ == '__main__':
    main()
