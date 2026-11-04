"""Build the campaign maps of one sector in layers on that sector's painted arena (one-look plan, Nov 4 2026).

usage: sector_build.py levels/kit/<sector>.json out_dir [map-id ...]

The sector arena is a repaint of the approved Outer Seal in the sector's element (same frame, wall, channel, courtyard
and seal in the same places, an open field with no road). Layers, bottom to top:
  0 ground    the arena painting (its field is open floor; optional quilted patches cover any stray object);
  2 road      the Outer Seal road kit (same strips, width, kerbs, radius) along the exact enemy routes in
              levels/kit/routes.json, its stone graded to the sector's road colour; it stops at the channel bank;
  3 bridge    the Outer Seal bridge deck, graded the same, from the bank over the channel to the seal plaza;
  4 seal      the arena's own painted seal, untouched.
Writes out_dir/<id>.png (the map at 1620x971), <id>-debug.png and <id>.json (game data: routes, play area, blocked).
"""
import json, math, os, sys
import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, os.path.dirname(__file__))
from layout import fillet_path, game_path
from kit_road import draw_roads, quilt
from kit_build import load_piece, scaled, cast_shadow

S = 1.62
W, H = 1620, 971


def lab(a):
    from skimage import color
    return color.rgb2lab(np.clip(a / 255.0, 0, 1))


def rgb(l):
    from skimage import color
    return np.clip(color.lab2rgb(l) * 255.0, 0, 255)


def grade_to(target_rgb, strength=1.0, sat=1.0):
    """Shift a stone image's mean colour to target_rgb in Lab, keep its own light and dark detail."""
    t = lab(np.array(target_rgb, np.float32).reshape(1, 1, 3)).reshape(3)

    def f(a):
        L = lab(a.reshape(-1, 1, 3)).reshape(-1, 3)
        m = L.mean(0)
        L[:, 1:] = (L[:, 1:] - m[1:]) * sat + m[1:]
        L += (t - m) * strength
        return rgb(L.reshape(-1, 1, 3)).reshape(a.shape).astype(np.float32)
    return f


def main():
    cfg = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    only = sys.argv[3:]
    routes_all = json.load(open('levels/kit/routes.json'))
    R = routes_all['radius']
    arena = Image.open(cfg['arena']).convert('RGB').resize((W, H), Image.LANCZOS)
    if cfg.get('sharpen'):                        # one-sharpness rule: lift a soft painting's detail toward the Outer Seal
        from PIL import ImageFilter
        r, pct = cfg['sharpen']; arena = arena.filter(ImageFilter.UnsharpMask(radius=r, percent=pct, threshold=2))
    base = np.asarray(arena).astype(np.float32)
    # optional: quilt clean field patches over listed spots (image px rects) that hold a stray object
    if cfg.get('cover'):
        fx0, fy0, fx1, fy1 = cfg['field']
        srcs = [base[y:y + 110, x:x + 110] for (x, y) in cfg['coverFrom']]
        fill = quilt(srcs, W, H, patch=80, overlap=22, seed=3)
        for x0, y0, x1, y1 in cfg['cover']:
            m = np.zeros((H, W), np.float32); m[y0:y1, x0:x1] = 1
            from scipy.ndimage import gaussian_filter
            m = gaussian_filter(m, 6)
            base = base * (1 - m[..., None]) + fill * m[..., None]
    strips = Image.open('art/kits/outer/road_strips.png')
    recolor = grade_to(cfg['roadRGB'], 1.0, cfg.get('roadSat', 0.75))
    kit = 'art/kits/outer'; ks = 0.5
    deck0 = scaled(load_piece(kit, 'bridge_deck'), ks)
    cx0, cx1 = cfg['channel']                      # world x of the channel's left and right bank
    seal = cfg['seal']                            # world centre of the painted seal
    yy, xx = np.mgrid[0:H, 0:W]
    for mid, rlist in routes_all['maps'].items():
        if not mid.startswith(cfg['sector']) or (only and mid not in only):
            continue
        img = base.copy()
        dense = [[(x * S, y * S) for x, y in fillet_path(r, R, 1.0)[0]] for r in rlist]
        # routes that merge share their last stretch: draw that stretch once (a later route stops a little past the
        # point where it meets an earlier one, so its kerbs open into the junction and no doubled bed shows)
        from scipy.spatial import cKDTree
        for i in range(1, len(dense)):
            prev = cKDTree(np.vstack([np.array(dense[j]) for j in range(i)]))
            d, _ = prev.query(np.array(dense[i]))
            on = np.flatnonzero(d < 2.0)
            if len(on):
                dense[i] = dense[i][:min(len(dense[i]), on[0] + 6)]
        stop = xx > cx0 * S                       # the road ends at the channel bank; the bridge carries it on
        img, dist = draw_roads(img, dense, cfg.get('roadHalf', 27) * S, strips, stop_mask=stop, seed=11, recolor=recolor)
        canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
        # bridge: deck middle repeated from just inside the bank to the seal's rim
        y = seal[1]
        x_left = (cx0 - 14) * S; need = round((seal[0] - cfg.get('sealRadius', 34)) * S - x_left)
        cap = round(deck0.width * 0.2); midsec = deck0.crop((cap, 0, deck0.width - cap, deck0.height))
        deck = Image.new('RGBA', (need, deck0.height)); x = cap
        deck.alpha_composite(deck0.crop((0, 0, cap, deck0.height)), (0, 0))
        while x < need - cap:
            deck.alpha_composite(midsec.crop((0, 0, min(midsec.width, need - cap - x), deck0.height)), (x, 0)); x += midsec.width
        deck.alpha_composite(deck0.crop((deck0.width - cap, 0, deck0.width, deck0.height)), (need - cap, 0))
        a = np.asarray(deck).astype(np.float32); m = a[..., 3] > 128
        g = grade_to(cfg['roadRGB'], 0.85, cfg.get('roadSat', 0.75))
        a[..., :3][m] = g(a[..., :3][m].reshape(-1, 1, 3)).reshape(-1, 3)
        deck = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
        face = round(deck.height * 0.16)
        rail = deck.crop((0, deck.height - face, deck.width, deck.height))
        fa = np.asarray(rail).astype(np.float32); fa[..., :3] *= np.linspace(0.62, 0.42, face)[:, None, None]
        deck3 = Image.new('RGBA', (deck.width, deck.height + face))
        deck3.alpha_composite(Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8)), (0, deck.height - 4))
        deck3.alpha_composite(deck)
        bx, by = round(x_left), round(y * S - deck.height / 2)
        sh, dx, dy = cast_shadow(deck3, flat=True)
        shade = Image.new('L', (W, H), 0); shade.paste(sh, (bx + dx, by + dy))
        sa = np.asarray(shade).astype(np.float32)[..., None] / 255 * 0.45
        b2 = np.asarray(canvas.convert('RGB')).astype(np.float32)
        b2 = b2 * (1 - sa) + np.array([30, 28, 20], np.float32) * sa
        canvas = Image.fromarray(np.clip(b2, 0, 255).astype(np.uint8)).convert('RGBA')
        canvas.alpha_composite(deck3, (bx, by))
        # the painted seal back on top of the deck end (untouched pixels inside its rim)
        sm = Image.new('L', (W, H), 0)
        rr = cfg.get('sealRadius', 34) * S
        ImageDraw.Draw(sm).ellipse((seal[0] * S - rr, seal[1] * S - rr, seal[0] * S + rr, seal[1] * S + rr), fill=255)
        canvas.paste(arena.convert('RGBA'), (0, 0), sm)
        final = canvas.convert('RGB')
        final.save(os.path.join(out, mid + '.png'))
        dbg = final.copy(); d = ImageDraw.Draw(dbg)
        for l in dense:
            d.line(l, fill=(255, 0, 255), width=1)
        p = cfg['play']; d.rectangle([p['left'] * S, p['top'] * S, p['right'] * S, p['bottom'] * S], outline=(0, 255, 255))
        for b in cfg.get('blocked', []):
            d.rectangle([v * S for v in b], outline=(255, 60, 60))
        dbg.save(os.path.join(out, mid + '-debug.png'))
        json.dump({'id': mid, 'paths': [game_path(r, R, 6.0) for r in rlist], 'roadHalf': cfg.get('roadHalf', 27),
                   'play': cfg['play'], 'blocked': cfg.get('blocked', []), 'seal': seal},
                  open(os.path.join(out, mid + '.json'), 'w'))
        print('built', mid)


if __name__ == '__main__':
    main()
