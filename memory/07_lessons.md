# 07 · Lessons learned (what worked, what was rejected — do not repeat the rejected)

## Universal lessons
- **Single-style films get rejected** ("same flow, same theme, monotonous"). Mix 2–5 media, each chosen for a line's meaning.
- **Crossfades/overlays between scenes read as "hundreds of cuts".** Build physical bridges (see 02/05). Side-swipes = "jabardasti".
- **Childish/cartoon looks get rejected**: code-drawn cartoon characters (bali-toon), rounded sticker fonts, toy-like stacks ("abacus"),
  candy colours, eyeball-like top-down heads, stick figures (unless asked), flat "kid painting" openings.
- **Food drawn literally looks childish** (Manabasa 56-bowl mandala, "dahibara/thunka puri" 3D food). Use a metaphor or an authentic
  object (clay pot towers of the Puri kitchen + an Odia counter).
- **Repetition kills** (Manabasa v2 "rice grains swirling again and again" = "worst video"). One device may thread the film, but
  each line needs a new image.
- **Expressions must be visible but not exaggerated**: push in on the face; keep deities cute/dignified (Balabhadra's anger: brows
  gently down, eyes 30 % narrower).
- **Sync exactly to words**; even 0.1–0.4 s early is noticed (door slam moved to "pasibani", face to "Jagannath", crow on the word).
- **Text spelled fully**: Odia neon "କଟକ" missing ତ, train boards "Bengaluru/Hyderabad" truncated → always render text and read it.
- **Anatomy**: a hand facing the wrong way, an over-large nose, black silhouettes where you can't tell mother from man → fix.
- Too many similar elements (Danga: big moons + small rotating moons) look "weird"; simplify.
- Fast on/off flicker (moon blinking) looks bad; slow, readable changes.
- Always test stills at every line mid-point and every bridge; scan frame diffs for pops; patch ranges instead of re-rendering everything.
- Draw functions must multiply alpha (`*=`), or crossfades pop. Pass `--size 1080x1920` to `still.mjs` or the crop is wrong.
- Per-blob blur filters in canvas time out READY; draw unblurred then blur the canvas once. Wrap textures to avoid tile seams.
- Keep >2 GB disk free when rendering; Chrome crashes on a full disk.

## Per film
**Bali Jatra rap (`opuscar-overlay/films/bali-rap`)** — feedback: Odia neon text incomplete; no metaphor for "nida kahaku hue" (show people
waking); bad transitions between worlds ("must feel like one camera"); "hassa" not shown; repeated ripple effect; 3D food out of style;
"pocket hella khali" meaningless (idea: figure turning out pockets, one coin drops); phone call needs a zoom; "Danga bhasa" painting style
didn't suit; boita looked like a yellow blob; light from the map should run beyond the screen; **no captions** (owner adds them).
`bali-toon` (cartoon version) was rejected.

**Bali Jatra VO (`balijatra-vo`)** — kept: one continuous camera, scent-of-cloves gold thread, Raghuvamsha verse in gilt Odia, sandstone
relief, Ravana Chhaya→Wayang shadow play, lightbox fair, palm-leaf poem. Fixed: weak opening ("small kid painted"), ମହୋଦଧିପତି needed
contrast, clove visible when cloves are mentioned, Sadhaba hidden by the sail (re-compose), subtitle font upgraded (Inter Tight +
gold Cormorant), captions moved off busy areas.

**Kartika Wind (`bj-wind`, 3rd most viewed)** — gold wind threads weave the ikat ribbon (Odisha's daughter = President); scissors must
actually *cut* on "kholibe" (half falls out of frame; Indonesia's batik enters from that side); the golden line from Rashtrapati Bhavan
flows into the Odisha map (continuous, no disappear/appear); crow returns on the exact word; last-line visuals strengthened (silks→sails).

**Panchuka (`panchuka-reel`, most viewed)** — ink river, heron that won't touch the fish, five moons → ୫, ୪ seal, palm-leaf calendar,
Klimt gold beshas. Restraint + one vermilion accent.

**Radha Pada Darshan (`radha-pada-darshan`, 2nd most viewed)** — one red thread from the hem through the amla tree to Sakshigopal,
the legend drawn as jhoti on the floor, loom/ikat cloth hiding and revealing the feet, counter to 2,00,000+.

**Harihara Besha** — stained glass → shadow puppet → pattachitra styleframes; Whisper word map. **Jadu Guni / Megha Kadamba / Radha Pada (v1)** —
lyric films: one continuous ink line; lightbox → watercolour → impasto per musical section.

**Danga / Aa Ka Ma Bai (`danga`)** — storyboard rounds rejected: "mother counting knots on fingers", paper-origami boat, cartoonish first
frame, black genderless mother, truncated city names, same scene repeated. Final v2 fixes: children playing on the ghat (small slow
actions); one set of moons (no extra small rotating moons); the hand-to-moon push with readable finger folds (no fast moon blinking);
the boita sinks slowly, wider; the train visibly moving with wheels, city names readable in slow passes; festival window (Dussehra,
Diwali, Raja swing + rain); Diwali SFX removed; dawn ghat; push into the sun → Cuttack's light → back to the first flame (loop).

**Manabasa Gurubara (`manabasa`)** — rejected in order: v1 (childish food bowls, bad hands, black raised hand, confusing Ananda Bazar),
v2 rice-grain film ("worst video", repetitive swirls), v3 (single style, weak hook, devotees "sitting on a boat"), v4 (dissolves =
"no continuity", 56 diyas don't say bhoga, multiple cuts in the "first morsel" shot). Accepted direction v5→v7: one continuous take;
56 clay-pot towers + smooth Odia counter; face fades in on "Jagannath"; sunrise sweep face→shadow; 2.5D tilts; wet-wash cleaning +
Lakshmi-pada jhoti drawn by Shriya's hand; push into the gold doorway light → Lakshmi at the temple; Balabhadra's gentle anger when he
speaks; Lakshmi becomes her own shadow puppet; rice→dust wipe; doorway portal (opaque light → translucent) into the hut; aroma thread;
Lakshmi inside Jagannath's eye; tilt down into the feast; red lines washed away; every hand in one pot; aerial rows → palm-leaf lines;
lamp flame → hearth fire loop.

**Plot · Right of Way (`plot1`)** — technical lessons: GTAO on a big flat plate darkens wide/grazing views (whole plate goes grey) → AO off;
shadow bias −0.0006 / normalBias .0025 at 1:150 scale; low camera orbits must rise over roofs (a 1.1 s orbit clipped through a house);
a 2D↔3D hand-over must hold the identical view on both sides through a ≥0.4 s crossfade (else ghosting); a light "flicker on" reads
as a pop — ramp it; projected red on white reads terracotta (additive light); Hermite keys overshoot — use monotone (Fritsch–Carlson).
Owner feedback on v1 (2026-11-26) → v2: inside a loupe every word, tick, underline and stamp must be WHOLE (frame the lens on the full
phrase: page centre + page radius + gentle magnification ~1.3–1.5, and move the camera so the lens sits above the caption line);
captions: no ALL-CAPS, no English sublines, no full narration — only a few key words (Odia + the property terms people use: Plot, Gate,
Advance, Patta), and NO white/dark band behind them (it hid the picture) — text colour adapts to the luminance behind it, soft halo only;
end card must be classic (gold-foil Cormorant italic, ornament rule, Odia line), not a plain caps word.

- Odia text: use Noto Sans Oriya 2.x (fonts/NotoSansOriya-*.ttf, RAQM layout). The old Noto Serif Oriya 1.051 mis-renders conjuncts (ନ୍ଦ in ଶ୍ରୀମନ୍ଦିର stacked wrong); the fontsource Oriya subset lacks · , and quotes, so draw those in Cormorant.
- Cycles clouds: build them in the world shader (ray-plane hit + noise), never as transparent planes (speckle at 12 spp).
- Distributed renders: split by measured seconds per section, not frame count (kitchen/steam frames are 1.5–3x slower; helpers 1–2 finished last on Srimandir). Helpers are pixel-identical (check frame diff 0). The session proxy cannot delete other branches: temp render branches need deleting by the owner or by each helper on its own branch.
