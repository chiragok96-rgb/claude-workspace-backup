#!/bin/sh
# Render the film in fresh-browser chunks (long single sessions exhaust the GPU canvas memory), then join them frame-exact.
set -e
OUT=/home/user/bj-wind/out; LIB=/home/user/lemomo-ai/lemo-opuscar; export PATH=/home/user/tools/ffmpeg/bin:$PATH
cd $LIB; rm -f $OUT/chunk_*.mp4 $OUT/chunks.txt
i=0
for r in "0 8.4" "8.4 16.8" "16.8 25.2" "25.2 33.6" "33.6 42" "42 50.2"; do
  set -- $r; f=$(printf "%s/chunk_%02d.mp4" $OUT $i)
  node core/render/video.mjs /home/user/bj-wind --fps 30 --size 1080x1920 --workers 2 --q "from=$1&to=$2" --out $f > $OUT/chunk_$i.log 2>&1 || { echo "chunk $i failed"; tail -3 $OUT/chunk_$i.log; exit 1; }
  echo "file '$f'" >> $OUT/chunks.txt; echo "chunk $i done: $(tail -1 $OUT/chunk_$i.log)"; i=$((i+1))
done
ffmpeg -v error -y -f concat -safe 0 -i $OUT/chunks.txt -c copy $OUT/film_v1.mp4 && ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $OUT/film_v1.mp4
