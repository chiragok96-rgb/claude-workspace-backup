#!/bin/bash
# Helper renderer (incremental): renders frames <first>..<last> in segments of SEG frames and pushes EACH segment as soon as it is done,
# so a session cut off at its time limit loses at most one segment. Re-running the same command resumes: segments already on the branch are skipped.
# usage: bash scripts/tools/render_chunk2.sh <film> <first> <last> <check_frame> <part> <push_branch> [seg=24]
set -uo pipefail
REPO=$(cd "$(dirname "$0")/../.." && pwd)
FILM=$1; F0=$2; F1=$3; CHK=$4; PART=$5; BR=$6; SEG=${7:-24}
SRC=$REPO/render-jobs/$FILM; W=/home/user/render2-$FILM-$PART; PY=/home/user/bpyenv/bin/python; OUT=$REPO/render-out/$FILM/part$PART
fail() { echo "FAILED: $1"; [ -f "$2" ] && tail -20 "$2"; exit 1; }
mkdir -p $W $OUT
if [ ! -x $PY ]; then export PATH=/root/.local/bin:$PATH; uv venv -q --python 3.11 /home/user/bpyenv && uv pip install -q --python $PY bpy==5.0.1 numpy || fail "bpy install" /dev/null; fi
cd $REPO; git fetch -q origin $BR 2>/dev/null && git checkout -q FETCH_HEAD -- render-out/$FILM/part$PART 2>/dev/null   # resume: what is already pushed
push() { cd $REPO; git add render-out/$FILM/part$PART
  git -c user.name="render helper" -c user.email="render-helper@users.noreply.github.com" commit -q -m "render $FILM part $PART: $1 (temporary)" || true
  for i in 1 2 3 4 5; do git push -q origin HEAD:refs/heads/$BR && return 0; sleep $((i * 6)); done; fail "push $1" /dev/null; }
cd $SRC
if [ ! -f $OUT/check.png ]; then
  echo "[$(date +%T)] check frame $CHK"; rm -rf $W/check
  $PY render.py scene.blend $W/check $CHK $CHK 1 100 12 > $W/check.log 2>&1 || fail "check frame" $W/check.log
  cp $W/check/f_$(printf %05d $CHK).png $OUT/check.png; push "check frame"; cd $SRC
fi
for s in $(seq $F0 $SEG $F1); do e=$((s + SEG - 1)); [ $e -gt $F1 ] && e=$F1; S5=$(printf %05d $s)
  [ -f $OUT/seg_$S5.mkv ] && { echo "skip $s-$e (already pushed)"; continue; }
  echo "[$(date +%T)] frames $s-$e"; rm -rf $W/fr
  $PY render.py scene.blend $W/fr $s $e 1 100 12 > $W/render.log 2>&1 || fail "render $s-$e" $W/render.log
  N=$(ls $W/fr | grep -c '^f_.*\.png$'); [ "$N" -eq $((e - s + 1)) ] || fail "only $N frames in $s-$e" $W/render.log
  ffmpeg -loglevel error -y -start_number $s -i $W/fr/f_%05d.png -frames:v $N -c:v libx264rgb -qp 0 -preset slow $OUT/seg_$S5.mkv || fail "pack $s" /dev/null
  tar -cf $OUT/idx_$S5.tar -C $W/fr idx || fail "idx $s" /dev/null
  push "frames $s-$e"; cd $SRC; echo "[$(date +%T)] PUSHED $s-$e"
done
echo "[$(date +%T)] PART $PART COMPLETE ($F0-$F1) on $BR"
