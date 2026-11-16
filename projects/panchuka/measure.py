# Measures the performance against the direction: stressed-word pitch vs target, end contours, pauses.
import json, re, sys, numpy as np, soundfile as sf, pyworld as pw
sys.path.insert(0, '/home/user/panchuka'); from direct import SCORE
import voice as V
y, sr = sf.read(sys.argv[1] if len(sys.argv) > 1 else 'raw_22k.wav'); x = y.astype(np.float64)
f0, t = pw.harvest(x, sr, f0_floor=55, f0_ceil=350, frame_period=5); f0 = pw.stonemask(x, f0, t, sr)
W = json.load(open('words.json')); st = lambda hz: 12 * np.log2(hz / 100.0)
def pitch(a, b): m = (t >= a) & (t <= b) & (f0 > 0); return np.median(f0[m]) if m.sum() > 2 else np.nan
print('narrator median %.0f Hz' % np.median(f0[f0 > 0])); errs = []
for i, L in enumerate(SCORE):
    ws = [w for w in W['words'] if w['line'] == i]; ref = pitch(ws[0]['start'], ws[-1]['end']); out = []
    for e in L.get('emph', []):
        if e[1] is None: continue
        key = V.norm_text(e[0]).split(); cand = [k for k in range(len(ws)) if ws[k]['word'].rstrip(',।?') == key[0]]
        if not cand: out.append('%s ?' % e[0]); continue
        k = cand[0]; a, b = ws[k]['start'], ws[k + len(key) - 1]['end']; m = st(pitch(a, b)) - st(ref)
        out.append('%s %+.1f/%+.1f' % (e[0], m, e[1])); errs.append(abs(m - e[1]))
    if L.get('end'):
        lw = ws[-1]; m = (t >= lw['start']) & (t <= lw['end']) & (f0 > 0); s = f0[m]; n = len(s)
        if n > 6: out.append('end %s %+.1f→%+.1f (asked %+.1f→%+.1f)' % (L['end'][0], st(np.median(s[:n // 3])) - st(ref), st(np.median(s[-n // 3:])) - st(ref), L['end'][1], L['end'][2]))
    print('%2d %3.0fHz  %s' % (i, ref, ' · '.join(out)))
print('stress error: mean %.1f st, worst %.1f st' % (np.mean(errs), np.max(errs)))
e = np.convolve(y ** 2, np.ones(256) / 256, 'same'); db = 10 * np.log10(e + 1e-12); sil = db < db.max() - 42; gaps = []; i = 0
while i < len(sil):
    if sil[i]:
        j = i
        while j < len(sil) and sil[j]: j += 1
        if (j - i) / sr > .15: gaps.append((i / sr, (j - i) / sr))
        i = j
    else: i += 1
print('pauses:', ' '.join('%.2f' % d for a, d in gaps))
