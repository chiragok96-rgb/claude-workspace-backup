# Restore & dependency installation (fresh Claude Code cloud environment)

Prereqs available by default in the cloud image: Node >= 20 (tested 22), Python 3 (tested 3.13), `uv`, git, Chromium + Playwright.
Never run these on the owner's local computer.

## 1. One command
```bash
bash scripts/bootstrap.sh
```
It: (a) installs the skill to `~/.claude/skills/huashu-art-motion`, (b) clones Opuscar (pinned commit) to
`~/lemomo-ai/lemo-opuscar`, (c) overlays `opuscar-overlay/films`, (d) copies `projects/*`, `third-party/*` to `~/`,
(e) downloads a static ffmpeg >= 7 to `~/tools/ffmpeg`, (f) `npm ci` + Python venv for Opuscar, (g) puts
`CLAUDE.md` at `~/CLAUDE.md`. Existing files are never overwritten (`cp -n`).

## 2. Manual equivalents
```bash
# Opuscar (public upstream, pinned in MANIFEST.md)
git clone https://github.com/lemomo-ai/lemo-opuscar ~/lemomo-ai/lemo-opuscar
cd ~/lemomo-ai/lemo-opuscar && git checkout 3a7132b996be0241c1ea0ab180d519f06e6f10b6   # v2.0.0, 99 styles
npm install                                   # playwright-core, three@0.170
uv venv .venv && uv pip install --python .venv/bin/python -r requirements.txt scikit-image
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps          # core tier (+ `voice`, `music` if needed)

# ffmpeg >= 7 (mux.sh requires it)
mkdir -p ~/tools && cd ~/tools && curl -L -o ffmpeg.tar.xz \
  https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz
tar xf ffmpeg.tar.xz && mv ffmpeg-n8.1-*-gpl-8.1 ffmpeg && export PATH=~/tools/ffmpeg/bin:$PATH
```
Rendering uses software WebGL: always prefix with `LEMO_ANGLE=swiftshader`.

## 3. Optional heavy tiers (only if needed)
- **ASR / beat alignment** (`scripts/helpers/asrwork/*.py`): `uv venv /tmp/claude-0/asr/venv && uv pip install --python
  /tmp/claude-0/asr/venv/bin/python -r env/freeze_asr_venv.txt`; download the `sherpa-onnx-whisper-turbo` model to
  `/tmp/claude-0/asr/models/` (k2-fsa/sherpa-onnx release assets).
- **Voice/TTS tier**: `env/freeze_tts_venv.txt` is the exact pin list (164 packages); models are re-downloaded by the Opuscar
  `deps voice` step. Skip unless a voiceover must be synthesised.

## 4. Git / GitHub
Connect GitHub at https://claude.ai/connect-github. The skills repo commit `5a1b9ab` (Huashu skill v1.3.0) lives in the
skill directory's own git history in the original workspace; this backup stores its files.
