import json,re,shutil,os
R=json.load(open('routes.json'));T=json.load(open('traced.json'))
maps={}
for k,m in R.items():
    t=T.get(k)
    maps[k]={'name':m['name'],'sector':m['sector'],'paths':t['paths'] if t else [[[round(x,1),round(y,1)] for x,y in p] for p in m['paths']],'grid':t['grid'] if t else None,'painted':bool(t)}
p='/home/claude/wop/site/game/campaign.js';s=open(p).read()
s=re.sub(r"const MAPS=\{.*?\};\n","const MAPS="+json.dumps(maps,separators=(',',':')).replace('\\','\\\\')+";\n",s,count=1,flags=re.S)
open(p,'w').write(s)
os.makedirs('/home/claude/wop/site/game/assets/maps',exist_ok=True)
for k in T:shutil.copy(f'maps/{k}.jpg',f'/home/claude/wop/site/game/assets/maps/{k}.jpg')
print('painted:',[k for k in maps if maps[k]['painted']])
