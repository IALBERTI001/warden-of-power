"""Aetherheart Engine map, one-look rebuild (Nov 4 2026).

usage: engine_v2.py levels/kit/aetherheart.json out_dir

Layers, bottom to top:
  0 ground  the Aetherheart arena (a repaint of the Outer Seal in brass, ChatGPT Nov 4 2026): thin machine border, the
            orb wall, two side gateways, open sandstone floor and an empty steel platform at the centre;
  2 road    the Outer Seal road kit as one network (tools/art/road_network.py) along the exact enemy routes;
  4 seal    the user's heart seal, cut along its own outline from the approved painting (untouched pixels), with a
            soft contact shadow, placed over the platform; its painted arches carry both roads into the heart.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as nd

sys.path.insert(0, os.path.dirname(__file__))
from layout import fillet_path, game_path
from road_network import draw_network

S = 1.62
W, H = 1620, 971


def main():
    cfg = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
    base = np.asarray(Image.open(cfg['arena']).convert('RGB').resize((W, H), Image.LANCZOS)).astype(np.float32)
    R = cfg['radius']
    dense = [[(x * S, y * S) for x, y in fillet_path(r, R, 1.0)[0]] for r in cfg['routes']]
    img, surf = draw_network(base, dense, cfg['roadHalf'] * S, Image.open('art/kits/outer/road_strips.png'),
                             seed=11, cob_sat=0.6, cob_tint=(cfg['roadRGB'], cfg.get('roadTint', 0.3)), corner=30)
    canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).convert('RGBA')
    seal = Image.open(cfg['seal']['src']).convert('RGBA')
    ax, ay = cfg['seal']['anchor']; cx, cy = cfg['seal']['at']
    x0, y0 = round(cx * S - ax), round(cy * S - ay)
    a = np.asarray(seal)[..., 3].astype(np.float32) / 255
    sh = nd.gaussian_filter(a, 6) * 0.45                          # contact shadow, light from the upper left
    shade = np.zeros((H, W), np.float32)
    dx, dy = 7, 9
    shade[y0 + dy:y0 + dy + a.shape[0], x0 + dx:x0 + dx + a.shape[1]] = sh[:H - y0 - dy, :W - x0 - dx]
    b = np.asarray(canvas.convert('RGB')).astype(np.float32)
    b = b * (1 - shade[..., None]) + np.array([30, 24, 14], np.float32) * shade[..., None]
    canvas = Image.fromarray(np.clip(b, 0, 255).astype(np.uint8)).convert('RGBA')
    canvas.alpha_composite(seal, (x0, y0))
    final = canvas.convert('RGB'); final.save(os.path.join(out, cfg['id'] + '.png'))
    dbg = final.copy(); d = ImageDraw.Draw(dbg)
    for l in dense: d.line(l, fill=(255, 0, 255), width=1)
    p = cfg['play']; d.rectangle([p['left'] * S, p['top'] * S, p['right'] * S, p['bottom'] * S], outline=(0, 255, 255))
    for bl in cfg['blocked']: d.rectangle([v * S for v in bl], outline=(255, 60, 60))
    dbg.save(os.path.join(out, cfg['id'] + '-debug.png'))
    json.dump({'id': cfg['id'], 'paths': [game_path(r, R, 6.0) for r in cfg['routes']], 'roadHalf': cfg['roadHalf'],
               'play': cfg['play'], 'blocked': cfg['blocked']}, open(os.path.join(out, cfg['id'] + '.json'), 'w'))
    print('built', cfg['id'])


if __name__ == '__main__':
    main()
