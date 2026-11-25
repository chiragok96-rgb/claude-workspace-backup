# Plot · Right of Way — voice + score + foley → out/mix.wav (55.7 s, loops). Run: $LIB/.venv/bin/python mix.py
# In D. A classic, premium bed: warm strings and a solo piano motif (A–D–E–F#, "the plot"), harp and glass for the gold light.
# The price ticks up and lands on a chime; the sun turns (a swell and a clock); the gate rises and slams (iron, timpani);
# the neighbour's claim is a low B-flat (the flat sixth) under trembling strings; "he wasn't wrong" is one D-minor chord;
# the house lights cut (relay, silence, a projector's hum) and the record draws itself in glass; on the light table a quiet
# pizzicato pulse walks with the reading; pen, paper, a brass weight, the loupe; "badhia" resolves to D major; "sabadhan" is a
# rubber stamp on a low B-flat; the deed's empty line ends on a hollow pluck; the registered seal is a press and a bell;
# the spoken promise blows away as breath; back on the model the sun runs back (a reversed swell), the gate un-happens,
# gold runs up the lane on a harp, a bell for the seal; dusk and warm windows; "follow" lands on D major and runs into the start.
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 55.7; N = int(DUR * SR); TAIL = 4.0; NT = N + int(TAIL * SR)
R = np.random.default_rng(7)
def st(n=NT): return np.zeros((n, 2), np.float32)
music, fx, amb = st(), st(), st()
def tt(d): return np.arange(int(round(d * SR))) / SR
def nz(d): return R.standard_normal(int(round(d * SR)))
wav = subprocess.run(['/home/user/tools/ffmpeg/bin/ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, NT - len(vo)))
vo = X.hp(vo, 70); vo = vo + .18 * X.bp(vo, 2600, 6000); vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .55 * np.clip(env * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')
def pad(inst, p, t, d, v, pan=0, g=.6, att=1.2, rel=1.8, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.8, buf=None): X.add(music if buf is None else buf, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def hit(inst, var, t, v, g=.6, pan=0., buf=None): X.add(music if buf is None else buf, S.hit(inst, var, v), t, g, pan)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)
def stereo(buf, x, t, g=1., pan=0.):
    if t < 0: t += DUR
    X.add(buf, np.asarray(x, np.float32), t, g, pan)
def chord(inst, ps, t, d, v, g=.5, att=1.0, rel=2.0, spread=.5):
    for j, p in enumerate(ps): pad(inst, p, t, d, v, (j / max(1, len(ps) - 1) - .5) * spread, g, att, rel)

# ———————— foley made here ————————
def clang(t, v=1.0, f0=148.):     # an iron gate shutting: inharmonic ring, latch, a body thud
    d = 1.8; tm = tt(d); y = np.zeros_like(tm)
    for r, a, dec in [(1, 1, .9), (2.32, .7, .6), (3.17, .55, .45), (4.41, .4, .35), (5.6, .3, .25), (7.1, .2, .18)]:
        y += a * np.sin(2 * np.pi * f0 * r * tm + R.uniform(0, 6)) * np.exp(-tm / dec)
    y = y * .05 + X.bp(nz(d), 1500, 7000) * np.exp(-tm / .02) * .12
    stereo(fx, y * v, t, 1, .05); X.add(fx, X.thump(.8 * v, 60), t, .7, 0); X.add(fx, X.click(.6, .7 * v), t + .09, .5, .1)
def relay(t, v=1.0): X.add(fx, X.click(.45, v), t, .7, -.1); X.add(fx, X.thump(.5 * v, 90), t + .01, .5, 0)
def hum(t0, t1, v=1.0):           # a projector's fan and mains hum
    d = t1 - t0; tm = tt(d); y = (np.sin(2 * np.pi * 100 * tm) * .4 + np.sin(2 * np.pi * 200 * tm) * .2) * .004 + X.lp(nz(d), 700) * .006
    stereo(amb, fade(y * v, .5, .8), t0, 1, .15)
def pen(t, d=.45, v=1.0, pan=0.):  # nib on paper
    tm = tt(d); y = X.bp(nz(d), 2200, 7500) * (.5 + .5 * np.abs(np.sin(tm * 40 + R.uniform(0, 6)))) * np.sin(np.pi * np.clip(tm / d, 0, 1)) ** .6 * .022
    stereo(fx, y * v, t, 1, pan)
def paper(t, d=.7, v=1.0, pan=0.):  # a sheet slid across glass
    tm = tt(d); y = X.bp(nz(d), 500, 5000) * np.sin(np.pi * np.clip(tm / d, 0, 1)) ** 1.5 * .03
    stereo(fx, y * v, t, 1, pan)
def stamp(t, v=1.0): X.add(fx, X.thump(.9 * v, 110), t, .8, 0); y = X.bp(nz(.08), 800, 4000) * np.exp(-tt(.08) * 60) * .08 * v; stereo(fx, y, t, 1, 0)
def breath(t, d=1.3, v=1.0, pan=0.):
    tm = tt(d); y = X.bp(nz(d), 300, 3500) * np.sin(np.pi * np.clip(tm / d, 0, 1)) ** 2 * .03; stereo(fx, y * v, t, 1, pan)
def tick(t, v=1.0, pan=0.): X.add(fx, X.click(1.6, .3 * v), t, .4, pan)
def revswell(t_end, d=1.2, v=1.0):  # a reversed cymbal: grows into t_end
    y = S.hit('sus_cymbal', None, .5)[:int(d * SR)]; y = np.asarray(y)[::-1].copy(); X.add(music, y, t_end - len(y) / SR, .5 * v, 0)

# ———————— 0–2.7: the dive; ₹20 lakh; the plot keeps its gold ————————
X.add(fx, X.whoosh(1.0, .35), 0.0, .5, 0)
chord('cellos', ['D2', 'A2'], 0.0, 4.6, .3, .5); chord('violins', ['F#4', 'A4', 'E5'], .1, 2.8, .2, .3, 1.2)
for j, (t_, p) in enumerate([(0.18, 'A4'), (.62, 'D5'), (1.0, 'E5'), (1.36, 'F#5')]): note('piano', p, t_, 2.4, .32 - .02 * j, .45, .1, rel=1.6)
for j in range(22): tick(.45 + 1.45 * (j / 22) ** .8, .5 + .5 * j / 22, .3)     # the price rolling
note('glass', 'A5', 1.92, 2.2, .3, .38, .2); note('glockenspiel', 'D6', 1.92, 1.6, .15, .22, .2)

# ———————— 2.7–4.95: "but"; three months — the sun turns ————————
note('piano', 'A#2', 2.74, 3.0, .35, .5, -.2, rel=2); pad('cellos', 'A#2', 2.74, 2.4, .3, -.1, .45, .4)
X.add(music, S.note('violins_trem', 'D5', 1.6, .18, attack=1.0, release=.6), 3.4, .35, .2)
for j in range(30): tick(3.55 + 1.35 * j / 30, .35 + .3 * np.sin(np.pi * j / 30), -.3 + .6 * (j % 2))   # a clock, fast
d = 1.5; y = X.bp(nz(d), 400, 6000) * np.sin(np.pi * np.clip(tt(d) / d, 0, 1)) ** 2 * .02; stereo(fx, y, 3.5, 1, 0)

# ———————— 4.8–7.4: down the lane; the gate rises and slams on "Gate" ————————
for j, t_ in enumerate(np.arange(4.85, 6.2, .3)): note('contrabass_pizz', 'D2', t_, .5, .3 + .03 * j, .5)
X.add(fx, X.whoosh(1.0, .3), 4.8, .35, 0); stereo(fx, X.rumble(.4, .5), 5.7, .4, 0)
clang(6.26, 1.0); hit('timpani', None, 6.26, .55, .55, 0); hit('gong', None, 6.27, .25, .3, 0)
pad('cellos', 'D2', 6.3, 4.3, .3, -.2, .5, .3); pad('contrabass', 'D1', 6.3, 4.3, .3, 0, .4, .3)

# ———————— 7.4–12.6: the neighbour; his claim floods; it crisps into the record ————————
relay(7.5, .35); hum(7.5, 10.8, .5)
note('piano', 'A#4', 7.6, 2.5, .2, .35, .3, rel=1.8); note('piano', 'A4', 8.5, 2.5, .18, .33, .3, rel=1.8)
X.add(music, S.note('violins_trem', 'A#3', 2.2, .22, attack=.8, release=.8), 9.15, .45, -.2); X.add(music, S.note('violas', 'D4', 2.2, .2, attack=.8, release=.8), 9.15, .4, .2)
d = 1.3; y = X.lp(nz(d), 300) * (tt(d) / d) ** 2 * .05; stereo(fx, y, 9.15, 1, 0)   # the flood
chord('piano', ['D2', 'A2', 'F3', 'D4'], 11.0, 3.2, .38, .5, .005, 2.2, .4); pad('cellos', 'D2', 11.0, 1.8, .3, 0, .45, .3)   # he wasn't wrong
for j in range(4): tick(11.05 + j * .12, .6, .4)

# ———————— 12.68–17.9: lights out; the record projected; the road breaks; over to the light table ————————
relay(12.68, 1.0); hum(12.7, 17.8, 1.0)
y = np.sin(2 * np.pi * 36.7 * tt(4.6)) * .03; stereo(music, fade(y, .6, 1.2), 12.8, 1, 0)   # a sub drone in the dark
for j in range(22): note('glass', ['D6', 'A5', 'E6', 'F#6', 'A6'][j % 5], 12.85 + j * .075 + R.uniform(0, .03), .9, .07 + .002 * j, .2, R.uniform(-.7, .7))   # the lines drawing
revswell(15.0, 1.0, .7); note('vibraphone_bowed', 'A#3', 15.0, 2.5, .25, .4, 0, att=.05, rel=1.5)
note('harp', 'D3', 15.05, 2.5, .25, .4, -.3)
X.add(fx, X.whoosh(1.4, .25), 16.5, .35, .3)
relay(16.9, .4); d = .9; y = X.bp(nz(d), 200, 2500) * (tt(d) / d) ** 2 * .012; stereo(fx, y, 16.9, 1, .3)   # the table's light comes up
stereo(amb, fade(np.sin(2 * np.pi * 120 * tt(25)) * .0025 + X.lp(nz(25), 900) * .003, 1, 1.5), 17.3, 1, .25)   # its gentle hum, under the reading

# ———————— 17.8–37.7: the records — a quiet pizzicato pulse walks with the reading ————————
X.add(fx, X.thump(.55, 150), 18.26, .7, .3); X.add(fx, X.click(.7, .4), 18.27, .4, .3)   # the brass weight on the advance
BPM = 96; b = 60 / BPM
for j, t_ in enumerate(np.arange(18.6, 37.4, b)):
    if 28.5 < t_ < 31.6 or 36.25 < t_ < 37.4: continue
    bar = j // 4; root = ['D2', 'D2', 'B1', 'G1'][bar % 4] if t_ < 28.5 else ['D2', 'C2', 'A#1', 'A1'][bar % 4]
    if j % 4 == 0: note('contrabass_pizz', root, t_, .6, .32, .5)
    note('cellos_pizz', ['A3', 'F#3', 'D4', 'A3'][j % 4] if t_ < 28.5 else ['A3', 'F3', 'D4', 'A3'][j % 4], t_ + b / 2, .4, .16, .3, .25)
chord('violas', ['F#3', 'A3'], 18.7, 9.6, .14, .3, 2.0, 2.0); chord('cellos', ['D3'], 18.7, 9.6, .15, .3, 2.0, 2.0)
pen(20.2, .4, 1, -.2); pen(20.55, .4, 1, -.1)                                         # rings round the numbers
for j, p in enumerate(['D5', 'F#5', 'A5', 'D6']): note('glockenspiel', p, 20.95 + j * .16, 1.2, .14, .26, -.3 + j * .2)   # the numbers fly
X.add(fx, X.whoosh(1.2, .2), 21.0, .3, .2); paper(21.0, .7, .5, .3)
X.add(fx, X.click(1.2, .35), 22.5, .5, .1)                                            # the loupe sets down on glass
pen(23.25, .7, .8, .1); note('glass', 'A5', 23.6, 1.8, .2, .3, .2)                    # Odisha Sarkar
pen(24.7, .55, .8, .1); note('glass', 'D6', 25.0, 1.8, .2, .3, .2)                    # Rasta
pen(26.85, .38, 1.1, .2); chord('piano', ['D3', 'F#3', 'A3', 'D4', 'F#4'], 26.9, 3.0, .3, .45, .005, 2.2, .5); chord('violins', ['A4', 'D5', 'F#5'], 26.9, 2.6, .18, .3, .5, 2)   # badhia
note('harp', 'A4', 27.6, 2, .2, .3, .3); note('harp', 'D5', 27.75, 2, .2, .3, .35)
paper(28.85, .6, .5, .2); pen(29.5, 1.0, .9, .1)
pad('cellos', 'D2', 29.3, 3.2, .3, -.1, .45, .6); X.add(music, S.note('violins_trem', 'A#4', 2.4, .2, attack=1.2, release=.6), 29.4, .35, .2)
stamp(31.17, 1.0); note('piano', 'A#1', 31.17, 3.0, .45, .55, 0, rel=2.2); note('piano', 'E3', 31.17, 2.6, .25, .35, .2, rel=2); hit('timpani', None, 31.18, .4, .4, 0)   # sabadhan
paper(32.35, .9, .7, -.2)
for j, t_ in enumerate([33.6, 34.25, 34.85]): tick(t_, .5, .2); note('marimba', ['D5', 'E5', 'F#5'][j], t_, .6, .12, .22, .2)
for j in range(8): note('glass', 'A5' if j < 7 else 'A5', 35.5 + j * .1, .4, .06, .14, .1 + j * .05)   # the cursor along the blank
note('cellos_pizz', 'D2', 36.32, 1.2, .4, .5, 0); note('piano', 'D2', 36.32, 2.0, .2, .3, 0, rel=1.5)   # — none

# ———————— 37.7–42.5: the registered deed; the seal; the way inked; the promise blows away ————————
paper(37.85, .95, 1.0, .3)
chord('cellos', ['D2', 'A2'], 37.9, 5.0, .26, .45, 1.2, 2.0); chord('violins', ['D4', 'F#4', 'A4'], 38.6, 4.2, .2, .32, 1.4, 2.0)
X.add(fx, X.creak(.5), 38.9, .3, .1); X.add(fx, X.thump(1.0, 75), 39.22, .85, 0); hit('gong', None, 39.23, .3, .32, 0); note('tubular_bells', 'D5', 39.25, 3, .3, .35, .1)   # registered
note('glass', 'D6', 39.3, 2.5, .22, .3, .2)
pen(39.75, 1.15, .9, 0); [note('harp', p, 39.8 + j * .1, 2.2, .2, .3, -.4 + j * .1) for j, p in enumerate(['D4', 'E4', 'F#4', 'A4', 'B4', 'D5', 'E5', 'F#5', 'A5', 'D6'])]   # the way
pen(40.25, .3, .7, -.3); pen(40.6, .3, .7, .3)                                         # signatures
breath(41.05, .6, .8, -.2); breath(41.7, 1.0, 1.2, .3)                                 # the spoken promise forms, then blows away

# ———————— 42.5–48.2: back to the land; the sun runs back; the gate un-happens; gold up the lane; sealed ————————
X.add(fx, X.whoosh(1.6, .3), 42.5, .45, -.2); hum(42.6, 44.0, .6)
pad('cellos', 'A#1', 43.0, 1.6, .28, 0, .45, .5); X.add(music, S.note('violins_trem', 'D5', 1.4, .16, attack=.6, release=.5), 43.1, .3, .1)
revswell(45.55, 1.2, 1.0)
for j in range(26): tick(44.4 + 1.15 * j / 26, .35 + .3 * np.sin(np.pi * j / 26), .3 - .6 * (j % 2))   # the clock runs back
X.add(fx, X.creak(.7), 44.6, .45, .1); stereo(fx, X.rumble(.45, .4), 45.05, .35, 0)
for j, p in enumerate(['D3', 'A3', 'D4', 'E4', 'F#4', 'A4', 'D5', 'E5', 'F#5', 'A5', 'D6', 'F#6']): note('harp', p, 45.75 + j * .085, 2.6, .22, .36, -.5 + j * .09)   # gold runs up the lane
chord('violins', ['A4', 'D5', 'F#5'], 45.8, 3.6, .22, .34, .8, 2.2); chord('cellos', ['D2', 'A2', 'F#3'], 45.8, 4.0, .28, .45, .8, 2.2)
note('tubular_bells', 'A4', 46.95, 3.2, .3, .38, 0); note('glass', 'A5', 46.97, 2.4, .2, .3, .2)   # sealed
for j, (t_, p) in enumerate([(46.3, 'A4'), (46.8, 'D5'), (47.3, 'E5'), (47.75, 'F#5')]): note('piano', p, t_, 2.6, .24, .36, .1, rel=1.8)

# ———————— 48.4–51.5: dusk; windows; a thread of gold to one home ————————
chord('vibraphone_bowed', ['D4', 'F#4', 'B4'], 48.4, 3.2, .18, .3, 1.0, 1.8)
for j in range(10): note('marimba', ['D5', 'F#5', 'A5', 'B5', 'D6'][j % 5], 49.0 + j * .12 + R.uniform(0, .04), .5, .06, .14, R.uniform(-.6, .6))   # windows light
for j, p in enumerate(['A5', 'B5', 'D6', 'E6', 'F#6']): note('glockenspiel', p, 50.5 + j * .2, 1.2, .1, .2, -.3 + j * .15)   # the thread home
note('piano', 'B4', 48.6, 2.4, .2, .32, 0, rel=1.6); note('piano', 'A4', 49.8, 2.4, .2, .32, 0, rel=1.6)

# ———————— 51.7–55.7: follow; every plot lit; D major; into the start ————————
for j in range(16): note('glass', ['D5', 'F#5', 'A5', 'D6', 'E6', 'F#6', 'A6'][j % 7], 51.95 + j * .1, 1.4, .07 + .003 * j, .16, R.uniform(-.6, .6))
chord('cellos', ['D2', 'A2', 'D3'], 52.2, 5.0, .3, .45, 1.0, 3.0); chord('violins', ['F#4', 'A4', 'D5', 'E5'], 52.3, 4.8, .2, .32, 1.2, 3.0)
for j, (t_, p) in enumerate([(52.35, 'A4'), (52.8, 'D5'), (53.2, 'E5'), (53.6, 'F#5'), (54.6, 'A5')]): note('piano', p, t_, 3.0, .26 - .02 * j, .4, .1, rel=2.0)
note('harp', 'D4', 55.3, 3, .2, .3, -.2); note('harp', 'A4', 55.4, 3, .2, .3, .2)

# ———————— mix ————————
E = np.clip(env * 4, 0, 1)
bus = music * 1.05 * duck[:, None] + fx * 1.25 * (1 - .3 * E)[:, None] + amb * 1.2 * (1 - .4 * E)[:, None]
bus = S.room(bus, size=.6, mix=.22)
out = bus + np.stack([vo, vo], 1) * .82
w = out[N:].copy(); out = out[:N]; out[:len(w)] += w   # the tail wraps onto the start: the loop has no seam
sp = env[:N] > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[:N][sp] * .82), rms(bus[:N][sp].mean(1)), rms(bus[:N][~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['piano', 'cellos', 'cellos_pizz', 'contrabass', 'contrabass_pizz', 'violas', 'violins', 'violins_trem', 'harp', 'glass', 'glockenspiel', 'marimba', 'tubular_bells', 'vibraphone_bowed', 'timpani', 'gong', 'sus_cymbal'])))
