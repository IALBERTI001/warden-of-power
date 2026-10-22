import json,sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
m=json.load(open('manifest.json'));out=Path(sys.argv[1]);dst=sys.argv[2]
ids=[e[0] for e in m['emblems'] if (out/f'{e[0]}-256.png').exists()]
names={e[0]:(e[1],e[2]) for e in m['emblems']}
cols=7;cw,ch=220,250;rows=(len(ids)+cols-1)//cols
c=Image.new('RGBA',(cols*cw,rows*ch),(30,24,40,255));d=ImageDraw.Draw(c)
try: f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',13)
except: f=None
for i,eid in enumerate(ids):
    x,y=(i%cols)*cw,(i//cols)*ch
    b=Image.open(out/f'{eid}-256.png').convert('RGBA').resize((150,150),Image.LANCZOS);c.alpha_composite(b,(x+10,y+10))
    s64=Image.open(out/f'{eid}-128.png').convert('RGBA').resize((64,64),Image.LANCZOS);c.alpha_composite(s64,(x+165,y+20))
    s32=Image.open(out/f'{eid}-128.png').convert('RGBA').resize((32,32),Image.LANCZOS);c.alpha_composite(s32,(x+181,y+100))
    d.text((x+10,y+170),names[eid][0],fill='white',font=f);d.text((x+10,y+190),names[eid][1],fill=(200,180,140),font=f)
c.convert('RGB').save(dst)
