"""Runtime-style overlays; preserves previously approved sprite and effect designs."""
import math
from PIL import Image, ImageDraw
from build_status_preview import ROOT, slimes, paste, subject, ice, font, small, title

def body(im,t,x,b,s=0.65,rate=1):
    sp=slimes[int(t*8*rate)%6]
    w=sp.width/320*180*s; h=sp.height/320*180*s
    d=ImageDraw.Draw(im);d.ellipse((x-60*s,b-5*s,x+60*s,b+5*s),fill='#29392b')
    paste(im,sp,x,b-h/2,w)

def snow(p,x,y,r,alpha=230):
    for a in [0,math.pi/3,2*math.pi/3]:
        dx=math.cos(a)*r;dy=math.sin(a)*r
        p.line((x-dx,y-dy,x+dx,y+dy),fill=(182,232,255,alpha),width=2)

def overlay(im,kind,t,x,b,s=.65):
    layer=Image.new('RGBA',im.size);p=ImageDraw.Draw(layer)
    if kind=='burning':
        for j in range(8):
            u=(t*.9+j*.137)%1
            px=x+math.sin(j*2.1+u)*65*s;py=b-12*s-u*135*s
            r=(3-1.4*u)*s
            p.ellipse((px-r,py-r,px+r,py+r*2),fill=(255,147+int(70*u),52,round(230*(1-u))))
        a=35+int(20*math.sin(t*5))
        p.ellipse((x-65*s,b-9*s,x+65*s,b+5*s),outline=(255,133,47,a+70),width=2)
        # Small fire-shaped status marker, separate from the readable enemy sprite.
        px=x;py=b-140*s
        p.polygon([(px-5,py+6),(px-7,py),(px-2,py-4),(px,py-11),(px+6,py-2),(px+6,py+5),(px,py+9)],fill=(255,159,54,245))
    elif kind=='soaked':
        for j in range(5):
            u=(t*1.5+j*.21)%1;px=x+(j-2)*29*s;py=b-125*s+u*110*s;r=3.5*s
            p.ellipse((px-r,py-r,px+r,py+r),fill=(37,201,245,210),outline=(186,248,255,240))
            p.polygon([(px,py-9*s),(px-r,py),(px+r,py)],fill=(37,201,245,210))
        px=x;py=b-140*s
        p.polygon([(px,py-9),(px-6,py+2),(px,py+8),(px+6,py+2)],fill=(48,205,247,245),outline=(178,243,255,255))
    elif kind=='chilled':
        p.ellipse((x-70*s,b-8*s,x+70*s,b+6*s),outline=(143,216,246,190),width=2)
        for j in range(5):
            px=x+(j-2)*27*s;py=b-8*s
            p.polygon([(px-5*s,py+4*s),(px,py-13*s),(px+5*s,py+4*s)],fill=(136,210,236,180))
        snow(p,x,b-140*s,7)
    im.alpha_composite(layer)

def recovery(im,t,x,b,s=.65):
    """4-second monotonic countdown; symbol disappears at expiry."""
    if not 0<=t<4:return
    layer=Image.new('RGBA',im.size);p=ImageDraw.Draw(layer)
    y=b-140*s;alpha=round(230*(1-t/4))
    snow(p,x,y,7,alpha)
    p.arc((x-13,y-13,x+13,y+13),-90,-90+360*(1-t/4),fill=(183,224,236,180),width=2)
    p.line((x-8,y+9,x+8,y-9),fill=(236,191,113,alpha),width=2)
    im.alpha_composite(layer)

def new_canvas(heading,sub,height):
    im=Image.new('RGBA',(960,height),'#111c1b');d=ImageDraw.Draw(im)
    d.text((25,18),heading,font=title,fill='#f1e7cf');d.text((25,59),sub,font=small,fill='#adbfaf')
    return im

def panel(im,box,name,desc):
    d=ImageDraw.Draw(im);d.rounded_rectangle(box,radius=12,fill='#1e2d28',outline='#3c4c40')
    x,y,xx,yy=box;d.text((x+16,y+13),name,font=font,fill='#f1e7cf');d.text((x+16,y+40),desc,font=small,fill='#adbfaf')

def save(frames,name,expected):
    out=ROOT/'previews'/name
    frames[0].save(out,save_all=True,append_images=frames[1:],duration=80,loop=0,disposal=2)
    gif=Image.open(out);total=0
    for i in range(gif.n_frames):gif.seek(i);total+=gif.info['duration']
    assert total==expected and gif.info['loop']==0
    print(f'{name}: verified {total}ms; {out.stat().st_size:,} bytes')

status_frames=[];combo_frames=[]
for n in range(100):
    t=n*.08
    im=new_canvas('Enemy statuses | full effect gallery','Original enemy artwork with reusable overlays. Enlarged + gameplay-size views.',650)
    labels=[('Burning','Rising embers + warm pulse','burning'),('Soaked','Droplets + water marker','soaked'),('Chilled','Frost at feet + slower movement','chilled'),('Frozen → recovery','1.5s frozen, then 4s freeze resistance','frozen')]
    for i,(name,desc,kind) in enumerate(labels):
        x=20+(i%2)*475;y=95+(i//2)*270
        panel(im,(x,y,x+460,y+255),name,desc)
        for xx,b,s in [(x+145,y+224,.88),(x+365,y+224,.40)]:
            if kind=='frozen':
                if t<1.5:subject(im,3.2+t,xx-3.8*s,b,s)
                else:
                    body(im,t-1.5,xx,b,s);recovery(im,t-1.5,xx,b,s)
            else:
                rate=.5 if kind=='chilled' else 1
                # Progression advances visibly across the short lane; chill is slower.
                xx+=((t*rate)%4-2)*7*s
                body(im,t,xx,b,s,rate);overlay(im,kind,t,xx,b,s)
        d=ImageDraw.Draw(im)
        if kind=='frozen':
            label=f'Frozen: {max(0,1.5-t):.1f}s' if t<1.5 else f'Freeze resistance: {5.5-t:.1f}s' if t<5.5 else 'Can be frozen again'
            d.text((x+16,y+64),label,font=small,fill='#a5d8e6')
    status_frames.append(im.convert('RGB').quantize(colors=192))

    im=new_canvas('Combo feedback & freeze recovery','Conduction is an instant attack effect; recovery is a temporary status.',735)
    panel(im,(20,95,940,287),'Water + lightning | conduction','The arc connects actual targets; no lasting lightning status or stun.')
    beat=t%2.0; xs=[320,520,720]
    for j,x in enumerate(xs):body(im,t,x,259,.58);overlay(im,'soaked',t+j,x,259,.58)
    if .55<=beat<.85:
        layer=Image.new('RGBA',im.size);p=ImageDraw.Draw(layer)
        for j in range(2):
            pts=[]
            for k in range(9):pts.append((xs[j]+200*k/8,216+(0 if k in (0,8) else math.sin(k*19+n*3)*12)))
            p.line(pts,fill=(139,63,230,160),width=8);p.line(pts,fill=(196,143,255,245),width=4);p.line(pts,fill=(248,230,255,255),width=1)
        for x in xs:
            for j in range(5):
                a=j*math.tau/5+t*12
                p.line((x,216,x+math.cos(a)*17,216+math.sin(a)*17),fill=(226,188,255,220),width=2)
        im.alpha_composite(layer)
    panel(im,(20,300,940,493),'Fire + ice | shatter','Ice breaks, steam releases, movement resumes and freeze resistance begins.')
    local=t%4
    if local<1.5:subject(im,3.2+local,465,473,.70)
    else:
        subject(im,5.5+(local-1.5),465,473,.70)
        recovery(im,local-1.5,465+(max(0,local-1.5)*9+3.8)*.70,473,.70)
    panel(im,(20,506,940,710),'After thawing | freeze recovery','A fading crossed frost marker and countdown ring show the 4-second recovery.')
    if t<1.5:subject(im,3.2+t,465-3.8*.7,686,.70)
    else:
        body(im,t-1.5,465,686,.70);recovery(im,t-1.5,465,686,.70)
    d=ImageDraw.Draw(im)
    label=f'Frozen · {1.5-t:.1f}s remaining' if t<1.5 else f'Resists another freeze · {5.5-t:.1f}s' if t<5.5 else 'Recovery ended · eligible for another water + ice freeze'
    d.text((40,574),label,font=small,fill='#d9bd88')
    combo_frames.append(im.convert('RGB').quantize(colors=192))

save(status_frames,'all-status-effects-v1.gif',8000)
save(combo_frames,'all-combo-effects-v1.gif',8000)
status_frames[8].convert('RGB').save(ROOT/'previews/all-status-effects-check.png')
combo_frames[8].convert('RGB').save(ROOT/'previews/all-combo-effects-check.png')
