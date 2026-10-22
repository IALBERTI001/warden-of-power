"""Original composed phrase studies and warmer SFX; no imported musical material."""
from pathlib import Path
import json,wave
import numpy as np

ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'previews/audio-v2';OUT.mkdir(exist_ok=True)
SR=44100;rng=np.random.default_rng(7021);reports=[]
def hz(m):return 440*2**((m-69)/12)
def noise(d,lo=80,hi=1800):
    n=round(SR*d);v=rng.normal(size=n);f=np.fft.rfftfreq(n,1/SR)
    spec=np.fft.rfft(v);spec*=((f/max(lo,1))**2/(1+(f/max(lo,1))**2))/(1+(f/hi)**6)
    v=np.fft.irfft(spec,n);return v/max(np.std(v),1e-8)
def envelope(t,d,attack=.015,release=.1):return np.minimum(1,t/attack)*np.minimum(1,(d-t)/release)
def instrument(m,d,kind='pluck'):
    t=np.arange(round(SR*d))/SR;f=hz(m);v=np.zeros_like(t)
    if kind=='pluck':
        for h in range(1,9):v+=np.sin(2*np.pi*f*h*t+.04*h)*np.exp(-t*(1.8+h*.65))/(h**1.8)
        v*=envelope(t,d,.009,.14)
    elif kind=='wood':
        for ratio,g,dec in [(1,.9,3.0),(2,.15,7),(3,.03,12)]:v+=np.sin(2*np.pi*f*ratio*t)*g*np.exp(-t*dec)
        v*=envelope(t,d,.015,.15)
    elif kind=='reed':
        for h,g in [(1,.8),(2,.10),(3,.035)]:v+=g*np.sin(2*np.pi*f*h*t+.018*np.sin(2*np.pi*4*t))
        v*=envelope(t,d,.09,.21)*(.90+.10*np.sin(np.pi*t/d))
    elif kind=='strings':
        for h,g in [(1,.7),(2,.13),(3,.05),(4,.015)]:v+=g*np.sin(2*np.pi*f*h*t+.022*np.sin(2*np.pi*3.6*t))
        v*=envelope(t,d,.16,.30)
    elif kind=='bass':
        v=np.sin(2*np.pi*f*t)+.15*np.sin(2*np.pi*f*2*t)
        v*=envelope(t,d,.035,.16)*np.exp(-t*.7)
    return v
def add(buf,v,when,amp,pan=0):
    k=round(when*SR)
    if k<0 or k>=len(buf):return
    end=min(k+len(v),len(buf));v=v[:end-k]*amp;a=(pan+1)*np.pi/4
    buf[k:end,0]+=v*np.cos(a);buf[k:end,1]+=v*np.sin(a)
def write(name,buf,target=-25):
    buf=buf.copy();rms=np.sqrt(np.mean(buf*buf))
    if target is not None:buf*=10**(target/20)/max(rms,1e-9)
    peak=np.max(np.abs(buf))
    if peak>.72:buf*=.72/peak
    assert np.isfinite(buf).all() and np.max(np.abs(buf))<1
    with wave.open(str(OUT/name),'wb') as f:f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes((buf*32767).astype('<i2').tobytes())
    # Descriptive spectral measures, not substitutes for sharpness/loudness or listener testing.
    mono=buf.mean(axis=1);spec=np.abs(np.fft.rfft(mono))**2;freq=np.fft.rfftfreq(len(mono),1/SR)
    report={'file':name,'seconds':round(len(buf)/SR,2),'peak_dbfs':round(20*np.log10(np.max(np.abs(buf))),2),'rms_dbfs':round(20*np.log10(np.sqrt(np.mean(buf*buf))),2),'energy_above_4khz_pct':round(100*spec[freq>4000].sum()/max(spec.sum(),1e-12),4),'clipped_samples':0}
    reports.append(report);print(json.dumps(report),flush=True);return buf

# A shared small melodic contour gives the complex an identity; arrangement varies by sector.
maps=[
{'file':'broken-conduit.wav','tempo':84,'kind':'pluck','melody':'reed','roots':[50,46,53,48,50,46,55,48,53,48,57,50],
 'chords':[[62,65,69],[62,65,70],[60,65,69],[60,64,67]],'motif':[69,72,74,72,69,67,65,69],'feel':'water'},
{'file':'furnace-regulator.wav','tempo':96,'kind':'wood','melody':'pluck','roots':[45,41,48,43,45,41,50,43,48,43,52,45],
 'chords':[[57,60,64],[57,60,65],[55,60,64],[55,59,62]],'motif':[64,67,69,67,64,62,60,64],'feel':'furnace'},
{'file':'crystal-vault.wav','tempo':78,'kind':'wood','melody':'reed','roots':[48,44,51,46,48,44,53,46,51,46,55,48],
 'chords':[[60,63,67],[60,63,68],[58,63,67],[58,62,65]],'motif':[67,70,72,70,67,65,63,67],'feel':'crystal'},
{'file':'endless-core.wav','tempo':100,'kind':'strings','melody':'wood','roots':[50,46,53,48,50,46,55,48,53,48,57,50],
 'chords':[[62,65,69],[62,65,70],[60,65,69],[60,64,67]],'motif':[62,65,69,67,65,62,60,62],'feel':'core'},
]
music=[]
for cfg in maps:
    beat=60/cfg['tempo'];bar=4*beat;duration=12*bar+1.4;buf=np.zeros((round(duration*SR),2))
    for b in range(12):
        base=b*bar+.12;chord=cfg['chords'][b%4];rootnote=cfg['roots'][b]
        add(buf,instrument(rootnote-12,beat*1.8,'bass'),base,.07,-.05)
        if b%4!=3:add(buf,instrument(rootnote-5,beat*.8,'bass'),base+beat*2,.035,.05)
        # Voiced broken chords, with rests and altered phrasing in each four-bar passage.
        pattern=[0,1,2,1] if b<4 else [0,2,1,2] if b<8 else [0,1,2]
        for j,k in enumerate(pattern):
            start=base+j*beat*.75+rng.uniform(-.008,.008)
            add(buf,instrument(chord[k],min(1.4,beat*2),cfg['kind']),start,.045*(.88+rng.random()*.2),[-.35,.3,-.1,.25][j])
        # A question/answer melody, never continuous. Last four bars form a closing phrase.
        if b%4 in [0,1,3]:
            a=cfg['motif'][(b*2)%8];bb=cfg['motif'][(b*2+1)%8]
            if b>=8:a=chord[1]+(12 if cfg['feel']=='crystal' else 0);bb=chord[0]
            # Crystal melody capped at C5 rather than piercing bells.
            a=min(a,72);bb=min(bb,72)
            add(buf,instrument(a,beat*1.25,cfg['melody']),base+beat*.5,.045,.12)
            add(buf,instrument(bb,beat*.9,cfg['melody']),base+beat*2.2,.038,-.10)
        # Sparse environmental gestures remain subordinate to music.
        if cfg['feel']=='water' and b%2==0:
            d=.26;t=np.arange(round(d*SR))/SR
            v=np.sin(2*np.pi*(245*t-90*t*t/d))*np.exp(-t*19)*envelope(t,d,.015,.06)
            add(buf,v,base+beat*3.1,.013,-.5 if b%4==0 else .5)
        if cfg['feel'] in ['furnace','core']:
            for j in ([0,2] if cfg['feel']=='furnace' else [0,1.5,2,3]):
                d=.23;t=np.arange(round(d*SR))/SR
                v=(np.sin(2*np.pi*(100*t-32*t*t/d))+.15*noise(d,70,650))*np.exp(-t*18)*envelope(t,d,.01,.04)
                add(buf,v,base+beat*j,.055 if j==0 else .028)
        if cfg['feel']=='crystal' and b%3==2:
            add(buf,instrument(67,.7,'wood'),base+beat*3,.018,.5)
    # Short low-level room reflections; no endless sustained fundamental.
    dry=buf.copy()
    for delay,gain in [(.073,.10),(.131,.07),(.211,.035)]:
        k=round(delay*SR);buf[k:,0]+=dry[:-k,1]*gain;buf[k:,1]+=dry[:-k,0]*gain
    t=np.arange(len(buf))/SR;buf*= (np.minimum(1,t/.18)*np.minimum(1,(duration-t)/.9))[:,None]
    music.append(write(cfg['file'],buf,-25))

def fx(d,*layers):
    v=np.zeros(round(d*SR));t=np.arange(len(v))/SR
    for a,gain,offset in layers:
        k=round(offset*SR);end=min(len(v),k+len(a));v[k:end]+=a[:end-k]*gain
    v*=envelope(t,d,.012,.045)
    return v
def glide(a,b,d):
    t=np.arange(round(d*SR))/SR;return np.sin(2*np.pi*(a*t+(b-a)/(2*d)*t*t))*np.exp(-t*12)
def burst(d,lo,hi,decay):return noise(d,lo,hi)*np.exp(-np.arange(round(d*SR))/SR*decay)
def pitched(f,d,dec):
    t=np.arange(round(d*SR))/SR;return np.sin(2*np.pi*f*t)*np.exp(-t*dec)
effects={
'water_launch':fx(.36,(glide(240,110,.24),.26,0),(burst(.24,120,1100,15),.085,.012)),
'water_contact':fx(.40,(glide(210,95,.19),.24,0),(burst(.26,180,1600,17),.085,.012),(glide(330,180,.10),.035,.07)),
'ice_launch':fx(.30,(burst(.16,230,1700,20),.105,0),(pitched(392,.19,21),.065,.012),(pitched(523.25,.14,27),.018,.025)),
'ice_contact':fx(.31,(burst(.19,180,1500,20),.11,0),(pitched(293.66,.21,19),.07,.01)),
'golem_chilled':fx(.46,(glide(125,72,.30),.16,0),(burst(.29,80,620,13),.095,.01),(pitched(196,.32,13),.025,.04)),
'freeze_combo':fx(.64,(burst(.28,160,1550,14),.09,0),(pitched(293.66,.47,11),.09,.02),(pitched(392,.40,12),.055,.075),(pitched(493.88,.33,14),.025,.13)),
'golem_death':fx(.95,(glide(100,48,.32),.21,0),(burst(.29,70,950,14),.15,0),(burst(.19,150,1250,23),.08,.15),(burst(.16,180,1100,25),.055,.32),(pitched(146.83,.45,12),.045,.04))}
for name,v in effects.items():
    stereo=np.column_stack([v*.65,v*.65]);write(name+'.wav',stereo,None)
timeline=[(1,'ice_launch'),(1.45,'ice_contact'),(1.45,'golem_chilled'),(2.7,'water_launch'),(3.15,'water_contact'),(3.7,'ice_launch'),(4.15,'freeze_combo'),(5.8,'water_launch'),(6.25,'water_contact'),(6.3,'ice_launch'),(6.75,'ice_contact'),(6.75,'golem_death')]
mix=np.zeros((round(10.5*SR),2))
for when,name in timeline:add(mix,effects[name],when,.85,-.25 if name.startswith('water') else .15)
mix=write('warmer-combo-effects.wav',mix,None)
scene_music=music[0][:len(mix)].copy()*.38
scene_time=np.arange(len(scene_music))/SR
scene_music*=np.minimum(1,(10.5-scene_time)/.6)[:,None]
write('conduit-scene-music.wav',scene_music,None)
write('warmer-combo-with-conduit-music.wav',mix+scene_music,None)
# Repeated-fire sample tests variant playback direction; deliberately no identical back-to-back effect.
dense=np.zeros((SR*18,2))
for j in range(34):
    when=.5+j*.46;name=['ice_launch','water_launch','ice_contact','water_contact'][j%4]
    v=effects[name];ratio=[.97,1.02,1,.99][j%4];v=np.interp(np.arange(0,len(v),ratio),np.arange(len(v)),v)
    add(dense,v,when,.40+(.035*(j%3)),.25 if j%2 else -.25)
    if j in [7,19,29]:add(dense,effects['freeze_combo'],when+.12,.65)
write('repeated-fire-comfort-test.wav',dense,None)
(OUT/'technical-checks.json').write_text(json.dumps(reports,indent=2))
