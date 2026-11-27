# REPO_INDEX.md — repository capabilities and verified file locations
_Read when: session start, something is missing, or setting up a new film._

## Container layout (verified paths)
| Path | What |
|---|---|
| `/home/user/claude-workspace-backup` | This repo (memory, projects backup, deliverables, scripts) |
| `/home/user/lemomo-ai/lemo-opuscar` | Opuscar v2.0.0 @ `3a7132b` — renderer, sampler, 99 styles |
| `/home/user/lemomo-ai/lemo-opuscar/films/` | Opuscar-hosted films from `opuscar-overlay/films/` |
| `/home/user/<film>` | Standalone film dirs (restored from `projects/<film>` by bootstrap) |
| `/home/user/tools/ffmpeg/bin` | Static ffmpeg 8.1 (BtbN) — always `export PATH=/home/user/tools/ffmpeg/bin:$PATH` |
| `/home/user/bpyenv` | Python 3.11 venv with bpy 5.0.1 for Srimandir |
| `/home/user/.claude/skills/huashu-art-motion` | Huashu v1.3.0 quality gate (`scripts/film_gate.py`) |
| `/root/.claude/skills/` | Skills: huashu-art-motion, breakdown, graph, map-route, minimalistic-graphics, stick-figure, zach-d-films, claude-drawing, open-video-harness |
| `/root/OpenVideoHarness` | OpenVideoHarness workbench (`bin/vh`) |
| `/tmp/claude-0/asr/` | ASR venv + sherpa-onnx Whisper-turbo (**ephemeral**; re-create with `bootstrap.sh --asr`) |
| `HOME=/root` but all work at `/home/user` | Always use absolute `/home/user/...` paths |

> `$HOME=/root` but all work lives under `/home/user`. Never use `~` for project paths.

## Repo structure
```
claude-workspace-backup/
  CLAUDE.md           ← entry point (auto-loaded)
  CURRENT_STATE.md    ← read at session start; update after every delivery
  KNOWN_ERRORS.md     ← read before rendering or on any error
  CREATIVE_PREFERENCES.md  ← read when concepting or reviewing
  STYLE_INDEX.md      ← read when choosing styles
  REPO_INDEX.md       ← this file; read when something is missing
  PROVEN_WORKFLOWS.md ← read when producing
  memory/             ← legacy (do not delete; still valid archive)
  projects/<film>/    ← source backup of each film
  deliverables/       ← final encoded mp4s
  scripts/bootstrap.sh   ← idempotent setup (run at session start)
  scripts/verify.sh      ← checks everything (must end ALL GOOD)
  scripts/tools/         ← popscan.py, contact_sheet.py, render_chunk.sh, merge_chunk.sh
  scripts/helpers/       ← ASR helpers, prosody, an.py
  opuscar-overlay/films/ ← Opuscar-hosted films (bali-rap, bali-toon)
```

## Project index (verified in repo)
| Film | Project dir | Entry file | Status |
|---|---|---|---|
| **Srimandir 3D** | `projects/srimandir` | `build.py` → `srimandir.blend` → `render.py` → `finish.py` | v3 delivered; v4 WIP |
| Plot · Right of Way | `projects/plot1` | `film.js` + `world.js`, `proj.js`, `table.js`, `layout.js` | v2 delivered |
| Manabasa Gurubara | `projects/manabasa` | `film.js` (+ sc_*.js) | v7 final |
| Aa Ka Ma Bai / Danga | `projects/danga` | `film.js` (+ sc_*.js) | v2 final |
| Kartika Wind | `projects/bj-wind` | `film.js` | v3 final |
| Bali Jatra VO | `projects/balijatra-vo` | `film.js` via `?p=film` | v3 final |
| Bali Jatra rap | `opuscar-overlay/films/bali-rap` | `film.js` (`--q "p=film"`) | done |
| Bali Jatra sand/3D | `projects/bali-yatra` | `film.js` | done |
| Panchuka | `projects/panchuka-reel` | `film.js` | most viewed |
| Radha Pada Darshan | `projects/radha-pada-darshan` | `film.js` | 2nd most viewed |
| Harihara Besha | `projects/harihara-besha` | `main.js` | done |
| Jadu Guni / Megha Kadamba | `projects/jadu-guni*`, `projects/megha-kadamba` | `main.js` | lyric films |
| Jagannath 3D (three.js) | `projects/jagannath-3d` | `main.js` | asset |
| Bali toon | `opuscar-overlay/films/bali-toon` | — | REJECTED (cartoon) |

## Key toolchain commands
```bash
export PATH=/home/user/tools/ffmpeg/bin:$PATH
LIB=/home/user/lemomo-ai/lemo-opuscar

# Stills (always pass --size)
node $LIB/core/render/still.mjs /home/user/<film> <t1> <t2> --size 1080x1920 --out <dir>
# WebGL pages: prefix LEMO_ANGLE=swiftshader
# Library films: add --q "p=film"

# Video render
node $LIB/core/render/video.mjs /home/user/<film> --fps 30 --size 1080x1920 --workers 3 --out video.mp4

# Mux −14 LUFS
sh $LIB/core/render/mux.sh video.mp4 mix.wav final.mp4 30 0

# Quality gate (must print 结论：门禁通过)
cd /home/user/.claude/skills/huashu-art-motion && uv run scripts/film_gate.py <final.mp4>

# Two-pass share encode (9 Mbps H.264, AAC 256k, yuv420p, faststart)
ffmpeg -y -i final.mp4 -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p -pass 1 -passlogfile /tmp/p2 -an -f mp4 /dev/null
ffmpeg -y -i final.mp4 -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p -pass 2 -passlogfile /tmp/p2 -c:a aac -b:a 256k -movflags +faststart deliverable.mp4

# Blender (Srimandir)
/home/user/bpyenv/bin/python build.py          # writes srimandir.blend
/home/user/bpyenv/bin/python render.py srimandir.blend out/ <start> <end> <step> <pct> <spp>

# Checks
$LIB/.venv/bin/python scripts/tools/popscan.py video.mp4
$LIB/.venv/bin/python scripts/tools/contact_sheet.py <frames_dir> out.jpg <cols>
```

## Network (what works / what is blocked)
Works: github.com, npm, PyPI, fontsource, `s3.amazonaws.com/elevation-tiles-prod`
Blocked: EOX, NASA GIBS, ArcGIS imagery hosts; GitHub MCP tunnel (ERR_PROXY_TUNNEL) — use plain `git push`

## Fonts (per film carries its own `fonts/` dir; copy from `projects/manabasa/fonts/`)
- Cormorant Garamond + Italic — captions, end card, ornament
- Inter Tight (variable) — romanised Odia subtitles
- **Noto Sans Oriya 2.x** — Odia text in the picture (RAQM layout; Noto Serif Oriya 1.051 mis-renders conjuncts)
- Cinzel, Marcellus — formal titles
