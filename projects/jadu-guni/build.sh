#!/bin/sh
# One command: picture → master with the song (the only audio).
set -e
LIB=${LIB:-/home/user/lemomo-ai/lemo-opuscar}
HERE=$(cd "$(dirname "$0")" && pwd)
export LIB LEMO_ANGLE=${LEMO_ANGLE:-swiftshader}
cd "$LIB"
node core/render/video.mjs "$HERE" --fps 30 --size 1080x1920 --workers ${WORKERS:-3} --out "$HERE/out/video.mp4"
mkdir -p "$HERE/out"
ffmpeg -v error -y -i "$HERE/audio/song.mp3" -ar 48000 -ac 2 "$HERE/out/mix.wav"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/jadu-guni.mp4" 30 0
