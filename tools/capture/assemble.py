import os,sys,json,shutil
from PIL import Image
asp=sys.argv[1]; W,H=(1920,1080) if asp=='L' else (1080,1620)
out=f'final{asp}'; shutil.rmtree(out,ignore_errors=True); os.makedirs(out)
BOX={'moonwell':[0,0,576,416],'emberheart':[640,0,1136,352],'rimeglass':[0,400,512,896],'stormcrown':[864,192,1280,640],'atelier':[704,544,1152,864],'aetherheart':[416,224,832,608]}
hublog=json.load(open('seg/H/log.json'))
def fit(im):
    if im.size==(W,H): return im
    s=max(W/im.width,H/im.height); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    x=(im.width-W)//2;y=(im.height-H)//2; return im.crop((x,y,x+W,y+H))
def hubframe(i):
    im=Image.open(f'seg/H/f{i:04d}.jpg')
    if asp=='L': return fit(im)
    cw=round(1024*W/H); seg=[s for s in hublog if s[1]<=i<s[2]][0]; name=seg[0]
    cx=768 if name=='hold' else (BOX[name][0]+BOX[name][2])/2
    if name=='aetherheart' or name=='hold': cx=624
    x=int(max(0,min(1536-cw,cx-cw/2))); return im.crop((x,0,x+cw,1024)).resize((W,H),Image.LANCZOS)
segs=[]
cov=Image.open('out/cover-landscape-1920x1080.jpg' if asp=='L' else 'out/_cover-p-1080x1620.jpg')
segs.append([cov]*21)
segs.append([f'{asp}/f{i:04d}.jpg' for i in range(0,110)])
segs.append([f'seg/B{asp}2/f{i:04d}.jpg' for i in range(0,81)])
for k in 'CDE': segs.append([f'seg/{k}{asp}/f{i:04d}.jpg' for i in range(0,28)])
segs.append([f'{asp}/f{i:04d}.jpg' for i in range(390,455)])
segs.append([('hub',i) for i in range(0,159)]+[('hub',158)]*20)
def load(x):
    if isinstance(x,Image.Image): return fit(x.convert('RGB'))
    if isinstance(x,tuple): return hubframe(x[1]).convert('RGB')
    return fit(Image.open(x).convert('RGB'))
n=0;prev_tail=None;FADE=6
for si,s in enumerate(segs):
    frames=[load(x) for x in s]
    if prev_tail is not None:
        for j in range(FADE):
            a=(j+1)/(FADE+1); frames[j]=Image.blend(prev_tail[j],frames[j],a)
    keep=frames if si==len(segs)-1 else frames[:-FADE]
    prev_tail=frames[-FADE:]
    for fr in keep: fr.save(f'{out}/f{n:04d}.jpg',quality=93); n+=1
print(asp,n,'frames',n/30,'s')
