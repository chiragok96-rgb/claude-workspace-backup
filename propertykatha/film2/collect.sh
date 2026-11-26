#!/bin/bash
# Fetch a finished helper part (branch render-gate-p<N>) and unpack it into film2/cycles/ (bit-exact PNGs + JSON).
#   bash collect.sh <N>      -> prints frame count and the check-frame comparison vs refcheck/f_01560.png
set -euo pipefail
N="$1"; HERE="$(cd "$(dirname "$0")" && pwd)"; ROOT="$(git -C "$HERE" rev-parse --show-toplevel)"
CY="$HERE/cycles"; mkdir -p "$CY"; W=/tmp/pk_collect_$N; rm -rf "${W:?}"; mkdir -p "$W"
git -C "$ROOT" fetch -q origin "render-gate-p$N"
git -C "$ROOT" archive FETCH_HEAD | tar -x -C "$W"
tar -xf "$W/json.tar" -C "$CY"
CHK=$W/check; mkdir -p "$CHK"
for mkv in "$W"/chunk_*.mkv; do
  lst="${mkv%.mkv}.txt"; T=$W/u; rm -rf "${T:?}"; mkdir -p "$T"
  ffmpeg -loglevel error -i "$mkv" -pix_fmt rgb24 "$T/u_%05d.png"
  i=1
  while read -r f; do
    if [ "$f" = "f_01560.png" ] && [ "$N" != "34" ]; then mv "$T/$(printf u_%05d.png $i)" "$CHK/f_01560.png"
    else mv "$T/$(printf u_%05d.png $i)" "$CY/$f"; fi
    i=$((i + 1))
  done < "$lst"
done
python3 - "$CHK/f_01560.png" "$HERE/refcheck/f_01560.png" "$CY/f_01560.png" <<'EOF'
import sys, os, numpy as np
from PIL import Image
a = sys.argv[1] if os.path.exists(sys.argv[1]) else sys.argv[3]
x = np.asarray(Image.open(a).convert("RGB")).astype(int); y = np.asarray(Image.open(sys.argv[2]).convert("RGB")).astype(int)
d = np.abs(x - y); print("check frame 1560: max diff %d, mean %.4f" % (d.max(), d.mean()))
EOF
echo "part $N unpacked; cycles now holds $(ls "$CY" | grep -c png) frames"
