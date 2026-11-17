#!/usr/bin/env python3
"""Cinematic post-grade: bloom, halation, split-tone, vignette, CA, grain.
Engine-agnostic - works on any RGB frame (Blender, Three.js, Manim ...)."""
import sys, numpy as np
from PIL import Image, ImageFilter

def arg(k, d):
    for a in sys.argv[1:]:
        if a.startswith(k+"="): return a.split("=",1)[1]
    return d

SRC   = sys.argv[1]
DST   = sys.argv[2]
BLOOM = float(arg("bloom", 0.26))
BTHR  = float(arg("bthr",  0.72))
HALO  = float(arg("halo",  0.45))
VIG   = float(arg("vig",   0.30))
CONTR = float(arg("contrast", 0.14))
SAT   = float(arg("sat",   1.10))
WARM  = float(arg("warm",  0.055))
GRAIN = float(arg("grain", 0.014))
CA    = float(arg("ca",    0.0012))

def s2l(x): return np.where(x <= 0.04045, x/12.92, ((x+0.055)/1.055)**2.4)
def l2s(x):
    x = np.clip(x, 0, None)
    return np.where(x <= 0.0031308, x*12.92, 1.055*np.power(x, 1/2.4) - 0.055)

im = Image.open(SRC).convert("RGB")
W, H = im.size
a = np.asarray(im).astype(np.float32)/255.0
lin = s2l(a)

# ---------- bloom + halation (multi-scale, done in linear light) -------------
lum  = lin @ np.array([0.2126, 0.7152, 0.0722], np.float32)
mask = np.clip((lum - BTHR)/max(1e-5, 1.0-BTHR), 0, 1)[..., None] * lin
acc  = np.zeros_like(lin)
for rad, wt in ((W*0.004, 0.45), (W*0.016, 0.33), (W*0.055, 0.22)):
    mi = Image.fromarray((np.clip(l2s(mask), 0, 1)*255).astype(np.uint8))
    b  = mi.filter(ImageFilter.GaussianBlur(radius=max(1.0, rad)))
    acc += s2l(np.asarray(b).astype(np.float32)/255.0) * wt
# halation: bias the glow warm (red/orange), like light scattering in emulsion
tint = np.array([1.0 + HALO, 1.0 + HALO*0.33, 1.0 - HALO*0.30], np.float32)
lin  = lin + acc * BLOOM * tint

out = np.clip(l2s(lin), 0, 1)

# ---------- chromatic aberration -------------------------------------------
if CA > 0:
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    cx, cy = (W-1)/2.0, (H-1)/2.0
    def scale_ch(ch, k):
        sx = np.clip((xx-cx)*(1.0+k)+cx, 0, W-1)
        sy = np.clip((yy-cy)*(1.0+k)+cy, 0, H-1)
        return ch[sy.astype(np.int32), sx.astype(np.int32)]
    out[...,0] = scale_ch(out[...,0],  CA)
    out[...,2] = scale_ch(out[...,2], -CA)

# ---------- filmic contrast + split tone ------------------------------------
out = np.clip((out - 0.5)*(1.0 + CONTR) + 0.5, 0, 1)
L = out @ np.array([0.2126, 0.7152, 0.0722], np.float32)
sh = (1.0 - L)[..., None]; hi = L[..., None]
out = out + sh*np.array([-0.012, 0.004, 0.038], np.float32) \
          + hi*np.array([ WARM,  WARM*0.42, -WARM*0.60], np.float32)
g = (out @ np.array([0.2126,0.7152,0.0722], np.float32))[..., None]
out = np.clip(g + (out-g)*SAT, 0, 1)

# ---------- vignette --------------------------------------------------------
if VIG > 0:
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    nx = (xx-(W-1)/2)/(W/2); ny = (yy-(H-1)/2)/(H/2)
    r  = np.sqrt(nx*nx + ny*ny)/1.4142
    out *= (1.0 - VIG*np.clip(r, 0, 1)**2.1)[..., None]

# ---------- grain -----------------------------------------------------------
if GRAIN > 0:
    rng = np.random.default_rng(3)
    n = rng.normal(0, 1, (H, W, 1)).astype(np.float32)
    n = np.asarray(Image.fromarray(((n[...,0]*0.5+0.5)*255).clip(0,255).astype(np.uint8))
                   .filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32)/255.0
    n = (n-0.5)[..., None]
    out = np.clip(out + n*GRAIN*(0.35+0.65*(1.0-out)), 0, 1)

Image.fromarray((out*255+0.5).astype(np.uint8)).save(DST, quality=96)
print("graded ->", DST)
