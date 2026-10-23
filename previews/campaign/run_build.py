import sys,json,numpy as np,cv2
from trace import final,buildable
# Entrances that the painting shows as tunnels/doors (game units): enemies come out of them, not out of a bare edge.
STARTS={'moonwell-1':[(128,72)],'emberheart-3':[None,(940,190)]}
out={}
for k in sys.argv[1:]:
    img,prob,road,raw,res=final(k,STARTS.get(k))
    grid,fp=buildable(k,img,[p for p in res])
    vis=img.copy()
    ov=vis.copy()
    for gy,row in enumerate(grid):
        for gx,c in enumerate(row):
            if c=='1':cv2.rectangle(ov,(gx*20,gy*20),(gx*20+19,gy*20+19),(0,255,0),-1)
    vis=cv2.addWeighted(ov,.35,vis,.65,0)
    for p in res:cv2.polylines(vis,[np.int32(np.round(p))],False,(255,0,255),3)
    cv2.imwrite(f'build-{k}.jpg',cv2.cvtColor(vis,cv2.COLOR_RGB2BGR),[cv2.IMWRITE_JPEG_QUALITY,85])
    out[k]={'paths':[[[round(float(x),1),round(float(y),1)] for x,y in p] for p in res],'grid':grid}
    print(k,sum(r.count('1') for r in grid),'open cells')
prev={}
try:prev=json.load(open('traced.json'))
except:pass
prev.update(out);json.dump(prev,open('traced.json','w'))
