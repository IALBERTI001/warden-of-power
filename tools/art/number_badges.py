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
    notch = 14 * K
    # tails behind the band
    for sx in (-1, 1):
        cx = W / 2 + sx * 84 * K
        tail = [(cx, y0 + 10 * K), (cx + sx * 22 * K, y0 + 10 * K), (cx + sx * 13 * K, (y0 + y1) / 2 + 5 * K),
                (cx + sx * 22 * K, y1 + 8 * K), (cx, y1 + 8 * K)]
        d.polygon(tail, fill=tuple(int(c * .62) for c in bot) + (255,), outline=edge + (255,), width=3 * K)
    band = [(x0 + 12 * K, y0), (x1 - 12 * K, y0), (x1, (y0 + y1) / 2), (x1 - 12 * K, y1), (x0 + 12 * K, y1), (x0, (y0 + y1) / 2)]
    # vertical gradient fill through a mask
    mask = Image.new('L', (W, W), 0); ImageDraw.Draw(mask).polygon(band, fill=255)
    grad = np.zeros((W, W, 3), np.float32)
    t = np.clip((np.arange(W) - y0) / (y1 - y0), 0, 1)[:, None]
    c = np.where(t < .5, np.array(top) * (1 - t * 2) + np.array(mid) * t * 2, np.array(mid) * (2 - t * 2) + np.array(bot) * (t * 2 - 1))
    grad[:] = c[:, None, :]
    g = Image.fromarray(grad.astype(np.uint8)).convert('RGBA'); g.putalpha(mask)
    lay.alpha_composite(g)
    d.line(band + [band[0]], fill=edge + (255,), width=4 * K, joint='curve')
    # inner highlight line
    d.line([(x0 + 22 * K, y0 + 6 * K), (x1 - 22 * K, y0 + 6 * K)], fill=(255, 250, 225, 150), width=2 * K)
    size = 44 * K if len(text) <= 3 else 40 * K
    f = ImageFont.truetype(FONT, size)
    bb = d.textbbox((0, 0), text, font=f)
    tx = (W - (bb[2] - bb[0])) / 2 - bb[0]; ty = (y0 + y1) / 2 - (bb[3] - bb[1]) / 2 - bb[1]
    d.text((tx + 2 * K, ty + 3 * K), text, font=f, fill=(40, 20, 10, 170))
    d.text((tx, ty), text, font=f, fill=ink + (255,), stroke_width=4 * K, stroke_fill=(58, 30, 12, 255))
    return lay


def main():
    base = Image.open(SRC).convert('RGBA').resize((256 * K, 256 * K), Image.LANCZOS)
    gold = dict(top=(255, 222, 120), mid=(232, 162, 46), bot=(160, 92, 24), edge=(92, 48, 14), ink=(255, 248, 228))
    white = dict(top=(255, 255, 248), mid=(236, 224, 196), bot=(190, 160, 110), edge=(110, 78, 30), ink=(255, 214, 92))
    for n, text, st in [(600, '600', gold), (700, '700', gold), (800, '800', gold), (900, '900', gold), (1000, '1K', white)]:
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
