import json, sys, math, numpy as np, cv2
from skimage.graph import route_through_array
from sklearn.ensemble import RandomForestClassifier
R=json.load(open('routes.json'))
def feats(img):
    lab=cv2.cvtColor(img,cv2.COLOR_RGB2LAB).astype(np.float32)
    blur=cv2.GaussianBlur(lab,(0,0),3);std=np.sqrt(np.maximum(cv2.GaussianBlur(lab**2,(0,0),3)-blur**2,0))
    return np.concatenate([lab,blur,std],axis=2)
def band(paths,w,shape):
    m=np.zeros(shape,np.uint8)
    for p in paths:cv2.polylines(m,[np.int32(np.round(p))],False,1,thickness=int(w))
    return m.astype(bool)
def trace(k,starts=None,show=True):
    img=cv2.cvtColor(cv2.imread(f'maps/{k}.jpg'),cv2.COLOR_BGR2RGB);img=cv2.resize(img,(1000,600),interpolation=cv2.INTER_AREA)
    H,W=600,1000;F=feats(img);paths=[np.array(p) for p in R[k]['paths']]
    near=band(paths,20,(H,W));wide=band(paths,240,(H,W))
    rect=np.zeros((H,W),bool);rect[96:505,40:960]=True
    far=rect&~wide
    rng=np.random.default_rng(0)
    pos=np.argwhere(near&rect);neg=np.argwhere(far)
    pos=pos[rng.choice(len(pos),min(6000,len(pos)),replace=False)];neg=neg[rng.choice(len(neg),min(6000,len(neg)),replace=False)]
    X=np.concatenate([F[pos[:,0],pos[:,1]],F[neg[:,0],neg[:,1]]]);y=np.r_[np.ones(len(pos)),np.zeros(len(neg))]
    clf=RandomForestClassifier(60,max_depth=12,n_jobs=-1,random_state=0).fit(X,y)
    prob=clf.predict_proba(F.reshape(-1,F.shape[2]))[:,1].reshape(H,W)
    prob=cv2.GaussianBlur(prob.astype(np.float32),(0,0),2)
    road=(prob>.5).astype(np.uint8);road=cv2.morphologyEx(road,cv2.MORPH_OPEN,np.ones((5,5),np.uint8));road=cv2.morphologyEx(road,cv2.MORPH_CLOSE,np.ones((9,9),np.uint8))
    dist=cv2.distanceTransform(road,cv2.DIST_L2,5)
    cost=1.0/(1.0+dist)**2+ (1-prob)*2+0.002
    out=[]
    for i,p in enumerate(paths):
        end=tuple(np.clip(np.round(p[-1]),[0,0],[W-1,H-1]).astype(int))
        s=starts[i] if starts and starts[i] else tuple(np.clip(np.round(p[0]),[1,1],[W-2,H-2]).astype(int))
        idx,c=route_through_array(cost,(s[1],s[0]),(end[1],end[0]),fully_connected=True,geometric=True)
        pts=np.array([(x,y) for y,x in idx],np.float32)
        simp=cv2.approxPolyDP(pts.reshape(-1,1,2),1.5,False).reshape(-1,2)
        out.append(simp)
    # buildable floor: far-from-road class trained the other way (floor vs everything else at the map edges)
    return img,prob,road,out
if __name__=='__main__':
    for k in sys.argv[1:]:
        img,prob,road,out=trace(k)
        vis=img.copy()
        for p in R[k]['paths']:cv2.polylines(vis,[np.int32(p)],False,(255,0,0),2)
        for p in out:cv2.polylines(vis,[np.int32(p)],False,(0,255,0),3)
        cv2.imwrite(f'trace-{k}.jpg',cv2.cvtColor(np.concatenate([vis,cv2.cvtColor((road*255).astype(np.uint8),cv2.COLOR_GRAY2RGB)],1),cv2.COLOR_RGB2BGR))
        print(k,[len(p) for p in out],[round(float(np.sum(np.linalg.norm(np.diff(p,axis=0),axis=1)))) for p in out])

def resample(p,step=4):
    p=np.asarray(p,float);d=np.r_[0,np.cumsum(np.linalg.norm(np.diff(p,axis=0),axis=1))];t=np.arange(0,d[-1],step)
    return np.c_[np.interp(t,d,p[:,0]),np.interp(t,d,p[:,1])]
def smooth_line(p,win=9):
    k=np.ones(win)/win;pad=win//2;q=np.pad(p,((pad,pad),(0,0)),mode='edge');return np.c_[np.convolve(q[:,0],k,'valid'),np.convolve(q[:,1],k,'valid')]
def centre(p,prob,iters=3):
    H,W=prob.shape;p=resample(p,4)
    for _ in range(iters):
        q=smooth_line(p,7);t=np.gradient(q,axis=0);t/=np.linalg.norm(t,axis=1,keepdims=True)+1e-9;n=np.c_[-t[:,1],t[:,0]]
        new=p.copy()
        for i,(pt,nv) in enumerate(zip(q,n)):
            offs=np.arange(-40,41,1.0);xs=np.clip(np.round(pt[0]+offs*nv[0]).astype(int),0,W-1);ys=np.clip(np.round(pt[1]+offs*nv[1]).astype(int),0,H-1)
            v=prob[ys,xs]>.5
            c=40 # index of offset 0
            if not v[c]:
                near=np.where(v)[0]
                if len(near)==0:continue
                c=near[np.argmin(np.abs(near-40))]
            a=c;b=c
            while a>0 and v[a-1]:a-=1
            while b<len(v)-1 and v[b+1]:b+=1
            w=b-a
            if 30<=w<=75:new[i]=pt+nv*offs[(a+b)//2]
            else:new[i]=pt
        p=smooth_line(new,11)
    return p
def final(k,starts=None):
    img,prob,road,out=trace(k,starts)
    res=[]
    for p in out:
        q=centre(p,prob)
        q[0]=out_start=p[0];q[-1]=p[-1]
        q=smooth_line(q,5);simp=cv2.approxPolyDP(np.float32(q).reshape(-1,1,2),1.2,False).reshape(-1,2)
        res.append(simp)
    return img,prob,road,out,res

def buildable(k,img,road_paths,cell=20):
    H,W=600,1000;F=feats(img)
    guide_floor=np.zeros((H,W),bool);guide_floor[78:512,48:952]=True
    roadband=band(road_paths,150,(H,W))
    ring=band(road_paths,200,(H,W))&~band(road_paths,120,(H,W))&guide_floor
    pos=np.argwhere(ring);neg=np.argwhere(~np.pad(np.ones((H-120,W-60),bool),((40,80),(10,50))) )
    edge=np.ones((H,W),bool);edge[45:560,22:978]=False;neg=np.argwhere(edge)
    rng=np.random.default_rng(1);pos=pos[rng.choice(len(pos),min(8000,len(pos)),replace=False)];neg=neg[rng.choice(len(neg),min(8000,len(neg)),replace=False)]
    X=np.concatenate([F[pos[:,0],pos[:,1]],F[neg[:,0],neg[:,1]]]);y=np.r_[np.ones(len(pos)),np.zeros(len(neg))]
    clf=RandomForestClassifier(60,max_depth=12,n_jobs=-1,random_state=0).fit(X,y)
    prob=clf.predict_proba(F.reshape(-1,F.shape[2]))[:,1].reshape(H,W)
    prob=cv2.GaussianBlur(prob.astype(np.float32),(0,0),4)
    rows=[]
    for cy in range(0,H,cell):
        r=''
        for cx in range(0,W,cell):
            blk=prob[cy:cy+cell,cx:cx+cell];r+='1' if (blk>.5).mean()>=.7 else '0'
        rows.append(r)
    # keep the largest connected open region (drops stray floor-coloured specks in the decoration)
    g=np.array([[c=='1' for c in r] for r in rows],np.uint8);n,lab=cv2.connectedComponents(g,connectivity=4)
    if n>1:
        g=np.isin(lab,[i for i in range(1,n) if (lab==i).sum()>=8]).astype(np.uint8)
    return [''.join('1' if v else '0' for v in row) for row in g],prob
