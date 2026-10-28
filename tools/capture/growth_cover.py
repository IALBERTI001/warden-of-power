# Growth cover: the same Fire tower at Tier I and Tier III, real frames, title and labels in Lilita One.
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
F='/home/claude/warden-of-power/game/assets/fonts/LilitaOne-Regular.ttf'
a=Image.open('seg/BL2/f0010.jpg').convert('RGB'); b=Image.open('seg/BL2/f0079.jpg').convert('RGB')
crop=(300,300,900,1080)  # the tower, below the old capture label
A=ImageEnhance.Color(a.crop(crop)).enhance(1.1); B=ImageEnhance.Color(b.crop(crop)).enhance(1.15)
def font(s): return ImageFont.truetype(F,s)
def text(d,xy,t,s,fill=(255,224,138),stroke=(40,20,10),anchor='mm'):
    d.text(xy,t,font=font(s),fill=fill,stroke_width=max(3,s//9),stroke_fill=stroke,anchor=anchor)
def panel(im,w,h,contain=False):
    if contain:
        base=im.resize((w,h)).filter(ImageFilter.GaussianBlur(18));s=h/im.height;fit=im.resize((round(im.width*s),h),Image.LANCZOS);base.paste(fit,((w-fit.width)//2,0))
        m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=min(w,h)//14,fill=255); return base,m
    s=max(w/im.width,h/im.height); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    x=(im.width-w)//2; y=(im.height-h)//2; im=im.crop((x,y,x+w,y+h))
    m=Image.new('L',(w,h),0); ImageDraw.Draw(m).rounded_rectangle((0,0,w-1,h-1),radius=min(w,h)//14,fill=255); return im,m
def arrow(d,cx,cy,s,vertical=False):
    if vertical: pts=[(cx-s*.5,cy-s*.35),(cx+s*.5,cy-s*.35),(cx+s*.5,cy+s*.05),(cx+s*.85,cy+s*.05),(cx,cy+s*.7),(cx-s*.85,cy+s*.05),(cx-s*.5,cy+s*.05)]
    else: pts=[(cx-s*.7,cy-s*.3),(cx,cy-s*.3),(cx,cy-s*.75),(cx+s*.8,cy),(cx,cy+s*.75),(cx,cy+s*.3),(cx-s*.7,cy+s*.3)]
    d.polygon(pts,fill=(255,211,107),outline=(40,20,10),width=max(4,int(s*.08)))
def make(W,H,out,layout):
    bg=b.resize((W,H)) if W/H>1 else b.crop((420,0,420+int(1080*W/H),1080)).resize((W,H))
    bg=ImageEnhance.Brightness(bg.filter(ImageFilter.GaussianBlur(min(W,H)//40))).enhance(.45)
    d=ImageDraw.Draw(bg)
    if layout=='L':
        pw,ph=int(W*.33),int(H*.70); y=int(H*.24); x1=int(W*.12); x2=W-x1-pw
        for im,x,lab in ((A,x1,'TIER I'),(B,x2,'TIER III')):
            p,m=panel(im,pw,ph); bg.paste(p,(x,y),m); d.rounded_rectangle((x,y,x+pw,y+ph),radius=min(pw,ph)//14,outline=(255,211,107),width=6)
            text(d,(x+pw//2,y+ph-int(H*.06)),lab,int(H*.075))
        arrow(d,W//2,y+ph//2,int(H*.09))
        text(d,(W//2,int(H*.11)),'WARDEN OF POWER',int(H*.12))
    elif layout=='P':
        pw,ph=int(W*.70),int(H*.35); x=(W-pw)//2; y1=int(H*.195); y2=H-ph-int(H*.035)
        for im,y,lab in ((A,y1,'TIER I'),(B,y2,'TIER III')):
            p,m=panel(im.crop((60,40,540,700)),pw,ph,contain=True); bg.paste(p,(x,y),m); d.rounded_rectangle((x,y,x+pw,y+ph),radius=min(pw,ph)//14,outline=(255,211,107),width=5)
            text(d,(W//2,y+ph-int(H*.035)),lab,int(W*.09))
        arrow(d,W//2,(y1+ph+y2)//2-int(H*.02),int(W*.09),vertical=True)
        text(d,(W//2,int(H*.065)),'WARDEN',int(W*.17)); text(d,(W//2,int(H*.14)),'OF POWER',int(W*.10))
    else:
        pw,ph=int(W*.42),int(H*.64); y=int(H*.29); x1=int(W*.04); x2=W-x1-pw
        for im,x,lab in ((A,x1,'TIER I'),(B,x2,'TIER III')):
            p,m=panel(im,pw,ph); bg.paste(p,(x,y),m); d.rounded_rectangle((x,y,x+pw,y+ph),radius=min(pw,ph)//14,outline=(255,211,107),width=5)
            text(d,(x+pw//2,y+ph-int(H*.06)),lab,int(W*.075))
        arrow(d,W//2,y+ph//2,int(W*.075))
        text(d,(W//2,int(H*.09)),'WARDEN',int(W*.15)); text(d,(W//2,int(H*.2)),'OF POWER',int(W*.09))
    bg.save(out,quality=93)
make(1920,1080,'new/growth-landscape-1920x1080.jpg','L')
make(800,1200,'new/growth-portrait-800x1200.jpg','P')
make(800,800,'new/growth-square-800x800.jpg','S')
make(1600,1000,'new/growth-freeplay-1600x1000.jpg','L')
