"""Build Warden Quill: original rounded, gently slanted fantasy lettering.
All outlines authored here; no third-party font data or tracing.
"""
from pathlib import Path
import struct,math
P=Path(__file__).resolve().parents[1]/'game/assets/fonts';P.mkdir(parents=True,exist_ok=True)
pack=struct.pack
# Original pen paths in a five by seven design space.
paths={
'A':['0,0 2.5,7 5,0','1,2.5 4,2.5'],'B':['0,0 0,7 3,7 5,6 5,5 3,3.5 0,3.5','3,3.5 5,2.5 5,1 3,0 0,0'],
'C':['5,6.5 3.5,7 1,6 0,4.5 0,2 1,0.5 3.5,0 5,1'], 'D':['0,0 0,7 2.5,7 4.5,5.5 5,3.5 4,1 2,0 0,0'],
'E':['5,7 0,7 0,0 5,0','0,3.5 4,3.5'],'F':['0,0 0,7 5,7','0,3.5 4,3.5'],
'G':['5,6 3,7 1,6 0,4 0,2 1,0 4,0 5,1 5,3 3,3'],'H':['0,0 0,7','5,0 5,7','0,3.5 5,3.5'],
'I':['1,7 4,7','2.5,7 2.5,0','1,0 4,0'],'J':['1,7 5,7 5,1 4,0 2,0 0,1.5'],
'K':['0,0 0,7','5,7 0,3 5,0'],'L':['0,7 0,0 5,0'],'M':['0,0 0,7 2.5,3.5 5,7 5,0'],
'N':['0,0 0,7 5,0 5,7'],'O':['2,0 0,1.5 0,5.5 2,7 4,7 5,5.5 5,1.5 3,0 2,0'],
'P':['0,0 0,7 3,7 5,6 5,4.5 3,3.5 0,3.5'],'Q':['2,0 0,1.5 0,5.5 2,7 4,7 5,5.5 5,1.5 3,0 2,0','3,2 5.5,-1'],
'R':['0,0 0,7 3,7 5,6 5,4.5 3,3.5 0,3.5','2.5,3.5 5,0'],'S':['5,6 3.5,7 1,7 0,5.5 1,4 4,3 5,1.5 4,0 1,0 0,1'],
'T':['0,7 5,7','2.5,7 2.5,0'],'U':['0,7 0,1.5 1.5,0 3.5,0 5,1.5 5,7'],'V':['0,7 2.5,0 5,7'],
'W':['0,7 1,0 2.5,3.5 4,0 5,7'],'X':['0,7 5,0','0,0 5,7'],'Y':['0,7 2.5,3.5 5,7','2.5,3.5 2.5,0'],'Z':['0,7 5,7 0,0 5,0'],
'0':['1,0 0,2 0,5 1,7 4,7 5,5 5,2 4,0 1,0'],'1':['1,5.5 2.5,7 2.5,0','1,0 4,0'],'2':['0,5.5 1,7 4,7 5,5.5 4,4 0,0 5,0'],
'3':['0,6 2,7 4,7 5,5.5 3,3.5 5,2 4,0 1,0 0,1'],'4':['4,0 4,7 0,2.5 5,2.5'],'5':['5,7 0,7 0,4 3,4 5,3 5,1 4,0 1,0 0,1'],
'6':['5,6 3,7 1,6 0,3 0,1 1,0 4,0 5,1 5,3 4,4 1,4'],'7':['0,7 5,7 1,0'],'8':['1,3.5 0,5 1,7 4,7 5,5 4,3.5 1,3.5 0,2 1,0 4,0 5,2 4,3.5'],
'9':['4,3 1,3 0,4 0,6 1,7 4,7 5,6 5,2 4,0 1,0'],
'.':['2.5,0 2.5,.1'],',':['2.5,.2 2,-1'],':':['2.5,1 2.5,1.1','2.5,4.5 2.5,4.6'],';':['2.5,1 2,-.5','2.5,4.5 2.5,4.6'],
'!':['2.5,7 2.5,2','2.5,0 2.5,.1'],'?':['0,6 1,7 4,7 5,6 4,4.5 2.5,3 2.5,2','2.5,0 2.5,.1'],
'-':['1,3 4,3'],'+':['.5,3 4.5,3','2.5,1 2.5,5'],'/':['0,0 5,7'],'%':['0,0 5,7','0,6 1,7 2,6 1,5 0,6','3,1 4,2 5,1 4,0 3,1'],
'(':[ '3,7 1.5,5 1,3 1.5,1 3,-1'],')':['2,7 3.5,5 4,3 3.5,1 2,-1'],"'":['2.5,7 2.3,5.5'],'"':['1.5,7 1.3,5.5','3.5,7 3.3,5.5'],'=':['1,2 4,2','1,4 4,4'],'[':['4,7 1,7 1,-1 4,-1'],']':['1,7 4,7 4,-1 1,-1']}
# Lowercase has its own proportions, ascenders and descenders.
for ch in 'abcdefghijklmnopqrstuvwxyz':
    scale=.72 if ch not in 'bdfhklt' else .90
    paths[ch]=[' '.join(f'{float(q.split(",")[0])*.88},{float(q.split(",")[1])*scale-(1 if ch in "gjpqy" else 0)}' for q in line.split()) for line in paths[ch.upper()]]
paths['a']=['4.4,0 4.4,4.5 2.8,5.2 1,4.5 0,3 0,1 1.3,0 3,0 4.4,1.5']
paths['e']=['0,2.5 4.5,2.5 4.2,4 3,5 1.3,5 0,3.5 0,1.5 1.5,0 3.5,0 4.5,1']
paths['i']=['2,0 2,4.8','2,6.5 2,6.6'];paths['l']=['2,0 2,7'];paths['t']=['2,6.5 2,.5 3,0 4,0.5','0,4.5 4,4.5']
paths['·']=['2.5,3 2.5,3.1'];paths['×']=['1,1 4,5','1,5 4,1'];paths['–']=paths['-'];paths['—']=['0,3 5,3'];paths['’']=paths["'"];paths['‘']=paths["'"];paths['“']=paths['"'];paths['”']=paths['"']
paths['&']=['5,0 1,5 1,6.5 2,7 3,6.5 3,5.5 0,2 0,1 1,0 3,0 5,3']
paths['i']=['.8,0 .8,4.8','.8,6.5 .8,6.6'];paths['l']=['.8,0 .8,7']
paths['n']=['0,0 0,5','0,3.5 1.2,5 3,5 4.4,3.8 4.4,0']
paths['h']=['0,0 0,7','0,3.5 1.2,5 3,5 4.4,3.8 4.4,0']
paths['r']=['0,0 0,5','0,3.5 1.5,5 3.5,4.5']
paths['m']=['0,0 0,5','0,3.5 1,5 2,4 2,0','2,4 3,5 4.5,4 4.5,0']
paths['_']=['0,-1 5,-1'];paths['<']=['4,6 1,3 4,0'];paths['>']=['1,6 4,3 1,0'];paths['#']=['1,0 2,7','3,0 4,7','0,2 5,2','0,5 5,5'];paths['|']=['2,0 2,7']
# Smooth curved letter bowls with original interpolated pen paths.
for ch in 'BCDGOPQSUabcegmnopqrsu':
    lines=[]
    for line in paths[ch]:
        points=[tuple(map(float,v.split(',')))for v in line.split()]
        if len(points)<4:lines.append(line);continue
        out=[];extended=[points[0]]+points+[points[-1]]
        for k in range(1,len(extended)-2):
            a,b,c,d=extended[k-1:k+3]
            for j in range(4):
                t=j/4
                out.append(tuple(.5*((2*b[z])+(-a[z]+c[z])*t+(2*a[z]-5*b[z]+4*c[z]-d[z])*t*t+(-a[z]+3*b[z]-3*c[z]+d[z])*t*t*t)for z in [0,1]))
        out.append(points[-1]);lines.append(' '.join(str(x)+','+str(y)for x,y in out))
    paths[ch]=lines

def advance(ch):
    if ch==' ':return 300
    if ch in 'il':return 290
    return 650

def glyph(lines):
    contours=[]
    for line in lines:
        pts=[tuple(map(float,v.split(','))) for v in line.split()]
        for a,b in zip(pts,pts[1:]):
            ax,ay=a;bx,by=b;angle=math.atan2(by-ay,bx-ax);poly=[]
            for cx,cy,start in [(bx,by,angle-math.pi/2),(ax,ay,angle+math.pi/2)]:
                for j in range(7):
                    theta=start+j*math.pi/6;r=.48
                    xx=cx+r*math.cos(theta);yy=cy+r*math.sin(theta)
                    poly.append((round(90+xx*95+yy*5),round(90+yy*95)))
            contours.append(poly)
    pts=[p for c in contours for p in c];xs=[p[0] for p in pts]or[0];ys=[p[1] for p in pts]or[0]
    out=pack('>hhhhh',len(contours),min(xs),min(ys),max(xs),max(ys));ends=[];i=-1
    for c in contours:i+=len(c);ends.append(i)
    out+=b''.join(pack('>H',e) for e in ends)+pack('>H',0)+bytes([1]*len(pts))
    for axis in [0,1]:
        prev=0
        for point in pts:out+=pack('>h',point[axis]-prev);prev=point[axis]
    return out+b'\0'*((-len(out))%4),len(pts),len(contours)
chars=[' ']+sorted(paths,key=ord);gly=[glyph(['0,0 0,7 5,7 5,0 0,0'])]+[glyph(paths.get(c,[])) for c in chars];n=len(gly)
tables={};offsets=[0];buf=b''
for g,_,_ in gly:buf+=g;offsets.append(len(buf))
tables['glyf']=buf;tables['loca']=b''.join(pack('>I',v)for v in offsets)
tables['head']=pack('>IIIIHHqqhhhhHHhhh',0x10000,0x10000,0,0x5f0f3cf5,3,1000,0,0,-100,-200,800,900,0,8,2,1,0)
tables['hhea']=pack('>IhhhHhhhhhhhhhhhH',0x10000,900,-220,80,720,0,0,800,1,0,0,0,0,0,0,0,n)
tables['maxp']=pack('>I14H',0x10000,n,max(g[1]for g in gly),max(g[2]for g in gly),0,0,2,0,0,0,0,0,0,0,0)
tables['hmtx']=pack('>Hh',720,0)+b''.join(pack('>Hh',advance(c),0)for c in chars)
segments=[(ord(c),i+1)for i,c in enumerate(chars)]+[(65535,0)];k=len(segments);power=2**int(math.log2(k))
sub=pack('>7H',4,16+8*k,0,2*k,2*power,int(math.log2(power)),2*k-2*power)
sub+=b''.join(pack('>H',c)for c,_ in segments)+pack('>H',0)+b''.join(pack('>H',c)for c,_ in segments)+b''.join(pack('>H',(g-c)%65536)for c,g in segments)+b'\0\0'*k
tables['cmap']=pack('>HHHHI',0,1,3,1,12)+sub
strings={0:'Original Warden Quill outlines, 2026. Created for Warden of Power.',1:'Warden Quill',2:'Regular',3:'WardenQuill-1.0',4:'Warden Quill Regular',5:'Version 1.0',6:'WardenQuill-Regular',13:'Original project font. May be used, embedded, modified and distributed with this project.'};data=b'';records=b''
for key,value in strings.items():v=value.encode('utf-16-be');records+=pack('>6H',3,1,0x409,key,len(v),len(data));data+=v
tables['name']=pack('>HHH',0,len(strings),6+12*len(strings))+records+data
tables['post']=pack('>IihhIIIII',0x30000,0,-90,45,0,0,0,0,0)
os=bytearray(96);struct.pack_into('>HhHHH',os,0,4,600,400,5,0);struct.pack_into('>hhhhhhhhhhh',os,10,650,650,0,70,650,650,0,350,45,300,0);os[58:62]=b'WRDN';struct.pack_into('>HHHhhhHH',os,62,64,32,8221,900,-220,80,900,220);struct.pack_into('>hhHHH',os,86,490,755,0,32,2);tables['OS/2']=bytes(os)
def checksum(b):b+=b'\0'*((-len(b))%4);return sum(struct.unpack('>'+str(len(b)//4)+'I',b))%2**32
count=len(tables);power=2**int(math.log2(count));header=pack('>IHHHH',0x10000,count,16*power,int(math.log2(power)),16*count-16*power);directory=b'';body=b'';pos=12+16*count;headpos=0
for tag,value in sorted(tables.items()):
    directory+=tag.encode()+pack('>III',checksum(value),pos,len(value))
    if tag=='head':headpos=pos
    padded=value+b'\0'*((-len(value))%4);body+=padded;pos+=len(padded)
font=bytearray(header+directory+body);struct.pack_into('>I',font,headpos+8,(0xb1b0afba-checksum(bytes(font)))%2**32)
(P/'warden-quill.ttf').write_bytes(font);print('Wrote',len(font),'bytes;',n,'glyphs')

