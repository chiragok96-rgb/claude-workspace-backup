import sys, glob, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5
fs = sorted(glob.glob(d + '/t_*.jpg'), key=lambda f: float(os.path.basename(f)[2:-4]))
tw, th = 270, 480; rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (cols * (tw + 6), rows * (th + 26)), 'white'); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).resize((tw, th)); x, y = (i % cols) * (tw + 6), (i // cols) * (th + 26); sh.paste(im, (x, y + 22)); dr.text((x + 4, y + 4), os.path.basename(f)[2:-4], fill='black')
sh.save(out, quality=85)
