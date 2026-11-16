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
T = dict(s2=4.6, s3=11.05, s4=21.45, s5=27.4, s6=38.1, s7=41.45, harihara=26.32)

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

# ---------- string bed: one held chord per story beat (all re-timed to the voiceover's words) ----------
def pad(inst, p, t, d, v, pan=0, g=.6): X.add(music, S.note(inst, p, d, v, attack=1.2, release=1.0), t, g, pan)
pad('cellos', 'D3', 0.0, 11.3, .26, -.2); pad('violas', 'A3', 1.0, 10.3, .2, .25)                     # S1–S2: open fifth (half white, half black · Hari, Hara)
pad('violins', 'F#4', 8.0, 3.2, .12, .3)                                                              # "both, in one body"
pad('cellos', 'B2', 11.05, 8.2, .24, -.2); pad('violas', 'F#3', 11.1, 8.1, .18, .25)                  # S3: not Jagannath's · why? (vi)
pad('cellos', 'G2', 19.05, 2.6, .26, -.2); pad('violas', 'D3', 19.1, 2.5, .2, .2); pad('violins', 'B3', 19.2, 2.4, .14, .3)   # "a form of Shiva" (IV)
pad('cellos', 'G2', 21.45, 3.8, .24, -.2); pad('violas', 'D3', 21.5, 3.7, .18, .2)                    # S4: Kartika · Monday
pad('cellos', 'A2', 25.1, 1.4, .28, -.2); pad('violas', 'E3', 25.1, 1.4, .22, .2); pad('violins', 'C#4', 25.15, 1.35, .18, .3)  # "when the two meet" (V)
pad('cellos', 'D3', T['harihara'], 11.9, .3, -.2); pad('violas', 'A3', T['harihara'] + .05, 11.8, .22, .25); pad('violins', 'F#4', T['harihara'] + .1, 11.7, .18, .3)  # Harihara → the costume (I)
pad('cellos', 'B2', 38.1, 3.5, .26, -.2); pad('violas', 'F#3', 38.1, 3.5, .2, .25); pad('violins', 'D4', 38.2, 3.4, .14, .3)     # "those who say they are separate"
pad('cellos', 'D3', 41.45, 3.2, .3, -.2); pad('violas', 'A3', 41.45, 3.2, .22, .25); pad('violins', 'F#4', 41.6, 3.0, .2, .3); pad('violins', 'A4', 43.45, 1.2, .16, -.3)  # "see him this Monday"

# ---------- light cues, each on its word ----------
def chime(p, t, v=.4, g=.7, pan=0.0): X.add(music, S.note('hand_chimes', p, 2.5, v), t, g, pan)
def shimmer(t, v=1.0): chime('A6', t, .3 * v, .55, .3); chime('D7', t + .07, .25 * v, .45, -.3); chime('F#7', t + .14, .18 * v, .35, 0)
for t in (4.4, 10.75, 21.25, 27.15): shimmer(t)                       # each hand-off of light
chime('E6', 2.95, .22, .45, -.3)                                      # "half white"
chime('A5', 5.55, .35, .6, -.3); chime('D6', 7.1, .35, .6, .3)       # the chakra arrives ("Vishnu"), the trishula ("Shiva")
chime('D6', 8.9, .45, .7); chime('A6', 8.93, .3, .55)                # "one body": they become one
chime('F#6', 10.2, .35, .55, .2); chime('A6', 10.24, .3, .5, -.2)    # "this is Harihara"
X.add(music, S.note('tubular_bells', 'A4', 3, .3), 19.1, .45, 0)      # "a form of Shiva"
chime('A5', 21.7, .38, .6, -.25); chime('D6', 23.55, .38, .6, .25)   # KARTIKA (blue), MONDAY (white)
chime('E6', 23.4, .25, .45, -.35); chime('F#6', 25.0, .25, .45, .35) # the lights land on the dial
X.add(music, S.note('tubular_bells', 'D5', 5, .5), T['harihara'], .5, 0)   # "Harihara" (kept under the word)
chime('F#6', T['harihara'] + .03, .35, .45, .35); chime('A6', T['harihara'] + .06, .35, .45, -.35); chime('D7', T['harihara'] + .1, .3, .4, 0)
for k, t in enumerate((30.3, 30.45, 30.6)): chime(['A6', 'D7', 'F#7'][k], t + .3, .22, .45, -.3)    # white glass, on "half white"
for k, t in enumerate((32.86, 33.01, 33.16)): chime(['A5', 'D6', 'F#6'][k], t + .3, .24, .45, .3)   # dark glass, on "half black"
# 32 ornaments, one chime each, a rising cascade across "with 32 kinds of gold ornaments"
PENT = ['D5', 'E5', 'F#5', 'A5', 'B5', 'D6', 'E6', 'F#6', 'A6', 'B6', 'D7']
for i in range(32): t = 35.35 + i * .0623 + .3; chime(PENT[min(10, i // 3)], t, .16 + .08 * (i / 31), .5, np.sin(i * 1.3) * .5)
chime('D7', 37.62, .35, .55); X.add(music, S.note('tubular_bells', 'A4', 3.5, .35), 37.62, .45, 0)   # the 32nd
# the paths meet at the gate, on "dekhantu" (see)
X.add(music, S.note('tubular_bells', 'D5', 4, .55), 43.5, .7, 0); chime('A6', 43.53, .4, .55, .3); chime('D7', 43.58, .35, .5, -.3)

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
X.add(temple, conch(1.35, .16), 43.3, 1, 0)                 # rises as the paths meet; the tail rolls into the loop
damaru(43.75, .85, .3, 10, 13)
# soft paper sounds for the lightbox (clouds parting) and the puppet's X
def paper(d=.4, v=1.0): x = X.bp(X.noise(d), 1500, 6000) * np.hanning(int(round(d * SR))) * .2 * v; return x.astype(np.float32)
X.add(temple, paper(1.6, .5), 41.6, .5, -.4); X.add(temple, paper(1.6, .5), 41.7, .5, .4)
for t in (13.9, 14.05): X.add(temple, X.thump(.25, 120), t, .5, -.2); X.add(temple, paper(.18, .9), t, .6, -.2)   # the ✗, on "nuhẽ"
for t in (12.45, 19.05): X.add(temple, paper(.35, .6), t, .5, .1)   # puppets pressed to the screen
X.add(temple, X.whoosh(.5, .35), 37.65, .6, 0)

# ---------- mix ----------
duckT = 1 - .35 * np.clip(env * 4, 0, 1); duckT = np.convolve(duckT, np.ones(sm) / sm, 'same')   # the conch and damaru stay present
bus = music * .55 * duck[:, None] + temple * .95 * duckT[:, None]
bus = S.room(bus, size=.5, mix=.2)
out = bus + np.stack([vo, vo], 1) * .8
sp = env > .15
rms = lambda x: 20 * np.log10(np.sqrt((x ** 2).mean()) + 1e-9)
print('voice (speech) %.1f dB | bed under speech %.1f dB | bed in gaps %.1f dB' % (rms(vo[sp] * .8), rms(bus[sp].mean(1)), rms(bus[~sp].mean(1))))
for a, b, nm in [(0, .3, 'pre-voice'), (0, 1.5, 'open'), (1.5, 3, 'open+'), (8.6, 9.4, 'S2 meet'), (26.2, 27.2, 'Harihara'), (35.6, 37.8, 'ornaments'), (43.2, 44.6, 'end')]:
    seg = lambda x: x[int(a * SR):int(b * SR)]
    print('%-10s voice %6.1f  bed %6.1f  temple(ducked) %6.1f' % (nm, rms(seg(vo) * .8), rms(seg(bus).mean(1)), rms((seg(temple) * .95 * seg(duckT)[:, None]).mean(1))))
fade = int(.012 * SR); out[-fade:] *= np.linspace(1, 0, fade)[:, None]
out = np.stack([X.limit(out[:, 0], .95), X.limit(out[:, 1], .95)], 1).astype(np.float32)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
import soundfile as sf; sf.write(os.path.join(HERE, 'out/mix.wav'), out, SR)
print('mix', out.shape, 'peak', float(np.abs(out).max()))
print('\n'.join(S.credits(['hand_chimes', 'tubular_bells', 'cellos', 'violas', 'violins'])))
