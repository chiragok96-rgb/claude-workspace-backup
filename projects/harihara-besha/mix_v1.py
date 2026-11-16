# Harihara Besha: voice + score + temple sound → out/mix.wav (44.6 s). Run: $LIB/.venv/bin/python mix.py
# Score, all in D (the tanpura's Sa): a tanpura drone throughout, a soft string bed that warms scene by scene,
# chimes on each hand-off of light, a temple bell on "Harihara", one chime per ornament (32, rising in D major
# pentatonic), and the conch + damaru at the very start and the very end (the end rolls into the loop).
import os, sys, subprocess
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__)); LIB = os.environ.get('LIB', '/home/user/lemomo-ai/lemo-opuscar')
sys.path.insert(0, os.path.join(LIB, 'core/audio'))
import sampler as S, sfx as X
SR = X.SR; DUR = 44.6; N = int(DUR * SR)
T = dict(s2=4.42, s3=9.5, s4=14.37, s5=26.32, s6=35.4, s7=41.4, harihara=25.22)

# ---------- voice ----------
wav = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(HERE, 'audio/voiceover.mp3'), '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(wav, np.float32).copy()[:N]; vo = np.pad(vo, (0, N - len(vo)))
vo = X.hp(vo, 75); vo = X.compress(X.norm(vo, .9), thr=.22, ratio=2.8); vo = X.norm(vo, .9)
k = int(.08 * SR); env = np.sqrt(np.convolve(vo ** 2, np.ones(k) / k, 'same')); env /= env.max()
duck = 1 - .7 * np.clip(env * 4, 0, 1); sm = int(.18 * SR); duck = np.convolve(duck, np.ones(sm) / sm, 'same')

def st(n=N): return np.zeros((n, 2), np.float32)
music, temple = st(), st()

# ---------- tanpura drone (Pa–Sa–Sa–low Sa), the whole film ----------
def tanpura_pluck(f, d=3.2, v=.5, seed=0):
    t = np.arange(int(d * SR)) / SR; r = np.random.default_rng(seed); y = np.zeros_like(t)
    for h in range(1, 18):
        bright = np.exp(-((h - (6 + 4 * np.sin(2 * np.pi * .35 * t + seed))) ** 2) / 10)
        y += (1 / h ** .9) * (.35 + bright) * np.sin(2 * np.pi * f * h * t * (1 + r.uniform(-.0006, .0006)) + r.uniform(0, 6))
    y *= np.exp(-t / 2.1) * np.minimum(1, t / .01); return (y / np.abs(y).max() * v).astype(np.float32)
D3, A2, D2 = 146.83, 110.0, 73.42
t0, i = 0.0, 0
while t0 < DUR:
    for f, dt, pan in [(A2, 0, -.3), (D3, .62, .2), (D3, 1.24, .25), (D2, 1.86, -.1)]:
        if t0 + dt < DUR: X.add(music, tanpura_pluck(f, v=.13, seed=i), t0 + dt, 1, pan); i += 1
    t0 += 2.6

# ---------- string bed: one held chord per scene, warming as the story opens ----------
def pad(inst, p, t, d, v, pan=0, g=.6): X.add(music, S.note(inst, p, d, v, attack=1.2, release=1.0), t, g, pan)
pad('cellos', 'D3', 0.0, 9.6, .26, -.2); pad('violas', 'A3', 1.0, 8.6, .2, .25)                       # S1–S2: open fifth
pad('cellos', 'B2', 9.5, 5.0, .24, -.2); pad('violas', 'F#3', 9.6, 4.9, .18, .25)                     # S3: the question (vi)
pad('cellos', 'G2', 14.4, 5.5, .24, -.2); pad('violas', 'D3', 14.5, 5.4, .18, .2)                     # S4: lights set out (IV)
pad('cellos', 'A2', 19.9, 5.4, .26, -.2); pad('violas', 'E3', 20.0, 5.3, .2, .2); pad('violins', 'C#4', 22.0, 3.3, .14, .3)  # rising (V)
pad('cellos', 'D3', 25.2, 10.4, .3, -.2); pad('violas', 'A3', 25.25, 10.3, .22, .25); pad('violins', 'F#4', 25.3, 10.2, .18, .3)  # Harihara (I)
pad('cellos', 'B2', 35.4, 6.1, .26, -.2); pad('violas', 'F#3', 35.4, 6.0, .2, .25); pad('violins', 'D4', 35.5, 5.9, .14, .3)   # two paths
pad('cellos', 'D3', 41.4, 3.4, .3, -.2); pad('violas', 'A3', 41.4, 3.4, .22, .25); pad('violins', 'F#4', 41.6, 3.2, .2, .3); pad('violins', 'A4', 42.6, 2.0, .16, -.3)  # home

# ---------- light cues ----------
def chime(p, t, v=.4, g=.7, pan=0.0): X.add(music, S.note('hand_chimes', p, 2.5, v), t, g, pan)
def shimmer(t, v=1.0): chime('A6', t, .3 * v, .55, .3); chime('D7', t + .07, .25 * v, .45, -.3); chime('F#7', t + .14, .18 * v, .35, 0)
for t in (4.2, 9.25, 14.15, 26.1): shimmer(t)                         # each hand-off of light
chime('D6', 7.55, .45, .7)                                            # wheel and trident meet
chime('A5', 14.85, .38, .6, -.25); chime('D6', 17.35, .38, .6, .25)  # KARTIKA (blue), MONDAY (white)
for t, p_, pan in [(17.97, 'A5', -.35), (18.97, 'D6', .35), (21.59, 'E6', 0), (22.40, 'F#6', 0)]: chime(p_, t, .3, .5, pan)   # the lights land, then pass the dial's marks
X.add(music, S.note('tubular_bells', 'D5', 5, .6), T['harihara'], .75, 0)   # "Harihara"
chime('F#6', T['harihara'] + .03, .45, .6, .35); chime('A6', T['harihara'] + .06, .45, .6, -.35); chime('D7', T['harihara'] + .1, .4, .5, 0)
# 32 ornaments: one chime each, rising through D major pentatonic (the count you can hear)
PENT = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7']
for i in range(32): t = 29.6 + i * .155 + .3; chime(PENT[min(10, i // 3)], t, .2 + .1 * (i / 31), .55, np.sin(i * 1.3) * .5)
chime('D7', 34.75, .35, .55); X.add(music, S.note('tubular_bells', 'A4', 3.5, .35), 34.75, .45, 0)   # the 32nd
# the paths meet at the gate
X.add(music, S.note('tubular_bells', 'D5', 4, .55), 43.3, .7, 0); chime('A6', 43.33, .4, .55, .3); chime('D7', 43.38, .35, .5, -.3)

# ---------- temple sound: conch and damaru ----------
def conch(d=2.4, v=.13, f0=293.66):
    t = np.arange(int(d * SR)) / SR; f = f0 * (1 + .005 * np.sin(2 * np.pi * 4.6 * t)) * (1 + .028 * np.minimum(1, t / .5))
    ph = 2 * np.pi * np.cumsum(f) / SR; y = sum(np.sin(h * ph) / h ** 1.15 for h in range(1, 10))
    y = y + .25 * X.bp(np.random.default_rng(3).standard_normal(len(t)), 600, 3200)           # breath
    y = X.bp(y, 230, 2800) * np.minimum(1, t / .45) * np.minimum(1, (d - t) / .5); return (y / np.abs(y).max() * v).astype(np.float32)
def dhit(pitch, v):   # one damaru stroke: a taut small head + the bead's click
    d = .16; t = np.arange(int(d * SR)) / SR
    body = np.sin(2 * np.pi * pitch * t * (1 + .25 * np.exp(-t / .01))) * np.exp(-t / .045)
    snap = X.bp(np.random.default_rng(int(pitch)).standard_normal(len(t)), 1500, 6500) * np.exp(-t / .008)
    return ((.8 * body + .45 * snap) * v).astype(np.float32)
def damaru(t0, d, v=.32, rate0=7.0, rate1=12.0, pan=0.0):
    t, k = 0.0, 0
    while t < d:
        r = rate0 + (rate1 - rate0) * (t / d); swell = min(1, (t + .15) / .4) * (1 - .35 * (t / d))
        X.add(temple, dhit(420 if k % 2 else 360, v * swell * (1 if k % 2 else .85)), t0 + t, 1, pan + (.12 if k % 2 else -.12)); t += 1 / r; k += 1
X.add(temple, conch(2.6, .13), 0.0, 1, 0)
damaru(0.0, 1.5, .3, 9, 13)
X.add(temple, conch(1.35, .16), 43.25, 1, 0)                 # rises as the paths meet; the tail rolls into the loop
damaru(43.75, .85, .3, 10, 13)
# soft paper sounds for the lightbox (clouds parting) and the puppet's X
def paper(d=.4, v=1.0): x = X.bp(X.noise(d), 1500, 6000) * np.hanning(int(round(d * SR))) * .2 * v; return x.astype(np.float32)
X.add(temple, paper(1.6, .5), 41.6, .5, -.4); X.add(temple, paper(1.6, .5), 41.7, .5, .4)
for t in (11.1, 11.35): X.add(temple, X.thump(.25, 120), t, .5, -.2); X.add(temple, paper(.18, .9), t, .6, -.2)
X.add(temple, X.whoosh(.6, .35), 35.1, .6, 0)

# ---------- mix ----------
duckT = 1 - .35 * np.clip(env * 4, 0, 1); duckT = np.convolve(duckT, np.ones(sm) / sm, 'same')   # the conch and damaru stay present
bus = music * .55 * duck[:, None] + temple * .95 * duckT[:, None]
bus = S.room(bus, size=.5, mix=.2)
out = bus + np.stack([vo, vo], 1) * .8
sp = env > .15
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice (speech) %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .8), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
for a, b, nm in [(0, .3, 'pre-voice'), (0, 1.5, 'open'), (1.5, 3, 'open+'), (7.4, 8.2, 'S2 meet'), (25.1, 26.3, 'Harihara'), (29.9, 34.9, 'ornaments'), (43.2, 44.6, 'end')]:
    seg = lambda x: x[int(a * SR):int(b * SR)]
    print('%-10s voice %6.1f  bed %6.1f  temple(ducked) %6.1f' % (nm, rms(seg(vo) * .8), rms(seg(bus).mean(1)), rms((seg(temple) * .95 * seg(duckT)[:, None]).mean(1))))
fade = int(.012 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'cellos', 'violas', 'violins'])))
