# paper (watercolor sheet) and pulp mottle (lightbox) textures, deterministic
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
rng=np.random.default_rng(7)
def smooth(W,H,scale):
    h,w=H//scale+2,W//scale+2
    n=rng.standard_normal((h,w)).astype(np.float32)
    im=Image.fromarray(((n-n.min())/(n.max()-n.min())*255).astype(np.uint8)).resize((W+2*scale,H+2*scale),Image.BICUBIC)
    return np.asarray(im,np.float32)[scale:scale+H,scale:scale+W]/255-0.5
def paper(W,H,base,out):
    m=smooth(W,H,240)*0.9+smooth(W,H,90)*0.5+smooth(W,H,25)*0.25
    img=np.array(base,np.float32)[None,None,:]*(1+m[...,None]*0.035)
    fib=Image.new('L',(W,H),0); d=ImageDraw.Draw(fib)
    for _ in range(int(W*H/800)):
        x,y=rng.uniform(0,W),rng.uniform(0,H); a=rng.uniform(0,np.pi); L=rng.uniform(8,40); pts=[(x,y)]
        for k in range(4): a+=rng.normal(0,.35); x+=np.cos(a)*L/4; y+=np.sin(a)*L/4; pts.append((x,y))
        d.line(pts,fill=int(rng.uniform(40,140)),width=1)
    fib=np.asarray(fib.filter(ImageFilter.GaussianBlur(.6)),np.float32)/255
    sign=np.where(smooth(W,H,6)>0,1,-1)
    img=img*(1-fib[...,None]*0.035*sign[...,None]); img+=rng.normal(0,1.6,(H,W,1))
    yy,xx=np.mgrid[0:H,0:W]; v=((xx-W/2)/(W*.62))**2+((yy-H/2)/(H*.62))**2
    img*=(1-0.05*np.clip(v,0,1.5))[...,None]
    Image.fromarray(np.clip(img,0,255).astype(np.uint8)).save(out,quality=95)
paper(1080,2400,(244,228,200),'assets/paper.jpg')          # warm cream #F4E4C8, tall for the tilt
# pulp mottle: grey cloud (lightbox translucency), 1080x1920
m=smooth(1080,1920,160)*.6+smooth(1080,1920,60)*.3+smooth(1080,1920,18)*.2
m=(m-m.min())/(m.max()-m.min())
Image.fromarray((m*255).astype(np.uint8)).save('assets/pulp.png')
# fibre grain (alpha) for paper sheets
g=Image.new('L',(1080,1920),0); d=ImageDraw.Draw(g)
for _ in range(9000):
    x,y=rng.uniform(0,1080),rng.uniform(0,1920); a=rng.uniform(0,np.pi); L=rng.uniform(6,30)
    d.line([(x,y),(x+np.cos(a)*L,y+np.sin(a)*L)],fill=int(rng.uniform(60,200)),width=1)
g=g.filter(ImageFilter.GaussianBlur(.5)); Image.fromarray(np.asarray(g)).save('assets/fibre.png')
print('ok')
