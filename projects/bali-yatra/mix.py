# Bali Jatra: voice + score + sound design -> out/mix.wav (73.72 s). Run: $LIB/.venv/bin/python mix.py
# D major pentatonic (D E F# A B) throughout, so the bansuri (Odisha) and the gamelan metallophones (Bali) can meet and agree.
# The fair is heard muffled through the sand at both ends (the loop); the lightbox is quiet, close and dry (sand under fingers);
# the wind is a real wind that turns; the moon is a swell into a shankha; Kartika night is the sea and the full theme;
# Cuttack is a fair you hear before you see; Indonesia arrives as a gong and an interlocking gamelan figure.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 73.72; N = int(DUR * SR)
R = np.random.default_rng(11)
def st(n=N): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()
def tt(d): return np.arange(int(d * SR)) / SR
def env_at(points):   # piecewise-linear gain curve over the film: [(t, g), ...]
    ts = np.arange(N) / SR; return np.interp(ts, [p[0] for p in points], [p[1] for p in points]).astype(np.float32)

# ---------- voice: crisp and forward ----------
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/voiceover.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 85); vo = vo + .32 * X.bp(vo, 2600, 6000)
vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .62 * np.clip(env * 4, 0, 1); sm = int(.22 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')

# ---------- instruments ----------
MID = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(p): n, o = p[:-1], int(p[-1]); return 440 * 2 ** ((MID[n] + 12 * (o + 1) - 69) / 12)
def bansuri(phrase, t0, v=.5, glide=.07, pan=.05):
    total = sum(d for _, d in phrase) + .6; n = int(total * SR); f = np.zeros(n); a = np.zeros(n); pos = 0; prev = None
    for p, d in phrase:
        m = int(d * SR)
        if p is None: pos += m; prev = None; continue
        fr = hz(p); seg = np.full(m, fr)
        if prev: g = min(m, int(glide * SR)); seg[:g] = np.linspace(prev, fr, g)
        ts = np.arange(m) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.1 * ts) * np.clip((ts - .25) / .45, 0, 1)
        f[pos:pos + m] = seg * vib
        e = np.minimum(1, ts / .07) * np.minimum(1, (d - ts) / .09 + .35); a[pos:pos + m] = np.clip(e, 0, 1); prev = fr; pos += m
    a = np.convolve(a, np.ones(int(.035 * SR)) / int(.035 * SR), 'same')
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .22 * np.sin(2 * ph + .3) + .07 * np.sin(3 * ph + 1.1) + .03 * np.sin(4 * ph)
    breath = X.bp(R.standard_normal(n), 900, 5200) * .16 + X.bp(R.standard_normal(n), 300, 900) * .05
    y = (tone * .8 + breath * (.5 + .5 * np.sin(ph * .5) ** 2)) * a
    X.add(music, (np.convolve(y, [.6, .4], 'same') * v).astype(np.float32), t0, 1, pan)
def pad(inst, p, t, d, v, pan=0, g=.6): X.add(music, S.note(inst, p, d, v, attack=1.3, release=1.6), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.8, bus=None): X.add(music if bus is None else bus, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
def conch(d=2.6, v=1.0):
    t = tt(d); f = 293.66 * (1 + .004 * np.sin(2 * np.pi * 4.6 * t)) * (1 + .025 * np.minimum(1, t / .45)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum((1 / h ** 1.1) * np.sin(h * ph) for h in range(1, 10)); e = np.minimum(1, t / .4) * np.minimum(1, (d - t) / .7)
    return (X.lp(y * e, 2800) * .12 * v + X.bp(X.noise(d), 600, 2000) * e * .012).astype(np.float32)
def fade(x, a=.4, b=.6):
    n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)

# ---------- sound design builders ----------
def babble(d, v=1.0, seed=0):   # a crowd: many overlapping band-passed syllables
    r = np.random.default_rng(seed); n = int(d * SR); y = np.zeros(n)
    for _ in range(int(d * 38)):
        L = int(r.uniform(.08, .3) * SR); s = int(r.uniform(0, max(1, n - L))); f0 = r.uniform(350, 1400)
        seg = X.bp(r.standard_normal(L), f0 * .7, f0 * 1.6) * np.hanning(L) * r.uniform(.3, 1); y[s:s + L] += seg
    return (X.lp(y, 3200) * .012 * v).astype(np.float32)
def wind(d, v=1.0, sweep=None, seed=1):   # band-passed noise whose centre wanders; sweep: list of (t, hz) for the turn
    r = np.random.default_rng(seed); n = int(d * SR); w = r.standard_normal(n); t = tt(d)[:n]
    cen = np.interp(t, [s[0] for s in sweep], [s[1] for s in sweep]) if sweep else 600 + 250 * np.sin(2 * np.pi * .11 * t)
    out = np.zeros(n); B = 2048
    for i in range(0, n, B):   # block-wise moving band
        c = cen[min(i, n - 1)]; out[i:i + B] = X.bp(w[max(0, i - 512):i + B], c * .6, c * 1.7)[-len(w[i:i + B]):]
    gust = .55 + .45 * np.sin(2 * np.pi * .23 * t + 1) * np.sin(2 * np.pi * .07 * t)
    return (out * gust * .05 * v).astype(np.float32)
def waves(d, v=1.0, seed=2):
    r = np.random.default_rng(seed); n = int(d * SR); t = tt(d)[:n]; y = X.lp(r.standard_normal(n), 700) * .6
    sw = np.zeros(n)
    for c in np.arange(0, d, 2.6): sw += np.exp(-((t - c - r.uniform(0, .6)) ** 2) / .5)
    foam = X.bp(r.standard_normal(n), 2500, 8000) * sw * .25
    return ((y * (.4 + .6 * sw) + foam) * .05 * v).astype(np.float32)
def lapping(d, v=1.0, seed=3):
    r = np.random.default_rng(seed); n = int(d * SR); y = np.zeros(n)
    for c in np.arange(0, d, .45): s = int((c + r.uniform(0, .3)) * SR); L = int(.18 * SR)
    for c in np.arange(0, d, .45):
        s = int((c + r.uniform(0, .3)) * SR); L = int(.2 * SR)
        if s + L < n: y[s:s + L] += X.bp(r.standard_normal(L), 300, 1200) * np.hanning(L) * r.uniform(.3, 1)
    return (y * .05 * v).astype(np.float32)
def trickle(d, v=1.0, seed=4):   # sand grains running: sparse ticks, filtered
    r = np.random.default_rng(seed); n = int(d * SR); y = np.zeros(n); idx = r.integers(0, n, int(d * 900)); y[idx] = r.uniform(-1, 1, len(idx))
    return (X.bp(np.convolve(y, np.hanning(24), 'same'), 2500, 9000) * np.hanning(n) ** .5 * .05 * v).astype(np.float32)
def drag(d, v=1.0, seed=5):   # a fingertip through sand
    r = np.random.default_rng(seed); n = int(d * SR); e = np.sin(np.pi * np.linspace(0, 1, n)) ** .8
    return ((X.bp(r.standard_normal(n), 1800, 7000) * .6 + X.bp(r.standard_normal(n), 400, 1500) * .3) * e * .045 * v).astype(np.float32)
def sweep(d=.45, v=1.0, seed=6):   # a palm sweeping sand flat
    r = np.random.default_rng(seed); n = int(d * SR); t = np.linspace(0, 1, n); e = np.sin(np.pi * t) ** 1.2
    return ((X.bp(r.standard_normal(n), 900, 6000) * e) * .09 * v).astype(np.float32)
def sizzle(d, v=1.0, seed=7):
    r = np.random.default_rng(seed); n = int(d * SR); y = X.hp(r.standard_normal(n), 3000) * .2; idx = r.integers(0, n, int(d * 180)); c = np.zeros(n); c[idx] = r.uniform(-1, 1, len(idx))
    return ((y + X.hp(np.convolve(c, np.hanning(40), 'same'), 1500) * 1.5) * .035 * v).astype(np.float32)
def creak(v=1.0, seed=8):
    r = np.random.default_rng(seed); d = .7; t = tt(d); f = 140 + 60 * np.sin(2 * np.pi * 1.3 * t); imp = (np.sin(2 * np.pi * np.cumsum(f) / SR) > .97).astype(float)
    return (X.bp(np.convolve(imp, np.hanning(60), 'same'), 300, 2500) * np.hanning(len(t)) * .08 * v).astype(np.float32)
def swell(d, v=1.0, seed=9):   # a reversed-cymbal style rise of air
    r = np.random.default_rng(seed); n = int(d * SR); e = np.linspace(0, 1, n) ** 2.4
    return (X.bp(r.standard_normal(n), 1500, 9000) * e * .07 * v).astype(np.float32)
def crunch(v=1.0, seed=10):   # a bare foot on loose sand
    r = np.random.default_rng(seed); d = .22; n = int(d * SR); e = np.exp(-np.linspace(0, 1, n) * 7)
    return (X.bp(r.standard_normal(n), 700, 5000) * e * .12 * v).astype(np.float32)

# ---------- the fair, heard through the sand (both ends) and up close (Cuttack) ----------
def fair_bed(d, seed):
    y = babble(d, 1.0, seed); t = tt(d)[:len(y)]
    # a distant fair tune: shehnai-like oboe over a dhol-ish frame drum, muffled
    tune = np.zeros((len(y), 2), np.float32)
    mel = ['A4', 'B4', 'D5', 'B4', 'A4', 'F#4', 'A4', 'B4', 'A4', 'F#4', 'E4', 'D4']
    for i in range(int(d / .42)):
        X.add(tune, S.note('oboe', mel[i % len(mel)], .4, .5, attack=.03, release=.15), i * .42, .4, .2)
        if i % 2 == 0: X.add(tune, S.note('frame_drum', 'D3' if i % 4 == 0 else 'A3', .3, .6), i * .42, .5, -.2)
    return y, tune
fb_y, fb_t = fair_bed(12.0, 21)
def put_fair(t0, d, g, cutoff):   # place a slice of the fair bed, low-passed by distance
    n = int(d * SR); y = fb_y[:n]; tu = fb_t[:n]
    X.add(amb, fade(X.lp(y, cutoff) * g, .6, .9), t0, 1, 0)
    for ch, pan in ((0, -.2), (1, .2)): X.add(amb, fade(X.lp(tu[:, ch], cutoff * .7) * g * .9, .6, .9), t0, 1, pan)
put_fair(0, 6.2, 1.0, 900)                      # opening: the fair behind us, through the night air
put_fair(68.9, DUR - 68.9, 1.0, 900)            # ending: the same (the loop)
for i, t in enumerate([.25, .9, 1.55, 2.2]): X.add(fx, crunch(.7, i), t, .8, -.15 + i * .1)   # steps leaving the prints
X.add(fx, crunch(.6, 9), DUR - .5, .8, -.15)

# ---------- tanpura drone: through the lightbox and the night; out under "no engine / no GPS" ----------
t0, i = 5.9, 0
while t0 < 69.8:
    g = .2 if 21.7 < t0 < 24.3 else (.55 if 49.5 < t0 < 58.5 else 1.0)
    for f, dt, pan in [(110.0, 0, -.3), (146.83, .62, .2), (146.83, 1.24, .25), (73.42, 1.86, -.1)]:
        if t0 + dt < 70.5: X.add(music, tanpura_pluck(f, v=.085 * g, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6

# ---------- strings, by chapter ----------
pad('cellos', 'D2', 5.4, 3.2, .22, 0, .6); pad('vibraphone_bowed', 'A4', 5.6, 3.0, .16, .2, .5)                 # the light flips
pad('cellos', 'D3', 8.4, 5.0, .18, -.2); pad('violas', 'A3', 8.5, 4.9, .13, .2); pad('violins', 'E4', 9.4, 3.8, .08, .3)   # Bali
pad('cellos', 'B2', 13.4, 4.2, .2, -.2); pad('violas', 'F#3', 13.5, 4.1, .14, .2)                              # the sadhabas
pad('cellos', 'G2', 17.6, 4.0, .2, -.2); pad('violas', 'D3', 17.7, 3.9, .14, .2); pad('violins', 'B3', 18.6, 3.0, .1, .3)
pad('cellos', 'G2', 24.4, 4.0, .18, -.2); pad('violas', 'D3', 24.5, 3.9, .12, .2)                              # only the wind
pad('cellos', 'A2', 28.2, 3.4, .22, -.2); pad('violas', 'E3', 28.3, 3.3, .15, .2); pad('violins', 'C#4', 28.6, 3.0, .1, .3)   # it turns
pad('cellos', 'B2', 31.4, 2.4, .2, -.2); pad('violas', 'F#3', 31.5, 2.3, .13, .2)                              # they waited
pad('cellos', 'G2', 33.6, 2.9, .24, -.2); pad('violas', 'D3', 33.7, 2.8, .17, .2); pad('violins', 'B3', 34.2, 2.3, .14, .3); pad('contrabass', 'A1', 34.6, 2.0, .2, 0, .5)
pad('cellos', 'D3', 36.4, 6.3, .27, -.2); pad('violas', 'A3', 36.45, 6.2, .19, .25); pad('violins', 'F#4', 36.6, 6.0, .15, .3); pad('contrabass', 'D2', 36.4, 4.5, .26, 0, .55)   # Kartika night: D major
pad('cellos', 'G2', 42.6, 4.0, .2, -.2); pad('violas', 'D3', 42.7, 3.9, .14, .2); pad('violins', 'B3', 43.4, 3.2, .09, .3)   # today
pad('cellos', 'D3', 46.6, 3.4, .18, -.2); pad('violas', 'A3', 46.7, 3.3, .12, .2)
pad('cellos', 'B2', 58.2, 2.7, .2, -.2); pad('violas', 'F#3', 58.3, 2.6, .14, .2); pad('violins', 'D4', 58.8, 2.0, .12, .3)   # the moon again
pad('cellos', 'D3', 60.8, 7.4, .22, -.2); pad('violas', 'A3', 60.85, 7.3, .15, .25); pad('violins', 'F#4', 61.4, 6.6, .1, .3)   # Indonesia
pad('cellos', 'G2', 66.0, 2.4, .2, -.2); pad('violins', 'B3', 66.2, 2.0, .1, .3)
pad('cellos', 'D3', 68.0, 3.0, .18, -.2); pad('violas', 'A3', 68.1, 2.8, .12, .2)

# ---------- the bansuri: the sadhabas' voice ----------
bansuri([('A5', .5), ('F#5', .35), ('E5', 1.1)], .4, .2)                                                       # a breath from far off (the fair)
bansuri([('D5', .35), ('E5', .3), ('F#5', .45), ('A5', .55), ('B5', .3), ('A5', .9), (None, .2),               # they set sail
         ('F#5', .35), ('A5', .35), ('B5', .4), ('D6', .5), ('B5', .3), ('A5', 1.1)], 13.9, .3)
bansuri([('F#5', .5), ('E5', .4), ('D5', 1.0)], 19.0, .2)                                                       # the islands
bansuri([('E5', .6), ('F#5', .3), ('A5', 1.4)], 28.4, .3)                                                       # the sail fills
bansuri([('A5', 3.6)], 31.6, .22, pan=-.05)                                                                     # held: they waited
bansuri([('D5', .5), ('E5', .4), ('F#5', .5), ('A5', .7), ('B5', .4), ('A5', .45), ('F#5', .5), ('A5', 1.2),   # Kartika night: the theme
         (None, .25), ('B5', .4), ('D6', .5), ('E6', .6), ('D6', .4), ('B5', .4), ('A5', 1.6)], 37.0, .34)
bansuri([('F#5', .6), ('E5', .5), ('D5', 1.6)], 43.4, .22)                                                      # today, softly
bansuri([('A5', .45), ('B5', .45), ('A5', .4), ('F#5', .6)], 47.9, .18)                                          # in memory
# with the gamelan: question and answer
bansuri([('D5', .4), ('F#5', .4), ('A5', .8), (None, .9), ('B5', .4), ('A5', .4), ('F#5', 1.0)], 61.9, .28)
bansuri([('A5', .4), ('B5', .4), ('D6', .7), ('B5', .35), ('A5', .35), ('F#5', .5), ('A5', 1.4)], 64.9, .3)
bansuri([('F#5', .5), ('E5', .5), ('D5', 2.0)], 68.3, .24)
bansuri([('A5', .5), ('F#5', .35), ('E5', 1.1)], DUR - 2.6, .18)                                                 # the same breath as the start (loop)

# ---------- the gamelan: Bali (metallophones in the same pentatonic; a gong on the cycle) ----------
def gam(p, t, v=.45, g=.5, pan=0., inst='vibraphone_hard'): note(inst, p, t, 1.6, v, g, pan, att=.002, rel=.9)
def gong(t, v=.6, g=.7): X.add(music, S.note('gong', 'D2', 5.0, v, attack=.01, release=2.5), t, g, 0)
gam('D6', 8.85, .32, .45, .1); note('glockenspiel', 'A6', 8.9, 1.2, .2, .3, -.1)                                # "Bali": a first hint
for k, (p, t) in enumerate([('D6', 19.0), ('A5', 19.75), ('F#5', 20.5)]): gam(p, t, .34, .45, -.3 + k * .3)     # one stroke per island
gong(61.0, .7, .75)
pat = ['D5', 'F#5', 'A5', 'F#5', 'B5', 'A5', 'F#5', 'E5']; sang = ['A5', 'B5', 'D6', 'B5', 'E6', 'D6', 'B5', 'A5']
for i in range(int((68.4 - 61.0) / .2)):   # interlocking pair (kotekan-like) at 150 bpm sixteenths
    t = 61.0 + i * .2; gn = min(1, (t - 61.0) / 1.5) * (1 - max(0, (t - 67.6) / .8))
    if i % 2 == 0: gam(pat[(i // 2) % 8], t, .3 * gn, .4, -.35)
    else: gam(sang[(i // 2) % 8], t, .24 * gn, .35, .35, 'glockenspiel')
    if i % 16 == 0 and i > 0: X.add(music, S.note('gong2', 'A2', 2.0, .4 * gn, attack=.01, release=1.2), t, .5, 0)
gong(68.2, .45, .55)

# ---------- accents ----------
def chime(p, t, v=.2, g=.4, pan=0.): note('hand_chimes', p, t, 2.5, v, g, pan)
def harp(p, t, v=.32, g=.45, pan=0.): note('harp', p, t, 3, v, g, pan)
for j, p in enumerate(['D5', 'E5', 'F#5', 'A5', 'B5', 'D6']): chime(p, 10.9 + j * .38, .13, .3, (j - 2.5) * .2)   # the lane grows
for j, p in enumerate(['B3', 'D4', 'F#4', 'A4', 'B4']): harp(p, 13.9 + j * .07, .3, .45, (j - 2) * .15)          # the boita drawn
note('tubular_bells', 'D5', 39.85, 4, .34, .45); X.add(music, S.note('gong', 'D2', 4.0, .45, attack=.01, release=2.0), 39.85, .5, 0)   # BALI JATRA
for k in range(3): X.add(music, S.note('frame_drum', 'D3', .5, .7 - k * .15), 39.55 + k * .15, .5, (k - 1) * .2)
for j, p in enumerate(['D5', 'F#5', 'A5', 'D6']): harp(p, 44.5 + j * .1, .26, .4, (j - 1.5) * .2)              # the lamp-boat
chime('A6', 45.4, .12, .3, .2); chime('F#6', 46.0, .1, .3, -.2); chime('D7', 46.7, .1, .28, .1)                  # lamps lighting outward
note('nepal_bells', 'A5', 47.8, 3, .3, .35)                                                                      # in memory
for j, p in enumerate(['D6', 'B5', 'A5']): chime(p, 58.25 + j * .3, .12, .3, (j - 1) * .3)                       # look up
# Cuttack: the fair arrives (a dhol figure under the shehnai-oboe), then falls away at the moon
tune_g = env_at([(0, 0), (49.6, 0), (51.5, .55), (55.3, .8), (57.8, .7), (58.6, .12), (59.6, 0), (DUR, 0)])
for i in range(int((59.6 - 49.6) / .21)):
    t = 49.6 + i * .21; g = float(tune_g[int(t * SR)])
    if g <= 0: continue
    X.add(music, S.note('frame_drum', 'D3' if i % 4 == 0 else ('A3' if i % 2 == 0 else 'E3'), .3, .7 if i % 4 == 0 else .4), t, .55 * g, (.2 if i % 2 else -.2))
    if i % 2 == 0: X.add(music, S.note('oboe', ['A4', 'B4', 'D5', 'E5', 'D5', 'B4', 'A4', 'F#4'][(i // 2) % 8], .4, .45, attack=.03, release=.15), t, .38 * g, .15)
    if i % 8 == 4: X.add(music, S.note('tambourine', 'C5', .3, .35), t, .3 * g, .3)

# ---------- foley: the sand ----------
X.add(fx, wind(1.6, .9), 3.9, .9, 0)                                         # the gust that smooths the prints
X.add(fx, swell(.9, .6), 5.0, .7, 0)                                         # the light flips
X.add(fx, trickle(2.4, 1.0), 6.3, .9, .1)                                    # foot becomes island
X.add(fx, drag(2.3, 1.0), 10.85, .9, -.1)                                    # the lane drawn
X.add(fx, trickle(1.2, .7, 12), 13.9, .8, -.3)                               # the boita appears
X.add(fx, drag(3.4, .7, 13), 15.45, .8, .1)                                  # the retrace
X.add(fx, drag(.6, .8, 14), 21.85, .9, .1); X.add(fx, sweep(.45, 1.0), 22.55, 1, .15)   # no engine
X.add(fx, drag(.55, .8, 15), 23.05, .9, .2); X.add(fx, sweep(.45, 1.0, 16), 23.7, 1, .2)   # no GPS
X.add(amb, fade(wind(7.6, 1.2), 1.0, 1.8), 24.3, 1, 0)                        # only the wind
X.add(amb, fade(wind(2.4, 1.0, [(0, 500), (1.2, 1300), (2.4, 700)], 17), .4, .6), 26.3, 1, .2)   # it turns
X.add(fx, X.thump(.5, 70), 28.4, .6, 0); X.add(fx, (X.lp(X.noise(.6), 400) * np.hanning(int(.6 * SR)) * .12).astype(np.float32), 28.35, 1, 0)   # sails fill
X.add(fx, drag(2.6, .5, 18), 28.6, .6, .1)                                   # carried out
X.add(fx, trickle(4.4, .7, 19), 31.3, .7, -.1)                               # the moon cleared
X.add(fx, swell(1.5, 1.0, 20), 34.95, .9, 0)                                 # into the moon
X.add(fx, conch(3.4, 1.0), 35.9, .85, 0)                                      # shankha at the white
# ---------- foley: Kartika night ----------
X.add(amb, fade(waves(7.0, 1.0), 1.2, 1.5), 36.3, 1, 0)                       # the open sea
for t in (38.4, 40.6): X.add(fx, creak(.8, int(t)), t, .7, .2)                # rigging
X.add(amb, fade(lapping(7.5, 1.0), 1.5, 1.2), 42.8, 1, 0)                     # the river, close
for k in range(8): X.add(fx, X.ignite(.12), 44.4 + k * .4, .25, (k - 3.5) * .2)   # lamps lit
X.add(amb, fade(babble(5.0, .6, 30), 1.0, 1.0) , 45.5, .4, .3)                 # voices on the ghat, far
X.add(fx, X.whoosh(1.0, .3), 49.7, .45, 0)                                     # the crane up
X.add(amb, fade(X.lp(babble(9.0, 1.6, 31), 2600), 2.0, 1.2), 49.8, 1, 0)       # the fair, arriving
for k in range(3): X.add(fx, sizzle(1.0, 1.0, 40 + k), 55.4 + k * .8, .9, (k - 1) * .3)   # oil
X.add(fx, X.ding(.3), 55.7, .4, -.2); X.add(fx, X.ding(.22), 56.9, .35, .2)     # ladle on brass
X.add(fx, swell(1.8, 1.0, 21), 59.0, .9, 0)                                    # into the moon
X.add(fx, swell(.8, .5, 22), 65.6, .6, 0); X.add(fx, drag(2.3, .8, 23), 66.0, .9, .1)   # the island lifts and sails
X.add(fx, trickle(1.6, .9, 24), 68.2, .85, -.1)                                 # island becomes a footprint
X.add(fx, swell(.8, .5, 25), 69.0, .6, 0)                                      # the light flips back

# ---------- mix ----------
mus_g = env_at([(0, .55), (5.5, .7), (21.7, .7), (21.85, .12), (24.2, .12), (24.6, .8), (DUR - 1.6, .8), (DUR, .55)])
bus = music * .66 * (duck * mus_g)[:, None] + fx * .9 * (1 - .3 * np.clip(env * 4, 0, 1))[:, None] + amb * (1 - .35 * np.clip(env * 4, 0, 1))[:, None]
bus = S.room(bus, size=.55, mix=.2)
out = bus + np.stack([vo, vo], 1) * .84
sp = env > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .84), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
import soundfile as sf; os.makedirs(os.path.join(HERE, 'out'), exist_ok=True); sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'nepal_bells', 'glockenspiel', 'frame_drum', 'vibraphone_hard', 'vibraphone_bowed', 'gong', 'gong2', 'oboe', 'tambourine', 'cellos', 'violas', 'violins', 'contrabass'])))
