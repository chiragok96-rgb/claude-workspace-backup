"""Watercolour plates for Radha Pada Darshan (claude-drawing Watercolor). python wc.py <frame> <out.png>
Frames: hook (the hem over the hidden feet, the fringe of days), amla (feet round the amla tree, the thread), queue (the line to
Sakshigopal at dawn), reveal (the feet under the Odia saree), besha (Radha and Gopinath's feet, Odiani and Natabara besha)."""
import sys, os
sys.path.insert(0, '/root/claude-drawing-skill/lib')
import numpy as np
from watercolor import Watercolor, hexc
from core import polygon_mask, blur, blob_pts
W, H = 1080, 1920
C = {k: hexc(v) for k, v in dict(skin='#e8b48e', skinS='#b97d5c', alta='#c32a1a', gold='#d4a13a', goldD='#9c6b1f', red='#9d1c18', redD='#5e0f0d',
     maroon='#4a0c0b', stone='#b7a487', stoneD='#7d6a55', dark='#2a1712', bark='#7b6656', barkD='#4d3e33', leaf='#6f8f45', leafD='#3f5a2a',
     amla='#c3cf7e', blue='#3d5f9e', blueD='#1f3768', yel='#e3b23c', sky='#f4c99a', skyT='#8fa6c8', earth='#c6a27a', black='#1d1712',
     cream='#f1e6cf', green='#2f6b4f', saffron='#e08a2c', marigold='#e9a12a').items()}

def bez(p0, p1, p2, p3, n=24):
    t = np.linspace(0, 1, n)[:, None]; u = 1 - t
    return [tuple(r) for r in u**3 * np.array(p0, float) + 3 * u * u * t * np.array(p1, float) + 3 * u * t * t * np.array(p2, float) + t**3 * np.array(p3, float)]
def circ(cx, cy, r, n=28, ry=None): return [(cx + r * np.cos(a), cy + (ry or r) * np.sin(a)) for a in np.linspace(0, 2 * np.pi, n, endpoint=False)]

def foot_pts(cx, gy, s, m, leg=230, rot=0.0, sx=1.0):
    seg = bez((-34, -leg), (-36, -190), (-42, -150), (-46, -122)) + bez((-46, -122), (-56, -100), (-50, -88), (-54, -70)) + bez((-54, -70), (-62, -48), (-64, -26), (-58, -12))
    for (tx, r) in [(-50, 8), (-34, 11), (-16, 12), (4, 14), (32, 19)]:
        seg += [(tx + np.cos(t) * r, -12 + np.sin(t) * r * 1.05) for t in np.linspace(np.pi, 0, 14)]
    seg += bez((51, -12), (58, -40), (48, -78), (36, -108)) + bez((36, -108), (40, -126), (32, -140), (30, -160)) + bez((30, -160), (28, -190), (30, -210), (30, -leg))
    c, sn = np.cos(rot), np.sin(rot)
    return [(cx + (m * x * sx * c - y * sn) * s, gy + (m * x * sx * sn + y * c) * s) for x, y in seg]

def paint_foot(p, cx, gy, s, m, skin=None, shade=None, alta=True, anklet=True, leg=230, rot=0.0, sx=1.0, toering=True):
    skin = C['skin'] if skin is None else skin; shade = C['skinS'] if shade is None else shade
    pts = foot_pts(cx, gy, s, m, leg, rot, sx); f = p.shape(pts, soft=1.4, ragged=.08)
    p.glaze(f, skin, 0.78, edge=0.45, gran=0.12, variation=.12)
    inner = polygon_mask(H, W, foot_pts(cx + m * 9 * s, gy - 4 * s, s * .93, m, leg, rot, sx), ss=2)
    p.glaze(p.soften(f * (1 - inner), 7, .25) * f, shade, 0.5, edge=0.25, gran=0.25)
    for (tx, r) in [(-34, 11), (-16, 12), (4, 14)]:   # the creases between the toes
        x0, y0 = cx + m * (tx + r) * s * sx, gy - 18 * s
        p.line([(x0, y0), (x0 - m * 1.5, gy - 4 * s)], 1.0, shade * .8, .5)
    gy_ = gy
    if alta:
        rim = f * (p.YY > gy - 21 * s)
        p.glaze(p.soften(rim, 1.0, .1), C['alta'], 0.95, edge=0.7, gran=0.15)
        dx, dy = cx, gy - 66 * s
        p.glaze(p.shape(circ(dx, dy, 13 * s), soft=1), C['alta'], 0.92, edge=.7)
        p.lift(p.shape(circ(dx, dy, 4.5 * s), soft=.6), .7)
        for a in np.linspace(0, 2 * np.pi, 11)[:-1]:
            p.glaze(p.shape(circ(dx + 25 * s * np.cos(a), dy + 25 * s * np.sin(a), 3.2 * s, 12), soft=.6), C['alta'], 0.9, edge=.5)
    if toering:
        x0 = cx + m * 6 * s * sx; p.glaze(p.shape([(x0 - 7 * s, gy - 30 * s), (x0 + 7 * s, gy - 30 * s), (x0 + 7 * s, gy - 24 * s), (x0 - 7 * s, gy - 24 * s)], soft=.6), hexc('#cfc8b8'), .7, edge=.6)
    if anklet:
        ay = gy - 126 * s
        band = p.band([(cx - m * 52 * s, ay + 4 * s), (cx - m * 10 * s, ay + 12 * s), (cx + m * 38 * s, ay - 2 * s)], 9 * s, soft=.8)
        p.glaze(band * f, C['gold'], 0.85, edge=0.6, gran=0.3)
        for i in range(9):
            x = cx + m * (-46 + i * 10.5) * s; y = ay + 17 * s + np.sin(i / 8 * np.pi) * 4 * s
            p.glaze(p.shape(circ(x, y, 4.6 * s, 14), soft=.6), C['gold'], 0.85, edge=.6)
            p.lift(p.shape(circ(x - 1.2 * s, y - 1.5 * s, 1.6 * s, 8), soft=.4), .6)
    return f

def glow(p, cx, cy, r, amount=.85, soft=None):
    m = np.exp(-((p.XX - cx) ** 2 + (p.YY - cy) ** 2) / (2 * r * r)); p.lift(m, amount)

def pedestal(p, cx, gy, w, h=170):
    top = p.shape([(cx - w / 2, gy), (cx + w / 2, gy), (cx + w / 2 + 16, gy + 34), (cx - w / 2 - 16, gy + 34)], soft=1.5)
    p.glaze(top, C['stone'], .55, edge=.5, gran=.7)
    face = p.shape([(cx - w / 2 - 16, gy + 34), (cx + w / 2 + 16, gy + 34), (cx + w / 2 + 16, gy + h), (cx - w / 2 - 16, gy + h)], soft=1.5)
    p.glaze(face, C['stoneD'], .6, edge=.5, gran=.8)
    for yy in (gy + 64, gy + 74, gy + 120):
        p.line([(cx - w / 2 - 14, yy), (cx + w / 2 + 14, yy)], 1.3, C['dark'], .45)
    for x in np.arange(cx - w / 2 + 10, cx + w / 2, 34):   # a carved petal course
        p.glaze(p.shape(bez((x, gy + 118), (x + 6, gy + 96), (x + 22, gy + 96), (x + 28, gy + 118)) + [(x, gy + 118)], soft=1), C['dark'], .3, edge=.6)

def hem(p, x0, x1, top, hy, colour, border, border_h=70, wave=10, seed=0):
    """a long garment falling to hy: pleats (shadow bands), a border band at the bottom"""
    rng = np.random.default_rng(seed)
    bottom = [(x, hy + np.sin(x / 47 + seed) * wave * .4) for x in np.linspace(x1, x0, 40)]
    m = p.shape([(x0 + 20, top), (x1 - 20, top)] + [(x1, hy)] + bottom + [(x0, hy)], soft=1.6, ragged=.12)
    p.glaze(m, colour, .9, edge=.55, gran=.25)
    p.glaze(m, colour, .45, edge=.3, gran=.2)
    for x in np.arange(x0 + 40, x1 - 20, 46 + rng.integers(0, 14)):
        p.glaze(p.band([(x + rng.normal() * 4, top), (x + rng.normal() * 6, hy - 20)], 12 + rng.integers(0, 10), soft=7) * m, C['redD'] if colour is C['red'] else colour * .5, .35, edge=.2)
    bm = m * (p.YY > hy - border_h)
    p.glaze(bm, border, .85, edge=.55, gran=.3)
    return m, bm

def save(p, out): p.save(out); print('saved', out)

# ------------------------------------------------------------------ frames
def hook(out):
    """S1: the sanctum at night: the hem rests on the pedestal, the feet are hidden; its fringe of threads, one red."""
    p = Watercolor(W, H, seed=11, paper_tone='#f3ead9'); p.paper()
    p.glaze(np.ones((H, W), np.float32), C['dark'], .92, edge=0, gran=.35)
    p.glaze(np.ones((H, W), np.float32), hexc('#5a2a18'), .5, edge=0, gran=.3)
    glow(p, 540, 860, 420, .55); glow(p, 540, 1120, 240, .35)
    pedestal(p, 540, 1150, 820)
    m, bm = hem(p, 170, 910, -20, 1090, C['red'], C['gold'], 64, seed=2)
    for x in np.arange(196, 900, 36):   # mirror-work on the gota border
        p.glaze(p.shape(circ(x, 1058, 9), soft=.6) * bm, C['dark'], .6, edge=.8); p.lift(p.shape(circ(x - 1, 1056, 5), soft=.4), .8)
    # the fringe: one thread for each day of the year (we see ~180 of them), all dark gold; one is alta red and hangs longer
    rng = np.random.default_rng(4)
    for i, x in enumerate(np.linspace(186, 894, 178)):
        L = 46 + rng.integers(-5, 6); col = C['goldD']
        p.line([(x, 1088 + np.sin(x / 47 + 2) * 4), (x + rng.normal() * 1.2, 1088 + L)], 1.3, col, .7)
    xr = 612; p.stroke([(xr, 1090), (xr + 1, 1150), (xr - 2, 1210), (xr + 1, 1262)], 3.0, C['alta'], .95, dry=.05, taper=(0, .1), jitter=.1)
    # the gap under the hem: only a line of lamplight on the stone
    p.lift(p.shape([(250, 1138), (830, 1138), (830, 1148), (250, 1148)], soft=3), .5)
    save(p, out)

def amla(out):
    """S2: Aonla Navami morning: the amla trunk, the red thread wound round it, women's feet circling, fallen amla, a diya."""
    p = Watercolor(W, H, seed=21, paper_tone='#f6efe0'); p.paper()
    p.gradient_wash(0, 900, top=hexc('#cfdcc0'), bottom=hexc('#f3e4c4'), strength=.55)
    p.glaze(p.shape([(0, 900), (W, 860), (W, H), (0, H)], soft=20), C['earth'], .55, edge=.2, gran=.6)
    # foliage at the top: feathery amla leaves in soft clusters
    rng = np.random.default_rng(3)
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(-80, 260), rng.uniform(120, 220), rng.uniform(60, 120)) for _ in range(9)], soft=12), C['leaf'], .55, edge=.4, gran=.4)
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(-60, 200), rng.uniform(80, 160), rng.uniform(40, 80)) for _ in range(8)], soft=6), C['leafD'], .45, edge=.5, gran=.4)
    for _ in range(16): x, y = rng.uniform(40, W - 40), rng.uniform(40, 300); p.glaze(p.shape(circ(x, y, 14), soft=1.2), C['amla'], .8, edge=.6)
    # trunk: organic, flaring into roots at the ground, forking into two limbs that vanish into the canopy
    trunk = p.shape(bez((300, 60), (380, 220), (450, 300), (470, 420)) + bez((470, 420), (470, 600), (440, 820), (330, 990)) + bez((330, 990), (420, 975), (480, 960), (540, 965))
                    + bez((540, 965), (620, 960), (700, 975), (790, 1000)) + bez((790, 1000), (680, 850), (640, 640), (650, 430)) + bez((650, 430), (680, 300), (760, 200), (860, 60))
                    + bez((860, 60), (760, 130), (620, 230), (566, 330)) + bez((566, 330), (520, 220), (420, 120), (390, 60)), soft=2.5, ragged=.25)
    p.glaze(trunk, C['bark'], .7, edge=.55, gran=.8)
    p.glaze(trunk * np.clip((p.XX - 560) / 140, 0, 1), C['barkD'], .5, edge=.3, gran=.7)
    rng2 = np.random.default_rng(9)
    for k in range(14):
        x = rng2.uniform(470, 650); y0 = rng2.uniform(380, 700)
        p.stroke(bez((x, y0), (x - 4, y0 + 80), (x + 6, y0 + 160), (x - 8 + (x - 560) * .3, y0 + rng2.uniform(200, 330)), 20), rng2.uniform(2, 5), C['barkD'], .35, dry=.7, taper=(.3, .5))
    for (x0, x1) in ((330, 250), (790, 900)):
        p.glaze(p.shape(bez((x0 - 30, 980), (x0 + (x1 - x0) * .4, 1000), (x1, 1010), (x1, 1030)) + [(x0 + 60, 1000)], soft=3), C['barkD'], .45, edge=.4, gran=.6)
    # the red thread wound round the trunk (the visible front arcs), and its loose end running off to the right
    for k, yy in enumerate(np.arange(560, 760, 18)):
        x0 = 410 - (yy - 560) * .06; x1 = 668 + (yy - 560) * .02
        p.stroke(bez((x0, yy), (x0 + 60, yy + 12), (x1 - 60, yy + 12), (x1, yy - 2), 30), 3.2, C['alta'], .92, dry=.05, taper=(0, 0), jitter=.1)
    p.stroke(bez((668, 742), (760, 760), (900, 900), (1100, 960), 40), 3.2, C['alta'], .92, dry=.05, taper=(0, 0), jitter=.1)
    # sindoor and kumkum dabs on the bark
    for x, y in [(520, 520), (546, 528), (532, 498)]: p.glaze(p.shape(circ(x, y, 7), soft=1), C['alta'], .9, edge=.6)
    # women's feet circling (two pairs), saree hems above them
    for (cx, gy, s, m, sar, bor) in [(230, 1290, .95, 1, C['red'], C['black']), (850, 1350, 1.0, -1, hexc('#c8901c'), C['green'])]:
        hm, _ = hem(p, cx - 120, cx + 120, 960, gy - 196 * s, sar, bor, 36, seed=int(cx))
        paint_foot(p, cx - 40 * s, gy, s * .9, 1, leg=200); paint_foot(p, cx + 46 * s, gy - 16, s * .9, -1, leg=210)
    # fallen amla, a brass diya with a flame, a leaf plate with kumkum
    for x, y in [(560, 1180), (610, 1205), (520, 1222), (690, 1170)]: p.glaze(p.shape(circ(x, y, 17), soft=1.2), C['amla'], .85, edge=.6); p.lift(p.shape(circ(x - 5, y - 6, 5), soft=1), .5)
    p.glaze(p.shape(bez((470, 1060), (500, 1100), (580, 1100), (610, 1060)) + [(470, 1060)], soft=1), C['gold'], .85, edge=.6, gran=.3)
    p.glaze(p.shape(bez((540, 1062), (526, 1040), (536, 1012), (540, 1000)) + bez((540, 1000), (546, 1014), (556, 1040), (540, 1062)), soft=2), C['saffron'], .8, edge=.3)
    glow(p, 540, 1035, 60, .4)
    save(p, out)

def queue(out):
    """S3: dawn over the plain: the red thread runs to the horizon, and along it the line of people to Sakshigopal's tower."""
    p = Watercolor(W, H, seed=31, paper_tone='#f7efe1'); p.paper()
    p.gradient_wash(0, 760, top=hexc('#e9b78f'), bottom=hexc('#f7e3c4'), strength=.6)
    p.glaze(p.shape(circ(700, 560, 46), soft=2), hexc('#f0a35c'), .55, edge=.3)
    # the tower (rekha deula): curved spire, amalaka, flag
    sp = bez((560, 760), (566, 600), (586, 470), (612, 430)) + bez((612, 430), (624, 420), (636, 420), (648, 430)) + bez((648, 430), (674, 470), (694, 600), (700, 760))
    p.glaze(p.shape(sp, soft=1.5), hexc('#9b7a66'), .6, edge=.5, gran=.5)
    p.glaze(p.shape(circ(630, 418, 22, ry=9), soft=1), hexc('#7b5e4e'), .7, edge=.5)
    p.line([(630, 408), (630, 340)], 1.5, C['dark'], .7); p.glaze(p.shape([(630, 340), (676, 352), (630, 366)], soft=.8), C['saffron'], .85, edge=.6)
    for yy in range(470, 760, 22): p.line([(574 + (760 - yy) * .03, yy), (686 - (760 - yy) * .03, yy)], 1.0, C['dark'], .25)
    p.glaze(p.shape([(380, 760), (860, 760), (860, 800), (380, 800)], soft=6), hexc('#8a6b58'), .45, edge=.3)
    # the plain and the trees on the horizon
    p.glaze(p.shape([(0, 770), (W, 760), (W, H), (0, H)], soft=10), hexc('#cdb48e'), .5, edge=.2, gran=.5)
    rng = np.random.default_rng(8)
    p.glaze(p.blobs([(x, 770, rng.uniform(30, 60), rng.uniform(18, 34)) for x in list(np.arange(0, 380, 50)) + list(np.arange(880, W + 40, 50))], soft=5), hexc('#6c7a4e'), .5, edge=.4)
    # the line: a red thread from the foreground to the temple gate, people along it (heads and shoulders, saree colours)
    path = bez((1040, 1330), (420, 1260), (960, 1000), (620, 800), 360)
    p.stroke(path, 3.0, C['alta'], .9, dry=.05, taper=(0, .6), jitter=.15)
    for i, (x, y) in enumerate(path[::4]):
        s = .25 + .95 * ((y - 800) / 530) ** 1.2
        col = [C['red'], C['yel'], hexc('#f1ece0'), C['green'], C['saffron'], hexc('#c25b7a')][i % 6]
        off = (rng.normal() * 6 * s, -rng.uniform(4, 10) * s)
        bx, by = x + off[0] - 18 * s, y + off[1]
        p.glaze(p.shape(bez((bx - 11 * s, by), (bx - 12 * s, by - 26 * s), (bx + 12 * s, by - 26 * s), (bx + 11 * s, by)) + [(bx - 11 * s, by)], soft=.8), col, .8, edge=.6)
        p.glaze(p.shape(circ(bx, by - 31 * s, 6.5 * s, 14), soft=.8), C['dark'], .75, edge=.5)
    save(p, out)

def reveal(out, both=False):
    """S13 (both=False): the Odia saree's pleats end above her ankles: the feet, with alta and anklets, lit.
    S14 (both=True): Radha in Odiani besha beside Gopinath in Natabara besha, their feet on the one pedestal."""
    p = Watercolor(W, H, seed=41 if not both else 51, paper_tone='#f4eadb'); p.paper()
    p.glaze(np.ones((H, W), np.float32), hexc('#3b1c12'), .85, edge=0, gran=.3)
    glow(p, 540, 1000, 380, .75)
    pedestal(p, 540, 1150, 860)
    if not both:
        m, bm = hem(p, 240, 840, -20, 820, hexc('#a3201a'), C['black'], 90, seed=5)
        ikat(p, bm, 240, 840, 820 - 90, 820)
        paint_foot(p, 470, 1150, 1.45, 1, leg=230); paint_foot(p, 610, 1150, 1.45, -1, leg=230)
        glow(p, 540, 1090, 120, .25)
    else:
        # Gopinath, Natabara: a yellow dancer's dhoti (knee length), blue crossed feet
        m, bm = hem(p, 150, 470, -20, 960, C['yel'], C['alta'], 34, seed=7)
        paint_foot(p, 270, 1150, 1.2, 1, skin=C['blue'], shade=C['blueD'], alta=False, toering=False, leg=180)
        paint_foot(p, 360, 1150, 1.2, -1, skin=C['blue'], shade=C['blueD'], alta=False, toering=False, leg=190, rot=-.18, sx=.8)
        m, bm = hem(p, 560, 960, -20, 860, hexc('#a3201a'), C['black'], 80, seed=9)
        ikat(p, bm, 560, 960, 860 - 80, 860)
        paint_foot(p, 700, 1150, 1.2, 1, leg=230); paint_foot(p, 820, 1150, 1.2, -1, leg=230)
    # marigold petals on the stone
    rng = np.random.default_rng(6)
    for _ in range(22):
        x, y = rng.uniform(150, 930), rng.uniform(1158, 1300)
        p.glaze(p.shape(circ(x, y, rng.uniform(4, 8), 12, rng.uniform(3, 5)), soft=.8), C['marigold'], .85, edge=.5)
    save(p, out)

def ikat(p, bm, x0, x1, y0, y1):
    """a Sambalpuri ikat border inside mask bm: rows of motifs whose edges feather, because the threads were dyed before weaving"""
    yc = (y0 + y1) / 2; h = (y1 - y0)
    for k, x in enumerate(np.arange(x0 + 40, x1 - 20, 64)):
        if k % 2 == 0: d = [(x, yc - h * .32), (x + h * .3, yc), (x, yc + h * .32), (x - h * .3, yc)]   # the diamond (the conch's simplified form)
        else: d = circ(x, yc, h * .22, 20)                                                           # the flower
        m = p.shape(d, soft=1) * bm
        fe = np.clip(m + (p.noise(1.2, 2) - .5) * 1.4 * blur(m, 2.5), 0, 1)
        p.lift(fe * (np.abs(((p.XX - x) % 5) - 2.5) < 2.0), .75)
        p.glaze(fe * (k % 2 == 1), C['alta'], .7, edge=.2)
    for yy in (y0 + 6, y1 - 6): p.lift(p.band([(x0, yy), (x1, yy)], 3, soft=.6) * bm, .7)

if __name__ == '__main__':
    {'hook': hook, 'amla': amla, 'queue': queue, 'reveal': reveal, 'besha': lambda o: reveal(o, True)}[sys.argv[1]](sys.argv[2])
