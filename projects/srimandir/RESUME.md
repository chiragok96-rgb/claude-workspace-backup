# Srimandir 3D — Resume Guide

**Last delivered:** v3 (2026-11-27), 84 s, 24 fps, 2026 frames, 1080×1920 vertical.
**Deliverables on repo:** `deliverables/Srimandir_3D_v3.mp4` (with text) and `Srimandir_3D_v3_no_text.mp4`.

---

## What's in this folder (`projects/srimandir/`)

| File | Purpose |
|------|---------|
| `temple.py` | Blender geometry: Rekha Deula, Jagamohana, Natamandira, Bhoga Mandapa, walls, gates, steps, flag pole |
| `build.py` | Keyframed construction animation: appear/grow sequences, ghost tier, devotees, diyas, ship, flags |
| `kitchen.py` | Kitchen interior, top handi cooking steam |
| `rath.py` | Rath (chariot) geometry |
| `people.py` | Procedural devotee figures |
| `geo.py` | Shared geometry helpers (lathe, extrude, etc.) |
| `mats.py` | All materials, including `arrival_glow` (gold vs white via object colour B channel) |
| `world.py` | Ocean (Cycles), sky, lighting |
| `anim.py` | Camera path: Bezier AUTO_CLAMPED keyframes, 24 fps |
| `seg.py` | Scene assembly: imports all above, builds the full blend |
| `render.py` | Resumable Cycles renderer: `python render.py <blend> <out> <start> <end> <step> <pct> <spp>` |
| `finish.py` | Post-processing: upscale 720→1080, name labels, Odia captions, English subtitles, outline flash, halo. `CLEAN` mode skips all text. |
| `mix.py` | Audio score: tanpura, bansuri, ghungroo, ducked under VO |
| `mix.wav` | Pre-mixed audio (84.4 s) |
| `ph.npy` | Phrase timings from ASR (used by finish.py for subtitle sync) |
| `flag_tex.png` | Flag texture |
| `fonts/` | Cormorant Garamond (italic + regular), Noto Sans/Serif Oriya, with OFL licences |
| `events.json` | Timing events for the construction sequence |

## How to rebuild from scratch

```bash
# 1. Set up Blender
export PATH=/root/.local/bin:$PATH
uv venv --python 3.11 /home/user/bpyenv
uv pip install --python /home/user/bpyenv/bin/python bpy==5.0.1 numpy

# 2. Restore working directory
mkdir -p /home/user/srimandir/out /home/user/srimandir/fonts
cp projects/srimandir/*.py /home/user/srimandir/
cp projects/srimandir/*.npy /home/user/srimandir/
cp projects/srimandir/*.png /home/user/srimandir/
cp projects/srimandir/fonts/* /home/user/srimandir/fonts/
cp projects/srimandir/mix.wav /home/user/srimandir/out/
cp projects/srimandir/events.json /home/user/srimandir/

# 3. Generate the blend file (~2 min)
cd /home/user/srimandir
/home/user/bpyenv/bin/python seg.py   # writes scene.blend

# 4. Render all 2026 frames (use distributed helpers — see below)
/home/user/bpyenv/bin/python render.py scene.blend final3 0 2025 1 100 12
# Output: final3/f_00000.png … f_02025.png + final3/idx/ (label masks)

# 5. Finish (upscale + overlays) — both versions
PY=/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python
$PY finish.py final3 final3_hd 0 2025         # with text
$PY finish.py final3 final3_clean 0 2025 clean # no text

# 6. Encode
export PATH=/home/user/tools/ffmpeg/bin:$PATH
ffmpeg -y -framerate 24 -i final3_hd/f_%05d.jpg -c:v libx264 -crf 14 -preset medium -pix_fmt yuv420p video3_hd.mp4
ffmpeg -y -framerate 24 -i final3_clean/f_%05d.jpg -c:v libx264 -crf 14 -preset medium -pix_fmt yuv420p video3_clean.mp4

# 7. Mux with audio
L=/home/user/lemomo-ai/lemo-opuscar
sh $L/core/render/mux.sh video3_hd.mp4 out/mix.wav final3_hd.mp4 24 0
sh $L/core/render/mux.sh video3_clean.mp4 out/mix.wav final3_clean.mp4 24 0

# 8. Two-pass share encode (9 Mbps, AAC 256k, yuv420p, faststart)
cd /tmp  # for pass log files
for v in hd clean; do
  O=/home/user/claude-workspace-backup/deliverables/Srimandir_3D_v3$([ $v = clean ] && echo _no_text).mp4
  ffmpeg -y -i /home/user/srimandir/final3_$v.mp4 -c:v libx264 -b:v 9M -pass 1 -pix_fmt yuv420p -an -f null /dev/null
  ffmpeg -y -i /home/user/srimandir/final3_$v.mp4 -c:v libx264 -b:v 9M -pass 2 -pix_fmt yuv420p -c:a aac -b:a 256k -movflags +faststart $O
done
```

## How to make a PARTIAL fix (the fast path)

### Text-only fix (labels, subtitles, captions)
Edit `finish.py`, then re-finish only the affected frame range:
```bash
# Delete old JPGs for the range first
for i in $(seq <start> <end>); do rm -f final3_hd/f_$(printf %05d $i).jpg final3_clean/f_$(printf %05d $i).jpg; done
$PY finish.py final3 final3_hd <start> <end>
$PY finish.py final3 final3_clean <start> <end> clean
```
Then re-encode from step 6 above. No Blender re-render needed.

### Scene fix (geometry, materials, animation, camera)
1. Edit the relevant `.py` file.
2. Regenerate the blend: `python seg.py`
3. Re-render only the affected frames: `python render.py scene.blend final3 <start> <end> 1 100 12`
   - Delete existing PNGs in that range first so render.py doesn't skip them.
   - **Camera fixes:** after moving a Bezier key, re-render the full span between its neighbouring keys (the tangents change).
4. Re-finish the same range (step above).
5. Re-encode.

### Distributed rendering (for large ranges)
Use `scripts/tools/render_chunk2.sh` with fresh Haiku helper sessions:
- Push `render-jobs/srimandir3/{scene.blend, render.py}` to a job branch.
- Each helper runs: `bash scripts/tools/render_chunk2.sh srimandir3 <first> <last> <check_frame> <partN> <branch-name>`
- Merge with: `bash scripts/tools/merge2.sh srimandir3 /home/user/srimandir/final3 /path/to/check_ref.png <state_dir> N:branch-name ...`
- Keep chunks to ~60 min of render time (the 2-hour helper limit kills longer ones).

## Key numbers
- 24 fps, 2026 frames (0–2025), 84.4 s
- Render: 720×1280 at 12 spp (24 spp for steam frames 1130–1243), upscaled to 1080×1920 by finish.py
- Audio: −14 LUFS, pre-mixed in mix.wav
- Camera clip_start: 0.6 (default), set to 6 at frame 883 for the wall shot

## Known limitations (v3)
- Sevayat climb animation is basic
- Only one rath shown (the main one)
- People are procedural stick figures
- 720p upscaled (not native 1080)
- Flag emblem not verified against the real one
- Nilachakra name label is on a dark backing, sits low

## Frame time reference
| Seconds | Frames | Scene |
|---------|--------|-------|
| 0–5.5 | 0–131 | Opening: ocean, shore, Puri introduction |
| 5.5–12 | 132–287 | Foundation, platform, Rekha Deula base |
| 12–20 | 288–479 | Rekha Deula rises, ghost tier preview, collapse & rebuild |
| 20–26 | 480–623 | Jagamohana, Natamandira, Bhoga Mandapa |
| 26–32 | 624–767 | Walls: Pathara Pacheri, Kurma Bedha, Meghanada |
| 32–38 | 768–911 | Singhadwara (Lion Gate), 22 steps with diyas |
| 38–46 | 912–1103 | Side gates, inner structures |
| 46–53 | 1104–1271 | Kitchen, cooking steam, Bhoga Mandapa interior |
| 53–60 | 1272–1439 | Flag change, Nilachakra, White Pagoda reveal |
| 60–66 | 1440–1583 | Devotees enter, Baisi Pahacha (22 steps) |
| 66–73 | 1584–1751 | Rath, walls panorama, gate approach |
| 73–79 | 1752–1895 | Through the gate, interior, final reveal |
| 79–84 | 1896–2025 | Closing: halo, ship on ocean, end title |
