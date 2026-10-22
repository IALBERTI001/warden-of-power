"""Original deterministic sound design: filtered noise, resonators and pitched layers."""
from pathlib import Path
import json, wave
import numpy as np
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'previews/audio';OUT.mkdir(exist_ok=True)
SR=44100;DURATION=10.5
rng=np.random.default_rng(4281)

def tone(freq,duration,decay=8):
    t=np.arange(round(SR*duration))/SR
    return np.sin(2*np.pi*freq*t)*np.exp(-decay*t)*np.minimum(1,t/.008)

def sweep(start,end,duration):
    t=np.arange(round(SR*duration))/SR
    phase=2*np.pi*(start*t+(end-start)/(2*duration)*t*t)
    return np.sin(phase)*np.sin(np.pi*t/duration)**2

def noise(duration,low,high,decay=7):
    n=round(SR*duration);t=np.arange(n)/SR
    spectrum=np.fft.rfft(rng.normal(size=n));freq=np.fft.rfftfreq(n,1/SR)
    mask=np.minimum(1,(freq/max(low,1))**2)/(1+(freq/high)**6)
    v=np.fft.irfft(spectrum*mask,n);v/=max(np.sqrt(np.mean(v*v)),1e-9)
    return v*np.exp(-t*decay)*np.minimum(1,t/.006)

def blend(duration,*layers):
    v=np.zeros(round(SR*duration))
    for a,gain,offset in layers:
        k=round(offset*SR);end=min(len(v),k+len(a));v[k:end]+=a[:end-k]*gain
    # Modest early reflections add material character, not long ringing tails.
    for delay,gain in [(.027,.10),(.061,.045)]:
        k=round(delay*SR);v[k:]+=v[:-k].copy()*gain
    v*=np.minimum(1,(len(v)-np.arange(len(v)))/(SR*.035))
    return v/max(1,np.max(np.abs(v))/.7)

sounds={
'water_launch':blend(.42,(sweep(520,180,.22),.24,0),(noise(.28,200,2100,12),.09,.015),(tone(784,.25,13),.035,.04)),
'water_contact':blend(.48,(sweep(340,110,.17),.28,0),(noise(.33,500,3000,13),.08,.01),(sweep(580,280,.12),.07,.09)),
'ice_launch':blend(.35,(noise(.19,1800,5200,20),.055,0),(tone(1174.66,.27,16),.11,.015),(tone(1760,.20,20),.035,.035)),
'ice_contact':blend(.32,(noise(.14,1200,4200,25),.075,0),(tone(880,.26,17),.10,0),(tone(1320,.20,22),.035,.015)),
'golem_chilled':blend(.54,(sweep(130,76,.28),.16,0),(noise(.27,90,650,12),.09,.01),(tone(587.33,.38,11),.035,.045)),
'freeze_combo':blend(.76,(noise(.31,900,3800,14),.065,0),(tone(587.33,.60,7),.095,.02),(tone(880,.56,8),.07,.075),(tone(1174.66,.44,10),.035,.13)),
'golem_death':blend(1.15,(noise(.35,70,1200,13),.16,0),(sweep(105,48,.35),.20,0),(noise(.20,200,1700,20),.10,.16),(tone(146.83,.50,9),.09,.05),(noise(.20,200,1800,20),.065,.34),(tone(220,.55,8),.035,.11),(tone(293.66,.5,8),.025,.17)),
}

def write(path,data):
    data=np.asarray(data);assert np.max(np.abs(data))<1
    pcm=(data*32767).astype('<i2')
    with wave.open(str(path),'wb') as f:
        f.setnchannels(1 if data.ndim==1 else data.shape[1]);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())

for name,v in sounds.items():write(OUT/(name+'.wav'),v)
events=[(1.0,'ice_launch',.8,-.45),(1.45,'ice_contact',.65,.05),(1.45,'golem_chilled',.8,.05),(2.7,'water_launch',.85,-.65),(3.15,'water_contact',.9,.05),(3.7,'ice_launch',.8,.55),(4.15,'freeze_combo',1,.05),(5.8,'water_launch',.7,-.65),(6.25,'water_contact',.7,.15),(6.3,'ice_launch',.8,.55),(6.75,'ice_contact',.55,.15),(6.75,'golem_death',1,.15)]
mix=np.zeros((round(SR*DURATION),2))
for when,name,level,pan in events:
    k=round(when*SR);v=sounds[name]*level*.65
    angle=(pan+1)*np.pi/4
    mix[k:k+len(v),0]+=v*np.cos(angle);mix[k:k+len(v),1]+=v*np.sin(angle)
# Quiet harmonic background, a separate stem so the listener can isolate effects.
t=np.arange(len(mix))/SR
bed=np.zeros_like(mix)
for j,freq in enumerate([146.832,220,293.665,349.228]):
    phase=j*.6;env=np.minimum(1,t/1.5)*np.minimum(1,(DURATION-t)/1.5)
    v=(np.sin(2*np.pi*freq*t+phase)+.2*np.sin(2*np.pi*freq*2*t+phase))*.008*env*(.8+.2*np.sin(t*.5+j))
    bed[:,0]+=v;bed[:,1]+=v*(.94 if j%2 else 1.04)
write(OUT/'tower-combo-effects.wav',mix)
write(OUT/'quiet-engine-music.wav',bed)
combined=mix+bed;write(OUT/'tower-combo-with-music.wav',combined)
report={'sample_rate':SR,'duration_seconds':DURATION,'peak_dbfs':round(20*np.log10(np.max(np.abs(combined))),2),'clipped_samples':int(np.sum(np.abs(combined)>=1)),'sound_events':len(events),'events':[{'time':a,'sound':b} for a,b,_,_ in events]}
(OUT/'audio-checks.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
