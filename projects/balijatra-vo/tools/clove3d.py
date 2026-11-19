"""A photoreal clove (Syzygium aromaticum bud), ray-marched from a signed-distance model, backlit by the dawn sun.
Writes plates/clove/c_XX.png: 45 views spinning 0..88 degrees about its own axis (the bud is 4-fold symmetric, so they loop).
Run: $LIB/.venv/bin/python tools/clove3d.py"""
import os, numpy as np
from PIL import Image
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates', 'clove'); os.makedirs(OUT, exist_ok=True)
W, H, SS = 360, 954, 2
X0, X1, Y0, Y1 = -.2, .2, -.66, .40

def smin(a, b, k):
    h = np.clip(.5 + .5 * (b - a) / k, 0, 1); return b * (1 - h) + a * h - k * h * (1 - h)
def sstep(a, b, x): x = np.clip((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)
def round_cone(px, py, pz, ax, ay, az, bx, by, bz, ra, rb):
    bax, bay, baz = bx - ax, by - ay, bz - az; l2 = bax * bax + bay * bay + baz * baz
    pax, pay, paz = px - ax, py - ay, pz - az; h = np.clip((pax * bax + pay * bay + paz * baz) / l2, 0, 1)
    dx, dy, dz = pax - bax * h, pay - bay * h, paz - baz * h; return np.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * h)

def sdf(x, y, z, want_id=False):
    th = np.arctan2(z, x); q = np.sqrt(x * x + z * z)
    r = .036 + .036 * sstep(-.62, .16, y) + .004 * np.exp(-((y + .1) / .2) ** 2)
    sq = q * (1 + .075 * np.cos(4 * th))
    wr = .0014 * np.sin(36 * th + 2.2 * np.sin(13 * y)) + .0006 * np.sin(40 * y + 5 * th)
    d_stem = np.maximum(sq - r + wr, np.maximum(-.6 - y, y - .17))
    d_stem = np.minimum(d_stem, np.sqrt(x * x + (y + .6) ** 2 + z * z) - .036)   # the rounded foot
    d_sep = np.full_like(x, 9.0)
    for k in range(4):
        a = k * np.pi / 2 + np.pi / 4; c, s = np.cos(a), np.sin(a)
        d_sep = np.minimum(d_sep, round_cone(x, y, z, .05 * c, .13, .05 * s, .112 * c, .262, .112 * s, .04, .009))
    hy = y - .262; hq = np.sqrt(x * x + hy * hy + z * z)
    hth = np.arctan2(z, x); ph = np.arccos(np.clip(hy / np.maximum(hq, 1e-6), -1, 1))
    d_head = hq - .080 - .005 * np.abs(np.cos(2 * hth)) * np.sin(ph) - .0025 * np.sin(4 * hth + 3 * ph) * np.sin(ph)
    d = smin(smin(d_stem, d_sep, .022), d_head, .018)
    if want_id:
        return d, np.argmin(np.stack([d_stem, d_sep + .004, d_head + .002]), 0)
    return d

def render(phi):
    w, h = W * SS, H * SS
    xs = np.linspace(X0, X1, w); ys = np.linspace(Y1, Y0, h); PX, PY = np.meshgrid(xs, ys)
    PX, PY = PX.ravel(), PY.ravel(); PZ = np.full_like(PX, .5)   # orthographic rays along -z
    c, s = np.cos(phi), np.sin(phi)
    def S(x, y, z, **k): return sdf(c * x + s * z, y, -s * x + c * z, **k)
    t = np.zeros_like(PX); hit = np.zeros(PX.shape, bool); act = np.ones(PX.shape, bool)
    for _ in range(90):
        i = np.where(act)[0]
        if not len(i): break
        d = S(PX[i], PY[i], PZ[i] - t[i]); t[i] += d * .9
        hit[i[d < 4e-4]] = True; act[i[(d < 4e-4) | (t[i] > 1.0)]] = False
    i = np.where(hit)[0]; x, y, z = PX[i], PY[i], PZ[i] - t[i]
    e = 6e-4
    nx = S(x + e, y, z) - S(x - e, y, z); ny = S(x, y + e, z) - S(x, y - e, z); nz = S(x, y, z + e) - S(x, y, z - e)
    nl = np.sqrt(nx * nx + ny * ny + nz * nz) + 1e-9; nx, ny, nz = nx / nl, ny / nl, nz / nl
    _, part = S(x, y, z, want_id=True)
    ao = np.ones_like(x)
    for k in range(1, 6):
        hd = .012 * k; ao -= (hd - S(x + nx * hd, y + ny * hd, z + nz * hd)) * (2.2 / k) * 1.6
    ao = np.clip(ao, .25, 1)
    def L(v): v = np.array(v, float); return v / np.linalg.norm(v)
    key, rim, fill = L([-.55, .55, .63]), L([.7, .25, -.67]), L([.6, -.3, .75])
    ndk = np.clip(nx * key[0] + ny * key[1] + nz * key[2], 0, 1)
    ndf = np.clip(nx * fill[0] + ny * fill[1] + nz * fill[2], 0, 1)
    fres = np.clip(1 - nz, 0, 1) ** 2.6   # view is +z
    rimw = np.clip(nx * rim[0] + ny * rim[1] + nz * rim[2] + .55, 0, 1)
    hx, hy_, hz = key[0], key[1], key[2] + 1; hl = np.sqrt(hx * hx + hy_ * hy_ + hz * hz)
    spec = np.clip((nx * hx + ny * hy_ + nz * hz) / hl, 0, 1) ** 46
    rng = np.random.default_rng(3); var = 1 + .12 * np.sin(57 * y + 13 * np.arctan2(z, x)) * np.sin(31 * y)
    alb = np.zeros((len(x), 3))
    alb[part == 0] = [.23, .095, .05]; alb[part == 1] = [.27, .11, .055]; alb[part == 2] = [.36, .2, .1]
    alb *= var[:, None]; alb[part == 0] *= (1 - .25 * sstep(-.1, -.6, y[part == 0]))[:, None]
    col = alb * (np.array([1.0, .82, .62]) * ndk[:, None] * 2.0 + np.array([.46, .3, .22]) * (.5 + .5 * ndf)[:, None]) * ao[:, None]
    col += np.array([1.0, .68, .32]) * (fres * rimw * 1.25)[:, None] * (.55 + .45 * ao)[:, None]
    col += np.array([1.0, .9, .75]) * (spec * .16 * (part != 2) + spec * .12 * (part == 2))[:, None]
    col = np.clip(col, 0, 1) ** (1 / 1.15)
    img = np.zeros((h * w, 4)); img[i, :3] = col; img[i, 3] = 1
    img = img.reshape(h, w, 4).reshape(H, SS, W, SS, 4).mean((1, 3))
    rgb = np.where(img[..., 3:] > 0, img[..., :3] / np.maximum(img[..., 3:], 1e-6), 0)
    return Image.fromarray((np.concatenate([rgb, img[..., 3:]], -1) * 255).astype(np.uint8), 'RGBA')

if __name__ == '__main__':
    import sys
    n = 45; idx = range(n) if len(sys.argv) < 2 else map(int, sys.argv[1:])
    for k in idx:
        render(np.radians(k * 2.0)).save(os.path.join(OUT, f'c_{k:02d}.png')); print('clove', k, flush=True)
