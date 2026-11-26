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
    (14.4, 17.0, 'ରେଖା ଦେଉଳ · *୨୧୪ ଫୁଟ*', 'bottom'),
    (20.55, 22.2, '“*White Pagoda*”', 'top'),
    (28.5, 30.4, '*ଜଗମୋହନ*', 'top'),
    (35.2, 37.8, 'ନାଟମଣ୍ଡପ *·* ଭୋଗମଣ୍ଡପ', 'top'),
    (40.7, 42.6, '*ରୋଷଘର*', 'top'),
    (46.0, 48.9, 'ନିଆଁ ତଳେ, ସିଝେ *ଉପର ହାଣ୍ଡି*', 'top'),
    (49.4, 53.2, '*୧୮* ଥର ଆକ୍ରମଣ', 'top'),
    (56.6, 59.8, 'କୂର୍ମବେଢ଼ା *·* ମେଘନାଦ ପାଚେରି', 'top'),
    (69.4, 71.0, '*ରଥଯାତ୍ରା*', 'top'),
    (71.1, 72.6, '*ବାଇଶି* ପାହାଚ', 'top'),
    (72.8, 75.0, 'ଅଷ୍ଟଧାତୁର *ନୀଳଚକ୍ର*', 'bottom'),
    (75.4, 79.6, 'ପ୍ରତିଦିନ *ବାନା* ବଦଳ', 'bottom'),
    (80.2, 81.55, '*ଜୟ ଜଗନ୍ନାଥ*', 'bottom'),
]
Y = {'top': 352, 'bottom': 1420}
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
    for a_, b_, txt, pl in CAPS:
        k = ss((t - a_ + .05) / .35) * (1 - ss((t - b_ + .3) / .32))
        if k > 0: draw_line(im, txt, 540, Y[pl] + (1 - ss((t - a_) / .5)) * 10, k)
    end_title(im, t)
    im.convert('RGB').save(dst, quality=95)
print('finished')
