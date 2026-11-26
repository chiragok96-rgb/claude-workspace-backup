"""The Dream Home (video 2) - original score + foley, cut to picture (every hit is keyed to an animation event).
Music: sampled instruments (FluidSynth + MuseScore General) + synthesised low-end/risers.  Foley: synthesised.
Writes audio/music.wav and audio/sfx.wav (48 kHz stereo, float32).   Run: python3 score2.py"""
import os, subprocess, numpy as np, mido
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__)); AD = os.path.join(HERE, "audio"); os.makedirs(AD, exist_ok=True)
SR = 48000; DUR = 57.16; N = int(SR * DUR)
SF = "/usr/share/sounds/sf3/MuseScore_General.sf3"
rng = np.random.default_rng(11)

# ============================================================== MIDI score
PROG = {0: 0, 1: 48, 2: 42, 3: 43, 4: 8, 5: 46, 6: 61, 7: 60, 8: 47, 10: 52, 11: 45, 12: 89, 13: 44, 14: 49}
PAN = {0: 60, 1: 50, 2: 74, 3: 64, 4: 84, 5: 40, 6: 64, 7: 56, 8: 64, 10: 64, 11: 80, 12: 64, 13: 46, 14: 70}
EV = []; EVPRE = []                       # (tick, order, msg); EVPRE = everything that stops dead on 'hele' (2.73 s)
STOP = 9.40
TPS = 480                                 # ticks per second (60 bpm, 480 ppq)
def T(s): return int(round(s * TPS))
def note(ch, t, dur, pitches, vel):
    L = EVPRE if t < STOP else EV
    for p in (pitches if isinstance(pitches, (list, tuple)) else [pitches]):
        L.append((T(t), 1, mido.Message('note_on', channel=ch, note=int(p), velocity=int(max(1, min(127, vel))))))
        L.append((T(t + dur), 0, mido.Message('note_off', channel=ch, note=int(p), velocity=0)))
def cc(ch, t, num, val, both=False):
    m = (T(t), 0, mido.Message('control_change', channel=ch, control=num, value=int(max(0, min(127, val)))))
    if both or t >= STOP: EV.append(m)
    if both or t < STOP: EVPRE.append(m)
def ramp(ch, t0, t1, v0, v1, num=11, steps=24):
    for i in range(steps + 1):
        k = i / steps; cc(ch, t0 + (t1 - t0) * k, num, v0 + (v1 - v0) * k)
for ch in PROG:
    for L in (EV, EVPRE): L.append((0, -1, mido.Message('program_change', channel=ch, program=PROG[ch])))
    for num, val in ((7, 100), (10, PAN[ch]), (11, 100), (91, 0), (93, 0)): cc(ch, 0, num, val, both=True)

PNO, STR, VC, CB, CEL, HRP, BRS, HRN, TIM, CHO, PIZ, PAD, TRM, SLW = 0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 14
E8 = 60 / 84 / 2
# 0-3.3 dream: harp follows the gold pen, strings lift the house, celesta as windows light (2.7)
note(PAD, 0.0, 3.6, [50, 57, 62, 66], 46); ramp(PAD, 0.0, 1.0, 50, 100)
for j, p in enumerate((62, 66, 69, 74, 76, 78, 81, 86)): note(HRP, 0.02 + j * 0.22, 1.2, p, 50 + j * 2)
note(PNO, 0.02, 2.2, [74, 78], 60)
note(SLW, 1.75, 2.2, [50, 57, 62, 66], 64); ramp(SLW, 1.75, 3.2, 40, 110)
note(CEL, 2.70, 1.6, [86, 90, 93], 66)
# 3.8-5.6 the turn: soft pulse
for i in range(int(1.8 / E8)): note(PNO, 3.85 + i * E8, E8 * .9, [62, 69][i % 2], 44)
# 5.6-9.4 burden (B minor), thuds on Home Loan 6.35, EMI 7.45, coins 8.3
note(VC, 5.6, 3.8, 35, 70); ramp(VC, 5.6, 9.3, 60, 110); note(PAD, 5.6, 3.8, [35, 47, 54], 48)
note(TIM, 6.35, 1.2, 35, 108); note(PNO, 6.35, 1.6, [23, 35], 100)
note(TIM, 7.45, 1.2, 42, 104); note(PNO, 7.45, 1.4, [30, 42], 96)
note(PNO, 8.30, 1.4, [35, 38, 42], 92); note(CB, 6.35, 3.0, 23, 84)
# 9.4 "kintu": stop. 10.4 the beam: choir + strings in D, coins rise (harp), counter lands 13.7
note(CHO, 10.40, 3.4, [62, 66, 69], 58); ramp(CHO, 10.4, 11.6, 30, 100)
note(STR, 10.40, 3.4, [50, 57, 62, 66], 70); ramp(STR, 10.4, 13.7, 50, 104)
for j, p in enumerate((62, 66, 69, 74, 78, 81, 86, 90)): note(HRP, 10.55 + j * 0.16, 1.0, p, 52)
for j, p in enumerate((74, 76, 78, 81, 83, 86)): note(CEL, 12.2 + j * 0.25, 0.6, p, 50)
note(STR, 13.70, 3.6, [38, 50, 57, 62, 66, 69], 92); note(HRN, 13.7, 2.4, [50, 57, 62], 74)
note(TIM, 13.70, 1.0, 38, 82); note(CEL, 13.72, 2.0, [86, 90], 72); note(PNO, 13.7, 2.4, [26, 38, 50], 90)
# 17.38 PMAY-Urban 2.0
note(TIM, 17.38, 1.0, 43, 88); note(STR, 17.38, 1.5, [43, 55, 59, 62, 67], 84); note(HRN, 17.38, 1.4, [55, 62], 76)
# 18.8-30 eligibility: gentle pulse D - A/C# - Bm - G, ticks on each filled gauge (21.9 24.6 27.2), glow at 27.7
prog = [(18.8, [50, 57, 62], 26), (21.9, [49, 57, 64], 25), (24.6, [47, 54, 59], 23), (27.2, [43, 55, 59], 31)]
for (t0, ch, b), (t1, _, _) in zip(prog, prog[1:] + [(30.1, None, None)]):
    note(STR, t0, t1 - t0, ch, 64); note(CB, t0, t1 - t0, b, 60)
    i = 0; t = t0
    while t < t1 - 0.05: note(PIZ, t, E8 * .8, ch[i % 3] + 12, 44 + (6 if i % 4 == 0 else 0)); t += E8; i += 1
for t0, p in ((21.9, 81), (24.6, 83), (27.2, 86)): note(CEL, t0, 1.2, [p, p + 7], 70)
for j, p in enumerate((62, 66, 69, 74, 78, 81, 86)): note(HRP, 27.7 + j * 0.09, 1.2, p, 56)
note(STR, 27.7, 2.4, [50, 57, 62, 66, 69], 80)
# 30.1-43.3 checks: steady pulse, slight build
prog = [(30.1, [50, 57, 62], 26), (32.7, [47, 54, 59], 23), (35.6, [43, 55, 59], 31), (38.6, [45, 52, 57], 33), (41.0, [50, 57, 62], 26)]
for (t0, ch, b), (t1, _, _) in zip(prog, prog[1:] + [(43.4, None, None)]):
    note(STR, t0, t1 - t0, ch, 58 + int(2 * (t0 - 30))); note(CB, t0, t1 - t0, b, 58)
    i = 0; t = t0
    while t < t1 - 0.05: note(PNO, t, E8 * .9, ch[i % 3] + 12, 40 + (6 if i % 4 == 0 else 0)); t += E8; i += 1
note(CEL, 42.4, 1.2, [86, 93], 66)
# 43.4-48.4 the dream of years: swell G - D/F# - Em - A -> D (46.7)
for chord, t0, t1, b in (([55, 59, 62, 67], 43.4, 44.6, 31), ([54, 57, 62, 66], 44.6, 45.6, 30), ([52, 55, 59, 64], 45.6, 46.7, 28), ([50, 57, 62, 66, 69, 74], 46.7, 48.6, 26)):
    note(STR, t0, t1 - t0, chord, 84); note(CB, t0, t1 - t0, b, 72)
ramp(STR, 43.4, 46.7, 64, 118); note(CHO, 46.7, 2.0, [62, 66, 69], 66); note(HRN, 46.7, 1.8, [50, 57, 62], 80); note(TIM, 46.7, .9, 38, 76)
# 48.6-57.2 CTA: gentle piano, logo sting 53.75, fade
for p, t0 in ((78, 48.6), (76, 49.1), (74, 49.6), (69, 50.1), (71, 50.7), (69, 51.2)): note(PNO, t0, 1.4, p, 56)
note(STR, 48.6, 3.4, [43, 55, 59, 62], 62); note(STR, 52.0, 1.75, [47, 54, 59, 62], 62)
note(CEL, 53.75, 1.6, 81, 78); note(HRP, 53.75, 1.6, 69, 70); note(CEL, 54.05, 3.0, 86, 82); note(HRP, 54.05, 3.0, [74, 62], 72)
note(PNO, 54.05, 3.0, [38, 50, 57, 62], 72); note(STR, 53.75, 3.4, [38, 50, 57, 62, 66, 69], 76); ramp(STR, 54.5, 57.1, 96, 0)
EV.append((T(DUR + 3.0), 2, mido.Message('control_change', channel=0, control=11, value=100)))
def render(events, name):
    mid = mido.MidiFile(ticks_per_beat=480); tr = mido.MidiTrack(); mid.tracks.append(tr)
    tr.append(mido.MetaMessage('set_tempo', tempo=1000000, time=0)); last = 0
    for tick, order, msg in sorted(events, key=lambda e: (e[0], e[1])):
        tr.append(msg.copy(time=tick - last)); last = tick
    mid.save(os.path.join(AD, name + ".mid"))
    subprocess.run(["fluidsynth", "-ni", "-g", "0.45", "-r", str(SR), "-R", "0", "-C", "0", "-F", os.path.join(AD, name + ".wav"), SF,
                    os.path.join(AD, name + ".mid")], check=True, capture_output=True)
    _, w = wavfile.read(os.path.join(AD, name + ".wav")); w = w.astype(np.float32) / 32768.0
    X = np.zeros((N, 2), np.float32); n = min(N, len(w)); X[:n] = w[:n]; return X
EVPRE.append((T(STOP + 1.0), 2, mido.Message('control_change', channel=0, control=11, value=100)))
M = render(EV, "score"); MP = render(EVPRE, "score_pre")
# ============================================================== DSP helpers
def tt(d): return np.arange(int(d * SR)) / SR
def sos(kind, f, o=2): return butter(o, f, kind, fs=SR, output='sos')
def lp(x, f, o=2): return sosfilt(sos('low', f, o), x)
def hp(x, f, o=2): return sosfilt(sos('high', f, o), x)
def bp(x, a, b, o=2): return sosfilt(sos('band', [a, b], o), x)
def noise(d): return rng.standard_normal(int(d * SR))
def addm(sig, t0, g=1.0, pan=0.0): add(MP if t0 < STOP else M, sig, t0, g, pan)
def add(bus, sig, t0, g=1.0, pan=0.0):
    i0 = int(t0 * SR)
    if i0 >= N or len(sig) == 0: return
    if i0 < 0: sig = sig[-i0:]; i0 = 0
    n = min(len(sig), N - i0); l = np.cos((pan + 1) * np.pi / 4) * 1.414; r = np.sin((pan + 1) * np.pi / 4) * 1.414
    bus[i0:i0 + n, 0] += sig[:n] * g * l; bus[i0:i0 + n, 1] += sig[:n] * g * r
def env_ar(d, a, r):
    t = tt(d); return np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1)

# ---- synthesised low end and transitions (music bus) ----
def boom(f0=58, f1=30, d=2.6, drive=1.6):
    t = tt(d); f = f1 + (f0 - f1) * np.exp(-t * 6); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.tanh(np.sin(ph) * drive) * np.exp(-t * 2.2) * np.minimum(1, t / 0.004)
def braam(d=2.4):
    t = tt(d); s = np.zeros_like(t)
    for f, a in ((36.7, 1.0), (55.0, 0.7), (73.4, 0.55), (110.0, 0.3)):
        for det in (-0.4, 0, 0.35):
            ph = 2 * np.pi * (f + det) * t; s += a * (2 * ((ph / (2 * np.pi)) % 1) - 1)
    s = lp(s, 380, 3) * np.exp(-t * 1.5) * np.minimum(1, t / 0.015)
    return np.tanh(s * 0.9)
def riser(d, f0=300, f1=5000, nb=10):
    t = tt(d); x = noise(d); out = np.zeros_like(x)
    for i in range(nb):
        k = i / (nb - 1); fc = f0 * (f1 / f0) ** k
        w = np.exp(-((t / d - k) ** 2) / (2 * 0.12 ** 2))
        out += bp(x, max(40, fc * 0.75), min(20000, fc * 1.3)) * w
    return out * (t / d) ** 1.5
def rev_swell(d, notes=(62, 69, 74), bright=1.0):
    t = tt(d); s = sum(np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * t) for m in notes) / len(notes)
    s += lp(noise(d), 1800) * 0.5 * bright
    return s * (t / d) ** 3
def shimmer(d, notes):
    t = tt(d); s = sum(np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * t + rng.random() * 6) * (1 + 0.3 * np.sin(2 * np.pi * (5 + j) * t))
                       for j, m in enumerate(notes))
    return s / len(notes) * np.sin(np.pi * t / d) ** 2
addm(rev_swell(0.9, (50, 57, 62)), 8.5, 0.12)
addm(boom(56, 30, 2.4), 6.35, 0.5); addm(boom(52, 30, 2.2), 7.45, 0.45); addm(boom(48, 28, 2.6, 1.8), 8.3, 0.4)
addm(rev_swell(1.0, (62, 69, 74), 1.2), 9.4, 0.16)
addm(shimmer(2.4, (86, 90, 93)), 10.4, 0.06); addm(boom(46, 30, 2.4, 1.2), 13.7, 0.3)
addm(shimmer(2.0, (90, 93, 98)), 27.7, 0.05); addm(shimmer(4.0, (86, 90, 93, 98)), 43.4, 0.06); addm(boom(44, 28, 3.0, 1.2), 46.7, 0.3)
addm(shimmer(3.2, (86, 90, 93)), 53.75, 0.05)

# ============================================================== FOLEY (sfx bus)
S = np.zeros((N, 2), np.float32)
from scipy.ndimage import uniform_filter1d
t_all = tt(DUR)
# wind bed: land segments full, paper segment as faint room tone
t_all = tt(DUR)
add(S, lp(noise(DUR), 260) * 0.010, 0, 1, 0)                                        # quiet paper-room air
def whoosh(d, f=900, q=0.8):
    t = tt(d); x = bp(noise(d), f * (1 - q * 0.5), f * (1 + q)); return x * np.sin(np.pi * t / d) ** 2
def paper(d=0.5, f0=2500, f1=7000):
    t = tt(d); x = bp(noise(d), f0, f1) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t) ** 2); return x * np.sin(np.pi * t / d)
def nib(d):
    t = tt(d); x = bp(noise(d), 3000, 9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t) ** 2); return x * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08)

add(S, nib(1.85), 0.02, 0.07, 0.1)                                                 # the gold pen draws
add(S, whoosh(1.5, 500, 0.9), 1.75, 0.12)                                          # the house rises
tg = tt(1.5); add(S, sum(a * np.sin(2 * np.pi * f * tg) * np.exp(-tg * d) for f, a, d in ((1760, 1, 4), (2640, .5, 6))), 2.7, 0.03, 0.3)
add(S, whoosh(0.4, 600, 0.7), 5.95, 0.12); add(S, whoosh(0.4, 600, 0.7), 7.05, 0.12)
ts = tt(0.6); thump = np.sin(2 * np.pi * 62 * ts * (1 + 0.8 * np.exp(-ts * 40))) * np.exp(-ts * 14) + lp(noise(0.6), 1200) * np.exp(-ts * 45) * 0.6
add(S, thump, 6.35, 0.40); add(S, paper(0.3, 1500, 5000), 6.36, 0.10); add(S, thump, 7.45, 0.36); add(S, paper(0.3, 1500, 5000), 7.46, 0.09)
def clink():
    t = tt(0.25); f = 2400 + rng.random() * 2600
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in ((1, 1, 18), (1.52, .6, 24), (2.7, .3, 32)))
for i in range(64): add(S, clink(), 8.28 + rng.random() * 0.5, 0.05, rng.uniform(-0.6, 0.6))
add(S, whoosh(1.2, 3500, 0.9), 10.3, 0.07); add(S, whoosh(1.2, 700, 0.8), 10.5, 0.10, -0.5); add(S, whoosh(1.2, 700, 0.8), 10.6, 0.10, 0.5)
for i in range(18): add(S, clink() * 0.5, 10.6 + rng.random() * 1.2, 0.025, rng.uniform(-0.5, 0.5))
def ssf(a, b, x): y = np.clip((x - a) / (b - a), 0, 1); return y * y * (3 - 2 * y)
tq = np.arange(12.15, 13.75, 1 / SR); v = 1 - (1 - ssf(12.15, 13.7, tq)) ** 3; steps = np.floor(v * 18)
for idx in np.nonzero(np.diff(steps) > 0)[0]:
    c = bp(noise(0.02), 2400, 7000) * np.exp(-tt(0.02) * 320); add(S, c, tq[idx + 1], 0.14, 0.25)
for t0 in (18.8, 19.05, 19.3): add(S, whoosh(0.9, 1200, 0.8), t0, 0.05)
def fillsweep(d):
    t = tt(d); x = noise(d); out = np.zeros_like(x)
    for i in range(8):
        k = i / 7; fc = 300 * (16 ** k); w = np.exp(-((t / d - k) ** 2) / (2 * .14 ** 2)); out += bp(x, fc * .8, fc * 1.25) * w
    return out * np.sin(np.pi * t / d) ** 0.5
for a, b in ((19.6, 21.9), (22.6, 24.6), (25.1, 27.2)): add(S, fillsweep(b - a), a, 0.05)
for t0 in (30.1, 35.6, 36.4): add(S, paper(0.8), t0, 0.10, rng.uniform(-0.4, 0.4))
add(S, nib(1.0), 30.6, 0.07, 0.2); add(S, nib(1.2), 33.2, 0.07, 0.2)
for t0 in (41.40, 41.90, 42.40): add(S, bp(noise(0.03), 2000, 7000) * np.exp(-tt(0.03) * 200), t0, 0.10, -0.3)
add(S, nib(1.3), 41.3, 0.06, 0.3)
add(S, whoosh(4.0, 3000, 0.9), 43.4, 0.06)
add(S, whoosh(0.5, 2200, 0.8), 52.0, 0.07, 0.5)

# ============================================================== space (convolution reverb) + write
def ir(rt=2.6, d=3.2, damp=5000):
    t = tt(d); tau = rt / 6.91; L = []
    for s in (3, 4):
        x = np.random.default_rng(s).standard_normal(len(t)) * np.exp(-t / tau)
        x = lp(x, damp) * 0.6 + x * 0.4 * np.exp(-t / (tau * 0.4)); x[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))
        L.append(x / np.sqrt(np.sum(x ** 2)))
    return np.stack(L, 1)
IR = ir()
def verb(x, wet):
    y = np.stack([fftconvolve(x[:, 0], IR[:, 0])[:N], fftconvolve(x[:, 1], IR[:, 1])[:N]], 1)
    return x * (1 - wet * 0.3) + y * wet
M = verb(M, 0.38); MP = verb(MP, 0.38); S = verb(S, 0.16)
# the stop on "hele": pre-stop music cuts in 25 ms to -20 dB, then its room tail dies within 0.3 s
ts = np.arange(N) / SR; cut = np.ones(N)
k = ts >= STOP; cut[k] = 0.1 * np.exp(-(ts[k] - STOP) / 0.09); k2 = (ts >= STOP) & (ts < STOP + 0.025)
cut[k2] = np.linspace(1, 0.1, k2.sum())
M = M + MP * cut[:, None]
# master fades: start clean, end silent for the loop
fo = np.ones(N); k = int(0.5 * SR); fo[-k:] = np.linspace(1, 0, k) ** 2
M *= fo[:, None]; S *= fo[:, None]
for name, X in (("music", M), ("sfx", S)):
    wavfile.write(os.path.join(AD, name + ".wav"), SR, X.astype(np.float32))
print("peaks music %.2f sfx %.2f" % (np.abs(M).max(), np.abs(S).max()))
