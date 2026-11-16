# Radha Pada Darshan: voice + score + foley → out/mix.wav (74.0 s). Run: $LIB/.venv/bin/python mix.py
# In D. The bansuri is Gopinath: it plays when his flute is drawn, walks with him at night, and stops dead when the flute is
# left behind; it comes back, full, when her feet are seen. Accusation: the music drops to a drone and a heartbeat. Dream: harp
# and glass. The journey: the bearers' rhythm. The loom: wooden clacks in time. The reveal: anklet bells, conch, temple bells.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 74.0; N = int(DUR * SR)
R = np.random.default_rng(7)
def st(n=N): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()
def tt(d): return np.arange(int(d * SR)) / SR

# ---------- voice: crisp and forward ----------
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/voiceover.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 80)
vo = vo + .35 * X.bp(vo, 2600, 6000)          # presence
vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .68 * np.clip(env * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')

# ---------- bansuri (synth): breathy bamboo flute with meend (glides), vibrato that grows on held notes ----------
MID = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(p): n, o = p[:-1], int(p[-1]); return 440 * 2 ** ((MID[n] + 12 * (o + 1) - 69) / 12)
def bansuri(phrase, t0, v=.5, glide=.06):
    """phrase: [(pitch, dur)] played legato from t0; pitch None = breath rest"""
    total = sum(d for _, d in phrase) + .6; n = int(total * SR); f = np.zeros(n); a = np.zeros(n); pos = 0; prev = None
    for p, d in phrase:
        m = int(d * SR)
        if p is None: pos += m; prev = None; continue
        fr = hz(p); seg = np.full(m, fr)
        if prev: g = min(m, int(glide * SR)); seg[:g] = np.linspace(prev, fr, g)
        ts = np.arange(m) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * ts) * np.clip((ts - .25) / .4, 0, 1)
        f[pos:pos + m] = seg * vib
        e = np.minimum(1, ts / .06) * np.minimum(1, (d - ts) / .08 + .35); a[pos:pos + m] = np.clip(e, 0, 1); prev = fr; pos += m
    a = np.convolve(a, np.ones(int(.03 * SR)) / int(.03 * SR), 'same')
    ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .22 * np.sin(2 * ph + .3) + .07 * np.sin(3 * ph + 1.1) + .03 * np.sin(4 * ph)
    breath = X.bp(R.standard_normal(n), 900, 5200) * .16 + X.bp(R.standard_normal(n), 300, 900) * .05
    y = (tone * .8 + breath * (.5 + .5 * np.sin(ph * .5) ** 2)) * a
    y = np.convolve(y, [.6, .4], 'same')
    X.add(music, (y * v).astype(np.float32), t0, 1, .1)

def pad(inst, p, t, d, v, pan=0, g=.6): X.add(music, S.note(inst, p, d, v, attack=1.2, release=1.4), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.6): X.add(music, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)

# ---------- tanpura drone, all through (out under the accusation) ----------
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
t0, i = 0.0, 0
while t0 < DUR:
    g = 0.25 if 34.0 < t0 < 37.4 else 1.0
    for f, dt, pan in [(110.0, 0, -.3), (146.83, .62, .2), (146.83, 1.24, .25), (73.42, 1.86, -.1)]:
        if t0 + dt < DUR - .5: X.add(music, tanpura_pluck(f, v=.1 * g, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6

# ---------- string beds by chapter ----------
pad('cellos', 'D3', 0, 6.6, .2, -.2); pad('violas', 'A3', .4, 6.2, .14, .2)                                        # the hem
pad('cellos', 'G2', 6.6, 5.6, .2, -.2); pad('violas', 'D3', 6.7, 5.5, .14, .2); pad('violins', 'B3', 8.0, 4.0, .1, .3)   # the amla
pad('cellos', 'D3', 12.1, 4.3, .24, -.2); pad('violas', 'A3', 12.2, 4.2, .16, .25); pad('violins', 'F#4', 13.0, 3.3, .12, .3)   # the line
pad('cellos', 'B2', 16.4, 10.2, .2, -.2); pad('violas', 'F#3', 16.5, 10.0, .13, .25)                              # the legend opens
pad('cellos', 'G2', 26.6, 4.4, .2, -.2); pad('violas', 'D3', 26.7, 4.3, .13, .25); pad('violins', 'B3', 27.6, 3.4, .09, .3)   # night
pad('cellos', 'A2', 31.0, 3.0, .18, -.2); pad('violas', 'E3', 31.0, 2.6, .12, .2)
pad('contrabass', 'D2', 34.0, 3.6, .3, 0, .7); pad('cellos', 'D#2', 34.3, 3.3, .14, .2, .5)                       # the accusation: a low rub
pad('cellos', 'B2', 37.6, 4.4, .18, -.2); pad('violas', 'F#3', 37.7, 4.2, .12, .25); pad('vibraphone_bowed', 'F#5', 38.6, 3.2, .14, .3, .5)   # dream
pad('cellos', 'D3', 41.9, 4.6, .2, -.2); pad('violas', 'A3', 42.0, 4.4, .14, .2); pad('violins', 'D4', 44.7, 1.8, .12, .3)
pad('cellos', 'G2', 46.6, 3.8, .22, -.2); pad('violas', 'D3', 46.7, 3.7, .15, .2); pad('violins', 'A#3', 47.6, 2.8, .1, .3)   # hidden (minor colour)
pad('cellos', 'A2', 50.3, 2.9, .24, -.2); pad('violas', 'E3', 50.4, 2.8, .18, .2); pad('violins', 'C#4', 51.2, 2.0, .16, .3)   # the loom: dominant, rising
pad('cellos', 'D3', 53.1, 11.6, .26, -.2); pad('violas', 'A3', 53.1, 11.5, .19, .25); pad('violins', 'F#4', 53.2, 11.3, .15, .3); pad('contrabass', 'D2', 53.1, 5.0, .25, 0, .5)   # seen: D major
pad('cellos', 'B2', 65.0, 3.0, .18, -.2); pad('violas', 'F#3', 65.0, 3.0, .12, .2)
pad('cellos', 'G2', 67.9, 2.6, .18, -.2); pad('violas', 'D3', 67.9, 2.6, .13, .2)
pad('cellos', 'D3', 70.3, 3.6, .2, -.2); pad('violas', 'A3', 70.4, 3.4, .14, .2); pad('violins', 'F#4', 70.6, 3.0, .1, .3)

# ---------- the bansuri: Gopinath's voice ----------
bansuri([('A5', .5), ('F#5', .35), ('E5', 1.1)], .35, .26)                                                  # the hook: a call from far off
bansuri([('D5', .25), ('E5', .25), ('F#5', .3), ('A5', 1.3)], 3.15, .3)                                      # her feet glimpsed
bansuri([('D5', .3), ('E5', .3), ('F#5', .35), ('A5', .45), ('B5', .25), ('A5', 1.0)], 20.85, .34)            # "only Gopinath": his flute is drawn
bansuri([('B4', .38), ('D5', .38), ('E5', .55), ('F#5', .32), ('E5', .32), ('D5', .85), (None, .15),        # the night walk
         ('E5', .3), ('F#5', .3), ('A5', .7), ('B5', .18), ('A5', .45), ('F#5', .9)], 27.55, .36)
bansuri([('E5', .35), ('D5', .55)], 31.05, .3)                                                                # …and the flute stops at dawn
bansuri([('F#5', .4), ('A5', .4), ('B5', .4), ('D6', 1.4)], 40.2, .22)                                        # the dream: far, high
bansuri([('A5', .4), ('B5', .2), ('A5', .3), ('F#5', .3), ('E5', .3), ('F#5', .4), ('A5', .5), ('D6', 1.3)], 53.25, .36)   # seen
bansuri([('D5', .5), ('E5', .5), ('F#5', .6), ('A5', .5), ('F#5', .4), ('E5', .5), ('D5', 1.1), (None, .3),
         ('F#5', .4), ('A5', .4), ('B5', .6), ('A5', .4), ('F#5', .5), ('A5', 1.4)], 57.2, .32)                # the tradition, full
bansuri([('B4', .5), ('D5', .5), ('E5', .7), ('D5', 1.3)], 65.3, .26)                                          # the coda
bansuri([('F#5', .4), ('E5', .4), ('D5', .5), ('A4', .4), ('D5', 2.6)], 70.6, .3)                              # end

# ---------- accents ----------
def chime(p, t, v=.25, g=.5, pan=0.): note('hand_chimes', p, t, 2.5, v, g, pan)
def harp(p, t, v=.4, g=.55, pan=0.): note('harp', p, t, 3, v, g, pan)
chime('A6', 1.0, .18, .45, .2)                                                    # one thread turns red
for j, p in enumerate(['D5', 'F#5', 'A5', 'D6']): harp(p, 3.2 + j * .06, .35, .5, (j - 1.5) * .2)   # the hem lifts
note('vibraphone_bowed', 'F#4', 5.2, 1.6, .2, .5)                                    # ୩୬୪ ଦିନ
for k in range(6): chime(['D6', 'E6', 'F#6', 'A6', 'B6', 'D7'][k], 13.0 + k * .45, .14, .35, (k - 2.5) * .2)   # the line grows
for j, p in enumerate(['B3', 'D4', 'F#4', 'B4']): harp(p, 16.5 + j * .08, .32, .45)   # the legend opens
for k, t in enumerate([22.55, 23.9, 25.25]): chime(['F#6', 'A6', 'B6'][k], t, .14, .35, -.3 + k * .3)   # each day she comes
chime('D7', 32.45, .2, .45, .3); note('glockenspiel', 'A6', 32.5, 1.5, .25, .35)       # the gold glints
for j, p in enumerate(['B3', 'D4', 'F#4', 'A4', 'B4', 'D5', 'F#5']): harp(p, 37.7 + j * .09, .28, .45, (j - 3) * .15)   # the dream
for j, p in enumerate(['D5', 'F#5', 'A5', 'D6', 'F#6']): harp(p, 40.2 + j * .1, .3, .45, (j - 2) * .2)   # the lotus opens
note('tubular_bells', 'D5', 40.25, 4, .32, .4)
note('nepal_bells', 'A5', 44.75, 3, .4, .45)                                         # the palanquin arrives
note('vibraphone_bowed', 'A#4', 47.6, 2.2, .2, .45)                                  # hidden
note('tubular_bells', 'D5', 53.3, 5, .5, .5); note('nepal_bells', 'D6', 53.35, 4, .5, .5)   # seen
for j, p in enumerate(['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): harp(p, 53.15 + j * .05, .36, .55, (j - 3) * .15)
for k in range(6): chime(['D6', 'E6', 'F#6', 'A6', 'B6', 'D7'][k], 59.25 + k * .16, .16, .35, (k - 2.5) * .25)   # the diyas
chime('A6', 67.95, .16, .4, .2); chime('D7', 68.1, .14, .35, -.2)                     # the hands fold
note('tubular_bells', 'A4', 71.0, 4, .3, .4); note('nepal_bells', 'D6', 71.05, 3, .3, .35)

# the bearers' rhythm (the journey from the north): a soft frame drum in a walking 4
for k in range(10):
    t = 42.4 + k * .24; X.add(music, S.note('frame_drum', 'D3' if k % 4 == 0 else 'A3', .5, .5 if k % 2 == 0 else .3), t, .45, (.2 if k % 2 else -.2))
# the accusation: a heartbeat under the drone
for t in (34.3, 35.15, 36.0, 36.85): X.add(music, X.heartbeat(.7), t, .55, 0)

# ---------- foley ----------
def brush(d=.5, v=1.0):   # a finger drawing rice paste: a soft wet slide
    n = X.noise(d); e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 1.5
    return (X.bp(n, 500, 2400) * e * .05 * v).astype(np.float32)
def tap(v=1.0):   # bare foot on a mud floor
    d = .12; t = tt(d); return ((X.lp(X.noise(d), 600) * np.exp(-t * 40) * .25 + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30) * .2) * v).astype(np.float32)
def crickets(d):
    t = tt(d); y = np.zeros_like(t)
    for f, r_, ph in [(4400, 14, 0), (4900, 17, 1.3), (4100, 12, 2.1)]: y += np.sin(2 * np.pi * f * t) * (np.sin(2 * np.pi * r_ * t + ph) > .3) * (np.sin(2 * np.pi * .45 * t + ph) > -.2)
    return (X.lp(y, 7000) * .008).astype(np.float32)
def bird(v=1.0):
    t = tt(.32); f = 2600 + 900 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .32) ** 2
    return (y * .045 * v).astype(np.float32)
def jingle(v=1.0):   # ghungroo: anklet bells
    d = .9; t = tt(d); y = np.zeros_like(t)
    for k in range(9):
        s = int(R.uniform(0, .25) * SR); f = R.uniform(4200, 7800); tk = t[:len(t) - s]
        y[s:] += np.sin(2 * np.pi * f * tk) * np.exp(-tk * R.uniform(9, 16)) * R.uniform(.4, 1)
    return (y * .07 * v).astype(np.float32)
def conch(d=2.4, v=1.0):   # shankha: a brassy horn tone with a slow swell
    t = tt(d); f = 293.66 * (1 + .004 * np.sin(2 * np.pi * 4.6 * t)) * (1 + .02 * np.minimum(1, t / .4)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum((1 / h ** 1.1) * np.sin(h * ph) for h in range(1, 10)); e = np.minimum(1, t / .35) * np.minimum(1, (d - t) / .5)
    return (X.lp(y * e, 2800) * .12 * v + X.bp(X.noise(d), 600, 2000) * e * .01).astype(np.float32)
def clackw(v=1.0): y = S.note('woodblock', 'C5', .3, .5 * v); return ((y if y.ndim == 1 else y[:, 0]) * .6).astype(np.float32)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)
def murmur(d): n = X.noise(d); m = X.bp(n, 250, 900) * (0.6 + .4 * np.abs(np.sin(2 * np.pi * 1.7 * tt(d)[:len(n)]) * np.sin(2 * np.pi * .6 * tt(d)[:len(n)] + 1))); return (m * .02).astype(np.float32)

X.add(amb, fade(X.lp(X.noise(6.6), 300) * .006 + 0, .3, .5), 0, 1, 0)                # sanctum room tone
for t in (7.6, 8.9, 10.6, 11.6): X.add(amb, bird(.8), t, 1, .5 if t % 2 > 1 else -.4)  # morning at the amla
X.add(fx, X.whoosh(.7, .3), 6.4, .45, 0); X.add(fx, X.whoosh(.7, .3), 12.05, .45, 0)   # the pan, the crane
X.add(amb, fade(murmur(3.6), .8, .6), 12.8, 1, .1)                                      # the crowd at Sakshigopal, far
X.add(fx, X.whoosh(.5, .45), 15.85, .5, 0)                                             # through the temple door
for t, d in [(16.55, 1.5), (18.1, .8), (18.4, .8), (20.5, .8), (20.9, 1.0), (22.0, .9), (28.3, 1.3), (37.6, 1.2), (38.5, 1.0), (40.2, 1.2), (41.9, .8), (44.9, .8), (46.8, 1.6)]: X.add(fx, brush(d), t, .9, .1)
for d in range(3):
    for k in range(3): X.add(fx, tap(.8), 22.55 + d * 1.35 + k * .17, .7, -.1)        # her steps, each day
X.add(fx, X.ignite(.3), 24.0, .4, .3); X.add(fx, X.ignite(.3), 29.2, .4, .1)            # her diya; the lamp in her door
X.add(amb, fade(crickets(4.6), .8, .7), 26.6, 1, .1)                                    # night
for i in range(12): X.add(fx, tap(.5), 27.6 + i * .22, .55, -.3 + i * .05)              # his steps, softly
for t in (31.2, 32.2, 33.4): X.add(amb, bird(.7), t, 1, .4)                             # dawn
X.add(fx, X.ding(.35), 31.6, .35, -.1)                                                  # gold on the floor
for i in range(7): X.add(fx, tap(1.4), 34.1 + i * .1, .8, (i - 3) * .15)                # the village's heavy feet
X.add(amb, fade(murmur(2.8), .3, .5), 34.1, 1.6, 0)
X.add(amb, fade(crickets(4.4) * .6, .8, .7), 37.4, 1, -.1)                             # the palace at night
X.add(fx, X.whoosh(.8, .35), 41.85, .5, 0)                                             # up to the north
X.add(fx, X.whoosh(.6, .4), 49.6, .5, 0)                                               # into the cloth
for k in range(8): X.add(fx, clackw(.8 if k % 2 == 0 else .55), 51.3 + k * .2, .6, (.2 if k % 2 else -.2))   # the loom
X.add(fx, (X.bp(X.noise(1.6), 1500, 6000) * np.hanning(int(1.6 * SR)) * .03).astype(np.float32), 51.1, 1, 0)  # threads
X.add(fx, jingle(1.0), 53.3, .8, .1); X.add(fx, jingle(.7), 53.6, .7, -.1)               # anklet bells
X.add(fx, conch(2.4, 1.0), 54.4, .8, 0)                                                 # the priests' conch
for k in range(6): X.add(fx, X.ignite(.18), 59.25 + k * .16, .3, (k - 2.5) * .2)          # diyas
X.add(fx, X.whoosh(.9, .25), 64.6, .4, 0)                                              # the bloom
X.add(amb, fade(murmur(3.0) * .7, .8, .8), 69.8, 1, 0)                                  # the line today
for t in (70.8, 72.0): X.add(amb, bird(.6), t, 1, .4)

# ---------- mix ----------
mfade = np.ones(N); mfade[int(73.2 * SR):] = np.linspace(1, .55, N - int(73.2 * SR))
bus = music * .62 * duck[:, None] * mfade[:, None] + fx * .9 * (1 - .3 * np.clip(env * 4, 0, 1))[:, None] + amb
bus = S.room(bus, size=.55, mix=.22)
out = bus + np.stack([vo, vo], 1) * .82
sp = env > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .82), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
f = int(.02 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None]
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'nepal_bells', 'glockenspiel', 'frame_drum', 'woodblock', 'vibraphone_bowed', 'cellos', 'violas', 'violins', 'contrabass'])))
