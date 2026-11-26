#!/bin/bash
# Video 2 final: grade + captions on all frames, pop scan, encode deliverables + cover.
set -euo pipefail; D="$(cd "$(dirname "$0")" && pwd)"; cd "$D"; OUT="$D/../deliverables"
n=$(ls frames | grep -c png); echo "frames: $n"; [ "$n" = "1715" ] || exit 1
python3 cap3.py frames final x
python3 - <<'PY'
import numpy as np
from PIL import Image
d=[];prev=None
for f in range(1715):
    a=np.asarray(Image.open('final/f_%05d.jpg'%f).resize((270,480))).astype(np.float32)
    if prev is not None: d.append(np.abs(a-prev).mean())
    prev=a
d=np.array(d);med=np.array([np.median(d[max(0,i-8):i+9]) for i in range(len(d))])
print('pop candidates:',[(i+1,round(float(d[i]),1)) for i in range(len(d)) if d[i]>max(6,3.2*med[i])])
PY
ffmpeg -loglevel error -y -framerate 30 -i final/f_%05d.jpg -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p -movflags +faststart -an v.mp4
for k in full:PropertyKatha_DreamHome nomusic:PropertyKatha_DreamHome_NoMusic voice:PropertyKatha_DreamHome_VoiceOnly; do a=${k%%:*}; n=${k##*:}
  ffmpeg -loglevel error -y -i v.mp4 -i "audio/mix_$a.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT/$n.mp4"; done
cp final/f_00450.jpg "$OUT/PropertyKatha_DreamHome_cover.jpg"; ls -la "$OUT"/*DreamHome*
