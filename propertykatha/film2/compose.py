"""The Gate v2 - final compositor: Cycles land (graded) + v1 paper scenes, wet-edge hand-offs, caption layer, end card, loop.
  python3 compose.py <outdir> <frames "a-b,c"> [--cyc DIR] [--workers 4]
Frames: 0..1666 at 30 fps (1080x1920).  Writes <outdir>/f_NNNNN.jpg (q 96)."""
import os, sys, json, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from multiprocessing import Pool

HERE = os.path.dirname(os.path.abspath(__file__)); FD = os.path.join(HERE, "fonts")
W, H, FPS, NF = 1080, 1920, 30, 1667
args = sys.argv[1:]
OUT = args[0]; SPEC = args[1]
CYC = args[args.index("--cyc") + 1] if "--cyc" in args else os.path.join(HERE, "cycles")
WORKERS = int(args[args.index("--workers") + 1]) if "--workers" in args else 4
PAP = os.path.join(HERE, "paper")
LOGO = os.path.join(HERE, "..", "deliverables", "propertykatha_logo.png")

def cl(x, a=0.0, b=1.0): return max(a, min(b, x))
def ss(a, b, t): x = cl((t - a) / (b - a)); return x * x * (3 - 2 * x)
def eo(x): x = cl(x); return 1 - (1 - x) ** 3

# ============================================================== type
RAQM = ImageFont.Layout.RAQM
_FC = {}
def font(name, size):
    k = (name, size)
    if k not in _FC: _FC[k] = ImageFont.truetype(os.path.join(FD, name + ".ttf"), size, layout_engine=RAQM)
    return _FC[k]
OD7, OD5 = "noto-serif-oriya-oriya-700-normal", "noto-serif-oriya-oriya-500-normal"
SER6 = "noto-serif-latin-600-normal"; CG6 = "cormorant-garamond-latin-600-normal"; CG6I = "cormorant-garamond-latin-600-italic"
IT6 = "inter-tight-latin-600-normal"
def is_odia(ch):
    c = ord(ch); return 0x0B00 <= c <= 0x0B7F or c in (0x20B9, 0x0964, 0x0965, 0x200C, 0x200D)
def runs(text):
    out = []; cur = ""; kind = None
    for ch in text:
        k = "o" if is_odia(ch) else ("s" if ch == " " else "l")
        if k == "s": cur += ch; continue
        if kind is None or k == kind: cur += ch; kind = k
        else: out.append((kind, cur)); cur = ch; kind = k
    if cur: out.append((kind or "l", cur))
    return out
def line_mask(text, size, latin=SER6, odia=OD7, lscale=0.9, tracking=0.0):
    """Mixed Odia/Latin line -> (L mask, baseline y).  Odia via Noto Serif Oriya (raqm), Latin via `latin`."""
    rs = runs(text); fo = font(odia, size); fl = font(latin, int(round(size * lscale)))
    asc = max(fo.getmetrics()[0], fl.getmetrics()[0]); dsc = max(fo.getmetrics()[1], fl.getmetrics()[1])
    pad = int(size * 0.35); widths = []
    for k, s in rs:
        f = fo if k == "o" else fl
        widths.append(f.getlength(s, language="or" if k == "o" else None) + tracking * len(s))
    w = int(sum(widths)) + 2 * pad; h = asc + dsc + 2 * pad
    m = Image.new("L", (w, h), 0); d = ImageDraw.Draw(m); x = pad; by = pad + asc
    for (k, s), wd in zip(rs, widths):
        f = fo if k == "o" else fl
        if tracking and k == "l":
            xx = x
            for ch in s: d.text((xx, by), ch, font=f, fill=255, anchor="ls"); xx += f.getlength(ch) + tracking
        else:
            d.text((x, by), s, font=f, fill=255, anchor="ls", language="or" if k == "o" else None)
        x += wd
    return m, by
def label_mask(text, size=26, tracking=5.5, face=IT6):
    f = font(face, size); w = int(sum(f.getlength(c) + tracking for c in text)) + 40; asc, dsc = f.getmetrics()
    m = Image.new("L", (w, asc + dsc + 20), 0); d = ImageDraw.Draw(m); x = 20
    for c in text: d.text((x, 10 + asc), c, font=f, fill=255, anchor="ls"); x += f.getlength(c) + tracking
    return m.crop(m.getbbox()) if m.getbbox() else m, 0

GOLD = ((246, 220, 156), (200, 154, 76)); IVORY = (244, 236, 220); LGOLD = (217, 180, 106)
def colorize(mask, col):
    a = np.asarray(mask).astype(np.float32) / 255.0; h, w = a.shape
    if isinstance(col[0], tuple):
        g = np.linspace(0, 1, h)[:, None, None]; c = np.array(col[0], np.float32) * (1 - g) + np.array(col[1], np.float32) * g
        rgb = np.broadcast_to(c, (h, w, 3)).copy()
    else: rgb = np.broadcast_to(np.array(col, np.float32), (h, w, 3)).copy()
    return np.dstack([rgb, a * 255]).astype(np.float32)

class Block:
    """A caption block: hero line (+ optional second line) + gold label, with soft shadow + backing glow.
    Stored as float RGBA arrays; anchor = (center x, hero baseline y)."""
    def __init__(self, hero=None, size=88, color=IVORY, latin=SER6, lscale=0.9, sub=None, subsize=54, subcolor=IVORY,
                 label=None, labcol=LGOLD, labsize=25, accent=None, accsize=52, gap=18, dark=False, backing=1.0, hero_mask=None):
        parts = []
        if hero_mask is not None: parts.append(("hero", hero_mask[0], hero_mask[1], color))
        elif hero: m, by = line_mask(hero, size, latin=latin, lscale=lscale); parts.append(("hero", m, by, color))
        if sub: m, by = line_mask(sub, subsize, latin=SER6); parts.append(("sub", m, by, subcolor))
        if accent: m, by = line_mask(accent, accsize, latin=CG6I, lscale=1.0); parts.append(("acc", m, by, GOLD))
        if label: m, by = label_mask(label, labsize); parts.append(("lab", m, by, labcol))
        # tight-crop vertically each part, stack
        ims = []
        for kind, m, by, col in parts:
            bb = m.getbbox() or (0, 0, 1, 1); mm = m.crop((0, bb[1], m.width, bb[3]))
            ims.append((kind, mm, by - bb[1], col))
        BW = max(m.width for _, m, _, _ in ims) + 260
        hs = [m.height for _, m, _, _ in ims]; BH = sum(hs) + gap * (len(ims) - 1) + 200
        rgba = np.zeros((BH, BW, 4), np.float32); y = 100; self.base = None
        self.lab = np.zeros((BH, BW), np.float32); self.labcol = np.array(labcol, np.float32)
        for (kind, m, by, col), hgt in zip(ims, hs):
            x = (BW - m.width) // 2; c = colorize(m, col)
            if kind == "lab" and not dark:
                self.lab[y:y + hgt, x:x + m.width] = np.asarray(m).astype(np.float32) / 255.0
                if self.base is None: self.base = y + hgt / 2
                y += hgt + gap; continue
            sl = rgba[y:y + hgt, x:x + m.width]; a = c[..., 3:4] / 255.0
            sl[..., :3] = sl[..., :3] * (1 - a) + c[..., :3] * a; sl[..., 3:4] = np.maximum(sl[..., 3:4], c[..., 3:4])
            if self.base is None: self.base = (y + hgt / 2) if kind == "lab" else (y + by)
            y += hgt + (gap if kind != "hero" else gap + 6)
        self.rgba = rgba; self.w, self.h = BW, BH
        a = Image.fromarray(np.maximum(rgba[..., 3], self.lab * 255).astype(np.uint8))
        self.shadow = np.asarray(a.filter(ImageFilter.GaussianBlur(9))).astype(np.float32) / 255.0 * 0.62
        self.dark = dark; self.backing = backing
        yy, xx = np.mgrid[0:BH, 0:BW].astype(np.float32)
        r = np.sqrt(((xx - BW / 2) / (BW * 0.5)) ** 2 + ((yy - BH / 2) / (BH * 0.5)) ** 2)
        self.glow = np.clip(1 - r, 0, 1) ** 0.9 * (0.36 if not dark else 0.9) * backing

def blit(frame, blk, cx, base_y, alpha=1.0, sweep=1.0, dy=0.0, scale=1.0, glint=-1.0):
    """Composite a Block onto frame (float32 HxWx3, 0..255). sweep: 0..1 light-sweep reveal (left->right)."""
    if alpha <= 0.002: return
    rgba, sh, gl = blk.rgba, blk.shadow, blk.glow
    if scale != 1.0:
        nw, nh = int(blk.w * scale), int(blk.h * scale)
        rgba = np.asarray(Image.fromarray(np.clip(rgba, 0, 255).astype(np.uint8), "RGBA").resize((nw, nh), Image.LANCZOS)).astype(np.float32)
        sh = np.asarray(Image.fromarray((sh * 255).astype(np.uint8)).resize((nw, nh))).astype(np.float32) / 255
        gl = np.asarray(Image.fromarray((gl * 255).astype(np.uint8)).resize((nw, nh))).astype(np.float32) / 255
    h, w = rgba.shape[:2]
    x0 = int(round(cx - w / 2)); y0 = int(round(base_y - blk.base * scale + dy))
    fx0, fy0 = max(0, x0), max(0, y0); fx1, fy1 = min(W, x0 + w), min(H, y0 + h)
    if fx1 <= fx0 or fy1 <= fy0: return
    bx0, by0 = fx0 - x0, fy0 - y0; bx1, by1 = bx0 + (fx1 - fx0), by0 + (fy1 - fy0)
    sub = rgba[by0:by1, bx0:bx1]; a = sub[..., 3] / 255.0; s = sh[by0:by1, bx0:bx1]; g = gl[by0:by1, bx0:bx1]
    lab = blk.lab if scale == 1.0 else np.asarray(Image.fromarray((blk.lab * 255).astype(np.uint8)).resize((w, h))).astype(np.float32) / 255
    lab = lab[by0:by1, bx0:bx1]
    if sweep < 1.0:
        edge = 0.22 * w; cols = np.arange(bx0, bx1, dtype=np.float32)
        sx = -edge + (w + 2 * edge) * sweep; m = np.clip((sx - cols) / edge, 0, 1)[None, :]
        a = a * m; s = s * m; g = g * m; lab = lab * m
    F = frame[fy0:fy1, fx0:fx1]
    lum = float((F @ np.array([0.2126, 0.7152, 0.0722], np.float32)).mean()) / 255.0
    if g.max() > 0:                                                                               # backing adapts to what is behind
        if blk.dark: F[...] = F * (1 - 0.75 * g * alpha)[..., None] + np.array([250, 242, 226], np.float32) * (0.75 * g * alpha)[..., None]
        else:
            k = ((0.55 + 0.75 * cl((lum - 0.40) / 0.25)) * g * alpha)[..., None]
            F[...] = F * (1 - k) + np.array([52, 34, 20], np.float32) * k
    if not blk.dark: F *= (1 - s * alpha)[..., None]                                             # soft shadow
    col = sub[..., :3]
    if glint >= 0:                                                                                # a gold glint sweeping across
        cols = np.arange(bx0, bx1, dtype=np.float32)[None, :]; rows = np.arange(by0, by1, dtype=np.float32)[:, None]
        gx = -0.3 * w + 1.6 * w * glint; band = np.exp(-(((cols + 0.45 * rows) - gx) / (0.07 * w)) ** 2)
        col = col + band[..., None] * np.array([90, 70, 40], np.float32)
    F[...] = F * (1 - (a * alpha)[..., None]) + np.minimum(col, 255) * (a * alpha)[..., None]
    if lab.max() > 0:                                       # label ink adapts: gold on dark scenes, deep bronze on bright ones
        lc = blk.labcol * (1 - cl((lum - 0.48) / 0.15)) + np.array([104, 70, 30], np.float32) * cl((lum - 0.48) / 0.15)
        la = (lab * alpha)[..., None]; F[...] = F * (1 - la) + lc * la

# ============================================================== caption plan (times from the voiceover)
INR = lambda v: "{:,}".format(v)
def inr(v):
    s = str(int(v)); last3, rest = s[-3:], s[:-3]; parts = []
    while len(rest) > 2: parts.insert(0, rest[-2:]); rest = rest[:-2]
    if rest: parts.insert(0, rest)
    return ",".join(parts + [last3]) if parts else last3
ODIG = "୦୧୨୩୪୫୬୭୮୯"
def odia_num(n): return "".join(ODIG[int(c)] for c in str(n))

CAPS = []   # (t_in, t_out, block, y, opts)
def cap(t0, t1, y, mode="sweep", glint=False, din=0.45, dout=0.32, **kw):
    CAPS.append((t0, t1, Block(**kw), y, dict(mode=mode, glint=glint, din=din, dout=dout)))
cap(6.44, 7.40, 420, mode="hard", hero="Gate ଲାଗିଗଲା", size=96, label="A GATE WENT UP", dout=0.25)
cap(7.55, 8.95, 380, hero="ପାଖ ଜମି ମାଲିକ", size=64, label="THE NEIGHBOURING LANDOWNER", din=0.4)
cap(10.96, 12.55, 420, hero="ସେ ଭୁଲ୍ କହୁନଥିଲେ", size=82, accent="He wasn't wrong.", accsize=54)
cap(12.67, 14.62, 400, hero="ଆଖିକୁ ଦିଶୁଥିବା Road", size=80, label="THE ROAD YOU CAN SEE")
cap(14.74, 16.82, 400, hero="ସରକାରୀ Road ନୁହେଁ", size=90, label="IS NOT ALWAYS A GOVERNMENT ROAD")
cap(16.95, 19.15, 410, hero="Advance ପୂର୍ବରୁ", size=92, label="BEFORE YOU PAY ANY ADVANCE")
cap(19.15, 21.95, 360, hero="Bhulekh Map", size=104, latin=CG6I, lscale=1.0, color=((70, 44, 22), (43, 29, 18)), label="FIND THE ROAD'S PLOT NUMBER", labcol=(122, 90, 38), dark=True, backing=1.0)
cap(22.05, 23.90, 390, hero="ପଟ୍ଟା ଦେଖନ୍ତୁ", size=92, label="CHECK ITS PATTA · RECORD OF RIGHTS")
cap(23.95, 26.70, 390, hero="ଓଡ଼ିଶା ସରକାର · କିସମ ରାସ୍ତା", size=66, label="GOVERNMENT LAND · KISAM: ROAD", labcol=(159, 208, 169))
cap(26.85, 28.65, 390, hero="ବଢ଼ିଆ, କିଛି tension ନାହିଁ", size=74, label="ALL CLEAR", labcol=(159, 208, 169))
cap(28.80, 31.00, 390, hero="ବ୍ୟକ୍ତିଙ୍କ ନାମ ଥିଲେ", size=80, label="IF IT SHOWS A PERSON'S NAME", dout=0.25)
cap(31.05, 32.40, 410, mode="hush", hero="ସାବଧାନ୍", size=128, color=(232, 104, 80), label="CAUTION", labcol=(232, 120, 96), din=0.38, dout=0.4)
cap(32.45, 34.55, 390, hero="Sale Deed · ପୁରୁଣା Documents", size=70, label="THE SALE DEED AND OLD PAPERS")
cap(34.60, 37.65, 400, glint=True, hero="Right of Way", size=118, latin=CG6I, lscale=1.0, color=GOLD, label="IS THERE PROOF OF PASSAGE?")
cap(37.85, 41.10, 390, hero="Registered କାଗଜରେ ବାଟ", size=80, label="IF NOT, TAKE IT ON REGISTERED PAPER")
cap(42.71, 44.20, 400, hero="Gate ଲାଗିବା ପରେ ନୁହେଁ", size=78, label="NOT AFTER THE GATE GOES UP")
cap(44.35, 45.90, 400, hero="Advance ଦେବା ପୂର୍ବରୁ", size=86, label="BEFORE YOU PAY THE ADVANCE", dout=0.25)
cap(45.96, 48.30, 410, glint=True, hero="ରାସ୍ତାର ଅଧିକାର ନିଶ୍ଚିତ କରନ୍ତୁ", size=72, color=GOLD, label="SECURE THE RIGHT OF WAY FIRST")
cap(48.40, 50.50, 400, hero="ଘରେ କେହି ଜମି କିଣିବାକୁ ଭାବୁଛନ୍ତି?", size=64, label="SOMEONE AT HOME PLANNING TO BUY LAND?")
cap(50.60, 55.10, 1350, hero="ତାଙ୍କୁ ପଠାନ୍ତୁ", size=74, label="SEND THIS TO THEM", dout=0.4)
MOUTH = Block(hero="ମୁହଁ କଥାରେ ନୁହେଁ", size=80, label="NOT BY WORD OF MOUTH")
BOARD_EN = Block(accent="“This road is my land.”", accsize=58, backing=0.8)

# price + day counters (rebuilt per frame: the digits change)
_RS = font(SER6, 140); _RO = font(OD7, 150)
def price_block(v):
    s = "₹" + inr(int(v))
    return Block(hero_mask=line_mask(s, 150, latin=SER6, lscale=0.93), color=GOLD, sub="Plot କିଣିଲେ", subsize=56)
def days_block(n, show_label):
    return Block(hero=odia_num(n) + " ଦିନ", size=124, label="THREE MONTHS LATER" if show_label else None)

# ============================================================== end card
def end_card(frame, a):
    if a <= 0: return
    y0 = 300 + (1 - a) * 14
    # soft cream glow
    yy, xx = np.mgrid[0:700, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / 470) ** 2 + ((yy - 330) / 360) ** 2); gl = np.clip(1 - r, 0, 1) ** 1.3 * 0.86 * a
    sl = frame[int(y0) - 30:int(y0) + 670]; n = sl.shape[0]
    sl[...] = sl * (1 - gl[:n, :, None]) + np.array([248, 238, 218], np.float32) * gl[:n, :, None]
    lg = Image.open(LOGO).convert("RGBA").resize((250, 250), Image.LANCZOS); la = np.asarray(lg).astype(np.float32)
    lx, ly = W // 2 - 125, int(y0) + 10; F = frame[ly:ly + 250, lx:lx + 250]; al = la[..., 3:4] / 255 * a
    F[...] = F * (1 - al) + la[..., :3] * al
    ring = Image.new("L", (262, 262), 0); ImageDraw.Draw(ring).ellipse((2, 2, 259, 259), outline=255, width=3)
    ra = np.asarray(ring).astype(np.float32)[..., None] / 255 * a * 0.9; F2 = frame[ly - 6:ly + 256, lx - 6:lx + 256]
    F2[...] = F2 * (1 - ra) + np.array([231, 196, 126], np.float32) * ra
    for blk, by in ((CARD_NAME, int(y0) + 360), (CARD_SUB, int(y0) + 410)):
        blit(frame, blk, W / 2, by, alpha=a)
    pw, ph, py = 236, 66, int(y0) + 452
    pill = Image.new("L", (pw, ph), 0); ImageDraw.Draw(pill).rounded_rectangle((0, 0, pw - 1, ph - 1), radius=33, fill=255)
    pa = np.asarray(pill).astype(np.float32)[..., None] / 255 * a; F3 = frame[py:py + ph, W // 2 - pw // 2:W // 2 + pw // 2]
    F3[...] = F3 * (1 - pa) + np.array([59, 36, 22], np.float32) * pa
    blit(frame, CARD_FOLLOW, W / 2, py + ph / 2, alpha=a)
CARD_NAME = Block(hero="PropertyKatha", size=92, latin=CG6, lscale=1.0, color=(59, 36, 22), dark=True, backing=0)
CARD_SUB = Block(label="ODISHA PROPERTY, EXPLAINED", labcol=(122, 82, 38), labsize=23, dark=True, backing=0)
CARD_FOLLOW = Block(label="FOLLOW", labcol=(240, 217, 160), labsize=26, dark=True, backing=0)

def send_icon(frame, a, cx=540, cy=1236):
    if a <= 0: return
    im = Image.new("L", (90, 90), 0); d = ImageDraw.Draw(im)
    d.line([(26, 70), (26, 48)], fill=255, width=6); d.arc((26, 26, 70, 70), 180, 270, fill=255, width=6)
    d.line([(48, 26), (60, 26)], fill=255, width=6); d.line([(52, 12), (68, 26), (52, 40)], fill=255, width=6, joint="curve")
    m = np.asarray(im.filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)[..., None] / 255 * a
    F = frame[cy - 45:cy + 45, cx - 45:cx + 45]; F[...] = F * (1 - m) + np.array([231, 196, 126], np.float32) * m

# ============================================================== grade (Cycles frames) - per-frame grain
def s2l(x): return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)
def l2s(x): x = np.clip(x, 0, None); return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)
_yy, _xx = np.mgrid[0:H, 0:W].astype(np.float32)
_r = np.sqrt((((_xx - (W - 1) / 2) / (W / 2)) ** 2 + ((_yy - (H - 1) / 2) / (H / 2)) ** 2)) / 1.4142
VIGN = (1.0 - 0.30 * np.clip(_r, 0, 1) ** 2.1)[..., None].astype(np.float32)
CAk = 0.001; _sx = np.clip((_xx - W / 2) * (1 + CAk) + W / 2, 0, W - 1).astype(np.int32); _sy = np.clip((_yy - H / 2) * (1 + CAk) + H / 2, 0, H - 1).astype(np.int32)
_sx2 = np.clip((_xx - W / 2) * (1 - CAk) + W / 2, 0, W - 1).astype(np.int32); _sy2 = np.clip((_yy - H / 2) * (1 - CAk) + H / 2, 0, H - 1).astype(np.int32)
def grade(img, seed):
    a = np.asarray(img.convert("RGB")).astype(np.float32) / 255.0; lin = s2l(a)
    lum = lin @ np.array([0.2126, 0.7152, 0.0722], np.float32); mask = np.clip((lum - 0.72) / 0.28, 0, 1)[..., None] * lin
    acc = np.zeros_like(lin); mi = Image.fromarray((np.clip(l2s(mask), 0, 1) * 255).astype(np.uint8))
    for rad, wt in ((W * 0.004, 0.45), (W * 0.016, 0.33), (W * 0.055, 0.22)):
        acc += s2l(np.asarray(mi.filter(ImageFilter.GaussianBlur(radius=max(1.0, rad)))).astype(np.float32) / 255.0) * wt
    lin = lin + acc * 0.22 * np.array([1.40, 1.13, 0.88], np.float32)
    out = np.clip(l2s(lin), 0, 1)
    out[..., 0] = out[..., 0][_sy, _sx]; out[..., 2] = out[..., 2][_sy2, _sx2]
    out = np.clip((out - 0.5) * 1.2 + 0.5, 0, 1)
    L = out @ np.array([0.2126, 0.7152, 0.0722], np.float32); sh = (1 - L)[..., None]; hi = L[..., None]
    out = out + sh * np.array([-0.012, 0.004, 0.038], np.float32) + hi * np.array([0.07, 0.07 * 0.42, -0.07 * 0.6], np.float32)
    g = (out @ np.array([0.2126, 0.7152, 0.0722], np.float32))[..., None]; out = np.clip(g + (out - g) * 1.1, 0, 1) * VIGN
    rng = np.random.default_rng(seed); n = rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 0.5 + 0.5) * 255).clip(0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR)).astype(np.float32) / 255 - 0.5
    out = np.clip(out + n[..., None] * 0.012 * (0.35 + 0.65 * (1 - out)), 0, 1)
    return out * 255.0

# ============================================================== wet-edge hand-off masks
def _fbm(seed, sc=6):
    r = np.random.default_rng(seed); acc = np.zeros((H, W), np.float32); amp = 1.0
    for o in range(5):
        k = sc * 2 ** o; n = r.random((int(H / W * k) + 2, k + 2)).astype(np.float32)
        acc += amp * (np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)).astype(np.float32) / 255 - 0.5); amp *= 0.5
    return acc
DIST = (np.abs(_xx - W / 2) / (W / 2)) * 0.85 + _fbm(5) * 0.45 + 0.08
def wet(a_img, b_img, p):
    """b replaces a, spreading out from the road (centre column) with an irregular soaked edge and a warm rim."""
    k = p * 1.55 - DIST; m = np.clip(k / 0.10, 0, 1)[..., None]; rim = np.exp(-(k / 0.035) ** 2)[..., None]
    out = a_img * (1 - m) + b_img * m
    return out * (1 - 0.22 * rim) + np.array([214, 160, 70], np.float32) * 0.16 * rim

# ============================================================== projected labels (crane, from Cycles JSON)
LBL = {k: Block(label=t, labcol=c, labsize=24, backing=0.7) for k, t, c in
       (("neighbour", "NEIGHBOUR'S LAND", (240, 180, 158)), ("plot", "YOUR PLOT", (240, 217, 166)), ("gate", "GOVT. ROAD ENDS HERE", (231, 196, 126)))}
def proj_labels(frame, t, pts):
    for key, t0 in (("neighbour", 13.5), ("gate", 15.0), ("plot", 15.4)):
        a = ss(t0, t0 + 0.5, t) * (1 - ss(17.9, 18.5, t))
        if a <= 0 or key not in pts: continue
        x, y, z = pts[key]
        if z <= 0: continue
        px, py = x * W, y * H
        if not (40 < px < W - 40 and 300 < py < 1600): continue
        ly = cl(py - 110, 640, 1440); lx = cl(px, 230, W - 230)
        im = Image.new("L", (W, H), 0); d = ImageDraw.Draw(im)
        d.line([(px, py), (px, ly + 14)], fill=170, width=2); d.ellipse((px - 6, py - 6, px + 6, py + 6), fill=255)
        mm = np.asarray(im).astype(np.float32)[..., None] / 255 * a; col = np.array(LBL[key].rgba[..., :3].max((0, 1)), np.float32)
        frame[...] = frame * (1 - mm) + np.array([240, 217, 166], np.float32) * mm
        blit(frame, LBL[key], lx, ly, alpha=a)

# ============================================================== dust (word of mouth blows away)
_MP = None
def mouth(frame, t):
    global _MP
    if t < 41.15 or t > 42.7: return
    a = ss(41.15, 41.4, t); p = ss(41.75, 42.6, t); cx, by = W / 2, 390
    if p <= 0: blit(frame, MOUTH, cx, by, alpha=a, sweep=ss(41.15, 41.55, t)); return
    if _MP is None:
        r = np.random.default_rng(9); A = MOUTH.rgba[..., 3]; ys, xs = np.nonzero(A > 80)
        x0 = int(round(cx - MOUTH.w / 2)); y0 = int(round(by - MOUTH.base))
        _MP = dict(x=xs + x0, y=ys + y0, c=MOUTH.rgba[ys, xs, :3], a=A[ys, xs] / 255, r=r.random(len(xs)), vx=r.uniform(60, 330, len(xs)),
                   vy=r.uniform(-170, -10, len(xs)))
    P = _MP; q = np.clip(p * 1.35 - P["r"] * 0.35, 0, 1)
    X = (P["x"] + P["vx"] * q * q).astype(np.int32); Y = (P["y"] + P["vy"] * q * q + 6 * np.sin(q * 9 + P["r"] * 6)).astype(np.int32)
    al = (1 - q) * P["a"]; ok = (X >= 0) & (X < W - 1) & (Y >= 0) & (Y < H - 1) & (al > 0.01)
    for dx, dy in ((0, 0), (1, 0), (0, 1)):
        fr = frame[Y[ok] + dy, X[ok] + dx]; frame[Y[ok] + dy, X[ok] + dx] = fr * (1 - al[ok, None]) + P["c"][ok] * al[ok, None]

# ============================================================== per-frame
def load_cyc(f):
    p = os.path.join(CYC, "f_%05d.png" % f)
    return grade(Image.open(p), f) if os.path.exists(p) else None
def load_pap(f): return np.asarray(Image.open(os.path.join(PAP, "f_%05d.png" % f)).convert("RGB")).astype(np.float32)
def pts_for(f):
    p = os.path.join(CYC, "f_%05d.json" % f)
    return json.load(open(p))["pts"] if os.path.exists(p) else {}

def base(f):
    t = f / FPS
    if f < 567: return load_cyc(f)
    if f <= 587:
        c = load_cyc(f); return None if c is None else wet(c, load_pap(f), ss(18.9, 19.57, t))
    if f < 1292: return load_pap(f)
    if f <= 1316:
        c = load_cyc(f); return None if c is None else wet(load_pap(f), c, ss(43.07, 43.87, t))
    return load_cyc(f)

def captions(fr, f):
    t = f / FPS
    # price counter (0.10-2.73: vanishes on "hele")
    if 0.10 <= t < 2.73:
        v = 2000000 * (1 - (1 - ss(0.10, 1.35, t)) ** 3); v = round(v / 1000) * 1000
        a = ss(0.10, 0.35, t) * (1 - ss(2.62, 2.73, t)); blk = price_block(v)
        blit(fr, blk, W / 2, 470, alpha=a, sweep=eo((t - 0.10) / 0.4), dy=14 * (1 - eo((t - 0.1) / 0.5)),
             glint=cl((t - 1.40) / 0.6) if 1.40 < t < 2.0 else -1)
    # day counter (time-lapse)
    if 2.85 <= t < 4.95:
        n = int(round(1 + 89 * ss(2.85, 4.55, t))); a = ss(2.85, 3.05, t) * (1 - ss(4.70, 4.95, t))
        blit(fr, days_block(n, t >= 3.56), W / 2, 450, alpha=a)
    for t0, t1, blk, y, o in CAPS:
        if t < t0 or t > t1: continue
        aout = 1 - ss(t1 - o["dout"], t1, t)
        if o["mode"] == "hard":
            k = eo((t - t0) / 0.12); blit(fr, blk, W / 2, y, alpha=k * aout, scale=1.06 - 0.06 * k)
        elif o["mode"] == "hush":
            k = ss(t0, t0 + o["din"], t); blit(fr, blk, W / 2, y, alpha=k * aout, scale=1.035 - 0.035 * k)
        else:
            k = eo((t - t0) / o["din"]); g = cl((t - t0 - o["din"]) / 0.7) if o["glint"] and t - t0 > o["din"] else -1
            blit(fr, blk, W / 2, y, alpha=min(1, k * 1.4) * aout, sweep=k, dy=12 * (1 - k) - 6 * (1 - aout), glint=g if 0 <= g < 1 else -1)
    # the board's words in English, under the board while it is spoken
    if 9.15 <= t < 10.75:
        P = pts_for(f).get("board")
        if P and P[2] > 0:
            a = ss(9.15, 9.45, t) * (1 - ss(10.5, 10.75, t)); by = cl(P[1] * H + 200, 700, 1440)
            blit(fr, BOARD_EN, cl(P[0] * W, 300, W - 300), by, alpha=a, sweep=eo((t - 9.15) / 0.5))
    if 13.4 <= t < 18.5: proj_labels(fr, t, pts_for(f))
    mouth(fr, t)
    if 50.6 <= t < 55.1: send_icon(fr, ss(50.6, 50.9, t) * (1 - ss(54.7, 55.1, t)))
    end_card(fr, ss(51.72, 52.25, t) * (1 - ss(55.06, 55.45, t)))

F0 = None
def render(f):
    global F0
    out = os.path.join(OUT, "f_%05d.jpg" % f)
    if os.path.exists(out): return f
    fr = base(f)
    if fr is None: return -f - 1
    fr = fr.astype(np.float32).copy(); captions(fr, f)
    if f >= 1659:                                                     # loop: dissolve into frame 0
        if F0 is None:
            b0 = base(0); F0 = b0.astype(np.float32).copy(); captions(F0, 0)
        k = ss(1658.5, 1666.5, f); fr = fr * (1 - k) + F0 * k
    Image.fromarray(np.clip(fr, 0, 255).astype(np.uint8)).save(out, quality=96, subsampling=0)
    return f

def frames(spec):
    o = []
    for p in spec.split(","):
        if "-" in p: a, b = map(int, p.split("-")); o += range(a, b + 1)
        elif p: o.append(int(p))
    return o
if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True); fs = frames(SPEC)
    with Pool(WORKERS) as pool:
        res = pool.map(render, fs, chunksize=4)
    miss = [-r - 1 for r in res if r < 0]
    print("done", len(fs) - len(miss), "missing base", len(miss), (miss[:10] if miss else ""))
