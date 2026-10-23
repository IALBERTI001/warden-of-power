import math, json
def smooth(pts,n=8):
    out=[];P=[pts[0]]+pts+[pts[-1]]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        for k in range(n):
            t=k/n;t2=t*t;t3=t2*t
            out.append(tuple(round(0.5*((2*p1[j])+(-p0[j]+p2[j])*t+(2*p0[j]-5*p1[j]+4*p2[j]-p3[j])*t2+(-p0[j]+3*p1[j]-3*p2[j]+p3[j])*t3),1) for j in range(2)))
    out.append(tuple(pts[-1]));return out
def rounded(ctrl,r=55):
    # turn an orthogonal polyline into one with rounded corners (extra control points near each corner)
    out=[ctrl[0]]
    for i in range(1,len(ctrl)-1):
        a,b,c=ctrl[i-1],ctrl[i],ctrl[i+1]
        da=math.dist(a,b);dc=math.dist(b,c);ra=min(r,da/2.2);rc=min(r,dc/2.2)
        p=(b[0]+(a[0]-b[0])*ra/da,b[1]+(a[1]-b[1])*ra/da);q=(b[0]+(c[0]-b[0])*rc/dc,b[1]+(c[1]-b[1])*rc/dc)
        out+= [p,q]
    out.append(ctrl[-1]);return smooth(out,6)
M={
 # id: (sector, name, [paths as orthogonal control points], seal (x,y), theme key)
 'moonwell-1':('moonwell','Silted Overflow',[[(-40,200),(210,200),(210,420),(440,420),(440,180),(680,180),(680,420),(880,420),(880,300),(965,300)]]),
 'moonwell-2':('moonwell','Pump Gallery',[[(700,-40),(700,190),(230,190),(230,440),(800,440),(800,300)]]),
 'moonwell-3':('moonwell','Moonwell Basin',[[(-40,150),(200,150),(200,300),(420,300),(420,450),(720,450),(720,300),(965,300)],[(690,-40),(690,170),(420,170),(420,300),(420,450),(720,450),(720,300),(965,300)]]),
 'emberheart-1':('emberheart','Slag Yard',[[(-40,430),(250,430),(250,140),(500,140),(500,400),(750,400),(750,150),(965,150)]]),
 'emberheart-2':('emberheart','Bellows Walk',[[(-40,140),(320,140),(320,300),(140,300),(140,440),(580,440),(580,220),(820,220),(820,430),(965,430)]]),
 'emberheart-3':('emberheart','Furnace Heart',[[(-40,250),(180,250),(180,440),(460,440),(460,300),(460,150),(270,150)],[(1040,440),(800,440),(800,170),(620,170),(620,300),(460,300),(460,150),(270,150)]]),
 'rimeglass-1':('rimeglass','Frozen Racks',[[(-40,300),(160,300),(160,140),(400,140),(400,440),(620,440),(620,140),(840,140),(840,330),(965,330)]]),
 'rimeglass-2':('rimeglass','Thaw Doors',[[(-40,440),(220,440),(220,150),(440,150),(440,440),(660,440),(660,150),(880,150),(880,300),(965,300)]]),
 'rimeglass-3':('rimeglass','Vault Core',[[(-40,140),(300,140),(300,300),(120,300),(120,450),(500,450),(500,270)],[(1040,140),(700,140),(700,300),(880,300),(880,450),(500,450),(500,270)]]),
 'stormcrown-1':('stormcrown','Rod Terrace',[[(-40,380),(220,380),(220,170),(480,170),(480,420),(760,420),(760,200),(965,200)]]),
 'stormcrown-2':('stormcrown','Coil Spiral',[[(-40,140),(800,140),(800,440),(200,440),(200,280),(620,280)]]),
 'stormcrown-3':('stormcrown','Crown Platform',[[(-40,430),(450,430),(450,300),(720,300),(720,150),(965,150)],[(260,-40),(260,170),(450,170),(450,300),(720,300),(720,150),(965,150)]]),
 'aetherheart-1':('aetherheart','Aetherheart Core',[[(-40,130),(260,130),(260,300),(110,300),(110,450),(430,450),(430,300),(455,300)],[(1040,130),(740,130),(740,300),(890,300),(890,450),(570,450),(570,300),(545,300)]]),
}
def segdist(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1];L=dx*dx+dy*dy;u=0 if L==0 else max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L));return math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy)
res={}
for k,(sec,name,paths) in M.items():
    sm=[rounded(p) for p in paths];lens=[sum(math.dist(s[i],s[i+1]) for i in range(len(s)-1)) for s in sm]
    # min clearance between parts of the same path that are far apart along the route
    worst=999
    for s in sm:
        cum=[0]
        for i in range(len(s)-1):cum.append(cum[-1]+math.dist(s[i],s[i+1]))
        for i in range(0,len(s),2):
            for j in range(len(s)-1):
                if abs(cum[i]-cum[j])<260:continue
                if 70<s[i][0]<930 and 100<s[i][1]<505:worst=min(worst,segdist(s[i],s[j],s[j+1]))
    res[k]={'sector':sec,'name':name,'paths':[[list(p) for p in s] for s in sm]}
    print(f"{k:14s} {name:18s} paths {len(sm)} lengths {[round(l) for l in lens]} min-gap {round(worst)}")
json.dump(res,open('routes.json','w'))
