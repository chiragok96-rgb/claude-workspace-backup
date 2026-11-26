#!/bin/bash
# merge every new segment of the given helper branches into FINAL (frames + idx masks); prints one line per merged segment / problem.
# usage: bash scripts/tools/merge2.sh <film> <final_dir> <ref_check_png> <state_dir> <part:branch>...
cd /home/user/claude-workspace-backup; FILM=$1; FINAL=$2; REF=$3; ST=$4; shift 4; mkdir -p $ST $FINAL/idx
export PATH=/home/user/tools/ffmpeg/bin:$PATH; PY=/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python
for pb in "$@"; do P=${pb%%:*}; BR=${pb#*:}
  git fetch -q origin $BR 2>/dev/null || continue
  D=render-out/$FILM/part$P
  if [ ! -f $ST/chk_$P ] && git cat-file -e FETCH_HEAD:$D/check.png 2>/dev/null; then
    git show FETCH_HEAD:$D/check.png > $ST/c.png
    r=$($PY -c "import numpy as n,sys;from PIL import Image as I;a=n.asarray(I.open('$ST/c.png'),n.int16);b=n.asarray(I.open('$REF'),n.int16);print(int(abs(a-b).max()))")
    if [ "$r" = "0" ]; then touch $ST/chk_$P; echo "part $P check OK"; else echo "part $P CHECK MISMATCH max $r"; touch $ST/bad_$P; fi
  fi
  [ -f $ST/chk_$P ] || continue
  for f in $(git ls-tree --name-only FETCH_HEAD $D/ | grep 'seg_'); do s=$(basename $f .mkv); s=${s#seg_}
    [ -f $ST/m_$s ] && continue
    git show FETCH_HEAD:$f > $ST/s.mkv; git show FETCH_HEAD:$D/idx_$s.tar > $ST/i.tar || continue
    ffmpeg -loglevel error -y -i $ST/s.mkv -start_number $((10#$s)) -pix_fmt rgb24 $FINAL/f_%05d.png && tar -xf $ST/i.tar -C $FINAL && touch $ST/m_$s && echo "part $P seg $s merged"
  done
done
