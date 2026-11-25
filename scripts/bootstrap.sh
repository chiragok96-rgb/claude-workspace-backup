#!/usr/bin/env bash
# Restore the film workspace from this repo. Idempotent. Never overwrites existing files (cp -n / skips existing clones).
# No secrets involved. Usage:  bash scripts/bootstrap.sh [--instruments] [--asr] [--no-extras]
#   WORK  (default /home/user) : where films, Opuscar, ffmpeg live (the cloud image keeps work under /home/user while HOME=/root)
#   HOME  (default /root)      : where Claude Code loads skills/settings from (~/.claude)
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"; WORK="${WORK:-/home/user}"; H="${HOME:-/root}"
OPUS_COMMIT=3a7132b996be0241c1ea0ab180d519f06e6f10b6
FFMPEG_URL=https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz
ASR_URL=https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-turbo.tar.bz2
INSTR=0; ASR=0; EXTRAS=1
for a in "$@"; do case "$a" in --instruments) INSTR=1 ;; --asr) ASR=1 ;; --no-extras) EXTRAS=0 ;; *) echo "unknown option $a"; exit 1 ;; esac; done
say(){ printf '\n== %s\n' "$*"; }
cpn(){ cp -rn "$@" 2>/dev/null || cp -r --update=none "$@"; }   # copy without overwriting (old and new coreutils)
clone(){ # url dir commit
  if [ ! -d "$2/.git" ]; then git clone -q "$1" "$2"; fi
  [ -n "${3:-}" ] && ( cd "$2" && git checkout -q "$3" 2>/dev/null || echo "note: could not pin $2 to $3; using current HEAD" ) || true; }

say "skill: huashu-art-motion (loaded from \$HOME, scripts used from $WORK)"
for d in "$H/.claude/skills" "$WORK/.claude/skills"; do mkdir -p "$d"; [ -e "$d/huashu-art-motion" ] || cpn "$SRC/skills/huashu-art-motion" "$d/"; done

say "plugin settings (lemo-opuscar marketplace) — only if no user settings exist"
mkdir -p "$H/.claude"; [ -f "$H/.claude/settings.json" ] || cp "$SRC/env/user-settings.json" "$H/.claude/settings.json"

say "opuscar @ $OPUS_COMMIT -> $WORK/lemomo-ai/lemo-opuscar"
mkdir -p "$WORK/lemomo-ai"; clone https://github.com/lemomo-ai/lemo-opuscar "$WORK/lemomo-ai/lemo-opuscar" "$OPUS_COMMIT"
mkdir -p "$WORK/lemomo-ai/lemo-opuscar/films"; cpn "$SRC/opuscar-overlay/films/." "$WORK/lemomo-ai/lemo-opuscar/films/"

say "film projects + third-party copies -> $WORK/<name>"
for d in "$SRC"/projects/*/ "$SRC"/third-party/*/; do n=$(basename "$d"); mkdir -p "$WORK/$n"; cpn "$d." "$WORK/$n/"; done
mkdir -p "$WORK/inputs" && cpn "$SRC/inputs/." "$WORK/inputs/"

say "ffmpeg >= 7 -> $WORK/tools/ffmpeg"
if [ ! -x "$WORK/tools/ffmpeg/bin/ffmpeg" ]; then mkdir -p "$WORK/tools" && ( cd "$WORK/tools" && curl -fsSL -o ffmpeg.tar.xz "$FFMPEG_URL" && tar xf ffmpeg.tar.xz && mv ffmpeg-n8.1-*-gpl-8.1 ffmpeg && rm ffmpeg.tar.xz ); fi
export PATH="$WORK/tools/ffmpeg/bin:$PATH"

if [ $EXTRAS = 1 ]; then
  say "extra skill repos (animation skills, claude-drawing, OpenVideoHarness)"
  clone https://github.com/artemnovitckii/claude-animation-skills "$H/claude-animation-skills" 5dbea55 || echo "note: animation skills not cloned"
  for s in "$H"/claude-animation-skills/skills/*/; do n=$(basename "$s"); [ -e "$H/.claude/skills/$n" ] || ln -s "${s%/}" "$H/.claude/skills/$n"; done 2>/dev/null || true
  clone https://github.com/cloveric/claude-drawing-skill "$H/claude-drawing-skill" 6af36dc || echo "note: claude-drawing not cloned"
  [ -e "$H/.claude/skills/claude-drawing" ] || ln -s "$H/claude-drawing-skill" "$H/.claude/skills/claude-drawing" 2>/dev/null || true
  if [ ! -d "$H/OpenVideoHarness/.git" ]; then
    git clone -q https://github.com/ZLHad/OpenVideoHarness "$H/OpenVideoHarness" && ( cd "$H/OpenVideoHarness" && git checkout -q 962019b 2>/dev/null; \
      PATH="$WORK/tools/ffmpeg/bin:$PATH" bash install.sh --dir "$H/OpenVideoHarness" --no-refs >/dev/null 2>&1 || echo "note: OVH install.sh reported issues (needs ffmpeg on PATH; re-run after ffmpeg)" ) || echo "note: OVH not cloned"
  fi
fi


say "opuscar deps (npm, venv, core tier)"
cd "$WORK/lemomo-ai/lemo-opuscar"; npm install --no-audit --no-fund --loglevel=error
[ -d .venv ] || uv venv -q .venv; uv pip install -q --python .venv/bin/python -r requirements.txt scikit-image
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps >/dev/null 2>&1 || echo "note: setup.sh deps reported issues (rendering may still work; see verify.sh)"
if [ $INSTR = 1 ]; then say "instrument sample libraries (~1.3 GB)"; sh tools/fetch.sh instruments all; fi

say "helper scripts -> $WORK/scripts"
mkdir -p "$WORK/scripts"; cpn "$SRC/scripts/helpers/." "$WORK/scripts/"; cpn "$SRC/scripts/tools/." "$WORK/scripts/"

if [ $ASR = 1 ]; then
  say "ASR (sherpa-onnx whisper-turbo) -> /tmp/claude-0/asr"
  A=/tmp/claude-0/asr; mkdir -p "$A/models" /tmp/claude-0/asrwork; cpn "$SRC/scripts/helpers/asrwork/." /tmp/claude-0/asrwork/
  [ -x "$A/venv/bin/python" ] || { uv venv -q "$A/venv" && uv pip install -q --python "$A/venv/bin/python" sherpa-onnx numpy soundfile; }
  [ -d "$A/models/sherpa-onnx-whisper-turbo" ] || ( cd "$A/models" && curl -fsSL -o turbo.tar.bz2 "$ASR_URL" && tar xf turbo.tar.bz2 && rm turbo.tar.bz2 )
fi
echo; echo "Done. export PATH=$WORK/tools/ffmpeg/bin:\$PATH   (WebGL pages: LEMO_ANGLE=swiftshader). Next: bash $SRC/scripts/verify.sh"
