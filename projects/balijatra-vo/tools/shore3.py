"""The opening world, v3: Kalinga shore at dawn, painted as light (not as flat shapes). 1080x2700, same layout as shore2
(horizon 1630, sun (700, 1520), the stone stands at (365..495, 2284..2560)), so the film's camera maths is unchanged.
Silhouettes against the sun: a rekha deul and its jagamohana on a headland, palms; the sea's sun path; wet sand; the stone's shadow.
The film animates over it: glitter on the sun path, the foam, the boitas at sea, the lamp-boats (Boita Bandana), the scent of cloves."""
import os, numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import zoom, gaussian_filter, map_coordinates
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plates')
W, H, HZ, SUN = 1080, 2700, 1630, (700, 1522)
rng = np.random.default_rng(5)
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)
def ss(a, b, x): x = np.clip((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x)
def fbm(h, w, base, oct=5, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); amp, tot = 1., 0.
    for o in range(oct):
        gh, gw = max(2, int(h / base * 2 ** o) + 2), max(2, int(w / base * 2 ** o) + 2)
        g = r.random((gh, gw)).astype(np.float32); z = zoom(g, (h / (gh - 1) + .01, w / (gw - 1) + .01), order=3)[:h, :w]
        out += amp * z; tot += amp; amp *= .5
    return out / tot
def ramp(t, stops):
    t = np.clip(t, 0, 1); out = np.zeros(t.shape + (3,), np.float32)
    for (a, ca), (b, cb) in zip(stops[:-1], stops[1:]):
        m = (t >= a) & (t <= b); f = ((t[m] - a) / (b - a))[:, None]; out[m] = np.array(ca) * (1 - f) + np.array(cb) * f
    return out
def mask_poly(pts, blur=0):
    im = Image.new('L', (W, H), 0); ImageDraw.Draw(im).polygon([tuple(map(float, p)) for p in pts], fill=255)
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im, np.float32) / 255
def over(img, m, col): m = m[..., None]; return img * (1 - m) + np.array(col, np.float32) * m if np.ndim(col) == 1 else img * (1 - m) + col * m

img = np.zeros((H, W, 3), np.float32)
dsun = np.sqrt((XX - SUN[0]) ** 2 + ((YY - SUN[1]) * 1.15) ** 2)
# —— sky ——
sky = ramp(YY / HZ, [(0, (.17, .085, .075)), (.3, (.36, .16, .12)), (.58, (.66, .30, .18)), (.8, (.9, .52, .28)), (.93, (.99, .72, .42)), (1, (1, .84, .6))])
sky += (np.exp(-(dsun / 330) ** 2) * .55)[..., None] * np.array([1, .72, .42]) + (np.exp(-(dsun / 900) ** 2) * .22)[..., None] * np.array([1, .6, .32])
ang = np.arctan2(YY - SUN[1], XX - SUN[0]); rays = zoom(rng.random(181).astype(np.float32), 2000 / 181, order=3)[:2000]
ri = ((ang + np.pi) / (2 * np.pi) * 1999).astype(int).clip(0, 1999); rays = gaussian_filter(rays, 6); sky += ((rays[ri] - rays.mean()) * .32 * np.exp(-dsun / 600) * (YY < HZ))[..., None] * np.array([1, .8, .5])
# clouds: long lit streaks, gold undersides near the sun, ember-dark above
cf = fbm(H, W // 7, 26, 6, 2); cf2 = zoom(cf, (1, W / (W // 7)), order=1)[:H, :W]; cf2 = map_coordinates(cf2, [YY + 40 * np.sin(XX / 300), XX], order=1, mode='mirror')
band = ss(200, 420, YY) * (1 - ss(1420, 1590, YY)); dens = ss(.52, .68, cf2) * band
under = np.clip(gaussian_filter(dens, 6) - np.roll(gaussian_filter(dens, 6), 14, 0), 0, 1) * 4
lit = np.clip(np.exp(-dsun / 700) * 1.2, 0, 1)
ccol = ramp(lit, [(0, (.28, .13, .11)), (.5, (.62, .3, .2)), (1, (1, .7, .42))]) + (np.clip(under, 0, 1) * lit)[..., None] * np.array([.6, .38, .18])
sky = over(sky, dens * .9, ccol)
img = sky.copy()
# —— the sun ——
img += (np.exp(-(dsun / 52) ** 6) * 1.0)[..., None] * (np.array([1, .97, .86]) - img) + (np.exp(-(dsun / 110) ** 2) * .5)[..., None] * np.array([1, .8, .5])
# —— far isles (the distant lands the scent comes from), hazy ——
for (x0, x1, hh_, sd) in [(-20, 330, 44, 3), (420, 520, 24, 4), (830, 1060, 50, 5)]:
    xs = np.arange(W); prof = np.clip(np.sin(np.clip((xs - x0) / (x1 - x0), 0, 1) * np.pi), 0, 1) ** .7 * hh_ * (1 + .25 * (fbm(1, W, 40, 3, sd)[0] - .5))
    m = ((YY > HZ - prof[None, :]) & (YY <= HZ + 1)).astype(np.float32); m = gaussian_filter(m, 1.2)
    img = over(img, m * .85, np.array([.62, .34, .23]) + np.exp(-(dsun / 400) ** 2)[..., None] * .2)
# —— the sea ——
k = np.clip((YY - HZ) / (2140 - HZ), 0, 1); sea_m = (YY >= HZ) & (YY < 2150)
sea = ramp(k, [(0, (.96, .66, .4)), (.12, (.8, .45, .27)), (.5, (.5, .25, .16)), (1, (.3, .14, .1))])
wn = zoom(fbm(700, 600, 7, 6, 7), (1, 4), order=1); wy = (np.log1p(np.maximum(YY - HZ, 0) / 3) * 132).clip(0, 699); wx = (XX - 540) * (.4 + 1.5 * k) + 1200
wave = map_coordinates(wn, [wy, wx % 2400], order=1, mode='wrap')
sea *= (1 + (wave - .5) * .5)[..., None]
colw = 30 + 300 * k; path = np.exp(-((XX - SUN[0]) / colw) ** 2) * (1 - .5 * k)
glint = ss(.6, .74, wave) * path; sea += (glint * 1.2 + path * .18)[..., None] * np.array([1, .82, .55])
img = np.where(sea_m[..., None], sea, img)
img = over(img, gaussian_filter(((YY >= HZ - 1) & (YY <= HZ + 1)).astype(np.float32), .8) * .5, (1, .86, .62))   # the bright horizon line
# —— the headland, the deul (rekha) and its jagamohana (pidha), palms: silhouettes against the dawn ——
land = [(-10, HZ - 22), (60, HZ - 34), (170, HZ - 40), (290, HZ - 26), (380, HZ - 6), (430, HZ + 14), (-10, HZ + 30)]
dark = np.array([.11, .055, .045]); haze = np.array([.34, .16, .12])
img = over(img, mask_poly(land, 1), haze * .8 + dark * .2)
def rekha(cx, by, hgt, w):
    pts = []
    for i in range(41):
        u = i / 40; y = by - hgt * u; half = w / 2 * (1 - .58 * u ** 2.4) * (1 - .035 * np.sin(u * 52) ** 2); pts.append((cx - half, y))
    top = by - hgt; R = [(cx + w / 2 * (1 - .58 * (i / 40) ** 2.4) * (1 - .035 * np.sin(i / 40 * 52) ** 2), by - hgt * i / 40) for i in range(40, -1, -1)]
    amal = [(cx - w * .2, top + 4), (cx - w * .19, top - 4), (cx - w * .32, top - 10), (cx - w * .34, top - 20), (cx - w * .3, top - 28), (cx + w * .3, top - 28), (cx + w * .34, top - 20), (cx + w * .32, top - 10), (cx + w * .19, top - 4), (cx + w * .2, top + 4)]
    kal = [(cx - 8, top - 28), (cx - 14, top - 40), (cx - 6, top - 52), (cx - 2, top - 84), (cx + 2, top - 84), (cx + 6, top - 52), (cx + 14, top - 40), (cx + 8, top - 28)]
    return [pts + R, amal, kal]
def pidha(cx, by, hgt, w):
    pts = [(cx - w / 2, by)]; n = 6
    for i in range(n): y0 = by - hgt * .8 * i / n; y1 = by - hgt * .8 * (i + 1) / n; ww = w / 2 * (1 - .75 * i / n); pts += [(cx - ww, y0 - 4), (cx - ww * .86, y1)]
    pts += [(cx - w * .12, by - hgt * .82), (cx - w * .09, by - hgt), (cx + w * .09, by - hgt), (cx + w * .12, by - hgt * .82)]
    for i in range(n - 1, -1, -1): y0 = by - hgt * .8 * i / n; y1 = by - hgt * .8 * (i + 1) / n; ww = w / 2 * (1 - .75 * i / n); pts += [(cx + ww * .86, y1), (cx + ww, y0 - 4)]
    return pts + [(cx + w / 2, by)]
dcol = haze * .55 + dark * .45
for p in rekha(150, HZ - 30, 280, 150): img = over(img, mask_poly(p, .8), dcol)
img = over(img, mask_poly(pidha(262, HZ - 26, 150, 120), .8), dcol)
img = over(img, mask_poly([(98, HZ - 28), (330, HZ - 28), (330, HZ - 18), (98, HZ - 18)], .5), dcol)
def palm(img, bx, by, tx, ty, fronds, lw, col, blur=.8):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im)
    pts = [(bx + (tx - bx) * u + 30 * np.sin(u * 2.6) * (1 - u), by + (ty - by) * u) for u in np.linspace(0, 1, 30)]
    for i in range(len(pts) - 1): d.line([pts[i], pts[i + 1]], fill=255, width=int(lw * (1 - .45 * i / 30)))
    for a, L in fronds:
        q = [(tx + np.cos(a) * L * u, ty + np.sin(a) * L * u + 110 * u * u * L / 300) for u in np.linspace(0, 1, 24)]
        for i in range(23): d.line([q[i], q[i + 1]], fill=255, width=max(2, int(lw * .4 * (1 - i / 23))))
        for i in range(1, 23):   # dense leaflets hanging from the rib
            x, y = q[i]; u = i / 23; dl = L * .34 * np.sin(np.pi * (.15 + .85 * u)) * (1 - .35 * u)
            dx, dy = q[i + 1][0] - x, q[i + 1][1] - y; n = np.hypot(dx, dy) + 1e-6; dx, dy = dx / n, dy / n
            for sgn in (-1, 1):
                ex, ey = x + (dx * .5 + -dy * sgn * .55) * dl, y + (dy * .5 + dx * sgn * .55) * dl + dl * .55
                d.polygon([(x, y), (x + dx * 6, y + dy * 6), (ex, ey)], fill=255)
    m = np.asarray(im.filter(ImageFilter.GaussianBlur(blur)), np.float32) / 255
    return over(img, m, col)
img = palm(img, 60, HZ - 30, 20, HZ - 250, [(-2.6, 150), (-2.1, 170), (-1.5, 140), (-.9, 160), (-.3, 150), (.3, 120), (2.8, 120)], 9, dcol)
img = palm(img, 330, HZ - 24, 352, HZ - 200, [(-2.7, 120), (-2.0, 130), (-1.2, 110), (-.5, 130), (.2, 110), (2.9, 100)], 7, dcol)
# —— the shore: foam line, wet sand that mirrors the sky, dry sand with wind ripples ——
sy = 2150 + 10 * np.sin(XX[0] / 90) + 6 * np.sin(XX[0] / 37 + 1)
wet_m = (YY >= sy[None, :]) & (YY < 2236)
refl = ramp(np.clip((YY - 2150) / 90, 0, 1), [(0, (.62, .36, .24)), (1, (.66, .44, .3))]) + (np.exp(-((XX - SUN[0]) / 90) ** 2) * .45)[..., None] * np.array([1, .78, .48])
sand_f = fbm(H, W, 200, 6, 9); grain = rng.random((H, W)).astype(np.float32)
dry = ramp(np.clip((YY - 2200) / 500, 0, 1), [(0, (.82, .6, .42)), (1, (.6, .4, .27))])
rip = np.sin((YY + 40 * np.sin(XX / 160) + 260 * sand_f + 30 * np.sin(XX / 47 + YY / 90)) / 9.5) * .5 + .5
dry *= (1 + (rip - .5) * .07 + (sand_f - .5) * .18 + (grain - .5) * .06)[..., None]
dry += (np.exp(-((XX - SUN[0]) / 420) ** 2) * np.exp(-(YY - 2200) / 260) * .12)[..., None] * np.array([1, .7, .4])
land_m = YY >= sy[None, :]
img = np.where(land_m[..., None], dry, img); img = np.where(wet_m[..., None], refl * (1 + (grain[..., None] - .5) * .03), img)
blend = ss(2210, 2250, YY)[..., None]; img = np.where((YY >= 2210)[..., None] & land_m[..., None], refl * (1 - blend) + dry * blend, img)
foam = np.exp(-((YY - sy[None, :] + 2) / 3.2) ** 2) * (.6 + .4 * fbm(H, W, 30, 3, 11)); img = over(img, np.clip(foam, 0, 1) * .8, (1, .93, .82))
foam2 = np.exp(-((YY - sy[None, :] - 34 - 6 * np.sin(XX / 55)) / 2.2) ** 2) * fbm(H, W, 24, 3, 12); img = over(img, np.clip(foam2 * 1.2 - .25, 0, 1) * .5, (1, .9, .78))
# the stone's contact shadow and the long shadow the low sun throws towards us
sh = np.exp(-(((XX - 430) / 90) ** 2 + ((YY - 2562) / 14) ** 2)) * .55
lsx, lsy = XX - (430 - (YY - 2560) * .62), (YY - 2560)
sh += np.exp(-(lsx / 52) ** 2) * (lsy > 0) * np.exp(-lsy / 260) * .4
img *= (1 - np.clip(sh, 0, .7)[..., None] * np.array([.55, .62, .7]))
# —— the foreground palm at the right edge, almost black, a thin gold rim ——
img = palm(img, 1060, 2700, 960, 880, [(-2.9, 260), (-2.4, 300), (-1.9, 250), (-1.2, 200), (-.4, 190), (.3, 170), (2.6, 200)], 30, np.array([.07, .035, .03]), 1.2)
vig = 1 - .28 * (((XX - 540) / 760) ** 2 + ((YY - 1800) / 1500) ** 2); img *= np.clip(vig, .6, 1)[..., None]
img += (rng.standard_normal((H, W, 1)).astype(np.float32) * .012)
Image.fromarray((np.clip(img, 0, 1) ** (1 / 1.05) * 255).astype(np.uint8)).save(os.path.join(OUT, 'shore3.png')); print('saved shore3')
