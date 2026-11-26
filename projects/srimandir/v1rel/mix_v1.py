# Srimandir — voice + foley + a restrained bed → out/mix.wav (84.4 s). Run: $LIB/.venv/bin/python mix.py
# Accurate and clean: every stone that lands is heard when it lands (times from events.json written by build.py); the sea, the
# wind at height, the kitchen's fire and steam, the crowds of Rath Yatra are real ambiences; music is only a quiet tanpura in D
# and a few bells / a conch at the named reveals (Rekha Deula, Jagamohana, Rath Yatra, Jai Jagannath).
import os, sys, json, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = '/home/user/lemomo-ai/lemo-opuscar'
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 84.4; N = int(DUR * SR); NT = N + int(3 * SR)
R = np.random.default_rng(5)
music, fx, amb = (np.zeros((NT, 2), np.float32) for _ in range(3))
def tt(d): return np.arange(int(round(d * SR))) / SR
def nz(d): return R.standard_normal(int(round(d * SR)))
def stereo(buf, x, t, g=1., pan=0.):
    if t < 0 or t >= DUR + 2.5: return
    X.add(buf, np.asarray(x, np.float32), t, g, pan)
def note(inst, p, t, d, v, g=.6, pan=0., att=.01, rel=.8): X.add(music, S.note(inst, p, d, v, attack=att, release=rel), t, g, pan)
def hit(inst, var, t, v, g=.6, pan=0.): X.add(music, S.hit(inst, var, v), t, g, pan)
def fade(x, a=.4, b=.6): n = len(x); e = np.ones(n); ia, ib = min(n, int(a * SR)), min(n, int(b * SR)); e[:ia] = np.linspace(0, 1, ia); e[n - ib:] = np.linspace(1, 0, ib); return (x * e).astype(np.float32)
def env_seg(d, pts): xs, ys = zip(*pts); return np.interp(tt(d), xs, ys)
wav = subprocess.run(['/home/user/tools/ffmpeg/bin/ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.wav'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, NT - len(vo)))
vo = X.hp(vo, 70); vo = vo + .18 * X.bp(vo, 2600, 6000); vo = X.compress(X.norm(vo, .9), thr=.2, ratio=3.0); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .5 * np.clip(env * 4, 0, 1); sm = int(.2 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')

# ———————— foley ————————
def stone(t, v=1., pan=0., f=70, grit=1.):      # a dressed stone block set down on stone: a deep thump, a short grind of grit
    d = .5; tm = tt(d); y = np.sin(2 * np.pi * (f + 30 * np.exp(-tm * 25)) * tm) * np.exp(-tm * 14) * .16
    y += X.lp(nz(d), 1200) * np.exp(-tm * 22) * .08 + X.bp(nz(d), 1800, 6000) * np.exp(-tm * 45) * .025 * grit
    stereo(fx, y * v, t, 1, pan)
def wood(t, v=1., pan=0.):                      # timber knocked into place
    d = .3; tm = tt(d); f = R.uniform(150, 240); y = np.sin(2 * np.pi * f * tm) * np.exp(-tm * 30) * .1 + np.sin(2 * np.pi * f * 2.7 * tm) * np.exp(-tm * 50) * .04 + X.bp(nz(d), 600, 3000) * np.exp(-tm * 60) * .04
    stereo(fx, y * v, t, 1, pan)
def clay(t, v=1., pan=0.):                      # an earthen handi set on another
    d = .22; tm = tt(d); f = R.uniform(200, 260); y = np.sin(2 * np.pi * f * tm) * np.exp(-tm * 28) * .09 + np.sin(2 * np.pi * f * 2.3 * tm) * np.exp(-tm * 45) * .03 + X.bp(nz(d), 700, 3200) * np.exp(-tm * 60) * .05
    stereo(fx, y * v, t, 1, pan)
def rumble(t, d, v=1., lo=40, hi=400):          # a slide of stone, a wall rising
    y = X.bp(nz(d), lo, hi) * np.sin(np.pi * np.clip(tt(d) / d, 0, 1)) ** .7 * .09 * v; stereo(fx, y, t, 1, 0)
def surf(t0, t1, v=1.):                         # waves breaking and washing up the sand, in long cycles
    d = t1 - t0; tm = tt(d); y = np.zeros(len(tm))
    for c in np.arange(-2, d, 3.4 + R.uniform(-.3, .3)):
        e = np.clip((tm - c) / 1.2, 0, 1) ** 2 * np.exp(-np.clip(tm - c - 1.2, 0, None) / 1.6) * (tm > c)
        y += e * R.uniform(.7, 1.1)
    w = X.bp(nz(d), 150, 5000) * y * .05 + X.lp(nz(d), 300) * .03
    stereo(amb, fade(w * v, .8, 1.2), t0, 1, 0); stereo(amb, fade(X.bp(nz(d), 300, 6000) * y * .03 * v, .8, 1.2), t0 + .07, 1, .3)
def wind(t0, t1, v=1., lo=150, hi=1800):
    d = t1 - t0; e = .7 + .3 * np.sin(tt(d) * .9 + R.uniform(0, 6)); y = X.bp(nz(d), lo, hi) * e * .025 * v; stereo(amb, fade(y, 1, 1.2), t0, 1, -.2); stereo(amb, fade(X.bp(nz(d), lo, hi) * e * .022 * v, 1, 1.2), t0, 1, .3)
def crowd(t0, t1, v=1.):                        # many people talking, far and near (band-limited noise with syllabic flutter)
    d = t1 - t0; tm = tt(d); y = np.zeros(len(tm))
    for k in range(14):
        f = R.uniform(2.5, 5.5); y += X.bp(nz(d), R.uniform(250, 500), R.uniform(1200, 2600)) * (.5 + .5 * np.sin(2 * np.pi * f * tm + R.uniform(0, 6))) ** 2
    stereo(amb, fade(y * .006 * v, 1.2, 1.2), t0, 1, 0)
def flap(t, d=1.5, v=1., pan=.2):               # cloth flapping in wind
    tm = tt(d); y = X.bp(nz(d), 300, 4000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 7 * tm + 3 * np.sin(tm * 3)))) * np.sin(np.pi * np.clip(tm / d, 0, 1)) * .04 * v; stereo(fx, y, t, 1, pan)
def creak(t, v=1., pan=0.): X.add(fx, X.creak(.6 * v), t, .5, pan)
def ignite(t, v=1.): d = .9; tm = tt(d); y = X.lp(nz(d), 500) * (np.clip(tm / .15, 0, 1) * np.exp(-tm * 2.5)) * .12 * v; stereo(fx, y, t, 1, 0)
def crackle(t0, t1, v=1.):
    for _ in range(int((t1 - t0) * 30)):
        t = R.uniform(t0, t1); d = .02; y = X.hp(nz(d), 1500) * np.exp(-tt(d) * R.uniform(150, 300)) * R.uniform(.01, .05) * v; stereo(amb, y, t, 1, R.uniform(-.4, .4))
    d = t1 - t0; stereo(amb, fade(X.lp(nz(d), 300) * .025 * v, .5, .8), t0, 1, 0)
def hiss(t0, d, v=1.): y = X.bp(nz(d), 2500, 9000) * env_seg(d, [(0, 0), (.6, 1), (d - .8, .8), (d, 0)]) * .02 * v; stereo(fx, y, t0, 1, .1)
def drum(t, v=1., f=55):                        # a distant war drum
    d = .9; tm = tt(d); y = np.sin(2 * np.pi * (f + 25 * np.exp(-tm * 18)) * tm) * np.exp(-tm * 5) * .12 + X.lp(nz(d), 300) * np.exp(-tm * 12) * .05; stereo(fx, X.lp(y, 900) * v, t, 1, R.uniform(-.5, .5))
def shankha(t, d=1.8, v=1., f0=293.7):
    tm = tt(d); f = f0 * (1 + .03 * np.minimum(1, tm / .5)); ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + .55 * np.sin(2 * ph) + .35 * np.sin(3 * ph) + .2 * np.sin(5 * ph); y += X.bp(nz(d)[:len(tm)], 400, 3000) * .25
    y *= np.minimum(1, tm / .35) ** 2 * np.minimum(1, (d - tm) / .5) * .04 * v; stereo(fx, y, t, 1, 0)
def ghanta(t, v=1., pan=0.): hit('tubular_bells', None, t, .25 * v, .4, pan); note('glass', 'D6', t + .01, 2.2, .12 * v, .2, pan)
def tanpura_pluck(f, d=3.4, v=.5, seed=0):
    tm = tt(d); r = np.random.default_rng(seed); y = np.zeros_like(tm)
    for h in range(1, 16):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * tm + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * tm * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-tm / 2.2) * np.minimum(1, tm / .01); return (y / np.abs(y).max() * v).astype(np.float32)

EV = json.load(open(os.path.join(HERE, 'events.json')))
last = -1
for name, t in sorted(EV['build'], key=lambda e: e[1]):
    if t < 0 or t > DUR: continue
    gap = t - last
    if name.startswith('v_'):
        big = any(k in name for k in ('amalaka', 'khapuri', 'beki'))
        if big: stone(t, 1.3, 0, 48, .6)
        elif 'kalasha' in name: note('glass', 'A5', t, 2.0, .18, .3); hit('tubular_bells', None, t, .12, .25)
        elif gap > .03: stone(t, .55 if t > 9.8 else .9, R.uniform(-.3, .3), R.uniform(62, 85))
    elif name.startswith(('jaga', 'bhoga', 'nata', 'shrine', 'innerE', 'singhadwara', 'gate')):
        if gap > .05: stone(t, .45, R.uniform(-.4, .4), R.uniform(65, 90))
    elif name.startswith(('kurma', 'megha')):
        if gap > .08: stone(t, .35, R.uniform(-.6, .6), R.uniform(55, 70), .4)
    elif name.startswith('ros_'): stone(t, .5, .2, 75)
    elif name.startswith('handi'):
        main = name.startswith('handi3_'); clay(t, .9 if main else .18, 0 if main else R.uniform(-.7, .7))
    elif name.startswith('step'): stone(t, .25, 0, 95)
    elif name.startswith(('taladhwaja', 'darpadalana', 'nandighosa')):
        if 'canopy' in name: flap(t, 1.0, .9)
        elif gap > .03: wood(t, .5, R.uniform(-.5, .5))
    elif name in ('nilachakra',): note('glass', 'E6', t, 2.5, .2, .3); note('vibraphone_bowed', 'A4', t, 2.4, .15, .25)
    elif name.startswith('flag'): flap(t, 1.4, .9)
    last = t
for name, t in EV['ghost']: stone(t, .3, R.uniform(-.5, .5), 60, 1.5)
rumble(12.98, 1.0, 1.2); rumble(13.3, .7, .8, 80, 900)

# ———————— ambience by place ————————
surf(0, 7.5, 1.0); wind(0, 84.4, .7)
surf(16.6, 23.2, 1.1)
for t in (17.6, 19.0, 20.6, 22.0): creak(t, .6, -.5)
flap(18.2, 2.5, .5, -.5); flap(20.4, 2.2, .5, -.5)
surf(81.0, 84.4, .35)
crowd(23.6, 27.6, .7)
hiss(42.4, .9, .5); stereo(amb, fade(X.lp(nz(7.5), 200) * .018, .8, 1), 43.0, 1, 0)   # into the kitchen: room tone
for t in (45.95, 46.02, 46.1, 46.2, 46.3): ignite(t, 1.0 if t == 45.95 else .35)
crackle(45.95, 51.2, 1.0); hiss(47.3, 3.6, 1.0)
for i in range(18): drum(49.3 + i * .38, .5 + .5 * i / 17, 52 + (i % 3) * 3)              # eighteen approaches
X.add(music, S.note('horn', 'D3', 1.8, .2, attack=.4, release=.8), 50.2, .25, -.4); X.add(music, S.note('horn', 'A2', 1.8, .2, attack=.4, release=.8), 52.0, .25, .4)
rumble(54.2, 3.2, 1.0); rumble(57.0, 2.8, 1.2)
crowd(61.0, 72.5, 1.4)
for t in np.arange(65.6, 71.0, .55): stereo(fx, X.lp(nz(.6), 180) * .06, t, 1, R.uniform(-.3, .3))       # wheels rolling
for t in (66.0, 67.3, 68.6, 70.1): creak(t, .8, .3)
for k, t in enumerate(np.arange(63.0, 72.0, .45)):                                               # ghanta, mardala
    hit('frame_drum', 'large' if k % 4 == 0 else 'small', t, .22, .35, (k % 2 - .5) * .4)
for t in (64.2, 66.5, 68.8, 70.2): ghanta(t, .8, .3)
shankha(69.45, 1.6, 1.2)
wind(72.4, 80.5, 1.6, 300, 3000)                                                                 # at the top of the spire
for t in np.arange(75.0, 79.4, .55): stereo(fx, X.lp(nz(.12), 900) * np.exp(-tt(.12) * 30) * .03, t, 1, .2)   # hands and feet on stone
flap(75.5, 4.0, 1.2, .3); flap(79.3, 1.6, 1.6, .2)

# ———————— the restrained music: a tanpura in D; bells and a conch at the named reveals ————————
D2, A2, D3 = 73.42, 110.0, 146.83; t0 = 6.5; i = 0
while t0 < DUR - 1:
    g = .0 if 48.8 < t0 < 59.0 else 1.0
    if g:
        for f, dt, pan in ((A2, 0, -.3), (D3, .7, .2), (D3, 1.4, .25), (D2, 2.1, -.1)): stereo(music, tanpura_pluck(f, v=.06, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.8
ghanta(14.4, .9); note('harp', 'D4', 14.45, 3, .2, .3, -.2); note('harp', 'A4', 14.6, 3, .2, .3, .2)   # Rekha Deula, 214 ft
note('glass', 'A5', 20.65, 2.4, .16, .28, .2)                                                       # "White Pagoda"
ghanta(28.55, .7, -.2)                                                                              # Jagamohana
for k in range(6): hit('frame_drum', 'small', 30.4 + k * .3, .15, .25, .2)                         # nacha: a mardala's patter
ghanta(35.25, .5, .3); ghanta(40.75, .45, -.2)
shankha(80.3, 2.0, 1.2); ghanta(80.35, 1.0); ghanta(81.2, .7, .3)                                    # Jai Jagannath
for j, p in enumerate(['D3', 'A3', 'D4', 'F#4', 'A4', 'D5']): note('harp', p, 81.6 + j * .09, 3.2, .2, .32, (j - 2.5) * .15)
X.add(music, S.note('cellos', 'D2', 3.0, .25, attack=1.0, release=1.6), 81.4, .4, 0); X.add(music, S.note('violins', 'A4', 3.0, .15, attack=1.2, release=1.6), 81.6, .3, 0)

# ———————— mix ————————
E = np.clip(env * 4, 0, 1)
bus = music * .9 * duck[:, None] + fx * 1.1 * (1 - .3 * E)[:, None] + amb * 1.2 * (1 - .4 * E)[:, None]
bus = S.room(bus, size=.55, mix=.18)
out = (bus + np.stack([vo, vo], 1) * .82)[:N]
sp = env[:N] > .15; rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[:N][sp] * .82), rms(bus[:N][sp].mean(1)), rms(bus[:N][~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape)
