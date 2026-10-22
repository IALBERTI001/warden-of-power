"""Hub ambience loops for restored facilities (candidate). Procedural, NumPy + stdlib, seamless 12 s loops.
Kept soft and low-mid: no shrill tones, no drones (per the approved audio direction)."""
import numpy as np, wave, json, sys
SR=22050;L=12;N=SR*L;rng=np.random.default_rng(22)
def lp(x,a):  # one-pole low-pass, a in (0,1): smaller = darker
    y=np.empty_like(x);s=0.0
    for i,v in enumerate(x): s+=a*(v-s);y[i]=s
    return y
def hp(x,a): return x-lp(x,a)
def env(n,att,dec):
    t=np.arange(n)/SR;return np.minimum(1,t/att)*np.exp(-t/dec)
def place(out,snd,pos):
    pos=max(0,pos);e=min(len(out),pos+len(snd))
    if e>pos: out[pos:e]+=snd[:e-pos]
def loopify(x,f=SR):  # crossfade tail into head for a seamless loop
    x=x.copy();h=x[:f].copy();t=x[-f:].copy();w=np.linspace(0,1,f);x[:f]=h*w+t*(1-w);return x[:-f]
def norm(x,peak):return x/np.max(np.abs(x))*peak
def save(name,x):
    x=np.clip(x,-1,1);d=(x*32767).astype('<i2')
    with wave.open(name,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(d.tobytes())
n=N+SR
# water: soft bed of filtered noise + gentle bubble plinks (low, rounded)
bed=lp(hp(rng.standard_normal(n),0.02),0.12)*0.5
plink=np.zeros(n)
for _ in range(40):
    f=rng.uniform(380,720);d=int(SR*rng.uniform(.06,.12));t=np.arange(d)/SR
    s=np.sin(2*np.pi*(f+900*t)*t)*env(d,.004,.03)*rng.uniform(.2,.5);place(plink,s,int(rng.uniform(0,n-d)))
water=norm(loopify(bed+lp(plink,.4)),.35)
# fire: warm rumble + crackles
rum=lp(rng.standard_normal(n),0.01)*3
cr=np.zeros(n)
for _ in range(160):
    d=int(SR*rng.uniform(.004,.02));s=hp(rng.standard_normal(d),.3)*env(d,.0005,.004)*rng.uniform(.2,1);place(cr,s,int(rng.uniform(0,n-d)))
fire=norm(loopify(rum+lp(cr,.5)*.8),.35)
# ice: airy wind + rare soft chimes
wind=lp(hp(rng.standard_normal(n),.05),.06)*(0.6+0.4*np.sin(2*np.pi*np.arange(n)/SR/6))
ch=np.zeros(n)
for _ in range(7):
    f=rng.choice([660,784,880,988]);d=int(SR*1.5);t=np.arange(d)/SR
    s=(np.sin(2*np.pi*f*t)+.3*np.sin(2*np.pi*2*f*t))*env(d,.01,.5)*.12;place(ch,s,int(rng.uniform(0,n-d)))
ice=norm(loopify(wind+ch),.3)
# storm: low soft hum (not a drone: slowly swelling) + distant crackle
t=np.arange(n)/SR
hum=(np.sin(2*np.pi*55*t)+.4*np.sin(2*np.pi*110*t))*(.25+.2*np.sin(2*np.pi*t/4))*.3
zap=np.zeros(n)
for _ in range(10):
    d=int(SR*rng.uniform(.08,.2));s=hp(rng.standard_normal(d),.2)*env(d,.002,.04)*rng.uniform(.3,.7);place(zap,s,int(rng.uniform(0,n-d)))
storm=norm(loopify(hum+lp(zap,.35)+lp(rng.standard_normal(n),.02)*.4),.3)
# gears: soft wooden ticks in a slow rhythm + low workshop rumble
gt=np.zeros(n);step=int(SR*.6)
for k in range(0,n-SR,step):
    for j,off in enumerate([0,int(SR*.3)]):
        d=int(SR*.05);s=lp(rng.standard_normal(d),.25)*env(d,.001,.012)*(.6 if j==0 else .35);place(gt,s,k+off+int(rng.uniform(-200,200)))
gears=norm(loopify(gt+lp(rng.standard_normal(n),.008)*2),.3)
# v2 (user feedback: "too aggressive"): darker and quieter. Two-pole low-pass near 1 kHz removes the hiss,
# then every loop is set to the same soft level. Filtered over two copies so the loop stays seamless.
def soften(x,a=.26,rms=.03,peak=.18):
    y=lp(lp(np.concatenate([x,x]),a),a)[len(x):]
    y=y/np.sqrt(np.mean(y**2))*rms
    return y/max(1,np.max(np.abs(y))/peak)
out={}
for name,x in [('water',water),('fire',fire),('ice',ice),('storm',storm),('gears',gears)]:
    x=soften(x);save(f'amb-{name}.wav',x);out[name]={'peak':float(np.max(np.abs(x))),'rms':float(np.sqrt(np.mean(x**2))),'finite':bool(np.isfinite(x).all())}
json.dump(out,open('ambience-checks.json','w'),indent=1);print(out)
