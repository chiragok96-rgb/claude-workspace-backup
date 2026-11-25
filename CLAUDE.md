# CLAUDE.md — central memory of this film studio (read first, every session)

This repo (`chiragok96-rgb/claude-workspace-backup`, working branch **`stage`**) is the owner's code-made film studio and its memory.
We make short films entirely in code (Node + canvas/three.js + Playwright + Python + ffmpeg), mainly **vertical 9:16 Odia-culture reels**
(Bali Jatra, Panchuka, Radha Pada Darshan, Harihara Besha, Boita Bandana/Danga, Manabasa Gurubara, Jagannath lore), always aiming for **virality**.

**Detailed memory lives in [`memory/`](memory/README.md)** — start with `memory/README.md`, then 01 (owner), 02 (quality bar), 07 (lessons),
08 (status). Workflow commands: 03. Environment: 04. Reusable engines: 05. Audio: 06.

## Session start (mandatory)
1. `bash /home/user/claude-workspace-backup/scripts/bootstrap.sh` then `bash /home/user/claude-workspace-backup/scripts/verify.sh --render`.
   (Work lives under **`/home/user`** even though `HOME=/root`; always use absolute `/home/user/...` paths.)
2. Read `memory/01_owner_profile.md`, `02_quality_bar.md`, `07_lessons.md`, `08_films_and_status.md`.
3. Confirm briefly and wait for the owner's request. Latest delivered film: **Manabasa Gurubara final v7**.

## Standing rules from the owner (always follow)
1. **Never install anything on the owner's local computer.** All work happens in the cloud container.
2. **Captions/subtitles:** clean, posh, aesthetic; never overlap anything. Keep text out of the top 250 px and bottom 450 px of a
   1080x1920 frame (baselines y <= ~1470). Premium fonts only (Cormorant Garamond with one gold italic accent word; Inter Tight; Noto
   Serif Oriya for Odia in the picture). Never childish/sticker display fonts. Rap films: no captions unless asked.
3. **Transitions:** smoothest possible, especially between different styles (the "Panchuka standard"): one continuous camera; every
   scene becomes the next through a physical carrier (thread, light, shadow, steam, doorway, eye, 2.5D tilt). No plain dissolves, no swipes, no pops.
4. **A metaphor for every lyric/voice line**, synced to the exact word. Content must be classy and viral (colour, motion, meaning, loopable).
5. **Mix styles per line**; never one style for a whole film. Pick the style for beauty, not ease. Real things -> 2.5D/3D.
6. **Cheapest model that keeps the best quality**; reuse existing scenes/code instead of rebuilding.
7. **References are references only.** Never copy a reference video's (or our previous film's) characters/art/music/layout.
8. Do not delete or overwrite the owner's existing work. Work in `/home/user/<film>/` (never edit Opuscar `styles/` or `core/`). Keep old versions.
9. Deliver a finished video, not a storyboard, when the owner says so. Be honest about flaws.
10. **Never be biased toward the owner's opinion or any AI's**: consider every remark, decide independently, change only what improves the film,
    and say plainly when something should stay. **No "jabardasti"** (forced) changes.
11. **Hook the first 10–20 s**; nothing childish or cartoonish; people must read as people; deities dignified (subtle expressions, push in to show them).
12. Every delivery: stills check → full render → pop scan → mux (−14 LUFS) → gate → two-pass encode → SendUserFile → honest summary →
    back up to `projects/<film>` + `deliverables/` and push to `stage`. Keep the owner's email/personal data private.

## Toolchain facts (verified)
- Opuscar root: `/home/user/lemomo-ai/lemo-opuscar` (pinned `3a7132b`, MANIFEST.md). Pages expose `window.render(t)`, `window.READY`, `window.DUR`.
  Stills: `node core/render/still.mjs <dir> <t...> --size 1080x1920 --out <dir>` (prefix `LEMO_ANGLE=swiftshader` for WebGL pages; `--q "p=film"` for library films).
  Video: `node core/render/video.mjs <dir> --fps 30 --size 1080x1920 --workers 3 --out x.mp4` (30 s per-frame timeout; fewer workers if it trips; `?from=&to=` ranges).
- Mux/loudness: `sh core/render/mux.sh video.mp4 mix.wav out.mp4 30 0` (needs **ffmpeg >= 7**: `export PATH=/home/user/tools/ffmpeg/bin:$PATH`).
- Gate: `cd /home/user/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py out.mp4` (fails on blue-violet "AI" palettes, long empty frames, no fast action).
  Share encode: two-pass 9 Mbps H.264, AAC 256k, yuv420p, faststart.
- Checks: `scripts/tools/popscan.py` (frame-diff pops + loop seam), `scripts/tools/contact_sheet.py` (stills sheet). Run with the Opuscar venv python.
- No image generator is available: everything is drawn procedurally. Imagery hosts (EOX, NASA GIBS, ArcGIS) are blocked; elevation tiles at
  s3.amazonaws.com/elevation-tiles-prod work; npm fontsource packages work for fonts.
- ASR for timing: `scripts/helpers/asrwork/phr.py` (sherpa-onnx Whisper-turbo, language 'hi'); word onsets from 40 ms RMS profiles (memory/03).
- Score: per-film `mix.py` (Opuscar sampler + synthesised tanpura/bansuri/ghungroo…), ducked under the VO, tail wrapped for the loop (memory/06).

## Project map
See README.md and memory/08. Each `projects/<name>` is one film (restored to `/home/user/<name>`); `opuscar-overlay/films/` holds the
Opuscar-hosted films (`bali-rap`; `bali-toon` = rejected cartoon attempt). Final encodes are in `deliverables/`.

## Lessons (do not repeat) — full list in memory/07_lessons.md
- Single-style films, code-drawn cartoon characters, rounded sticker fonts, literal drawn food, repetitive devices (rice swirls), dissolves
  between unrelated scenes and side-swipes were all rejected.
- Test stills at every line mid-point and every bridge before a full render; scan frame diffs for pops; patch bad ranges instead of re-rendering everything.
- Inside drawing functions multiply alpha (`c.globalAlpha *= a`), never assign it; always pass `--size 1080x1920` to still.mjs.
