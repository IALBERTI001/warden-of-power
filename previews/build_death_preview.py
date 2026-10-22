"""Sequence generated death poses without repainting the source artwork."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
atlas=Image.open(ROOT/'art-reference/enemy-death-candidates-v1.png').convert('RGBA')
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',16)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',13)
title=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',25)
specs=[('Moss slime','Collapse into a gelatin puddle',0,335),
       ('Ember beetle','Legs buckle; shell settles',345,575),
       ('Stone golem','Heavy collapse into mossy rubble',580,875)]
poses=[]
for name,desc,y0,y1 in specs:
    row=[]
    for k in range(6):
        x0=round(k*atlas.width/6); x1=round((k+1)*atlas.width/6)
        cell=atlas.crop((x0,y0,x1,y1))
        # Keep common cell origins and scale rather than resizing each pose to fit.
        cell=cell.resize((round(cell.width*.64),round(cell.height*.64)),Image.Resampling.LANCZOS)
        row.append(cell)
    poses.append(row)

frames=[]
for n in range(60):
    t=n*.05
    idx=next((i for i,end in enumerate([.6,.72,.86,1.02,1.2,3.0]) if t<end),5)
    opacity=1 if t<1.8 else max(0,1-(t-1.8)/.35)
    state='ALIVE' if t<.6 else 'DEFEATED' if t<1.8 else 'CLEARING' if t<2.15 else 'REPLAYING SHORTLY'
    im=Image.new('RGBA',(960,520),'#111c1b'); d=ImageDraw.Draw(im)
    d.text((28,18),'Enemy death sequences | approval study 02',font=title,fill='#f1e7cf')
    d.text((28,59),'Six distinct poses per enemy, followed by a short hold and cleanup fade.',font=small,fill='#b5c3b8')
    for r,(name,desc,y0,y1) in enumerate(specs):
        left=20+r*315; mid=left+145
        d.rounded_rectangle((left,99,left+300,470),radius=12,fill='#1e2d28',outline='#3b4b40')
        d.text((left+17,114),name,font=font,fill='#f1e7cf')
        d.text((left+17,141),desc,font=small,fill='#b5c3b8')
        d.ellipse((mid-90,326,mid+90,345),fill='#354135')
        sprite=poses[r][idx].copy()
        if opacity<1: sprite.putalpha(sprite.getchannel('A').point(lambda a:round(a*opacity)))
        im.alpha_composite(sprite,(mid-sprite.width//2,340-sprite.height))
        tiny=sprite.resize((round(sprite.width*.44),round(sprite.height*.44)),Image.Resampling.LANCZOS)
        im.alpha_composite(tiny,(mid-tiny.width//2,437-tiny.height))
        d.text((left+17,449),'Gameplay-size check',font=small,fill='#9eafa2')
    d.text((28,488),state,font=small,fill='#e7b96f')
    frames.append(im.convert('RGB').quantize(colors=192))
out=ROOT/'previews/enemy-deaths-v1.gif'
frames[0].save(out,save_all=True,append_images=frames[1:],duration=50,loop=0,disposal=2,optimize=False)
check=Image.open(out)
assert check.info['loop']==0
assert sum(check.seek(i) or check.info.get('duration',0) for i in range(check.n_frames))==3000
frames[19].convert('RGB').save(ROOT/'previews/enemy-deaths-check.png')
print(f'{out}\nVerified looping duration: 3000 ms; {out.stat().st_size:,} bytes')
