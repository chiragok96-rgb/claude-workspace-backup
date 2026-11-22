# "Aa Ka Ma Bai" — voice + score + foley → out/mix.wav (53.6 s, loops). Run: $LIB/.venv/bin/python mix.py
# In B (the key the opening song is sung in). A tanpura under everything; each syllable rings a bell as it ignites; a music-box
# kalimba for childhood; the moons are born on chimes and named on temple bells; the voyage's tally is counted on a drum;
# the flying strokes shimmer to her hand; a lone bansuri at the ghat; the finger-count on falling harp notes; the moon sets into
# silence and a train horn; wheels and whip-pans and a bell on each city; home: a clock that counts, festivals heard muffled
# through the window, a phone, the monsoon; dawn: birds, a temple bell, the bansuri's theme, the shankha on "prarthana";
# a flash into the map, a note for each thread home; and the river again, exactly as it began.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 53.6; N = int(DUR * SR); TAIL = 4.0; NT = N + int(TAIL * SR)   # rendered past the end; the tail wraps onto the start (the loop)
R = np.random.default_rng(7)
def st(n=NT): return np.zeros((n, 2), np.float32)
music, fx, amb, muff = st(), st(), st(), st()   # muff: sounds heard through the window (low-passed later)
def tt(d): return np.arange(int(round(d * SR))) / SR
def nz(d): return R.standard_normal(int(round(d * SR)))
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, NT - len(vo)))
vo = X.hp(vo, 70); vo = vo + .25 * X.bp(vo, 2600, 6000); vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
song = np.arange(NT) / SR < 3.7; env_d = env.copy(); env_d[song] *= .35   # the sung opening is music: duck less under it
duck = 1 - .62 * np.clip(env_d * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')
def pad(inst, p, t, d, v, pan=0, g=.6, att=1.2, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=1.6), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.8, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def hit(inst, var, t, v, g=.6, pan=0., buf=None): X.add(music if buf is None else buf, S.hit(inst, var, v), t, g, pan)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)
def stereo(buf, x, t, g=1., pan=0.): X.add(buf, x.astype(np.float32), t, g, pan)

# ———————— beds ————————
T = np.arange(NT) / SR
def bell_env(t, pts):   # piecewise-linear gain over time
    xs, ys = zip(*pts); return np.interp(t, xs, ys)
# the river: lapping water, present at the start and the end (identical level at 0 and at DUR, so the loop is seamless)
w1 = X.lp(nz(NT / SR)[:NT], 520) * .05; lap = .55 + .45 * np.sin(2 * np.pi * T / 2.7) ** 2 * (.6 + .4 * np.sin(2 * np.pi * T / 1.13 + 1))
riverG = bell_env(T, [(0, 1), (5.4, 1), (6.0, .25), (13.3, .25), (14.0, .9), (24.5, .8), (26.0, .2), (26.2, 0), (44.2, 0), (44.8, 1.15), (49.3, 1.0), (49.7, .3), (52.8, .3), (53.6, 1), (60, 1)])
river = w1 * lap * riverG; amb[:, 0] += river * 1.05; amb[:, 1] += river * .95
for k_ in range(40):   # little plips of water against the boats
    t_ = R.uniform(0, NT / SR - .2); g = float(np.interp(t_, T[::4800], riverG[::4800]))
    if g < .3: continue
    d = .09; f = R.uniform(600, 1300); y = np.sin(2 * np.pi * np.cumsum(f * (1 + 1.2 * tt(d))) / SR) * np.exp(-tt(d) * 40) * .012 * g; stereo(amb, y, t_, 1, R.uniform(-.6, .6))
# the sea's waves (13.4–26) and a night wind
sea = X.lp(nz(NT / SR)[:NT], 900) * .045 * (.5 + .5 * np.sin(2 * np.pi * T / 4.1) ** 2) * bell_env(T, [(0, 0), (13.3, 0), (14.4, 1), (24.4, 1), (25.9, .6), (26.15, 0), (60, 0)])
amb[:, 0] += sea * .9; amb[:, 1] += sea * 1.1
wind = X.bp(nz(NT / SR)[:NT], 300, 1400) * .012 * (1 + .4 * np.sin(T * .9)) * bell_env(T, [(0, .3), (5.3, .3), (6.5, 1), (13.4, 1), (21, .8), (26, .7), (26.2, 0), (43.4, 0), (44.5, .5), (49.5, .5), (50, 1), (53, 1), (53.6, .3), (60, .3)])
amb[:, 0] += wind; amb[:, 1] += wind
# the tanpura in B: everywhere but the train, softer at home
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
B1, B2, FS2 = 61.74, 123.47, 92.5
t0, i = -2.6 * 2, 0
while t0 < NT / SR:
    g = 0 if 26.1 < t0 < 30.5 else (.55 if 30.5 < t0 < 43.4 else 1.0)
    if g > 0:
        for f, dt, pan in [(FS2, 0, -.3), (B2, .62, .2), (B2, 1.24, .25), (B1 * 2 / 2, 1.86, -.1)]:
            if t0 + dt >= 0: stereo(music, tanpura_pluck(f, v=.075 * g, seed=i), t0 + dt, 1, pan)
            i += 1
    t0 += 2.6

# ———————— 0–5.3: the river, the syllables ignite ————————
hit('gong', None, .03, .22, .38, 0); note('glass', 'B4', .03, 3.0, .3, .4, -.1)   # the first frame: a deep breath of a gong under the first syllable
for k_, (t_, p) in enumerate(zip([.05, .95, 2.1, 2.85], ['B5', 'F#5', 'D#6', 'B6'])):
    note('hand_chimes', p, t_ + .02, 2.4, .22, .42, (k_ - 1.5) * .3); note('glass', p, t_ + .03, 2.0, .14, .3, -(k_ - 1.5) * .3)
    d = .5; y = X.bp(nz(d), 2000, 7000) * np.exp(-tt(d) * 9) * .02; stereo(fx, y, t_, .8, (k_ - 1.5) * .3)   # the flare of a wick
pad('vibraphone_bowed', 'F#4', .2, 5.0, .1, 0, .45, 1.5); pad('cellos', 'B2', .4, 4.8, .08, -.2, .5, 2.0)
for k_, p in enumerate(['B4', 'D#5', 'F#5', 'D#5', 'C#5', 'B4']): note('kalimba', p, 3.85 + k_ * .22, 1.4, .26, .42, (k_ % 2 - .5) * .4)   # since childhood: a music box
d = 1.6; y = X.bp(nz(d), 1500, 5000) * np.hanning(int(d * SR)) * .004; stereo(amb, y, 3.8, 1, -.5)   # far children's voices, a murmur

# ———————— 5.3–13: syllables rise, become four moons, are named ————————
for k_ in range(4):
    t_ = 5.35 + k_ * .4; X.add(fx, X.whoosh(1.4, .3), t_, .35, (k_ - 1.5) * .35)
    for j, p in enumerate(['B4', 'D#5', 'F#5', 'B5']): note('harp', p, t_ + .5 + j * .06, 2.2, .22, .34, (k_ - 1.5) * .3)
    note('hand_chimes', ['B5', 'C#6', 'D#6', 'F#6'][k_], 7.55 + k_ * .4, 2.6, .24, .4, (k_ - 1.5) * .45)   # a moon is born
pad('cellos', 'B2', 5.4, 7.8, .16, -.2); pad('violas', 'F#3', 5.6, 7.6, .12, .2); pad('violins', 'D#4', 6.6, 6.6, .09, .3); pad('contrabass', 'B1', 5.4, 7.8, .14, 0, .5)
for k_, (t_, p) in enumerate(zip([9.41, 10.35, 11.34, 12.25], ['B4', 'D#5', 'F#5', 'B5'])):
    note('tubular_bells', p, t_ - .02, 3.2, .3, .4, (k_ - 1.5) * .35)   # each month's name, rung
for k_ in range(12): note('glockenspiel', ['B6', 'D#7', 'F#7'][k_ % 3], 7.3 + k_ * .5, 1.0, .05, .18, (k_ % 3 - 1) * .5)   # starlight

# ———————— 13.4–17: the sea, the boita, the tally ————————
pad('cellos', 'G#2', 13.3, 4.0, .2, -.2); pad('violas', 'D#3', 13.4, 3.9, .14, .2); pad('contrabass', 'G#1', 13.3, 4.0, .18, 0, .5)
pad('cellos', 'E2', 16.4, 2.6, .2, -.2); pad('violas', 'B2', 16.4, 2.6, .14, .2)
for t_ in np.arange(13.55, 16.4, .55): X.add(music, S.hit('frame_drum', 'small', .16), t_ + .275, .4, .2)   # the oars' pulse
for t_ in (14.0, 15.6): X.add(fx, X.creak(.5), t_, .3, -.3)
def chalk(t_, d=.26, v=1.0):
    y = X.bp(nz(d), 1800, 7000) * (np.abs(np.sin(2 * np.pi * 38 * tt(d)[:int(round(d * SR))])) ** 3 * .7 + .3) * np.sin(np.pi * tt(d)[:int(round(d * SR))] / d) * .05 * v; stereo(fx, y, t_, 1, .15)
for k_, t_ in enumerate([14.35, 14.9, 15.45, 16.0]):
    chalk(t_); X.add(music, S.hit('frame_drum', 'large', .5), t_, .6, -.1); note('harp', ['B2', 'B2', 'B2', 'B2'][k_], t_, 2, .3, .4)   # a stroke: a beat
chalk(16.42, .32, 1.3); hit('gong', None, 16.42, .42, .5, 0); X.add(music, S.hit('frame_drum', 'large', .75), 16.42, .7, 0); note('tubular_bells', 'E4', 16.44, 3, .3, .4)   # "hisaba"

# ———————— 17–19.6: who kept it? the strokes fly to her hand ————————
pad('violins_trem', 'E4', 16.9, 2.7, .1, -.25, .5, .8); pad('violins_trem', 'G#4', 17.4, 2.2, .08, .25, .45, .8); pad('cellos', 'E2', 17.0, 2.6, .16, -.2)
X.add(fx, X.whoosh(1.8, .35), 17.2, .45, .3)
for k_ in range(14): note('glockenspiel', ['B5', 'C#6', 'D#6', 'F#6', 'G#6', 'B6', 'C#7'][k_ % 7], 17.15 + k_ * .14, .9, .08 + .006 * k_, .26, (k_ % 3 - 1) * .5)   # a shimmering flight
hit('nepal_bells', None, 19.45, .4, .42, -.1)
for j, p in enumerate(['G#3', 'B3', 'D#4', 'G#4', 'B4']): note('harp', p, 19.42 + j * .06, 3, .3, .45, (j - 2) * .2)   # her
pad('cellos', 'G#2', 19.5, 4.2, .2, -.2); pad('violas', 'D#3', 19.5, 4.0, .14, .2); pad('violins', 'B3', 19.8, 3.6, .08, .3)

# ———————— 19.6–24.4: the bansuri at the ghat; her fingers count ————————
MID = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}
def hz(p): n, o = p[:-1], int(p[-1]); return 440 * 2 ** ((MID[n] + 12 * (o + 1) - 69) / 12)
def bansuri(phrase, t0, v=.5, glide=.07, buf=None):
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
    X.add(music if buf is None else buf, (y * v).astype(np.float32), t0, 1, .1)
bansuri([('D#5', .45), ('C#5', .3), ('B4', .5), ('G#4', 1.3)], 19.9, .2)
bansuri([('B4', .35), ('C#5', .35), ('D#5', .9), ('C#5', .4), ('B4', 1.4)], 22.0, .17)
pad('cellos', 'E2', 22.2, 2.4, .16, -.2); pad('violas', 'B2', 22.2, 2.3, .12, .2)
for k_, (t_, p) in enumerate(zip([22.5, 23.1, 23.7, 24.3], ['F#4', 'D#4', 'C#4', 'B3'])):
    note('harp', p, t_ - .05, 2.4, .36, .48, .1); note('glass', p, t_ - .04, 1.6, .1, .25, -.1)   # a finger folds: a month counted

# ———————— 24.45–26.1: the moon sets; no boita; it flares into a headlight ————————
pad('contrabass', 'B1', 24.5, 1.8, .2, 0, .5, .3); pad('cellos', 'F#2', 24.5, 1.7, .12, -.2, .45, .4)
X.add(fx, X.creak(.4), 25.25, .25, .2)
d = 1.3; y = nz(d) * (tt(d)[:int(round(d * SR))] / d) ** 3; y = X.bp(y, 400, 6000) * .05; stereo(fx, y, 24.78, 1, 0)   # a swell into the flare
def horn(t_, d=1.4, v=1.0):   # a train horn: two reedy tones, a little Doppler
    tm = tt(d); y = np.zeros_like(tm)
    for f0 in (311.1, 370.0, 466.2):
        f = f0 * (1 + .015 * (1 - tm / d)); ph = 2 * np.pi * np.cumsum(f) / SR; y += np.sign(np.sin(ph)) * .3 + np.sin(ph) * .5
    y = X.lp(y, 2200) * np.minimum(1, tm / .06) * np.minimum(1, (d - tm) / .4) * .05 * v; stereo(fx, y, t_, 1, .1)
horn(25.78, 1.5); X.add(fx, X.rumble(1.4, .9), 26.0, .5, 0); hit('sus_cymbal', 'roll', 25.0, .25, .25, 0)

# ———————— 26.1–30.6: the train ————————
def clack_at(t_, v=1., buf=None): X.add(fx if buf is None else buf, X.clack(R.uniform(.85, 1.1), .5 * v), t_, .32, R.uniform(-.2, .2))
def wheels(t0, t1, period, v=1., buf=None):
    t_ = t0
    while t_ < t1: clack_at(t_, v, buf); clack_at(t_ + .11, .7 * v, buf); t_ += period
wheels(26.15, 27.9, .62, .5)   # inside the coach, muffled by the window's glass
rum = X.lp(nz(4.6), 160) * .05 * bell_env(tt(4.6), [(0, 0), (.3, .7), (1.8, 1), (4.0, 1.2), (4.6, 0)]); stereo(fx, rum, 26.1, 1, 0)
pad('contrabass_pizz', 'B1', 26.2, .8, .3, 0, .5, .01); pad('contrabass_pizz', 'B1', 27.0, .8, .3, 0, .5, .01)
pad('cellos', 'G#2', 26.2, 1.8, .14, -.2); pad('violas', 'D#3', 26.3, 1.7, .1, .2)
X.add(fx, X.whoosh(.9, .4), 27.05, .4, 0)   # pull back out of the window
for t_, p in [(28.0, 'B4'), (28.88, 'D#5'), (29.55, 'F#5')]:   # a city: time slows on its name
    note('piano', p, t_ - .03, 2.6, .42, .5, .1); note('tubular_bells', p, t_ - .02, 2.4, .2, .34, -.1); note('glass', p, t_, 2.0, .12, .28, 0)
for t_ in (28.45, 29.2): X.add(fx, X.whoosh(.45, .7), t_, .55, .5)   # whip to the next coach
wheels(27.95, 28.45, .5, .35); wheels(28.86, 29.2, .5, .35); wheels(29.52, 29.85, .5, .35)
t_, per = 29.85, .32
while t_ < 30.55: clack_at(t_, .8); clack_at(t_ + per * .2, .6); t_ += per; per *= .8   # the train races off
d = .8; y = X.bp(nz(d), 300, 8000) * (tt(d)[:int(round(d * SR))] / d) ** 2 * .05; stereo(fx, y, 29.8, 1, 0); horn(29.95, .9, .6)
hit('sus_cymbal', 'roll', 29.95, .28, .3, 0); note('glass', 'B5', 30.55, 2.6, .25, .4); note('hand_chimes', 'F#6', 30.56, 2.4, .18, .35, .2)   # the flood of light

# ———————— 30.6–43.4: home ————————
room = X.lp(nz(13), 200) * .006; stereo(amb, fade(room, 1, 1), 30.5, 1, 0)
for t_ in np.arange(30.9, 43.4, 1.0): X.add(fx, X.click(1.6 if int(t_) % 2 else 1.4, .25), t_, .18, -.35)   # a wall clock: she is counting
crk = X.bp(nz(5), 4200, 5200) * (np.sin(2 * np.pi * 4.2 * tt(5)[:5 * SR]) > .6) * .004; stereo(amb, fade(crk, .5, .5), 30.6, 1, .4)   # crickets
for k_, (t_, p) in enumerate([(31.0, 'G#3'), (31.6, 'D#4'), (32.3, 'B4'), (33.2, 'C#5'), (33.9, 'B4'), (34.6, 'G#4')]): note('piano', p, t_, 2.6, .24, .4, (k_ % 2 - .5) * .3, rel=1.6)
pad('cellos', 'E2', 30.8, 4.6, .12, -.2); pad('violas', 'G#2', 31.0, 4.4, .08, .2)
# Dussehra: dhak and a conch from the pandal, heard through the window
for k_, t_ in enumerate(np.arange(35.3, 37.5, .16)):
    pat = [1, 0, 1, 1, 0, 1, 0, 1][k_ % 8]
    if pat: X.add(muff, S.hit('frame_drum', 'large' if k_ % 4 == 0 else 'small', .6), t_, .6, -.2 + .1 * (k_ % 3))
def shankha(t_, d=1.8, v=1.0, buf=None, f0=277.2):   # a conch: a hollow swelling tone that rises a little, and breath
    tm = tt(d); f = f0 * (1 + .03 * np.minimum(1, tm / .5)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + .55 * np.sin(2 * ph) + .35 * np.sin(3 * ph) + .2 * np.sin(5 * ph); y += X.bp(nz(d)[:len(tm)], 400, 3000) * .25
    y *= np.minimum(1, tm / .35) ** 2 * np.minimum(1, (d - tm) / .5) * .04 * v; stereo(fx if buf is None else buf, y, t_, 1, 0)
shankha(35.35, 1.6, .8, muff); murm = X.bp(nz(4), 200, 1200) * .01; stereo(muff, fade(murm, .5, .8), 35.3, 1, .1)
def scratch(t_, d, v=1.):   # her pen on the calendar
    m = int(round(d * SR)); tm = np.arange(m) / SR; y = X.bp(nz(d)[:m], 2500, 9000) * (.6 + .4 * np.sin(2 * np.pi * 9 * tm)) * np.sin(np.pi * tm / d) * .035 * v; stereo(fx, y, t_, 1, -.25)
scratch(36.0, .38); scratch(36.42, .38); scratch(38.0, .38); scratch(38.42, .38)
def page(t_):
    d = .55; m = int(round(d * SR)); tm = np.arange(m) / SR; y = X.bp(nz(d)[:m], 800, 7000) * np.sin(np.pi * tm / d) ** 2 * .05 * (1 + .5 * (R.random(m) > .985)); stereo(fx, y, t_, 1, -.3)
page(37.02); page(41.22)
# Diwali: fireworks, muffled
for t_ in (37.48, 37.78, 37.99, 38.29, 38.59, 38.89, 39.1, 39.4):
    X.add(muff, X.pop(.9), t_ - .02, .5, R.uniform(-.5, .5)); d = .9; m = int(round(d * SR)); cr = (R.random(m) > .997) * R.standard_normal(m) * np.exp(-np.arange(m) / SR * 3) * .3; stereo(muff, cr, t_ + .05, 1, R.uniform(-.5, .5))
note('piano', 'B4', 35.4, 2.4, .2, .36); note('piano', 'D#5', 37.5, 2.4, .2, .36); pad('cellos', 'G#2', 35.3, 4.0, .12, -.2); pad('violas', 'E3', 37.4, 2.0, .08, .2)
# the phone, the monsoon, Raja
for k_ in range(2):
    d = .28; m = int(round(d * SR)); y = np.sin(2 * np.pi * 165 * np.arange(m) / SR) * np.sign(np.sin(2 * np.pi * 30 * np.arange(m) / SR)) * .03; stereo(fx, y * np.hanning(m), 39.0 + k_ * .38, 1, .3)
rain = (X.bp(nz(4.4), 900, 7000) * .03 + X.lp(nz(4.4), 500) * .02) * bell_env(tt(4.4), [(0, 0), (.4, 1), (3.6, 1), (4.4, .2)]); stereo(muff, rain, 39.6, 1, 0)
X.add(muff, X.rumble(1.6, .6), 41.85, .45, -.2)
for t_ in (40.25, 42.21): X.add(muff, X.creak(.8), t_ - .2, .6, .4)   # the empty swing
note('piano', 'G#4', 39.8, 2.6, .22, .36); note('piano', 'E4', 40.9, 2.6, .2, .36)
for j, p in enumerate(['E3', 'B3', 'E4', 'G#4', 'B4', 'F#5']): note('harp', p, 42.0 + j * .07, 3, .3, .44, (j - 2.5) * .2)   # "Raja": hope
pad('cellos', 'E2', 42.0, 2.0, .16, -.2); pad('violas', 'B2', 42.05, 2.0, .12, .2); pad('violins', 'G#3', 42.1, 2.0, .09, .3)
scratch(42.12, .9, .7)

# ———————— 43.4–49.3: dawn at the water's edge ————————
def bird(t_, v=1., pan=0.):
    for j in range(R.integers(2, 5)):
        d = R.uniform(.05, .11); m = int(round(d * SR)); tm = np.arange(m) / SR; f0 = R.uniform(2800, 4200); f = f0 + R.uniform(-1500, 1500) * tm / d
        y = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * tm / d) ** 2 * .012 * v; stereo(amb, y, t_ + j * R.uniform(.09, .14), 1, pan)
for t_ in np.arange(43.6, 49.6, .55): bird(t_ + R.uniform(0, .3), .8, R.uniform(-.7, .7))
hit('nepal_bells', None, 43.75, .3, .4, .3); note('tubular_bells', 'B3', 43.9, 4, .22, .36, -.2)   # a temple bell, across the river
X.add(fx, X.whoosh(1.2, .25), 43.55, .35, 0)
pad('contrabass', 'B1', 44.2, 5.2, .18, 0, .5); pad('cellos', 'B2', 44.2, 5.2, .18, -.2); pad('violas', 'F#3', 44.4, 5.0, .14, .2); pad('violins', 'D#4', 45.0, 4.4, .12, .3); pad('violins', 'B4', 46.0, 3.4, .08, -.3)
bansuri([('F#5', .4), ('G#5', .3), ('B5', .7), ('G#5', .35), ('F#5', .35), ('D#5', .8), ('E5', .3), ('F#5', .5), ('D#5', .3), ('C#5', .3), ('B4', 1.6)], 44.45, .24)
d = .25; y = X.lp(nz(d), 1600) * np.exp(-tt(d)[:int(round(d * SR))] * 14) * .05; stereo(fx, y, 47.15, 1, .3); note('glass', 'F#5', 47.18, 2, .14, .3, .3)   # it touches the water
shankha(47.5, 2.2, 1.0); note('tubular_bells', 'B4', 47.56, 4, .38, .45); hit('gong', None, 47.55, .32, .42, 0)   # "prarthana"
for j, p in enumerate(['B3', 'F#4', 'B4', 'D#5', 'F#5', 'B5']): note('harp', p, 47.58 + j * .06, 3.4, .3, .45, (j - 2.5) * .2)
pad('cellos', 'G#2', 47.6, 2.2, .2, -.2); pad('violas', 'E3', 47.6, 2.2, .14, .2); pad('violins', 'B4', 47.7, 2.0, .1, .3)

# ———————— 49.3–53.6: the flash, the map, the question; then the river ————————
d = 1.0; y = X.bp(nz(d), 500, 9000) * (tt(d)[:int(round(d * SR))] / d) ** 3 * .05; stereo(fx, y, 48.45, 1, 0); hit('sus_cymbal', 'roll', 48.6, .25, .3, 0)
note('glass', 'B5', 49.4, 3, .3, .42); note('hand_chimes', 'F#6', 49.41, 3, .2, .36, .2); hit('gong', None, 49.38, .28, .38, 0)
pad('cellos', 'E2', 49.4, 4.2, .18, -.2); pad('violas', 'B2', 49.5, 4.1, .14, .2); pad('violins', 'G#3', 49.7, 3.9, .1, .3); pad('vibraphone_bowed', 'F#4', 49.6, 3.8, .12, 0, .4, 1.2); pad('contrabass', 'E1', 49.4, 4.0, .14, 0, .45)
for i_ in range(8): note('glockenspiel', ['B5', 'C#6', 'D#6', 'F#6', 'G#6', 'B6', 'C#7', 'D#7'][i_], 50.55 + .126 * i_, 1.4, .12, .3, (i_ % 3 - 1) * .5)   # a thread home lands
for t_, p in [(50.4, 'B4'), (51.3, 'G#4'), (52.3, 'F#4')]: note('piano', p, t_, 2.8, .24, .4, 0, rel=1.8)
note('glass', 'B4', 53.15, 3.0, .26, .4); hit('gong', None, 53.14, .2, .32, 0)   # Cuttack's light falls back into the river (the first frame's breath, again)

# ———————— mix ————————
mf = np.stack([X.lp(muff[:, 0], 1500), X.lp(muff[:, 1], 1500)], 1).astype(np.float32)   # the festivals are on the other side of the glass
E = np.clip(env_d * 4, 0, 1)
bus = music * .62 * duck[:, None] + fx * .9 * (1 - .3 * E)[:, None] + amb * (1 - .45 * E)[:, None] + mf * .8 * (1 - .4 * E)[:, None]
bus = S.room(bus, size=.6, mix=.22)
out = bus + np.stack([vo, vo], 1) * .82
w = out[N:].copy(); out = out[:N]; out[:len(w)] += w   # the tail wraps onto the start: the loop has no seam
sp = env[:N] > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[:N][sp] * .82), rms(bus[:N][sp].mean(1)), rms(bus[:N][~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'harp', 'nepal_bells', 'glockenspiel', 'glass', 'frame_drum', 'gong', 'sus_cymbal', 'vibraphone_bowed', 'kalimba', 'piano', 'cellos', 'violas', 'violins', 'violins_trem', 'contrabass', 'contrabass_pizz'])))
