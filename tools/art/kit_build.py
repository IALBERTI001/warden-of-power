"""Build a map image from a level layout (levels/<id>.json), the painted ground and the modular kit (modular-asset-kits).

usage: kit_build.py levels/outer.json out_dir
writes  out_dir/map.png        the finished map at the game's image size
        out_dir/debug.png      the map with route, road edges, piece footprints and sprite boxes drawn on it
        out_dir/build.json     gameplay data: game path, every piece's sprite box and footprint in world units

Rules this follows: one uniform kit scale for every piece; pieces are cropped, never stretched; walls are pillars plus
cropped wall bays (end posts cut off, pillars cover the joins); everything casts its shadow to the lower right (light
from the upper left); the road is built from the same centre line the enemies walk.
"""
import json, math, sys, os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
from layout import fillet_path, game_path
from kit_road import draw_road


def load_piece(kit, name):
    im = Image.open(os.path.join(kit, name + '.png')).convert('RGBA')
    return im.crop(im.getchannel('A').point(lambda v: 255 if v > 24 else 0).getbbox())


def scaled(im, s):
    return im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)


def post_width(wall):
    """Width (source px) of the end post on a wall piece: the run of columns at the left that stand taller than the bay."""
    a = np.asarray(wall)[..., 3] > 128
    top = np.array([np.argmax(a[:, x]) if a[:, x].any() else a.shape[0] for x in range(a.shape[1])])
    lvl = np.median(top[int(a.shape[1] * 0.3):int(a.shape[1] * 0.7)])
    from scipy.ndimage import median_filter
    top = median_filter(top, 9)
    x = int(np.flatnonzero(a.any(axis=0))[0]) + 6
    while x < len(top) and top[x] < lvl - 6: x += 1
    return x


def bay_limits(wall):
    """Source columns of the plain bay between a wall piece's two end posts."""
    return post_width(wall) + 6, wall.width - post_width(wall.transpose(Image.FLIP_LEFT_RIGHT)) - 6


def wall_post(wall, s):
    """The left end post of a wall piece, cut out whole, at kit scale s."""
    return scaled(wall.crop((0, 0, post_width(wall) + 2, wall.height)), s)


def wall_bay(wall, length_px, s):
    """The middle of a wall piece (end posts cut off), cropped to length_px at kit scale s."""
    x0, x1 = bay_limits(wall)
    need = round(length_px / s)
    if need > x1 - x0:
        raise SystemExit('wall bay too short: need %d src px, piece has %d (add pillars)' % (need, x1 - x0))
    mid = (x0 + x1) // 2
    return scaled(wall.crop((mid - need // 2, 0, mid - need // 2 + need, wall.height)), s)


def cast_shadow(sprite, flat=False):
    """Shadow on the ground for a sprite, light from the upper left. Returns (RGBA shadow, dx, dy) offset from the
    sprite's top-left."""
    al = sprite.getchannel('A')
    if flat:
        sh = al.filter(ImageFilter.GaussianBlur(5))
        return sh, 7, 10
    w, h = sprite.size
    k = 0.42
    flip = al.transpose(Image.FLIP_TOP_BOTTOM).resize((w, max(1, round(h * k))), Image.LANCZOS)
    shear = round(h * k * 0.9)
    sh = flip.transform((w + shear, flip.height), Image.AFFINE, (1, -shear / flip.height, 0, 0, 1, 0), Image.BICUBIC)
    sh = sh.filter(ImageFilter.GaussianBlur(3))
    return sh, 0, h - 6                                     # starts at the base line


def main():
    lay = json.load(open(sys.argv[1])); out_dir = sys.argv[2]; os.makedirs(out_dir, exist_ok=True)
    W, H = lay['image']; S = W / lay['world'][0]
    g = lay['ground']
    ground = Image.open(g['src']).convert('RGB').crop(tuple(g['crop'])).resize((W, H), Image.LANCZOS)
    # retouch: clone painted ground over a spot the layout no longer wants (map px, feathered edges, logged in the layout)
    for c in g.get('clones', []):
        sx, sy, w, h = c['from']; dx, dy = c['to']; f = c.get('feather', 8)
        patch = ground.crop((sx, sy, sx + w, sy + h))
        m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rectangle((f, f, w - 1 - f, h - 1 - f), fill=255)
        if dx == 0: ImageDraw.Draw(m).rectangle((0, f, f, h - 1 - f), fill=255)          # image edge: no fade needed
        m = m.filter(ImageFilter.GaussianBlur(f / 2))
        ground.paste(patch, (dx, dy), m)
    if g.get('sharpen'):
        r, pct = g['sharpen']; ground = ground.filter(ImageFilter.UnsharpMask(radius=r, percent=pct, threshold=2))
    img = np.asarray(ground).astype(np.float32)
    for x0, y0, x1, y1 in g.get('flattenLight', []):            # map px: remove broad painted light/shadow bands
        from scipy.ndimage import gaussian_filter
        reg = img[y0:y1, x0:x1]; lum = reg.mean(axis=2)
        broad = gaussian_filter(lum, 45, mode='reflect')
        reg *= (broad.mean() / np.maximum(broad, 1))[..., None]
        img[y0:y1, x0:x1] = reg

    # road
    rd = lay['road']
    dense, _ = fillet_path(rd['points'], rd['radius'], 1.0)
    pts_px = [(x * S, y * S) for x, y in dense]
    yy, xx = np.mgrid[0:H, 0:W]
    stop = xx > rd['stopX'] * S
    img, _ = draw_road(img, pts_px, rd['width'] / 2 * S, Image.open(rd['strips']), stop_mask=stop, cob_sat=rd.get('saturation', 1.0))
    canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')

    kit = lay['kit']['dir']; ks = lay['kit']['scale']
    pillar = scaled(load_piece(kit, 'pillar'), ks)
    walls = [load_piece(kit, 'wall_a'), load_piece(kit, 'wall_b')]
    plinth = scaled(load_piece(kit, 'seal_plinth'), ks)
    deck = scaled(load_piece(kit, 'bridge_deck'), ks)

    flats, stands, record = [], [], []

    def stand(sprite, bx, by, name):                         # base point in world units
        x = round(bx * S - sprite.width / 2); y = round(by * S - sprite.height)
        stands.append((by, sprite, x, y)); record.append({'piece': name, 'base': [bx, by],
            'box': [x / S, y / S, (x + sprite.width) / S, (y + sprite.height) / S]})

    def flat(sprite, cx, cy, name):
        x = round(cx * S - sprite.width / 2); y = round(cy * S - sprite.height / 2)
        flats.append((sprite, x, y)); record.append({'piece': name, 'centre': [cx, cy],
            'box': [x / S, y / S, (x + sprite.width) / S, (y + sprite.height) / S]})

    post = wall_post(walls[0], ks)
    max_bay = min(bay_limits(w)[1] - bay_limits(w)[0] for w in walls) * ks
    tuck = 7                                                   # px each bay runs under the pillar/post beside it
    for i, wl in enumerate(lay['walls']):
        # a wall run: orb pillars at the ends (and 'mid'); each span between pillars is split into EQUAL bays with a stone
        # post between bays, so every span is identical and mirrored about the middle pillar (no stubs, no doubled posts)
        cs = sorted([wl['x0'], wl['x1']] + wl.get('mid', []))
        for c0, c1 in zip(cs[:-1], cs[1:]):
            f0 = c0 * S + pillar.width / 2; f1 = c1 * S - pillar.width / 2
            span = f1 - f0
            k = 1
            while (span - (k - 1) * post.width) / k + 2 * tuck > max_bay: k += 1
            bay = (span - (k - 1) * post.width) / k
            x = f0
            for b in range(k):
                pc = wall_bay(walls[(i + b) % 2], bay + 2 * tuck, ks)
                stand(pc, (x + bay / 2) / S, wl['y'] - 0.6, 'wall_bay')
                x += bay
                if b < k - 1:
                    stand(post, (x + post.width / 2) / S, wl['y'] - 0.3, 'wall_post'); x += post.width
        for px in cs:
            stand(pillar, px, wl['y'] + 0.5, 'pillar')
    for bx, by in lay.get('pillars', []):
        stand(pillar, bx, by, 'pillar')
    for bx, by in lay.get('plazaPillars', []):
        stand(pillar, bx, by, 'pillar')
        bed = Image.new('RGBA', (round(pillar.width * 1.25), round(pillar.width * 0.45)))
        ImageDraw.Draw(bed).ellipse((0, 0, bed.width - 1, bed.height - 1), fill=(58, 84, 36, 210))
        bed = bed.filter(ImageFilter.GaussianBlur(3))
        flats.append((bed, round(bx * S - bed.width / 2), round(by * S - bed.height * 0.75)))
    face = round(deck.height * 0.16)                          # the deck's south face (3/4 view) hangs below it over the water
    rail = deck.crop((0, deck.height - face, deck.width, deck.height))
    shade_rows = np.linspace(0.62, 0.42, face)[None, :, None]
    fa = np.asarray(rail).astype(np.float32); fa[..., :3] *= shade_rows.transpose(1, 0, 2)
    deck3 = Image.new('RGBA', (deck.width, deck.height + face)); deck3.alpha_composite(deck)
    deck3.alpha_composite(Image.fromarray(np.clip(fa, 0, 255).astype(np.uint8)), (0, deck.height))
    deck3.alpha_composite(deck.crop((0, deck.height - 3, deck.width, deck.height)), (0, deck.height - 3))
    bc = lay['bridge']['center']
    flat(deck3, bc[0], bc[1] + face / 2 / S, 'bridge_deck')
    land = lay['bridge'].get('landingTo')
    if land:                                                  # floor slabs (deck middle, rails cut away) from bridge to seal
        x_end = round(bc[0] * S + deck.width / 2); x_to = round(land * S)
        top_r, bot_r = round(deck.height * 0.22), round(deck.height * 0.78)
        mid = deck.width // 2
        slab = deck.crop((mid - (x_to - x_end) // 2, top_r, mid - (x_to - x_end) // 2 + (x_to - x_end), bot_r))
        flats.append((slab, x_end - 2, round(bc[1] * S - deck.height / 2) + top_r))
    for cx in (bc[0] * S - deck.width / 2 + post.width * 0.45, bc[0] * S + deck.width / 2 - post.width * 0.45):
        stand(post, cx / S, bc[1] - deck.height / 2 / S + 4, 'newel_post')
        stand(post, cx / S, bc[1] + deck.height / 2 / S + face / S, 'newel_post')
    flat(plinth, *lay['seal']['at'], 'seal_plinth')

    # shadows first, then flat pieces, then standing pieces back to front
    shade = Image.new('L', (W, H), 0)
    for sp, x, y in flats:
        sh, dx, dy = cast_shadow(sp, flat=True)
        shade.paste(Image.eval(sh, lambda v: int(v * 0.9)), (x + dx, y + dy), Image.eval(sh, lambda v: int(v * 0.9)))
    for _, sp, x, y in stands:
        sh, dx, dy = cast_shadow(sp)
        layer = Image.new('L', (W, H), 0); layer.paste(sh, (x + dx, y + dy))
        shade = Image.fromarray(np.maximum(np.asarray(shade), np.asarray(layer)))
    sa = np.asarray(shade).astype(np.float32)[..., None] / 255 * lay.get('shadow', 0.5)
    base = np.asarray(canvas.convert('RGB')).astype(np.float32)
    base = base * (1 - sa) + np.array([30, 28, 20], np.float32) * sa
    canvas = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert('RGBA')
    for sp, x, y in flats:
        canvas.alpha_composite(sp, (x, y))
    for _, sp, x, y in sorted(stands, key=lambda t: t[0]):
        canvas.alpha_composite(sp, (max(0, x), max(0, y)), (max(0, -x), max(0, -y)))
    canvas = canvas.convert('RGB'); canvas.save(os.path.join(out_dir, 'map.png'))

    # debug overlay
    dbg = canvas.copy(); d = ImageDraw.Draw(dbg)
    d.line(pts_px, fill=(255, 0, 255), width=1)
    for side in (-1, 1):
        P = np.array(pts_px); t = np.gradient(P, axis=0); t /= np.linalg.norm(t, axis=1, keepdims=True)
        E = P + np.stack([t[:, 1], -t[:, 0]], 1) * side * rd['width'] / 2 * S
        d.line([tuple(e) for e in E], fill=(255, 255, 0), width=1)
    for r in record:
        b = [v * S for v in r['box']]; d.rectangle(b, outline=(0, 255, 255))
    dbg.save(os.path.join(out_dir, 'debug.png'))

    json.dump({'path': game_path(rd['points'], rd['radius'], 6.0), 'roadHalf': rd['width'] / 2, 'pieces': record},
              open(os.path.join(out_dir, 'build.json'), 'w'), indent=1)
    print('built %dx%d, %d pieces, path %d points' % (W, H, len(record), len(game_path(rd['points'], rd['radius'], 6.0))))


if __name__ == '__main__':
    main()
