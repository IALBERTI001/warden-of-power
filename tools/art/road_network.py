"""Road network renderer for layer-built maps (Nov 4 2026, after the fresh-eyes review of the campaign rebuild).

The whole network (forks, merges, two entrances) is ONE road surface: the union of every route's band, with its sharp
junction corners rounded. Cobbles fill it, a mortar bed lines it and kerb stones run along its outline, so a junction opens
cleanly with no filler blocks, no kerb stubs and no V-kinks. Built on a padded canvas so roads that leave the screen keep
their kerbs past the edge. The kit (Outer Seal road strips) keeps its own tan kerbs; only the cobble fill may take a light
sector tint. Contact shadow falls to the lower right only (light from the upper left), no halo on the lit sides.
"""
import math
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.spatial import cKDTree

from kit_road import strip_bands, kerb_rows, cut_stones, quilt, place_stone, LIGHT

PAD = 70


def _lab(a):
    from skimage import color
    return color.rgb2lab(np.clip(a / 255.0, 0, 1))


def _rgb(l):
    from skimage import color
    return np.clip(color.lab2rgb(l) * 255.0, 0, 255)


def tint(img, target_rgb, strength):
    """Move img's mean colour a fraction of the way to target_rgb (Lab), keeping its detail."""
    if not strength:
        return img
    L = _lab(img)
    t = _lab(np.array(target_rgb, np.float32).reshape(1, 1, 3)).reshape(3)
    m = L.reshape(-1, 3).mean(0)
    L = L + (t - m) * strength
    return _rgb(L).astype(np.float32)


def round_mask(m, r):
    """Round the corners of a binary mask: opening then closing with a disc of radius r (via distance transforms)."""
    if r <= 0:
        return m
    o = nd.distance_transform_edt(~(nd.distance_transform_edt(m) > r)) <= r          # opening
    c = ~(nd.distance_transform_edt(~(nd.distance_transform_edt(~o) > r)) <= r)      # closing
    return c


def draw_network(ground, lines, half, sheet, stop_mask=None, seed=11, cob_sat=0.6, cob_tint=None, corner=14):
    """ground: float32 HxWx3. lines: list of dense centre lines (pixels, may run off-image). half: road half-width px.
    Returns (image, surface mask)."""
    H, W = ground.shape[:2]
    P = PAD
    g = np.pad(ground, ((P, P), (P, P), (0, 0)), mode='edge')
    Hp, Wp = g.shape[:2]
    stop = np.zeros((Hp, Wp), bool)
    if stop_mask is not None:
        stop[P:P + H, P:P + W] = stop_mask
        stop[:, P + W:] = stop_mask[:, -1:].any()            # right pad continues the stop region
    bands = strip_bands(sheet)
    band_h = bands[0].shape[0]
    rows0 = kerb_rows(bands[0]); kerb_h_src = rows0[0][1] - rows0[0][0]
    scale = (2 * half) / band_h; kerb_w = kerb_h_src * scale
    cob_src = []
    for b in bands:
        r = kerb_rows(b)[1]; c = b[r[0]:r[1]]
        c = np.asarray(Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)).resize(
            (round(c.shape[1] * scale), round(c.shape[0] * scale)), Image.LANCZOS)).astype(np.float32)
        cob_src.append(c)
    cob = quilt(cob_src, Wp, Hp, patch=max(24, int(min(c.shape[0] for c in cob_src)) - 2), overlap=8, seed=seed)
    if cob_sat != 1.0:
        lum = cob.mean(axis=2, keepdims=True); cob = lum + (cob - lum) * cob_sat
    if cob_tint:
        cob = tint(cob, cob_tint[0], cob_tint[1])
    stones = []
    for b in bands:
        r = kerb_rows(b); stones += cut_stones(b, r[0]) + [s_[::-1, ::-1] for s_ in cut_stones(b, r[2])]
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:Hp, 0:Wp]; pix = np.c_[xx.ravel(), yy.ravel()]
    pts = np.vstack([np.array(l, float) + P for l in lines])
    dist = cKDTree(pts).query(pix, distance_upper_bound=half + 60)[0].reshape(Hp, Wp)
    surf = round_mask(dist < half, corner)
    din = nd.distance_transform_edt(surf)                  # inside: distance to the road edge
    dout = nd.distance_transform_edt(~surf)                # outside: distance to the road edge
    out = g.copy()
    # contact shadow: lower right only
    sh = np.clip(1 - dout / 9.0, 0, 1) * (~surf)
    cast = np.zeros(surf.shape, np.float32); cast[5:, 5:] = surf[:-5, :-5]        # the road's footprint moved down-right
    cast = nd.gaussian_filter(np.maximum(cast, surf.astype(np.float32)), 2.5)        # joined to the road: no lit sliver
    shade = np.clip(np.maximum(sh * 0.06, cast * 0.36) * (~surf), 0, 0.4)
    shade[stop] = 0
    out = out * (1 - shade[..., None]) + np.array([34, 30, 18], np.float32) * shade[..., None]
    inner = np.clip(din - kerb_w * 0.6 + 0.5, 0, 1); inner[stop] = 0
    out = out * (1 - inner[..., None]) + cob * inner[..., None]
    bed = np.clip(np.minimum(din, kerb_w * 0.6 + 1 - din), 0, 1) * surf; bed[stop] = 0
    out = out * (1 - bed[..., None]) + np.array([92, 76, 56], np.float32) * bed[..., None]
    # kerb stones along every outline of the surface, at half a kerb width inside the edge
    from skimage import measure
    kerb = np.zeros((Hp, Wp), np.float32)
    for C in measure.find_contours(din, kerb_w / 2):
        E = C[:, ::-1].astype(float)                       # (x, y)
        keep = (E[:, 0] > 3) & (E[:, 0] < Wp - 4) & (E[:, 1] > 3) & (E[:, 1] < Hp - 4)
        # split at the canvas border (where a road leaves the padded canvas)
        runs, cur = [], []
        for p, k in zip(E, keep):
            if k: cur.append(p)
            elif cur: runs.append(np.array(cur)); cur = []
        if cur: runs.append(np.array(cur))
        for E in runs:
            if len(E) < 8:
                continue
            T = np.gradient(nd.gaussian_filter1d(E, 3, axis=0), axis=0)
            T /= np.maximum(np.linalg.norm(T, axis=1, keepdims=True), 1e-6)
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
                    L *= 0.85
                if L < st.shape[1] * scale - 0.5:
                    cut = max(2, int(round(L / scale))); off = int(rng.integers(0, st.shape[1] - cut + 1))
                    st = st[:, off:off + cut].copy(); L = st.shape[1] * scale
                    st[:, :3] *= 0.45; st[:, -3:] *= 0.45
                mid = s + L / 2
                k = min(len(E) - 1, int(np.searchsorted(seg, mid)))
                cx, cy = E[k]
                if stop[int(min(Hp - 1, max(0, cy))), int(min(Wp - 1, max(0, cx)))]:
                    s += L; continue
                ang = math.atan2(T[k][1], T[k][0])
                normal = np.array([math.sin(ang), -math.cos(ang)])
                if normal @ LIGHT < 0: ang += math.pi
                place_stone(out, kerb, st, cx, cy, ang, scale)
                s += L - 0.6
    return out[P:P + H, P:P + W], surf[P:P + H, P:P + W]
