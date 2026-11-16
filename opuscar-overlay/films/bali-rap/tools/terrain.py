# Terrarium elevation tiles (AWS open data; land and bathymetry, metres) -> one heightmap PNG (16-bit) for the voyage region.
import math, io, os, sys, urllib.request, numpy as np
from PIL import Image
Z = 6; LON0, LON1, LAT0, LAT1 = 78, 122, -14, 26
def tile(lon, lat): n = 2 ** Z; x = (lon + 180) / 360 * n; y = (1 - math.log(math.tan(math.radians(lat)) + 1 / math.cos(math.radians(lat))) / math.pi) / 2 * n; return x, y
x0, y0 = tile(LON0, LAT1); x1, y1 = tile(LON1, LAT0)
X0, Y0, X1, Y1 = int(x0), int(y0), int(x1), int(y1)
out = np.zeros(((Y1 - Y0 + 1) * 256, (X1 - X0 + 1) * 256), np.float32)
for ty in range(Y0, Y1 + 1):
    for tx in range(X0, X1 + 1):
        u = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{Z}/{tx}/{ty}.png'
        im = np.asarray(Image.open(io.BytesIO(urllib.request.urlopen(u, timeout=30).read())).convert('RGB')).astype(np.float32)
        h = im[..., 0] * 256 + im[..., 1] + im[..., 2] / 256 - 32768
        out[(ty - Y0) * 256:(ty - Y0 + 1) * 256, (tx - X0) * 256:(tx - X0 + 1) * 256] = h
D = os.path.join(os.path.dirname(__file__), '..', 'data')
# crop to the exact lon/lat box (web mercator pixels)
px0, py0, px1, py1 = int((x0 - X0) * 256), int((y0 - Y0) * 256), int((x1 - X0) * 256), int((y1 - Y0) * 256)
out = out[py0:py1, px0:px1]
enc = np.clip((out + 11000) / 20000 * 65535, 0, 65535).astype(np.uint32)
rgb = np.stack([enc >> 8, enc & 255, np.zeros_like(enc)], -1).astype(np.uint8)
Image.fromarray(rgb, 'RGB').save(os.path.join(D, 'height.png'))
import json; json.dump({'lon0': LON0, 'lon1': LON1, 'lat0': LAT0, 'lat1': LAT1, 'w': out.shape[1], 'h': out.shape[0], 'zmin': -11000, 'zrange': 20000, 'merc': True}, open(os.path.join(D, 'height.json'), 'w'))
print(out.shape, out.min(), out.max())
