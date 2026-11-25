# 06 · Audio: score, foley, mixing and sync

## Template
Copy `projects/manabasa/mix.py` (or `projects/danga/mix.py`) — a single Python file that writes `out/mix.wav` (48 kHz stereo).
Run with the Opuscar venv: `/home/user/lemomo-ai/lemo-opuscar/.venv/bin/python mix.py`.
- `sys.path` adds `$LIB/core/audio`; `import sampler as S, sfx as X`.
- Buffers: `music`, `fx`, `amb` (+ `muff` for sounds heard through a window, low-passed later). Length `DUR + TAIL` (4 s); at the end the
  tail is added onto the start (`out[:len(w)] += w`) so the **loop has no seam**.
- VO: decoded with ffmpeg, high-pass 70 Hz, slight presence boost (2.6–6 kHz), compressed, normalised; envelope `env` (80 ms RMS).
- **Ducking**: `duck = 1 − 0.6·clip(env·4)` smoothed 200 ms; bus = music·0.62·duck + fx·0.9·(1−0.3E) + amb·(1−0.4E); room reverb
  `S.room(size .65, mix .24)`; VO ×0.82 on top; `X.limit(.95)`. Typical result: voice −19 dB RMS, bed −34 dB under speech, −29 dB in gaps.
- `mux.sh` normalises the final to −14 LUFS.

## Helpers (in the mix files)
`pad(inst, pitch, t, dur, vel, pan, gain, attack)` (sustained), `note(...)` (struck), `hit(inst, variant, t, vel, gain, pan)`,
`stereo(buf, x, t, g, pan)` (negative t wraps to the loop end), `env_at(t, pts)`.
Synthesised instruments: `tanpura_pluck` (tanpura bed, drops out for dramatic silences), `bansuri(phrase, t0)` (breathy flute with
vibrato and glides), `shankha` (conch), `horn` (train), `ghungroo` (anklet bells = Lakshmi's steps), `footfall`, `thud` (wooden door),
`snuff` (lamp out), `wick`, `swish` (broom / brush / wet wipe), `scratch` (stylus on palm leaf), `gust`, `crackle` (hearth), `clay`
(earthen pot set down), `chalk`, `page`, `bird`, `clack` (train wheels).

## Sync rules
- Every visual beat has a sound at the same frame (pot lands → clay knock; lamp snuffs → falling harp scale; doors slam → thud + gong +
  timpani on the exact word; footprint → ghungroo).
- Choose a key per film (Danga in B, Manabasa in D); tanpura bed in that key; use tritones/D# only for anger/curse moments.
- Musical moments that carry meaning: rising chimes for counting, harp glissando when lines dissolve ("no caste"), gong + glass for light
  blooms, bowed vibraphone for reveals, frame-drum pulse for journeys/feasts.
- Leave space: the VO is the spine; dramatic silence before a curse works.
- If the owner says they'll add a sound themselves, remove ours (Danga Diwali fireworks).

## Rap/song films
Song is the only audio; cut on the bar grid (Bali rap: 115 BPM, bar = 2.09 s, one lyric line per bar). Sync lyric words exactly
(the owner checks e.g. "Thunka Puri Thali" against the beat).
