# title.py IN OUT W H  — crop/scale frame to WxH (cover), add vignette + "Warden of Power" title in Warden Quill
import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
src,out,W,H=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4])
fx=float(sys.argv[5]) if len(sys.argv)>5 else .5; fy=float(sys.argv[6]) if len(sys.argv)>6 else .5
FONT='/home/claude/wop/site/game/assets/fonts/warden-quill.ttf'
im=Image.open(src).convert('RGB')
s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
x=int((im.width-W)*fx); y=int((im.height-H)*fy); im=im.crop((x,y,x+W,y+H))
im=ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.12)).enhance(1.05)
# top darkening band for the title + soft edge vignette
ov=Image.new('L',(W,H),0); d=ImageDraw.Draw(ov)
band=int(H*(.42 if W>H*1.2 else .36 if W>=H else .3))
for i in range(band): d.line([(0,i),(W,i)],fill=int(225*(1-i/band)**1.3))
vig=Image.new('L',(W,H),0); dv=ImageDraw.Draw(vig); dv.ellipse((-W*.25,-H*.25,W*1.25,H*1.25),fill=255); vig=vig.filter(ImageFilter.GaussianBlur(min(W,H)*.12))
dark=Image.new('RGB',(W,H),(14,9,20))
im=Image.composite(dark,im,ov); im=Image.composite(im,dark,vig.point(lambda v:int(70+v*185/255)))
# title
lines=['WARDEN','OF POWER']
size=int(min(W*.16,H*.19)) if W>H*1.2 else int(W*(.2 if W>=H else .19))
f=ImageFont.truetype(FONT,size); f2=ImageFont.truetype(FONT,int(size*.5))
fonts=[f,f2] if len(lines)==2 else [f]
d=ImageDraw.Draw(im)
ty=int(H*.035)
layers=[]
for ln,ft in zip(lines,fonts):
    w=d.textlength(ln,font=ft); layers.append((ln,ft,(W-w)/2,ty)); ty+=int(ft.size*1.02)
glow=Image.new('L',(W,H),0); g=ImageDraw.Draw(glow)
for ln,ft,tx,yy in layers: g.text((tx,yy),ln,font=ft,fill=255,stroke_width=max(4,ft.size//10),stroke_fill=255)
glow=glow.filter(ImageFilter.GaussianBlur(max(6,size//9)))
im=Image.composite(Image.new('RGB',(W,H),(255,170,60)),im,glow.point(lambda v:int(v*.75)))
d=ImageDraw.Draw(im)
for ln,ft,tx,yy in layers:
    d.text((tx,yy+max(3,ft.size//22)),ln,font=ft,fill=(40,20,10),stroke_width=max(4,ft.size//12),stroke_fill=(40,20,10))
    # gold gradient fill
    m=Image.new('L',(W,H),0); ImageDraw.Draw(m).text((tx,yy),ln,font=ft,fill=255)
    grad=Image.new('RGB',(W,H)); gd=ImageDraw.Draw(grad)
    for i in range(int(yy),int(yy+ft.size*1.1)):
        u=(i-yy)/(ft.size*1.1); c=(255,int(236-u*70),int(150-u*120)); gd.line([(0,i),(W,i)],fill=c)
    im=Image.composite(grad,im,m); d=ImageDraw.Draw(im)
    d.text((tx,yy),ln,font=ft,fill=None,stroke_width=max(2,ft.size//40),stroke_fill=(90,50,20)) if False else None
im.save(out,quality=94)
