# Kartika Wind: voice + score + foley → out/mix.wav (50.2 s, loops). Run: $LIB/.venv/bin/python mix.py
# The wind is the protagonist: it is under everything, swells to weave the ribbon, turns with a great sweep on the full moon,
# fills the sails, carries the crow, and rises to a gale on "Kartikara pabana" — then settles to exactly where the film began.
# In D. Ceremony: strings, a soft brass call. Indonesia: gamelan (gong, metallophones in pelog colour). Voyage: frame drum.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 50.2; N = int(DUR * SR)
R = np.random.default_rng(21)
def st(n=N): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()
def tt(d): return np.arange(int(round(d * SR))) / SR
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 80); vo = vo + .3 * X.bp(vo, 2600, 6000); vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .66 * np.clip(env * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')
def pad(inst, p, t, d, v, pan=0, g=.6, att=1.2): X.add(music, S.note(inst, p, d, v, attack=att, release=1.4), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.6, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def hit(inst, var, t, v, g=.6, pan=0., buf=None): X.add(music if buf is None else buf, S.hit(inst, var, v), t, g, pan)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)

# ---------- the wind: one long gusting bed, its strength following the story (identical level at 0 and at the end) ----------
tw = np.arange(N) / SR
def strength(t):
    s = .55 + 0 * t
    s += .45 * np.exp(-((t - .9) / .7) ** 2)                       # it weaves the ribbon
    s -= .25 * (np.clip((t - 2.2) / 1.5, 0, 1) * (1 - np.clip((t - 16.2) / 1.0, 0, 1)))   # quiet under the ceremony and the name
    s += .9 * np.exp(-((t - 20.1) / .55) ** 2)                     # the wind turns
    s += .35 * np.clip((t - 20.6) / 1, 0, 1) * (1 - np.clip((t - 24.4) / 1.5, 0, 1))      # in the sails
    s += .15 * np.clip((t - 24.6) / 1, 0, 1) * (1 - np.clip((t - 26.8) / .6, 0, 1))       # lost at sea: lonelier, higher
    s -= .3 * np.clip((t - 26.8) / .6, 0, 1) * (1 - np.clip((t - 35.4) / .8, 0, 1))       # the wall: the tale is told indoors
    s -= .15 * np.clip((t - 42.0) / .5, 0, 1) * (1 - np.clip((t - 44.6) / .5, 0, 1))
    s += 1.1 * np.clip((t - 44.6) / 3.2, 0, 1) ** 1.6 * (1 - np.clip((t - 48.3) / 1.6, 0, 1))   # the gale that unties the knot
    return np.clip(s, .15, 2.2)
gs = strength(tw) * (1 + .25 * np.sin(2 * np.pi * tw / 3.7) * np.sin(2 * np.pi * tw / 1.9 + 1))
n1 = X.noise(DUR)[:N]; n2 = X.noise(DUR)[:N]
low = X.lp(n1, 380) * .05; mid = X.bp(n2, 500, 2400) * .018
whis = np.zeros(N); f0 = 900 + 500 * np.sin(2 * np.pi * tw / 4.3)                  # a whistling edge that bends with the gusts
for k_ in range(3): whis += np.sin(2 * np.pi * np.cumsum(f0 * (1 + .25 * k_) + 30 * np.sin(tw * (1.3 + k_))) / SR) * (.004 / (k_ + 1))
w = (low + mid * np.clip(gs - .4, 0, 2) + whis * np.clip(gs - .9, 0, 2)) * gs
amb[:, 0] += (w * (1 + .15 * np.sin(tw * .7))).astype(np.float32); amb[:, 1] += (w * (1 - .15 * np.sin(tw * .7))).astype(np.float32)

# ---------- tanpura drone in D (out under the wall; back for the voyage home) ----------
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
t0, i = 16.4, 0
while t0 < 44.0:
    g = .45 if 26.8 < t0 < 35.4 else 1.0
    for f, dt, pan in [(73.42, 0, -.3), (110.0, .62, .2), (110.0, 1.24, .25), (55.0, 1.86, -.1)]:
        X.add(music, tanpura_pluck(f, v=.09 * g, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6
# ---------- strings and brass ----------
pad('violas', 'A3', .1, 2.4, .1, .2); pad('cellos', 'D3', .1, 2.4, .12, -.2)                                         # the wind weaves
pad('cellos', 'D3', 2.0, 3.6, .2, -.2); pad('violas', 'F#3', 2.1, 3.5, .14, .2); pad('violins', 'A4', 3.0, 2.6, .12, .3)  # a ceremony
pad('horn', 'D3', 3.15, 1.9, .34, 0, .45, .2); pad('horn', 'A3', 3.2, 1.8, .26, 0, .35, .2)                          # "Rashtrapati"
pad('cellos', 'B2', 5.7, 2.4, .2, -.2); pad('violas', 'F#3', 5.7, 2.4, .14, .2)
pad('cellos', 'G2', 8.0, 3.2, .2, -.2); pad('violas', 'D3', 8.0, 3.1, .14, .2); pad('violins', 'C#4', 9.2, 2.0, .12, .3)   # why such honour? (unresolved)
pad('cellos', 'D3', 11.2, 5.0, .14, -.2); pad('vibraphone_bowed', 'A4', 11.3, 4.8, .14, .2, .5)
pad('contrabass', 'D2', 16.4, 4.2, .26, 0, .6); pad('cellos', 'D3', 16.5, 4.0, .16, -.2)                              # a thousand years ago
pad('cellos', 'A2', 20.6, 4.0, .2, -.2); pad('violas', 'E3', 20.7, 3.9, .14, .2); pad('violins', 'A4', 21.3, 3.2, .12, .3)   # they set sail
pad('vibraphone_bowed', 'D5', 24.7, 2.2, .14, .2, .5)                                                                 # lost at sea
pad('cellos', 'D3', 35.9, 3.0, .2, -.2); pad('violas', 'A3', 36.0, 2.9, .14, .25); pad('violins', 'F#4', 36.5, 2.4, .12, .3)
pad('cellos', 'G2', 38.9, 3.2, .2, -.2); pad('violas', 'D3', 38.9, 3.1, .14, .2); pad('violins', 'B4', 39.6, 2.6, .12, .3)
pad('cellos', 'D3', 42.3, 2.4, .2, -.2); pad('violas', 'A3', 42.3, 2.3, .14, .2); pad('horn', 'D3', 43.3, 1.6, .3, 0, .4, .2)
pad('contrabass', 'D2', 44.6, 4.0, .22, 0, .5); pad('cellos', 'A2', 44.7, 3.6, .14, -.2); pad('violins', 'E5', 45.6, 2.6, .1, .3)   # but for a thousand years…
pad('cellos', 'D3', 47.6, 2.6, .26, -.2); pad('violas', 'A3', 47.6, 2.6, .2, .25); pad('violins', 'F#4', 47.62, 2.5, .18, .3); pad('violins', 'D5', 47.65, 2.5, .12, -.3)

# ---------- the bansuri (synth): breathy bamboo, the voice of the voyage ----------
MID = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(p): n, o = p[:-1], int(p[-1]); return 440 * 2 ** ((MID[n] + 12 * (o + 1) - 69) / 12)
def bansuri(phrase, t0, v=.5, glide=.06):
    total = sum(d for _, d in phrase) + .6; n = int(total * SR); f = np.zeros(n); a = np.zeros(n); pos = 0; prev = None
    for p, d in phrase:
        m = int(d * SR)
        if p is None: pos += m; prev = None; continue
        fr = hz(p); seg_ = np.full(m, fr)
        if prev: g = min(m, int(glide * SR)); seg_[:g] = np.linspace(prev, fr, g)
        ts = np.arange(m) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * ts) * np.clip((ts - .25) / .4, 0, 1)
        f[pos:pos + m] = seg_ * vib; e = np.minimum(1, ts / .06) * np.minimum(1, (d - ts) / .08 + .35); a[pos:pos + m] = np.clip(e, 0, 1); prev = fr; pos += m
    a = np.convolve(a, np.ones(int(.03 * SR)) / int(.03 * SR), 'same'); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .22 * np.sin(2 * ph + .3) + .07 * np.sin(3 * ph + 1.1)
    breath = X.bp(R.standard_normal(n), 900, 5200) * .16; y = (tone * .8 + breath) * a
    X.add(music, (y * v).astype(np.float32), t0, 1, .1)
bansuri([('A5', .5), ('F#5', .35), ('E5', 1.1)], .35, .22)
bansuri([('D5', .4), ('E5', .3), ('F#5', .4), ('A5', .5), ('B5', .3), ('A5', 1.0)], 21.0, .28)                       # they set sail
bansuri([('E5', .4), ('D5', .9)], 25.4, .2)                                                                          # lost
bansuri([('D5', .3), ('E5', .3), ('F#5', .4), ('A5', 1.2)], 36.0, .26)
bansuri([('A5', .4), ('B5', .3), ('A5', .3), ('F#5', .3), ('E5', .4), ('D5', 1.4)], 47.7, .3)                        # the Kartika wind

# ---------- accents ----------
def chime(p, t, v=.2, g=.45, pan=0.): note('hand_chimes', p, t, 2.5, v, g, pan)
def harp(p, t, v=.35, g=.5, pan=0.): note('harp', p, t, 3, v, g, pan)
for k_ in range(9): note('glockenspiel', ['D6', 'F#6', 'A6', 'B6', 'D7', 'A6', 'F#7', 'E7', 'D7'][k_], .2 + k_ * .17, 1.4, .12, .26, (k_ % 3 - 1) * .4)   # threads of light
note('glass', 'A5', .12, 2.2, .24, .38, .2)
for k_ in range(6): note('hand_chimes', ['D6', 'F#6', 'A6', 'D7', 'A6', 'F#6'][k_], 3.1 + k_ * .14, 2.0, .12, .3, (k_ - 2.5) * .25)   # Rashtrapati Bhavan draws itself
for j, p in enumerate(['A4', 'D5', 'F#5', 'A5', 'D6']): harp(p, 4.45 + j * .07, .3, .45, (j - 2) * .2)   # Odisha
def ring(t, v=1.0):   # the scissors: a bright metallic ring
    d = 1.4; y = np.zeros(int(d * SR)); tt_ = tt(d)
    for f, dec, amp in [(2960, 3.0, .5), (4410, 4.0, .35), (6120, 6.0, .2), (1830, 2.0, .25)]: y += np.sin(2 * np.pi * f * tt_) * np.exp(-tt_ * dec) * amp
    X.add(fx, (y * .05 * v).astype(np.float32), t, .7, .3)
ring(2.75); ring(43.4, .9)
hit('gong', None, 6.8, .32, .4, 0); PEL = ['D5', 'D#5', 'F5', 'A5', 'A#5', 'A5', 'F5', 'D#5']
for k_ in range(8): note('vibraphone_hard', PEL[k_], 6.78 + k_ * .14, .9, .24, .3, (k_ % 2 - .5) * .5)            # Indonesia
for j, p in enumerate(['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5']): harp(p, 7.2 + j * .05, .3, .45, (j - 2.5) * .2)       # the knot is tied
for k_ in range(6): chime(['A5', 'B5', 'D6', 'E6', 'F#6', 'A6'][k_], 11.3 + k_ * .12, .12, .3, (k_ - 2.5) * .2)       # the name lights
note('glass', 'D6', 13.4, 1.6, .22, .35, -.2); note('glass', 'A5', 13.42, 1.6, .2, .35, .2)                         # the split
for k_ in range(12): note('glockenspiel', ['A6', 'B6', 'D7', 'E7', 'F#7', 'A7'][k_ % 6], 14.8 + k_ * .06, 1.0, .1, .22, (k_ % 3 - 1) * .5)   # ବାଲି → island
for j, p in enumerate(['D5', 'E5', 'F#5', 'A5', 'B5']): harp(p, 15.6 + j * .07, .3, .45, (j - 2) * .25)                # ଯାତ୍ରା → boat
note('tubular_bells', 'D5', 17.95, 4, .32, .4)                                                                        # the full moon of Kartika
hit('sus_cymbal', 'roll', 19.0, .3, .3, 0); hit('gong2', 'big', 20.15, .4, .4, 0)                                      # the wind turns
X.add(fx, X.whoosh(1.6, .5), 19.4, .55, -.2); X.add(fx, X.whoosh(1.2, .4), 20.0, .45, .3)
BEAT = .48
for k_ in range(9):
    t_ = 21.3 + k_ * BEAT; X.add(music, S.hit('frame_drum', 'large', .5 if k_ % 2 == 0 else .3), t_, .55, -.15); X.add(music, S.hit('frame_drum', 'small', .26), t_ + BEAT * .5, .5, .15)
note('tubular_bells', 'A4', 22.1, 3, .26, .35)                                                                        # Kalinga
def sail(t, v=1.0): d = .7; n = X.noise(d); e = np.exp(-tt(d)[:len(n)] * 5) * (1 - np.exp(-tt(d)[:len(n)] * 60)); X.add(fx, (X.bp(n, 200, 1800) * e * .12 * v).astype(np.float32), t, .7, R.uniform(-.4, .4))
for t_ in (22.7, 23.0, 23.3, 23.7, 24.0): sail(t_, .8)
def waves(d, v=1.0):
    t = tt(d); n = X.noise(d)[:len(t)]; sw = .5 + .5 * np.sin(2 * np.pi * t / 4.3) ** 2
    return (X.lp(n, 700) * .02 * sw * v).astype(np.float32)
X.add(amb, fade(waves(3.0), .8, .8), 24.4, 1, 0)
def creak(t): X.add(fx, X.creak(.6), t, .4, -.2)
creak(25.2); creak(26.1)
X.add(fx, X.ignite(.35), 26.7, .5, 0); note('vibraphone_bowed', 'A4', 26.7, 1.6, .18, .4, 0, .4)   # the boat's lamp swells into firelight
# the wall: a folk telling — marimba and kalimba, the crow's caws and wingbeats
for k_, p in enumerate(['D4', 'F4', 'A4', 'G4', 'F4', 'D4', 'E4', 'D4']): note('marimba', p, 27.2 + k_ * .3, .8, .28, .4, (k_ % 2 - .5) * .4)
def caw(t, v=1.0, pitch=1.0):
    for k_ in range(2):
        d = .22; tt_ = tt(d); f = (680 - 260 * tt_ / d) * pitch; ph = 2 * np.pi * np.cumsum(f) / SR
        saw = 2 * ((ph / (2 * np.pi)) % 1) - 1; y = X.bp(saw * .7 + X.noise(d)[:len(tt_)] * .5, 900, 2600) * np.sin(np.pi * tt_ / d) ** .6
        X.add(fx, (y * .08 * v).astype(np.float32), t + k_ * .3, .7, .25)
def wings(t0, t1):
    t_ = t0
    while t_ < t1: d = .12; n = X.noise(d); X.add(fx, (X.bp(n, 300, 1500) * np.hanning(len(n)) * .05).astype(np.float32), t_, .6, R.uniform(-.3, .3)); t_ += .16
caw(29.2); wings(29.35, 31.9); caw(31.85, .8, 1.05)                                                                   # out… and back
note('kalimba', 'A4', 32.2, 1.4, .3, .4); note('kalimba', 'F4', 32.45, 1.6, .26, .4)                                  # the shore is far
wings(33.15, 34.6); caw(33.3, .9, .95)
for k_, p in enumerate(['D5', 'F#5', 'A5', 'D6']): note('marimba', p, 34.42 + k_ * .1, 1.2, .3, .45, (k_ - 1.5) * .3)  # the shore that way!
note('hand_chimes', 'D6', 34.5, 2.4, .2, .4)
X.add(fx, X.whoosh(.8, .3), 35.5, .45, 0)                                                                            # the line becomes the route
hit('gong', None, 39.0, .28, .38, 0)
for k_ in range(14): note('vibraphone', PEL[k_ % 8], 39.2 + k_ * .14, .9, .2, .28, (k_ % 2 - .5) * .5)              # Indonesia, coming
for k_ in range(6): note('marimba', ['D3', 'A3'][k_ % 2], 39.2 + k_ * .32, 1.0, .24, .3, 0)
note('tubular_bells', 'D5', 41.1, 3.5, .34, .42); hit('nepal_bells', None, 41.12, .45, .4, .1)                       # Cuttack
X.add(fx, X.whoosh(.9, .3), 41.6, .4, 0); note('glass', 'A5', 41.95, 1.8, .26, .4)                                     # the light opens into the gate
hit('sus_cymbal', 'roll', 46.1, .35, .32, 0)
X.add(amb, fade(waves(5.2) * 1.4, 1.0, 1.0), 44.8, 1, 0); pad('vibraphone_bowed', 'D5', 44.7, 2.8, .16, .2, .5, .8)   # time rolls back to the sea
for t_ in (47.7, 47.95, 48.2): sail(t_, 1.2)   # the silks fill as sails
hit('gong', None, 47.62, .45, .5, 0); note('tubular_bells', 'D5', 47.62, 3.5, .45, .5); hit('nepal_bells', None, 47.64, .55, .5, -.2)   # the Kartika wind
for k_ in range(10): chime(['D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'E7', 'F#7', 'A7', 'D7'][k_], 47.7 + k_ * .1, .13, .3, (k_ - 4.5) * .18)
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): harp(p, 47.66 + j * .045, .34, .5, (j - 4) * .15)
def flutter(t0, t1, v):   # silk in the wind
    t_ = t0
    while t_ < t1: d = .09; n = X.noise(d); X.add(fx, (X.bp(n, 800, 4000) * np.hanning(len(n)) * .02 * v).astype(np.float32), t_, .6, R.uniform(-.5, .5)); t_ += .07 + R.uniform(0, .05)
flutter(.3, 2.0, .6); flutter(6.0, 7.5, .7); flutter(44.8, 49.0, 1.1)
X.add(amb, fade(X.bp(X.noise(10.5), 150, 900) * .006, 1.0, 1.0), 1.0, 1, 0)   # a far fair murmur under the gate
X.add(amb, fade(X.bp(X.noise(8.0), 150, 900) * .006, 1.0, 1.0), 42.2, 1, 0)

# ---------- mix ----------
bus = music * .62 * duck[:, None] + fx * .9 * (1 - .3 * np.clip(env * 4, 0, 1))[:, None] + amb * (1 - .45 * np.clip(env * 4, 0, 1))[:, None]
bus = S.room(bus, size=.55, mix=.2)
out = bus + np.stack([vo, vo], 1) * .82
sp = env > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .82), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'nepal_bells', 'glockenspiel', 'glass', 'frame_drum', 'gong', 'gong2', 'sus_cymbal', 'vibraphone', 'vibraphone_hard', 'vibraphone_bowed', 'marimba', 'kalimba', 'cellos', 'violas', 'violins', 'contrabass', 'horn'])))
