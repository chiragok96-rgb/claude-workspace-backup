"""A Kalinga temple relief in sandstone: the king of the sea (Mahodadhipati) enthroned on a wave, a carved sea with boitas,
a lower register where a boita sails toward islands -- and the slab broken away at the lower right, so the islands are lost.
Built as a height field (px) + albedo, lit by a rising sun at three angles (the film cross-fades them as the light sweeps).
python relief.py -> plates/relief_L{0,1,2}.png and relief_G{0,1,2}.png (the same, with the name gilded); RGBA, alpha = the slab."""
import sys, os
sys.path.insert(0, '/root/claude-drawing-skill/lib')
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from core import blur, noise2d, height_normals, height_shadow, ambient_occlusion, smoothstep
W, H = 1080, 2300
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates')
FONT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts', 'NotoSerifOriya.ttf')
SS = 2
R = np.random.default_rng(12)

def mask(draw_fn, soft=0.0):
    im = Image.new('L', (W * SS, H * SS), 0); d = ImageDraw.Draw(im); draw_fn(d, SS)
    m = np.asarray(im.resize((W, H), Image.LANCZOS), np.float32) / 255
    return blur(m, soft) if soft else m
def P(pts, s): return [(x * s, y * s) for x, y in pts]
def bez(p0, p1, p2, p3, n=28):
    t = np.linspace(0, 1, n)[:, None]; u = 1 - t
    return [tuple(r) for r in u**3 * np.array(p0, float) + 3 * u * u * t * np.array(p1, float) + 3 * u * t * t * np.array(p2, float) + t**3 * np.array(p3, float)]
def path(*segs):
    out = []
    for s in segs: out += bez(*s) if len(s) == 4 and hasattr(s[0], '__len__') else [tuple(s)]
    return out
def poly(pts, soft=0.0): return mask(lambda d, s: d.polygon(P(pts, s), fill=255), soft)
def ell(cx, cy, rx, ry, soft=0.0): return mask(lambda d, s: d.ellipse([(cx - rx) * s, (cy - ry) * s, (cx + rx) * s, (cy + ry) * s], fill=255), soft)
def rect(x0, y0, x1, y1, soft=0.0): return mask(lambda d, s: d.rectangle([x0 * s, y0 * s, x1 * s, y1 * s], fill=255), soft)
def line(pts, w, soft=0.0): return mask(lambda d, s: d.line(P(pts, s), fill=255, width=int(w * s), joint='curve'), soft)

# —— the slab outline, broken at the lower right ——
brk = [(1080, 1560), (1010, 1590), (960, 1660), (905, 1700), (880, 1770), (830, 1820), (800, 1900), (760, 1950), (745, 2030), (700, 2080), (690, 2160), (640, 2210), (620, 2300)]
slab = poly([(14, 10), (1066, 10)] + brk + [(14, 2300)], 1.2)
y, x = np.mgrid[0:H, 0:W].astype(np.float32)

h = np.full((H, W), 30.0, np.float32) + noise2d(H, W, 380, 3, 1) * 5 + noise2d(H, W, 6, 2, 2) * .9 + noise2d(H, W, 2, 1, 3) * .5
# frame: a raised outer border with a bead row; recessed panels
border = np.clip(1 - rect(54, 54, 1026, 2246), 0, 1)
h += border * 12
for i in range(36): bx = 34 + i * 30; h += ell(bx, 32, 9, 9, 1.5) * 5
panels = [(84, 74, 996, 296), (84, 320, 996, 1084), (84, 1104, 996, 1240), (84, 1600, 996, 1990)]
for p in panels: h -= blur(rect(*p), 2.2) * 22
h += blur(rect(84, 1262, 996, 1520), 3) * 6                          # the polished plinth (plain: the caption sits here)
for k, yy in enumerate((1538, 1556, 1574)): h += blur(rect(54, yy, 1026, yy + 10), 1.5) * (6 - k * 1.5)   # mouldings
# verse band: lotus rosettes at its ends
for cx in (140, 940):
    for k in range(8):
        a = k / 8 * np.pi * 2; h += ell(cx + np.cos(a) * 34, 185 + np.sin(a) * 34, 15, 15, 2) * 9
    h += ell(cx, 185, 16, 16, 2) * 11
# —— the king panel: the royal boita of Kalinga carrying an elephant, the king's throne and parasol on deck, a carved sea ——
for r in range(4):
    for i in range(10):
        cx, cy = 110 + i * 92 + (r % 2) * 46, 900 + r * 52
        h += line(path(((cx - 42, cy + 12), (cx - 26, cy - 18), (cx + 4, cy - 20), (cx + 16, cy - 4)), ((cx + 16, cy - 4), (cx + 22, cy + 6), (cx + 10, cy + 12), (cx + 4, cy + 4))), 7, 1.6) * 7
hull = path(((120, 750), (170, 880), (820, 900), (930, 780))) + path(((930, 780), (960, 740), (975, 700), (968, 660))) + [(990, 650), (1000, 676), (984, 700)] + path(((984, 700), (990, 760), (960, 830), (930, 850))) + [(150, 850)] + path(((150, 850), (110, 820), (100, 780), (120, 750)))
h += blur(poly(hull), 5) * 30
h -= blur(line([(150, 838), (930, 838)], 4), 1) * 7                                  # the deck line
for k in range(14): h -= ell(200 + k * 52, 866, 7, 5, 1) * 6                        # oar ports
h += blur(poly(path(((968, 660), (1000, 640), (1010, 600), (985, 585)), ((985, 585), (965, 600), (975, 625), (990, 618)))), 3) * 26   # the makara prow's curl
h -= ell(990, 650, 5, 5, 1) * 8
# mast and the great sail, billowed, with ribs; a pennant
h += rect(424, 360, 436, 840, 1.2) * 26
sail = path(((300, 410), (380, 395), (500, 395), (580, 410)), ((580, 410), (640, 520), (640, 600), (590, 700))) + path(((590, 700), (500, 712), (390, 712), (310, 700)), ((310, 700), (290, 600), (290, 500), (300, 410)))
h += blur(poly(sail), 4) * 24
for k in range(1, 5): h -= blur(line(path(((300, 410 + k * 60), (400, 400 + k * 60), (520, 400 + k * 60), (610, 410 + k * 60))), 3), 1) * 5
h += blur(poly([(430, 360), (520, 380), (430, 400)]), 2) * 18
# the king's throne under the royal parasol, at the stern
h += blur(rect(200, 740, 330, 836), 3) * 30 + blur(rect(196, 660, 226, 836), 2) * 34
h += blur(ell(268, 724, 30, 16), 2) * 36                                            # the crown resting on the seat
for k in range(5): h += ell(246 + k * 11, 702, 5, 9, 1) * 34
h += rect(262, 520, 272, 740, 1) * 24
h += blur(poly(path(((180, 560), (220, 500), (316, 500), (356, 560)))), 3) * 28
for k in range(7): h += ell(190 + k * 26, 566, 7, 6, 1.4) * 12
# the elephant, standing on deck facing the prow: body, head, ear, trunk curling down, a tusk, legs, a decorated cloth
h += blur(ell(690, 742, 104, 66), 6) * 40
h += blur(ell(800, 712, 56, 54), 5) * 42
h += blur(line(path(((842, 730), (870, 770), (866, 820), (840, 826))), 26), 4) * 36
h += blur(ell(782, 712, 32, 40), 3) * 46; h -= blur(line(path(((760, 690), (754, 712), (762, 740), (784, 748))), 3), 1) * 7
h += blur(line([(834, 748), (872, 760)], 9), 1.5) * 44
for lx in (618, 660, 728, 770): h += blur(rect(lx - 15, 780, lx + 15, 838), 3) * 36
h -= ell(818, 700, 4, 4, 1) * 9
cloth = [(640, 690), (740, 690), (730, 770), (650, 770)]; h += blur(poly(cloth), 2) * 6
for k in range(6): h -= ell(650 + k * 16, 764, 4, 4, 1) * 5
# —— the name: ମହୋଦଧିପତି, incised (and a gold mask for gilding) ——
font = ImageFont.truetype(FONT, 112 * SS); font.set_variation_by_axes([700])
def nm(d, s): d.text((540 * s, 1172 * s), 'ମହୋଦଧିପତି', font=font, fill=255, anchor='mm')
name = mask(nm); h -= blur(name, 1.4) * 11
gold = blur(name, .8)
# —— the lower register: a carved sea; a small boita at the left setting out; the far isles at the right (lost in the break) ——
for r in range(6):
    for i in range(10):
        cx, cy = 110 + i * 92 + (r % 2) * 46, 1720 + r * 46
        h += line(path(((cx - 40, cy + 10), (cx - 24, cy - 16), (cx + 4, cy - 18), (cx + 14, cy - 4))), 6, 1.5) * 6
bx = 260
hull2 = path(((bx - 120, 1700), (bx - 80, 1750), (bx + 80, 1750), (bx + 130, 1696)))
h += blur(poly(hull2 + [(bx + 130, 1692), (bx - 120, 1696)]), 3) * 22
h += rect(bx - 5, 1610, bx + 5, 1700, 1.2) * 20
h += blur(poly(path(((bx - 60, 1622), (bx, 1612), (bx + 60, 1622), (bx + 76, 1660))) + [(bx + 64, 1690), (bx - 60, 1690)]), 3) * 18
for k in range(9): h -= ell(390 + k * 46, 1700 + np.sin(k) * 10, 5, 5, 1) * 7     # the dotted sea-route, carved, running out to the right
for (cx, cy, rx) in [(900, 1680, 110), (1040, 1720, 70)]:
    h += blur(ell(cx, cy, rx, 40), 3) * 20
    h += blur(line([(cx - 10, cy - 34), (cx + 10, cy - 110)], 9), 1.5) * 18
    for k in range(5): a_ = -2.6 + k * .5; h += blur(line([(cx + 10, cy - 110), (cx + 10 + np.cos(a_) * 60, cy - 110 + np.sin(a_) * 30 + 20)], 7), 1.5) * 16
# —— weathering: erosion pits, chisel marks, a crack ——
for _ in range(1400):
    cx, cy = R.uniform(0, W), R.uniform(0, H); r = R.uniform(1, 3.5); h -= ell(cx, cy, r, r * R.uniform(.6, 1), .8) * R.uniform(1, 3)
crack = path(((300, 1250), (330, 1360), (290, 1440), (320, 1530))); h -= blur(line(crack, 3), 1) * 10
h = blur(h, .7)
# —— lit at three sun angles ——
alb0 = np.stack([np.full((H, W), v, np.float32) for v in (.62, .55, .47)], -1)
tone = (noise2d(H, W, 220, 4, 7) - .5) * .12 + (noise2d(H, W, 30, 3, 8) - .5) * .06
alb = alb0 + tone[..., None] * np.array([1, .95, .8])
streak = np.clip(noise2d(H, W, 1, 1, 9)[:, :1] * 0 + (noise2d(H * 1, W, 40, 2, 10) - .55) * 2, 0, 1) * np.clip(y / H, 0, 1)
alb -= streak[..., None] * np.array([.05, .05, .04])
lich = smoothstep(.62, .75, noise2d(H, W, 26, 4, 11)) * (border * .7 + .3)
alb = alb * (1 - lich[..., None] * .35) + lich[..., None] * np.array([.42, .46, .38]) * .35
ao = ambient_occlusion(h, radii=(3, 10, 28), depth=(4, 10, 22))
n = height_normals(h * 1.3)
G = np.array([.93, .74, .34], np.float32)
def light(L, sun_col, amb, k, gild):
    L = np.array(L, np.float32); L /= np.linalg.norm(L)
    diff = np.clip(n @ L, 0, 1); sh = height_shadow(h, tuple(L), reach=140, step=2.0, soft=3.0)
    a = alb.copy()
    if gild: a = a * (1 - gold[..., None]) + G * gold[..., None]
    col = a * (amb * (1 - ao[..., None] * .7) + diff[..., None] * (1 - sh[..., None] * .85) * sun_col)
    if gild:   # gold: a tight warm specular
        hv = L + np.array([0, 0, 1], np.float32); hv /= np.linalg.norm(hv); spec = np.clip(n @ hv, 0, 1) ** 40
        col += (gold * spec)[..., None] * np.array([1, .85, .5]) * 1.2
    col = np.clip(col, 0, 1) ** (1 / 1.1)
    rgba = np.dstack([(col * 255).astype(np.uint8), (slab * 255).astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(os.path.join(OUT, f'relief_{"G" if gild else "L"}{k}.png')); print('saved', k, gild)
SUNS = [((-0.92, -0.18, 0.34), np.array([1.15, .78, .55]), np.array([.30, .30, .40])),   # first light: very low, rose
        ((-0.70, -0.42, 0.58), np.array([1.15, .92, .70]), np.array([.36, .35, .42])),   # rising: gold
        ((-0.45, -0.55, 0.78), np.array([1.10, .98, .86]), np.array([.42, .41, .44]))]   # morning
for k, (L, sc, am) in enumerate(SUNS):
    light(L, sc, am, k, False); light(L, sc, am, k, True)
