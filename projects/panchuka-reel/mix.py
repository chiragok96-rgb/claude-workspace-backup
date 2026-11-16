# Panchuka: voice + score + foley → out/mix.wav (55.5 s). Run: $LIB/.venv/bin/python mix.py
# The score follows the story, all in D: river dawn (open fifths) → the panji (IV, paper and stylus) → the five beshas (I, harp
# flourish on each name, bell on Rajarajeshwara) → the lost tithi (vi, glass descending) → night of lamps (crickets, IV–V–I rising,
# the flame) → dawn again (harp, flute, birds). Every accent sits on a picture event that is itself locked to a word.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 55.5; N = int(DUR * SR)
R = np.random.default_rng(11)

# ---------- voice ----------
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/voiceover.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 75); vo = X.compress(X.norm(vo, .9), thr=.22, ratio=2.8); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .7 * np.clip(env * 4, 0, 1); sm = int(.18 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')
def st(n=N): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()

# ---------- tanpura drone ----------
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = np.arange(int(d * SR)) / SR; r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
t0, i = 0.0, 0
while t0 < DUR:
    for f, dt, pan in [(110.0, 0, -.3), (146.83, .62, .2), (146.83, 1.24, .25), (73.42, 1.86, -.1)]:
        if t0 + dt < DUR: X.add(music, tanpura_pluck(f, v=.11, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6

# ---------- string bed, by chapter ----------
def pad(inst, p, t, d, v, pan=0, g=.6): X.add(music, S.note(inst, p, d, v, attack=1.2, release=1.2), t, g, pan)
pad('cellos', 'D3', 0.0, 9.2, .24, -.2); pad('violas', 'A3', .6, 8.6, .17, .25); pad('vibraphone_bowed', 'A4', 4.4, 4.6, .16, .3, .45)   # river, moons
pad('cellos', 'G2', 8.9, 5.7, .24, -.2); pad('violas', 'D3', 9.0, 5.6, .17, .2); pad('violins', 'B3', 11.1, 3.4, .12, .3)              # the panji (IV)
pad('cellos', 'B2', 14.5, 5.0, .22, -.2); pad('violas', 'F#3', 14.6, 4.9, .16, .2)                                                    # the vow (vi)
pad('cellos', 'A2', 19.4, 1.8, .24, -.2); pad('violas', 'E3', 19.4, 1.8, .18, .2); pad('violins', 'C#4', 19.5, 1.7, .14, .3)          # the marks rise (V)
pad('cellos', 'D3', 21.2, 9.2, .28, -.2); pad('violas', 'A3', 21.25, 9.1, .2, .25); pad('violins', 'F#4', 21.3, 9.0, .15, .3); pad('contrabass', 'D2', 29.1, 1.6, .25, 0, .5)   # the five beshas (I)
pad('cellos', 'B2', 30.4, 8.3, .24, -.2); pad('violas', 'F#3', 30.5, 8.2, .17, .25)                                                   # the lost tithi (vi)
pad('cellos', 'G2', 38.7, 3.8, .24, -.2); pad('violas', 'D3', 38.8, 3.7, .17, .2); pad('violins', 'A#3', 41.2, 1.3, .12, .3)          # no Bankachuda (iv colour)
pad('cellos', 'G2', 43.0, 3.7, .2, -.2); pad('violas', 'B3', 43.1, 3.6, .14, .25)                                                     # night: IV
pad('cellos', 'A2', 46.7, 2.1, .22, -.2); pad('violas', 'C#4', 46.8, 2.0, .15, .25); pad('violins', 'E4', 46.9, 1.9, .12, .3)         # V, the flame
pad('cellos', 'D3', 48.8, 6.7, .24, -.2); pad('violas', 'A3', 48.9, 6.6, .17, .25); pad('violins', 'F#4', 50.6, 4.9, .13, .3)         # I, toward dawn
for t, p_ in [(50.9, 'A5'), (51.5, 'B5'), (52.1, 'D6'), (53.1, 'E6'), (53.7, 'F#6')]: X.add(music, S.note('flute', p_, .9, .32, attack=.08, release=.4), t, .5, .15)

# ---------- accents (all on picture events) ----------
def chime(p, t, v=.32, g=.6, pan=0.0): X.add(music, S.note('hand_chimes', p, 2.5, v), t, g, pan)
def harp(p, t, v=.45, g=.6, pan=0.0): X.add(music, S.note('harp', p, 3, v), t, g, pan)
def glass(p, t, v=.35, g=.55, pan=0.0): X.add(music, S.note('vibraphone_bowed', p, 2.6, v, attack=.05, release=.9), t, g * 1.1, pan)
for k_, t in enumerate([4.55, 4.89, 5.23, 5.57, 5.91]): chime(['A5', 'D6', 'E6', 'F#6', 'A6'][k_], t + .2, .22, .5, (k_ - 2) * .25)   # each moon brushed in
glass('F#5', 7.98, .32); glass('D5', 8.25, .28)                                                     # Dvadashi's moon dissolves
for k_, t in enumerate([11.12, 11.26, 11.4, 11.54, 11.68]): chime(['D6', 'E6', 'F#6', 'A6', 'B6'][k_], t + .1, .26, .55, (k_ - 2) * .2)  # the last five turn gold
chime('D6', 17.7, .2, .45, -.2); chime('A6', 17.85, .18, .4, .2)                                   # the fish leaps away
for k_ in range(5): chime(['D6', 'F#6', 'A6', 'B6', 'D7'][k_], 19.5 + k_ * .07, .2, .45, (k_ - 2) * .25)   # the marks rise
for k_, t in enumerate([23.39, 24.6, 25.7, 26.73]):                                                 # a harp flourish on each name
    for j, p_ in enumerate(['D4', 'F#4', 'A4', 'D5'][:3 + (k_ % 2)]): harp(p_ if k_ % 2 == 0 else ['A3', 'D4', 'F#4', 'A4'][j], t + j * .06, .4, .55, (k_ - 1.5) * .3)
for j, p_ in enumerate(['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): harp(p_, 29.16 + j * .05, .42, .55, (j - 3) * .15)   # Rajarajeshwara: a glissando
X.add(music, S.note('tubular_bells', 'D5', 5, .5), 29.16, .55, 0)
for k_ in range(5): chime(['D7', 'A6', 'F#6', 'E6', 'D6'][k_], 30.2 + k_ * .08, .16, .4, (2 - k_) * .25)   # the medallions descend
glass('B4', 31.95, .3); glass('F#4', 32.95, .3); glass('D4', 33.3, .26)                              # Dvadashi named; it crumbles
for k_, t in enumerate([34.35, 34.55, 34.75]): chime(['D6', 'E6', 'F#6'][k_], t, .22, .5, (k_ - 1) * .4)   # three sunrises
X.add(music, S.note('vibraphone_bowed', 'C#5', 1.6, .2), 36.15, .45, 0)                              # "touches no sunrise"
chime('B6', 39.95, .25, .5, .3)                                                                      # Bankachuda's glint
glass('A#4', 41.3, .3); glass('G4', 41.75, .26)                                                      # "won't happen this year"
chime('A6', 44.95, .16, .4, .3); chime('D7', 45.1, .14, .35, .35)                                    # the four diyas ready
X.add(music, S.note('tubular_bells', 'A4', 3.5, .3), 46.95, .4, 0)                                   # the first flame
chime('F#7', 48.85, .14, .35, .4)                                                                    # the moon brightens
for j, p_ in enumerate(['D4', 'A4', 'D5', 'F#5', 'A5']): harp(p_, 50.55 + j * .07, .36, .5, (j - 2) * .2)   # dawn
chime('D6', 53.0, .2, .45, .3)                                                                       # the heron glances

# ---------- foley ----------
def paper(d=.4, v=1.0): x = X.bp(X.noise(d), 1500, 6000) * np.hanning(int(round(d * SR))) * .22 * v; return x.astype(np.float32)
def stylus(d=.45, v=1.0):   # a stylus scratching a groove into palm leaf: gritty, high, broken
    n = X.noise(d); g = (np.random.default_rng(int(d * 1e4)).random(len(n)) > .55).astype(float); g = np.convolve(g, np.ones(60) / 60, 'same')
    return (X.bp(n, 2500, 9000) * g * np.hanning(len(n)) * .09 * v).astype(np.float32)
def plip(v=1.0):
    t = np.arange(int(.25 * SR)) / SR; f = 900 * np.exp(-t * 9) + 380; y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 18)
    return (y * .22 * v + X.bp(X.noise(.25), 1500, 5000) * np.exp(-t * 40) * .05 * v).astype(np.float32)
def sparkle(d=1.0, v=1.0):
    y = np.zeros(int(d * SR)); r = np.random.default_rng(int(v * 100))
    for _ in range(int(40 * d)): s = r.integers(0, len(y) - 2000); f = r.uniform(4000, 9000); tt = np.arange(1800) / SR; y[s:s + 1800] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 70) * r.uniform(.3, 1)
    return (y * .03 * v).astype(np.float32)
def river(d):
    n = X.lp(X.noise(d), 900) * .5 + X.bp(X.noise(d), 900, 3000) * .15; t = np.arange(len(n)) / SR
    return (n * (.6 + .4 * np.sin(2 * np.pi * .23 * t) * np.sin(2 * np.pi * .07 * t + 1)) * .02).astype(np.float32)
def crickets(d):
    t = np.arange(int(d * SR)) / SR; y = np.zeros_like(t)
    for f, r_, ph in [(4400, 14, 0), (4900, 17, 1.3), (4100, 12, 2.1)]:
        gate = (np.sin(2 * np.pi * r_ * t + ph) > .3) * (np.sin(2 * np.pi * .45 * t + ph) > -.2); y += np.sin(2 * np.pi * f * t) * gate
    return (X.lp(y, 7000) * .009).astype(np.float32)
def bird(v=1.0):
    t = np.arange(int(.32 * SR)) / SR; f = 2600 + 900 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .32) ** 2
    return (y * .05 * v).astype(np.float32)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)
X.add(amb, fade(river(9.4)), 0, 1, -.1); X.add(amb, fade(river(5.2), .5, .4), 50.3, 1, -.1)          # the river (and back to it for the loop)
X.add(amb, fade(crickets(8.2), .8, .7), 42.6, 1, .1)                                                   # night
for t in (51.0, 52.3, 54.1): X.add(amb, bird(.9), t, 1, .5)                                            # dawn birds
X.add(fx, plip(), 2.65, 1, -.3); X.add(fx, plip(.7), 17.62, 1, -.2)                                    # the fish
X.add(fx, X.thump(.22, 140), 8.05, .6, 0); X.add(fx, paper(.3, .6), 8.07, .5, 0)                       # the ୪ seal stamped
X.add(fx, paper(1.0, .8), 8.75, .7, -.2); X.add(fx, paper(.9, .8), 8.95, .7, .2)                       # rice paper into leaves
for t, d in [(9.35, .7), (12.68, .55), (13.6, .45), (13.95, .45), (16.2, .5), (18.45, .5), (18.72, .3), (32.0, .5), (37.3, .9)]: X.add(fx, stylus(d), t, 1, .1)   # the stylus
for t in (14.35, 33.75): X.add(fx, paper(.7, .9), t, .7, 0)                                            # the manuscript scrolls
X.add(fx, X.whoosh(.6, .3), 19.4, .5, 0); X.add(fx, X.whoosh(.6, .3), 30.55, .5, 0)                  # discs fly
X.add(fx, sparkle(.8, .8), 32.95, 1, .2)                                                               # Dvadashi's gold crumbles
X.add(fx, X.thump(.22, 140), 37.98, .6, -.1)                                                          # the tithi-kshaya stamp
X.add(fx, X.whoosh(.55, .4), 38.62, .6, 0)                                                             # the dive into the vermilion band
X.add(fx, sparkle(1.4, 1.0), 41.35, 1, 0)                                                             # Bankachuda's gold falls away
X.add(fx, X.ignite(.35), 46.9, .6, -.2)                                                               # the first diya catches
X.add(fx, X.whoosh(.8, .25), 50.0, .4, 0)                                                              # the bloom into dawn

# ---------- mix ----------
bus = music * .7 * duck[:, None] + fx * .9 * (1 - .35 * np.clip(env * 4, 0, 1))[:, None] + amb
bus = S.room(bus, size=.5, mix=.2)
out = bus + np.stack([vo, vo], 1) * .8
sp = env > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice (speech) %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .8), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
for a, b, nm in [(23.3, 30.1, 'beshas'), (46.8, 48.4, 'flame'), (41.2, 42.4, 'no Bankachuda'), (50.5, 55.5, 'dawn')]:
    seg = lambda x: x[int(a * SR):int(b * SR)]; print('  %-14s voice %6.1f  bed %6.1f' % (nm, rms(seg(vo) * .8), rms(seg(bus).mean(1))))
f = int(.02 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None]
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'flute', 'vibraphone_bowed', 'cellos', 'violas', 'violins', 'contrabass'])))
