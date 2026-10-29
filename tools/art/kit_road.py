"""Road from building blocks: cobble fill + individually placed kerb stones (modular-asset-kits).

- Cobbles: one large texture quilted from patches of the approved road strips (min-error seams, no cross-fade ghosts),
  laid world-aligned so its painted light never rotates; masked to the road interior.
- Kerbs: single stones cut from the strips' kerb rows, placed one after another along both road edges, each rotated to
  the edge and turned so its lit face points at the light (upper left). On tight inner curves stones are cut shorter
  (as a mason would), never stretched.
- A soft contact shadow falls outside the kerbs, stronger on the lower-right (light from the upper left).
"""
import math, numpy as np
from PIL import Image

LIGHT = np.array([-0.7071, -0.7071])          # direction the light comes FROM (upper left), image coords


def strip_bands(sheet):
    a = np.asarray(sheet.convert('RGB')).astype(np.float32)
    mag = (a[..., 0] > 200) & (a[..., 1] < 80) & (a[..., 2] > 200)
    rows = mag.mean(axis=1) < 0.05
    bands, y = [], 0
    while y < len(rows):
        if rows[y]:
            y0 = y
            while y < len(rows) and rows[y]: y += 1
            if y - y0 > 40:
                xs = np.flatnonzero(mag[y0:y].mean(axis=0) < 0.05)
                bands.append(a[y0:y, xs.min() + 4:xs.max() - 3])
        y += 1
    return bands


def kerb_rows(band):
    """Row ranges (top kerb, cobbles, bottom kerb) found from the dark outline rows."""
    lum = band.mean(axis=2).mean(axis=1)
    h = len(lum)
    dark = np.flatnonzero(lum < 70)
    top_end = int(dark[dark < h * 0.3].max()) if (dark < h * 0.3).any() else int(h * 0.17)
    bot_start = int(dark[dark > h * 0.7].min()) if (dark > h * 0.7).any() else int(h * 0.83)
    return (2, top_end + 1), (top_end + 4, bot_start - 3), (bot_start, h - 2)


def cut_stones(band, rows):
    """Individual kerb stones (RGB arrays) between the dark joints of one kerb row."""
    y0, y1 = rows
    k = band[y0:y1]
    lum = k[3:-3].mean(axis=2).mean(axis=0)
    dark = lum < 110
    joints, x = [], 0
    while x < len(dark):
        if dark[x]:
            x0 = x
            while x < len(dark) and dark[x]: x += 1
            joints.append((x0 + x) // 2)
        x += 1
    stones = []
    for a, b in zip(joints[:-1], joints[1:]):
        if 70 <= b - a <= 140:
            stones.append(k[:, a:b + 1].copy())
    return stones


def quilt(patches_src, out_w, out_h, patch=72, overlap=18, seed=7):
    """Efros-Freeman image quilting: tile a big texture from random source patches with minimum-error seams."""
    rng = np.random.default_rng(seed)
    src = patches_src
    step = patch - overlap
    nx = math.ceil((out_w - overlap) / step); ny = math.ceil((out_h - overlap) / step)
    out = np.zeros((ny * step + overlap, nx * step + overlap, 3), np.float32)
    def cand():
        s = src[rng.integers(len(src))]
        y = rng.integers(0, s.shape[0] - patch + 1); x = rng.integers(0, s.shape[1] - patch + 1)
        return s[y:y + patch, x:x + patch]
    def min_cut_v(err):            # err: patch x overlap -> boolean mask (True = take new patch)
        h, w = err.shape; E = err.copy(); back = np.zeros_like(E, int)
        for i in range(1, h):
            for j in range(w):
                lo, hi = max(0, j - 1), min(w, j + 2)
                k = lo + int(np.argmin(E[i - 1, lo:hi])); back[i, j] = k; E[i, j] += E[i - 1, k]
        mask = np.zeros((h, w), bool); j = int(np.argmin(E[-1]))
        for i in range(h - 1, -1, -1):
            mask[i, j:] = True; j = back[i, j]
        return mask
    for iy in range(ny):
        for ix in range(nx):
            y, x = iy * step, ix * step
            best, berr = None, 1e18
            for _ in range(24):
                p = cand(); e = 0.0
                if ix: e += ((p[:, :overlap] - out[y:y + patch, x:x + overlap]) ** 2).sum()
                if iy: e += ((p[:overlap] - out[y:y + overlap, x:x + patch]) ** 2).sum()
                if e < berr: best, berr = p, e
            p = best.copy(); m = np.ones((patch, patch), bool)
            if ix:
                ev = ((p[:, :overlap] - out[y:y + patch, x:x + overlap]) ** 2).sum(axis=2)
                m[:, :overlap] &= min_cut_v(ev)
            if iy:
                eh = ((p[:overlap] - out[y:y + overlap, x:x + patch]) ** 2).sum(axis=2)
                m[:overlap, :] &= min_cut_v(eh.T).T
            region = out[y:y + patch, x:x + patch]
            region[m] = p[m]
    return out[:out_h, :out_w]


def place_stone(canvas, alpha, stone, cx, cy, ang, scale):
    """Paste one stone (RGB array, length along x) centred at (cx, cy), rotated by ang (radians), uniform scale."""
    h, w = stone.shape[:2]
    im = Image.fromarray(np.clip(stone, 0, 255).astype(np.uint8)).convert('RGBA')
    im = im.resize((max(2, round(w * scale)), max(2, round(h * scale))), Image.LANCZOS)
    im = im.rotate(-math.degrees(ang), resample=Image.BICUBIC, expand=True)
    arr = np.asarray(im).astype(np.float32)
    H, W = canvas.shape[:2]
    x0 = int(round(cx - arr.shape[1] / 2)); y0 = int(round(cy - arr.shape[0] / 2))
    xs0, ys0 = max(0, x0), max(0, y0); xs1, ys1 = min(W, x0 + arr.shape[1]), min(H, y0 + arr.shape[0])
    if xs1 <= xs0 or ys1 <= ys0: return
    sub = arr[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    a = sub[..., 3:4] / 255.0
    canvas[ys0:ys1, xs0:xs1] = canvas[ys0:ys1, xs0:xs1] * (1 - a) + sub[..., :3] * a
    alpha[ys0:ys1, xs0:xs1] = np.maximum(alpha[ys0:ys1, xs0:xs1], a[..., 0])


def edge_polyline(pts, offset):
    """Offset a dense centre line sideways by `offset` (positive = left of travel); returns points and tangents."""
    P = np.array(pts, float)
    t = np.gradient(P, axis=0); t /= np.linalg.norm(t, axis=1, keepdims=True)
    n = np.stack([t[:, 1], -t[:, 0]], axis=1)          # left normal in image coords (y down)
    return P + n * offset, t


def draw_road(ground, pts, half, sheet, stop_mask=None, seed=11, cob_sat=1.0):
    """ground: float32 HxWx3 (modified copy returned). pts: dense centre line in pixels. half: road half-width px."""
    H, W = ground.shape[:2]
    bands = strip_bands(sheet)
    rows = kerb_rows(bands[0])
    band_h = bands[0].shape[0]
    kerb_h_src = rows[0][1] - rows[0][0]
    scale = (2 * half) / band_h                               # one uniform scale for the whole kit
    kerb_w = kerb_h_src * scale                               # kerb width on the map, px
    # cobble texture at map scale, quilted from the cobble rows of every band
    cob_src = []
    for b in bands:
        r = kerb_rows(b)[1]
        c = b[r[0]:r[1]]
        c = np.asarray(Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)).resize(
            (round(c.shape[1] * scale), round(c.shape[0] * scale)), Image.LANCZOS)).astype(np.float32)
        cob_src.append(c)
    cob = quilt(cob_src, W, H, patch=max(24, int(min(c.shape[0] for c in cob_src)) - 2), overlap=8, seed=seed)
    if cob_sat != 1.0:                                        # pull the fill toward the kit's sandstone
        lum = cob.mean(axis=2, keepdims=True); cob = lum + (cob - lum) * cob_sat
    # stones
    stones = []
    for b in bands:
        r = kerb_rows(b)
        stones += cut_stones(b, r[0]) + [s[::-1, ::-1] for s in cut_stones(b, r[2])]   # bottom row turned to face up
    rng = np.random.default_rng(seed)
    # distance field to the centre line
    from scipy.spatial import cKDTree
    P = np.array(pts, float)
    yy, xx = np.mgrid[0:H, 0:W]
    dist, idx = cKDTree(P).query(np.c_[xx.ravel(), yy.ravel()], distance_upper_bound=half + 24)
    dist = dist.reshape(H, W)
    out = ground.copy()
    # contact shadow outside the kerbs, stronger lower-right
    sh = np.clip(1 - (dist - half) / 9.0, 0, 1) * (dist >= half)
    sx, sy = 3, 3
    shifted = np.full_like(sh, 0); shifted[sy:, sx:] = sh[:-sy, :-sx]
    shade = np.clip(np.maximum(sh * 0.22, shifted * 0.38), 0, 0.4)
    if stop_mask is not None: shade[stop_mask] = 0
    out = out * (1 - shade[..., None]) + np.array([34, 30, 18], np.float32) * shade[..., None]
    # cobble interior
    inner = np.clip((half - kerb_w * 0.6 - dist) + 0.5, 0, 1)
    if stop_mask is not None: inner[stop_mask] = 0
    out = out * (1 - inner[..., None]) + cob * inner[..., None]
    # mortar bed under the kerb, so joints on bends show mortar, never grass
    bed = np.clip(np.minimum(dist - (half - kerb_w) + 0.5, half - dist + 0.5), 0, 1)
    if stop_mask is not None: bed[stop_mask] = 0
    out = out * (1 - bed[..., None]) + np.array([92, 76, 56], np.float32) * bed[..., None]
    # kerb stones along both edges
    kerb = np.zeros((H, W), np.float32)
    for side in (+1, -1):
        E, T = edge_polyline(pts, side * (half - kerb_w / 2))
        seg = np.r_[0, np.cumsum(np.linalg.norm(np.diff(E, axis=0), axis=1))]
        s = 0.0
        while s < seg[-1]:
            st = stones[rng.integers(len(stones))]
            L = st.shape[1] * scale
            def turn_over(a, b):
                ia = min(len(E) - 1, int(np.searchsorted(seg, a))); ib = min(len(E) - 1, int(np.searchsorted(seg, b)))
                d = abs(math.atan2(T[ib][1], T[ib][0]) - math.atan2(T[ia][1], T[ia][0]))
                return min(d, 2 * math.pi - d)
            while L > kerb_w * 1.1 and turn_over(s, s + L) > math.radians(12):
                L *= 0.85                                    # a mason cuts the stone shorter on a bend
            if L < st.shape[1] * scale - 0.5:
                cut = max(2, int(round(L / scale))); off = int(rng.integers(0, st.shape[1] - cut + 1))
                st = st[:, off:off + cut].copy(); L = st.shape[1] * scale
                st[:, :3] *= 0.45; st[:, -3:] *= 0.45            # a cut stone keeps a dark joint at both ends
            mid = s + L / 2
            k = min(len(E) - 1, int(np.searchsorted(seg, mid)))
            cx, cy = E[k]
            if stop_mask is not None and stop_mask[int(min(H - 1, max(0, cy))), int(min(W - 1, max(0, cx)))]:
                s += L; continue
            ang = math.atan2(T[k][1], T[k][0])
            normal = np.array([math.sin(ang), -math.cos(ang)])   # the stone's lit face (sprite up) after rotation
            if normal @ LIGHT < 0: ang += math.pi
            place_stone(out, kerb, st, cx, cy, ang, scale)
            s += L - 0.6                                      # stones butt; the painted joint lines do the rest
    return out, dist
