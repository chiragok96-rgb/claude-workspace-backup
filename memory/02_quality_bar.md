# 02 · Quality bar: visual standards, transitions, sync, captions, checks

## Format
- 1080×1920 (9:16), 30 fps, H.264 yuv420p, AAC 256 k, `+faststart`, loudness −14 LUFS. Length = VO length (+ ~0.1–1.5 s), **loops**
  (last frame flows into the first; the audio tail wraps onto the start).
- Reels safe zone: no captions in the top 250 px or the bottom 450 px. Caption baselines y ≤ ~1470 (two lines at ~1390 and ~1452).
  Nothing essential under the right ~140 px (Reels buttons).

## Captions
- Look: posh, calm, never overlapping a key subject. Used successfully:
  - English gloss lines in **Cormorant Garamond 600 (50 px)** with **one gold italic accent word** (`*word*` → italic 56 px, #f0c672),
    soft dark shadow; fade in over 0.3 s, out over 0.28 s, rising 10 px (Manabasa, Danga, Kartika Wind).
  - Romanised Odia lines in **Inter Tight 400 (~39 px)** + one gold Cormorant italic word (Bali Jatra VO).
  - In-picture Odia text: **Noto Serif Oriya** (titles engraved/gilded into the world, e.g. ମାଣବସା ଗୁରୁବାର, ୫୬, ଲକ୍ଷ୍ମୀ ପୁରାଣ).
- Never rounded "sticker" fonts, never childish display fonts.
- Always place captions in a calm band of the picture (sand, plinth, floor, dark area). Check every caption against the frame.

## Transitions (the "Panchuka standard")
- **One continuous camera.** Every change of scene or style is carried by something physical: a thread (Radha Pada's red thread,
  Bali Jatra's gold scent thread, Manabasa's aroma thread), light (a sunrise sweep, a gold bloom that condenses into a figure),
  a shadow (a face becoming its shadow; a figure becoming its own shadow puppet), a push into an object that becomes the next scene
  (a doorway that shows the next room inside it, an eye whose pupil holds the next scene, a lamp flame that becomes a hearth fire),
  a 2.5D camera tilt (wall → floor, floor → wall), dust/rice blown across as a soft wipe, a pull-back where a shape becomes another
  (rows of people → lines of a palm leaf).
- **Forbidden:** plain crossfades between unrelated scenes, hard pops, side swipes, white flashes used as a cut, "hundreds of cuts" feel.
- Light flashes are allowed only when they *build and decay* inside a motivated light (sunrise, lamp, door light), never as a cut.
- When two styles meet, match position/scale/colour at the hand-over so the style changes on the same object.

## Metaphor & sync
- One metaphor per line (or per phrase); show every word that matters (the owner checks line by line: "have we shown X?").
- **Sync to the word**: measure word onsets from the VO (see 03_workflow.md §ASR); put the visual beat exactly on the word
  (face on "Jagannath" 0.20 s; Balabhadra's anger when he *starts speaking*, not before; the slam on the verb).
- Important beats must be **visible**: if an expression change is subtle, push the camera in on it rather than making it grotesque.

## Characters & art
- No childish/cartoon characters, no stick figures unless explicitly requested; people in profile, lamp-lit, rim-lit, coloured
  (the `sc_people.js` figure engine) read as premium. Deities in their sacred forms (round eyes, flower crown), dignified.
- Avoid "abacus"/"bead" stacks, eyeball-like top-down heads, candy palettes; prefer muted, lamp-lit, warm, filmic colour + grain.
- No blue-violet "AI" palettes (the gate fails them).

## Mandatory checks before delivering
1. Stills at every line mid-point and every bridge (`still.mjs … t1 t2 …` → contact sheet) — look at them.
2. Full render → **pop scan** (`scripts/tools/popscan.py out/video.mp4`): no isolated jumps except intended ones; loop seam ≈ typical diff.
3. Look at the fastest moments frame by frame (ffmpeg tile of consecutive frames).
4. Mux (−14 LUFS) → **gate** (`film_gate.py`, must print 门禁通过 = pass) → two-pass share encode.
5. Contact sheet of the final (one frame every 2.5 s) — read the whole film once more.
6. Report honestly: what changed per remark, what you deliberately kept, remaining weak spots.
