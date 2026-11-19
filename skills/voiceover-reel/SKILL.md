---
name: voiceover-reel
description: Build a 9:16 voiceover film in code — pick several 2D styles from the Opuscar catalogue, lock every visual beat to measured word times, join the styles with motion-matched transitions (never a cross-fade), burn clean captions, and synthesise the score and foley. Use when a recording plus a script must become a finished reel.
---

# Voiceover reel — nine styles, one uncut camera

A recipe for turning one voice recording into a finished vertical film. It assumes the Opuscar
stack (`core/render/still.mjs`, `video.mjs`, `sheet.py`) and nothing else: no image generator,
no sample library, no GPU.

## 1. Lock the words first

Measure word-level timings before drawing anything. faster-whisper with a local `small` model,
language `hi`, works for Odia and other Indic languages; pass a numpy array, not a path.

```
data/vo.json   →  { dur, phrases: [ {t0, t1, od, en}, … ] }
WORDMAP.md     →  one row per meaning-carrying word: time | word | medium | what the eye sees | sound
```

Every row of that map must name a *visible* beat. If a word has no beat, the film has a hole there.

## 2. Choose styles from the catalogue, never invent one per film

`styles/README.md` in Opuscar lists ~100 named styles with a `STYLE.md` spec each. Pick 6–9 whose
*subject matter is the idea of the line*, not for variety:

| the line is about | style that *is* that idea |
|---|---|
| a far place, longing, night | Paper-cut Lightbox (`paper-lantern`) — layered card, backlight, a hole that burns |
| a written source, a quotation | Gilded Illumination — gold leaf, vellum, an illuminated border |
| the sea, grandeur | Ukiyo-e — bokashi, key-block outlines, carved foam |
| a route, a question | Pen Plotter — one honest machine line that can *stop* |
| evidence under the ground | Line-Art Cutaway — labelled strata |
| two objects compared | Archive Light Table — backlit glass, calipers, small-caps labels |
| work, voyage, action | Woodcut — black key block over ochre, gouge marks |
| memory, loss | Firefly Pointillism — points of light, all die but one |
| two traditions joined | Stained Glass — both motifs leaded into one window |

One scene file per style, each `draw(ctx, params)` into its own work canvas. Styles are *grammar*:
materials, light, palette, mark-making. Never copy a reference's characters, layout or art.

## 3. The uncut camera

A style change must never be a cross-dissolve. Build a compositor with two buffers and a mask:

- **spark** — a single light carries across: it swells, whites out for ~2 frames, the next medium
  opens from that point. (scent → gold letter; last firefly → diya)
- **wave** — a sine-edged mask rises; shape-match an element in both media. (border wave → sea)
- **bleach / ember** — *sequential*: outgoing fades to white (or black) in the first half, incoming
  rises out of it in the second. Never run both at once or you get ghosting.
- **tilt** — translate both buffers vertically; the camera really moves down a line.
- **find / carve** — the incoming grows from a circle at a matched object, or is cut in behind a
  travelling bright edge.
- **collapse** — outgoing scales *down* to a point of light, incoming scales up out of it.

Keep each join 0.45–0.75 s. Longer reads as a dissolve.

## 4. Captions

One band, one place, all film long. Baseline 1448 px on 1080×1920 (never inside the top 250 px or
the bottom 450 px). Cormorant 500 italic ~45 px, max 830 px wide, 0.32 s fade. Behind it a
*blurred gradient* tinted to the scene's own palette — never a box, never a hard scrim. Every scene
must keep that band free of focal objects; check it, don't hope.

Small-caps labels (Inter Tight 600, letter-spaced) sit at y≈306, above everything, for places,
titles and terms. They are what make a frame look researched rather than decorated.

## 5. Score and foley, synthesised

No sample libraries are reachable from a cloud container, so build them with numpy (`tools/score.py`):

- **tanpura**: 14 partials with per-partial decay + a detuned jvari buzz, re-struck every ~1.5 s.
- **bansuri**: sine + 2nd/3rd partial, 0.7 % vibrato ramped in, plus lowpassed noise for breath.
- **gamelan**: inharmonic partials at 1 / 2.76 / 5.40 / 8.93 with fast decay and a 4-cent shimmer.
- **mardala**: pitch-dropping sine (`f·(1+0.9e^{-26t})`) + ring + a lowpassed noise slap.
- **foley**: lowpassed noise with an amplitude envelope is nearly everything — sea swell, soil,
  water, murmur; bandpassed bursts for scratches and ticks.

Mix: score ~10 LU under the voice, sidechain-ducked by the voice
(`sidechaincompress=threshold=0.05:ratio=6:attack=14:release=320`), then `loudnorm=I=-14:TP=-1.5`.
Check with `ebur128` — if the score alone measures within 2 LU of the voice, it is far too loud.

## 6. Loop

The last 0.4 s cross-fades to a scene drawn with the *first frame's* parameters. QA it by diffing
frame 0 against the last frame (`tools/qa.py`); under ~18 mean delta reads as seamless.

## 7. Pitfalls paid for in full

- **A silhouette is not legible.** A clove, a tool, a plant drawn as a black cut-out reads as a
  bird. Draw the object large, lit, in a warm mid-tone with a rim, and add a small-caps label.
- **Per-element staggering must be per *group*, not per global index** — otherwise a scene's
  motifs never reach alpha > 0 and you get seconds of empty frame. Always scrub stills across a
  scene's whole span, not just its end.
- **Scenes look empty at speed.** A chart needs a compass rose, hatching and a title block; a
  light table needs a section drawing, a scale bar and a catalogue number.
- Render one still per line mid-point *and* per transition mid-point before committing to a full
  render; a 1080×1920 57 s film costs ~11 min on 4 SwiftShader workers.
- Patch bad ranges and splice rather than re-rendering everything.
