# Narrator chain: 48 kHz · HPF 70 Hz · warmth (low shelf) · de-box (−380 Hz) · presence (+3 kHz) · gentle compression ·
# soft temple-hall reverb (wet version) · loudness to −16 LUFS, −1.5 dBTP (ffmpeg loudnorm, two-pass).
import numpy as np, soundfile as sf, subprocess, json
from scipy.signal import resample_poly, butter, sosfilt, lfilter, fftconvolve
SR = 48000
y, sr = sf.read('raw_22k.wav'); y = resample_poly(y, 320, 147).astype(np.float64)
def biquad(x, kind, f, g_db=0, q=.707):
    A = 10 ** (g_db / 40); w = 2 * np.pi * f / SR; c, s = np.cos(w), np.sin(w); al = s / (2 * q)
    if kind == 'peak': b = [1 + al * A, -2 * c, 1 - al * A]; a = [1 + al / A, -2 * c, 1 - al / A]
    elif kind == 'low': sq = 2 * np.sqrt(A) * al; b = [A * ((A + 1) - (A - 1) * c + sq), 2 * A * ((A - 1) - (A + 1) * c), A * ((A + 1) - (A - 1) * c - sq)]; a = [(A + 1) + (A - 1) * c + sq, -2 * ((A - 1) + (A + 1) * c), (A + 1) + (A - 1) * c - sq]
    elif kind == 'high': sq = 2 * np.sqrt(A) * al; b = [A * ((A + 1) + (A - 1) * c + sq), -2 * A * ((A - 1) + (A + 1) * c), A * ((A + 1) + (A - 1) * c - sq)]; a = [(A + 1) - (A - 1) * c + sq, 2 * ((A - 1) - (A + 1) * c), (A + 1) - (A - 1) * c - sq]
    return lfilter(np.array(b) / a[0], np.array(a) / a[0], x)
x = sosfilt(butter(2, 70, 'high', fs=SR, output='sos'), y)
x = biquad(x, 'low', 160, 3.5); x = biquad(x, 'peak', 380, -1.8, 1.0); x = biquad(x, 'peak', 3100, 2.2, .9); x = biquad(x, 'high', 8500, -1.5)
# compressor (RMS detector, soft knee-ish): threshold −22 dBFS, 3:1
env = np.sqrt(np.convolve(x ** 2, np.ones(int(.012 * SR)) / int(.012 * SR), 'same')) + 1e-9; lev = 20 * np.log10(env)
over = np.maximum(0, lev - (-22)); gr = -over * (1 - 1 / 3)
k = np.exp(-1 / (.12 * SR)); g = np.zeros_like(gr); prev = 0.0
for i in range(len(gr)):
    prev = gr[i] if gr[i] < prev else k * prev + (1 - k) * gr[i]; g[i] = prev
x = x * 10 ** (g / 20)
sf.write('dry_48k.wav', x.astype(np.float32), SR, subtype='FLOAT')
# temple-hall reverb: a 1.4 s diffuse tail, darkened
R = np.random.default_rng(7); n = int(1.6 * SR); tt = np.arange(n) / SR
tail = R.standard_normal(n) * np.exp(-6.9 * tt / 1.4); tail = sosfilt(butter(2, 4200, 'low', fs=SR, output='sos'), tail)
# no early reflections (they comb-filter consonants); 45 ms pre-delay so every consonant lands dry first; send high-passed at 300 Hz
PD = int(.045 * SR); ir = np.zeros(n + PD); fade = np.minimum(1, np.arange(n) / (.03 * SR)); ir[PD:] = tail * fade / np.abs(tail).max() * .5
send = sosfilt(butter(2, 300, 'high', fs=SR, output='sos'), x)
wet = fftconvolve(send, ir)[:len(x)]; wet *= np.sqrt((x ** 2).mean() / ((wet ** 2).mean() + 1e-12))
hall = x + 10 ** (-17 / 20) * wet
sf.write('hall_48k.wav', hall.astype(np.float32), SR, subtype='FLOAT')
print('chain done', len(x) / SR, 's')
