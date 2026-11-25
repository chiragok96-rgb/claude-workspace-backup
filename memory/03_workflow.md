# 03 · Production workflow (end to end, with exact commands)

Paths assume the restored layout (see 04_environment.md): work dirs in `/home/user/<film>`, Opuscar at
`/home/user/lemomo-ai/lemo-opuscar` (`$LIB`), ffmpeg 8 at `/home/user/tools/ffmpeg/bin`. Always:
```bash
export PATH=/home/user/tools/ffmpeg/bin:$PATH; LIB=/home/user/lemomo-ai/lemo-opuscar
```

## 0. Intake
- Copy the uploaded VO to `/home/user/<film>/audio/vo.mp3` and make `vo.wav` (`ffmpeg -i vo.mp3 -ar 48000 vo.wav`).
- Read the owner's Odia transcript; write the meaning of every line.

## 1. Timing (phrases, then words)
- Phrases: energy segmentation → `ph.npy` (template: `scripts/helpers/asrwork/seg_manabasa.py`, threshold max−38 dB, merge gaps <0.28 s).
- Transcribe each phrase with Whisper-turbo (sherpa-onnx, language `hi` since there is no Odia mode):
  `/tmp/claude-0/asr/venv/bin/python scripts/helpers/asrwork/phr.py audio/vo.wav ph.npy` (model path inside the script).
- **Word onsets** (for exact sync): print 40 ms RMS frames over a phrase and read the energy jumps/gaps:
  ```python
  import soundfile as sf, numpy as np; x,sr=sf.read('audio/vo.wav'); x=x.mean(1) if x.ndim>1 else x
  for t in np.arange(a,b,.04): s=x[int(t*sr):int((t+.04)*sr)]; print('%.2f:%d'%(t,20*np.log10(np.sqrt((s**2).mean())+1e-9)))
  ```
  Example (Manabasa): "ଯେଉଁ" 0.04–0.18, "ଜଗନ୍ନାଥଙ୍କୁ" 0.20–0.90 → the face fades in from 0.20.
- Record the final map in the project (`VOICEOVER_MAP.md` or the CAPS table in `film.js`).

## 2. Concept
- For each line: meaning → metaphor → world/style → the physical carrier into the next line. Choose styles for beauty
  (consult Opuscar `styles/`, Huashu, claude-drawing, OpenVideoHarness catalogues). Plan the hook (0–10 s) first.
- Write the one-take chain in the `film.js` header comment (see Manabasa's).

## 3. Storyboard (only when asked)
- Build the real engines, render stills at each line midpoint, assemble sheets (`projects/*/tools/storyboard_sheet.py` style),
  send `STORYBOARD*.jpg`. Never mock up in a different tool than the film.

## 4. Build (page architecture)
- A film is a static page: `index.html` (+ `@font-face` for local `fonts/`), `film.js` exporting `window.render(t)`, `window.READY`,
  `window.DUR`, with `?t=` for a single frame and `?from=&to=` for a range (`const t = t0 + FROM`).
- Scenes are functions `sX(ctx, t)`; a dispatcher `L(a, b, fadeA, fadeB, fn)` layers them by time. Offscreen canvases (`mk(W,H)`)
  for pitch tilts / portals / wipes. Shared helpers in `common.js` (`seg, ss, eo, eio, lerp, hh, mk, scent …`).
- **Alpha rule:** inside drawing functions use `c.globalAlpha *= a`, never `= a` (otherwise crossfades pop).
- Captions are drawn last (`captions(ctx, t)` from a `CAPS` table `[start, end, ['line', '*gold* word']]`), then film grain.

## 5. Check stills
```bash
cd $LIB && node core/render/still.mjs /home/user/<film> 0.3 1.2 … --size 1080x1920 --out <dir>      # ALWAYS pass --size
$LIB/.venv/bin/python /home/user/claude-workspace-backup/scripts/tools/contact_sheet.py <dir> <out.jpg> <cols>   # then look at it
```
WebGL pages: prefix `LEMO_ANGLE=swiftshader`. Opuscar library films: add `--q "p=film"` where the page needs it.

## 6. Render
```bash
cd $LIB && node core/render/video.mjs /home/user/<film> --fps 30 --size 1080x1920 --workers 3 --out /home/user/<film>/out/video.mp4
```
~250 s for a 56 s canvas film. 30 s per-frame timeout: lower `--workers` if it trips; keep >2 GB disk free (Chrome dies on a full disk).
Patch a range instead of re-rendering: `--q "from=16&to=18"` then splice (only when frame-exact).

## 7. Score & foley
`cd /home/user/<film> && /home/user/lemomo-ai/lemo-opuscar/.venv/bin/python mix.py` → `out/mix.wav` (see 06_audio.md). Prints voice vs bed levels.

## 8. Verify, mux, gate, encode
```bash
F=/home/user/<film>; cd $F                                  # every relative path below is inside the film dir
$LIB/.venv/bin/python /home/user/claude-workspace-backup/scripts/tools/popscan.py $F/out/video.mp4   # flags jumps >3.0 mean-abs-diff and >3.2x both neighbours; loop seam should be <= ~3x the median
cd $LIB && sh core/render/mux.sh /home/user/<film>/out/video.mp4 /home/user/<film>/out/mix.wav /home/user/<film>/out/final.mp4 30 0   # −14 LUFS
(cd /home/user/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py $F/out/final.mp4)   # must print 结论：门禁通过 (needs enough fast-motion frames, no long empty frames, no blue-violet palette)
cd $F/out
D=/home/user/claude-workspace-backup/deliverables/<Name>_vN.mp4
ffmpeg -y -i final.mp4 -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p -pass 1 -passlogfile /tmp/p2 -an -f mp4 /dev/null
ffmpeg -y -i final.mp4 -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p -pass 2 -passlogfile /tmp/p2 -c:a aac -b:a 256k -movflags +faststart $D
```
Final read-through: `ffmpeg -i $D -vf "fps=1/2.5,scale=180:320,tile=12x2" -frames:v 1 sheet.jpg`.

Rap/song films have no `mix.py`: mux the video with the song itself (`mux.sh video.mp4 audio/song.wav final.mp4 30 0`).

## 9. Deliver & back up
- `SendUserFile` the share mp4 (display "render") with a one-line caption; reply with: changes per remark, what was kept and why,
  checks run, weak spots.
- Back up: `(cd /home/user/<film> && tar cf - --exclude=./out --exclude=node_modules --exclude='*.mp4' .) | (cd projects/<film> && tar xf -)`,
  `git add projects/<film> deliverables/<file>`, commit with the attribution lines the session's system reminder specifies (currently `Co-Authored-By: Claude …` + `Claude-Session: <session url>`; never put a model name elsewhere), `git push -u origin stage` (retry with backoff).
  Large mp4s (>50 MB) trigger a GitHub warning but push fine.

## Iteration etiquette
- Number versions (`_v2`, `_v5_onetake`, `final_v7`); keep old film/mix files (`film_v4_dissolves.js`, `mix_v4.py`).
- Each feedback round: map every remark → decide (do / partly / don't, with reason) → implement → stills → render → checks → deliver.
