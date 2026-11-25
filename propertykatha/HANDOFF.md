# PropertyKatha — handoff

Paste this into a new Claude Code session that has this repo open:

> Read `propertykatha/HANDOFF.md` and continue the PropertyKatha work.

## The project
- **PropertyKatha** is Chirag's premium, classic Instagram page about Odisha property and real estate. It is not a religious page.
- **Logo:** a brown Odisha map with a white house and a gold door, on cream.
  - Original: `inputs/propertykatha_dp.jpg`
  - Circular cutout: `deliverables/propertykatha_logo.png`
  - Use it only if it looks perfect. Otherwise leave it out, because Chirag can add his own.
- **Video 1, "The Gate"** (delivered 2026-11-25). Topic: before you pay an advance, check the road's plot number on the Bhulekh map and read its patta. If a person's name is on it, get the Right of Way on registered paper.
  - `deliverables/PropertyKatha_TheGate_v1.mp4`: full mix
  - `deliverables/PropertyKatha_TheGate_v1_NoMusic.mp4`: voice and sound effects. **Chirag chose this version.**
  - `deliverables/PropertyKatha_TheGate_v1_VoiceOnly.mp4`: voice only
  - `deliverables/PropertyKatha_TheGate_cover.jpg`: cover image
  - `docs/the-gate-storyboard.html`: storyboard
  - `docs/vo-timing.md`: phrase timings measured from the voiceover
  - `inputs/plot1.mp3`: Odia voiceover

## Chirag's standing preferences
- Premium, classic, clean, posh look. Never cartoonish or sticker-like.
- The first 10 seconds must be a strong hook.
- Everything moves naturally:
  - wind in palms and grass, waves across fields, birds, dust in the light
  - papers that slide, curl and settle
- No still images with zoom in and out (no Ken Burns), and nothing stagnant.
- One continuous camera is preferred. Changes happen through the camera, never through hard cuts.
- Slow, subtle camera motion.
- No frame pops: scan the diffs between consecutive frames. One deliberate hit is fine, such as the gate clang.
- Subtitles:
  - key words only
  - each one an Odia hero word (Noto Serif Oriya) with a small gold English label (Inter Tight caps)
  - Cormorant italic for the one accent term
  - numbers in a lining serif (Noto Serif latin), not Cormorant's old-style figures
- All text stays inside its frame or paper, with nothing clipped or overflowing. Keep text out of the top 250 px and bottom 450 px of a 1080×1920 frame.
- Audio: −14 LUFS integrated with true peak at or below −1.5 dB. Keep the music about 10–14 LU under the voice and ducked. Chirag may ask for no music.
- Show a storyboard first only when he asks for one. Once he approves, deliver the finished video.
- Ask before pushing anything to GitHub.

## Where this differs from the repo's CLAUDE.md (which was written for the music reels)
- CLAUDE.md rule 2 says to romanise Odia. For PropertyKatha, use Odia script for the key words, with a small English label under each.
- CLAUDE.md rule 5 says to mix styles on every line. For PropertyKatha, keep one house look across the videos so the brand is recognisable, and change the medium inside that one look (land → map → documents).

## The house look (keep it the same in later videos)
- **Land:** a 3D golden-hour scale model of laterite land. Palms, paddy with bunds, a laterite wall and an iron gate. Warm haze, soft shadows.
- **Map:** the land flattens into a cream cadastral map, styled like Bhulekh but never a copy of the government site.
- **Documents:** cream papers on a lamp-lit table, with fake soft shadows, paper curl, a brass magnifier (real 2D magnification) and a wooden stamp.
- **Palette:** ivory, laterite red, palm green, gold, deep brown (the logo's brown).
- **End card:** logo, PropertyKatha in dark brown Cormorant, and a brown Follow pill, on a soft cream glow.

## Toolchain
- **three.js 0.160** in headless Chromium (Playwright, SwiftShader WebGL). Each page exposes `window.render(t)`.
- **Custom shaders:** sky and clouds, wind sway, paddy waves, paper curl.
- **Canvas 2D:** subtitles, map, documents, magnifier, stamp, grain, vignette.
- **Python (NumPy + SciPy):** `score.py` synthesises the piano, strings and sound effects. `score_split.py` with `NOMUSIC=1` writes the sound effects without the music.
- **FFmpeg 6.1:** ducks the music under the voice (sidechain), sets loudness, encodes H.264 at 9 Mbps with AAC 256k and faststart.
- **Known limit:** Hugging Face downloads are blocked in the cloud container, so Whisper ASR can't run there. Time the phrases with `ffmpeg silencedetect` instead.

## How to re-render (from `propertykatha/film/`)
```bash
npm ci                                   # three + @fontsource fonts
python3 -m http.server 8123 &            # fonts need http, not file://
mkdir -p stills frames
node still.js 0.5 6.6 24.9 35.6          # test stills -> stills/
for w in 0 1 2; do node render.js $w 3 & done; wait   # 1,667 frames, about 25 min on 4 cores
python3 popscan.py                       # frame-pop and loop check
pip install numpy scipy && python3 score.py && bash mix.sh 4      # writes mix.wav at -14 LUFS
ffmpeg -framerate 30 -i frames/f_%05d.jpg -i mix.wav -c:v libx264 -preset slow -b:v 9M -pix_fmt yuv420p \
  -c:a aac -b:a 256k -shortest -movflags +faststart out.mp4
```
To patch only some frames, run `node render.js 0 1 218,219,220` and then re-encode.

## Timeline of video 1 (seconds)
| Time (s) | What happens |
|---|---|
| 0–2.7 | Price counts up to ₹20,00,000 |
| 3.6–4.9 | Time-lapse |
| 6.45 | Gate clang |
| 7.5–10.5 | Board on the gate: "ଏ ରାସ୍ତା ମୋ ଜମି" |
| 11 | "He wasn't wrong." |
| 13–16.8 | Survey lines over the land |
| 17–19 | Land flattens into the map |
| 19.4–21.4 | Gold road trace, plot 412 |
| 22–23.7 | Patta lifts off the map |
| 23.6–28.6 | Safe case |
| 28.8–32.4 | Caution case |
| 32.3–37.7 | Sale Deed and magnifier on "Right of Way" |
| 37.8–42.5 | Registered stamp paper and seal; "ମୁହଁ କଥା" turns to dust |
| 42.5–48.2 | Back to the land, gate opens |
| 48.4–55.56 | Share line and end card; loops back to frame 0 |
