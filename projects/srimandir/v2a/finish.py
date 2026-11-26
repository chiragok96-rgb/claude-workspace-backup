# Upscale the path-traced frames to 1080x1920, draw the captions (key words only, Odia, one gold accent, no bands, adaptive ink),
# the end title, and write JPEG frames for encoding.  Run: $LIB/.venv/bin/python finish.py <in_dir> <out_dir> [first] [last]
import os, sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
IN, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True); FPS = 24
F0 = int(sys.argv[3]) if len(sys.argv) > 3 else 0; F1 = int(sys.argv[4]) if len(sys.argv) > 4 else 99999
FD = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fonts')
def od(sz, w=600): return ImageFont.truetype(os.path.join(FD, f'NotoSansOriya-{min((400, 500, 600, 700), key=lambda k: abs(k - w))}.ttf'), sz, layout_engine=ImageFont.Layout.RAQM)   # Noto Sans Oriya 2.x: correct conjuncts (ନ୍ଦ, ନ୍ତ, ଷ୍ଟ...)
def cg(sz, w=600): f = ImageFont.truetype(os.path.join(FD, 'CormorantGaramond-Italic.ttf'), sz); f.set_variation_by_axes([w]); return f
CAPS = [  # start, end, text (*gold*), place
    (20.55, 22.2, '“*White Pagoda*”', 'top'),
    (46.0, 48.9, 'ନିଆଁ ତଳେ, ସିଝେ *ଉପର ହାଣ୍ଡି*', 'top'),
    (49.4, 53.2, '*୧୮* ଥର ଆକ୍ରମଣ', 'top'),
    (69.4, 71.0, '*ରଥଯାତ୍ରା*', 'top'),
    (71.1, 72.6, '*ବାଇଶି* ପାହାଚ', 'top'),
    (75.4, 79.6, 'ପ୍ରତିଦିନ *ବାନା* ବଦଳ', 'bottom'),
    (80.2, 81.55, '*ଜୟ ଜଗନ୍ନାଥ*', 'bottom'),
]
Y = {'top': 352, 'bottom': 1420}
import numpy as np
# premium labels: the named part is traced in a glowing gold line (from the render's object-index mask) and a name tag hangs above it
LABELS = [  # start, end, mask indices, Odia name, English, extras
    (14.4, 17.0, (1, 8), 'ରେଖା ଦେଉଳ', 'REKHA DEULA', 'height'),
    (28.5, 30.4, (2,), 'ଜଗମୋହନ', 'JAGAMOHANA', ''),
    (35.2, 36.65, (3,), 'ନାଟମଣ୍ଡପ', 'NATAMANDAPA', ''),
    (36.55, 37.9, (4,), 'ଭୋଗମଣ୍ଡପ', 'BHOGAMANDAPA', ''),
    (40.7, 42.6, (5,), 'ରୋଷଘର', 'ROSAGHARA', ''),
    (56.6, 58.3, (7,), 'କୂର୍ମବେଢ଼ା', 'KURMA BEDHA', ''),
    (58.2, 59.9, (6,), 'ମେଘନାଦ ପାଚେରି', 'MEGHANADA PACHERI', ''),
    (66.0, 69.2, (9,), 'ନନ୍ଦିଘୋଷ', 'NANDIGHOSA', ''),
    (72.8, 75.0, (8,), 'ନୀଳଚକ୍ର', 'NILACHAKRA · ASHTADHATU', ''),
]
HALO = (75.3, 84.4, (8,))   # the flag and the wheel glow in the evening light
GOLD = (240, 198, 104)
def cgr(sz): return ImageFont.truetype(os.path.join(FD, 'CormorantGaramond.ttf'), sz)
_mcache = {}
def mask(fi, ids):
    k = (fi, ids)
    if k in _mcache: return _mcache[k]
    p = os.path.join(IN, 'idx', f'f_{fi:05d}.png')
    if not os.path.exists(p): _mcache[k] = None; return None
    a = np.asarray(Image.open(p)); m = np.isin(a, ids)
    _mcache[k] = m; return m
def anchor(fi, ids):
    """the top-centre of the part, smoothed over ±4 frames so the tag glides"""
    pts = []
    for g in range(fi - 4, fi + 5):
        m = mask(g, ids)
        if m is None or m.sum() < 30: continue
        ys, xs = np.nonzero(m); top = np.percentile(ys, 1.5); band = xs[ys <= top + (ys.max() - top) * .08]
        pts.append((float(np.median(band)), float(top), float(np.percentile(ys, 99.5)), float(np.percentile(xs, 99))))
    if not pts: return None
    return tuple(float(np.mean([p[i] for p in pts])) * 1.5 for i in range(4))
def outline(im, m, a, fill=.10, width=4, glow=9):
    M_ = Image.fromarray((m * 255).astype(np.uint8)).resize(im.size, Image.BILINEAR)
    edge = Image.fromarray(np.clip(np.asarray(M_.filter(ImageFilter.MaxFilter(2 * width + 1)), np.int16) - np.asarray(M_, np.int16), 0, 255).astype(np.uint8))
    g = edge.filter(ImageFilter.GaussianBlur(glow)); g = Image.fromarray(np.clip(np.asarray(g, np.float32) * 2.2, 0, 255).astype(np.uint8))
    for lay, k in ((g, .85 * a), (edge, a), (M_, fill * a)):
        col = Image.new('RGBA', im.size, (*GOLD, 0)); col.putalpha(lay.point(lambda v, k=k: int(v * k))); im.alpha_composite(col)
def tag(im, x, y_top, odia, eng, a, rise):
    """a name tag: Odia in gold, English in spaced capitals between hairlines, a leader line down to a diamond on the part"""
    ty = int(min(1440, max(330, y_top - 120))) - int(rise * 14); x = int(min(900, max(180, x)))
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); dl, ds = ImageDraw.Draw(layer), ImageDraw.Draw(sh)
    f1 = od(58, 600); f2 = cgr(25); e = '  '.join(eng); e = ' '.join(eng)
    A = int(255 * a)
    dl.text((x, ty), odia, font=f1, fill=(*GOLD, A), anchor='ms'); ds.text((x, ty + 2), odia, font=f1, fill=(6, 4, 2, int(210 * a)), anchor='ms')
    ew = dl.textlength(e, font=f2); dl.text((x, ty + 40), e, font=f2, fill=(248, 240, 226, A), anchor='ms'); ds.text((x, ty + 42), e, font=f2, fill=(6, 4, 2, int(210 * a)), anchor='ms')
    for sx in (-1, 1):
        x0 = x + sx * (ew / 2 + 14); dl.line((x0, ty + 31, x0 + sx * 46 * a, ty + 31), fill=(*GOLD, int(220 * a)), width=2)
    ay = int(max(ty + 60, y_top)); 
    if ay > ty + 64:
        dl.line((x, ty + 54, x, ty + 54 + (ay - ty - 60) * a), fill=(*GOLD, int(230 * a)), width=2)
        dl.regular_polygon((x, ty + 54 + (ay - ty - 60) * a, 7), 4, fill=(*GOLD, A))
    sh = sh.filter(ImageFilter.GaussianBlur(8)); im.alpha_composite(sh); im.alpha_composite(sh); im.alpha_composite(layer)
def height_line(im, an, a):
    """the measured height beside the tower: a fine gold rule with end ticks, '୨୧୪ ଫୁଟ' at its middle"""
    xc, top, bot, right = an; x = int(min(1020, right + 40)); top = int(max(270, top)); bot = int(min(1460, bot))
    if bot - top < 120: return
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); dl, ds = ImageDraw.Draw(layer), ImageDraw.Draw(sh)
    yb = bot - (bot - top) * a
    dl.line((x, bot, x, yb), fill=(*GOLD, 235), width=2); dl.line((x - 12, bot, x + 12, bot), fill=(*GOLD, 235), width=2)
    if a > .97: dl.line((x - 12, top, x + 12, top), fill=(*GOLD, 235), width=2)
    f = od(40, 600); ym = (top + bot) // 2
    if a > .5:
        al = int(255 * ss((a - .5) / .4)); dl.text((x - 14, ym), '୨୧୪ ଫୁଟ', font=f, fill=(*GOLD, al), anchor='rm'); ds.text((x - 14, ym + 2), '୨୧୪ ଫୁଟ', font=f, fill=(6, 4, 2, int(al * .8)), anchor='rm')
    sh = sh.filter(ImageFilter.GaussianBlur(7)); im.alpha_composite(sh); im.alpha_composite(layer)
def halo(im, m, a):
    M_ = Image.fromarray((m * 255).astype(np.uint8)).resize(im.size, Image.BILINEAR).filter(ImageFilter.MaxFilter(5))
    for r, k in ((70, .22), (26, .16)):
        g = M_.filter(ImageFilter.GaussianBlur(r)); col = Image.new('RGBA', im.size, (255, 214, 140, 0)); col.putalpha(g.point(lambda v, k=k: int(min(255, v * 2.4) * k * a))); im.alpha_composite(col)

def ss(x): x = max(0., min(1., x)); return x * x * (3 - 2 * x)
def parts_of(s):
    """runs of (text, gold, latin): Odia letters go to the Odia font; punctuation and Latin to Cormorant (the Odia font has no · , “ ”)"""
    out = []
    for j, p in enumerate(s.split('*')):
        cur, lat = '', None
        for c in p:
            cl = lat if c == ' ' and lat is not None else not (0x0B00 <= ord(c) <= 0x0B7F)
            if lat is not None and cl != lat: out.append((cur, j % 2 == 1, lat)); cur = ''
            cur += c; lat = cl
        if cur: out.append((cur, j % 2 == 1, lat))
    return out
def draw_line(im, text, cx, base, a, sz=60):
    ps = parts_of(text); fonts = [cg(int(sz * 1.15)) if lat else od(sz) for _, _, lat in ps]
    d0 = ImageDraw.Draw(im); widths = [d0.textlength(p, font=f) for (p, _, _), f in zip(ps, fonts)]; W_ = sum(widths); x0 = cx - W_ / 2
    # what is behind the line decides the ink: bright → dark ink with a light halo; otherwise cream with a dark shadow
    box = (int(max(0, x0 - 20)), int(base - sz * 1.1), int(min(im.width, x0 + W_ + 20)), int(base + sz * .35))
    reg = im.crop(box).convert('L').resize((32, 8)); lum = sum(reg.getdata()) / (32 * 8) / 255
    ink = lum > .74
    col = (34, 26, 18) if ink else (248, 240, 227); gold = (150, 98, 20) if ink else (238, 190, 100); halo = (255, 251, 244) if ink else (8, 5, 3)
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); dl, ds = ImageDraw.Draw(layer), ImageDraw.Draw(sh)
    x = x0
    for (p, g, lat), f, w in zip(ps, fonts, widths):
        dl.text((x, base), p, font=f, fill=(*(gold if g else col), int(255 * a)), anchor='ls'); ds.text((x, base + 2), p, font=f, fill=(*halo, int(200 * a)), anchor='ls'); x += w
    sh = sh.filter(ImageFilter.GaussianBlur(9)); im.alpha_composite(sh); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(3))); im.alpha_composite(layer)
def end_title(im, t):
    a = ss((t - 81.65) / .6); a2 = ss((t - 82.0) / .7); a3 = ss((t - 82.4) / .7)
    if a <= 0: return
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); sh = Image.new('RGBA', im.size, (0, 0, 0, 0)); dl, ds = ImageDraw.Draw(layer), ImageDraw.Draw(sh)
    f1, f2, f3 = od(40, 500), od(124, 700), od(42, 600)
    dl.text((540, 400), 'ଆପଣ ତୋଳିଦେଲେ', font=f1, fill=(236, 214, 170, int(255 * a)), anchor='ms'); ds.text((540, 403), 'ଆପଣ ତୋଳିଦେଲେ', font=f1, fill=(8, 5, 3, int(200 * a)), anchor='ms')
    hw = int(150 * a); dl.rectangle((540 - 190 - hw, 390, 540 - 190, 391), fill=(227, 197, 138, int(220 * a))); dl.rectangle((540 + 190, 390, 540 + 190 + hw, 391), fill=(227, 197, 138, int(220 * a)))
    # the name in gold foil: a vertical gradient through the letters
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).text((540, 560), 'ଶ୍ରୀମନ୍ଦିର', font=f2, fill=int(255 * a2), anchor='ms')
    grad = Image.new('RGBA', im.size); gd = ImageDraw.Draw(grad)
    for y in range(420, 600):
        u = (y - 430) / 150; c = (248, 231, 178) if u < .35 else ((220, 174, 88) if u < .62 else (168, 119, 42)); gd.line((0, y, 1080, y), fill=(*c, 255))
    ds.text((540, 566), 'ଶ୍ରୀମନ୍ଦିର', font=f2, fill=(8, 5, 3, int(210 * a2)), anchor='ms')
    gold = Image.new('RGBA', im.size, (0, 0, 0, 0)); gold.paste(grad, (0, 0), m)
    rw = int(200 * a3); dl.rectangle((540 - 22 - rw, 612, 540 - 22, 613), fill=(227, 197, 138, int(230 * a3))); dl.rectangle((540 + 22, 612, 540 + 22 + rw, 613), fill=(227, 197, 138, int(230 * a3)))
    dl.regular_polygon((540, 613, 8), 4, fill=(227, 197, 138, int(240 * a3)))
    dl.text((540, 680), 'ପୁରୀ', font=f3, fill=(243, 233, 216, int(255 * a3)), anchor='ms'); ds.text((540, 683), 'ପୁରୀ', font=f3, fill=(8, 5, 3, int(200 * a3)), anchor='ms')
    sh = sh.filter(ImageFilter.GaussianBlur(10)); im.alpha_composite(sh); im.alpha_composite(gold); im.alpha_composite(layer)
files = sorted(f for f in os.listdir(IN) if f.startswith('f_') and f.endswith('.png') and '.tmp' not in f)
for fn in files:
    fi = int(fn[2:7])
    if not (F0 <= fi <= F1): continue
    dst = os.path.join(OUT, fn.replace('.png', '.jpg'))
    if os.path.exists(dst): continue
    t = fi / FPS
    im = Image.open(os.path.join(IN, fn)).convert('RGB').resize((1080, 1920), Image.LANCZOS).filter(ImageFilter.UnsharpMask(1.2, 40, 2)).convert('RGBA')
    for t0_, t1_, ids, odn, eng, ex in LABELS:
        k = ss((t - t0_) / .45) * (1 - ss((t - t1_ + .35) / .35))
        if k <= 0: continue
        m = mask(fi, ids)
        if m is None or m.sum() < 30: continue
        outline(im, m, k); an = anchor(fi, ids)
        if an:
            tag(im, an[0], an[1], odn, eng, k, 1 - ss((t - t0_) / .6))
            if ex == 'height': height_line(im, an, ss((t - t0_ - .2) / 1.2) * (1 - ss((t - t1_ + .35) / .35)))
    k = ss((t - HALO[0]) / 1.0)
    if k > 0:
        m = mask(fi, HALO[2])
        if m is not None and m.sum() > 10: halo(im, m, k)
    for a_, b_, txt, pl in CAPS:
        k = ss((t - a_ + .05) / .35) * (1 - ss((t - b_ + .3) / .32))
        if k > 0: draw_line(im, txt, 540, Y[pl] + (1 - ss((t - a_) / .5)) * 10, k)
    end_title(im, t)
    im.convert('RGB').save(dst, quality=95)
print('finished')
