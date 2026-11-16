#!/bin/sh
# One command: picture + score/foley/voice → mastered reel and subtitles.
set -e
LIB=${LIB:-/home/user/lemomo-ai/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB LEMO_ANGLE=${LEMO_ANGLE:-swiftshader}
cd "$LIB"
node core/render/events.mjs "$HERE" --size 1080x1920
"$LIB/.venv/bin/python" "$HERE/mix.py"
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --workers ${WORKERS:-4} --out "$HERE/out/video.mp4"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/radha-pada.mp4" 30 1
node -e "import('$HERE/timeline.js').then(m=>require('fs').writeFileSync('$HERE/cues.json',JSON.stringify(m.CAP.map(([t0,t1,s])=>({t0,t1,text:s.replace(/[{}]/g,'')})))))"
"$LIB/.venv/bin/python" core/render/srt.py "$HERE/cues.json" "$HERE/radha-pada.srt"
