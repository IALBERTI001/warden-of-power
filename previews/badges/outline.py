import json,math,sys,os
import numpy as np,cv2
from PIL import Image,ImageDraw,ImageFilter,ImageEnhance
B='/home/claude/warden-of-power/previews/badges/'
S=1024
man=json.load(open(B+'manifest.json'))
TIER={e[0]:e[2].lower() for e in man['emblems']}
def inner_radius(frame):
    a=np.asarray(frame)[...,3];c=S//2;radii=[]
    for k in range(72):
        ang=k*math.pi/36
        for r in range(40,S//2):
            x,y=int(c+r*math.cos(ang)),int(c+r*math.sin(ang))
            if a[y,x]>160:radii.append(r);break
    return int(np.percentile(radii,10))
FR={}
for f in man['frames']:
    fr=Image.open(B+f"src/{f['id']}.png").convert('RGBA').resize((S,S),Image.LANCZOS);FR[f['tier'].lower()]=(fr,inner_radius(fr))
def emblem_box(em):
    a=np.asarray(em)[...,3];ys,xs=np.where(a>128);x0,x1,y0,y1=xs.min(),xs.max(),ys.min(),ys.max()
    r=max(x1-x0,y1-y0)/2;cx,cy=(x0+x1)/2,(y0+y1)/2;i=r*.97;return (int(cx-i),int(cy-i),int(cx+i),int(cy+i))
def build(eid,cut_path,out_dir,outline_px=11,dim=.55):
    frame,rin=FR[TIER[eid]];radius=rin+22
    em=Image.open(B+f'src/{eid}.png').convert('RGBA').resize((S,S),Image.LANCZOS);box=emblem_box(em)
    base=Image.open(B+f'out/{eid}-1024.png').convert('RGBA')
    cut=Image.open(cut_path).convert('RGBA').resize((S,S),Image.LANCZOS).crop(box).resize((2*radius,2*radius),Image.LANCZOS)
    face=base.crop((S//2-radius,S//2-radius,S//2+radius,S//2+radius))
    # calmer background: blur, darken, desaturate
    bg=face.filter(ImageFilter.GaussianBlur(7));rgb=ImageEnhance.Brightness(ImageEnhance.Color(bg.convert('RGB')).enhance(.7)).enhance(dim)
    bg=rgb.convert('RGBA');bg.putalpha(face.getchannel('A'))
    a=np.asarray(cut.getchannel('A'))
    a=np.where(a>40,255,0).astype(np.uint8)
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*outline_px+1,2*outline_px+1))
    ring=cv2.GaussianBlur(cv2.dilate(a,k),(0,0),1.2)
    glow=cv2.GaussianBlur(cv2.dilate(a,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*outline_px+15,2*outline_px+15))),(0,0),6)
    comp=bg.copy()
    halo=Image.new('RGBA',comp.size,(255,240,200,0));halo.putalpha(Image.fromarray((glow*0.35).astype(np.uint8)));comp.alpha_composite(halo)
    ol=Image.new('RGBA',comp.size,(18,10,22,0));ol.putalpha(Image.fromarray(ring));comp.alpha_composite(ol)
    comp.alpha_composite(cut)
    # keep face circular
    m=Image.new('L',(2*radius*4,)*2,0);ImageDraw.Draw(m).ellipse((0,0,8*radius-1,8*radius-1),fill=255);m=m.resize((2*radius,)*2,Image.LANCZOS)
    comp.putalpha(Image.fromarray(np.minimum(np.asarray(comp.getchannel('A')),np.asarray(m))))
    canvas=base.copy();canvas.alpha_composite(comp,(S//2-radius,S//2-radius));canvas.alpha_composite(frame)
    os.makedirs(out_dir,exist_ok=True);canvas.save(f'{out_dir}/{eid}-1024.png')
    for s in (256,128):canvas.resize((s,s),Image.LANCZOS).save(f'{out_dir}/{eid}-{s}.png',optimize=True)
    return canvas

def build_whole(name,badge_img,cut_img,bbox,out_dir,face_ratio=.67,outline_px=11,dim=.55):
    """Badges painted with their frame: crop both to the badge's bbox, square-pad, rebuild the inner face."""
    def norm(im):
        im=im.convert('RGBA').crop(bbox);s=max(im.size);c=Image.new('RGBA',(s,s),(0,0,0,0));c.paste(im,((s-im.size[0])//2,(s-im.size[1])//2));return c.resize((S,S),Image.LANCZOS)
    base=norm(badge_img);cut=norm(cut_img)
    R=int(face_ratio*S/2);box=(S//2-R,S//2-R,S//2+R,S//2+R)
    face=base.crop(box);cutf=cut.crop(box)
    bg=face.filter(ImageFilter.GaussianBlur(7));bg=ImageEnhance.Brightness(ImageEnhance.Color(bg.convert('RGB')).enhance(.7)).enhance(dim).convert('RGBA')
    a=np.where(np.asarray(cut.getchannel('A'))>40,255,0).astype(np.uint8)
    k=cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*outline_px+1,2*outline_px+1))
    ring=cv2.GaussianBlur(cv2.dilate(a,k),(0,0),1.2);glow=cv2.GaussianBlur(cv2.dilate(a,cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(2*outline_px+15,)*2)),(0,0),6)
    # face: dimmed background inside the circle (feathered), original frame outside
    m=Image.new('L',(S,S),0);ImageDraw.Draw(m).ellipse((S//2-R,S//2-R,S//2+R,S//2+R),fill=255);m=m.filter(ImageFilter.GaussianBlur(3))
    bgfull=base.copy();bgfull.paste(bg,box[:2]);canvas=Image.composite(bgfull,base,m)
    halo=Image.new('RGBA',(S,S),(255,240,200,0));halo.putalpha(Image.fromarray((glow*0.35).astype(np.uint8)));canvas.alpha_composite(halo)
    ol=Image.new('RGBA',(S,S),(18,10,22,0));ol.putalpha(Image.fromarray(ring));canvas.alpha_composite(ol)
    canvas.alpha_composite(cut)
    os.makedirs(out_dir,exist_ok=True);canvas.save(f'{out_dir}/{name}-1024.png')
    for s in (256,128):canvas.resize((s,s),Image.LANCZOS).save(f'{out_dir}/{name}-{s}.png',optimize=True)
    return canvas
