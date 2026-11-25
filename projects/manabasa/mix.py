# Manabasa Gurubara — voice + score + foley → out/mix.wav (55.8 s, loops). Run: $LIB/.venv/bin/python mix.py
# In D. A tanpura (A–D) breathes under the whole story. Each of the 56 diyas lights on a rising note; one gust snuffs them; the sun
# strikes the wall on a gong; doors thud shut as the brothers' shadows pass; a single grain "tinks" on "Why?"; the jhoti opens on a
# harp and the day's name on a conch; Lakshmi walks on anklet bells; brush and broom at Shriya's step; the temple at night, the doors
# slam; the curse is a shadow play: drum, a rising string, twelve lamps snuffed on a falling scale, rice hissing away to dust; the
# dusk lane and a lament on bansuri; the hearth crackles, his eyes widen on a bell; the doors open, bells; "no caste" on a harp
# that rises as the lines dissolve; Ananda Bazar: murmur, bells, conch and the theme in full; the stylus on palm leaf; and the
# first lamps lighting again, so the end runs into the start.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 55.8; N = int(DUR * SR); TAIL = 4.0; NT = N + int(TAIL * SR)
R = np.random.default_rng(11)
def st(n=NT): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()
def tt(d): return np.arange(int(round(d * SR))) / SR
def nz(d): return R.standard_normal(int(round(d * SR)))
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, NT - len(vo)))
vo = X.hp(vo, 70); vo = vo + .2 * X.bp(vo, 2600, 6000); vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .6 * np.clip(env * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')
def pad(inst, p, t, d, v, pan=0, g=.6, att=1.2, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=1.6), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.8, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def hit(inst, var, t, v, g=.6, pan=0., buf=None): X.add(music if buf is None else buf, S.hit(inst, var, v), t, g, pan)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)
def stereo(buf, x, t, g=1., pan=0.):
    if t < 0: t += DUR   # a sound before the start belongs to the end of the loop
    X.add(buf, np.asarray(x, np.float32), t, g, pan)
T = np.arange(NT) / SR
def env_at(t, pts): xs, ys = zip(*pts); return np.interp(t, xs, ys)
MID = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(p): n, o = p[:-1], int(p[-1]); return 440 * 2 ** ((MID[n] + 12 * (o + 1) - 69) / 12)

# ———————— instruments made here ————————
def tanpura_pluck(f, d=3.4, v=.5, seed=0):
    t = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.2) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
def bansuri(phrase, t0, v=.5, glide=.07, pan=.1):
    total = sum(d for _, d in phrase) + .6; n = int(total * SR); f = np.zeros(n); a = np.zeros(n); pos = 0; prev = None
    for p, d in phrase:
        m = int(d * SR)
        if p is None: pos += m; prev = None; continue
        fr = hz(p); sg = np.full(m, fr)
        if prev: g = min(m, int(glide * SR)); sg[:g] = np.linspace(prev, fr, g)
        ts = np.arange(m) / SR; vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * ts) * np.clip((ts - .25) / .4, 0, 1)
        f[pos:pos + m] = sg * vib; e = np.minimum(1, ts / .07) * np.minimum(1, (d - ts) / .09 + .35); a[pos:pos + m] = np.clip(e, 0, 1); prev = fr; pos += m
    a = np.convolve(a, np.ones(int(.03 * SR)) / int(.03 * SR), 'same'); ph = 2 * np.pi * np.cumsum(f) / SR
    tone = np.sin(ph) + .22 * np.sin(2 * ph + .3) + .07 * np.sin(3 * ph + 1.1)
    breath = X.bp(R.standard_normal(n), 900, 5200) * .16; y = (tone * .8 + breath) * a
    stereo(music, y * v, t0, 1, pan)
def shankha(t_, d=1.8, v=1.0, f0=293.7, buf=None):   # a conch: a hollow tone that swells and rises a little, with breath
    tm = tt(d); f = f0 * (1 + .03 * np.minimum(1, tm / .5)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + .55 * np.sin(2 * ph) + .35 * np.sin(3 * ph) + .2 * np.sin(5 * ph); y += X.bp(nz(d)[:len(tm)], 400, 3000) * .25
    y *= np.minimum(1, tm / .35) ** 2 * np.minimum(1, (d - tm) / .5) * .04 * v; stereo(fx if buf is None else buf, y, t_, 1, 0)
def ghungroo(t_, v=1., pan=0.):   # a step on anklet bells: a little cluster of tiny bells, each slightly late
    for j in range(R.integers(3, 6)):
        d = .35; tm = tt(d); f0 = R.uniform(4200, 6800); y = np.zeros_like(tm)
        for r_, a_ in [(1, 1), (2.76, .45), (5.4, .2)]: y += a_ * np.sin(2 * np.pi * f0 * r_ * tm + R.uniform(0, 6))
        y *= np.exp(-tm * R.uniform(14, 22)) * .006 * v; stereo(fx, y, t_ + j * R.uniform(.006, .018), 1, pan + R.uniform(-.15, .15))
    d = .05; y = X.bp(nz(d), 300, 1800) * np.exp(-tt(d) * 70) * .02 * v; stereo(fx, y, t_, 1, pan)   # the foot itself, barely
def footfall(t_, v=1., pan=0.):   # a bare foot on stone
    d = .09; y = X.lp(nz(d), 700) * np.exp(-tt(d) * 45) * .03 * v; stereo(fx, y, t_, 1, pan)
def thud(t_, v=1., pan=0.):   # a heavy wooden door closing
    d = .7; tm = tt(d); y = np.sin(2 * np.pi * (62 + 40 * np.exp(-tm * 20)) * tm) * np.exp(-tm * 9) * .12
    y += X.lp(nz(d), 900) * np.exp(-tm * 30) * .08 + X.bp(nz(d), 1500, 4000) * np.exp(-tm * 80) * .03
    stereo(fx, y * v, t_, 1, pan)
def snuff(t_, v=1., pan=0.):   # a flame pinched out: a short breath and a soft pop
    d = .3; tm = tt(d); y = X.bp(nz(d), 500, 3000) * np.exp(-tm * 16) * .035 + np.sin(2 * np.pi * 180 * tm) * np.exp(-tm * 50) * .02
    stereo(fx, y * v, t_, 1, pan)
def wick(t_, v=1., pan=0.):   # a wick catching
    d = .4; tm = tt(d); y = X.bp(nz(d), 1800, 7000) * np.exp(-tm * 11) * .012 * v; stereo(fx, y, t_, 1, pan)
def swish(t_, d=.35, v=1., lo=600, hi=4000, pan=0.):   # broom / brush on a floor
    m = int(round(d * SR)); tm = np.arange(m) / SR; y = X.bp(nz(d)[:m], lo, hi) * np.sin(np.pi * tm / d) ** 1.5 * .03 * v; stereo(fx, y, t_, 1, pan)
def scratch(t_, d, v=1., pan=-.15):   # an iron stylus on palm leaf
    m = int(round(d * SR)); tm = np.arange(m) / SR; y = X.bp(nz(d)[:m], 2200, 8000) * (.55 + .45 * np.sin(2 * np.pi * 11 * tm) ** 2) * np.sin(np.pi * tm / d) * .03 * v; stereo(fx, y, t_, 1, pan)
def gust(t_, d=1.2, v=1.):   # a single gust of wind sweeping left to right
    m = int(round(d * SR)); tm = np.arange(m) / SR; e = np.sin(np.pi * np.clip(tm / d, 0, 1)) ** 1.4
    y = X.bp(nz(d)[:m], 250, 3500) * e * .07 * v
    stereo(fx, y * .5, t_, 1, -.5); stereo(fx, X.bp(nz(d)[:m], 400, 5000) * e * .05 * v, t_ + .12, 1, .5)
def crackle(t0, t1, v=1.):   # a clay hearth's fire
    for _ in range(int((t1 - t0) * 26)):
        t_ = R.uniform(t0, t1); d = .02; y = X.hp(nz(d), 1500) * np.exp(-tt(d) * R.uniform(150, 300)) * R.uniform(.01, .05) * v; stereo(amb, y, t_, 1, R.uniform(-.4, .4))
    d = t1 - t0; m = int(round(d * SR)); y = X.lp(nz(d)[:m], 300) * .02 * v; stereo(amb, fade(y, .5, .6), t0, 1, 0)

# ———————— the tanpura, under everything but the curse's silence ————————
A2, D3, D2 = 110.0, 146.83, 73.42
t0, i = -2.8 * 2, 0
while t0 < NT / SR:
    g = 0 if 20.1 < t0 < 21.3 else (.55 if 21.3 <= t0 < 26.6 else 1.0)
    if g > 0:
        for f, dt, pan_ in [(A2, 0, -.3), (D3, .7, .2), (D3, 1.4, .25), (D2, 2.1, -.1)]:
            if t0 + dt >= 0: stereo(music, tanpura_pluck(f, v=.07 * g, seed=i), t0 + dt, 1, pan_)
            i += 1
    t0 += 2.8
room = X.lp(nz(NT / SR)[:NT], 180) * .004; amb[:, 0] += room; amb[:, 1] += room   # the air of a stone room, everywhere

# ———————— 0–3.3: the temple kitchen — 8 hearths × 7 pots land tier by tier; the count; the steam rises to him; the fires die; the dawn ————————
def clay(t_, v=1., pan=0., f0=None):   # an earthen pot set down on another: a dull hollow knock
    d = .22; tm = tt(d); f = f0 or R.uniform(190, 260); y = np.sin(2 * np.pi * f * tm) * np.exp(-tm * 28) * .09 + np.sin(2 * np.pi * f * 2.3 * tm) * np.exp(-tm * 45) * .03
    y += X.bp(nz(d), 700, 3200) * np.exp(-tm * 60) * .05; stereo(fx, y * v, t_, 1, pan)
TIERN = ['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'F#5']
for j in range(7):
    for k in range(8): clay(.1 + j * .29 + (k % 4) * .03 + (.015 if k > 3 else 0), .55 + .06 * (3 - k % 4), (-1 if k < 4 else 1) * (.7 - .15 * (k % 4)))
    note('hand_chimes', TIERN[j], .1 + j * .29 + .05, 1.6, .16 + .02 * j, .38, (j % 2 - .5) * .3); note('marimba', TIERN[j][:-1] + str(int(TIERN[j][-1]) - 1), .1 + j * .29, .8, .3, .38, 0)
X.add(music, S.hit('frame_drum', 'large', .55), 1.93, .5, 0); note('glass', 'D6', 1.95, 2.0, .22, .34)   # fifty-six
crackle(0.0, 2.9, .6)
for t_, p in [(0.0, 'D3'), (0.0, 'A3')]: pad('cellos', p, t_, 3.0, .16, -.2 if p == 'D3' else .2, .5, .6)
pad('violins_trem', 'D5', .3, 2.6, .08, -.3, .4, 1.2); pad('violins_trem', 'F#5', .8, 2.1, .07, .3, .4, 1.0); pad('contrabass', 'D2', 0, 3.0, .16, 0, .5, .4)
for j in range(10): note('glockenspiel', ['D6', 'E6', 'F#6', 'A6', 'B6'][j % 5], 1.95 + j * .06, 1.0, .06 + .006 * j, .24, (j % 3 - 1) * .5)   # the steam rises to him
d = .5; tm = tt(d); y = X.lp(nz(d), 400) * np.exp(-tm * 5) * .06; stereo(fx, y, 2.72, 1, 0); note('cellos', 'D2', 2.72, 1.0, .2, .4, 0, .02, .5)   # the fires die
d = .5; y = X.bp(nz(d), 600, 9000) * (tt(d) / d) ** 3 * .05; stereo(fx, y, 2.72, 1, 0); hit('sus_cymbal', 'roll', 2.8, .2, .25, 0)   # the swell into the dawn
X.add(fx, X.whoosh(.9, .3), 2.88, .35, -.6); X.add(fx, X.whoosh(.9, .3), 3.1, .3, .6); hit('gong', None, 3.12, .3, .42, 0); note('glass', 'D5', 3.13, 3.0, .3, .44); note('hand_chimes', 'A5', 3.16, 2.6, .2, .36, .2)   # the sunrise sweeps across
hit('gong', None, .18, .26, .38, 0); note('tubular_bells', 'D4', .2, 3.4, .3, .42); note('glass', 'A5', .21, 2.4, .18, .32)   # his face, on 'Jagannath'
pad('cellos', 'D2', 3.3, 3.0, .14, -.2); pad('violas', 'A2', 3.3, 3.0, .1, .2)
d = .6; y = X.lp(nz(d), 900) * (tt(d) / d) ** 2 * .05; stereo(fx, y, DUR - .6, 1, 0)   # the lamp's flame becomes the hearth's fire (the loop)

# ———————— 3.3–6.5: door to door, hungry; the doors shut; why? ————————
for j, t_ in enumerate(np.arange(3.45, 5.5, .42)): note('contrabass_pizz', ['D2', 'D2', 'C2', 'D2', 'A1'][j % 5], t_, .8, .34, .5, 0)   # their walk
for j, t_ in enumerate(np.arange(3.45, 5.5, .21)): footfall(t_, .6, -.2 + .4 * (j % 2))
for t_, pan_ in [(4.12, -.2), (4.79, .3)]: thud(t_, 1.0, pan_); note('cellos_pizz', 'D2', t_, .8, .4, .45, pan_)
d = .9; y = X.bp(nz(d), 300, 2000) * np.hanning(int(round(d * SR))) * .01; stereo(fx, y, 5.5, 1, 0)   # the tilt down
note('glass', 'A5', 5.82, 2.2, .14, .28); note('vibraphone_bowed', 'D5', 5.75, 1.4, .1, .3, 0, .3)   # "Why?" hangs in the air
note('glockenspiel', 'D6', 6.44, 2.4, .3, .45); note('glass', 'D6', 6.45, 2.2, .2, .36); wick(6.44, 1.4)   # the grain lands

# ———————— 6.45–9.4: the jhoti opens; Margashira, Manabasa Gurubara ————————
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5']): note('harp', p, 6.46 + j * .07, 3.2, .26, .44, (j - 3.5) * .2)
pad('cellos', 'D2', 6.5, 3.0, .17, -.2); pad('violas', 'A2', 6.5, 3.0, .13, .2); pad('violins', 'F#4', 6.8, 2.6, .08, .3); pad('contrabass', 'D1', 6.5, 3.0, .15, 0, .5)
shankha(6.95, 2.0, .8); note('tubular_bells', 'D4', 7.0, 4, .34, .44, -.1); hit('nepal_bells', None, 7.05, .3, .4, .2)
for j in range(10): note('glockenspiel', ['D6', 'E6', 'F#6', 'A6', 'B6'][j % 5], 7.2 + j * .2, .9, .05, .2, (j % 3 - 1) * .5)

# ———————— 9.3–13.3: Lakshmi's steps to the door no one visits; the others' feet go round ————————
for j in range(20): ghungroo(9.3 + (j + .5) * 3.3 / 20, .9, -.1 + .2 * (j % 2))
for r_ in range(3):
    for j in range(15): footfall(10.9 + (j + r_ * .6 + .5) * 2.0 / 16, .4, [-.5, .5, -.2][r_])
pad('cellos', 'B1', 9.4, 3.6, .14, -.2); pad('violas', 'F#2', 9.5, 3.5, .1, .2); pad('violins', 'D4', 9.8, 3.2, .07, .3)
bansuri([('A4', .4), ('B4', .3), ('D5', .9), ('E5', .35), ('D5', .35), ('B4', 1.4)], 9.5, .17)
pad('cellos', 'G2', 12.4, 3.4, .14, -.2); pad('violas', 'D3', 12.5, 3.3, .1, .2)

# ———————— 13.4–16.4: Shriya's doorstep at dawn: broom, jhoti, gold ————————
d = .8; y = X.bp(nz(d), 300, 2500) * np.hanning(int(round(d * SR))) * .012; stereo(fx, y, 13.3, 1, 0)   # the camera tilts up
for t_ in np.arange(13.62, 14.45, .27): swish(t_, .26, .9, 400, 2600, .1)   # the wet wash, wiped across the step
for t_ in [14.42, 14.52, 14.62] + [14.61 + .085 * k for k in range(6)]: swish(t_, .16, .6, 1800, 7000, -.1)   # the lotus, then each little foot in rice paste
for k in range(9): ghungroo(15.15 + .8 * (k + .5) / 10, .8, -.6 + .15 * k)   # her gold steps onto them
bansuri([('F#5', .35), ('A5', .45), ('B5', .8), ('A5', .3), ('F#5', .3), ('E5', .3), ('D5', 1.2)], 13.6, .2)
for j in range(12): note('glockenspiel', ['A5', 'B5', 'D6', 'E6', 'F#6', 'A6'][j % 6], 15.0 + j * .07, 1.4, .06 + .005 * j, .26, (j % 3 - 1) * .5)   # the gold arrives
note('hand_chimes', 'D6', 15.0, 2.8, .2, .38, .2); pad('vibraphone_bowed', 'A4', 15.0, 1.6, .12, 0, .4, .4)

# ———————— 16.2–21.3: the temple at night; Balabhadra; the doors slam ————————
d = .8; y = X.bp(nz(d), 700, 9000) * (tt(d) / d) ** 3 * .04; stereo(fx, y, 15.75, 1, 0); note('glass', 'A5', 16.46, 2.6, .24, .36); note('hand_chimes', 'D6', 16.48, 2.4, .16, .3, .2)   # into her light, and out at the temple
hit('nepal_bells', None, 16.94, .3, .42, .3); note('tubular_bells', 'A3', 16.95, 4, .22, .36, -.2)
pad('contrabass', 'D1', 16.4, 3.8, .18, 0, .5); pad('cellos', 'D2', 16.6, 3.6, .16, -.2); pad('violas', 'G#2', 17.0, 3.2, .1, .2)   # a tritone under him
pad('horn', 'D3', 16.94, 1.8, .14, -.1, .45, .5); note('cellos', 'D#2', 17.5, 1.2, .3, .45, 0, .02, .6)   # Balabhadra; his eyes narrow
pad('violins_trem', 'D#4', 18.2, 1.9, .1, -.3, .5, .4); pad('violins_trem', 'A4', 18.4, 1.7, .08, .3, .45, .4)   # stern
d = .5; y = X.bp(nz(d), 400, 6000) * (tt(d) / d) ** 3 * .05; stereo(fx, y, 20.1, 1, 0)
thud(20.54, 2.2, -.1); thud(20.57, 1.8, .1); hit('gong', None, 20.55, .5, .55, 0); X.add(fx, X.rumble(1.4, .8), 20.55, .45, 0)   # the slam, on 'pasibani'
hit('timpani', None, 20.55, .7, .5, 0)

# ———————— 21.3–26.6: the curse, as a shadow play ————————
X.add(fx, X.creak(.4), 21.35, .25, -.3)
d = 1.1; y = X.bp(nz(d), 400, 5000) * (tt(d) / d) ** 2 * .03; stereo(fx, y, 20.8, 1, 0); note('vibraphone_bowed', 'D#4', 20.85, 1.2, .12, .3, 0, .4)   # she turns to shadow
X.add(music, S.hit('frame_drum', 'large', .7), 21.6, .65, 0); hit('timpani', None, 21.62, .45, .4, 0)   # the puppet, sharp on the cloth
for j, t_ in enumerate(np.arange(21.9, 23.3, .23)): X.add(music, S.hit('frame_drum', 'small', .3 + .05 * j), t_, .45, (j % 2 - .5) * .3)
pad('violins', 'D4', 21.9, 2.0, .1, -.3, .5, .5); pad('violins', 'A4', 22.1, 1.8, .1, .3, .5, .5); pad('violins_trem', 'D5', 22.3, 1.6, .1, 0, .5, .5)   # her hand rises
pad('cellos', 'D2', 21.5, 2.8, .18, -.2); pad('contrabass', 'D1', 21.5, 2.8, .18, 0, .5)
d = .9; y = X.bp(nz(d), 300, 4000) * (tt(d) / d) ** 2 * .05; stereo(fx, y, 21.95, 1, 0)
hit('gong', None, 22.6, .45, .5, 0); note('tubular_bells', 'D#4', 22.62, 3, .3, .4); hit('sus_cymbal', 'roll', 22.2, .2, .26, 0)   # the curse spoken
FALL = ['D6', 'C#6', 'A5', 'G5', 'F#5', 'D#5', 'D5', 'C#5', 'A4', 'G4', 'D#4', 'D4']
for k_ in range(12):
    t_ = 23.4 + k_ / 12 * 1.15; pan_ = (k_ % 6 - 2.5) * .2
    snuff(t_, .9, pan_); note('harp', FALL[k_], t_, 1.8, .26, .38, pan_); note('glass', FALL[k_], t_ + .01, 1.2, .06, .2, -pan_)   # twelve years, twelve lamps
pad('cellos', 'D2', 24.4, 2.4, .16, -.2); pad('contrabass', 'D1', 24.4, 2.4, .14, 0, .5)
for _ in range(240):   # a fistful of rice runs out between the fingers
    t_ = 24.8 + (R.random() ** .7) * 1.7; d = .012; y = X.hp(nz(d), 3000) * np.exp(-tt(d) * 300) * R.uniform(.01, .04); stereo(fx, y, t_, 1, R.uniform(-.3, .3))
gust(25.6, 1.2, .6); gust(25.85, 1.2, .5)

# ———————— 26.6–32.9: the lane at dusk; one door lit; we go in ————————
crk = X.bp(nz(6.2), 4200, 5200) * (np.sin(2 * np.pi * 4.3 * tt(6.2)) > .6) * .004; stereo(amb, fade(crk, .8, .5), 26.6, 1, .4)
wnd = X.bp(nz(6.2), 250, 1200) * .01 * (1 + .4 * np.sin(tt(6.2) * .9)); stereo(amb, fade(wnd, .8, .8), 26.6, 1, -.2)
for j, t_ in enumerate(np.arange(26.8, 31.6, .5)): footfall(t_, .4, -.1 + .2 * (j % 2))
bansuri([('D5', .5), ('C#5', .3), ('B4', .6), ('A4', 1.0), (None, .3), ('B4', .35), ('D5', .35), ('E5', .8), ('D5', .4), ('B4', .4), ('A4', 1.6)], 26.9, .19)
pad('cellos', 'B1', 26.7, 3.2, .14, -.2); pad('violas', 'F#2', 26.8, 3.1, .1, .2); pad('cellos', 'G2', 29.8, 3.0, .14, -.2); pad('violas', 'D3', 29.8, 3.0, .1, .2)
note('hand_chimes', 'F#5', 28.3, 2.6, .18, .34, .3); note('glass', 'A5', 28.35, 2.2, .1, .26, .3)   # one door lit
X.add(fx, X.whoosh(1.4, .25), 31.6, .35, 0); d = 1.3; y = X.lp(nz(d), 1800) * (tt(d) / d) ** 2 * .03; stereo(fx, y, 31.65, 1, 0)   # into the doorway, the hut's fire grows
note('glass', 'D5', 32.85, 3, .28, .4); note('hand_chimes', 'A5', 32.86, 2.6, .2, .34, .2)   # the light inside

# ———————— 32.8–37.6: the hut; the aroma crosses to him; his eyes widen; into his eye — she is there ————————
crackle(32.8, 36.2, 1.0)
for _ in range(16):   # the pot simmering
    t_ = R.uniform(33, 36); d = .06; f = R.uniform(250, 500); y = np.sin(2 * np.pi * f * (1 + 2 * tt(d)) * tt(d)) * np.exp(-tt(d) * 60) * .01; stereo(amb, y, t_, 1, -.2)
pad('cellos', 'D2', 32.9, 4.6, .14, -.2); pad('violas', 'A2', 33.0, 4.5, .1, .2); note('piano', 'F#4', 33.1, 2.4, .2, .36, 0, rel=1.4); note('piano', 'A4', 33.8, 2.4, .18, .34, 0, rel=1.4)
for j in range(14): note('glockenspiel', ['D6', 'E6', 'F#6', 'A6', 'B6', 'D7', 'E7'][j % 7], 33.2 + j * .09, 1.0, .05 + .004 * j, .22, -.6 + j * .09)   # the aroma, drifting across
hit('nepal_bells', None, 34.4, .32, .4, 0); note('tubular_bells', 'D5', 34.42, 3.4, .3, .42); note('glass', 'A5', 34.45, 2.4, .2, .3)   # his eyes widen
pad('violins', 'D5', 34.9, 2.0, .1, -.3, .5, .9); pad('violins', 'F#5', 35.1, 1.8, .09, .3, .45, .9); pad('violins_trem', 'A5', 35.4, 1.5, .07, 0, .45, .8)   # the push into his eye
d = 1.8; y = X.bp(nz(d), 500, 9000) * (tt(d) / d) ** 3 * .045; stereo(fx, y, 34.7, 1, 0)
hit('gong', None, 36.5, .3, .42, 0); note('glass', 'D5', 36.5, 3, .3, .42)   # inside: her
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5', 'F#5', 'A5']): note('harp', p, 36.5 + j * .07, 3.2, .24, .4, (j - 3.5) * .2)

# ———————— 37.5–40.4: the doors open; her steps go in ————————
X.add(fx, X.creak(.9), 37.85, .55, -.2); X.add(fx, X.creak(.7), 38.15, .45, .2)
hit('nepal_bells', None, 38.2, .4, .45, -.2); hit('nepal_bells', None, 38.7, .35, .4, .3); note('tubular_bells', 'A4', 38.3, 3.4, .3, .4)
for k_ in range(6): ghungroo(38.5 + k_ * .18, .9, -.1 + .2 * (k_ % 2))
pad('cellos', 'D2', 37.6, 2.8, .16, -.2); pad('violas', 'A2', 37.7, 2.7, .12, .2); pad('violins', 'F#4', 38.2, 2.2, .1, .3); pad('violins', 'D5', 38.6, 1.8, .07, -.3)
X.add(fx, X.whoosh(1.1, .25), 39.45, .35, 0); note('glass', 'D6', 40.4, 2.6, .22, .36)   # the camera tilts down to the floor beyond the door
for k in range(7): ghungroo(39.2 + (k + .5) * 1.8 / 8, .7, .1 * (k % 2))   # her steps into the circle
for j, p in enumerate(['D4', 'F#4', 'A4', 'D5']): note('harp', p, 42.95 + j * .05, 2.6, .24, .38, (j - 1.5) * .3)
pad('violins', 'D5', 42.95, 1.4, .1, -.3, .5, .3); pad('violins', 'A5', 43.0, 1.3, .08, .3, .45, .3); note('glass', 'D6', 43.3, 2.4, .2, .34)   # every hand in the one pot

# ———————— 40.3–43.1: no caste — the lines dissolve, every foot gathers round one pot ————————
for k_ in range(5): ghungroo(40.4 + k_ * .15, .8, -.1 + .2 * (k_ % 2))
d = 1.2; y = X.bp(nz(d), 300, 3000) * np.sin(np.pi * np.clip(tt(d) / d, 0, 1)) * .03; stereo(fx, y, 41.95, 1, 0)   # the wash
for j, p in enumerate(['D3', 'F#3', 'A3', 'D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'D6']): note('harp', p, 41.95 + j * .075, 3.2, .24, .4, (j - 6) * .1)
pad('cellos', 'D2', 40.5, 2.8, .16, -.2); pad('violas', 'A2', 40.6, 2.7, .12, .2); pad('violins', 'F#4', 41.0, 2.3, .1, .3); pad('violins', 'A4', 41.4, 1.9, .08, -.3)
for j in range(24): footfall(42.25 + j * .8 / 24, .3, np.sin(j * 1.3) * .6)

# ———————— 43.1–49.2: Ananda Bazar today ————————
shankha(43.2, 1.9, .9); hit('gong', None, 43.15, .3, .4, 0)
mur = X.bp(nz(6.4), 180, 1400) * .012 * (1 + .3 * np.sin(tt(6.4) * 1.7)); stereo(amb, fade(mur, .6, .9), 43.1, 1, 0)   # a courtyard of people
for t_ in (44.0, 45.6, 47.3): hit('nepal_bells', None, t_ + R.uniform(0, .2), .22, .32, R.uniform(-.6, .6))
for _ in range(30):   # leaves, clinks of brass, the sound of eating together
    t_ = R.uniform(43.3, 49.0); d = .05; y = X.bp(nz(d), 2500, 7000) * np.exp(-tt(d) * 80) * .01; stereo(amb, y, t_, 1, R.uniform(-.7, .7))
for j, t_ in enumerate(np.arange(43.3, 49.1, .52)):   # a gentle khol-like pulse: the theme in full
    X.add(music, S.hit('frame_drum', 'large' if j % 4 == 0 else 'small', .3 + (.1 if j % 2 == 0 else 0)), t_, .45, (j % 2 - .5) * .3)
    if j % 2 == 1: X.add(music, S.hit('frame_drum', 'small', .2), t_ + .26, .35, .2)
pad('contrabass', 'D1', 43.2, 6.0, .14, 0, .5); pad('cellos', 'D2', 43.2, 3.0, .16, -.2); pad('violas', 'A2', 43.3, 2.9, .12, .2); pad('violins', 'F#4', 43.5, 2.7, .1, .3)
pad('cellos', 'G2', 46.2, 3.0, .16, -.2); pad('violas', 'D3', 46.2, 3.0, .12, .2); pad('violins', 'B4', 46.3, 2.9, .1, .3)
bansuri([('D5', .3), ('E5', .3), ('F#5', .6), ('A5', .6), ('B5', .35), ('A5', .35), ('F#5', .7), ('E5', .3), ('D5', .3), ('E5', .5), ('F#5', 1.4)], 43.6, .21)
for j, (t_, p) in enumerate([(44.0, 'A4'), (45.0, 'F#4'), (46.2, 'B4'), (47.4, 'A4'), (48.4, 'D5')]): note('piano', p, t_, 2.4, .22, .36, (j % 2 - .5) * .2, rel=1.6)

# ———————— 49.0–55.8: the palm leaf; the line engraved; the lamp; the first diyas again ————————
pad('cellos', 'D2', 49.1, 6.0, .14, -.2); pad('violas', 'A2', 49.2, 5.8, .1, .2); pad('vibraphone_bowed', 'F#4', 49.4, 5.4, .1, 0, .4, 1.0)
for t_, d in [(49.35, .3), (49.7, .35), (50.05, .3), (50.35, .3)]: scratch(t_, d, 1.0, -.6 + (t_ - 49.3))   # the lines written over the rows, left to right
d = 1.0; y = X.bp(nz(d), 900, 7000) * np.sin(np.pi * np.clip(tt(d) / d, 0, 1)) ** 2 * .02; stereo(fx, y, 50.6, 1, -.2); wick(50.5, 1.2)   # the leaves; the lamp
for t_, p in [(49.4, 'D5'), (50.6, 'A4'), (51.8, 'B4'), (53.0, 'F#4')]: note('piano', p, t_, 2.8, .24, .4, 0, rel=1.8)
note('tubular_bells', 'D4', 51.86, 4, .26, .38); hit('nepal_bells', None, 51.9, .26, .36, -.2)   # "our Lakshmi Purana"
for j, p in enumerate(['D4', 'A4', 'D5', 'F#5', 'A5']): note('harp', p, 53.6 + j * .08, 3, .2, .36, (j - 2) * .2)
note('glass', 'D5', 54.75, 3.0, .2, .34); d = 1.1; y = X.bp(nz(d), 800, 9000) * (tt(d) / d) ** 3 * .045; stereo(fx, y, 54.75, 1, 0)   # into the flame

# ———————— mix ————————
E = np.clip(env * 4, 0, 1)
bus = music * .62 * duck[:, None] + fx * .9 * (1 - .3 * E)[:, None] + amb * (1 - .4 * E)[:, None]
bus = S.room(bus, size=.65, mix=.24)
out = bus + np.stack([vo, vo], 1) * .82
w = out[N:].copy(); out = out[:N]; out[:len(w)] += w   # the tail wraps onto the start: the loop has no seam
sp = env[:N] > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[:N][sp] * .82), rms(bus[:N][sp].mean(1)), rms(bus[:N][~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'nepal_bells', 'glockenspiel', 'glass', 'frame_drum', 'gong', 'sus_cymbal', 'vibraphone_bowed', 'piano', 'cellos', 'cellos_pizz', 'violas', 'violins', 'violins_trem', 'contrabass', 'contrabass_pizz', 'horn', 'timpani', 'marimba'])))
