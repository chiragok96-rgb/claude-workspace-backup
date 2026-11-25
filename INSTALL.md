# Restore & dependency installation (fresh Claude Code cloud environment)

Prereqs available by default in the cloud image: Node >= 20 (tested 22), Python 3 (tested 3.13), `uv`, git, Chromium + Playwright.
Never run these on the owner's local computer.

## 1. One command
```bash
bash scripts/bootstrap.sh [--instruments] [--asr] [--no-extras]
bash scripts/verify.sh --render
```
Important: in the cloud image `HOME=/root` but the work lives in **`/home/user`** (`WORK`, overridable). The script:
(a) installs the Huashu skill to `$HOME/.claude/skills` (loaded by Claude) and `/home/user/.claude/skills` (gate path),
(b) clones the extra skill repos (claude-animation-skills, claude-drawing-skill, OpenVideoHarness) unless `--no-extras`,
(c) writes `~/.claude/settings.json` (Opuscar plugin marketplace) only if none exists, (d) clones Opuscar (pinned) to
`/home/user/lemomo-ai/lemo-opuscar` and overlays `opuscar-overlay/films`, (e) copies `projects/*` and `third-party/*` to `/home/user/<name>`,
(f) downloads static ffmpeg 8.1 to `/home/user/tools/ffmpeg`, (g) `npm install` + Python venv + core deps for Opuscar,
(h) copies helpers/tools to `/home/user/scripts`, (i) optional: `--instruments` (1.3 GB sample libs), `--asr` (Whisper-turbo for timing).
Existing files are never overwritten (`cp -n`). See `memory/04_environment.md` for the full environment description.

## 2. Manual equivalents
```bash
# Opuscar (public upstream, pinned in MANIFEST.md)
git clone https://github.com/lemomo-ai/lemo-opuscar /home/user/lemomo-ai/lemo-opuscar
cd /home/user/lemomo-ai/lemo-opuscar && git checkout 3a7132b996be0241c1ea0ab180d519f06e6f10b6   # v2.0.0, 99 styles
npm install                                   # playwright-core, three@0.170
uv venv .venv && uv pip install --python .venv/bin/python -r requirements.txt scikit-image
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps          # core tier (+ `voice`, `music` if needed)

# ffmpeg >= 7 (mux.sh requires it)
mkdir -p /home/user/tools && cd /home/user/tools && curl -L -o ffmpeg.tar.xz \
  https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz
tar xf ffmpeg.tar.xz && mv ffmpeg-n8.1-*-gpl-8.1 ffmpeg && export PATH=/home/user/tools/ffmpeg/bin:$PATH
```
Rendering uses software WebGL: prefix WebGL pages with `LEMO_ANGLE=swiftshader` (canvas-2D films like Manabasa/Danga don't need it).

## 3. Optional heavy tiers (only if needed)
- **ASR / beat alignment** (`scripts/helpers/asrwork/*.py`): `uv venv /tmp/claude-0/asr/venv && uv pip install --python
  /tmp/claude-0/asr/venv/bin/python -r env/freeze_asr_venv.txt`; download the `sherpa-onnx-whisper-turbo` model to
  `/tmp/claude-0/asr/models/` (k2-fsa/sherpa-onnx release assets).
- **Voice/TTS tier**: `env/freeze_tts_venv.txt` is the exact pin list (164 packages); models are re-downloaded by the Opuscar
  `deps voice` step. Skip unless a voiceover must be synthesised.

## 4. Git / GitHub
Connect GitHub at https://claude.ai/connect-github. The skills repo commit `5a1b9ab` (Huashu skill v1.3.0) lives in the
skill directory's own git history in the original workspace; this backup stores its files.
