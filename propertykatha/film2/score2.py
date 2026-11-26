"""The Gate v2 - original score + foley, cut to picture (every hit is keyed to an animation event).
Music: sampled instruments (FluidSynth + MuseScore General) + synthesised low-end/risers.  Foley: synthesised.
Writes audio/music.wav and audio/sfx.wav (48 kHz stereo, float32).   Run: python3 score2.py"""
import os, subprocess, numpy as np, mido
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

HERE = os.path.dirname(os.path.abspath(__file__)); AD = os.path.join(HERE, "audio"); os.makedirs(AD, exist_ok=True)
SR = 48000; DUR = 55.56; N = int(SR * DUR)
SF = "/usr/share/sounds/sf3/MuseScore_General.sf3"
rng = np.random.default_rng(11)

# ============================================================== MIDI score
PROG = {0: 0, 1: 48, 2: 42, 3: 43, 4: 8, 5: 46, 6: 61, 7: 60, 8: 47, 10: 52, 11: 45, 12: 89, 13: 44, 14: 49}
PAN = {0: 60, 1: 50, 2: 74, 3: 64, 4: 84, 5: 40, 6: 64, 7: 56, 8: 64, 10: 64, 11: 80, 12: 64, 13: 46, 14: 70}
EV = []; EVPRE = []                       # (tick, order, msg); EVPRE = everything that stops dead on 'hele' (2.73 s)
STOP = 2.73
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
E8 = 60 / 92 / 2                          # eighth note at 92 bpm

# ---- 0.00-2.73  HOOK: tremolo strings + pizzicato pulse in D minor, price lands at 1.45 ----
note(TRM, 0.0, 2.73, [38, 45, 50], 92); ramp(TRM, 0.0, 2.6, 60, 118)
note(PNO, 0.02, 1.6, [69, 74], 74)
pat = [50, 57, 62, 57, 53, 57, 62, 57]
for i in range(int(2.70 / E8)):
    note(PIZ, i * E8, E8 * 0.9, pat[i % 8], 58 + i * 2)
note(TIM, 1.45, 1.2, 38, 98); note(PNO, 1.45, 1.25, [26, 38, 50], 96); note(CB, 1.45, 1.25, 26, 90)
note(CEL, 1.47, 1.0, [81, 86], 62)
# hard stop on "hele" at 2.73 (everything above ends exactly there)

# ---- 2.75-4.65  TIME-LAPSE: racing celesta, low drone ----
note(PAD, 2.76, 2.2, [38, 45], 52)
t = 2.80; k = 0; arp = [62, 65, 69, 74, 77, 81, 86, 81, 77, 74, 69, 65]
while t < 4.62:
    note(CEL, t, 0.25, arp[k % len(arp)], 40 + min(30, k)); t += max(0.055, 0.15 - 0.055 * (t - 2.8)); k += 1

# ---- 4.83-6.43  BUILD: cello sixteenths on D, tremolo crescendo into the slam ----
s16 = 60 / 92 / 4; t = 4.83; i = 0
while t < 6.40:
    note(VC, t, s16 * 0.85, 38 if i % 4 else 38, 70 + int(40 * (t - 4.83) / 1.6)); t += s16; i += 1
note(CB, 4.83, 1.6, 26, 80); note(TRM, 4.83, 1.6, [38, 45, 50, 53], 80); ramp(TRM, 4.83, 6.40, 50, 124)

# ---- 6.43  SLAM: braam (brass + horns + timpani + contrabass), then dark drone ----
note(BRS, 6.43, 1.7, [26, 33, 38, 45], 127); note(HRN, 6.43, 1.9, [38, 45, 50], 118)
note(TIM, 6.43, 1.5, [38, 33], 127); note(CB, 6.43, 3.0, 26, 110); note(PNO, 6.43, 2.5, [26, 33, 38], 110)
note(PAD, 7.0, 4.2, [26, 38, 45, 50], 58); ramp(PAD, 7.0, 8.0, 40, 100)
# board line (9.2-10.5): cello D -> C# (tension)
note(VC, 9.15, 0.75, 50, 72); note(VC, 9.9, 1.1, 49, 70)

# ---- 10.96 "he wasn't wrong": sparse piano motif ----
for p, t0, v in ((69, 10.96, 64), (65, 11.36, 58), (62, 11.76, 58), (64, 12.16, 62)):
    note(PNO, t0, 1.6, p, v)

# ---- 11.6-16.95  CRANE: strings rise Dm - Bb - Gm - A, harp ink-sparkles as survey lines draw ----
for chord, t0, t1 in (([50, 53, 57, 62], 11.6, 13.25), ([46, 53, 58, 62], 13.2, 14.85), ([43, 50, 55, 58, 62], 14.8, 15.95),
                      ([45, 52, 57, 61, 64], 15.9, 17.6)):
    note(STR, t0, t1 - t0 + 0.05, chord, 84)
note(CB, 11.6, 1.65, 26, 70); note(CB, 13.2, 1.65, 34, 70); note(CB, 14.8, 1.15, 31, 72); note(CB, 15.9, 1.7, 33, 76)
ramp(STR, 11.6, 16.9, 52, 112)
sp = [74, 77, 81, 84, 86, 89, 93]
t = 12.95
while t < 15.8:
    note(HRP, t, 0.6, sp[int(rng.integers(0, len(sp)))], 44 + int(rng.integers(0, 14))); t += 0.21 + rng.random() * 0.12
# 16.95 "Advance purbaru": one deep piano + timpani
note(PNO, 16.95, 2.6, [26, 38], 104); note(TIM, 16.95, 1.4, 38, 84); note(CB, 16.95, 2.2, 26, 84)
note(SLW, 17.0, 2.6, [45, 50, 57], 50); ramp(SLW, 17.0, 19.4, 90, 30)

# ---- 19.0-28.6  PAPER: investigative pulse (92 bpm), turning warm for the safe case ----
t = 19.0; i = 0; bassline = [(19.0, 26), (21.6, 34), (23.07, 34), (24.6, 29), (25.3, 31), (26.9, 26)]
while t < 28.55:
    harm = [50, 57, 53, 57] if t < 23.07 else ([46, 53, 58, 53] if t < 24.6 else ([41, 48, 53, 57] if t < 25.3 else ([43, 50, 55, 58] if t < 26.9 else [50, 57, 54, 57])))
    note(PIZ, t, E8 * 0.8, harm[i % 4], 44 + (6 if i % 4 == 0 else 0)); t += E8; i += 1
for (t0, p), (t1, _) in zip(bassline, bassline[1:] + [(28.6, 0)]):
    note(CB, t0, t1 - t0, p, 60)
note(PAD, 19.0, 4.1, [50, 53, 57], 44)
for t0, p in ((19.45, 81), (19.9, 84), (20.35, 86), (20.85, 93)):       # gold trace + "412" emboss
    note(CEL, t0, 0.8, p, 46)
note(HRP, 22.05, 0.4, 62, 50); note(HRP, 22.15, 0.4, 65, 50); note(HRP, 22.25, 0.4, 69, 52); note(HRP, 22.35, 0.6, 74, 54)
note(STR, 23.07, 1.6, [46, 53, 58, 62], 70); note(STR, 24.6, 0.75, [41, 53, 57, 60], 70)
note(STR, 25.3, 1.65, [43, 55, 58, 62], 72); note(STR, 26.9, 1.85, [38, 54, 57, 62, 66], 82)
ramp(STR, 23.07, 26.9, 60, 96)
for p, t0 in ((74, 23.1), (72, 24.62), (70, 25.32), (74, 26.92), (78, 27.45)):
    note(PNO, t0, 1.8, p, 56)
note(CEL, 26.93, 1.4, [86, 90], 60)                                       # "badhia" sparkle

# ---- 28.8-32.2  CAUTION: everything thins to one held cello note; heartbeat is synthesised ----
note(VC, 28.8, 3.4, 33, 74); ramp(VC, 28.8, 32.2, 70, 112)
note(PAD, 28.8, 3.3, [22, 34], 50)

# ---- 32.3-37.6  DEEDS: pulse returns as a question  Gm - Dm/F - Bb - A ----
t = 32.3; i = 0
while t < 37.6:
    harm = [43, 50, 55, 50] if t < 33.7 else ([41, 50, 53, 57] if t < 35.0 else ([46, 53, 58, 53] if t < 36.3 else [45, 52, 57, 61]))
    note(PIZ, t, E8 * 0.8, harm[i % 4], 46 + (6 if i % 4 == 0 else 0)); t += E8; i += 1
for chord, t0, t1, b in (([55, 58, 62], 32.3, 33.7, 31), ([53, 57, 62], 33.7, 35.0, 29), ([53, 58, 62], 35.0, 36.3, 34), ([52, 57, 61, 64], 36.3, 37.7, 33)):
    note(STR, t0, t1 - t0, chord, 70); note(CB, t0, t1 - t0, b, 62)
ramp(STR, 32.3, 37.6, 58, 92)
note(CEL, 34.66, 2.0, [93, 98], 66); note(HRP, 34.66, 1.5, [74, 81], 56)  # magnifier lands on "Right of Way"

# ---- 37.83-42.7  REGISTERED PAPER: forward motion, seal at 39.85, dust, reverse swell ----
t = 38.0; i = 0; ost = [62, 69, 74, 69]
while t < 41.6:
    note(PNO, t, E8 * 0.9, ost[i % 4], 46 + (8 if i % 4 == 0 else 0)); t += E8; i += 1
for chord, t0, t1, b in (([50, 57, 62, 65], 38.0, 39.85, 26), ([46, 58, 62, 65], 39.85, 40.85, 34), ([41, 57, 60, 65], 40.85, 41.7, 29)):
    note(STR, t0, t1 - t0, chord, 80); note(CB, t0, t1 - t0, b, 70)
note(HRN, 38.6, 1.3, [50, 57], 70); ramp(HRN, 38.6, 39.85, 40, 110)
note(TIM, 39.85, 1.2, 38, 108); note(PNO, 39.85, 1.6, [26, 38], 100)
note(PAD, 41.6, 1.2, [45, 52, 57], 50)

# ---- 42.71-45.9  RETURN: cello drive + strings build Dm - Bb - C ----
t = 42.71; i = 0
while t < 45.85:
    note(VC, t, s16 * 0.85, 38, 72 + int(30 * (t - 42.71) / 3.1)); t += s16; i += 1
for chord, t0, t1, b in (([50, 53, 57, 62], 42.71, 43.9, 26), ([46, 53, 58, 62], 43.9, 44.9, 34), ([48, 55, 60, 64], 44.9, 45.9, 36)):
    note(STR, t0, t1 - t0, chord, 82); note(CB, t0, t1 - t0, b, 76)
ramp(STR, 42.71, 45.85, 60, 118); note(TRM, 44.3, 1.6, [50, 57, 62], 70); ramp(TRM, 44.3, 45.85, 40, 118)

# ---- 45.9  GATE OPENS: D major (the resolution), edge lines sparkle, birds ----
note(STR, 45.9, 6.0, [38, 50, 54, 57, 62, 66, 69], 96); ramp(STR, 45.9, 47.0, 118, 104)
note(HRN, 45.9, 3.2, [50, 57, 62], 86); note(CHO, 46.1, 5.0, [62, 66, 69], 62)
note(PNO, 45.9, 3.0, [26, 38, 50], 92); note(TIM, 45.9, 1.0, 38, 70); note(CB, 45.9, 5.6, 26, 84)
for j, p in enumerate((74, 78, 81, 86, 90, 93, 98)):                    # harp glissando up as the gate swings
    note(HRP, 45.92 + j * 0.07, 1.4, p, 58)
for j, p in enumerate((74, 78, 81, 86, 81, 86, 90, 93)):                 # celesta along the gold edge lines
    note(CEL, 46.35 + j * 0.28, 0.9, p, 46)

# ---- 48.4-55.56  CTA + END CARD: gentle D-major piano melody, logo sting at 51.7 ----
for chord, t0, t1 in (([43, 55, 59, 62], 48.4, 50.6), ([47, 54, 59, 62], 50.6, 51.7)):
    note(STR, t0, t1 - t0, chord, 74)
ramp(STR, 48.3, 51.6, 90, 70)
for p, t0, d in ((78, 48.42, 0.5), (76, 48.92, 0.5), (74, 49.42, 0.5), (69, 49.92, 0.7), (71, 50.62, 0.45), (69, 51.05, 0.6)):
    note(PNO, t0, d + 0.9, p, 58)
note(CB, 48.4, 2.2, 31, 64); note(CB, 50.6, 1.1, 35, 64)
note(CEL, 51.72, 1.6, 81, 78); note(HRP, 51.72, 1.6, 69, 70)              # sting: A ...
note(CEL, 52.02, 3.2, 86, 82); note(HRP, 52.02, 3.0, [74, 62], 72)       # ... D
note(PNO, 52.02, 3.4, [38, 50, 57, 62], 74)
note(STR, 51.72, 3.8, [38, 50, 57, 62, 66, 69], 78); ramp(STR, 51.72, 55.5, 96, 0)
note(PAD, 51.72, 3.8, [50, 57, 62], 56); ramp(PAD, 53.0, 55.5, 100, 0)
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
addm(boom(), 1.45, 0.55)
addm(-lp(noise(0.25), 900) * np.linspace(0, 1, int(0.25 * SR)) ** 3, 2.48, 0.10)       # air suck into the stop
addm(riser(3.7, 250, 7000), 2.80, 0.06); addm(rev_swell(1.4, (38, 50, 57)), 5.03, 0.18)
addm(braam(), 6.43, 0.55); addm(boom(62, 28, 3.2, 2.2), 6.43, 0.8)
addm(boom(48, 30, 2.0), 16.95, 0.42)
# heartbeat under "sabadhan"
for t0 in (31.2, 31.55):
    tq = tt(0.4); hb = np.sin(2 * np.pi * 52 * tq * (1 + 0.5 * np.exp(-tq * 30))) * np.exp(-tq * 11)
    addm(hb, t0, 0.55); addm(hb * 0.55, t0 + 0.2, 0.55)
addm(boom(52, 30, 2.2), 39.85, 0.45)
addm(rev_swell(1.0, (50, 57, 62)), 41.71, 0.2)
addm(riser(2.2, 400, 6000), 43.7, 0.05)
addm(boom(46, 30, 3.0, 1.2), 45.9, 0.35)
# shimmer pads (high, airy) on the reveals
def shimmer(d, notes):
    t = tt(d); s = sum(np.sin(2 * np.pi * 440 * 2 ** ((m - 69) / 12) * t + rng.random() * 6) * (1 + 0.3 * np.sin(2 * np.pi * (5 + j) * t))
                       for j, m in enumerate(notes))
    return s / len(notes) * np.sin(np.pi * t / d) ** 2
addm(shimmer(1.2, (86, 93, 98)), 0.0, 0.05); addm(shimmer(2.0, (90, 93, 98)), 45.9, 0.06); addm(shimmer(3.5, (86, 90, 93)), 51.7, 0.05)

# ============================================================== FOLEY (sfx bus)
S = np.zeros((N, 2), np.float32)
from scipy.ndimage import uniform_filter1d
t_all = tt(DUR)
# wind bed: land segments full, paper segment as faint room tone
land = ((t_all < 19.3) | (t_all > 43.2)).astype(float); land = uniform_filter1d(land, int(SR * 0.8))
for pan, seed in ((-0.5, 1), (0.5, 2)):
    w = lp(noise(DUR), 420) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.09 * t_all + seed)); add(S, w * (0.05 * land + 0.006), 0, 1, pan)
room = lp(noise(DUR), 200) * (1 - land) * 0.012; add(S, room, 0, 1, 0)
# birds (land, late)
def chirp(d=0.16, f0=3800, f1=5200):
    t = tt(d); f = f0 + (f1 - f0) * np.sin(np.pi * t / d); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** 2
for t0 in np.concatenate([np.sort(rng.uniform(0.3, 2.6, 3)), np.sort(rng.uniform(46.2, 55.0, 11)), np.sort(rng.uniform(11.0, 16.5, 4))]):
    for j in range(int(rng.integers(2, 4))): add(S, chirp(0.09 + rng.random() * 0.06, 3200 + rng.random() * 900, 4600 + rng.random() * 1400), t0 + j * 0.13, 0.05, rng.uniform(-0.7, 0.7))
# palm pass-bys on the fast glide (camera passes the avenue palms)
def whoosh(d, f=900, q=0.8):
    t = tt(d); x = bp(noise(d), f * (1 - q * 0.5), f * (1 + q)); return x * np.sin(np.pi * t / d) ** 2
for t0, g, pan in ((0.02, 0.22, -0.4), (0.36, 0.2, 0.45), (0.77, 0.17, -0.45), (1.35, 0.13, 0.4)):
    add(S, whoosh(0.32, 700), t0, g, pan)
add(S, whoosh(2.6, 400, 0.9) * np.linspace(1, 0.2, int(2.6 * SR)), 0, 0.12)
# price counter ticks: one per lakh, timed to the counter curve v(t) = 1-(1-ss(0.1,1.35,t))^3
def ssf(a, b, x): y = np.clip((x - a) / (b - a), 0, 1); return y * y * (3 - 2 * y)
tq = np.arange(0.1, 1.40, 1 / SR); v = 1 - (1 - ssf(0.1, 1.35, tq)) ** 3; steps = np.floor(v * 20)
for idx in np.nonzero(np.diff(steps) > 0)[0]:
    c = bp(noise(0.02), 2400, 7000) * np.exp(-tt(0.02) * 320); add(S, c, tq[idx + 1], 0.16, 0.25)
# time-lapse clock: accelerating ticks + three sun sweeps
t0 = 2.78
while t0 < 4.65:
    c = bp(noise(0.03), 1800, 5200) * np.exp(-tt(0.03) * 260); add(S, c, t0, 0.18, -0.2); t0 += max(0.045, 0.2 - (t0 - 2.78) * 0.09)
for t0 in (2.85, 3.45, 4.05): add(S, whoosh(0.7, 1400, 0.9), t0, 0.07, rng.uniform(-0.5, 0.5))
for t0 in (3.70, 3.86): add(S, bp(noise(0.08), 2000, 6000) * np.exp(-tt(0.08) * 70), t0, 0.05, 0.6)   # far-off clinks: the gate goes up
# glide resumes, gate swings shut, hinge squeal, CLANG, chain + padlock
add(S, whoosh(1.5, 600, 0.9), 4.85, 0.12)
add(S, whoosh(0.32, 900, 0.7), 6.10, 0.18)
sq = tt(0.16); add(S, np.sin(2 * np.pi * (1900 + 900 * sq / 0.16) * sq) * np.sin(np.pi * sq / 0.16) * 0.5, 6.27, 0.07, 0.3)
tc = tt(3.2); clang = np.zeros_like(tc)
for f, a, dc in ((143, 1, 1.2), (301, .8, 1.6), (497, .6, 2.2), (733, .45, 2.8), (1021, .35, 3.5), (1488, .25, 5), (2213, .18, 7), (3120, .12, 9), (4411, .08, 12)):
    clang += a * np.sin(2 * np.pi * f * tc * (1 + 0.002 * np.sin(2 * np.pi * 4 * tc))) * np.exp(-tc * dc)
clang += bp(noise(3.2), 900, 7000) * np.exp(-tc * 35) * 1.3
add(S, clang, 6.43, 0.22)
for j in range(14):
    c = bp(noise(0.05), 2500, 9000) * np.exp(-tt(0.05) * 90); add(S, c, 6.47 + j * 0.05 + rng.random() * 0.03, 0.07 * (1 - j / 16), 0.15)
add(S, bp(noise(0.05), 1500, 6000) * np.exp(-tt(0.05) * 120), 6.62, 0.12, 0.1)         # padlock snap
# board drops in and swings: fall whoosh, tin + wood impact, creaks
add(S, whoosh(0.3, 700, 0.8), 7.43, 0.13)
tb = tt(1.2); tin = sum(a * np.sin(2 * np.pi * f * tb) * np.exp(-tb * dc) for f, a, dc in ((210, 1, 6), (377, .7, 8), (611, .5, 10), (950, .3, 14)))
add(S, tin * 0.6 + lp(noise(1.2), 300) * np.exp(-tb * 25), 7.72, 0.20)
def creak(d=0.32, f=520):
    t = tt(d); fm = f * (1 + 0.15 * np.sin(2 * np.pi * 23 * t)); s = np.sign(np.sin(2 * np.pi * np.cumsum(fm) / SR)) * 0.3
    return bp(s, 400, 2400) * np.sin(np.pi * t / d) ** 2
for t0, g in ((8.02, 0.07), (8.47, 0.05), (8.92, 0.035), (9.38, 0.022)): add(S, creak(), t0, g, 0.05)
# crane rise, high air
add(S, whoosh(5.5, 500, 0.9), 11.2, 0.10); add(S, whoosh(3.0, 350, 0.9), 16.6, 0.08)
# land -> paper hand-off: paper unfurl
def paper(d=0.5, f0=2500, f1=7000):
    t = tt(d); x = bp(noise(d), f0, f1) * (0.6 + 0.4 * np.sin(2 * np.pi * 31 * t) ** 2); return x * np.sin(np.pi * t / d)
add(S, paper(1.0, 1500, 6500), 18.7, 0.10)
# gold ink trace (pen nib), 412 emboss, patta lift + settle
def nib(d):
    t = tt(d); x = bp(noise(d), 3000, 9000) * (0.5 + 0.5 * np.sin(2 * np.pi * 17 * t) ** 2); return x * np.minimum(1, t / 0.05) * np.minimum(1, (d - t) / 0.08)
add(S, nib(1.3), 19.4, 0.05, 0.2)
add(S, lp(noise(0.06), 900) * np.exp(-tt(0.06) * 60), 20.85, 0.12)
add(S, paper(0.9), 22.05, 0.10, -0.2); add(S, lp(noise(0.08), 700) * np.exp(-tt(0.08) * 50), 23.70, 0.10)
# green ticks (24.6, 26.2), red underline (30.0-30.9)
for t0 in (24.6, 26.2): add(S, nib(0.45), t0, 0.07, 0.25)
add(S, nib(0.9) * 1.2, 30.0, 0.07, 0.1)
# deed slides in, tape slips, magnifier glides and lands
add(S, paper(1.0), 32.1, 0.11, -0.3); add(S, paper(0.35, 900, 3000), 32.6, 0.06, 0.2)
add(S, whoosh(1.1, 1800, 0.6), 33.5, 0.04, 0.3)
tg = tt(1.5); add(S, sum(a * np.sin(2 * np.pi * f * tg) * np.exp(-tg * d) for f, a, d in ((3520, 1, 4), (5280, .5, 6), (7040, .3, 9))), 34.65, 0.035, 0.3)
# stamp paper slides, seal descends and lands (39.85), lifts (40.6)
add(S, paper(0.9), 38.95, 0.10, -0.2); add(S, whoosh(0.5, 600, 0.7), 39.4, 0.08)
ts = tt(0.6); thump = np.sin(2 * np.pi * 70 * ts * (1 + 0.8 * np.exp(-ts * 40))) * np.exp(-ts * 14) + lp(noise(0.6), 1200) * np.exp(-ts * 45) * 0.6
add(S, thump, 39.85, 0.42); add(S, paper(0.25, 1500, 5000), 39.86, 0.06)
add(S, bp(noise(0.12), 400, 1800) * np.exp(-tt(0.12) * 30), 40.6, 0.05)
# "word of mouth" turns to dust and blows away
add(S, whoosh(1.0, 3000, 0.9), 41.7, 0.10, 0.4)
# papers leave, land returns
add(S, paper(1.1), 42.55, 0.10, 0.3); add(S, whoosh(1.6, 500, 0.9), 43.0, 0.12)
# gate opens: latch, slow hinge creak
add(S, bp(noise(0.06), 1500, 6000) * np.exp(-tt(0.06) * 90), 45.88, 0.10)
for j, t0 in enumerate((45.95, 46.35, 46.8)): add(S, creak(0.42, 430 + 40 * j), t0, 0.05 - 0.01 * j, 0.1)
# send whoosh
add(S, whoosh(0.5, 2200, 0.8), 50.6, 0.07, 0.5)

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
