#!/usr/bin/env python3
"""Build the CrazyGames upload (Oct 25 2026).

Makes dist/ with index.html at the root (new players start the tutorial, returning players open the hub),
only the files the game uses, audio converted from WAV to MP3, art and sound moved inside the game folder,
then zips it. Run from the repo root:  python3 tools/build_crazygames.py [out_dir]
"""
import os, re, shutil, subprocess, sys, zipfile
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GAME=os.path.join(ROOT,'game'); OUT=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(ROOT,'..','wop','dist'))
DIST=os.path.join(OUT,'warden-of-power'); ZIP=os.path.join(OUT,'warden-of-power-crazygames.zip')
TEXT=('.js','.html','.css')
SKIP={'broken-conduit-weathered-road-v2.png'}  # only reachable through the ?map=v2 review switch

def sh(*a): subprocess.run(a,check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def mp3(src,dst,rate='96k'):
    os.makedirs(os.path.dirname(dst),exist_ok=True); sh('ffmpeg','-y','-i',src,'-codec:a','libmp3lame','-b:a',rate,dst)

shutil.rmtree(OUT,ignore_errors=True); os.makedirs(DIST)
texts={}
for dp,dn,fn in os.walk(GAME):
    for f in fn:
        p=os.path.join(dp,f)
        if f.endswith(TEXT): texts[os.path.relpath(p,GAME)]=open(p,encoding='utf-8').read()
alltext='\n'.join(texts.values())

# 1) copy the game, minus unreferenced review candidates and source WAVs (converted below)
for dp,dn,fn in os.walk(GAME):
    for f in fn:
        src=os.path.join(dp,f); rel=os.path.relpath(src,GAME)
        if f.endswith('.wav'): continue
        if 'candidate' in f and f not in alltext: continue
        if f in SKIP: continue
        if f.endswith(TEXT): continue
        if f in ('README.md',): continue
        dst=os.path.join(DIST,rel); os.makedirs(os.path.dirname(dst),exist_ok=True); shutil.copy2(src,dst)

# 2) audio -> MP3, inside the game folder
for f in sorted(os.listdir(os.path.join(ROOT,'previews','audio-v3'))):
    if f.endswith('.wav'): mp3(os.path.join(ROOT,'previews','audio-v3',f),os.path.join(DIST,'assets','sfx',f[:-4]+'.mp3'))
mp3(os.path.join(ROOT,'previews','audio-v2','broken-conduit.wav'),os.path.join(DIST,'assets','music','broken-conduit.mp3'),'128k')
for dp,dn,fn in os.walk(os.path.join(GAME,'assets')):
    for f in fn:
        if f.endswith('.wav'):
            rel=os.path.relpath(os.path.join(dp,f),GAME); mp3(os.path.join(GAME,rel),os.path.join(DIST,rel[:-4]+'.mp3'))
# 3) art referenced from outside the game folder
os.makedirs(os.path.join(DIST,'assets','art'),exist_ok=True)
for f in set(re.findall(r"\.\./art-reference/([\w.\-]+)",alltext)): shutil.copy2(os.path.join(ROOT,'art-reference',f),os.path.join(DIST,'assets','art',f))

# 3b) the five big sprite atlases ship as WebP (q92 keeps them sharp; ~9 MB -> ~2.5 MB of the first download)
WEBP=['assets/element-tiers-candidate.png','assets/water-tiers-candidate.png','assets/art/enemy-walk-candidates-v1.png',
      'assets/art/approved-elemental-sprites-v1.png','assets/art/enemy-death-candidates-v1.png']
from PIL import Image
for rel in WEBP:
    src=os.path.join(DIST,rel); assert os.path.exists(src),('atlas missing',rel)
    Image.open(src).save(src[:-4]+'.webp','WEBP',quality=92,method=6); os.remove(src)

# 4) rewrite paths in the text files
REPL=[("'../previews/audio-v3/'+name+variant+'.wav'","'assets/sfx/'+name+variant+'.mp3'",'game.js'),
      ("'../previews/audio-v3/tier_up.wav'","'assets/sfx/tier_up.mp3'",'hub.js'),
      ("'../previews/audio-v2/broken-conduit.wav'","'assets/music/broken-conduit.mp3'",'game.js'),
      ("assets/hub/ambience/amb-${name}.wav","assets/hub/ambience/amb-${name}.mp3",'hub.js')]
for rel,s in texts.items():
    s=s.replace('../art-reference/','assets/art/').replace("assets/audio/ascension.wav","assets/audio/ascension.mp3")
    for w in WEBP: s=s.replace(os.path.basename(w),os.path.basename(w)[:-4]+'.webp')
    for a,b,f in REPL:
        if rel==f:
            assert a in s,(f,a); s=s.replace(a,b)
    if rel.endswith('.html'):
        # CrazyGames build: no playtest feedback form at all, and a CSP that lets their SDK load its ad and
        # account scripts and frames (it pulls them from several https hosts). Injected inline scripts stay blocked.
        s=re.sub(r'<script src="feedback\.js[^"]*"></script>','',s); s=re.sub(r'<link rel="stylesheet" href="feedback\.css[^"]*">','',s)
        s=s.replace("script-src 'self' https://sdk.crazygames.com https://*.crazygames.com","script-src 'self' https:")
        s=re.sub(r'<button id="(feedbackButton|openFeedback)"[^>]*>[^<]*</button>','',s)
        s=s.replace('<html lang="en">','<html lang="en" class="on-crazygames">',1)
    if rel in ('feedback.js','feedback.css','fp-bridge.js'): continue
    assert '../' not in re.sub(r'//.*','',s) or rel.endswith('.css'),('parent path left in',rel)
    dst=os.path.join(DIST,rel); os.makedirs(os.path.dirname(dst),exist_ok=True); open(dst,'w',encoding='utf-8').write(s)

# 5) checks and zip
left=[rel for rel,s in texts.items() if os.path.exists(os.path.join(DIST,rel)) and re.search(r"\.wav['\"`]",open(os.path.join(DIST,rel),encoding='utf-8').read())]
assert not left,('wav still referenced in',left)
files=[os.path.join(dp,f) for dp,dn,fn in os.walk(DIST) for f in fn]
total=sum(os.path.getsize(f) for f in files)
with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED) as z:
    for f in files: z.write(f,os.path.relpath(f,DIST))
print(f'{len(files)} files, {total/1e6:.1f} MB unpacked, zip {os.path.getsize(ZIP)/1e6:.1f} MB -> {ZIP}')
