"""Original material-based elemental SFX. No drum hits or pitched bass drops."""
from pathlib import Path
import numpy as np
import wave,json
OUT=Path(__file__).resolve().parent/'audio-v3';OUT.mkdir(exist_ok=True)
SR=32000
reports=[]
def noise(rng,n,lo,hi):
    f=np.fft.rfftfreq(n,1/SR);v=np.fft.rfft(rng.normal(size=n))
    v*=((f/lo)**4/(1+(f/lo)**4))/(1+(f/hi)**10)
    x=np.fft.irfft(v,n);return x/max(np.std(x),1e-9)
def effect(element,contact,seed):
    rng=np.random.default_rng(seed);d=(.48 if contact else .40);n=round(SR*d);t=np.arange(n)/SR
    # Smooth attacks and tails avoid repeated percussion at tower fire rates.
    env=np.sin(np.pi*np.minimum(t/.055,1)/2)**2*np.sin(np.pi*np.minimum((d-t)/.16,1)/2)**2
    if element=='fire':
        x=noise(rng,n,240,1250)*(.70+.16*np.sin(2*np.pi*7*t))
        x+=.18*noise(rng,n,900,2200)*np.sin(np.pi*t/d)**4
    elif element=='water':
        x=noise(rng,n,350,1700)*.65
        # Soft, staggered liquid ripples rather than a single descending drum tone.
        for at in [.035,.12,.235,.31]:
            u=np.maximum(0,t-at);e=np.where(t>=at,np.sin(np.pi*np.minimum(u/.035,1)/2)**2*np.exp(-u*24),0)
            f=rng.uniform(480,850);x+=.20*np.sin(2*np.pi*(f*u+180*u*u))*e
    elif element=='ice':
        x=.5*noise(rng,n,700,2300)
        for at in [.045,.12,.20]:
            x+=.25*noise(rng,n,500,1800)*np.exp(-((t-at)/.035)**2)
        x*=.6+.4*np.sin(np.pi*t/d)
    else:
        x=.65*noise(rng,n,450,2100)
        mod=np.interp(t,np.linspace(0,d,20),rng.uniform(.2,1,20));x*=mod
        x+=.12*noise(rng,n,1000,2700)*np.sin(np.pi*t/d)**4
    if contact:x*=.8+.2*np.sin(np.pi*t/d)
    x*=env
    x*=10**((-28 if contact else -26)/20)/max(np.sqrt(np.mean(x*x)),1e-9)
    return np.column_stack([x*.96,x])
def write(name,x):
    assert np.isfinite(x).all();peak=np.max(np.abs(x));assert peak<.8
    with wave.open(str(OUT/(name+'.wav')),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype('<i2').tobytes())
    reports.append({'file':name,'seconds':len(x)/SR,'peak_dbfs':round(20*np.log10(max(peak,1e-9)),2),'rms_dbfs':round(20*np.log10(max(np.sqrt(np.mean(x*x)),1e-9)),2),'clipped_samples':int(np.sum(np.abs(x)>=1))})
fx={}
for ei,element in enumerate(['fire','water','ice','lightning']):
    for contact in [False,True]:
        for variant in range(3):
            name=element+('_contact' if contact else '_launch')+'_'+str(variant)
            fx[name]=effect(element,contact,403+ei*100+variant*7+int(contact)*41);write(name,fx[name])
for name,element in [('freeze_combo','ice'),('golem_chilled','ice'),('golem_death','fire'),('shatter_combo','ice'),('conduction_combo','lightning')]:
    x=effect(element,True,918+len(fx));fx[name]=x;write(name,x)
# Space for each element to be heard, followed by a restrained overlapping fight.
mix=np.zeros((SR*18,2))
for ei,e in enumerate(['fire','water','ice','lightning']):
    for j in range(3):
        for name,offset,gain in [(e+'_launch_'+str(j),0,.9),(e+'_contact_'+str(j),.3,.65)]:
            x=fx[name]*gain;k=round((ei*3+j*.8+.2+offset)*SR);mix[k:k+len(x)]+=x
for j in range(24):
    e=['fire','water','ice','lightning'][j%4];x=fx[e+'_launch_'+str(j%3)]*.48;k=round((12+j*.21)*SR);mix[k:k+len(x)]+=x
write('elemental-preview',mix)
(OUT/'technical-checks.json').write_text(json.dumps(reports,indent=2))
print('Generated',len(reports),'files; maximum peak',max(r['peak_dbfs'] for r in reports),'dBFS')
