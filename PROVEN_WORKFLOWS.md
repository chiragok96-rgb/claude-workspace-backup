# PROVEN_WORKFLOWS.md — production techniques that have worked
_Read when: starting a new film, producing audio, or running Blender renders._

## 0. Session start
```bash
bash /home/user/claude-workspace-backup/scripts/bootstrap.sh   # idempotent; add --instruments for audio; --asr for a new VO
bash /home/user/claude-workspace-backup/scripts/verify.sh --render   # must end ALL GOOD
export PATH=/home/user/tools/ffmpeg/bin:$PATH
LIB=/home/user/lemomo-ai/lemo-opuscar
```

## 1. VO intake
1. Copy uploaded VO to `/home/user/<film>/audio/vo.mp3`; convert: `ffmpeg -i vo.mp3 -ar 48000 vo.wav`
2. Read the Odia transcript; write the meaning of every line.

## 2. Timing (phrases → words)
**Phrases** (energy segmentation → `ph.npy`):
- Template: `scripts/helpers/asrwork/seg_manabasa.py`; threshold = max−38 dB; merge gaps < 0.28 s.

**Word onsets** (for exact sync):
```python
import soundfile as sf, numpy as np
x, sr = sf.read('audio/vo.wav'); x = x.mean(1) if x.ndim > 1 else x
for t in np.arange(a, b, .04):
    s = x[int(t*sr):int((t+.04)*sr)]
    print('%.2f:%d' % (t, 20*np.log10(np.sqrt((s**2).mean())+1e-9)))
```
Transcribe each phrase: `/tmp/claude-0/asr/venv/bin/python scripts/helpers/asrwork/phr.py audio/vo.wav ph.npy`
Record the final map in `VOICEOVER_MAP.md`.

## 3. Concept
Per line: meaning → metaphor → world/style → physical carrier into the next line. Plan the hook (0–10 s) first. Consult STYLE_INDEX.md.

## 4. Storyboard (only when asked)
Build real engines, render stills at each line midpoint, assemble sheets, send `STORYBOARD*.jpg`.

## 5. Canvas film build
- Static page: `index.html` + `film.js` exposing `window.render(t)`, `window.READY`, `window.DUR`.
- Scenes as functions `sX(ctx, t)`; dispatcher `L(a, b, fadeA, fadeB, fn)`. Offscreen canvases (`mk(W,H)`) for tilts/portals/wipes.
- Shared helpers in `common.js` (`seg, ss, eo, eio, lerp, hh, mk, scent`).
- **Alpha rule:** `c.globalAlpha *= a` (multiply), never `= a`.
- Captions last (`captions(ctx, t)` from CAPS table `[start, end, ['line', '*gold* word']]`), then film grain.

## 6. Stills check
```bash
node $LIB/core/render/still.mjs /home/user/<film> t1 t2 ... --size 1080x1920 --out <dir>
$LIB/.venv/bin/python scripts/tools/contact_sheet.py <dir> out.jpg <cols>
# Look at every still; check every caption against the frame.
```

## 7. Render
```bash
node $LIB/core/render/video.mjs /home/user/<film> --fps 30 --size 1080x1920 --workers 3 --out video.mp4
# Keep >2 GB disk free. Lower --workers if 30 s timeout trips.
# Patch a range: --q "from=16&to=18" then splice (frame-exact only).
```

## 8. Score
```bash
cd /home/user/<film> && $LIB/.venv/bin/python mix.py   # writes out/mix.wav
```
Copy `projects/manabasa/mix.py` or `projects/danga/mix.py` as template. Key per film (Danga = B, Manabasa = D).
Every visual beat has a sound: pot lands → clay knock; lamp snuffs → harp scale; door slams → thud + gong + timpani.
Rap/song films: skip mix.py; mux with the song directly.

## 9. Verify → mux → gate → encode
```bash
$LIB/.venv/bin/python scripts/tools/popscan.py out/video.mp4
# Flags jumps >3.0 mean-abs-diff and >3.2x neighbours; loop seam ≤ ~3x median.

sh $LIB/core/render/mux.sh out/video.mp4 out/mix.wav out/final.mp4 30 0

cd /home/user/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py <film>/out/final.mp4
# Must print 结论：门禁通过

ffmpeg -y -i final.mp4 -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p \
  -pass 1 -passlogfile /tmp/p2 -an -f mp4 /dev/null
ffmpeg -y -i final.mp4 -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p \
  -pass 2 -passlogfile /tmp/p2 -c:a aac -b:a 256k -movflags +faststart deliverables/<Name>_vN.mp4
```

## 10. Deliver and back up
```bash
# Backup film source
(cd /home/user/<film> && tar cf - --exclude=./out --exclude=node_modules --exclude='*.mp4' .) \
  | (cd projects/<film> && tar xf -)

git add projects/<film> deliverables/<file>
git commit -m "..."
git push -u origin stage   # retry up to 4x with backoff on network error
```
Report: changes per remark, what was kept and why, checks run, weak spots.

## Blender / Srimandir pipeline
```bash
# 1. Build the blend file
cd /home/user/srimandir
/home/user/bpyenv/bin/python build.py   # writes srimandir.blend

# 2. Render frames (resumable; skips existing)
/home/user/bpyenv/bin/python render.py srimandir.blend out/ <f_start> <f_end> <step> <pct_%> <spp>
# Example: 50% resolution, 12 spp: render.py srimandir.blend out/ 1 2026 1 50 12
# Kitchen/steam frames (t=47-52 s) are 1.5–3x slower; plan accordingly.

# 3. Post-process (upscale 720→1080, captions, subtitles)
/home/user/bpyenv/bin/python finish.py

# 4. Distribute across helpers (optional, Haiku sessions)
bash scripts/tools/render_chunk.sh <film> <blend> <start> <end>   # each helper: renders + pushes a segment
bash scripts/tools/merge_chunk.sh <film>                           # orchestrator: merges + verifies a check frame
# Split by measured seconds per section, NOT frame count (steam sections are 2–3x slower).
```
Blender render parameters: Cycles CPU, 12 spp, adaptive sampling, denoising FAST/BALANCED, 720×1280 (finish.py upscales).
AgX tone mapping + "Punchy" look; exposure animated from −0.25 (start) to −0.6 (t=7 s).

## Iteration etiquette
- Number versions: `_v2`, `_v5_onetake`, `final_v7`.
- Keep old files: `film_v4_dissolves.js`, `mix_v4.py`.
- Each round: map every remark → decide (do / partly / don't, with reason) → implement → stills → render → checks → deliver.
