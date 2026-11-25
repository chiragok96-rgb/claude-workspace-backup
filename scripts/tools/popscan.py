import subprocess, sys, numpy as np
f = sys.argv[1]; W, H = 108, 192
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-vf', f'scale={W}:{H}', '-pix_fmt', 'gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
v = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.abs(np.diff(v, axis=0)).mean((1, 2)); n = len(v)
print('frames', n, 'median diff %.2f' % np.median(d))
for i in range(1, len(d) - 1):   # isolated jumps: a frame-to-frame change far bigger than its neighbours'
    nb = max(d[i - 1], d[i + 1], .4)
    if d[i] > 3.0 and d[i] > 3.2 * nb: print('pop at frame %d (t=%.2f): %.2f vs %.2f' % (i + 1, (i + 1) / 30, d[i], nb))
print('loop seam: last->first %.2f (typical %.2f)' % (np.abs(v[-1] - v[0]).mean(), np.median(d)))
print('biggest diffs:', ', '.join('%.2fs=%.1f' % ((i + 1) / 30, d[i]) for i in np.argsort(-d)[:10]))
