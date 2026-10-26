#!/usr/bin/env python3
"""Build the freeplays.site upload (Oct 26 2026): same clean build as CrazyGames, but with the Freeplay SDK
(/sdk/v1.js) and fp-bridge.js in place of the CrazyGames layer, no ads, plus cover.png (16:10).
Run from the repo root:  python3 tools/build_freeplay.py [cover_source.jpg]"""
import os,re,shutil,subprocess,sys,zipfile
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,'..','wop','dist-freeplay'); TMP=os.path.join(OUT,'_cg')
shutil.rmtree(OUT,ignore_errors=True); os.makedirs(OUT)
subprocess.run([sys.executable,os.path.join(ROOT,'tools','build_crazygames.py'),TMP],check=True)
SRC=os.path.join(TMP,'warden-of-power'); DIST=os.path.join(OUT,'warden-of-power'); shutil.move(SRC,DIST); shutil.rmtree(TMP)
os.remove(os.path.join(DIST,'ads.js')); shutil.copy2(os.path.join(ROOT,'game','fp-bridge.js'),os.path.join(DIST,'fp-bridge.js'))
for f in ('index.html','hub.html'):
    p=os.path.join(DIST,f); s=open(p,encoding='utf-8').read()
    s,n=re.subn(r'<script src="ads\.js[^"]*"></script>','<script src="/sdk/v1.js"></script><script src="fp-bridge.js"></script>',s); assert n==1,(f,n)
    s=s.replace("script-src 'self' https:","script-src 'self'")
    open(p,'w',encoding='utf-8').write(s)
if len(sys.argv)>1: shutil.copy2(sys.argv[1],os.path.join(DIST,'cover.png'))
files=[os.path.join(dp,f) for dp,dn,fn in os.walk(DIST) for f in fn]; total=sum(os.path.getsize(f) for f in files)
assert len(files)<=1500 and total<=50e6,(len(files),total)
ZIP=os.path.join(OUT,'warden-of-power-freeplay.zip')
with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files: z.write(f,os.path.relpath(f,DIST))
print(f'{len(files)} files, {total/1e6:.1f} MB -> {ZIP}')
