"""The sea of the Sadhabas at night, from real elevation + bathymetry (Terrarium tiles, zoom 6):
India's east coast (Kalinga) across the Bay of Bengal to Sumatra, Java and Bali. Moonlit relief, warm land, deep teal sea.
Writes plates/map.png (2560x2304 Web-Mercator, tiles x 45..54, y 26..34) and plates/map_meta.json (projection)."""
import os, json, math, numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, zoom
HERE = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(HERE, '..', 'tiles'); OUT = os.path.join(HERE, '..', 'plates')
X0, X1, Y0, Y1, Z = 90, 109, 52, 69, 7
W, H = (X1 - X0 + 1) * 256, (Y1 - Y0 + 1) * 256
el = np.zeros((H, W), np.float32)
for x in range(X0, X1 + 1):
    for y in range(Y0, Y1 + 1):
        a = np.asarray(Image.open(os.path.join(T, f'z7_{x}_{y}.png')).convert('RGB'), np.float32)
        el[(y - Y0) * 256:(y - Y0 + 1) * 256, (x - X0) * 256:(x - X0 + 1) * 256] = a[..., 0] * 256 + a[..., 1] + a[..., 2] / 256 - 32768
land = el > 0
def ss(a, b, x): x = np.clip((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)
# hillshade, moon from the upper left
e = gaussian_filter(np.where(land, el, el * .25), 1.4); gy, gx = np.gradient(e)
k = .02; nx, ny, nz = -gx * k, -gy * k, np.ones_like(e); nl = np.sqrt(nx * nx + ny * ny + nz * nz); nx, ny, nz = nx / nl, ny / nl, nz / nl
L = np.array([-.55, -.6, .58]); L /= np.linalg.norm(L); hs = np.clip(nx * L[0] + ny * L[1] + nz * L[2], 0, 1)
img = np.zeros((H, W, 3), np.float32)
# the sea: deep teal-black, shelves lighter, a soft glow along the coasts
d = -np.minimum(el, 0)
sea = np.stack([np.interp(d, [0, 60, 200, 1500, 4000, 6000], c) for c in ([.12, .09, .06, .035, .025, .02], [.22, .17, .12, .07, .05, .04], [.22, .17, .12, .075, .055, .045])], -1)
sea *= (.85 + .3 * hs)[..., None]
img = np.where(land[..., None], 0, sea)
# land: warm charcoal, lifted by moonlight on the slopes; high ground pale
h01 = np.clip(el / 3000, 0, 1)
base = np.stack([.13 + .1 * h01, .115 + .08 * h01, .095 + .06 * h01], -1)
lit = base * (.45 + 1.25 * hs[..., None]) + (h01 ** 1.5)[..., None] * np.array([.18, .17, .15])
img = np.where(land[..., None], lit, img)
# a warm gold coastline and a faint halo of shallow water
cm = land.astype(np.float32); edge = np.clip(gaussian_filter(cm, 1.4) * (1 - cm) * 4, 0, 1)
img += edge[..., None] * np.array([.55, .42, .22]) * .55
halo = gaussian_filter(cm, 16) * (1 - cm); img += halo[..., None] * np.array([.05, .09, .09])
# graticule every 5 degrees (nautical), very faint
def lon2x(lon): return ((lon + 180) / 360 * 2 ** Z - X0) * 256
def lat2y(lat): r = math.radians(lat); return ((1 - math.log(math.tan(r) + 1 / math.cos(r)) / math.pi) / 2 * 2 ** Z - Y0) * 256
gr = np.zeros((H, W), np.float32)
for lon in range(75, 130, 5): x = int(round(lon2x(lon))); gr[:, max(0, x - 1):x + 2] = 1
for lat in range(-15, 30, 5): y = int(round(lat2y(lat))); gr[max(0, y - 1):y + 2, :] = 1
gr = gaussian_filter(gr, .6); img += gr[..., None] * np.array([.5, .4, .25]) * .07
img += np.random.default_rng(2).standard_normal((H, W, 1)).astype(np.float32) * .008
Image.fromarray((np.clip(img, 0, 1) ** (1 / 1.1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'map.png'))
Image.fromarray((land * 255).astype(np.uint8)).save(os.path.join(OUT, 'land.png'))
json.dump({'W': W, 'H': H, 'X0': X0, 'Y0': Y0, 'Z': Z}, open(os.path.join(OUT, 'map_meta.json'), 'w'))
print('map', W, H, 'Cuttack px', lon2x(85.88), lat2y(20.46), 'Bali px', lon2x(115.19), lat2y(-8.41))
