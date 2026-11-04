"""Hub stage art from whole-complex paintings (one-look hub, Nov 4 2026).

usage: hub_stages.py restored.png ruined.png stage1.png stage2.png [asc1.png ... asc6.png]

Every painting is first aligned to the restored complex (OpenCV ECC, homography) so the facility crops line up with the
base painting exactly, then cut to the hub boxes (game/hubfx.js BOXES) and written to game/assets/hub/stages/:
<facility>-stage1/2.png from stage1/stage2, gate-sealed.png from stage1 (gate closed), aetherheart-asc<n>.png from the
ascension paintings. hub-restored.jpg and hub-ruined.jpg are written from the restored and aligned ruined paintings.
"""
import sys
import cv2
import numpy as np
from PIL import Image

BOXES = {'moonwell': [0, 0, 576, 416], 'emberheart': [640, 0, 1136, 352], 'rimeglass': [0, 400, 512, 896],
         'stormcrown': [864, 192, 1280, 640], 'atelier': [704, 544, 1152, 864], 'gate': [448, 640, 832, 1024],
         'aetherheart': [416, 224, 832, 608]}
OUT = 'game/assets/hub/'
OWN = {'stormcrown': [1040, 120, 1180, 300]}  # the spire's crystal tip
W, H = 1536, 1024


def load(p):
    return np.asarray(Image.open(p).convert('RGB').resize((W, H), Image.LANCZOS))


def align(img, ref):
    g1 = cv2.cvtColor(ref, cv2.COLOR_RGB2GRAY).astype(np.float32); g2 = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32)
    g1 = cv2.GaussianBlur(g1, (0, 0), 3); g2 = cv2.GaussianBlur(g2, (0, 0), 3)
    warp = np.eye(3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(g1, g2, warp, cv2.MOTION_HOMOGRAPHY,
                                       (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    except cv2.error as e:
        print('  ECC failed, unaligned:', e); return img, None
    out = cv2.warpPerspective(img, warp, (W, H), flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT)
    return out, warp


def align_region(img, ref):
    g1 = cv2.GaussianBlur(cv2.cvtColor(ref, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 3)
    g2 = cv2.GaussianBlur(cv2.cvtColor(img, cv2.COLOR_RGB2GRAY).astype(np.float32), (0, 0), 3)
    warp = np.eye(3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(g1, g2, warp, cv2.MOTION_HOMOGRAPHY,
                                       (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    except cv2.error as e:
        print('  ECC failed:', e); return img, None
    h, w = ref.shape[:2]
    return cv2.warpPerspective(img, warp, (w, h), flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REFLECT), warp


def owner_alpha(fid):
    """Soft alpha for a facility's crop: 0 where a neighbouring facility's box owns the pixel (nearest box centre,
    measured in box sizes), so a stage piece never repaints its neighbour (boxes overlap)."""
    from scipy import ndimage as nd
    yy, xx = np.mgrid[0:H, 0:W]
    best = None; who = None
    for k, (x0, y0, x1, y1) in BOXES.items():
        cx, cy, hw, hh = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
        d = np.maximum(np.abs(xx - cx) / hw, np.abs(yy - cy) / hh)
        d = np.where((xx >= x0) & (xx < x1) & (yy >= y0) & (yy < y1), d, 9)
        if best is None: best, who = d, np.full(d.shape, k, object)
        else:
            m = d < best; best = np.where(m, d, best); who = np.where(m, k, who)
    for k, (x0, y0, x1, y1) in OWN.items():           # hand-set owners where a tall piece crosses into a neighbour's box
        who[y0:y1, x0:x1] = k
    a = nd.gaussian_filter((who == fid).astype(np.float32), 10)
    x0, y0, x1, y1 = BOXES[fid]
    return (np.clip(a[y0:y1, x0:x1] * 1.15, 0, 1) * 255).astype(np.uint8)


def crop(a, box, fid=None):
    x0, y0, x1, y1 = box
    im = Image.fromarray(a[y0:y1, x0:x1])
    if fid:
        im = im.convert('RGBA'); im.putalpha(Image.fromarray(owner_alpha(fid)))
    return im


def main():
    restored = load(sys.argv[1])
    Image.fromarray(restored).save(OUT + 'hub-restored.jpg', quality=90, optimize=True, progressive=True)
    for f in ('moonwell', 'emberheart', 'rimeglass', 'stormcrown', 'atelier'):
        crop(restored, BOXES[f], f).save(OUT + f'stages/{f}-stage3.png', optimize=True)
    ruined, w = align(load(sys.argv[2]), restored); print('ruined', None if w is None else np.round(w, 3).tolist())
    Image.fromarray(ruined).save(OUT + 'hub-ruined.jpg', quality=90, optimize=True, progressive=True)
    for n, p in ((1, sys.argv[3]), (2, sys.argv[4])):
        st, w = align(load(p), restored); print('stage', n, None if w is None else np.round(w, 3).tolist())
        for f in ('moonwell', 'emberheart', 'rimeglass', 'stormcrown', 'atelier'):
            crop(st, BOXES[f], f).save(OUT + f'stages/{f}-stage{n}.png', optimize=True)
        if n == 1:
            crop(st, BOXES['gate'], 'gate').save(OUT + 'stages/gate-sealed.png', optimize=True)
    for i, p in enumerate(sys.argv[5:], 1):
        # ascension paintings are captured as a region: file@x0,y0 (the region's offset in the 1536x1024 painting)
        path, off = p.split('@'); ox, oy = map(int, off.split(','))
        reg = np.asarray(Image.open(path).convert('RGB'))
        h, w_ = reg.shape[:2]
        ref = restored[oy:oy + h, ox:ox + w_]
        a, w = align_region(reg, ref); print('asc', i, None if w is None else np.round(w, 3).tolist())
        bx0, by0, bx1, by1 = BOXES['aetherheart']
        Image.fromarray(a[by0 - oy:by1 - oy, bx0 - ox:bx1 - ox]).save(OUT + f'stages/aetherheart-asc{i}.png', optimize=True)


if __name__ == '__main__':
    main()
