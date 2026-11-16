# Ground textures for the film, painted once with numpy (claude-drawing core): writes assets/*.png
#  patta.png   pattachitra cloth: coarse cotton, two coats of chalk + tamarind gum, burnished, a fine craquelure (greyscale height/tone)
#  weave.png   a close cotton weave, tiled (for the loom scenes)
#  wcpaper.png cold-press watercolour paper tooth
import sys, os
sys.path.insert(0, '/root/claude-drawing-skill/lib')
import numpy as np
from PIL import Image
from core import blur, noise2d
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
R = np.random.default_rng(5)

def save(a, name):
    Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, name)); print(name, a.shape)

# ---- patta: the cloth under the chalk ----
H, W = 1920, 1080
y, x = np.mgrid[0:H, 0:W].astype(np.float32)
warp = .5 + .5 * np.sin(x * 2 * np.pi / 3.1 + noise2d(H, W, 40, 2, 1) * 6)
weft = .5 + .5 * np.sin(y * 2 * np.pi / 3.4 + noise2d(H, W, 40, 2, 2) * 6)
cloth = (warp * weft) ** .7
slub = blur(R.random((H, W)).astype(np.float32), 1.2)
chalk = 1 - .5 * noise2d(H, W, 260, 5, 3) - .25 * noise2d(H, W, 60, 4, 4)       # uneven gesso thickness: thin coats show the weave
show = np.clip(.18 + .35 * (1 - chalk), 0, .5)
tone = 1 - show * (1 - cloth) * .55 - (slub - .5) * .04
# craquelure: thin dark polygons from a Voronoi-ish distance field
pts = R.random((2600, 2)) * [W, H]
from scipy.spatial import cKDTree
tr = cKDTree(pts); d, i = tr.query(np.stack([x.ravel(), y.ravel()], 1), k=2)
edge = (d[:, 1] - d[:, 0]).reshape(H, W)
crack = np.exp(-edge / .7) * np.clip((noise2d(H, W, 160, 3, 9) - .52) * 6, 0, 1)
tone -= crack * .07
burnish = blur(noise2d(H, W, 30, 3, 11), 2) * .05                          # the stone-burnished sheen: soft streaks
tone += burnish - .025
save(tone, 'patta.png')

# ---- weave: a tile of plain-weave cotton, 512 square, period 8 px ----
T = 512; yy, xx = np.mgrid[0:T, 0:T].astype(np.float32); P = 8
over = ((xx // P + yy // P) % 2).astype(np.float32)
u = (xx % P) / P; v = (yy % P) / P
warpT = np.sin(np.pi * u) ** .6; weftT = np.sin(np.pi * v) ** .6
w = np.where(over > 0, warpT * (.75 + .25 * np.sin(np.pi * v)), weftT * (.75 + .25 * np.sin(np.pi * u)))
w = w * (.9 + .1 * blur(R.random((T, T)).astype(np.float32), 1.5))
save(w, 'weave.png')

# ---- watercolour paper tooth ----
t = .5 + .5 * (noise2d(H, W, 6, 3, 21) - .5) * 1.4 + (noise2d(H, W, 90, 3, 22) - .5) * .25
save(t, "wcpaper.png")

# ---- the floor for jhoti: mud and cow-dung plaster washed with geru (red earth), trowelled smooth, a few hairline cracks ----
g1 = noise2d(H, W, 220, 5, 31); g2 = noise2d(H, W, 30, 4, 32); g3 = noise2d(H, W, 3, 2, 33)
trowel = blur(np.sin(y / 23 + noise2d(H, W, 180, 3, 34) * 9 + x / 61) * .5 + .5, 6)
fl = .62 + .22 * (g1 - .5) + .1 * (g2 - .5) + .08 * (g3 - .5) + .05 * (trowel - .5)
pts = R.random((500, 2)) * [W, H]; tr = cKDTree(pts); d, i = tr.query(np.stack([x.ravel(), y.ravel()], 1), k=2)
edge = (d[:, 1] - d[:, 0]).reshape(H, W); fl -= np.exp(-edge / .8) * np.clip((noise2d(H, W, 200, 3, 35) - .6) * 5, 0, 1) * .12
save(fl, 'floor.png')

# ---- the legend's whole floor (world 2160 x 5760, world y = image y - 2400): same plaster, larger ----
BW, BH = 2160, 5760
by, bx = np.mgrid[0:BH, 0:BW].astype(np.float32)
f1 = noise2d(BH, BW, 300, 5, 41); f2 = noise2d(BH, BW, 40, 4, 42); f3 = noise2d(BH, BW, 3, 2, 43)
tro = blur(np.sin(by / 23 + noise2d(BH, BW, 220, 3, 44) * 9 + bx / 61) * .5 + .5, 6)
fb = .62 + .22 * (f1 - .5) + .1 * (f2 - .5) + .08 * (f3 - .5) + .05 * (tro - .5)
pts = R.random((1800, 2)) * [BW, BH]; tr = cKDTree(pts); d, i = tr.query(np.stack([bx.ravel(), by.ravel()], 1), k=2)
edge = (d[:, 1] - d[:, 0]).reshape(BH, BW); fb -= np.exp(-edge / .8) * np.clip((noise2d(BH, BW, 240, 3, 45) - .6) * 5, 0, 1) * .12
save(fb, 'floor_big.png')
