"""Animate approved sprites with small reusable runtime-style status overlays."""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
sheet=Image.open(ROOT/'art-reference/approved-elemental-sprites-v1.png').convert('RGBA')
walk=Image.open(ROOT/'art-reference/enemy-walk-candidates-v1.png').convert('RGBA')
font=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',17)
small=ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf',14)
title=ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf',25)
columns=[(20,290),(315,320),(640,250),(900,260),(1170,310),(1490,280)]
slimes=[walk.crop((x,40,x+w,330)) for x,w in columns]
fire=sheet.crop((25,795,365,1060))
water=sheet.crop((390,800,710,1060))
ice=sheet.crop((1100,800,1440,1065))

def paste(im,asset,cx,cy,width,alpha=1,angle=0):
    sp=asset.resize((max(1,round(width)),max(1,round(asset.height*width/asset.width))),Image.Resampling.LANCZOS)
    if angle:sp=sp.rotate(angle,resample=Image.Resampling.BICUBIC,expand=True)
    if alpha<1:sp.putalpha(sp.getchannel('A').point(lambda v:round(v*max(0,alpha))))
    im.alpha_composite(sp,(round(cx-sp.width/2),round(cy-sp.height/2)))

def subject(im,t,cx,base,s):
    frozen=3.2<=t<5.5
    moving_time=min(t,3.2)+max(0,t-5.5)
    cx+=s*(moving_time*9-25)
    idx=0 if frozen else int(moving_time*8)%6
    body=slimes[idx]; width=body.width/320*180*s
    height=body.height/320*180*s
    d=ImageDraw.Draw(im)
    d.ellipse((cx-65*s,base-7*s,cx+65*s,base+7*s),fill='#29392b')
    paste(im,body,cx,base-height/2,width)
    cy=base-67*s
    layer=Image.new('RGBA',im.size);p=ImageDraw.Draw(layer)
    if .8<=t<3.2:
        for j in range(5):
            phase=((t-.8)*1.5+j*.21)%1
            x=cx+(j-2)*29*s;y=base-125*s+phase*110*s
            r=3.5*s
            p.ellipse((x-r,y-r,x+r,y+r),fill=(37,201,245,210),outline=(186,248,255,240),width=max(1,round(s)))
            p.polygon([(x,y-9*s),(x-r,y),(x+r,y)],fill=(37,201,245,210))
        p.ellipse((cx-73*s,base-8*s,cx+73*s,base+5*s),outline=(89,211,248,140),width=max(1,round(2*s)))
    if frozen:
        a=min(1,(t-3.2)/.22)
        pts=[(cx-90*s,base),(cx-93*s,base-80*s),(cx-60*s,base-144*s),(cx+5*s,base-163*s),(cx+76*s,base-122*s),(cx+94*s,base-45*s),(cx+78*s,base)]
        p.polygon(pts,fill=(106,213,249,round(35*a)))
        p.line(pts+[pts[0]],fill=(168,240,255,round(230*a)),width=max(1,round(3*s)))
        for j in [0,1,2,3,4,5]:
            x,y=pts[j];p.line([(x,y),(cx+(-35 if j%2 else 48)*s,base-35*s)],fill=(176,237,255,round(80*a)),width=max(1,round(s)))
        for off,h in [(-75,29),(-53,21),(62,32),(80,20)]:
            x=cx+off*s
            p.polygon([(x-10*s,base),(x,base-h*s),(x+11*s,base-3*s)],fill=(91,181,223,225),outline=(198,246,255,245),width=max(1,round(s)))
    im.alpha_composite(layer)
    # Contact projectiles reuse pixels from the approved reference, not new enemy variants.
    for begin,asset in [(.45,water),(2.85,ice),(5.15,fire)]:
        u=(t-begin)/.35
        if 0<=u<1:
            paste(im,asset,cx-200*s*(1-u),cy-70*s*(1-u),55*s,angle=-12)
    if 5.5<=t<6.15:
        u=(t-5.5)/.65
        for j in range(8):
            a=j*math.tau/8
            x=cx+math.cos(a)*(55+110*u)*s;y=cy+math.sin(a)*(45+60*u)*s+45*u*u*s
            paste(im,ice,x,y,23*s*(1-u*.5),1-u,angle=j*48+u*100)
        puff=Image.new('RGBA',im.size);q=ImageDraw.Draw(puff)
        for j in range(5):
            x=cx+(j-2)*19*s;y=cy-30*u*s+math.sin(j)*15*s;r=(10+15*u)*s
            q.ellipse((x-r,y-r,x+r,y+r),fill=(217,235,229,round(70*(1-u))))
        im.alpha_composite(puff)

if __name__ == '__main__':
    frames=[]
    for n in range(110):
        t=n*.08
        im=Image.new('RGBA',(960,530),'#111c1b');d=ImageDraw.Draw(im)
        d.text((28,20),'Elemental contact & status effects',font=title,fill='#f1e7cf')
        d.text((28,60),'Water → soaked   |   Ice → frozen   |   Fire → shatter and movement resumes',font=small,fill='#b7c7bb')
        d.rounded_rectangle((20,105,610,410),radius=14,fill='#1e2d28',outline='#3c4c40')
        d.rounded_rectangle((625,105,940,410),radius=14,fill='#1e2d28',outline='#3c4c40')
        d.text((40,122),'DETAIL VIEW',font=small,fill='#dcb66e');d.text((645,122),'GAMEPLAY SIZE',font=small,fill='#dcb66e')
        d.line((40,362,590,362),fill='#6a6246',width=57);d.line((645,345,920,345),fill='#6a6246',width=35)
        subject(im,t,315,365,1.05);subject(im,t,775,350,.46)
        if t<.8:state='MOVING';explain='Normal movement. Water contact is approaching.';color='#bdcfb8'
        elif t<3.2:state='SOAKED';explain='Droplets persist while the enemy continues moving.';color='#58d7f1'
        elif t<5.5:state='FROZEN';explain='Water + ice succeeded. Movement and the walk cycle stop.';color='#b9ecff'
        elif t<6.15:state='SHATTERED';explain='Fire breaks the freeze. Ice shards and a brief steam puff.';color='#f5bf75'
        else:state='MOVING AGAIN';explain='Freeze is consumed. The surviving enemy resumes movement.';color='#bdcfb8'
        d=ImageDraw.Draw(im);d.text((30,434),state,font=font,fill=color);d.text((30,466),explain,font=small,fill='#b7c7bb')
        d.text((30,503),'Effect treatment for approval · original slime artwork preserved · looping demonstration',font=small,fill='#92a99b')
        frames.append(im.convert('RGB').quantize(colors=192))
    out=ROOT/'previews/status-combos-v1.gif'
    frames[0].save(out,save_all=True,append_images=frames[1:],duration=80,loop=0,disposal=2)
    frames[50].convert('RGB').save(ROOT/'previews/status-combos-check.png')
    check=Image.open(out);assert check.info['loop']==0
    total=0
    for i in range(check.n_frames):check.seek(i);total+=check.info['duration']
    assert total==8800
    print(f'{out}\nVerified {total}ms loop; {out.stat().st_size:,} bytes')
