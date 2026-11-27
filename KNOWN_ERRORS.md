# KNOWN_ERRORS.md — recurring technical problems and verified solutions
_Read before rendering, before any error handling, or when something fails._

## Blender / bpy

| Symptom | Cause | Verified fix |
|---|---|---|
| `bpyenv` missing even after bootstrap | Fresh container; setup script didn't run | `uv venv --python 3.11 /home/user/bpyenv && uv pip install bpy==5.0.1 numpy` |
| `RESUME.md says seg.py builds scene.blend` | Documentation error — `seg.py` is the VO audio phrase segmenter | Use `build.py` to build the scene: `/home/user/bpyenv/bin/python build.py` |
| `/home/user/srimandir/` missing | Fresh container; files not restored from repo | `mkdir -p /home/user/srimandir && cp projects/srimandir/* /home/user/srimandir/` |
| `FileNotFoundError: /home/user/tools/ffmpeg/bin/ffmpeg` in seg.py | ffmpeg not installed or PATH not set | `export PATH=/home/user/tools/ffmpeg/bin:$PATH` or run bootstrap |
| Cycles clouds speckle at 12 spp | Volume planes create noise at low sample counts | Build clouds in world shader (ray-plane hit + noise), not as transparent planes |
| bpy `fcurves` broken on Blender 5 animation actions | Blender 5 moved fcurves into layers/strips/channelbags | Use `geo.py:fcurves()` helper which handles both APIs |
| Render chunks produce non-identical frames between helpers | A helper rendered at different settings | Check frame diffs (must be 0); helpers use the same render.py with the same blend file |

## Opuscar / canvas

| Symptom | Cause | Verified fix |
|---|---|---|
| Crossfade pops at style boundary | `c.globalAlpha = a` (absolute assign) inside draw functions | Use `c.globalAlpha *= a` (multiply); always |
| `--size` ignored; wrong crop | Forgot `--size 1080x1920` flag on `still.mjs` | Always pass `--size 1080x1920` |
| Per-blob blur filter times out READY | Blur filters on individual blobs stall the page | Draw unblurred, then blur the entire canvas once |
| Wrap texture seam visible | Texture tiled without wrapping | Wrap texture coordinates to avoid tile seams |
| GTAO darkens wide/grazing views on a flat plate | Ambient occlusion on large flat surfaces | Turn AO off for architectural flat plates (`Plot·RoW` lesson) |
| Shadow bias causes acne on 1:150 scale models | Default bias too large for tiny geometry | Shadow bias −0.0006 / normalBias .0025 at 1:150 scale |
| Camera orbit clips through a building at low angle | Orbit arc radius too small for a 1.1 s pass | Raise the minimum orbit height above roof level |
| 2D↔3D hand-over ghosting | View not held identical on both sides | Hold identical top-down view ≥ 0.4 s crossfade at hand-over |
| Light "flicker on" reads as a pop | Instant ON | Ramp it over at least 3–5 frames |
| Hermite camera keys overshoot | Hermite interpolation overshoots | Use monotone (Fritsch–Carlson) camera interpolation |
| Odia text conjuncts wrong (e.g. ନ୍ଦ in ଶ୍ରୀମନ୍ଦିର stacked wrong) | Noto Serif Oriya 1.051 mis-renders conjuncts | Use **Noto Sans Oriya 2.x** (`fonts/NotoSansOriya-*.ttf`, RAQM layout). The fontsource Oriya subset also lacks `·` `,` and quotes — draw those in Cormorant. |
| Red projected light on white reads terracotta | Additive light blending | Expected; it is the intended look in `plot1` |

## GitHub / git

| Symptom | Cause | Verified fix |
|---|---|---|
| GitHub MCP fails with ERR_PROXY_TUNNEL | Proxy blocks the MCP tunnel | Use plain `git push -u origin stage` (works fine over proxy) |
| Push rejected (remote has commits we lack) | Remote has new commits | `git fetch origin stage && git merge --no-edit FETCH_HEAD` then push again |

## Audio / encode

| Symptom | Cause | Verified fix |
|---|---|---|
| `mux.sh` fails | ffmpeg < 7, or PATH not set | `export PATH=/home/user/tools/ffmpeg/bin:$PATH` before mux |
| Film gate fails (结论：门禁未通过) | Blue-violet "AI" palette, or long empty frames, or no fast action | Fix palette (warm/muted); add kinetic moments; ensure the gate sees enough motion |
| Chrome dies mid-render | Disk full | Delete old `*/out/` renders; keep >2 GB free |

## ASR

| Symptom | Cause | Verified fix |
|---|---|---|
| `/tmp/claude-0/asr/` missing | `/tmp` wiped on container restart | Re-run `bash scripts/bootstrap.sh --asr` |
