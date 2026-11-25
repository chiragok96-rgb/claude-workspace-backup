import numpy as np, subprocess
w=subprocess.run(['/home/user/tools/ffmpeg/bin/ffmpeg','-v','error','-i','/home/user/danga/audio/vo.wav','-ac','1','-ar','16000','-f','f32le','-'],capture_output=True,check=True).stdout
y=np.frombuffer(w,np.float32); h=160
e=np.sqrt(np.convolve(y**2,np.ones(h)/h,'same'))[::h]; db=20*np.log10(e+1e-9); thr=db.max()-38
on=db>thr; segs=[]; i=0; n=len(on)
while i<n:
    if on[i]:
        j=i
        while j<n and on[j]: j+=1
        segs.append([i/100,j/100]); i=j
    else: i+=1
m=[]
for a,b in segs:
    if m and a-m[-1][1]<.28: m[-1][1]=b
    else: m.append([a,b])
m=[s for s in m if s[1]-s[0]>.12]
np.save('/home/user/danga/ph.npy',np.array(m)); print(len(m))
for a,b in m: print('%.2f-%.2f'%(a,b))
