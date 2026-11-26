#!/bin/bash
# Orchestrator side: fetch a helper's part, unpack its lossless segments into <film>/final, and verify its check frame.
# usage: bash scripts/tools/merge_chunk.sh <film> <part> <branch> <final_dir>
set -euo pipefail
FILM=$1; PART=$2; BR=$3; FINAL=$4
REPO=/home/user/claude-workspace-backup; T=/home/user/render-in/$FILM/part$PART; rm -rf $T; mkdir -p $T
cd $REPO; for i in 1 2 3 4; do git fetch -q origin $BR && break; sleep $((i * 4)); done
git archive FETCH_HEAD render-out/$FILM/part$PART | tar -x -C $T
D=$T/render-out/$FILM/part$PART
for m in $D/seg_*.mkv; do s=$(basename $m .mkv); s=$((10#${s#seg_}))
  ffmpeg -loglevel error -y -i $m -start_number $s -pix_fmt rgb24 $T/f_%05d.png; done
python3 - "$D" "$FINAL" "$T" <<'PY'
import sys, os, glob, numpy as np; from PIL import Image
D, FINAL, T = sys.argv[1:]
for c in glob.glob(D + '/f_*.png'):
    ref = os.path.join(FINAL, os.path.basename(c))
    if os.path.exists(ref):
        a = np.asarray(Image.open(c).convert('RGB')).astype(int); b = np.asarray(Image.open(ref).convert('RGB')).astype(int)
        d = abs(a - b); print('check', os.path.basename(c), 'max diff', d.max(), 'mean', round(d.mean(), 4))
fr = sorted(glob.glob(T + '/f_*.png')); print('unpacked', len(fr), os.path.basename(fr[0]), '-', os.path.basename(fr[-1]))
PY
