#!/bin/bash
# Helper-session renderer: render one contiguous block of a film's frames, pack it losslessly, push it to a temp branch.
# usage: bash scripts/tools/render_chunk.sh <film> <first> <last> <check_frame> <part> <push_branch>
# Needs render-jobs/<film>/{scene.blend,render.py}. Output: render-out/<film>/part<N>/seg_*.mkv (libx264rgb -qp 0, bit-exact RGB) + check frame.
set -euo pipefail
REPO=$(cd "$(dirname "$0")/../.." && pwd)
FILM=$1; F0=$2; F1=$3; CHK=$4; PART=$5; BR=$6
SRC=$REPO/render-jobs/$FILM; W=/home/user/render-$FILM; PY=/home/user/bpyenv/bin/python
mkdir -p $W/frames $W/check
if [ ! -x $PY ]; then export PATH=/root/.local/bin:$PATH; uv venv -q --python 3.11 /home/user/bpyenv; uv pip install -q --python $PY bpy==5.0.1 numpy; fi
cd $SRC
echo "[$(date +%T)] check frame $CHK"
$PY render.py scene.blend $W/check $CHK $CHK 1 100 12 > $W/check.log 2>&1
echo "[$(date +%T)] frames $F0-$F1"
$PY render.py scene.blend $W/frames $F0 $F1 1 100 12 > $W/render.log 2>&1 || { tail -20 $W/render.log; exit 1; }
grep -q "ALL DONE" $W/render.log
N=$(ls $W/frames | grep -c '^f_.*\.png$'); [ "$N" -eq $((F1 - F0 + 1)) ] || { echo "only $N frames"; exit 1; }
echo "[$(date +%T)] packing"
OUT=$REPO/render-out/$FILM/part$PART; rm -rf $OUT; mkdir -p $OUT
for s in $(seq $F0 60 $F1); do e=$((s + 59)); [ $e -gt $F1 ] && e=$F1
  ffmpeg -loglevel error -y -start_number $s -i $W/frames/f_%05d.png -frames:v $((e - s + 1)) -c:v libx264rgb -qp 0 -preset slow $OUT/seg_$(printf %05d $s).mkv
done
cp $W/check/f_*.png $OUT/
[ -d $W/frames/idx ] && tar -cf $OUT/idx.tar -C $W/frames idx   # per-frame label masks (object index)
cd $REPO; git add render-out/$FILM/part$PART
git -c user.name="render helper" -c user.email="render-helper@users.noreply.github.com" commit -q -m "render $FILM part $PART: frames $F0-$F1 (temporary)"
for i in 1 2 3 4; do git push -q origin HEAD:refs/heads/$BR && break; sleep $((i * 5)); done
echo "[$(date +%T)] PUSHED part $PART ($N frames) to $BR"
