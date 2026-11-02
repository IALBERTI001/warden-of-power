"""Rebuild a painted campaign map in layers (modular-asset-kits, Nov 2 2026).

usage: sector_rebuild.py levels/campaign/<id>.json out_dir [--seed N]

Layers, bottom to top:
  0 ground   the map's own floor, quilted (Efros-Freeman) from clean patches of the painting, so the play area is one
             seamless material with no painted road, medallions or clutter left in it;
  3 border   the painting's own frame (walls, water, lava, ice, storm cliffs) kept exactly as painted, outside the play area;
  2 lanes    the road kit drawn along the exact enemy routes, its stone graded to this map's painted road colours, so every
             sector keeps its own road while the shapes, widths and kerbs are the same kit everywhere;
  4 objective the painted objective at each route end, kept from the painting.
Writes out_dir/<id>.jpg (map), <id>-debug.png and <id>-grid.json (the new build grid: the whole interior, 20-unit cells).
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
from scipy.spatial import cKDTree

sys.path.insert(0, os.path.dirname(__file__))
from kit_road import quilt, draw_roads

S = 1.62                       # image px per world unit
ROAD_HALF = 27                 # world units: the same road width as the Outer Seal kit
CELL = 20                      # world units per build-grid cell


def lab(a):
    from skimage import color
    return color.rgb2lab(np.clip(a / 255.0, 0, 1))


def rgb(l):
    from skimage import color
    return np.clip(color.lab2rgb(l) * 255.0, 0, 255)


def main():
    lay = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    seed = int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 5
    mid = lay['id']
    src = Image.open(lay.get('master', lay['art'])).convert('RGB')
    W, H = src.size
    P = np.asarray(src).astype(np.float32)
    routes = [np.array(p, float) * S for p in lay['paths']]
    yy, xx = np.mgrid[0:H, 0:W]; pix = np.c_[xx.ravel(), yy.ravel()]

    # dense route lines
    dense = []
    for r in routes:
        pts = [r[0]]
        for a, b in zip(r[:-1], r[1:]):
            n = max(1, int(np.linalg.norm(b - a) / 1.0))
            pts += [a + (b - a) * k / n for k in range(1, n + 1)]
        dense.append(np.array(pts))
    allpts = np.vstack(dense)
    dist = cKDTree(allpts).query(pix)[0].reshape(H, W)

    # play interior: open grid cells + the painted road band, minus what touches the image edge (the painted frame)
    g = np.array([[c == '1' for c in row] for row in lay['grid']])
    open_px = np.kron(g, np.ones((int(CELL * S) + 1, int(CELL * S) + 1), bool))[:H, :W]
    if open_px.shape != (H, W):
        o = np.zeros((H, W), bool); o[:open_px.shape[0], :open_px.shape[1]] = open_px; open_px = o
    # frame = blocked painting connected to the image edge, found WITHOUT the road band (the road always reaches the edge
    # through its entry, which would otherwise make every blocked cell beside the road part of the frame)
    band = dist < 40 * S
    blocked = ~open_px & ~band
    blocked = nd.binary_opening(blocked, iterations=2)
    lab_, n = nd.label(blocked)
    edge_ids = set(np.unique(np.r_[lab_[0], lab_[-1], lab_[:, 0], lab_[:, -1]])) - {0}
    frame = np.isin(lab_, list(edge_ids))
    # road pixels that run between frame pieces (entry tunnels, gates, bridges) stay painted
    win = int(40 * S) | 1
    framefrac = nd.uniform_filter(frame.astype(np.float32), win)
    frame |= (dist < 40 * S) & (framefrac > 0.3)
    frame = nd.binary_closing(frame, iterations=3)
    interior = ~frame
    interior = nd.binary_opening(interior, iterations=3)
    # entries: walk each route from its start while no open floor is near it (a tunnel or gate); that stretch stays painted
    entry = np.zeros((H, W), bool)
    dopen = nd.distance_transform_edt(~open_px)
    for d in dense:
        for k, (x, y) in enumerate(d):
            ix, iy = int(min(W - 1, max(0, x))), int(min(H - 1, max(0, y)))
            if 0 <= x < W and 0 <= y < H and dopen[iy, ix] < 34 * S and k > 0:
                break
            entry |= (xx - x) ** 2 + (yy - y) ** 2 < (36 * S) ** 2 if k % 6 == 0 else False
    frame |= entry; interior &= ~entry
    interior = nd.binary_erosion(interior, iterations=int(5 * S))
    # objectives: route ends inside the map keep their painting
    ends = [r[-1] for r in routes if 0 < r[-1][0] < W and 0 < r[-1][1] < H]
    obj = np.zeros((H, W), bool)
    for e in ends:
        obj |= (xx - e[0]) ** 2 + (yy - e[1]) ** 2 < (62 * S) ** 2

    # floor texture: clean patches = interior, away from the road and objectives, away from the frame
    clean = interior & (dist > 78 * S) & ~nd.binary_dilation(obj, iterations=int(30 * S))
    clean = nd.binary_erosion(clean, iterations=int(8 * S))
    win = 150
    cs = []
    for y in range(0, H - win, 40):
        for x in range(0, W - win, 40):
            if clean[y:y + win, x:x + win].all():
                cs.append(P[y:y + win, x:x + win])
    if len(cs) < 6:
        win = 110; cs = []
        for y in range(0, H - win, 30):
            for x in range(0, W - win, 30):
                if clean[y:y + win, x:x + win].all():
                    cs.append(P[y:y + win, x:x + win])
    if not cs:
        raise SystemExit(f'{mid}: no clean floor patch found')
    rng = np.random.default_rng(seed)
    if len(cs) > 40:
        cs = [cs[i] for i in rng.choice(len(cs), 40, replace=False)]
    # flatten broad light so quilted patches from bright and dark corners do not leave blotches
    flat = []
    for c in cs:
        l = c.mean(2); b = nd.gaussian_filter(l, 30)
        flat.append(c * (l.mean() / np.maximum(b, 1))[..., None])
    floor = quilt(flat, W, H, patch=96, overlap=26, seed=seed)
    # keep the painting's broad light over the floor (its lighting, without its objects)
    lp = nd.gaussian_filter(P.mean(2), 60); lf = nd.gaussian_filter(floor.mean(2), 60)
    floor = floor * (lp / np.maximum(lf, 1))[..., None]

    feather = nd.gaussian_filter((interior & ~obj).astype(np.float32), 2.5 * S)
    img = P * (1 - feather[..., None]) + floor * feather[..., None]

    # road colours from this map's painted road (centre band), as a Lab transfer onto the kit strips
    # cobble fill = patches of this map's own painted road (fully inside its surface, clear of trims and the frame)
    inner = (dist < 17 * S) & ~frame & ~obj
    rp = []; wsz = 44
    for d in dense:
        for x, y in d[::18]:
            x0, y0 = int(x - wsz / 2), int(y - wsz / 2)
            if 0 <= x0 and 0 <= y0 and x0 + wsz < W and y0 + wsz < H and inner[y0:y0 + wsz, x0:x0 + wsz].all():
                rp.append(P[y0:y0 + wsz, x0:x0 + wsz])
    if len(rp) > 60: rp = [rp[i] for i in np.random.default_rng(seed).choice(len(rp), 60, replace=False)]
    kerb_ring = (dist > 21 * S) & (dist < 26 * S) & ~frame & ~obj
    road_px = P[kerb_ring]
    tgt = lab(road_px.reshape(-1, 1, 3)).reshape(-1, 3)
    tm, ts = tgt.mean(0), tgt.std(0) + 1e-3

    def recolor(a):
        m = (a.reshape(-1, 3))
        L = lab(m.reshape(-1, 1, 3)).reshape(-1, 3)
        sm, ss = L.mean(0), L.std(0) + 1e-3
        L = (L - sm) / ss * ts + tm
        return rgb(L.reshape(-1, 1, 3)).reshape(a.shape).astype(np.float32)

    stop = frame | obj
    roads, _ = draw_roads(img, [d.tolist() for d in dense], ROAD_HALF * S, Image.open('art/kits/outer/road_strips.png'),
                          stop_mask=stop, seed=seed, recolor=recolor, cob_patches=rp or None)
    final = np.clip(roads, 0, 255).astype(np.uint8)
    Image.fromarray(final).save(os.path.join(out, mid + '.png'))

    # new build grid: a cell is open when most of it is interior floor (the engine adds the road and objective rules)
    gh, gw = len(lay['grid']), len(lay['grid'][0])
    inter_c = np.zeros((gh, gw), bool)
    for j in range(gh):
        for i in range(gw):
            y0, y1 = int(j * CELL * S), int(min(H, (j + 1) * CELL * S)); x0, x1 = int(i * CELL * S), int(min(W, (i + 1) * CELL * S))
            if y1 > y0 and x1 > x0:
                inter_c[j, i] = interior[y0:y1, x0:x1].mean() > 0.85 and not obj[y0:y1, x0:x1].any()
    grid = [''.join('1' if v else '0' for v in row) for row in inter_c]
    json.dump(grid, open(os.path.join(out, mid + '-grid.json'), 'w'))
    dbg = final.copy().astype(np.float32)
    dbg[frame] = dbg[frame] * 0.5 + np.array([255, 0, 0]) * 0.5 * 0.4
    for d in dense:
        for x, y in d[::3]:
            if 0 <= x < W and 0 <= y < H: dbg[int(y), int(x)] = [255, 0, 255]
    Image.fromarray(np.clip(dbg, 0, 255).astype(np.uint8)).save(os.path.join(out, mid + '-debug.png'))
    old = sum(r.count('1') for r in lay['grid']); new = sum(r.count('1') for r in grid)
    print(f'{mid}: {len(cs)} floor patches, {len(rp)} road patches, grid {old} -> {new} open cells')


if __name__ == '__main__':
    main()
