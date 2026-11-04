"""Numbered depth badges (Nov 4 2026, user-approved launch plan): the Crown medal (endless_500) with a gold ribbon
carrying the wave number in the game's number font (Lilita One). Writes endless_600..900 and endless_1000 ("1K",
white-gold ribbon) at 256 and 128 into game/assets/badges/.

usage: python3 tools/art/number_badges.py
"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = 'game/assets/badges/endless_500-256.webp'
OUT = 'game/assets/badges/'
FONT = 'game/assets/fonts/LilitaOne-Regular.ttf'
K = 4  # supersample


def ribbon(text, top, mid, bot, edge, ink):
    W = 256 * K
    lay = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    y0, y1 = 158 * K, 214 * K
    x0, x1 = 42 * K, 214 * K
    ow = 5 * K                                   # outline weight close to the medal rim's dark line
    dark = tuple(int(c * .55) for c in bot)
    for sx in (-1, 1):
        cx = W / 2 + sx * 84 * K
        tail = [(cx, y0 + 10 * K), (cx + sx * 22 * K, y0 + 10 * K), (cx + sx * 13 * K, (y0 + y1) / 2 + 5 * K),
                (cx + sx * 22 * K, y1 + 8 * K), (cx, y1 + 8 * K)]
        d.polygon(tail, fill=tuple(int(c * .78) for c in mid) + (255,))
        # tail shading: darker toward the band, where it folds behind
        fold = [(cx, y0 + 10 * K), (cx + sx * 9 * K, y0 + 10 * K), (cx + sx * 9 * K, y1 + 8 * K), (cx, y1 + 8 * K)]
        d.polygon(fold, fill=dark + (255,))
        d.line(tail + [tail[0]], fill=edge + (255,), width=ow, joint='curve')
        # the fold: a small dark triangle tucked under the band's end
        tri = [(cx - sx * 2 * K, y1), (cx + sx * 10 * K, y1), (cx - sx * 2 * K, y1 + 8 * K)]
        d.polygon(tri, fill=edge + (255,))
    band = [(x0 + 12 * K, y0), (x1 - 12 * K, y0), (x1, (y0 + y1) / 2), (x1 - 12 * K, y1), (x0 + 12 * K, y1), (x0, (y0 + y1) / 2)]
    mask = Image.new('L', (W, W), 0); ImageDraw.Draw(mask).polygon(band, fill=255)
    t = np.clip((np.arange(W) - y0) / (y1 - y0), 0, 1)[:, None]
    c = np.where(t < .5, np.array(top) * (1 - t * 2) + np.array(mid) * t * 2, np.array(mid) * (2 - t * 2) + np.array(bot) * (t * 2 - 1))
    # soft top highlight and bottom shade baked into the gradient
    c = c + 40 * np.exp(-((t - .12) / .07) ** 2) - 30 * np.exp(-((t - .92) / .08) ** 2)
    grad = np.repeat(np.clip(c, 0, 255)[:, None, :], W, axis=1).reshape(W, W, 3)
    g = Image.fromarray(grad.astype(np.uint8)).convert('RGBA'); g.putalpha(mask)
    lay.alpha_composite(g)
    d.line(band + [band[0]], fill=edge + (255,), width=ow, joint='curve')
    size = 44 * K if len(text) <= 3 else 46 * K
    f = ImageFont.truetype(FONT, size)
    bb = d.textbbox((0, 0), text, font=f)
    tx = (W - (bb[2] - bb[0])) / 2 - bb[0]; ty = (y0 + y1) / 2 - (bb[3] - bb[1]) / 2 - bb[1]
    d.text((tx + 2 * K, ty + 3 * K), text, font=f, fill=(30, 15, 8, 170))
    d.text((tx, ty), text, font=f, fill=ink + (255,), stroke_width=4 * K, stroke_fill=(40, 22, 10, 255))
    return lay


def main():
    base = Image.open(SRC).convert('RGBA').resize((256 * K, 256 * K), Image.LANCZOS)
    cream = (255, 248, 228)
    tiers = [(600, '600', dict(top=(240, 190, 140), mid=(184, 112, 58), bot=(112, 62, 30), edge=(58, 30, 12), ink=cream)),      # bronze
             (700, '700', dict(top=(250, 252, 255), mid=(178, 190, 204), bot=(104, 116, 134), edge=(40, 44, 58), ink=cream)),    # silver
             (800, '800', dict(top=(255, 230, 130), mid=(232, 162, 46), bot=(150, 86, 22), edge=(80, 42, 12), ink=cream)),       # gold
             (900, '900', dict(top=(130, 200, 255), mid=(42, 112, 206), bot=(18, 48, 120), edge=(10, 22, 60), ink=cream)),       # sapphire
             (1000, '1K', dict(top=(196, 140, 255), mid=(110, 50, 190), bot=(52, 18, 104), edge=(26, 8, 54), ink=(255, 226, 120)))]  # prismatic violet
    for n, text, st in tiers:
        im = base.copy()
        r = ribbon(text, **st)
        sh = r.getchannel('A').filter(ImageFilter.GaussianBlur(5 * K)).point(lambda v: v * .5)
        shadow = Image.new('RGBA', im.size, (20, 10, 0, 0)); shadow.putalpha(sh)
        im.alpha_composite(shadow, (0, 3 * K)); im.alpha_composite(r)
        for s in (256, 128):
            im.resize((s, s), Image.LANCZOS).save(f'{OUT}endless_{n}-{s}.webp', quality=92, method=6)
        print('wrote', n)


if __name__ == '__main__':
    main()
