import sys,json,numpy as np,cv2
from trace import final,R
for k in sys.argv[1:]:
    img,prob,road,out,res=final(k)
    vis=img.copy()
    for p in out:cv2.polylines(vis,[np.int32(p)],False,(255,0,0),2)
    for p in res:cv2.polylines(vis,[np.int32(np.round(p))],False,(0,255,0),3)
    cv2.imwrite(f'trace-{k}.jpg',cv2.cvtColor(vis,cv2.COLOR_RGB2BGR),[cv2.IMWRITE_JPEG_QUALITY,85])
    print(k,[len(p) for p in res])
