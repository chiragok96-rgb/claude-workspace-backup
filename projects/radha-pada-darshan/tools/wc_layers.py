"""Watercolour layers for the film (claude-drawing Watercolor). Each moving element is its own RGBA layer: painted on the same
paper, alpha = where the element is. python wc_layers.py <scene> -> plates/<scene>_*.png
scenes: hook, amla, queue, besha"""
import sys, os, json
sys.path.insert(0, '/root/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw
from watercolor import Watercolor, hexc
from core import polygon_mask, blur
from wc import C, bez, circ, foot_pts, paint_foot, glow, pedestal, hem, ikat
W, H = 1080, 1920
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates')

class Layer(Watercolor):
    def __init__(self, seed, tone='#f6eee0'):
        super().__init__(W, H, seed=seed, paper_tone=tone); self.paper(); self.alpha = np.zeros((H, W), np.float32)
    def occupy(self, m): self.alpha = np.maximum(self.alpha, np.clip(m, 0, 1))
    def save_rgba(self, name):
        rgb = (np.clip(self.img, 0, 1) * 255).astype(np.uint8); a = (np.clip(self.alpha, 0, 1) * 255).astype(np.uint8)
        Image.fromarray(np.dstack([rgb, a]), 'RGBA').save(os.path.join(OUT, name + '.png')); print('saved', name)
def save_rgb(p, name): Image.fromarray((np.clip(p.img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, name + '.png')); print('saved', name)

def polys(shape_list, ss=2):
    """many small polygons into one mask in one pass (fast: one glaze for hundreds of leaves)"""
    im = Image.new('L', (W * ss, H * ss), 0); d = ImageDraw.Draw(im)
    for pts in shape_list: d.polygon([(x * ss, y * ss) for x, y in pts], fill=255)
    return np.asarray(im.resize((W, H), Image.LANCZOS), np.float32) / 255

def feet_pair(L, cx1, cx2, gy, s, **k):
    f1 = paint_foot(L, cx1, gy, s, 1, **k); f2 = paint_foot(L, cx2, gy, s, -1, **k); L.occupy(f1); L.occupy(f2)

# ------------------------------------------------------------------ the hook: sanctum, hem, feet
def hook():
    p = Watercolor(W, H, seed=11, paper_tone='#f3ead9'); p.paper()
    p.glaze(np.ones((H, W), np.float32), C['dark'], .92, edge=0, gran=.35)
    p.glaze(np.ones((H, W), np.float32), hexc('#5a2a18'), .5, edge=0, gran=.3)
    glow(p, 540, 900, 440, .55); glow(p, 540, 1130, 260, .4)
    pedestal(p, 540, 1150, 820)
    save_rgb(p, 'hook_bg')
    L = Layer(12); feet_pair(L, 470, 610, 1150, 1.45, leg=260); L.save_rgba('hook_feet')
    L = Layer(13)
    m, bm = hem(L, 170, 910, -320, 1090, C['red'], C['gold'], 64, seed=2); L.occupy(m)
    for x in np.arange(196, 900, 36):
        L.glaze(L.shape(circ(x, 1058, 9), soft=.6) * bm, C['dark'], .6, edge=.8); L.lift(L.shape(circ(x - 1, 1056, 5), soft=.4), .8)
    # bandhani dots over the red body
    dots = [circ(x + (r % 2) * 17, y, 3.2, 8) for r, y in enumerate(range(-300, 1000, 34)) for x in range(200, 900, 34)]
    L.glaze(polys(dots) * m * (L.YY < 1020), C['gold'], .8, edge=.3, gran=.2)
    L.save_rgba('hook_hem')

# ------------------------------------------------------------------ Aonla Navami: the amla tree at ground level
def amla():
    rng = np.random.default_rng(3)
    p = Watercolor(W, H, seed=21, paper_tone='#f7f0e1'); p.paper()
    p.gradient_wash(0, 1000, top=hexc('#c9d6b2'), bottom=hexc('#f4e6c8'), strength=.5)
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(200, 800), rng.uniform(80, 200), rng.uniform(60, 140)) for _ in range(10)], soft=40), hexc('#a9b98a'), .35, edge=0, gran=.2)   # far foliage, out of focus
    p.glaze(p.shape([(0, 980), (W, 950), (W, H), (0, H)], soft=24), C['earth'], .55, edge=.15, gran=.6)
    p.glaze(p.shape([(0, 1240), (W, 1200), (W, H), (0, H)], soft=60), hexc('#a8835e'), .35, edge=0, gran=.6)
    # trunk: a thick bole flaring into roots, a low fork; bark fissures, lichen, a knot
    trunk = bez((395, -40), (405, 300), (410, 640), (330, 930)) + bez((330, 930), (300, 990), (230, 1010), (170, 1030)) + bez((170, 1030), (330, 1010), (440, 1000), (540, 1004)) \
        + bez((540, 1004), (650, 1000), (780, 1010), (930, 1040)) + bez((930, 1040), (840, 1000), (760, 980), (720, 920)) + bez((720, 920), (680, 640), (680, 300), (700, -40))
    tm = p.shape(trunk, soft=2.5, ragged=.25)
    p.glaze(tm, hexc('#8a7868'), .75, edge=.55, gran=.85)
    p.glaze(tm * np.clip((p.XX - 560) / 160, 0, 1), hexc('#4f4036'), .5, edge=.2, gran=.7)
    p.glaze(tm * np.clip((480 - p.XX) / 120, 0, 1), hexc('#4f4036'), .25, edge=.2, gran=.7)
    for k in range(26):
        x = rng.uniform(420, 690); y0 = rng.uniform(-40, 700); L_ = rng.uniform(120, 360)
        p.stroke(bez((x, y0), (x - 5, y0 + L_ * .3), (x + 6, y0 + L_ * .6), (x + (x - 555) * .2, y0 + L_), 16), rng.uniform(2, 5), hexc('#3e322a'), .4, dry=.75, taper=(.4, .5), jitter=.3)
    p.glaze(p.blobs([(rng.uniform(440, 680), rng.uniform(100, 800), rng.uniform(12, 34), rng.uniform(8, 20)) for _ in range(14)], soft=3, ragged=.5), hexc('#c9c6a8'), .45, edge=.5, gran=.6)   # lichen
    p.glaze(p.shape(circ(600, 470, 22, 24, 14), soft=2), hexc('#3a2d24'), .6, edge=.7)
    # roots on the ground
    for (x0, y0, x1, y1) in [(330, 960, 120, 1080), (420, 990, 330, 1110), (640, 990, 760, 1120), (720, 960, 980, 1090)]:
        p.stroke(bez((x0, y0), ((x0 + x1) / 2, y0 + 20), ((x0 + x1) / 2, y1 - 20), (x1, y1), 20), 26, hexc('#7a6858'), .6, dry=.3, taper=(0, .9))
    # feathery amla sprays hanging into the top of the frame: twigs with small paired leaflets
    leaves, twigs = [], []
    for k in range(9):
        x0 = rng.uniform(-60, W + 60); y0 = rng.uniform(-40, 120); ang = rng.uniform(.3, 1.2) * (1 if x0 < 540 else -1); Lt = rng.uniform(220, 380)
        pts = [(x0 + np.sin(ang) * Lt * t + np.sin(t * 3) * 10, y0 + np.cos(ang) * Lt * t * .9 + 40 * t * t) for t in np.linspace(0, 1, 30)]
        twigs.append(pts)
        for i in range(2, 30):
            x, y = pts[i]; dx, dy = pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]; n = np.hypot(dx, dy) + 1e-6; nx, ny = -dy / n, dx / n
            for sgn in (1, -1):
                lx, ly = x + nx * sgn * 16, y + ny * sgn * 16 + 4
                leaves.append([(x, y), (lx + nx * sgn * 6 - dx / n * 4, ly), (lx + nx * sgn * 14, ly + 6), (x + dx / n * 6, y + dy / n * 6)])
    p.glaze(polys(leaves), hexc('#7d9b4a'), .6, edge=.4, gran=.3)
    p.glaze(polys(leaves[::3]), hexc('#4d6b2c'), .35, edge=.4, gran=.3)
    for tw in twigs: p.line(tw, 1.6, hexc('#4b3b2c'), .7)
    fr = [circ(rng.uniform(60, W - 60), rng.uniform(60, 330), rng.uniform(13, 18), 24) for _ in range(18)]
    p.glaze(polys(fr), C['amla'], .8, edge=.6, gran=.2)
    for f in fr: cx = np.mean([q[0] for q in f]); cy = np.mean([q[1] for q in f]); p.lift(p.shape(circ(cx - 5, cy - 6, 4.5, 12), soft=1), .55)
    # on the ground: fallen amla, a leaf plate with kumkum and rice, a clay diya (its flame is drawn live)
    fr = [circ(x, y, 16, 24) for x, y in [(290, 1170), (340, 1196), (760, 1180), (812, 1150), (700, 1215)]]
    p.glaze(polys(fr), C['amla'], .85, edge=.6, gran=.2)
    for f in fr: cx = np.mean([q[0] for q in f]); cy = np.mean([q[1] for q in f]); p.lift(p.shape(circ(cx - 5, cy - 6, 4.5, 12), soft=1), .55)
    p.glaze(p.shape(circ(540, 1105, 120, 40, 34), soft=2), hexc('#5f8a3a'), .7, edge=.6, gran=.3)
    p.glaze(p.shape(circ(500, 1100, 22, 24, 12), soft=1), C['alta'], .85, edge=.6)
    p.glaze(p.blobs([(575 + rng.normal() * 14, 1100 + rng.normal() * 6, 6, 4) for _ in range(14)], soft=1, ragged=.2), hexc('#efe7d4'), .2, edge=.6)
    p.glaze(p.shape(bez((610, 1060), (630, 1094), (700, 1094), (720, 1060)) + [(610, 1060)], soft=1), hexc('#9b5a33'), .85, edge=.6, gran=.4)
    # kumkum dabs on the bark (where the thread will be wound)
    for x, y in [(520, 560), (548, 566), (534, 538)]: p.glaze(p.shape(circ(x, y, 7), soft=1), C['alta'], .9, edge=.6)
    save_rgb(p, 'amla_bg')
    # two women at the tree: saree hems and feet (each its own layer)
    for nm, (cx, gy, s, sar, bor, sd) in {'amla_w1': (215, 1330, .95, C['red'], C['black'], 22), 'amla_w2': (860, 1380, 1.0, hexc('#c8901c'), C['green'], 23)}.items():
        L = Layer(sd); hm, _ = hem(L, cx - 130, cx + 130, 760, gy - 196 * s, sar, bor, 38, seed=sd); L.occupy(hm)
        f1 = paint_foot(L, cx - 42 * s, gy, s * .9, 1, leg=200); f2 = paint_foot(L, cx + 48 * s, gy - 16, s * .9, -1, leg=210); L.occupy(f1); L.occupy(f2)
        L.save_rgba(nm)

# ------------------------------------------------------------------ Sakshigopal: the line at dawn
QPATH = [(1040, 1330), (420, 1260), (960, 1000), (620, 800)]
def queue():
    rng = np.random.default_rng(8)
    p = Watercolor(W, H, seed=31, paper_tone='#f7efe1'); p.paper()
    p.gradient_wash(0, 780, top=hexc('#e7b089'), bottom=hexc('#f7e3c4'), strength=.62)
    p.glaze(p.shape(circ(700, 560, 46), soft=2), hexc('#f0a35c'), .55, edge=.3)
    sp = bez((560, 760), (566, 600), (586, 470), (612, 430)) + bez((612, 430), (624, 420), (636, 420), (648, 430)) + bez((648, 430), (674, 470), (694, 600), (700, 760))
    p.glaze(p.shape(sp, soft=1.5), hexc('#9b7a66'), .6, edge=.5, gran=.5)
    p.glaze(p.shape(sp, soft=1.5) * (p.XX > 640), hexc('#6b5244'), .35, edge=.2, gran=.5)
    p.glaze(p.shape(circ(630, 418, 22, ry=9), soft=1), hexc('#7b5e4e'), .7, edge=.5)
    p.line([(630, 408), (630, 340)], 1.5, C['dark'], .7); p.glaze(p.shape([(630, 340), (676, 352), (630, 366)], soft=.8), C['saffron'], .85, edge=.6)
    for yy in range(470, 760, 22): p.line([(574 + (760 - yy) * .03, yy), (686 - (760 - yy) * .03, yy)], 1.0, C['dark'], .25)
    p.glaze(p.shape([(380, 760), (860, 760), (860, 800), (380, 800)], soft=6), hexc('#8a6b58'), .45, edge=.3)
    p.glaze(p.shape([(600, 800), (660, 800), (660, 760), (630, 742), (600, 760)], soft=1), C['dark'], .6, edge=.4)   # the gate
    p.glaze(p.shape([(0, 770), (W, 760), (W, H), (0, H)], soft=10), hexc('#cdb48e'), .5, edge=.2, gran=.5)
    p.glaze(p.blobs([(x, 770, rng.uniform(30, 60), rng.uniform(18, 34)) for x in list(np.arange(0, 380, 50)) + list(np.arange(880, W + 40, 50))], soft=5), hexc('#6c7a4e'), .5, edge=.4)
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(1400, 1900), rng.uniform(80, 200), rng.uniform(30, 60)) for _ in range(8)], soft=30), hexc('#b39a73'), .3, edge=0, gran=.5)
    save_rgb(p, 'queue_bg')
    L = Layer(32)
    path = bez(*QPATH, 360); people = []
    for i, (x, y) in enumerate(path[::3]):
        s = .25 + .95 * ((y - 800) / 530) ** 1.2
        col = [C['red'], C['yel'], hexc('#f1ece0'), C['green'], C['saffron'], hexc('#c25b7a')][i % 6]
        bx, by = x + rng.normal() * 6 * s - 18 * s, y - rng.uniform(4, 10) * s
        body = bez((bx - 11 * s, by), (bx - 12 * s, by - 26 * s), (bx + 12 * s, by - 26 * s), (bx + 11 * s, by)) + [(bx - 11 * s, by)]
        m1 = L.shape(body, soft=.8); L.glaze(m1, col, .8, edge=.6); m2 = L.shape(circ(bx, by - 31 * s, 6.5 * s, 14), soft=.8); L.glaze(m2, C['dark'], .75, edge=.5)
        L.occupy(m1); L.occupy(m2); people.append([float(bx), float(by)])
    L.save_rgba('queue_people')
    json.dump({'path': [[float(a), float(b)] for a, b in path], 'people': people}, open(os.path.join(OUT, 'queue.json'), 'w'))

# ------------------------------------------------------------------ the besha: Radha (Odiani) beside Gopinath (Natabara)
def besha():
    p = Watercolor(W, H, seed=51, paper_tone='#f4eadb'); p.paper()
    p.glaze(np.ones((H, W), np.float32), hexc('#3b1c12'), .85, edge=0, gran=.3)
    glow(p, 540, 1000, 420, .75); glow(p, 720, 1080, 200, .35)
    pedestal(p, 540, 1150, 900)
    rng = np.random.default_rng(6)
    pet = [circ(rng.uniform(140, 940), rng.uniform(1158, 1300), rng.uniform(4, 8), 12, rng.uniform(3, 5)) for _ in range(26)]
    p.glaze(polys(pet), C['marigold'], .85, edge=.5)
    save_rgb(p, 'besha_bg')
    L = Layer(52)
    m, bm = hem(L, 150, 470, -320, 960, C['yel'], C['alta'], 34, seed=7); L.occupy(m)
    f1 = paint_foot(L, 270, 1150, 1.2, 1, skin=C['blue'], shade=C['blueD'], alta=False, toering=False, leg=180)
    f2 = paint_foot(L, 360, 1150, 1.2, -1, skin=C['blue'], shade=C['blueD'], alta=False, toering=False, leg=190, rot=-.18, sx=.8); L.occupy(f1); L.occupy(f2)
    L.save_rgba('besha_gopi')
    L = Layer(53); feet_pair(L, 700, 820, 1150, 1.2, leg=240); L.save_rgba('besha_rfeet')
    L = Layer(54)
    m, bm = hem(L, 560, 960, -320, 860, hexc('#a3201a'), C['black'], 80, seed=9); L.occupy(m)
    ikat(L, bm, 560, 960, 860 - 80, 860)
    L.save_rgba('besha_saree')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    {'hook': hook, 'amla': amla, 'queue': queue, 'besha': besha}[sys.argv[1]]()
