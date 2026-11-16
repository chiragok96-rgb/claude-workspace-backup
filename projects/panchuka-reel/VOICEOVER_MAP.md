# Panchuka: voiceover map

The picture and the sound are locked to the user's own recording, `audio/voiceover.mp3` (54.5 s; the film runs 55.5 s).
Phrase times were measured from the recording. The timeline is in `film.js` (`CAP`, `EV`), and the score and foley are in `mix.py`.

| Voice (s) | Words | Picture | Sound |
|---|---|---|---|
| 1.15–3.80 | କୁହାଯାଏ, ପଞ୍ଚୁକର ପାଞ୍ଚ ଦିନ ବଗ ବି ମାଛ ଛୁଏଁ ନାହିଁ | Ink river. The heron stands still, the fish swims past, and the heron looks away (2.75). PANCHUKA title and seal. | River, a fish plip (2.65), tanpura, D drone |
| 4.43–7.29 | କିନ୍ତୁ ଏ ବର୍ଷ ପଞ୍ଚୁକ ପାଞ୍ଚ ଦିନର ନୁହେଁ | The camera tilts up to the sky (3.85–4.9). Five moons are brushed in (4.55 + 0.34·i), then ୫ appears (6.6). | A chime on each moon |
| 7.88–8.48 | ଚାରି ଦିନର | Dvadashi's moon dissolves (7.98), an arrow, and the ୪ seal is stamped (8.05) | A low bowed note, the stamp |
| 9.33–14.26 | ପଞ୍ଚୁକ ହେଉଛି କାର୍ତ୍ତିକର ଶେଷ ପାଞ୍ଚ ଦିନ… | The rice paper tears into palm leaves (8.75–9.75). The Kartika calendar is incised, and the last five marks turn gold (11.12). | Paper, stylus, five rising chimes |
| 14.95–19.29 | ଯିଏ ମାସ ସାରା ବ୍ରତ ରଖିପାରିନଥିଲା… ଆମିଷ ଛାଡ଼େ | The manuscript scrolls (14.35). A chitra-pothi: the fish leaps off the plate (17.6), habisa appears on the banana leaf, and ଆମିଷ is struck out (18.72). | Fish plip, stylus strike |
| 19.89–22.84 | ଏହି ପାଞ୍ଚ ଦିନ, ମହାପ୍ରଭୁଙ୍କ ପାଞ୍ଚ ବେଶ | The five gold marks rise off the leaf and become medallions (19.42–20.6). | Rising shimmer, V → I |
| 23.38 / 24.60 / 25.70 / 26.73 / 29.16 | ଲକ୍ଷ୍ମୀନାରାୟଣ · ବାଙ୍କଚୂଡ଼ା · ତ୍ରିବିକ୍ରମ · ଲକ୍ଷ୍ମୀନୃସିଂହ · ରାଜରାଜେଶ୍ୱର | Each plaque unrolls on its own name. | A harp on each name; a glissando and a bell on Rajarajeshwara |
| 30.53–33.62 | କିନ୍ତୁ ଏଥର ପାଞ୍ଜିରୁ ଦ୍ୱାଦଶୀ ତିଥି ହିଁ ହଜିଯାଇଛି | The medallions fly back down into the leaf (30.2–31.1). Dvadashi turns red (31.95) and crumbles (32.95). | Falling chimes, low notes, crumbling gold |
| 34.23–38.36 | ଯେଉଁ ତିଥି କୌଣସି ସୂର୍ଯ୍ୟୋଦୟକୁ ଛୁଏଁ ନାହିଁ, ପାଞ୍ଜି ତାକୁ ଗଣେ ନାହିଁ | Three sunrises, then the tithi bands. The Dvadashi band touches no sunrise (36.15), and ତିଥି କ୍ଷୟ is stamped (37.95). | Sunrise chimes, a tension tone, the stamp |
| 39.00–42.15 | ତେଣୁ ଦ୍ୱାଦଶୀର ବାଙ୍କଚୂଡ଼ା ବେଶ… ଏ ବର୍ଷ ହେବ ନାହିଁ | The camera dives into the vermilion band (38.6) and comes out of Bankachuda's red enamel. Its glint (39.95), then the plaque greys and its gold falls away (41.3). | A whoosh, a glint, descending notes, falling sparkle |
| 42.87–50.03 | ମାସ ସାରା ପାରିନଥିଲେ ବି… କେବଳ ସମୟ କମିଯାଏ | Night and the lamp-tree, with its Dvadashi bracket broken. Four diyas are ready (44.9), the first is lit (46.92), and the moon fills (48.8). | Crickets, IV–V–I, the match, a bell |
| 50.0–50.55 | (breath) | The lit diya blooms into dawn. | A swell |
| 50.69–54.37 | ବଗ ଯଦି ପାଞ୍ଚ ଦିନ ପାରେ… ଆମେ ଚାରି ଦିନ ପାରିବା ନାହିଁ? | The river again, now with four diyas and the sun. The heron glances back (53.0), the fish returns, and the last frame is the first. | Harp, flute, birds |

## Camera

`film.js` `RIG` drives one slow camera that moves over each finished frame. Captions stay fixed on top of it. In every scene the camera leans toward what the voice is talking about:

- the heron
- the moons and ୪
- the five gold marks
- the plate
- the beshas
- Dvadashi
- the vermilion band, where the push leads straight into the dive
- the lit diya

During each big transition move it eases back to 1×. The loop seam is at exactly 1×.

## Captions

There are four looks, one per medium, and all are serif:

- **ink:** Cormorant italic, ink on a paper halo
- **leaf:** cream on a shadow
- **gold:** pale gold
- **night:** left-aligned in the sky column

Placement rules:

- No text in the top 250 px or the bottom 450 px.
- No text past x ≈ 900.
- Captions never cross the picture.
