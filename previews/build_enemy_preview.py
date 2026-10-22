"""Assemble generated pose frames into an approval GIF; source art is preserved."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
atlas = Image.open(ROOT / 'art-reference/enemy-walk-candidates-v1.png').convert('RGBA')
font_path = 'C:/Windows/Fonts/segoeui.ttf'
font = ImageFont.truetype(font_path, 17)
small = ImageFont.truetype(font_path, 13)
title = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 25)
specs = [
    ('Moss slime', 'Squash / push-off / hop / landing', 40, 330,
     [(20, 290), (315, 320), (640, 250), (900, 260), (1170, 310), (1490, 280)], 108, 1.0),
    ('Ember beetle', 'Alternating legs / quick scuttle', 340, 565,
     [(20, 300), (330, 280), (615, 280), (900, 290), (1195, 285), (1490, 280)], 100, 1.5),
    ('Stone golem', 'Alternating steps / counter-swinging arms', 565, 840,
     [(20, 315), (335, 285), (620, 285), (905, 295), (1200, 290), (1490, 280)], 120, .75),
]
sprites = []
for name, desc, top, bottom, columns, size, pace in specs:
    row = []
    # Shared scale within each character's cycle preserves pose size differences.
    scale = size / max(w for x, w in columns)
    for x, w in columns:
        sprite = atlas.crop((x, top, min(x+w, atlas.width), bottom))
        sprite = sprite.resize((round(sprite.width*scale), round(sprite.height*scale)), Image.Resampling.LANCZOS)
        row.append(sprite)
    sprites.append(row)

frames=[]
for i in range(96):
    t=i*.08
    im=Image.new('RGBA', (960, 690), '#111c1b')
    d=ImageDraw.Draw(im)
    d.text((30,20), 'Enemy movement | approval study 01', font=title, fill='#f1e7cf')
    d.text((30,60), 'Generated pose cycles matching the approved reference. Motion candidates, not final production atlases.', font=small, fill='#a8b9ac')
    d.text((75,91), 'POSE INSPECTION', font=small, fill='#dfb56c')
    d.text((465,91), 'MOVEMENT ALONG A PATH', font=small, fill='#dfb56c')
    for r, (name, desc, top, bottom, columns, size, pace) in enumerate(specs):
        y=125+r*175
        d.rounded_rectangle((20,y,940,y+164), radius=12, fill='#1d2c27', outline='#35463b')
        d.text((38,y+10), name, font=font, fill='#f1e7cf')
        d.text((38,y+35), desc, font=small, fill='#adbcaf')
        d.line((260,y+125,895,y+145), fill='#4e4c39', width=49)
        d.line((260,y+125,895,y+145), fill='#776b4b', width=37)
        for x in range(290,890,65):
            yy=y+125+(x-260)*20/635
            d.line((x,yy,x+13,yy+1), fill='#9a865b', width=2)
        idx=int(t*8*pace)%6
        sprite=sprites[r][idx]
        im.alpha_composite(sprite,(130-sprite.width//2,y+155-sprite.height))
        # Translation is accompanied by six genuinely different body/limb poses.
        u=(i/96*([1,2,1][r])+.12)%1
        px=285+u*570; py=y+125+u*20
        d.ellipse((px-24,py-5,px+24,py+5),fill='#30382b')
        im.alpha_composite(sprite,(round(px-sprite.width/2),round(py-sprite.height+8)))
    d.text((30,665), '6 poses per enemy | slime 8 fps | beetle 12 fps | golem 6 fps | looping preview',font=small,fill='#a8b9ac')
    frames.append(im.convert('RGB').quantize(colors=192))
out=ROOT/'previews/enemy-movement-v1.gif'
frames[0].save(out,save_all=True,append_images=frames[1:],duration=80,loop=0,disposal=2)
print(out)
print(f'{len(frames)} frames; {out.stat().st_size:,} bytes')

