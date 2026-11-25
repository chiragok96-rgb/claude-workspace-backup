import sys,glob,numpy as np
from PIL import Image
fs=sorted(glob.glob('frames/f_*.jpg'));prev=None;d=[]
for f in fs:
    a=np.asarray(Image.open(f).reduce(8).convert('L'),dtype=np.float32)
    if prev is not None: d.append(np.abs(a-prev).mean())
    prev=a
d=np.array(d);med=np.median(d)
for i,v in enumerate(d):
    loc=np.median(d[max(0,i-6):i+7])
    if v>max(6,loc*3): print(f'pop? frame {i+1} t={(i+1)/30:.2f} diff={v:.1f} local={loc:.1f}')
print('median',med,'max',d.max(),'at',(d.argmax()+1)/30)
a=np.asarray(Image.open(fs[0]).reduce(8).convert('L'),dtype=np.float32);b=np.asarray(Image.open(fs[-1]).reduce(8).convert('L'),dtype=np.float32)
print('loop delta first/last',np.abs(a-b).mean())
