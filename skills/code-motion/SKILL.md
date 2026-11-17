---
name: code-motion
description: Create high-end motion graphics, cinematic 3D stills and full videos entirely from code using free/open-source tools (Blender-as-a-module/bpy + Cycles, Three.js in headless Chromium, Remotion, Motion Canvas, Manim, GSAP, FFmpeg). Use when asked to generate animations, motion graphics, explainer videos, title sequences, data-driven video, cinematic renders, or "make a video with code". Includes an engine-selection matrix, a fast procedural geometry library, a measured sun/sky rig, a cinematic post-grade, and a kill-and-discard iteration loop.
---

# Code Motion — cinematic video and motion graphics from code

Build visuals **entirely in code**, with **free tools only**, to a standard that
survives being shown on a big screen. Favour: correct light, deliberate
composition, atmospheric depth, and a real post-grade.

---

## 0. The non-negotiable loop: kill and discard

Never polish a bad frame. Judge, discard, rebuild better.

1. **Stage small.** Render at 1/4 resolution, 20–40 samples. Target **under 20s
   per look**. If an iteration costs minutes you will stop iterating, and the
   work will be bad.
2. **Look at it.** Actually view the image. Do not infer quality from the fact
   that the code ran.
3. **Name the failure out loud** — "sky is dead", "no shadows", "subject reads
   as a silhouette", "sea is absent". One sentence per defect.
4. **Discard and rebuild** the offending subsystem. Do not patch a fundamentally
   wrong approach — replace it. (A volumetric cloud box that shows a hard edge is
   not tuned into a good sky; it is *replaced* by world-shader clouds.)
5. **Sweep, don't guess.** When ≥2 continuous parameters interact (sun azimuth ×
   elevation × exposure), render a grid and compare side by side. See
   `scripts/sweep.py`.
6. Only when the small render is genuinely good: render final, then grade.

A build that takes 90s to assemble is a broken loop. Fix the build first
(see "Build speed" below), then iterate on looks.

---

## 1. Pick the engine

| Need | Engine | Why |
|---|---|---|
| Cinematic 3D, real light transport, hero stills, product/epic shots | **Blender + `bpy` + Cycles** | Path tracing, physical sky, volumetrics, DOF. The reference look for "3D cartoon short" content. |
| 3D that must run in a browser, or 1000s of frames on CPU | **Three.js + headless Chromium** | Real-time; WebGL2 works headless via SwiftShader with no GPU. |
| 2D motion design, kinetic type, UI/product animation, data video | **Remotion** (React) or **Motion Canvas** | Declarative timelines, deterministic frame output, great typography. |
| Maths / algorithm / diagram explainers | **Manim** | Purpose-built scene graph + transforms for didactic animation. |
| Web animation inside an HTML artifact | **GSAP / Anime.js / Web Animations API** | No build step; sequence and ease with precision. |
| Vector icon animation shipped to apps | **Lottie** (export from code-generated JSON) | Tiny, resolution-independent. |
| Shader art, generative/abstract backgrounds | **GLSL / WebGPU / p5.js** | Per-pixel control, cheap at any resolution. |
| Any edit, encode, concat, overlay, speed-ramp | **FFmpeg** | Always the final mile. |

**Install reality check.** `download.blender.org` is often blocked by egress
proxies. `pip install bpy` works — it ships Blender as a Python module
(`python3 -c "import bpy"`), and gives you full Cycles headless. Prefer it.

Verify headless WebGL before committing to Three.js:
```bash
node -e "const{chromium}=require('playwright');(async()=>{const b=await chromium.launch({args:['--no-sandbox','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});const p=await b.newPage();console.log(await p.evaluate(()=>{const g=document.createElement('canvas').getContext('webgl2');return g?g.getParameter(g.VERSION):'NO WEBGL'}));await b.close()})()"
```

---

## 2. The Blender/bpy path

Use `scripts/bl_lib.py`. It exists because the obvious code is wrong or slow.

```python
import sys; sys.path.insert(0, "<skill>/scripts")
import bl_lib as B
from math import radians as R

B.reset()
gold = B.mat("gold", (0.80,0.56,0.12), rough=0.25, metal=1.0)
B.lathe([(4.5,0),(3.1,4),(1.4,7),(0.3,9)], 56, "dome", m=gold)

w, nt, sky, bg = B.world_sky(sun_rotation=334, elev=4.5,
                             sun_intensity=2.2, aerosol=1.6, ambient=0.14)
B.sky_clouds(nt, sky, bg, sun_rotation=334, elev=4.5, cover=0.50)
B.sun_rig(sun_rotation=334, elev=4.5, energy=13)

B.camera((14,-41,5.0), (-9,26,11.5), lens=30, fstop=2.8)
B.render("out.png", 1080, 1920, samples=180, exposure=0.3)
```

### Build speed — the thing that decides whether you iterate
`bpy.ops.*` walks the whole scene on every call. Building ~5 000 objects with
`bpy.ops.mesh.primitive_*` + `bpy.ops.object.join()` took **85 s**; the
`bmesh` + data-API equivalents in `bl_lib` take **~1.5 s**. Rules:

- Build geometry with `bmesh.ops.*`, never `bpy.ops.mesh.primitive_*`.
- Create objects with `bpy.data.objects.new()` + `collection.objects.link()`.
- Do every `merge()` **before** you spawn thousands of instances.
- Crowds/forests/particles: one mesh datablock + many linked duplicates
  (`B.instance`). Cycles instances them — 11 000 figures costs almost nothing.

### Lighting — the difference between "3D render" and "cinema"
1. **Split the sky's two jobs.** A physical sky bright enough to look right to
   the camera is far too bright as a light source; everything flattens to
   pastel. `world_sky()` drives Background *Strength* from a Light Path
   `Is Camera Ray`: full to the camera, `ambient≈0.05–0.15` to everything else.
   This single change is the difference between washed-out and rich.
2. **Three lights, always.** Warm key sun + cool sky fill + **warm ground
   bounce**. Without the bounce, a backlit subject is a black silhouette.
3. **Shoot into the sun** for epic exteriors — glowing sky, rim-lit subjects,
   long shadows toward camera, specular glitter on water. Keep the sun
   ~10–20° off the view axis so it lights the frame without blowing the centre.
4. **Practicals sell focal points.** A small warm point light inside a
   structure (shrine, window, cockpit) with `use_shadow=False` lifts the
   subject out of its own shadow. Highest drama-per-line-of-code available.
5. **Atmosphere = depth.** Aerial haze separates planes. Prefer cheap methods
   (sky gradient + grade) over volumetrics, which cost ~10× render time.

### The sun/sky azimuth trap
The Sky texture's `sun_rotation` and a Sun lamp's euler use **different**
conventions. Get it wrong and the sky glow and the shadows point opposite ways —
which reads as "flat lighting", not as a bug, so it is easy to chase for hours.

Measured in Blender 5.3 with an equirectangular probe:
- sky azimuth = `sun_rotation − 8°`, swept **from +Y toward +X**
- matching lamp euler = `(90° − elev, 0, 188° − sun_rotation)`

`B.sun_rig()` and `B.sky_sun_vector()` encode this. **Re-probe on a new Blender
version** before trusting it (`references/gotchas.md` has the probe script).

### Composition for 9:16
- Vertical sensor fit (`sensor_fit='VERTICAL'`), lens 28–35 for epic scale.
- Horizontal FOV is *narrow* in portrait — roughly half the vertical. Objects
  spread sideways leave frame fast. Lay subjects along the view axis, and
  verify with a dot product before rendering:
  `cos θ = normalize(subject − camera) · view_dir`; keep θ < half-FOV.
- Layer foreground (dark, soft, out of focus) / midground (hero, lit) /
  background (hazy). An image without a foreground layer reads flat.
- Low camera + upward target = monumentality. Keep the horizon off centre.

---

## 3. Post-grade — the last 20%

Never ship the raw render. `scripts/grade.py` applies, in linear light where it
matters: multi-scale **bloom**, warm **halation**, **chromatic aberration**,
filmic **contrast**, **split-toning** (cool shadows / warm highlights),
**vignette**, and **grain**.

```bash
python3 scripts/grade.py in.png out.png bloom=0.26 halo=0.45 vig=0.24 \
        contrast=0.14 sat=1.10 warm=0.055 grain=0.014
```

Engine-agnostic — use it on Three.js, Manim or Remotion frames too. For video,
grade the frame sequence before encoding, or replicate the curve in FFmpeg.

---

## 4. Video

Render a frame sequence, grade, then encode. Never trust an engine's built-in
muxer for final delivery.

```bash
# frames -> graded frames
for f in frames/*.png; do python3 scripts/grade.py "$f" "graded/$(basename $f)"; done

# high-quality 9:16 master
ffmpeg -framerate 30 -i graded/f%05d.png -c:v libx264 -crf 16 \
       -pix_fmt yuv420p -vf "scale=1080:1920:flags=lanczos" out.mp4
```

More recipes (motion blur, speed ramps, overlays, social presets) in
`references/ffmpeg.md`.

**Cost control.** CPU path tracing is viable for stills, not for 1 800 frames.
For animation either drop to Three.js/EEVEE, cut samples hard and lean on the
denoiser, or render a short loop and ramp it in FFmpeg.

---

## 5. Checklist before calling a frame done

- [ ] Is there a clear **key light** with visible, directional shadows?
- [ ] Is there a **foreground / midground / background** separation?
- [ ] Does the **sky or background** carry information, or is it dead space?
- [ ] Does the **subject read** in silhouette at thumbnail size?
- [ ] Is there **atmospheric depth** (distant things lighter/hazier)?
- [ ] Has it been **graded** (bloom, vignette, split-tone, grain)?
- [ ] At 1/8 size, is the **composition** still legible?

If any answer is no — discard and rebuild that element.

---

## Files
- `scripts/bl_lib.py` — fast procedural geometry, material-safe merge, instancing, measured sun/sky rig, world-shader clouds, camera/render helpers
- `scripts/grade.py` — engine-agnostic cinematic post-grade
- `scripts/sweep.py` — parameter-sweep contact sheets for the kill-and-discard loop
- `references/gotchas.md` — version-specific API traps and the sky probe
- `references/ffmpeg.md` — encoding and edit recipes
