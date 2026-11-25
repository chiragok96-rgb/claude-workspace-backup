import sys
from PIL import Image
ts=sys.argv[2:];out=sys.argv[1];n=len(ts);cols=min(n,6);rows=(n+cols-1)//cols
c=Image.new('RGB',(cols*270,rows*480))
for i,t in enumerate(ts):
    im=Image.open(f'stills/s_{float(t):.2f}.jpg').resize((270,480));c.paste(im,((i%cols)*270,(i//cols)*480))
c.save(out)
