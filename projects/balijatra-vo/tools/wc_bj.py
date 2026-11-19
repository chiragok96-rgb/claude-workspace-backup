"""Watercolour plates for the Bali Jatra film (claude-drawing Watercolor).  python wc_bj.py <plate>  -> plates/<plate>.png
plates: shore (dawn on the Kalinga coast, far isles on the horizon), strata (a section through the river sand at Manikapatna),
        pots (the same section with two pots: Manikapatna's and one of Bali/Java's, side by side in the earth)."""
import sys, os
sys.path.insert(0, '/root/claude-drawing-skill/lib'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image
from watercolor import Watercolor, hexc
from wc import bez, circ
W, H = 1080, 1920
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates')
os.makedirs(OUT, exist_ok=True)
def save(p, name):
    Image.fromarray((np.clip(p.img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, name + '.png')); print('saved', name)

def shore():
    rng = np.random.default_rng(4)
    p = Watercolor(W, H, seed=41, paper_tone='#f6efe2'); p.paper()
    HZ = 930   # horizon
    p.gradient_wash(0, HZ, top=hexc('#d9c2b4'), bottom=hexc('#f3c79c'), strength=.55)
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(180, 640), rng.uniform(160, 340), rng.uniform(28, 60)) for _ in range(9)], soft=26), hexc('#e3b7a6'), .28, edge=.25, gran=.15)   # long dawn clouds
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(260, 520), rng.uniform(120, 260), rng.uniform(16, 34)) for _ in range(6)], soft=14), hexc('#f6d7b0'), .3, edge=.4, gran=.1)
    # the sun, low, a pale disc lifted out of the wash with a soft halo
    p.glaze(p.shape(circ(700, HZ - 120, 210), soft=90), hexc('#f7d39a'), .35, edge=0, gran=.05)
    p.lift(p.shape(circ(700, HZ - 120, 58), soft=3), .75)
    # far isles: three soft blue-grey shapes on the horizon (where the scent comes from)
    for (x0, x1, h) in [(120, 330, 40), (420, 520, 24), (840, 1040, 46)]:
        pts = bez((x0, HZ), (x0 + (x1 - x0) * .25, HZ - h), (x0 + (x1 - x0) * .7, HZ - h * 1.1), (x1, HZ))
        p.glaze(p.shape(pts + [(x1, HZ + 4), (x0, HZ + 4)], soft=3, ragged=.2), hexc('#9aa2b6'), .45, edge=.5, gran=.25)
    # the sea: banded washes, darker toward us, the sun's path lifted
    p.gradient_wash(HZ, 1380, top=hexc('#c9c3c2'), bottom=hexc('#6f8aa0'), strength=.6, soft_bottom=40)
    for k in range(26):
        y = HZ + 10 + k * k * .62; w = rng.uniform(120, 420); x = rng.uniform(-60, W)
        p.stroke([(x, y), (x + w * .5, y + rng.uniform(-2, 2)), (x + w, y)], 2 + k * .25, hexc('#56708a'), .25, dry=.6, taper=(.3, .3))
    for k in range(18):
        y = HZ + 8 + k * 22; w = 70 - k * 2.5
        p.lift(p.shape([(700 - w, y), (700 + w, y), (700 + w * .8, y + 6), (700 - w * .8, y + 6)], soft=2), .55)
    # surf line and wet sand
    surf = bez((-40, 1385), (300, 1360), (700, 1400), (1120, 1372))
    p.glaze(p.shape(surf + [(1120, 1430), (-40, 1440)], soft=10), hexc('#e8ddcc'), .5, edge=.3, gran=.1)
    p.glaze(p.shape([(-40, 1420), (1120, 1400), (1120, H), (-40, H)], soft=14), hexc('#d7b58a'), .55, edge=.2, gran=.6)
    p.glaze(p.shape([(-40, 1560), (1120, 1530), (1120, H), (-40, H)], soft=50), hexc('#c39a6a'), .35, edge=0, gran=.6)
    # a rekha deul far on the left shore (Kalinga's coast): curvilinear tower, amalaka, kalasha, a small mandapa
    x, b, w, h = 150, HZ + 2, 92, 230
    tw = bez((x - w / 2, b), (x - w * .55, b - h * .55), (x - w * .4, b - h * .86), (x - w * .15, b - h * .95)) + [(x + w * .15, b - h * .95)] + bez((x + w * .15, b - h * .95), (x + w * .4, b - h * .86), (x + w * .55, b - h * .55), (x + w / 2, b))
    p.glaze(p.shape(tw, soft=1.5, ragged=.08), hexc('#857a88'), .5, edge=.55, gran=.3)
    p.glaze(p.shape(circ(x, b - h * .97, w * .26, 24, h * .05), soft=1.2), hexc('#776c7c'), .55, edge=.6)
    p.glaze(p.shape([(x - 6, b - h * 1.0), (x, b - h * 1.12), (x + 6, b - h * 1.0)], soft=1), hexc('#776c7c'), .55, edge=.6)
    md = bez((x + 40, b), (x + 46, b - 60), (x + 70, b - 92), (x + 96, b - 98)) + bez((x + 96, b - 98), (x + 122, b - 92), (x + 146, b - 60), (x + 152, b))
    p.glaze(p.shape(md, soft=1.5), hexc('#8d8290'), .42, edge=.5, gran=.3)
    for k in range(6): p.line([(x - w * .46 + k * 2, b - h * (.12 + k * .13)), (x + w * .46 - k * 2, b - h * (.12 + k * .13))], 1.1, hexc('#6e6372'), .45)
    # a coconut palm leaning in from the right edge
    trunk = bez((1110, 1520), (1020, 1250), (960, 900), (930, 640))
    p.stroke(trunk, 26, hexc('#6c5a48'), .65, dry=.25, taper=(.0, .6))
    for k in range(9):
        a = -2.9 + k * .45; L = rng.uniform(230, 330); x0, y0 = 930, 640
        tip = (x0 + np.cos(a) * L, y0 + np.sin(a) * L * .55 + 60)
        frond = bez((x0, y0), (x0 + np.cos(a) * L * .4, y0 - 40), (tip[0] - np.cos(a) * 40, tip[1] - 40), tip)
        p.stroke(frond, 10, hexc('#4c6a3a'), .6, dry=.3, taper=(.1, .9))
        for j in range(1, 12):
            u = j / 12; q = frond[int(u * (len(frond) - 1))]
            p.stroke([q, (q[0] + 18, q[1] + 34)], 3, hexc('#4c6a3a'), .45, dry=.5, taper=(0, .8))
    save(p, 'shore')

def section(p, rng):
    """the earth in section: a sliver of river and sky at the top, then the sand and silt beds of the old port"""
    p.gradient_wash(0, 250, top=hexc('#d9c6b6'), bottom=hexc('#efd4b2'), strength=.45)
    p.glaze(p.shape([(-20, 240), (W + 20, 232), (W + 20, 330), (-20, 330)], soft=6), hexc('#8aa0b2'), .5, edge=.4, gran=.2)
    beds = [(330, '#d8b98a', .55), (430, '#c9a473', .55), (560, '#b78e60', .55), (700, '#a37a52', .55), (860, '#8e6a48', .6), (1040, '#7c5b3e', .6), (1240, '#6b4d34', .62), (1460, '#5a402c', .65), (1700, '#4a3424', .7)]
    for (y, col, s) in beds:
        top = [(x, y + 12 * np.sin(x / 170 + y) + rng.uniform(-3, 3)) for x in np.linspace(-20, W + 20, 18)]
        p.glaze(p.shape(top + [(W + 20, H + 20), (-20, H + 20)], soft=4, ragged=.25), hexc(col), s * .55, edge=.5, gran=.7)
    # pebbles, shell bits, root threads
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(380, 1850), rng.uniform(4, 13), rng.uniform(3, 9)) for _ in range(120)], soft=1.5, ragged=.4), hexc('#4a3626'), .45, edge=.6, gran=.4)
    p.glaze(p.blobs([(rng.uniform(0, W), rng.uniform(380, 1850), rng.uniform(5, 10), rng.uniform(2, 5)) for _ in range(50)], soft=1, ragged=.3), hexc('#efe4cf'), .55, edge=.5, gran=.2)
    for k in range(14):
        x = rng.uniform(0, W); y0 = 330
        p.stroke(bez((x, y0), (x + rng.uniform(-30, 30), y0 + 80), (x + rng.uniform(-40, 40), y0 + 150), (x + rng.uniform(-50, 50), y0 + rng.uniform(180, 300))), 1.6, hexc('#5e4632'), .35, dry=.5, taper=(.1, .9))

def strata():
    rng = np.random.default_rng(7); p = Watercolor(W, H, seed=71, paper_tone='#f3ead9'); p.paper(); section(p, rng)
    # the trench cut down from the surface (the stylus groove become a dig)
    tr = [(470, 330), (610, 330), (585, 980), (495, 980)]
    p.glaze(p.shape(tr, soft=3, ragged=.15), hexc('#3a2a1c'), .45, edge=.7, gran=.5)
    save(p, 'strata')

def pot(p, cx, cy, s, body, slip, seed=0):
    """a kendi: the spouted water jar found at Manikapatna and across Java and Bali -- globular body, tall neck, flared lip, a spout"""
    body_pts = bez((-46, -96), (-150, -86), (-160, 60), (-80, 110)) + bez((-80, 110), (-40, 128), (40, 128), (80, 110)) + bez((80, 110), (160, 60), (150, -86), (46, -96))
    neck = [(46, -96), (34, -170), (60, -196), (-60, -196), (-34, -170), (-46, -96)]
    pts = [(cx + x * s, cy + y * s) for x, y in body_pts + neck[1:-1]]
    m = p.shape(pts, soft=1.6, ragged=.06)
    p.glaze(m, hexc(body), .85, edge=.55, gran=.35)
    p.glaze(m * np.clip((p.XX - cx) / (140 * s), 0, 1), hexc('#3a1c12'), .38, edge=.2, gran=.3)
    p.glaze(m * np.clip((cx - p.XX) / (140 * s), 0, 1) * .6, hexc(slip), .4, edge=.2, gran=.2)
    sp = bez((104, -40), (150, -50), (178, -84), (196, -112)) + bez((210, -104), (190, -64), (160, -16), (116, 6))   # the spout, rising off the shoulder
    p.glaze(p.shape([(cx + x * s, cy + y * s) for x, y in sp], soft=1.5), hexc(body), .85, edge=.6, gran=.3)
    p.lift(p.shape([(cx - 96 * s, cy - 40 * s), (cx - 66 * s, cy - 70 * s), (cx - 54 * s, cy + 40 * s), (cx - 86 * s, cy + 62 * s)], soft=10), .28)
    # rouletted bands: rows of tiny stamped notches round the shoulder, a wavy incised line between them (the matching pattern)
    for row, yy in enumerate((-60, -40, 64)):
        for k in range(26):
            u = (k + .5) / 26; ang = (u - .5) * 2.6; rx = 138 * np.cos(ang * .62)
            x = cx + np.sin(ang) * 138 * s; y = cy + yy * s + np.cos(ang) * 10 * s
            p.glaze(p.shape(circ(x, y, 2.6 * s, 8), soft=.6), hexc('#2a140c'), .7, edge=.6)
    wave = [(cx + (-130 + i * 10) * s, cy + (-50 + 7 * np.sin(i * .9)) * s) for i in range(27)]
    p.line(wave, 2.0, hexc('#2a140c'), .6)
    p.line([(cx - 56 * s, cy - 170 * s), (cx + 56 * s, cy - 170 * s)], 1.6, hexc('#2a140c'), .5)
    return m

def pots():
    rng = np.random.default_rng(9); p = Watercolor(W, H, seed=91, paper_tone='#f3ead9'); p.paper(); section(p, rng)
    for (cx, cy) in [(290, 1040), (790, 1040)]:
        p.glaze(p.shape(circ(cx, cy + 10, 240, 40, 220), soft=30), hexc('#2a1a10'), .25, edge=0, gran=.4)   # the dug pocket
    pot(p, 285, 1060, 1.12, '#a8532c', '#d08a5a'); pot(p, 795, 1060, 1.12, '#97462a', '#c98a5e')
    save(p, 'pots')


# ———————————————————— v2 plates: the tall worlds the one camera travels through ————————————————————
def shore2():
    """1080x2700: a tall dawn sky (the film opens and closes in it), the horizon at 1630 with far isles, the sea, the sand"""
    w, h = 1080, 2700; rng = np.random.default_rng(14)
    p = Watercolor(w, h, seed=141, paper_tone='#f6efe2'); p.paper()
    HZ = 1630
    p.gradient_wash(0, 900, top=hexc('#c9c4d6'), bottom=hexc('#e6cdc4'), strength=.5)
    p.gradient_wash(800, HZ, top=hexc('#e6cdc4'), bottom=hexc('#f3c79c'), strength=.55)
    p.glaze(p.blobs([(rng.uniform(0, w), rng.uniform(300, 1400), rng.uniform(180, 360), rng.uniform(26, 56)) for _ in range(14)], soft=26), hexc('#e3b7a6'), .26, edge=.25, gran=.15)
    p.glaze(p.blobs([(rng.uniform(0, w), rng.uniform(900, 1300), rng.uniform(120, 260), rng.uniform(16, 30)) for _ in range(8)], soft=14), hexc('#f6d7b0'), .3, edge=.4, gran=.1)
    p.glaze(p.shape(circ(700, HZ - 110, 240), soft=100), hexc('#f7d39a'), .35, edge=0, gran=.05)
    p.lift(p.shape(circ(700, HZ - 110, 58), soft=3), .78)
    for (x0, x1, hh_) in [(120, 330, 40), (420, 520, 24), (840, 1040, 46)]:
        pts = bez((x0, HZ), (x0 + (x1 - x0) * .25, HZ - hh_), (x0 + (x1 - x0) * .7, HZ - hh_ * 1.1), (x1, HZ))
        p.glaze(p.shape(pts + [(x1, HZ + 4), (x0, HZ + 4)], soft=3, ragged=.2), hexc('#9aa2b6'), .45, edge=.5, gran=.25)
    p.gradient_wash(HZ, 2120, top=hexc('#c9c3c2'), bottom=hexc('#6f8aa0'), strength=.6, soft_bottom=40)
    for k in range(26):
        yy = HZ + 10 + k * k * .64; ww = rng.uniform(120, 420); xx = rng.uniform(-60, w)
        p.stroke([(xx, yy), (xx + ww * .5, yy + rng.uniform(-2, 2)), (xx + ww, yy)], 2 + k * .25, hexc('#56708a'), .25, dry=.6, taper=(.3, .3))
    for k in range(18):
        yy = HZ + 8 + k * 22; ww = 70 - k * 2.5
        p.lift(p.shape([(700 - ww, yy), (700 + ww, yy), (700 + ww * .8, yy + 6), (700 - ww * .8, yy + 6)], soft=2), .55)
    surf = bez((-40, 2125), (300, 2100), (700, 2140), (1120, 2112))
    p.glaze(p.shape(surf + [(1120, 2170), (-40, 2180)], soft=10), hexc('#e8ddcc'), .5, edge=.3, gran=.1)
    p.glaze(p.shape([(-40, 2160), (1120, 2140), (1120, h), (-40, h)], soft=14), hexc('#d7b58a'), .55, edge=.2, gran=.6)
    p.glaze(p.shape([(-40, 2320), (1120, 2290), (1120, h), (-40, h)], soft=50), hexc('#c39a6a'), .35, edge=0, gran=.6)
    x, b, ww, hh_ = 150, HZ + 2, 92, 230
    tw = bez((x - ww / 2, b), (x - ww * .55, b - hh_ * .55), (x - ww * .4, b - hh_ * .86), (x - ww * .15, b - hh_ * .95)) + [(x + ww * .15, b - hh_ * .95)] + bez((x + ww * .15, b - hh_ * .95), (x + ww * .4, b - hh_ * .86), (x + ww * .55, b - hh_ * .55), (x + ww / 2, b))
    p.glaze(p.shape(tw, soft=1.5, ragged=.08), hexc('#857a88'), .5, edge=.55, gran=.3)
    p.glaze(p.shape(circ(x, b - hh_ * .97, ww * .26, 24, hh_ * .05), soft=1.2), hexc('#776c7c'), .55, edge=.6)
    for k in range(6): p.line([(x - ww * .46 + k * 2, b - hh_ * (.12 + k * .13)), (x + ww * .46 - k * 2, b - hh_ * (.12 + k * .13))], 1.1, hexc('#6e6372'), .45)
    trunk = bez((1110, 2300), (1020, 2000), (960, 1640), (930, 1380))
    p.stroke(trunk, 26, hexc('#6c5a48'), .65, dry=.25, taper=(.0, .6))
    for k in range(9):
        a = -2.9 + k * .45; L = rng.uniform(230, 330); x0, y0 = 930, 1380
        tip = (x0 + np.cos(a) * L, y0 + np.sin(a) * L * .55 + 60)
        fr = bez((x0, y0), (x0 + np.cos(a) * L * .4, y0 - 40), (tip[0] - np.cos(a) * 40, tip[1] - 40), tip)
        p.stroke(fr, 10, hexc('#4c6a3a'), .6, dry=.3, taper=(.1, .9))
        for j in range(1, 12):
            q = fr[int(j / 12 * (len(fr) - 1))]; p.stroke([q, (q[0] + 18, q[1] + 34)], 3, hexc('#4c6a3a'), .45, dry=.5, taper=(0, .8))
    # a soft shadow on the sand where the carved stone stands (the stone itself is the relief, placed by the film)
    p.glaze(p.shape(circ(430, 2560, 150, 40, 26), soft=30), hexc('#8a6a48'), .35, edge=0, gran=.4)
    Image.fromarray((np.clip(p.img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'shore2.png')); print('saved shore2')

def earth2():
    """1080x2600: the sand under the broken stone, the beds of the old port, and deep down, the kendi of Manikapatna"""
    w, h = 1080, 2600; rng = np.random.default_rng(21)
    p = Watercolor(w, h, seed=211, paper_tone='#f3ead9'); p.paper()
    p.glaze(p.shape([(-20, 0), (w + 20, 0), (w + 20, h + 20), (-20, h + 20)], soft=2), hexc('#d8b98a'), .5, edge=0, gran=.6)
    beds = [(180, '#c9a473'), (420, '#b78e60'), (700, '#a37a52'), (1000, '#8e6a48'), (1320, '#7c5b3e'), (1680, '#6b4d34'), (2060, '#5a402c'), (2400, '#4a3424')]
    for (yy, col) in beds:
        top = [(xx, yy + 14 * np.sin(xx / 170 + yy) + rng.uniform(-3, 3)) for xx in np.linspace(-20, w + 20, 18)]
        p.glaze(p.shape(top + [(w + 20, h + 20), (-20, h + 20)], soft=4, ragged=.25), hexc(col), .32, edge=.5, gran=.7)
    p.glaze(p.blobs([(rng.uniform(0, w), rng.uniform(100, h), rng.uniform(4, 13), rng.uniform(3, 9)) for _ in range(220)], soft=1.5, ragged=.4), hexc('#4a3626'), .45, edge=.6, gran=.4)
    p.glaze(p.blobs([(rng.uniform(0, w), rng.uniform(100, h), rng.uniform(5, 10), rng.uniform(2, 5)) for _ in range(90)], soft=1, ragged=.3), hexc('#efe4cf'), .55, edge=.5, gran=.2)
    for k in range(26):
        xx = rng.uniform(0, w); y0 = rng.uniform(0, 500)
        p.stroke(bez((xx, y0), (xx + rng.uniform(-30, 30), y0 + 80), (xx + rng.uniform(-40, 40), y0 + 150), (xx + rng.uniform(-50, 50), y0 + rng.uniform(180, 320))), 1.6, hexc('#5e4632'), .35, dry=.5, taper=(.1, .9))
    for k in range(9):   # potsherds and shells scattered through the beds (an old port's floor)
        cx, cy = rng.uniform(80, 1000), rng.uniform(700, 2300); a = rng.uniform(0, 3)
        pts = [(cx + np.cos(a + t) * rng.uniform(14, 30), cy + np.sin(a + t) * rng.uniform(8, 18)) for t in np.linspace(0, 2 * np.pi, 7, endpoint=False)]
        p.glaze(p.shape(pts, soft=1.2), hexc('#9a4a2a'), .7, edge=.6, gran=.3)
    p.glaze(p.shape(circ(540, 1560, 300, 48, 280), soft=40), hexc('#2a1a10'), .28, edge=0, gran=.4)   # the dug pocket round the find
    pot(p, 540, 1560, 1.35, '#a8532c', '#d08a5a')
    Image.fromarray((np.clip(p.img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'earth2.png')); print('saved earth2')

def fair():
    """1080x2600: Bali Jatra at night -- a deep sky for the poem, the Ramdoli behind at the left, the stalls' warm mouths,
    a shadow-play booth whose screen (290..790, 1060..1950) the film fills, its plain cloth skirt (the caption's place), the crowd"""
    w, h = 1080, 2600; rng = np.random.default_rng(31)
    p = Watercolor(w, h, seed=311, paper_tone='#efe6d6'); p.paper()
    full = lambda y0, y1: p.shape([(-20, y0), (w + 20, y0), (w + 20, y1), (-20, y1)], soft=6)
    p.gradient_wash(0, 1560, top=hexc('#0c1230'), bottom=hexc('#2a2040'), strength=.95, gran=.25)
    for col, st in (('#141a3a', .7), ('#0e1430', .55)): p.glaze(full(0, 1560), hexc(col), st, edge=0, gran=.35)
    p.glaze(p.blobs([(rng.uniform(0, w), rng.uniform(1250, 1560), rng.uniform(180, 320), rng.uniform(70, 130)) for _ in range(10)], soft=70), hexc('#d0783a'), .42, edge=0, gran=.1)   # the fair's glow on the haze
    for _ in range(170): p.lift(p.shape(circ(rng.uniform(0, w), rng.uniform(20, 1150), rng.uniform(1, 2.4), 8), soft=.5), rng.uniform(.35, .85))
    p.lift(p.shape(circ(880, 250, 48), soft=2), .9); p.glaze(p.shape(circ(880, 250, 150), soft=70), hexc('#e8dcc8'), .12, edge=0)   # the full moon of Kartika
    cx, cy, R = 150, 1330, 200   # the Ramdoli, behind at the left
    for _ in range(2): p.glaze(p.band(circ(cx, cy, R, 90), 9), hexc('#0a0814'), .7, edge=.5)
    for k in range(14):
        a_ = k / 14 * np.pi * 2; p.line([(cx, cy), (cx + np.cos(a_) * R, cy + np.sin(a_) * R)], 3, hexc('#0a0814'), .8)
    p.stroke([(cx - 140, cy + 330), (cx, cy), (cx + 140, cy + 330)], 12, hexc('#0a0814'), .85, dry=.1, taper=(0, 0))
    for xx in range(-60, 1100, 128):   # the stalls: peaked roofs, warm open fronts
        roof = [(xx, 1560), (xx + 64, 1486), (xx + 128, 1560)]
        for _ in range(2): p.glaze(p.shape(roof + [(xx + 128, 1600), (xx, 1600)], soft=2), hexc('#0c0a16'), .8, edge=.5)
        p.glaze(p.shape([(xx + 14, 1600), (xx + 114, 1600), (xx + 114, 1680), (xx + 14, 1680)], soft=4), hexc('#f0a850'), .75, edge=.2, gran=.1)
        p.glaze(p.shape(circ(xx + 64, 1630, 90, 24, 60), soft=40), hexc('#e88a3a'), .25, edge=0)
    for col, st in (('#160e1c', .9), ('#0c0812', .8)): p.glaze(full(1680, h + 20), hexc(col), st, edge=.1, gran=.4)
    for xx in (262, 818):   # the booth: bamboo posts, a striped canopy, the screen frame, the skirt
        for _ in range(2): p.stroke([(xx, 960), (xx, 2190)], 22, hexc('#4a2e16'), .9, dry=.15, taper=(0, 0))
    can = [(220, 1000), (860, 1000), (900, 930), (540, 860), (180, 930)]
    for _ in range(2): p.glaze(p.shape(can, soft=2), hexc('#7a2214'), .85, edge=.5, gran=.3)
    for k in range(9): p.glaze(p.shape([(220 + k * 72, 1000), (256 + k * 72, 1000), (256 + k * 72, 1040), (220 + k * 72, 1040)], soft=1), hexc('#d8a640' if k % 2 else '#7a2214'), .85, edge=.4)
    for _ in range(2): p.glaze(p.shape([(276, 1046), (804, 1046), (804, 1966), (276, 1966)], soft=1), hexc('#120804'), .9, edge=.2)
    for _ in range(2): p.glaze(p.shape([(250, 1960), (830, 1960), (850, 2200), (230, 2200)], soft=2), hexc('#5a1e12'), .85, edge=.4, gran=.4)
    for k in range(3): p.line([(250, 2000 + k * 12), (830, 2000 + k * 12)], 2, hexc('#d8a640'), .55)
    for k in range(13):   # the crowd watching, backs to us, rims lit by the screen
        hx = -30 + k * 92 + rng.uniform(-20, 20); hy = 2320 + rng.uniform(-30, 40); s_ = rng.uniform(.9, 1.15)
        for _ in range(2):
            p.glaze(p.shape(circ(hx, hy, 44 * s_, 24, 50 * s_), soft=2), hexc('#06040a'), .92, edge=.4)
            p.glaze(p.shape([(hx - 100 * s_, h + 10), (hx - 80 * s_, hy + 70 * s_), (hx, hy + 44 * s_), (hx + 80 * s_, hy + 70 * s_), (hx + 100 * s_, h + 10)], soft=2), hexc('#06040a'), .92, edge=.3)
        p.glaze(p.shape(circ(hx, hy - 40 * s_, 30, 16, 12), soft=8), hexc('#d08a4a'), .28, edge=0)
    hx, hy = 470, 2200
    for _ in range(2): p.glaze(p.shape(circ(hx, hy, 30, 20, 34), soft=2), hexc('#06040a'), .92, edge=.4); p.glaze(p.shape([(hx - 50, 2320), (hx - 40, hy + 30), (hx + 40, hy + 30), (hx + 50, 2320)], soft=2), hexc('#06040a'), .92, edge=.3)
    Image.fromarray((np.clip(p.img, 0, 1) * 255).astype(np.uint8)).save(os.path.join(OUT, 'fair.png')); print('saved fair')

if __name__ == '__main__':
    for n in (sys.argv[1:] or ['shore', 'strata', 'pots']): globals()[n]()
