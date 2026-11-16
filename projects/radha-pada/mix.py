# Score + foley + voice → out/mix.wav. Run with the library's Python: $LIB/.venv/bin/python mix.py
# Score: tanpura drone in D (synthesised) + flute phrases in Bhupali (D E F# A B) in the voice's gaps,
# hand chimes / tubular bells on light cues, a low string bed under the mystery, near-silence before the reveal.
import json, os, sys, subprocess
import numpy as np
from scipy.signal import fftconvolve
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR
EV = json.load(open(os.path.join(HERE, 'events.json')))
DUR = EV['dur']; N = int(DUR * SR)

# ---------- voice ----------
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/vo.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 80); vo = X.compress(X.norm(vo, .9), thr=.22, ratio=3.0); vo = X.norm(vo, .9)
# voice envelope (for ducking)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env = env / env.max()
duck = 1 - .72 * np.clip(env * 4, 0, 1)                       # ≈ −11 dB under speech
sm = int(.15 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')

def st(n=N): return np.zeros((n, 2), np.float32)
music, foley = st(), st()

# ---------- tanpura (synth): Pa–Sa–Sa–Sa cycle, jawari-bright partials ----------
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = np.arange(int(d * SR)) / SR; r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)   # moving formant = jawari buzz
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
D3, A2, D2 = 146.83, 110.0, 73.42
t0, i = 6.13, 0
while t0 < DUR:
    for f, dt, pan in [(A2, 0, -.3), (D3, .62, .2), (D3, 1.24, .25), (D2, 1.86, -.1)]:
        if t0 + dt < DUR: X.add(music, tanpura_pluck(f, v=.16, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6

# ---------- flute phrases (bansuri-like: legato, soft attack) in the gaps ----------
def phrase(t, notes, vel=.45, pan=.15):
    for p, d in notes: X.add(music, S.note('flute', p, d, vel, attack=.06, release=.35), t, .9, pan); t += d * .92
P = [(1.90, [('A5', .35), ('B5', .3), ('D6', .6)]),
     (9.30, [('F#5', .3), ('E5', .3), ('D5', .7)]),
     (13.9, [('A5', .25), ('F#5', .25), ('A5', .5)]),
     (17.0, [('D6', .4), ('B5', .3), ('A5', .3), ('F#5', .8)]),
     (24.35, [('E5', .3), ('D5', .55)]),
     (29.7, [('F#5', .3), ('A5', .3)]),
     (33.25, [('B4', .45), ('A4', .6)]),
     (43.5, [('A5', .25), ('B5', .25), ('D6', .3), ('E6', .3), ('F#6', 1.1)]),
     (46.25, [('D6', .3), ('B5', .4)]),
     (49.95, [('A5', .3), ('F#5', .3)]),
     (52.7, [('E5', .3), ('F#5', .3), ('D5', .9)])]
for t, n in P: phrase(t, n)

# ---------- low strings: the mystery (33.5–42.26), cut to near-silence before the reveal ----------
def pad(inst, p, t, d, v, pan=0, g=.7): X.add(music, S.note(inst, p, d, v, attack=.8, release=.4), t, g, pan)
pad('cellos', 'D3', 33.4, 8.7, .35, -.3); pad('contrabass', 'D2', 33.4, 8.7, .3, 0, .5); pad('violas', 'A3', 37.6, 4.5, .3, .3)
pad('violins', 'F#4', 42.55, 3.6, .38, .25); pad('violins', 'A4', 42.55, 3.6, .32, -.25); pad('cellos', 'D3', 42.55, 4.0, .4)
pad('violins', 'D5', 50.3, 3.3, .3, .2); pad('cellos', 'D3', 50.3, 3.4, .32)

# ---------- bells and light cues ----------
def chime(p, t, v=.5, g=.8, pan=0): X.add(music, S.note('hand_chimes', p, 2.5, v), t, g, pan)
for e in EV['ev']:
    t, ty, v = e['t'], e['type'], e.get('v', 1)
    if ty == 'shimmer': chime('A6', t, .4 * v, .6, .3); chime('D7', t + .07, .3 * v, .5, -.3)
    elif ty == 'bell': X.add(music, S.note('tubular_bells', 'D5', 4, .45), t, .5, 0)
    elif ty == 'reveal':
        X.add(music, S.note('tubular_bells', 'D5', 5, .7), t, .8, 0); chime('F#6', t + .02, .6, .7, .35); chime('A6', t + .05, .6, .7, -.35); chime('D7', t + .1, .5, .6, 0)
        X.add(music, S.hit('frame_drum', None, .6), t, .7, 0)
    elif ty == 'diya': chime(['D6', 'E6', 'F#6', 'A6', 'B6'][int(t * 7) % 5], t, .25 * v, .55, np.sin(t) * .5)

# ---------- foley ----------
def paper(d=.4, v=1.0): x = X.bp(X.noise(d), 1500, 6000) * np.hanning(int(round(d * SR))) * .25 * v; return x.astype(np.float32)
def cloth(d=.7, v=1.0): x = X.bp(X.noise(d), 300, 2200) * np.hanning(int(round(d * SR))) ** .7 * .3 * v; return x.astype(np.float32)
def crickets(d):
    t = np.arange(int(d * SR)) / SR; y = np.zeros_like(t)
    for f, r, ph in [(4400, 14, 0), (4900, 17, 1.3), (4100, 12, 2.1)]:
        gate = (np.sin(2 * np.pi * r * t + ph) > .3) * (np.sin(2 * np.pi * .45 * t + ph) > -.2)
        y += np.sin(2 * np.pi * f * t) * gate
    return (X.lp(y, 7000) * .012).astype(np.float32)
def conch(d=1.4):
    t = np.arange(int(d * SR)) / SR; f = 293.66 * (1 + .006 * np.sin(2 * np.pi * 5 * t)) * (1 + .03 * np.minimum(1, t / .4))
    ph = 2 * np.pi * np.cumsum(f) / SR; y = sum(np.sin(h * ph) / h ** 1.2 for h in range(1, 9))
    y = X.bp(y, 250, 2600) * np.minimum(1, t / .35) * np.minimum(1, (d - t) / .4); return (y / np.abs(y).max() * .12).astype(np.float32)
for e in EV['ev']:
    t, ty, v = e['t'], e['type'], e.get('v', 1)
    if ty in ('paper', 'leaf', 'slide'): X.add(foley, paper(.55 if ty == 'leaf' else .4), t, .9, .3)
    elif ty in ('cloth', 'lift'): X.add(foley, cloth(.8 if ty == 'lift' else .7), t, 1, -.2)
    elif ty == 'thud': X.add(foley, X.thump(.35, 60), t, .8, 0)
    elif ty == 'thread': X.add(foley, paper(2.2, .35), t, .6, -.3)
    elif ty == 'steps':
        for k in range(4): X.add(foley, X.step(.25), t + k * .22, .5, -.4)
    elif ty == 'march':
        for k in range(14): X.add(foley, X.step(.18), t + k * .24, .45, -.3 + k * .05)
    elif ty == 'tap': X.add(foley, X.click(1.4, .2), t, .4, 0)
    elif ty == 'conch': X.add(foley, conch(), t, 1, 0)
X.add(foley, crickets(14.0), 5.85, 1, 0)           # J-cut: the night arrives under the dark curtain
X.add(foley, crickets(7.4), 46.3, 1, 0)

# ---------- mix ----------
bus = music * .55 + foley
bus[:, 0] *= duck; bus[:, 1] *= duck
# near-silence before the reveal (42.26–42.53): everything but the voice drops
g = np.ones(N); a, b = int(42.2 * SR), int(42.53 * SR); g[a:b] = np.linspace(1, .03, b - a); g[b - 200:b] = .03
r = int(.06 * SR); bus[:, 0] *= g; bus[:, 1] *= g
bus = S.room(bus, size=.45, mix=.18)
out = bus + np.stack([vo, vo], 1) * .8
sp = env > .15
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice (speech) %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .8), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['flute', 'hand_chimes', 'tubular_bells', 'cellos', 'violas', 'violins', 'contrabass', 'frame_drum'])))
