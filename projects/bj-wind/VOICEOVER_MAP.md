# Kartika Wind (Bali Jatra) — voiceover map

Voice: `audio/vo.mp3` (49.0 s; phrase times `ph.npy`). Film: `film.js` (50.2 s, loops). Score/foley: `mix.py` → `out/mix.wav`.
Render: `node core/render/video.mjs ~/bj-wind --fps 30 --size 1080x1920 --workers 2` (keep >2 GB disk free; Chrome crashes when the disk is full).
Map: real Terrarium elevation + bathymetry, zoom 7 (`tools/map.py` → `plates/map.png`, cut into `plates/tiles/*.png`; land mask `plates/land2.bin`).
Through-line: the wind. Captions: Cormorant Garamond with one gold italic word, baseline ≤ 1470; map overlays fade out under the subtitle band.

| Voice (s) | Line | Picture |
|---|---|---|
| 0.05–5.3 | ଇତିହାସରେ ପ୍ରଥମ ଥର… ରାଷ୍ଟ୍ରପତି— ଓଡ଼ିଶାର ଝିଅ | Gold wind threads weave a Sambalpuri ikat ribbon (Odisha's daughter, by her textile); title; gold scissors on "Rashtrapati" |
| 5.75–7.55 | ସାଙ୍ଗରେ ଆସୁଛି ଇଣ୍ଡୋନେସିଆ | A Javanese batik ribbon swings in; the two silks tie into one bow |
| 8.08–10.71 | ଗୋଟିଏ ମେଳା ପାଇଁ ଏତେ ସମ୍ମାନ କାହିଁକି? | Pull back: the ribbon across a bulb-lit torana gate, ବାଲିଯାତ୍ରା sign, the full moon |
| 11.25–16.07 | ଉତ୍ତର ଲୁଚିଛି ନାଁରେ… ବାଲି ଦ୍ୱୀପକୁ ଯାତ୍ରା | Push into the sign → gold foil; ବାଲି ↦ particles ↦ the island of Bali; ଯାତ୍ରା ↦ a boat |
| 16.5–20.53 | ହଜାର ବର୍ଷ ତଳେ… ପବନ ଦିଗ ବଦଳୁଥିଲା | The particles land on the real map; pull out over the Bay of Bengal; the Kartika moon; the wind turns (19.65) |
| 20.92–24.35 | ସେଇ ପବନରେ… ବୋଇତ ଛାଡ଼ୁଥିଲେ | Kalinga coast; the fleet sails out with gold wakes |
| 24.74–26.52 | ସମୁଦ୍ରରେ ବାଟ ହଜିଲେ? | One boat in fog; the wind loses direction; a compass that won't settle |
| 27.17–35.37 | କୁହାଯାଏ… କାଉ… କୂଳ ସେଇ ଆଡ଼େ! | A Saura wall painting: the black crow leaves the mast, circles back (far), flies on — the shore appears |
| 35.95–41.86 | ଯେଉଁ ଦ୍ୱୀପକୁ… କଟକ ଆସୁଛି | The crow's line becomes the sea route; boitas to Bali/Java/Sumatra; then batik flows back to Cuttack |
| 42.30–48.77 | ଏ ବର୍ଷ… ରାଷ୍ଟ୍ରପତି… କାର୍ତ୍ତିକର ପବନ | Cuttack's light opens into the gate; scissors wait; the wind rises and unties the knot → frame 0 |
