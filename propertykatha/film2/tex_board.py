"""Hand-painted tin board texture: 'ଏ ରାସ୍ତା ମୋ ଜମି' in white enamel on weathered rust-brown tin."""
import sys, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else "tex/board.png"
F = "fonts/noto-serif-oriya-oriya-700-normal.ttf"
W, H = 2048, 820
rng = np.random.default_rng(7)

# base: deep brown enamel with rust blooms and streaks
y, x = np.mgrid[0:H, 0:W] / H
def fbm(sc, oct=5):
    acc = np.zeros((H, W)); amp = 1.0
    for o in range(oct):
        n = rng.random((int(H / H * sc * 2**o) + 2, int(W / H * sc * 2**o) + 2))
        im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
        acc += amp * (np.asarray(im) / 255.0 - 0.5); amp *= 0.5
    return acc
n1 = fbm(6); n2 = fbm(18, 4)
base = np.array([0.24, 0.10, 0.06])
rust = np.array([0.50, 0.22, 0.09])
dark = np.array([0.10, 0.05, 0.03])
m = np.clip((n1 + 0.05) * 1.3, 0, 0.8)[..., None]
img = base * (1 - m) + rust * m
streak = np.clip(fbm(3, 3)[:, :] * 0, 0, 1)
vs = np.asarray(Image.fromarray((rng.random((8, W // 6)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)) / 255.0
img = img * (0.86 + 0.18 * vs[..., None]) + n2[..., None] * 0.06
edge = np.minimum.reduce([x * H / W, 1 - x * H / W, y, 1 - y])
img = img * (1 - 0.35 * np.clip(1 - edge * 22, 0, 1)[..., None]) + dark * 0.0
im = Image.fromarray((np.clip(img, 0, 1) ** (1 / 1.0) * 255).astype(np.uint8))

# white enamel lettering, slightly irregular (brush), with a thin inner border
d = ImageDraw.Draw(im)
d.rectangle([46, 46, W - 46, H - 46], outline=(226, 214, 190), width=10)
font = ImageFont.truetype(F, 225, layout_engine=ImageFont.Layout.RAQM)
txt = "ଏ ରାସ୍ତା ମୋ ଜମି"
bb = d.textbbox((0, 0), txt, font=font, language="or")
tw, th = bb[2] - bb[0], bb[3] - bb[1]
tx, ty = (W - tw) / 2 - bb[0], (H - th) / 2 - bb[1] - 10
layer = Image.new("L", (W, H), 0)
ImageDraw.Draw(layer).text((tx, ty), txt, font=font, fill=255, language="or")
layer = layer.filter(ImageFilter.GaussianBlur(1.2))
wear = (np.clip(fbm(26, 3) * 1.6 + 1.15, 0, 1) * 255).astype(np.uint8)
alpha = (np.asarray(layer) / 255.0) * (np.asarray(Image.fromarray(wear)) / 255.0)
paint = np.array([236, 228, 210], float)
arr = np.asarray(im).astype(float)
arr = arr * (1 - alpha[..., None]) + paint * alpha[..., None]
Image.fromarray(arr.astype(np.uint8)).save(OUT)
print("wrote", OUT)
