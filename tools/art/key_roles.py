import numpy as np, json
from PIL import Image
from scipy import ndimage as nd
a=np.asarray(Image.open('role-sheet-raw.png').convert('RGB')).astype(np.float32)
r,g,b=a[...,0],a[...,1],a[...,2]
# magenta-ness: how much r and b exceed g
m=np.minimum(r,b)-g
d=np.maximum(np.maximum(255-r,255-b),g)
alpha=np.clip((d-45)/(105-45),0,1)
# remove isolated specks / fill holes
fg=alpha>0.5
lab,n=nd.label(fg)
# despill
core=nd.binary_erosion(alpha>0.98,iterations=3)
near=np.clip(1-np.abs(r-b)/60,0,1)
sp=np.clip(m-5,0,None)*(~core)*near
o=a.copy(); o[...,0]-=sp; o[...,2]-=sp
mm=np.clip(np.minimum(o[...,0],o[...,2])-o[...,1],0,None)
row=np.zeros(mm.shape,bool);row[:768]=True
o[...,0]-=mm*row;o[...,2]-=mm*row
speck=row&(r>150)&(b>150)&(g<110)
alpha[speck]=0
o[768:]=a[768:]
o=np.clip(o,0,255)
filled=np.zeros_like(alpha,bool)
for ri in range(3,4):
  for c in range(6):
    sl=(slice(ri*256,(ri+1)*256),slice(c*256,(c+1)*256)); filled[sl]=nd.binary_fill_holes(alpha[sl]>0.5)
hole=filled&(alpha<0.5)
alpha=np.where(filled,np.maximum(alpha,0.999),alpha)
o[hole]=a[hole]
alpha=nd.gaussian_filter(alpha,0.6)
rows=['shield','diver','runner','splitter']; meta={}
TH=150
frames=[]
for ri,name in enumerate(rows):
    boxes=[]
    for c in range(6):
        al=alpha[ri*256:(ri+1)*256,c*256:(c+1)*256]
        mk=al>0.15
        # keep components bigger than 30px
        l,k=nd.label(mk); s=nd.sum(mk,l,range(1,k+1)); keep=np.isin(l,[i+1 for i,z in enumerate(s) if z>=30])
        ys,xs=np.where(keep); boxes.append((xs.min(),ys.min(),xs.max()+1,ys.max()+1))
    x0=min(b[0] for b in boxes)-3;y0=min(b[1] for b in boxes)-3;x1=max(b[2] for b in boxes)+3;y1=max(b[3] for b in boxes)+3
    x0,y0=max(0,x0),max(0,y0);x1,y1=min(256,x1),min(256,y1)
    meta[name]={'w':int(x1-x0),'h':int(y1-y0),'frames':[[int(b[0]-x0),int(b[2]-x0)] for b in boxes]}
    for c in range(6):
        sl=(slice(ri*256+y0,ri*256+y1),slice(c*256+x0,c*256+x1))
        rgba=np.dstack([o[sl],alpha[sl]*255]).astype(np.uint8)
        frames.append((name,c,Image.fromarray(rgba,'RGBA')))
# pack: each row height = its h, width 6*w
W=max(6*meta[n]['w'] for n in rows); H=sum(meta[n]['h'] for n in rows)
sheet=Image.new('RGBA',(W,H)); y=0
for n in rows:
    meta[n]['y']=y
    for name,c,im in frames:
        if name==n: sheet.paste(im,(c*meta[n]['w'],y))
    y+=meta[n]['h']
sheet.save('enemy-roles.png',optimize=True); json.dump(meta,open('roles-meta.json','w'))
print(sheet.size, json.dumps(meta))
prev=Image.new('RGBA',sheet.size,(60,90,60,255)); prev.alpha_composite(sheet); prev.convert('RGB').save('roles-preview.jpg',quality=88)
