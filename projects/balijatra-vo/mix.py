# Bali Jatra (voiceover): voice + score + foley → out/mix.wav (63.6 s). Run: $LIB/.venv/bin/python mix.py
# In D. The bansuri is the scent of cloves: it calls from the far isle, writes the verse, and comes back at the fair.
# The stone: strings and a horn for "emperor of the sea". The earth: a low drone, pen and paper. The lamp: the shadow play's drum.
# The isles and Indonesia: a gamelan colour (D Eb F A Bb on metallophones and gong). The fair: bells, crowd, everything together.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 63.6; N = int(DUR * SR)
R = np.random.default_rng(11)
def st(n=N): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()
def tt(d): return np.arange(int(d * SR)) / SR

wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 80); vo = vo + .3 * X.bp(vo, 2600, 6000)
vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .66 * np.clip(env * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')

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

def pad(inst, p, t, d, v, pan=0, g=.6, att=1.2): X.add(music, S.note(inst, p, d, v, attack=att, release=1.4), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.6): X.add(music, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def hit(inst, var, t, v, g=.6, pan=0., buf=None): X.add(music if buf is None else buf, S.hit(inst, var, v), t, g, pan)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = int(a * SR), int(b * SR); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)

# ---------- tanpura drone (out under the earth, back for the lamp) ----------
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
t0, i = 0.0, 0
while t0 < DUR - .6:
    g = .35 if 20.0 < t0 < 31.0 else (.5 if 43.4 < t0 < 47.2 else 1.0)
    for f, dt, pan in [(110.0, 0, -.3), (146.83, .62, .2), (146.83, 1.24, .25), (73.42, 1.86, -.1)]:
        if t0 + dt < DUR - .4: X.add(music, tanpura_pluck(f, v=.09 * g, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6

# ---------- strings by chapter ----------
pad('violas', 'A3', .2, 7.4, .1, .2); pad('cellos', 'D3', 1.0, 6.6, .13, -.2)                                     # the shore at dawn
pad('cellos', 'D3', 9.2, 3.7, .2, -.2); pad('violas', 'A3', 9.3, 3.6, .14, .2); pad('violins', 'F#4', 10.4, 2.5, .1, .3)   # the stone
pad('cellos', 'G2', 12.85, 3.0, .24, -.2); pad('violas', 'D3', 12.9, 2.9, .16, .2); pad('violins', 'B4', 13.0, 2.6, .12, .3); pad('horn', 'D3', 12.95, 2.6, .3, 0, .5, .4)   # emperor of the sea
pad('cellos', 'A#2', 16.0, 3.9, .16, -.2); pad('violas', 'F3', 16.1, 3.8, .1, .2)                               # what ties them? (unresolved)
pad('contrabass', 'D2', 20.0, 5.2, .22, 0, .6); pad('cellos', 'D3', 24.9, 6.2, .13, -.2); pad('violas', 'F3', 25.0, 3.0, .1, .2); pad('violas', 'F#3', 28.1, 3.0, .12, .2)   # earth → the match (minor → major)
pad('cellos', 'D3', 43.4, 4.0, .14, -.2); pad('vibraphone_bowed', 'A4', 45.4, 2.6, .16, .2, .5)                   # the voyage ends; memory
pad('cellos', 'G2', 47.5, 3.2, .18, -.2); pad('violas', 'D3', 47.6, 3.1, .13, .2); pad('violins', 'B4', 49.2, 1.8, .14, .3)   # Bali Jatra
pad('cellos', 'A2', 50.6, 1.8, .14, -.2); pad('violas', 'E3', 50.6, 1.8, .1, .2)
pad('cellos', 'D3', 55.4, 8.0, .2, -.2); pad('violas', 'A3', 55.5, 7.8, .15, .25); pad('violins', 'F#4', 58.1, 5.4, .13, .3); pad('contrabass', 'D2', 58.1, 5.4, .2, 0, .5)   # partners → the fair

# ---------- the bansuri: the scent ----------
bansuri([('A5', .5), ('F#5', .35), ('E5', 1.2)], .35, .24)                                   # a call from the far isle
bansuri([('D5', .3), ('E5', .3), ('F#5', .4), ('A5', 1.2)], 2.3, .26)                         # …the scent of cloves
bansuri([('B5', .35), ('A5', .35), ('F#5', .9)], 16.7, .2)                                    # the scent curls into a question
bansuri([('A5', .4), ('F#5', .3), ('E5', .3), ('D5', 1.1)], 45.55, .22)                       # memory
bansuri([('D5', .4), ('E5', .3), ('F#5', .4), ('A5', .4), ('B5', .3), ('A5', .9)], 52.4, .26)   # Odisha answers Java
bansuri([('D5', .5), ('E5', .5), ('F#5', .6), ('A5', .5), ('F#5', .4), ('E5', .5), ('D5', 1.0), (None, .2), ('F#5', .4), ('A5', .4), ('D6', 1.6)], 57.9, .3)   # the fair, full

# ---------- accents ----------
def chime(p, t, v=.2, g=.45, pan=0.): note('hand_chimes', p, t, 2.5, v, g, pan)
def harp(p, t, v=.35, g=.5, pan=0.): note('harp', p, t, 3, v, g, pan)
for i in range(4):                                                                               # the verse, line by line
    for j, p in enumerate([['D5', 'F#5', 'A5'], ['E5', 'A5', 'B5'], ['F#5', 'A5', 'D6'], ['A5', 'B5', 'D6']][i]): harp(p, 5.05 + i * .62 + j * .09, .28, .42, (j - 1) * .25)
for j, p in enumerate(['D6', 'F#6', 'A6', 'D7']): chime(p, 11.25 + j * .22, .16, .38, (j - 1.5) * .25)
# the hook: the clove turning in the light; the rack focus; the stream of cloves; it lands on the stone
pad('vibraphone_bowed', 'D5', 0.0, 2.6, .2, .1, .5, .05); pad('vibraphone_bowed', 'A4', 0.0, 2.6, .16, -.1, .5, .05)
note('glass', 'A5', .12, 2.2, .26, .4, .2); note('glass', 'D6', .2, 2.0, .2, .35, -.2)
for k in range(7): chime(['D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'E7'][k], 1.95 + k * .28, .12, .3, (k - 3) * .25)
for k in range(5): note('glockenspiel', ['A6', 'B6', 'D7', 'F#7', 'A7'][k], 3.4 + k * .12, 1.2, .16, .28, (k - 2) * .3)
note('hand_chimes', 'D6', 4.68, 2.5, .26, .45); note('glass', 'D6', 4.7, 2.4, .24, .4)
# the loop: the clove word becomes a clove; dawn blooms out of it
pad('vibraphone_bowed', 'A4', 61.8, 1.8, .2, .1, .5, .8); note('glass', 'A5', 62.3, 1.3, .22, .35, .2)
for k in range(6): chime(['A6', 'F#6', 'E6', 'D6', 'B5', 'A5'][k], 62.0 + k * .2, .1, .28, (k - 2.5) * .25)   # gold runs into the name
note('glockenspiel', 'A6', 12.35, 1.4, .22, .3, .3)
for k in range(9): note('glockenspiel', ['D6', 'F#6', 'A6', 'B6', 'D7', 'A6', 'F#6', 'B6', 'D7'][k], 13.65 + k * .2, 1.2, .14, .25, (k % 3 - 1) * .4)   # the waves catch the sun
chime('E6', 19.0, .2, .4, .3)                                                                   # the "?"'s clove
for j, p in enumerate(['D4', 'F4', 'A4']): note('cellos_pizz', p, 17.0 + j * .45, 1.2, .3, .4, -.2)
note('woodblock', 'C5', 28.05, .3, .3, .35) if False else None
for j, p in enumerate(['A5', 'D6']): chime(p, 30.3 + j * .12, .2, .42, (j - .5) * .4)        # the halves lock
for j, p in enumerate(['D5', 'F#5', 'A5', 'D6', 'F#6']): harp(p, 30.62 + j * .07, .32, .45, (j - 2) * .2)   # ମିଳିଛି: the gold seam
note('glass', 'A5', 30.7, 2.5, .3, .35)
# isles: a gamelan colour (pelog-ish on D)
for t_, p in [(40.6, 'D5'), (41.3, 'F5'), (42.1, 'A5')]:
    note('vibraphone_hard', p, t_, 2.2, .3, .38, .2); note('vibraphone_hard', p.replace('5', '4'), t_ + .01, 2.2, .22, .3, -.2); hit('gong2', 'small', t_ + .02, .35, .3, .1)
hit('gong', None, 52.1, .3, .4, 0)                                                              # the kayon is planted
PEL = ['D5', 'D#5', 'F5', 'A5', 'A#5', 'A5', 'F5', 'D#5']
for k in range(20): note('vibraphone', PEL[k % 8], 52.6 + k * .26, .9, .2 if k % 4 else .28, .3, (k % 2 - .5) * .5)   # the gamelan figure
for k in range(10): note('marimba', ['D3', 'A3'][k % 2], 52.6 + k * .52, 1.0, .25, .3, 0)
note('tubular_bells', 'D5', 54.42, 3.5, .35, .4); hit('gong2', 'small', 54.44, .4, .3)          # the bow
for j, p in enumerate(['A4', 'D5', 'F#5', 'A5', 'D6']): harp(p, 56.68 + j * .1, .3, .45, (j - 2) * .2)   # the thread between their hands
for j, p in enumerate(['D4', 'F#4', 'A4', 'D5', 'F#5', 'A5', 'D6']): harp(p, 49.15 + j * .05, .34, .5, (j - 3) * .15)   # ବାଲିଯାତ୍ରା lights
note('tubular_bells', 'D5', 49.2, 4, .38, .42); hit('nepal_bells', None, 49.25, .5, .4, .2)
hit('sus_cymbal', 'roll', 60.4, .25, .25, 0)
note('tubular_bells', 'A4', 61.3, 3.5, .4, .45); hit('nepal_bells', None, 61.32, .55, .45, -.2)   # ମେଳାରେ!
for k in range(8): chime(['D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'F#7', 'A6'][k], 61.35 + k * .11, .14, .32, (k - 3.5) * .2)
# the shadow play's drum (a soft frame drum, two-handed) — from the lamp to "the voyage ended"
BEAT = .52
def drum(t_, v, var='large'): X.add(music, S.hit('frame_drum', var, v), t_, .5, (R.uniform(-.25, .25)))
t_ = 32.0
while t_ < 43.2:
    if not (34.7 < t_ < 36.25):
        g = .7 if t_ < 38.0 else 1.0
        drum(t_, .45 * g); drum(t_ + BEAT * .5, .22 * g, 'small'); 
        if t_ > 38.0: drum(t_ + BEAT * .75, .2 * g, 'small_muted')
    t_ += BEAT
hit('frame_drum', 'large', 36.3, .7, .6, 0)

# ---------- foley ----------
def waves(d, v=1.0):
    t = tt(d); n = X.noise(d); sw = .5 + .5 * np.sin(2 * np.pi * t / 5.3) ** 2 + .3 * np.sin(2 * np.pi * t / 2.1 + 1)
    return (X.lp(n, 900) * .016 * sw * v + X.bp(n, 1500, 5000) * .004 * sw ** 2 * v).astype(np.float32)
def brush(d=.5, v=1.0): n = X.noise(d); e = np.sin(np.pi * np.linspace(0, 1, len(n))) ** 1.5; return (X.bp(n, 500, 2400) * e * .05 * v).astype(np.float32)
def pen(d=.8, v=1.0): n = X.noise(d); e = np.sin(np.pi * np.linspace(0, 1, len(n))) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 7 * tt(d)[:len(n)]))); return (X.bp(n, 2500, 7000) * e * .018 * v).astype(np.float32)
def splash(v=1.0): d = .5; n = X.noise(d); t = tt(d)[:len(n)]; return ((X.bp(n, 400, 3000) * np.exp(-t * 9) * .12) * v).astype(np.float32)
def crickets(d):
    t = tt(d); y = np.zeros_like(t)
    for f, r_, ph in [(4400, 14, 0), (4900, 17, 1.3), (4100, 12, 2.1)]: y += np.sin(2 * np.pi * f * t) * (np.sin(2 * np.pi * r_ * t + ph) > .3) * (np.sin(2 * np.pi * .45 * t + ph) > -.2)
    return (X.lp(y, 7000) * .007).astype(np.float32)
def murmur(d, v=1.0): n = X.noise(d); m = X.bp(n, 250, 1000) * (0.6 + .4 * np.abs(np.sin(2 * np.pi * 1.7 * tt(d)[:len(n)]) * np.sin(2 * np.pi * .6 * tt(d)[:len(n)] + 1))); return (m * .028 * v).astype(np.float32)
def conch(d=1.6, v=1.0):
    t = tt(d); f = 293.66 * (1 + .004 * np.sin(2 * np.pi * 4.6 * t)) * (1 + .02 * np.minimum(1, t / .4)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum((1 / h ** 1.1) * np.sin(h * ph) for h in range(1, 10)); e = np.minimum(1, t / .3) * np.minimum(1, (d - t) / .5)
    return (X.lp(y * e, 2800) * .1 * v).astype(np.float32)

X.add(amb, fade(waves(9.6), .02, 1.4), 0, 1, 0)                                          # the Kalinga shore
X.add(amb, fade(waves(1.6), .8, .02), 62.0, 1, 0)                                        # …and again at the loop
X.add(fx, X.whoosh(1.1, .3), 1.05, .4, 0); X.add(fx, X.whoosh(.9, .28), 7.85, .45, 0); X.add(fx, X.whoosh(1.2, .25), 62.0, .35, 0)                                               # the push into the stone
X.add(fx, X.thump(.35, 60), 9.25, .4, 0)
X.add(fx, X.whoosh(.7, .25), 15.35, .4, 0)
X.add(fx, X.whoosh(1.2, .3), 20.0, .45, 0); X.add(fx, X.rumble(1.6, .25), 20.1, .4, 0)   # down into the earth
for t_, d in [(21.75, .9), (22.4, .7), (22.75, 1.0)]: X.add(fx, pen(d, .7), t_, .8, .3)   # field notes
X.add(fx, brush(.9, 1.0), 24.85, .9, 0)                                                  # the paper slides up
for t_, d in [(24.9, .5), (25.15, 1.2), (26.9, 1.3), (29.5, .6)]: X.add(fx, pen(d), t_, .9, .25 if t_ < 26 else -.2)
chime('F#6', 24.9, .16, .35, .3); chime('A6', 29.62, .16, .35, -.3)
X.add(fx, X.clack(1.2, .35), 30.3, .5, 0)                                               # click: the halves lock
X.add(fx, X.ignite(.45), 31.0, .6, 0); X.add(fx, X.whoosh(.6, .3), 31.5, .4, 0)           # the lamp behind the paper
X.add(amb, fade(X.lp(X.noise(15.5), 500) * .004, .6, 1.2), 31.2, 1, 0)                   # the lamp's flame, the cloth
for t_ in (33.1, 33.65, 34.2, 34.6, 35.0, 35.4): X.add(fx, splash(.7), t_, .7, (R.uniform(-.4, .4)))   # the pot flails
X.add(fx, splash(1.2), 35.2, .6, 0)
X.add(fx, conch(1.5, .8), 36.3, .55, 0)                                                   # our Sadhaba
X.add(fx, X.whoosh(.6, .35), 37.75, .45, 0)
X.add(fx, (X.bp(X.noise(.9), 300, 2500) * np.hanning(int(.9 * SR)) * .06).astype(np.float32), 38.55, 1, .1)   # sails fill
X.add(amb, fade(waves(5.0) * .6, .8, 1.0), 38.2, 1, 0)
X.add(fx, X.whoosh(.8, .25), 47.35, .4, 0)                                               # pull back: the booth
X.add(amb, fade(crickets(16.0) * .7, 1.0, 1.0), 47.4, 1, .1)
X.add(amb, fade(murmur(14.6, .8), 1.4, 1.0), 47.6, 1, 0)                                   # the fair
X.add(fx, X.ignite(.3), 50.7, .4, 0)                                                      # the lamp again
X.add(fx, X.whoosh(.7, .25), 50.6, .35, 0); X.add(fx, X.whoosh(.7, .25), 58.1, .35, 0)
X.add(amb, fade(murmur(3.0, 1.3), .8, 1.2), 60.4, 1, 0)                                    # the fair at its fullest

# ---------- mix ----------
mfade = np.ones(N); mfade[int(62.4 * SR):] = np.linspace(1, .5, N - int(62.4 * SR))
bus = music * .62 * duck[:, None] * mfade[:, None] + fx * .9 * (1 - .3 * np.clip(env * 4, 0, 1))[:, None] + amb
bus = S.room(bus, size=.55, mix=.22)
out = bus + np.stack([vo, vo], 1) * .82
sp = env > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .82), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
f = int(.03 * SR); out[-f:] *= np.linspace(1, 0, f)[:, None]; out[:int(.01 * SR)] *= np.linspace(0, 1, int(.01 * SR))[:, None]
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'nepal_bells', 'glockenspiel', 'glass', 'frame_drum', 'gong', 'gong2', 'sus_cymbal', 'vibraphone', 'vibraphone_hard', 'vibraphone_bowed', 'marimba', 'cellos', 'cellos_pizz', 'violas', 'violins', 'contrabass', 'horn'])))
