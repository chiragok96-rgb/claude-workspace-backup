import librosa, numpy as np
y, sr = librosa.load('audio/voiceover.mp3', sr=16000)
hop=160; rms=librosa.feature.rms(y=y,hop_length=hop)[0]; t=np.arange(len(rms))*hop/sr
db=20*np.log10(rms+1e-6); thr=np.percentile(db,90)-26; v=db>thr
segs=[];s=None
for i,x in enumerate(v):
    if x and s is None: s=i
    if not x and s is not None: segs.append([t[s],t[i]]); s=None
if s is not None: segs.append([t[s],t[-1]])
m=[]
for a,b in segs:
    if m and a-m[-1][1]<.2: m[-1][1]=b
    else: m.append([a,b])
m=[x for x in m if x[1]-x[0]>.1]
print('speech %.2f–%.2f, voiced total %.1fs'%(m[0][0],m[-1][1],sum(b-a for a,b in m)))
for a,b in m: print('%6.2f-%6.2f (%.2f)'%(a,b,b-a))
