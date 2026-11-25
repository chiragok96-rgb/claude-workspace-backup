import soundfile as sf, numpy as np
x,sr=sf.read('audio/vo.wav'); x=x.mean(1) if x.ndim>1 else x
ph=np.load('ph.npy'); h=int(.02*sr)
e=np.array([np.sqrt((x[i:i+h]**2).mean()) for i in range(0,len(x)-h,h)]); db=20*np.log10(e+1e-9)
for a,b in ph:
    i0,i1=int(a/.02),int(b/.02); seg=db[i0:i1]; top=seg.max()
    # local minima that are >=12 dB below the phrase peak: word joins
    d=[ (i0+k)*.02 for k in range(2,len(seg)-2) if seg[k]==seg[k-2:k+3].min() and seg[k]<top-14]
    m=[]; 
    for t in d:
        if not m or t-m[-1]>.12: m.append(t)
    print('%.2f-%.2f |'%(a,b),' '.join('%.2f'%t for t in m))
