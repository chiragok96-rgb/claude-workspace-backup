#!/usr/bin/env python3
"""Parameter-sweep contact sheets - the engine of the kill-and-discard loop.

Renders every combination of the varied parameters at low resolution and tiles
them into one image so looks can be compared side by side instead of guessed at.

    python3 sweep.py --cmd "python3 build.py out={out}" \
                     --vary sunrot=296,326,356 --vary exp=-0.4,0.1 \
                     --out sweep.png --tile 6

{out} in --cmd is replaced with each variant's output path; every varied
parameter is appended as key=value (matching the common `arg()` convention).
"""
import argparse, itertools, os, subprocess, sys, tempfile, shutil

ap = argparse.ArgumentParser()
ap.add_argument("--cmd", required=True, help="render command containing {out}")
ap.add_argument("--vary", action="append", default=[], help="key=v1,v2,v3")
ap.add_argument("--out", default="sweep.png")
ap.add_argument("--tile", type=int, default=6)
ap.add_argument("--width", type=int, default=1300, help="final sheet width")
ap.add_argument("--label", action="store_true", help="annotate each tile")
a = ap.parse_args()

keys, valsets = [], []
for v in a.vary:
    k, vs = v.split("=", 1)
    keys.append(k); valsets.append(vs.split(","))

tmp = tempfile.mkdtemp(prefix="sweep_")
tiles = []
combos = list(itertools.product(*valsets)) if valsets else [()]
for i, combo in enumerate(combos):
    out = os.path.join(tmp, f"t{i:03d}.png")
    cmd = a.cmd.format(out=out)
    for k, v in zip(keys, combo):
        cmd += f" {k}={v}"
    print(f"[{i+1}/{len(combos)}] " + " ".join(f"{k}={v}" for k, v in zip(keys, combo)), flush=True)
    r = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if not os.path.exists(out):
        print("  FAILED:", (r.stderr or r.stdout)[-400:]); continue
    if a.label:
        lbl = " ".join(f"{k}={v}" for k, v in zip(keys, combo))
        subprocess.run(["convert", out, "-gravity", "south", "-background", "#000000A0",
                        "-fill", "white", "-pointsize", "22",
                        "-annotate", "+0+4", lbl, out], check=False)
    tiles.append(out)

if not tiles:
    sys.exit("no tiles rendered")
# resize AFTER montage - montage -resize applies per tile and explodes the file
p1 = subprocess.Popen(["montage", *tiles, "-tile", f"{a.tile}x", "-geometry", "+3+3",
                       "-background", "#222222", "miff:-"], stdout=subprocess.PIPE)
subprocess.run(["convert", "-", "-resize", f"{a.width}x", a.out], stdin=p1.stdout, check=True)
p1.wait()
shutil.rmtree(tmp, ignore_errors=True)
print("sheet ->", a.out)
