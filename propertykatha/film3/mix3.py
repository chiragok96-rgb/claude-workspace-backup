"""Mix voice + music (ducked under the voice) + sfx.  Writes audio/mix_full.wav, mix_nomusic.wav, mix_voice.wav
(48 kHz stereo, -14 LUFS integrated, true peak <= -1.5 dBTP via ffmpeg limiter + check).
Usage: python3 mix2.py [music_rel_LU=-13] [sfx_rel_LU=-15]"""
import os, sys, subprocess, numpy as np, pyloudnorm as pyln
from scipy.io import wavfile
from scipy.ndimage import uniform_filter1d
HERE = os.path.dirname(os.path.abspath(__file__)); AD = os.path.join(HERE, "audio")
SR = 48000; DUR = 57.16; N = int(SR * DUR)
MREL = float(sys.argv[1]) if len(sys.argv) > 1 else -13.0
SREL = float(sys.argv[2]) if len(sys.argv) > 2 else -15.0
VO = os.path.join(HERE, "..", "inputs", "plot2.mp3")
subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", VO, "-ac", "1", "-ar", str(SR), "-c:a", "pcm_f32le", os.path.join(AD, "vo48.wav")], check=True)
_, v = wavfile.read(os.path.join(AD, "vo48.wav")); v = np.pad(v.astype(np.float64), (0, max(0, N - len(v))))[:N]
_, M = wavfile.read(os.path.join(AD, "music.wav")); M = M.astype(np.float64)
_, S = wavfile.read(os.path.join(AD, "sfx.wav")); S = S.astype(np.float64)
meter = pyln.Meter(SR)
V = np.stack([v, v], 1) * 1.0
lv = meter.integrated_loudness(V)
# sidechain: voice activity envelope -> music gain (duck 7 dB while speaking, smooth)
rms = np.sqrt(uniform_filter1d(v ** 2, int(0.03 * SR)) + 1e-12); act = (20 * np.log10(rms) > -42).astype(float)
act = uniform_filter1d(np.maximum.accumulate(act[::-1])[::-1] * 0 + act, int(0.12 * SR))      # bridge tiny gaps
att, rel = np.exp(-1 / (0.05 * SR)), np.exp(-1 / (0.38 * SR)); g = np.empty(N); y = 0.0
for i in range(N):
    a = act[i]; c = att if a > y else rel; y = c * y + (1 - c) * a; g[i] = y
duck = 10 ** (-7.0 * g / 20)
def setrel(X, rel_lu):
    l = meter.integrated_loudness(X); return X * 10 ** ((lv + rel_lu - l) / 20)
# per-section music levels relative to the voice (dB, measured while the duck is applied) - designed to picture
TARGET = [(0.00, 3.40, -11), (3.40, 5.60, -15), (5.60, 9.40, -12), (9.40, 10.40, -20), (10.40, 13.60, -13), (13.60, 17.30, -12),
          (17.30, 18.70, -10), (18.70, 30.10, -15), (30.10, 43.30, -16), (43.30, 46.60, -13), (46.60, 48.50, -10),
          (48.50, 53.70, -15), (53.70, 57.16, -12)]
vact = v[g > 0.5]; vref = 20 * np.log10(np.sqrt(np.mean(vact ** 2)))
Mx = M * duck[:, None]; gdb = np.zeros(N)
for a0, b0, rel in TARGET:
    sl = slice(int(a0 * SR), int(b0 * SR)); m = 20 * np.log10(np.sqrt(np.mean(Mx[sl] ** 2)) + 1e-9)
    gdb[sl] = np.clip(vref + rel - m, -20, 20)
gdb = uniform_filter1d(gdb, int(0.35 * SR)); gdb[: int(0.2 * SR)] = gdb[int(0.2 * SR)]
Md = Mx * (10 ** (gdb / 20))[:, None]
Ss = setrel(S, SREL)
def finish(X, name):
    l = meter.integrated_loudness(X); X = X * 10 ** ((-13.52 - l) / 20)
    raw = os.path.join(AD, name + "_pre.wav"); wavfile.write(raw, SR, X.astype(np.float32))
    out = os.path.join(AD, name + ".wav")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", raw, "-af", "alimiter=limit=0.79:attack=2:release=80:level=disabled", "-c:a", "pcm_s16le", out], check=True)
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", out, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    I = [l for l in r.splitlines() if l.strip().startswith("I:")][-1].split()[1]; P = [l for l in r.splitlines() if l.strip().startswith("Peak:")][-1].split()[1]
    print(f"{name}: I {I} LUFS, true peak {P} dBTP")
finish(V + Md + Ss, "mix_full"); finish(V + Ss, "mix_nomusic"); finish(V, "mix_voice")
# section report: music vs voice level while speaking / between phrases
def lu(x, a, b):
    s = slice(int(a * SR), int(b * SR)); return 20 * np.log10(np.sqrt(np.mean(x[s] ** 2)) + 1e-9)
print("voice ref (active) %.1f dB" % vref)
for a, b, lab in ((0, 3.3, "hook"), (5.6, 9.4, "burden"), (12, 17, "subsidy"), (19, 29.7, "eligibility"), (30, 43, "checks"), (43.4, 48.4, "dream"), (53.7, 57, "end card")):
    print(f"{lab:11s} voice {lu(V[:,0],a,b):6.1f} dB  music {lu(Md[:,0],a,b):6.1f} dB  sfx {lu(Ss[:,0],a,b):6.1f} dB")
