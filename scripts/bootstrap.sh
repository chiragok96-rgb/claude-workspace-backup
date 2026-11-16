#!/usr/bin/env bash
# Restore the workspace into $HOME. Idempotent. Never overwrites existing files (cp -n). No secrets involved.
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)"; H="${HOME:-/home/user}"
OPUS_COMMIT=3a7132b996be0241c1ea0ab180d519f06e6f10b6
FFMPEG_URL=https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-n8.1-latest-linux64-gpl-8.1.tar.xz
say(){ printf '\n== %s\n' "$*"; }
say "skill";      mkdir -p "$H/.claude/skills"; cp -rn "$SRC/skills/huashu-art-motion" "$H/.claude/skills/"
say "CLAUDE.md";  cp -n "$SRC/CLAUDE.md" "$H/CLAUDE.md" || true
say "opuscar";    mkdir -p "$H/lemomo-ai"
if [ ! -d "$H/lemomo-ai/lemo-opuscar/.git" ]; then git clone https://github.com/lemomo-ai/lemo-opuscar "$H/lemomo-ai/lemo-opuscar"; fi
( cd "$H/lemomo-ai/lemo-opuscar" && git checkout -q "$OPUS_COMMIT" 2>/dev/null || echo "note: could not pin $OPUS_COMMIT; using current HEAD" )
cp -rn "$SRC/opuscar-overlay/films/." "$H/lemomo-ai/lemo-opuscar/films/"
say "projects";   for d in "$SRC"/projects/*/ "$SRC"/third-party/*/; do n=$(basename "$d"); t="$H/$n"; mkdir -p "$t"; cp -rn "$d." "$t/"; done
mkdir -p "$H/inputs" && cp -rn "$SRC/inputs/." "$H/inputs/"
say "ffmpeg>=7";  if [ ! -x "$H/tools/ffmpeg/bin/ffmpeg" ]; then mkdir -p "$H/tools" && ( cd "$H/tools" && curl -fL -o ffmpeg.tar.xz "$FFMPEG_URL" && tar xf ffmpeg.tar.xz && mv ffmpeg-n8.1-*-gpl-8.1 ffmpeg && rm ffmpeg.tar.xz ); fi
say "opuscar deps"; cd "$H/lemomo-ai/lemo-opuscar"; npm install --no-audit --no-fund
[ -d .venv ] || uv venv .venv; uv pip install --python .venv/bin/python -r requirements.txt scikit-image
sh plugin/skills/lemo-opuscar/scripts/setup.sh deps || echo "note: setup.sh deps reported issues (see output)"
say "helpers";    mkdir -p "$H/scripts" && cp -rn "$SRC/scripts/helpers/." "$H/scripts/"
echo; echo "Done. Add to PATH:  export PATH=$H/tools/ffmpeg/bin:\$PATH ; render with LEMO_ANGLE=swiftshader. Next: bash scripts/verify.sh"
