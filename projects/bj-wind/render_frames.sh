#!/bin/bash
# Render every frame with the still renderer in short batches (fresh browser each), 3 in parallel; then encode the sequence.
OUT=/home/user/bj-wind/out; FR=$OUT/frames; LIB=/home/user/lemomo-ai/lemo-opuscar; export PATH=/home/user/tools/ffmpeg/bin:$PATH
FPS=30; TOTAL=${TOTAL:-1506}; B=170
mkdir -p $FR; cd $LIB
batch() { local a=$1 b=$2 tries=0
  while :; do
    local T=""; for ((f=a; f<b; f++)); do [ -s $FR/t_$(printf %06d $f).jpg ] || T="$T $(python3 -c "print('%.6f'%($f/$FPS))")"; done
    [ -z "$T" ] && return 0
    node core/render/still.mjs /home/user/bj-wind $T --size 1080x1920 --prefix x_ --out $FR/b$a > /dev/null 2>&1
    for p in $FR/b$a/x_*.jpg; do [ -e "$p" ] || continue; t=$(basename $p .jpg); t=${t#x_}; f=$(python3 -c "print(round($t*$FPS))"); mv $p $FR/t_$(printf %06d $f).jpg; done
    tries=$((tries+1)); [ $tries -gt 6 ] && { echo "batch $a stuck"; return 1; }
  done; }
pids=(); for ((a=0; a<TOTAL; a+=B)); do b=$((a+B)); [ $b -gt $TOTAL ] && b=$TOTAL; batch $a $b & pids+=($!); while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 2; done; done; wait
n=$(ls $FR/t_*.jpg | wc -l); echo "frames $n / $TOTAL"
[ $n -eq $TOTAL ] && ffmpeg -v error -y -framerate $FPS -i $FR/t_%06d.jpg -c:v libx264 -preset medium -crf 14 -pix_fmt yuv420p $OUT/film_v1.mp4 && echo encoded
