# Synthesised score + foley for "The Gate". Writes score.wav (48 kHz stereo).
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile
SR=48000; DUR=55.56; N=int(SR*DUR)
rng=np.random.default_rng(7)
L=np.zeros(N); Rr=np.zeros(N)
def hz(m): return 440*2**((m-69)/12)
def add(sig,t0,gain=1.0,pan=0.0):
    i0=int(t0*SR);
    if i0>=N: return
    n=min(len(sig),N-i0)
    if i0<0: sig=sig[-i0:]; n=min(len(sig),N); i0=0
    l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    L[i0:i0+n]+=sig[:n]*gain*l*1.414; Rr[i0:i0+n]+=sig[:n]*gain*r*1.414
def lp(x,f,o=2): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def bp(x,a,b,o=2): return sosfilt(butter(o,[a,b],'band',fs=SR,output='sos'),x)
def tt(d): return np.arange(int(d*SR))/SR

def piano(m,d=4.0,vel=1.0):
    t=tt(d); f=hz(m); s=np.zeros_like(t)
    for k in range(1,9):
        fk=f*k*np.sqrt(1+0.0004*k*k); a=(1/k**1.3)*np.exp(-t*(0.9+0.55*k)*(1+ (m-60)/60))
        s+=a*np.sin(2*np.pi*fk*t+rng.random()*6)
    s*=np.minimum(1,t/0.004); ham=lp(rng.standard_normal(len(t))*np.exp(-t*90),2500)*0.05
    rel=np.minimum(1,(d-t)/0.3)
    return (s*0.35+ham)*vel*rel

def pad(notes,d,att=1.5,rel=1.5,bright=1.0,vib=0.0):
    t=tt(d); s=np.zeros_like(t)
    for m in notes:
        for det in (-0.06,0.0,0.07):
            f=hz(m+det)
            ph=2*np.pi*f*t + (vib*np.sin(2*np.pi*5.2*t)*np.minimum(1,t/2)*f*0.004/5.2*2*np.pi if vib else 0)
            for k in range(1,7):
                s+= (1/k**(2.2-0.6*bright))*np.sin(k*ph+rng.random()*6)
    env=np.minimum(1,t/att)*np.minimum(1,(d-t)/rel)
    env=np.clip(env,0,1)**1.5
    return s*env/ (len(notes)*3)

def bell(m,d=3.0):
    t=tt(d); f=hz(m); s=np.zeros_like(t)
    for r,a,dc in [(1,1,1.6),(2.76,.5,3),(5.4,.25,5),(8.93,.12,8)]:
        s+=a*np.sin(2*np.pi*f*r*t)*np.exp(-t*dc)
    return s*np.minimum(1,t/0.002)*0.4

def noise(d): return rng.standard_normal(int(d*SR))

# ---------------- music ----------------
D,Fs,A,B,G,E,Cs=62,66,69,71,67,64,61
# 0–2.7 opening: warm Dmaj9 pad + low piano
add(pad([38,50,57,62,66,69,76],3.2,att=0.02,rel=0.35),0,0.55)
add(piano(38,4,1.0),0.0,0.9); add(piano(66+12,3,0.5),0.85,0.5,0.2); add(piano(69+12,3,0.45),1.55,0.5,-0.2)
# 3.6–4.95 time-lapse shimmer
t=tt(1.5); sh=sum(np.sin(2*np.pi*hz(m)*t)*np.exp(-((t-0.9)**2)/0.25) for m in (86,90,93))*0.08
add(sh,3.55,1.0)
# 4.95–6.45 low tension drone
add(pad([38,45,51],1.7,att=1.2,rel=0.15,bright=.3),4.8,0.7)
# after clang: dark drone Bm low, rising
add(pad([35,47,54],4.2,att=1.8,rel=1.2,bright=.4),7.3,0.6)
# 11–16.8 strings swell: Bm -> G -> A
add(pad([47,59,62,66],3.0,att=1.6,rel=1.0,bright=1.1,vib=1),10.95,0.55)
add(pad([43,55,59,62,67],3.2,att=1.0,rel=1.2,bright=1.1,vib=1),13.6,0.6)
add(pad([45,57,61,64,69],2.6,att=0.8,rel=1.0,bright=1.0,vib=1),16.2,0.5)
# 16.8–22.9 pulse (soft low piano ostinato) + pad D
for k in range(7):
    add(piano(50 if k%2==0 else 57,1.6,0.55),17.0+k*0.86,0.6)
add(pad([38,50,57,64],6.2,att=1.0,rel=1.2,bright=.6),16.9,0.4)
# 22.9–28.7 warm progression D – A/C# – Bm – G
prog=[([38,54,57,62,66],22.9),([37,52,57,61,64],24.35),([35,54,59,62,66],25.8),([31,50,55,59,62,66],27.0)]
for notes,t0 in prog: add(pad(notes,1.9 if t0<27 else 2.0,att=.6,rel=.8,bright=.9),t0,0.5)
for m,t0 in [(74,22.95),(73,24.4),(71,25.85),(74,26.95),(78,27.4)]: add(piano(m,2.5,.45),t0,.5,.15)
add(bell(86,3),26.92,0.18)
# 28.7–31.0 tension: Gm color, then silence
add(pad([31,46,50,55,58],2.4,att=.6,rel=.5,bright=.6),28.7,0.5)
# heartbeat in the silence
for t0 in (31.15,31.85):
    tq=tt(.35); hb=np.sin(2*np.pi*55*tq*(1+0.6*np.exp(-tq*30)))*np.exp(-tq*12)
    add(hb,t0,0.9); add(hb*0.6,t0+0.22,0.9)
# 32.3–37.7 return: G – D/F# – Em – A
for notes,t0,d in [([31,55,59,62],32.3,1.5),([30,54,57,62],33.7,1.4),([28,55,59,64],35.0,1.4),([33,57,61,64],36.3,1.6)]:
    add(pad(notes,d+.5,att=.5,rel=.7,bright=.8),t0,0.48)
for m,t0 in [(71,32.35),(69,33.75),(67,35.05),(69,36.35),(73,37.0)]: add(piano(m,2.4,.42),t0,.5,-.15)
# 37.7–42.5 forward motion: D – Bm – G – A, with ostinato
for notes,t0,d in [([38,57,62,66],37.8,1.3),([35,54,59,62],39.1,1.2),([31,55,59,62],40.3,1.15),([33,57,61,64],41.45,1.2)]:
    add(pad(notes,d+.5,att=.3,rel=.6,bright=.9),t0,0.5)
for k in range(10): add(piano([62,69,74,69][k%4],1.0,.35),37.85+k*0.47,.45,0.25)
# 42.5–48.2 build + resolution at gate opening
add(pad([43,55,59,62,67,71],3.3,att=2.4,rel=.4,bright=1.2,vib=1),42.5,0.6)
add(pad([38,50,57,62,66,69,74,78],5.4,att=0.15,rel=2.5,bright=1.1,vib=1),45.75,0.7)
add(piano(38,5,1),45.78,0.8); add(piano(74,4,.6),45.8,.5); add(bell(90,3.5),45.82,0.12)
# 48.2–end gentle outro, ends where the opening begins (loop)
add(pad([43,55,59,62,66,71],3.6,att=1.0,rel=1.2,bright=.7),48.2,0.45)
add(pad([38,50,57,62,66,69,76],4.2,att=1.2,rel=0.0001,bright=.7),51.4,0.55)
for m,t0 in [(78,48.3),(76,49.4),(74,50.6),(73,51.5),(74,52.6),(69,53.6)]: add(piano(m,2.6,.4),t0,.45,.1)

# ---------------- foley ----------------
# wind bed (land scenes), quieter on the table
t=tt(DUR); w=lp(noise(DUR),500)*(0.5+0.5*np.sin(2*np.pi*0.07*t+1))
wenv=np.ones_like(t); wenv[(t>22.6)&(t<43.4)]=0.25
from scipy.ndimage import uniform_filter1d
wenv=uniform_filter1d(wenv,int(SR*1.0))
add(w*wenv*0.05,0,1,-.2); add(lp(noise(DUR),450)*wenv*0.05,0,1,.2)
# SOLD tag chime
add(bell(93,1.6),1.55,0.12,0.4)
# time-lapse clock ticks (accelerating)
tk=0; t0=3.6
while t0<4.95:
    c=bp(noise(.03),2500,6000)*np.exp(-tt(.03)*300); add(c,t0,0.25,0.2); t0+=max(0.05,0.16-(t0-3.6)*0.09)
add(lp(noise(1.4),3000)*np.sin(np.linspace(0,np.pi,int(1.4*SR)))**2*0.08,3.55,1.0)  # whoosh
# gate swing + CLANG at 6.45
sw=bp(noise(.45),300,1500)*np.linspace(0,1,int(.45*SR))**2*0.15; add(sw,6.0,1.0)
tc=tt(3.0); clang=np.zeros_like(tc)
for f,a,dc in [(143,1,1.2),(301,.8,1.6),(497,.6,2.2),(733,.45,2.8),(1021,.35,3.5),(1488,.25,5),(2213,.18,7),(3120,.12,9)]:
    clang+=a*np.sin(2*np.pi*f*tc*(1+0.002*np.sin(2*np.pi*4*tc)))*np.exp(-tc*dc)
clang+=bp(noise(3.0),800,6000)*np.exp(-tc*30)*1.2
thump=np.sin(2*np.pi*48*tc*(1+np.exp(-tc*20)))*np.exp(-tc*6)*1.4
add((clang*0.3+thump*0.5),6.45,0.85)
# chain rattle + padlock click
for k in range(9):
    tk=tt(.12); ting=sum(np.sin(2*np.pi*f*tk)*np.exp(-tk*40) for f in (2800+rng.random()*900,4300+rng.random()*900))*0.25
    add(ting,7.6+k*0.06+rng.random()*0.03,0.35,0.1)
for t0,g in [(8.62,0.5),(8.7,0.7)]: add(bp(noise(.03),1500,7000)*np.exp(-tt(.03)*250),t0,g)
# pen scratch as survey lines draw
for t0,d in [(13.0,1.2),(13.6,1.0),(14.0,1.2),(14.4,.9),(14.8,1.0),(15.3,.9)]:
    s=bp(noise(d),2500,7000)*(0.5+0.5*np.abs(np.sin(2*np.pi*7*tt(d))))*np.sin(np.linspace(0,np.pi,int(d*SR)))
    add(s*0.05,t0,1,(rng.random()-.5)*.6)
# paper slides
def paper(d=0.7): x=bp(noise(d),900,5500); e=np.sin(np.linspace(0,np.pi,len(x)))**1.5; return x*e*0.12
for t0,pn in [(22.15,0),(23.3,0),(31.95,.5),(32.15,.4),(32.3,.6),(37.85,-.2),(42.55,.4),(42.7,-.3)]:
    add(paper(),t0,1,pn)
# map line draw (soft)
add(bp(noise(1.3),2000,6000)*np.sin(np.linspace(0,np.pi,int(1.3*SR)))*0.03,19.4,1)
# stamp: wood knock + thud at 39.85
ts=tt(.6); add(np.sin(2*np.pi*90*ts*(1+0.8*np.exp(-ts*40)))*np.exp(-ts*14)*0.9+bp(noise(.6),600,3000)*np.exp(-ts*60)*0.6,39.85,0.7)
# dust whoosh 41.75
add(hp(noise(1.0),2000)*np.sin(np.linspace(0,np.pi,SR))**2*0.06,41.75,1,.3)
# gate creak (opening) 45.8–47.6
tcr=tt(1.8); fr=320+90*np.sin(2*np.pi*0.7*tcr)+40*np.sin(2*np.pi*3.1*tcr)
cr=np.sign(np.sin(2*np.pi*np.cumsum(fr)/SR))*0.5; cr=bp(cr,600,2400)*(np.abs(np.sin(2*np.pi*9*tcr))**3)*np.sin(np.linspace(0,np.pi,len(tcr)))
add(cr*0.05,45.8,1)

mix=np.stack([L,Rr],1)
# gentle loop smoothing: fade first/last 30 ms
f=int(0.03*SR); mix[:f]*=np.linspace(0,1,f)[:,None]; mix[-f:]*=np.linspace(1,0,f)[:,None]
mix/=np.max(np.abs(mix))*1.12
wavfile.write('score.wav',SR,(mix*32767).astype(np.int16))
print('ok',mix.shape)
