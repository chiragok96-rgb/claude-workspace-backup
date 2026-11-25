#!/usr/bin/env bash
# Check that the restored workspace is complete and usable. WORK (default /home/user) as in bootstrap.sh.
# Usage: bash scripts/verify.sh [--render]   (--render also renders one Manabasa frame and runs the mix's imports)
W="${WORK:-/home/user}"; H="${HOME:-/root}"; L="$W/lemomo-ai/lemo-opuscar"; ok=1
chk(){ if eval "$2" >/dev/null 2>&1; then echo "ok   $1"; else echo "FAIL $1"; ok=0; fi; }
chk "memory files (CLAUDE.md + memory/)"   "[ -f $(dirname "$0")/../CLAUDE.md ] && [ -f $(dirname "$0")/../memory/README.md ]"
chk "skill huashu-art-motion (loaded)"     "[ -f $H/.claude/skills/huashu-art-motion/SKILL.md ]"
chk "huashu gate script"                   "[ -f $W/.claude/skills/huashu-art-motion/scripts/film_gate.py ]"
chk "opuscar clone"                        "[ -f $L/AGENTS.md ]"
chk "opuscar renderer"                     "[ -f $L/core/render/video.mjs ] && [ -f $L/core/render/still.mjs ] && [ -f $L/core/render/mux.sh ]"
chk "film bali-rap (opuscar overlay)"      "[ -f $L/films/bali-rap/film.js ]"
chk "project manabasa"                     "[ -f $W/manabasa/film.js ] && [ -f $W/manabasa/sc_flow.js ] && [ -f $W/manabasa/audio/vo.wav ]"
chk "project danga"                        "[ -f $W/danga/film.js ] && [ -f $W/danga/mix.py ]"
chk "project bj-wind / balijatra-vo"       "[ -f $W/bj-wind/film.js ] && [ -f $W/balijatra-vo/film.js ]"
chk "node >= 20"                           "node -e 'process.exit(+process.versions.node.split(\".\")[0]>=20?0:1)'"
chk "ffmpeg >= 7"                          "$W/tools/ffmpeg/bin/ffmpeg -version | head -1 | grep -E 'version (n?[7-9]|n?[1-9][0-9])'"
chk "three installed"                      "[ -d $L/node_modules/three ]"
chk "opuscar venv (numpy/scipy/soundfile)" "$L/.venv/bin/python -c 'import numpy, scipy, soundfile, PIL'"
chk "tools popscan/contact_sheet"          "[ -f $W/scripts/popscan.py ] && [ -f $W/scripts/contact_sheet.py ]"
[ -d $L/core/audio/instruments/salamander ] && echo "ok   instrument libraries present" || echo "note instrument libraries not downloaded yet (bootstrap --instruments, or sampler downloads on first use)"
[ -d /tmp/claude-0/asr/models/sherpa-onnx-whisper-turbo ] && echo "ok   ASR model present" || echo "note ASR not installed (bootstrap --asr; only needed for timing)"
if [ "${1:-}" = "--render" ]; then
  T=$(mktemp -d); ( cd $L && node core/render/still.mjs $W/manabasa 20.0 --size 1080x1920 --out $T >/dev/null 2>&1 ); chk "render a Manabasa still" "ls $T/*.jpg"
  chk "mix.py imports (sampler, sfx)" "cd $L && .venv/bin/python -c 'import sys; sys.path.insert(0,\"core/audio\"); import sampler, sfx'"
fi
[ $ok = 1 ] && echo "ALL GOOD" || { echo "SOME CHECKS FAILED"; exit 1; }
