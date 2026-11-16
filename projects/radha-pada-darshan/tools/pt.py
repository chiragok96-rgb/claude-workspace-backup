"""pt -- pattachitra on primed cloth (numpy + Pillow; claude-drawing core). Raghurajpur practice, in the painter's order:
the cloth is primed with chalk + tamarind gum and burnished; the border is laid; flat mineral colours go on one pot at a time
(matte, a little streaky, edges wandering a hair); last a fine black brush line goes round everything and the white dots and
petals are added. All drawing is in pixels of the target image; shapes are polygons (lists of (x, y)).
"""
import sys, os
sys.path.insert(0, '/root/claude-drawing-skill/lib')
import numpy as np
from PIL import Image, ImageDraw
from core import blur, noise2d, polygon_mask, smoothstep

ASSETS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
PIG = dict(red='#b02f1c', redD='#86231a', yel='#e0a92a', yelD='#c48b1c', ochre='#bf7631', white='#f1e8d2', cream='#e9d8b2',
           black='#1a1510', blue='#2c5c9b', blueD='#1d3d70', indigo='#1c284a', green='#4b7739', greenD='#2d5227', skin='#e6b487',
           skinD='#c48d5f', pink='#d47a66', night='#14192a', grey='#857c6b', saffron='#d9762a')
def hexc(h): h = h.lstrip('#'); return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255

def bez(p0, p1, p2, p3, n=24):
    t = np.linspace(0, 1, n)[:, None]; u = 1 - t
    return [tuple(r) for r in (u**3 * np.array(p0, float) + 3 * u * u * t * np.array(p1, float) + 3 * u * t * t * np.array(p2, float) + t**3 * np.array(p3, float))]
def path(*segs):
    """join bezier/point segments: each seg is either a point (x, y) or a 4-tuple of points (a cubic)"""
    out = []
    for s in segs:
        if len(s) == 4 and hasattr(s[0], '__len__'): out += bez(*s)
        else: out.append(tuple(s))
    return out
def ellipse(cx, cy, rx, ry, rot=0.0, n=48):
    a = np.linspace(0, 2 * np.pi, n, endpoint=False); c, s = np.cos(rot), np.sin(rot)
    return [(cx + rx * np.cos(t) * c - ry * np.sin(t) * s, cy + rx * np.cos(t) * s + ry * np.sin(t) * c) for t in a]
def xform(pts, x=0, y=0, s=1.0, m=1, rot=0.0):
    c, sn = np.cos(rot), np.sin(rot)
    return [(x + (m * px * c - py * sn) * s, y + (m * px * sn + py * c) * s) for px, py in pts]

class Patta:
    def __init__(self, W, H, seed=0, ground='#e9d8b2'):
        self.W, self.H = W, H; self.rng = np.random.default_rng(seed); self.seed = seed
        tex = np.asarray(Image.open(os.path.join(ASSETS, 'patta.png')).convert('L').resize((W, H)), np.float32) / 255
        self.tex = tex
        self.img = np.ones((H, W, 3), np.float32) * hexc(ground) * (0.82 + 0.18 * tex[..., None])
        self.YY, self.XX = np.mgrid[0:H, 0:W].astype(np.float32)
        self._streak = None

    def _s(self): return int(self.rng.integers(1 << 30))
    def mask(self, pts, ss=3): return polygon_mask(self.H, self.W, pts, ss=ss)

    def streaks(self):
        if self._streak is None:   # brush streaks: noise stretched along x (the painter's sweep), plus fine mottling
            a = noise2d(self.H, self.W // 8 + 1, 3, 3, self._s()); a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).resize((self.W, self.H), Image.BILINEAR), np.float32) / 255
            self._streak = (a - .5) * .9 + (noise2d(self.H, self.W, 14, 3, self._s()) - .5) * .7
        return self._streak

    def fill(self, m, colour, opacity=0.97, wander=0.9, mottle=1.0):
        """a flat matte pigment fill over mask m (0..1): streaky, mottled, edges wandering; the cloth shows a little"""
        if wander: m = smoothstep(.3, .7, blur(m, wander) + (noise2d(self.H, self.W, 3, 2, self._s()) - .5) * .35)
        col = hexc(colour)[None, None, :] * (1 + .07 * mottle * self.streaks()[..., None]) * (0.93 + 0.07 * self.tex[..., None])
        a = (m * opacity)[..., None]
        self.img = self.img * (1 - a) + np.clip(col, 0, 1) * a
        return m

    def poly(self, pts, colour, ink=True, lw=2.6, opacity=0.97, inkcol=None):
        m = self.fill(self.mask(pts), colour, opacity)
        if ink: self.line(pts + [pts[0]], lw, inkcol)
        return m

    def line(self, pts, lw=2.6, colour=None, alpha=0.92, taper=False):
        """the chitrakar's brush line: nearly even, a little swelling, slightly broken where the brush runs dry"""
        S = 3; img = Image.new('L', (self.W * S, self.H * S), 0); d = ImageDraw.Draw(img)
        P = [(x * S, y * S) for x, y in pts]; n = len(P)
        for i in range(n - 1):
            t = i / max(1, n - 2)
            w = lw * (1 + .18 * np.sin(i * .7 + self.seed)) * ((np.sin(np.pi * t) ** .35) if taper else 1)
            d.line([P[i], P[i + 1]], fill=255, width=max(1, int(round(w * S))))
            r = w * S / 2; d.ellipse([P[i + 1][0] - r, P[i + 1][1] - r, P[i + 1][0] + r, P[i + 1][1] + r], fill=255)
        m = np.asarray(img.resize((self.W, self.H), Image.LANCZOS), np.float32) / 255
        dry = smoothstep(.15, .55, noise2d(self.H, self.W, 5, 2, self._s()))
        a = (m * alpha * (.82 + .18 * dry))[..., None]
        col = hexc(colour or PIG['black'])
        self.img = self.img * (1 - a) + col * a

    def dots(self, pts, r=2.6, colour=None, alpha=0.95):
        m = np.zeros((self.H, self.W), np.float32)
        S = 3; img = Image.new('L', (self.W * S, self.H * S), 0); d = ImageDraw.Draw(img)
        for x, y in pts: d.ellipse([(x - r) * S, (y - r) * S, (x + r) * S, (y + r) * S], fill=255)
        m = np.asarray(img.resize((self.W, self.H), Image.LANCZOS), np.float32) / 255
        a = (m * alpha)[..., None]; self.img = self.img * (1 - a) + hexc(colour or PIG['white']) * a

    def petal(self, x, y, length, width, ang, colour, ink=True, lw=1.6):
        pts = path(((0, 0), (width, -length * .25), (width * .7, -length * .8), (0, -length)), ((0, -length), (-width * .7, -length * .8), (-width, -length * .25), (0, 0)))
        pts = xform(pts, x, y, 1, 1, ang); self.poly(pts, colour, ink, lw)

    def rosette(self, x, y, r, n, colour, centre=None, lw=1.4):
        for i in range(n): self.petal(x, y, r, r * .42, i / n * 2 * np.pi, colour, True, lw)
        self.poly(ellipse(x, y, r * .3, r * .3), centre or PIG['yel'], True, lw)

    def creeper(self, x0, x1, y, amp, colour=None, step=46, vertical=False):
        xs = np.arange(x0, x1, 3.0); ys = y + np.sin((xs - x0) / step * np.pi) * amp
        P = list(zip(xs, ys)) if not vertical else list(zip(ys, xs))
        self.line(P, 2.2, colour or PIG['white'], .9)
        for k, x in enumerate(np.arange(x0 + step / 2, x1, step)):
            s = 1 if k % 2 else -1; yy = y + np.sin((x - x0) / step * np.pi) * amp
            leaf = xform(path(((0, 0), (amp * .55, -amp * .5 * s), (amp * .9, -amp * .3 * s), (amp * 1.15, 0)), ((amp * 1.15, 0), (amp * .9, amp * .3 * s), (amp * .55, amp * .5 * s), (0, 0))), 0, 0, 1, 1, s * .9)
            leaf = [(x + px, yy + py) if not vertical else (yy + py, x + px) for px, py in leaf]
            self.fill(self.mask(leaf), colour or PIG['white'], .92, wander=.4)
            cx, cy = (x, yy - s * amp * .95) if not vertical else (yy - s * amp * .95, x)
            self.dots([(cx, cy)], amp * .24, colour or PIG['white'])

    def border(self, x, y, w, h, B=54, R=18, P=26):
        """black band with a white creeper, a red band with white dots, a yellow band of red petals, thin black rules.
        Returns the inner picture field (x, y, w, h)."""
        outer = self.mask([(x, y), (x + w, y), (x + w, y + h), (x, y + h)])
        inner = self.mask([(x + B, y + B), (x + w - B, y + B), (x + w - B, y + h - B), (x + B, y + h - B)])
        self.fill(np.clip(outer - inner, 0, 1), PIG['black'], .98, wander=0)
        self.creeper(x + 18, x + w - 18, y + B / 2, 9); self.creeper(x + 18, x + w - 18, y + h - B / 2, 9)
        self.creeper(y + 18, y + h - 18, x + B / 2, 9, vertical=True); self.creeper(y + 18, y + h - 18, x + w - B / 2, 9, vertical=True)
        x1, y1, w1, h1 = x + B, y + B, w - 2 * B, h - 2 * B
        i2 = self.mask([(x1 + R, y1 + R), (x1 + w1 - R, y1 + R), (x1 + w1 - R, y1 + h1 - R), (x1 + R, y1 + h1 - R)])
        self.fill(np.clip(inner - i2, 0, 1), PIG['red'], .97, wander=0)
        dd = [(x1 + t + 7, y1 + R / 2) for t in np.arange(0, w1 - 8, 15)] + [(x1 + t + 7, y1 + h1 - R / 2) for t in np.arange(0, w1 - 8, 15)]
        dd += [(x1 + R / 2, y1 + t + 7) for t in np.arange(0, h1 - 8, 15)] + [(x1 + w1 - R / 2, y1 + t + 7) for t in np.arange(0, h1 - 8, 15)]
        self.dots(dd, 2.3)
        x2, y2, w2, h2 = x1 + R, y1 + R, w1 - 2 * R, h1 - 2 * R
        i3 = self.mask([(x2 + P, y2 + P), (x2 + w2 - P, y2 + P), (x2 + w2 - P, y2 + h2 - P), (x2 + P, y2 + h2 - P)])
        self.fill(np.clip(i2 - i3, 0, 1), PIG['yel'], .97, wander=0)
        for t in np.arange(P, w2 - P / 2, P * .9):
            self.petal(x2 + t, y2 + P * .9, P * .78, P * .34, 0, PIG['red'], True, 1.3); self.petal(x2 + t, y2 + h2 - P * .9, P * .78, P * .34, np.pi, PIG['red'], True, 1.3)
        for t in np.arange(P, h2 - P / 2, P * .9):
            self.petal(x2 + P * .9, y2 + t, P * .78, P * .34, np.pi / 2, PIG['red'], True, 1.3); self.petal(x2 + w2 - P * .9, y2 + t, P * .78, P * .34, -np.pi / 2, PIG['red'], True, 1.3)
        for (a, b, ww, hh) in [(x, y, w, h), (x1, y1, w1, h1), (x2, y2, w2, h2), (x2 + P, y2 + P, w2 - 2 * P, h2 - 2 * P)]:
            self.line([(a, b), (a + ww, b), (a + ww, b + hh), (a, b + hh), (a, b)], 2.0)
        return (x2 + P, y2 + P, w2 - 2 * P, h2 - 2 * P)

    def field(self, box, colour):
        x, y, w, h = box; return self.fill(self.mask([(x, y), (x + w, y), (x + w, y + h), (x, y + h)]), colour, .98, wander=0)

    def save(self, p):
        Image.fromarray((np.clip(self.img, 0, 1) * 255).astype(np.uint8)).save(p)

# ---------------- the figures' parts ----------------
def foot_front(P, cx, gy, s, m=1, skin=None, alta=True, anklet=None, toering=True, leg=230, tiptoe=0.0, rot=0.0):
    """a foot seen from the front, big toe on the inner side (m=1 → big toe to the right). gy = the ground."""
    skin = skin or PIG['skin']; sx = s * (1 - tiptoe * .25); sy = s * (1 + tiptoe * .2)
    T = lambda pts: [(cx + (m * px * np.cos(rot) - py * np.sin(rot)) * sx, gy + (m * px * np.sin(rot) + py * np.cos(rot)) * sy) for px, py in pts]
    body = path(((-30, -leg), (-33, -190), (-40, -150), (-44, -122)), ((-44, -122), (-54, -102), (-48, -90), (-52, -72)), ((-52, -72), (-60, -50), (-62, -30), (-58, -14)),
                (58, -14), ((58, -14), (60, -46), (46, -80), (34, -110)), ((34, -110), (40, -128), (32, -140), (30, -160)), ((30, -160), (28, -190), (30, -210), (30, -leg)))
    P.poly(T(body), skin, True, 2.4)
    P.line(T(path(((-8, -112), (6, -84), (16, -60), (24, -42)))), 1.1, '#6e4a33', .5, taper=True)
    for tx, ty, rx, ry in [(-48, -9, 8.5, 10), (-32, -11, 9.5, 12), (-14, -12, 10.5, 13), (6, -13, 12, 15), (33, -16, 18, 19)]:
        P.poly(T(ellipse(tx, ty, rx, ry)), skin, True, 1.8)
        if alta: P.fill(P.mask(T(ellipse(tx, ty, rx, ry))) * P.mask(T([(tx - 30, ty + ry * .2), (tx + 30, ty + ry * .2), (tx + 30, ty + 40), (tx - 30, ty + 40)])), PIG['red'], .96, wander=.3); P.line(T(ellipse(tx, ty, rx, ry) + [ellipse(tx, ty, rx, ry)[0]]), 1.6)
        P.poly(T(ellipse(tx, ty - ry * .36, rx * .5, ry * .3)), '#f6e6d6', True, 1.0)
    if alta:
        P.poly(T(path((-60, -15), (60, -16), (60, -6), ((60, -6), (20, 4), (-20, 4), (-60, -4)))), PIG['red'], True, 1.6)
        P.poly(T(ellipse(0, -66, 13, 13)), PIG['red'], True, 1.5); P.dots(T([(0, -66)]), 3.4 * s, skin)
        P.dots(T([(np.cos(a) * 23, -66 + np.sin(a) * 23) for a in np.linspace(0, 2 * np.pi, 11)[:-1]]), 2.3 * s, PIG['red'])
    if toering: P.poly(T([(-1, -27), (13, -27), (13, -21), (-1, -21)]), '#dcd6c4', True, 1.1)
    if anklet:
        P.poly(T(path(((-50, -130), (-20, -120), (10, -124), (38, -134)), (38, -120), ((38, -120), (10, -110), (-20, -106), (-52, -116)))), anklet, True, 1.5)
        for i in range(8):
            px = -44 + i * 11; py = -104 + np.sin(i / 7 * np.pi) * 4
            P.poly(T(ellipse(px, py, 4.6, 4.6)), anklet, True, 1.1)

def footprint(P, x, y, s, ang=0.0, colour=None, m=1, alpha=0.95):
    """an alta footprint seen from above (toes up), as a foot leaves it on a floor: the sole with the arch gap, five toe dots"""
    sole = path(((0, 62), (-26, 60), (-28, 28), (-20, 4)), ((-20, 4), (-14, -16), (-28, -32), (-22, -48)), ((-22, -48), (-14, -66), (18, -64), (22, -44)),
                ((22, -44), (24, -30), (8, -14), (10, 8)), ((10, 8), (12, 30), (24, 44), (0, 62)))
    pts = xform(sole, x, y, s, m, ang)
    P.fill(P.mask(pts), colour or PIG['red'], alpha, wander=.8)
    for tx, ty, r in [(16, -80, 9.5), (-1, -84, 7.5), (-14, -80, 6.5), (-24, -71, 5.5), (-31, -60, 4.6)]:
        P.fill(P.mask(xform(ellipse(tx, ty, r, r * 1.1), x, y, s, m, ang)), colour or PIG['red'], alpha, wander=.6)

def pedestal(P, cx, gy, w, colour=None):
    c = colour or PIG['ochre']
    P.poly([(cx - w / 2, gy), (cx + w / 2, gy), (cx + w / 2, gy + 26), (cx - w / 2, gy + 26)], c)
    P.poly([(cx - w / 2 - 14, gy + 26), (cx + w / 2 + 14, gy + 26), (cx + w / 2 + 14, gy + 50), (cx - w / 2 - 14, gy + 50)], PIG['yelD'])
    for px in np.arange(cx - w / 2 + 16, cx + w / 2 - 8, 30): P.petal(px, gy + 27, 22, 10, np.pi, PIG['red'], True, 1.1)
    P.poly([(cx - w / 2 - 28, gy + 50), (cx + w / 2 + 28, gy + 50), (cx + w / 2 + 28, gy + 82), (cx - w / 2 - 28, gy + 82)], c)
    P.dots([(px, gy + 66) for px in np.linspace(cx - w / 2 - 18, cx + w / 2 + 18, int(w / 14))], 2.4)
