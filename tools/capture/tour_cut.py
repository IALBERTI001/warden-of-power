"""tour_cut.py ASPECT(L|P) TOURDIR HUB.jpg TITLE.jpg OUTDIR - trailer as a tour (user, Nov 4 2026): the cover, the restored
complex, a short clip from each sector, ending on the Aetherheart Engine. Cross-fades between clips, 30 fps."""
import os, sys, shutil
from PIL import Image
asp, tour, hubp, titlep, out = sys.argv[1:6]
W, H = (1920, 1080) if asp == 'L' else (1080, 1620)
shutil.rmtree(out, ignore_errors=True); os.makedirs(out)
ENGINE_INNER = (150, 85, 2730, 1535)          # inside the Engine's pipe frame (art review: no border look)


def fit(im, cx):
    """cover-fit im to WxH; cx = horizontal centre (0..1) for the portrait crop"""
    s = max(W / im.width, H / im.height); im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    x = min(max(0, round(im.width * cx - W / 2)), im.width - W); y = (im.height - H) // 2
    return im.crop((x, y, x + W, y + H))


def clip_frames(name, n, cx, inner=False):
    for i in range(n):
        im = Image.open(f'{tour}/{name}/f{i:04d}.jpg')
        if inner: im = im.crop(ENGINE_INNER)
        yield fit(im, cx)


def hub_frames(n):
    hub = Image.open(hubp).convert('RGB')
    for i in range(n):
        z = 1 + .08 * i / (n - 1)
        w, h = hub.width / z, hub.height / z
        cxp = hub.width * (.5 if asp == 'L' else .41); cyp = hub.height * .45
        x0 = min(max(0, cxp - w / 2), hub.width - w); y0 = min(max(0, cyp - h / 2), hub.height - h)
        im = hub.crop((round(x0), round(y0), round(x0 + w), round(y0 + h)))
        yield fit(im, .5 if asp == 'L' else .41)


title = Image.open(titlep).convert('RGB').resize((W, H), Image.LANCZOS)
segs = [[title] * 30,
        list(hub_frames(66)),
        list(clip_frames('moonwell-1', 72, .45)),
        list(clip_frames('emberheart-3', 72, .45)),
        list(clip_frames('rimeglass-1', 72, .45)),
        list(clip_frames('stormcrown-2', 72, .45)),
        list(clip_frames('aetherheart-1', 180, .5, True))]
X = 8
frames = list(segs[0])
for s in segs[1:]:
    tail = frames[-X:]; frames = frames[:-X]
    for k in range(X): frames.append(Image.blend(tail[k], s[k], (k + 1) / (X + 1)))
    frames += s[X:]
for i, f in enumerate(frames): f.save(f'{out}/{i:04d}.jpg', quality=93)
print(asp, len(frames), 'frames', len(frames) / 30, 's')
