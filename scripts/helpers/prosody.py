import librosa, numpy as np
y, sr = librosa.load('audio/vo.mp3', sr=16000)
hop=160; rms=librosa.feature.rms(y=y,hop_length=hop)[0]; t=np.arange(len(rms))*hop/sr
db=20*np.log10(rms+1e-6); thr=np.percentile(db,90)-28
voiced=db>thr
# segments
segs=[];s=None
for i,v in enumerate(voiced):
    if v and s is None: s=i
    if not v and s is not None:
        segs.append([t[s],t[i]]); s=None
if s is not None: segs.append([t[s],t[-1]])
# merge gaps < .18s
m=[]
for a,b in segs:
    if m and a-m[-1][1]<.18: m[-1][1]=b
    else: m.append([a,b])
m=[x for x in m if x[1]-x[0]>.08]
f0,vf,_=librosa.pyin(y,fmin=70,fmax=500,sr=sr,hop_length=hop)
print('noise floor dB %.1f, speech dB %.1f'%(np.percentile(db,5),np.percentile(db,90)))
print('median f0 %.0f Hz'%np.nanmedian(f0))
for a,b in m:
    k=(t>=a)&(t<b); ff=f0[:len(t)][k]
    print('%6.2f-%6.2f (%.2fs) loud %5.1f  f0 %4.0f  range %4.0f'%(a,b,b-a,db[k].mean(),np.nanmedian(ff) if np.any(~np.isnan(ff)) else 0, (np.nanpercentile(ff,90)-np.nanpercentile(ff,10)) if np.sum(~np.isnan(ff))>5 else 0))
# music bed? harmonic energy in gaps
H,P=librosa.effects.hpss(y); 
gaps=[(m[i][1],m[i+1][0]) for i in range(len(m)-1) if m[i+1][0]-m[i][1]>.4]
for a,b in gaps[:8]:
    k=(t>=a+.05)&(t<b-.05); print('gap %.2f-%.2f dB %.1f'%(a,b,db[k].mean()))
