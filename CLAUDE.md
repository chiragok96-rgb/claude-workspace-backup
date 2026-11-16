# Workspace instructions (restore into the root of a fresh cloud environment as `~/CLAUDE.md`)

This workspace makes short films entirely in code (Node + three.js + Playwright + Python + ffmpeg),
mainly vertical 9:16 Odia-culture reels (Cuttack Bali Jatra, Jagannath, Radha-Pada, Jadu-Guni, Panchuka, …).

## Standing rules from the owner (always follow)
1. **Never install anything on the owner's local computer.** All work happens in the cloud container.
2. **Captions/subtitles:** clean, posh, aesthetic; never overlap anything. Keep text out of the top 250 px and
   bottom 450 px of a 1080x1920 frame (baselines y <= ~1470). Odia lines are shown **romanised** in a premium sans
   (Inter Tight) with one gold italic (Cormorant) accent word per line. Never use childish/sticker display fonts.
3. **Transitions:** smoothest possible, especially between different styles (the "Panchuka" standard):
   wet-edge washes, push-ins that become the next scene, light flashes that build and decay. No hard pops.
4. **A metaphor for every lyric/voice line.** Content must be classy and viral (colour, motion, meaning, loopable).
5. **Mix styles per line** (neon, low-poly island, glass studio, watercolour, 3D map, paper-cut, sand, ...);
   never one style for a whole film. Pick the style for beauty, not ease. Real things -> 2.5D/3D.
6. **Cheapest model that keeps the best quality.**
7. **References are references only.** Never copy a reference video's characters/art/music/layout.
8. Do not delete or overwrite the owner's existing work. Work in `films/<name>/` (never edit `styles/` or `core/`).
9. Deliver a finished video, not a storyboard, when the owner says so. Be honest about flaws.

## Toolchain facts (verified)
- Opuscar root: `~/lemomo-ai/lemo-opuscar` (pinned commit in MANIFEST.md). Project pages expose `window.render(t)`,
  `window.READY`, `window.DUR`. Stills: `LEMO_ANGLE=swiftshader node core/render/still.mjs <film> <t...> --size 1080x1920 --q "p=film"`.
  Video: `node core/render/video.mjs <film> --fps 30 --size 1080x1920 --workers 3 --q "p=film" --out x.mp4`
  (30 s per-frame screenshot timeout; reduce parallel workers if it trips; render ranges with `from`/`to` query params).
- Mux/loudness: `sh core/render/mux.sh video.mp4 song.wav out.mp4 30 0` (needs **ffmpeg >= 7**: put `~/tools/ffmpeg/bin` on PATH).
- Gate: `cd ~/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py out.mp4` (fails on blue-violet "AI" palettes,
  long empty frames, no fast action). Share encode: two-pass 9 Mbps H.264, AAC 256k, yuv420p, faststart.
- No image generator is available (no Codex CLI): everything is drawn procedurally. Imagery hosts (EOX, NASA GIBS, ArcGIS)
  are blocked; elevation tiles at s3.amazonaws.com/elevation-tiles-prod work; npm fontsource packages work for fonts.
- ASR for beat/line timing: `scripts/helpers/asrwork/phr.py` (sherpa-onnx Whisper-turbo, language 'hi'); see INSTALL.md.
- Song timing (rap): 115 BPM, bar = 2.09 s, one lyric line per bar.

## Project map
See README.md. Each `projects/<name>` is one finished film or experiment; `opuscar-overlay/films/` holds the
Opuscar-hosted films (bali-rap = latest, bali-toon = rejected cartoon attempt).

## Lessons (do not repeat)
- A single-style film, code-drawn cartoon characters and a rounded sticker font were all rejected.
- Test stills at every line mid-point and every bridge before a full render; scan frame diffs for pops; patch bad ranges
  and splice instead of re-rendering everything.
