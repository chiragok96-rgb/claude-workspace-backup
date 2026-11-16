# Test: Radha's feet in watercolour (claude-drawing Watercolor): alta, anklets, the ikat saree hem above, a stone pedestal.
import sys, os
sys.path.insert(0, '/root/claude-drawing-skill/lib')
import numpy as np
from watercolor import Watercolor, hexc
from core import polygon_mask, blur

W, H = 1080, 1080
p = Watercolor(W, H, seed=4, paper_tone='#f6efe2'); p.paper()

def bez(p0, p1, p2, p3, n=24):
    t = np.linspace(0, 1, n)[:, None]; u = 1 - t
    return u**3 * np.array(p0) + 3 * u * u * t * np.array(p1) + 3 * u * t * t * np.array(p2) + t**3 * np.array(p3)

def foot_pts(cx, gy, s, m):
    # front view of a foot: leg (cut by the hem at -200) down the outer side, the toe line, up the inner side
    P = lambda pts: [(cx + m * x * s, gy + y * s) for x, y in pts]
    seg = []
    seg += list(bez((-34, -230), (-36, -190), (-42, -150), (-46, -122)))
    seg += list(bez((-46, -122), (-56, -100), (-50, -88), (-54, -70)))
    seg += list(bez((-54, -70), (-62, -48), (-64, -26), (-58, -12)))
    # toes along the ground: little to big toe, scalloped
    toes = [(-50, 8), (-34, 11), (-16, 12), (4, 14), (32, 19)]
    tx0 = -58
    for (tx, r) in toes:
        a = np.linspace(np.pi, 0, 14)
        seg += [(tx + np.cos(t) * r, -12 + np.sin(t) * r * 1.05) for t in a]
    seg += list(bez((51, -12), (58, -40), (48, -78), (36, -108)))
    seg += list(bez((36, -108), (40, -126), (32, -140), (30, -160)))
    seg += list(bez((30, -160), (28, -190), (30, -210), (30, -230)))
    return P(seg)

skin, skinS = hexc('#e9b892'), hexc('#c98a68')
alta = hexc('#c8321e')
gy = 760
# stone pedestal, behind and under
ped = p.shape([(150, gy - 4), (930, gy - 4), (960, gy + 60), (120, gy + 60)], soft=2)
p.glaze(ped, hexc('#b9a58a'), 0.55, edge=0.5, gran=0.6)
p.glaze(p.shape([(120, gy + 60), (960, gy + 60), (990, gy + 130), (90, gy + 130)], soft=2), hexc('#8f7a63'), 0.55, edge=0.5, gran=0.6)
for cx, m in ((470, 1), (610, -1)):
    pts = foot_pts(cx, gy, 1.55, m)
    f = p.shape(pts, soft=1.6, ragged=.1)
    p.glaze(f, skin, 0.75, edge=0.45, gran=0.15, variation=.15)
    # shadow side and between the toes
    sh = p.shape(foot_pts(cx - m * 10, gy, 1.5, m), soft=10, ragged=.3) * (1 - polygon_mask(H, W, foot_pts(cx + m * 12, gy - 6, 1.42, m), ss=2))
    p.glaze(sh * f, skinS, 0.55, edge=0.3, gran=0.25)
    # alta: the red rim along the toes and the sole edge (a crisp band), the dot and ring on the dorsum
    rim = f * (p.YY > gy - 22 * 1.55)
    p.glaze(p.soften(rim, 1.2, .12), alta, 0.95, edge=0.7, gran=0.2)
    dx = cx + m * 0 * 1.55; dy = gy - 66 * 1.55
    p.glaze(p.shape([(dx + 18 * np.cos(a), dy + 18 * np.sin(a)) for a in np.linspace(0, 6.28, 40)], soft=1.2), alta, 0.95, edge=.7)
    for a in np.linspace(0, 6.28, 11)[:-1]:
        x, y = dx + 34 * np.cos(a), dy + 34 * np.sin(a)
        p.glaze(p.shape([(x + 4 * np.cos(b), y + 4 * np.sin(b)) for b in np.linspace(0, 6.28, 16)], soft=.8), alta, 0.9, edge=.5)
    # anklet: gold band with bells
    ay = gy - 128 * 1.55
    band = p.band([(cx - m * 70, ay + 6), (cx, ay + 16), (cx + m * 56, ay + 2)], 14, soft=1)
    p.glaze(band * f, hexc('#d6a536'), 0.85, edge=0.6, gran=0.3)
    for i in range(9):
        x = cx + m * (-64 + i * 15); y = ay + 30 + np.sin(i / 8 * np.pi) * 6
        p.glaze(p.shape([(x + 7 * np.cos(b), y + 7 * np.sin(b)) for b in np.linspace(0, 6.28, 18)], soft=.8), hexc('#d6a536'), 0.85, edge=.6)
# the saree hem above: deep red with the ikat border (feathered motifs), pleats
hem_top, hem_bot = 0, gy - 210 * 1.55 + 10
hem = p.shape([(250, hem_top), (830, hem_top), (870, hem_bot + 14), (560, hem_bot - 4), (210, hem_bot + 16)], soft=1.5)
p.glaze(hem, hexc('#8e1f1a'), 0.88, edge=0.5, gran=0.3)
bord = hem * (p.YY > hem_bot - 70)
p.glaze(bord, hexc('#1d1712'), 0.8, edge=0.5, gran=0.25)
for k in range(9):   # ikat diamonds with feathered edges (the threads were dyed before weaving)
    x0 = 260 + k * 68; yc = hem_bot - 36
    d = [(x0, yc - 22), (x0 + 22, yc), (x0, yc + 22), (x0 - 22, yc)]
    m_ = p.shape(d, soft=1) * hem
    feather = np.clip(m_ + (p.noise(1.4, 2) - .5) * .9 * blur(m_, 3), 0, 1)
    p.glaze(feather * (np.abs(((p.XX - x0) % 6) - 3) < 2.4), hexc('#f0e4c8'), 0.9, edge=0.2, gran=0.1)
for x in (330, 420, 520, 610, 700, 790):
    p.glaze(p.band([(x, 10), (x + 6, hem_bot - 90)], 10, soft=6) * hem, hexc('#4a0e0c'), 0.35, edge=0.2)
p.save(sys.argv[1])
print('ok')
