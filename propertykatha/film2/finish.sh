#!/bin/bash
# Final assembly for The Gate v2: composite all frames, pop-scan, encode deliverables + cover.
# Run from anywhere once film2/cycles holds frames 0-587 and 1290-1666.
set -euo pipefail
D="$(cd "$(dirname "$0")" && pwd)"; cd "$D"
OUT="$D/../deliverables"; mkdir -p final
miss=$(python3 -c "
import os
need=list(range(0,588))+list(range(1290,1667))
print(sum(not os.path.exists('cycles/f_%05d.png'%f) for f in need))")
echo "missing cycles frames: $miss"; [ "$miss" = "0" ] || exit 1
python3 compose.py final 0-1666 --workers 4
# pop scan: mean abs diff between consecutive frames, flag spikes vs local median
python3 - <<'EOF'
import numpy as np
from PIL import Image
d=[]; prev=None
for f in range(1667):
    a=np.asarray(Image.open('final/f_%05d.jpg'%f).resize((270,480))).astype(np.float32)
    if prev is not None: d.append(np.abs(a-prev).mean())
    prev=a
d=np.array(d); med=np.array([np.median(d[max(0,i-8):i+9]) for i in range(len(d))])
bad=[(i+1,round(float(d[i]),1),round(float(med[i]),1)) for i in range(len(d)) if d[i]>max(6,3.2*med[i])]
print('pop candidates (frame, diff, local median):',bad)
EOF
V=final_video_noaudio.mp4
ffmpeg -loglevel error -y -framerate 30 -i final/f_%05d.jpg -c:v libx264 -preset slow -b:v 9M -maxrate 12M -bufsize 18M -pix_fmt yuv420p -movflags +faststart -an "$V"
for k in full:PropertyKatha_TheGate_v2 nomusic:PropertyKatha_TheGate_v2_NoMusic voice:PropertyKatha_TheGate_v2_VoiceOnly; do
  a=${k%%:*}; n=${k##*:}
  ffmpeg -loglevel error -y -i "$V" -i "audio/mix_$a.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart "$OUT/$n.mp4"
done
cp final/f_00270.jpg "$OUT/PropertyKatha_TheGate_v2_cover.jpg"
ls -la "$OUT"/*v2*
