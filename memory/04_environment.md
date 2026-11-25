# 04 · Environment, tools, repositories, skills and how to install them

## The cloud container (as used 2026-11)
- Claude Code cloud session, Linux, `$HOME=/root`, but **all work lives under `/home/user`** (films, Opuscar, tools, this repo).
  Always use absolute `/home/user/...` paths. The memory repo is checked out at `/home/user/claude-workspace-backup`.
- Preinstalled: Node 22 (`/opt/node22/bin/node`), Python 3.13, `uv` (`/root/.local/bin/uv`), git, Chromium + Playwright
  (`require('playwright')` works; never `playwright install`). Software WebGL only (SwiftShader).
- Outbound network goes through a proxy. Works: github.com/codeload/releases, npm, PyPI, fontsource packages (fonts),
  `s3.amazonaws.com/elevation-tiles-prod` (terrain), GitHub release assets (Opuscar instruments, ffmpeg).
  **Blocked:** EOX/NASA GIBS/ArcGIS imagery hosts. No image generator (no Codex CLI) — everything is drawn procedurally.
- Disk is a per-session allowance (~7–8 GB free was typical). Delete old renders under `*/out/` if space runs low.
- The GitHub MCP server may fail to connect; plain `git push` over the proxy works.

## Layout after restore (what each path is)
| Path | What |
|---|---|
| `/home/user/claude-workspace-backup` | THIS repo (memory, projects backup, deliverables, scripts) |
| `/home/user/lemomo-ai/lemo-opuscar` | Opuscar v2.0.0 @ `3a7132b996be0241c1ea0ab180d519f06e6f10b6` (renderer, audio sampler, 99 styles) |
| `/home/user/lemomo-ai/lemo-opuscar/films/` | Opuscar-hosted films (`bali-rap`, `bali-toon`) from `opuscar-overlay/films` |
| `/home/user/<film>` | Standalone film projects (danga, manabasa, bj-wind, balijatra-vo, panchuka-reel, radha-pada-darshan, …) from `projects/` |
| `/home/user/tools/ffmpeg/bin` | static ffmpeg 8.1 (BtbN) — `mux.sh` needs ffmpeg ≥ 7 |
| `/home/user/.claude/skills/huashu-art-motion` | Huashu skill v1.3.0 (its `scripts/film_gate.py` is the quality gate) |
| `/root/.claude/skills/*` | skills Claude loads: huashu-art-motion, breakdown/graph/map-route/minimalistic-graphics/stick-figure/zach-d-films (symlinks into `/root/claude-animation-skills/skills`), claude-drawing (→ `/root/claude-drawing-skill`), open-video-harness(-web) |
| `/root/OpenVideoHarness` | OpenVideoHarness workbench (`bin/vh`) |
| `/tmp/claude-0/asr/` | ASR venv + `models/sherpa-onnx-whisper-turbo` (optional, re-creatable) |

## Repositories & versions
| Repo | Pin | Install |
|---|---|---|
| github.com/lemomo-ai/lemo-opuscar | `3a7132b` (v2.0.0) | clone to `/home/user/lemomo-ai/lemo-opuscar`, `npm install`, `uv venv .venv && uv pip install -r requirements.txt scikit-image`, `sh plugin/skills/lemo-opuscar/scripts/setup.sh deps` |
| Opuscar plugin (`lemo-opuscar@lemolab`) | 9eb7739 | marketplace `lemomo-ai/lemo-opuscar` — declared in `.claude/settings.json` of this repo |
| github.com/alchaincyf/huashu-art-motion | skill v1.3.0 (upstream `1468196`) | copy `skills/huashu-art-motion` to `~/.claude/skills/` and `/home/user/.claude/skills/` |
| github.com/artemnovitckii/claude-animation-skills | `5dbea55` | clone to `/root/claude-animation-skills`, symlink `skills/*` into `~/.claude/skills/` |
| github.com/cloveric/claude-drawing-skill | `6af36dc` | clone to `/root/claude-drawing-skill`, symlink as `~/.claude/skills/claude-drawing` (83 painting styles) |
| github.com/ZLHad/OpenVideoHarness | main (was `962019b`; keep it on a branch — its installer updates by fast-forward) | `bash install.sh --dir /root/OpenVideoHarness --no-refs` (writes the two skills) |
| BtbN FFmpeg-Builds | n8.1 latest | `ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz` → `/home/user/tools/ffmpeg` |
All of this is automated by `scripts/bootstrap.sh` (idempotent, never overwrites). `scripts/verify.sh` checks it.

## Audio sample libraries (Opuscar `core/audio/instruments`, ~1.3 GB, not in git)
`sh tools/fetch.sh instruments all` from `$LIB` (or a single lib: freepats, salamander (piano), vcsl, vsco2ce, karoryfer).
`sampler.ensure()` also downloads missing libs on first use. Instruments used: hand_chimes, tubular_bells, harp, nepal_bells,
glockenspiel, glass, frame_drum, gong, sus_cymbal, vibraphone_bowed, kalimba, marimba, piano, cellos(_pizz), violas, violins(_trem),
contrabass(_pizz), horn, timpani. Credits line is printed by `S.credits([...])`.

## ASR (optional; only for timing)
`/tmp` is wiped between containers: simply run `bash scripts/bootstrap.sh --asr` again when a new VO arrives (it recreates this).
```bash
uv venv /tmp/claude-0/asr/venv && uv pip install --python /tmp/claude-0/asr/venv/bin/python sherpa-onnx numpy soundfile   # or -r env/freeze_asr_venv.txt for exact pins
mkdir -p /tmp/claude-0/asr/models && cd /tmp/claude-0/asr/models && \
  curl -L -o turbo.tar.bz2 https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2 && tar xf turbo.tar.bz2
```
Scripts: `scripts/helpers/asrwork/` (`phr.py` transcribes phrases; `seg_*.py` segment phrases). Exact pins: `env/freeze_asr_venv.txt`.

## Fonts
Each film carries its own `fonts/` (OFL): Cormorant Garamond (+Italic), Inter Tight (var), Noto Serif Oriya, Cinzel, Marcellus.
Copy from `projects/manabasa/fonts/`. More via npm `@fontsource/*` packages.

## Python venvs
- Opuscar venv `/home/user/lemomo-ai/lemo-opuscar/.venv` (numpy, scipy, soundfile, soxr, pillow, fonttools, scikit-image) — runs `mix.py`,
  `popscan.py`, `contact_sheet.py`. Pins: `env/freeze_opuscar_venv.txt`.
- Huashu gate runs with `uv run` inside the skill dir.

## Secrets
None are needed or stored. Never commit tokens, `.env`, keys. GitHub access comes from the session's GitHub connection.
