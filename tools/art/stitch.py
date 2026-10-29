"""Stitch browser capture tiles of one image into the full image, registering every tile by its overlap.

usage: stitch.py out.png W H x0,y0:tile.png x1,y1:tile.png ...
  x,y = the nominal image offset each tile was captured at (the true offset is searched within +-80 px).
Tiles are placed in the order given; each is matched against the mosaic built so far (mean absolute difference on the
overlap); the report prints each tile's found offset and match error (a good match is under ~10).
"""
import sys
import numpy as np
from PIL import Image


def main():
    out, W, H = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
    specs = []
    for a in sys.argv[4:]:
        off, path = a.split(':', 1); x, y = map(int, off.split(','))
        specs.append((x, y, Image.open(path).convert('RGB')))
    mosaic = np.zeros((H, W, 3), np.float32); have = np.zeros((H, W), bool)
    for i, (nx, ny, im) in enumerate(specs):
        t = np.asarray(im).astype(np.float32); th, tw = t.shape[:2]; tl = t.mean(axis=2)
        if i == 0:
            bx, by, err = nx, ny, 0.0
        else:
            ml = mosaic.mean(axis=2); best = None
            for dy in range(-80, 81, 2):
                for dx in range(-80, 81, 2):
                    x, y = nx + dx, ny + dy
                    x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + tw), min(H, y + th)
                    if x1 - x0 < 40 or y1 - y0 < 40: continue
                    m = have[y0:y1, x0:x1]
                    if m.sum() < 4000: continue
                    e = np.abs(ml[y0:y1, x0:x1] - tl[y0 - y:y1 - y, x0 - x:x1 - x])[m].mean()
                    if best is None or e < best[0]: best = (e, x, y)
            e0, x, y = best; best = None
            for dy in range(-2, 3):                              # refine to 1 px
                for dx in range(-2, 3):
                    xx, yy = x + dx, y + dy
                    x0, y0, x1, y1 = max(0, xx), max(0, yy), min(W, xx + tw), min(H, yy + th)
                    m = have[y0:y1, x0:x1]
                    e = np.abs(ml[y0:y1, x0:x1] - tl[y0 - yy:y1 - yy, x0 - xx:x1 - xx])[m].mean()
                    if best is None or e < best[0]: best = (e, xx, yy)
            err, bx, by = best
        x0, y0, x1, y1 = max(0, bx), max(0, by), min(W, bx + tw), min(H, by + th)
        new = ~have[y0:y1, x0:x1]
        mosaic[y0:y1, x0:x1][new] = t[y0 - by:y1 - by, x0 - bx:x1 - bx][new]
        have[y0:y1, x0:x1] |= True
        print('tile %d nominal (%d,%d) -> placed (%d,%d) error %.2f' % (i, nx, ny, bx, by, err))
    print('coverage %.4f' % have.mean())
    Image.fromarray(np.clip(mosaic, 0, 255).astype(np.uint8)).save(out)


if __name__ == '__main__':
    main()
