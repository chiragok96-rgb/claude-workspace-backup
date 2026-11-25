# 01 · The owner: who they are, how they work, what they expect

## Who and what
- An Odia creator who publishes **vertical 9:16 Instagram Reels** about Odia culture, festivals and Jagannath lore
  (Bali Jatra, Panchuka, Radha Pada Darshan, Harihara Besha, Manabasa Gurubara, Boita Bandana / Danga Bhasa …).
- Usually supplies **their own Odia voiceover** (mp3) plus the Odia transcript, sometimes a song or a rap.
  Occasionally asks Claude to write a script (e.g. "10/10 viral script for Boita Bandana"); the final script/VO is theirs.
- **Performance so far (their report, 2026-11-22):** Panchuka got the most views, then Radha Pada Darshan, then the
  Kartika Purnima / Bali Jatra "Kartika Wind" film. Treat these three as the benchmark for taste and quality.
- Goal every time: **virality**. "Nobody should be able to scroll away", "loved by a city guy and a village guy",
  "premium, posh, classic, aesthetic motion-graphics", "the richness we bring to the table".

## How they communicate
- Long voice-dictated messages, mixing English with Odia/Hindi words. Glossary:
  *jabardasti* = forced/shoehorned; *achha* = okay; *dware dware* = door to door; *ekdum* = totally.
- Strong language is emphasis, not anger at you; respond with calm, concrete work.
- They give frame-by-frame feedback with timestamps and Odia lines. Map each remark to the exact line/time.
- They often end with: "go all out", "give me the best video ever", "this is the last time".

## Standing instructions (apply every time, without being reminded)
1. **Never be biased toward the owner's opinion or any AI's.** Consider every remark, judge independently, change only
   what genuinely improves the film. If something they question is already the best option, keep it and say why.
   If a request would make it worse, say so and don't do it. ("If this is the best you can give, tell me.")
2. **No jabardasti.** Never force a metaphor, style or transition that doesn't look better. "If and only if it is more
   beautiful, then do it; otherwise leave it."
3. **The hook is everything.** Grab attention in the first 10 s (aim for 20 s). The first frames must be premium, not childish.
4. **Seamless, one-take films.** No cuts, no plain dissolves, no side swipes. Every scene must *become* the next through
   a physical carrier (thread, light, shadow, steam, footsteps, doorway, eye, dust…). Extra care when two different styles meet.
5. **A metaphor for every line** (word-by-word, phrase-by-phrase or sentence-by-sentence) and **exact sync** to the words:
   e.g. Jagannath's face must appear on the word "Jagannath", the crow must return on the exact word, the door slams on "pasibani".
6. **Mix styles** chosen for beauty and meaning (hundreds are installed: Opuscar 99, Huashu, claude-drawing 83, OpenVideoHarness…).
   Never one style for a whole film, never copy a previous film's look; previous films and reference videos are **reference only**.
7. **Captions/subtitles** must be clean, posh, never overlapping anything, in a premium font. (Rap films: sometimes NO captions —
   "don't add the captions, I will add".) Ask yourself if the font suits the vibe.
8. **People must read as people**: no cartoonish/childish characters, no black blobs whose gender you can't tell,
   correct anatomy (hands face the right way, sensible noses). Deities must look dignified ("cute, beautiful", never exaggerated).
9. **Sound matters as much as picture**: background score + SFX on every beat, VO always on top. They may add their own SFX
   (e.g. Danga: "remove the Diwali sound, I will add").
10. **Storyboard vs video:** when they ask for a storyboard, deliver a storyboard sheet (stills at every line) for approval.
    When they say "no more storyboards / directly create the video", deliver a finished, rendered, muxed video.
11. **Be honest about flaws** in every delivery (what is weak, what you chose not to change and why).
12. **Deliver properly**: send the final mp4 with SendUserFile, summarise the changes per remark, list remaining weak spots,
    back the project up into this repo and push (a stop hook enforces committing untracked files).
13. **Work only in the cloud container.** Never install anything on the owner's local computer.
14. **Do not delete or overwrite their work.** New versions go next to old ones (`film_v4_dissolves.js`, `mix_v4.py`, `_v2.mp4` …).
15. **Cheapest model that keeps the best quality**; reuse existing scenes/code instead of rebuilding when tokens are tight
    ("whichever scene you want to keep, reuse it, don't recreate"). Rap era note: "first plan/imagine with Fable, then use Opus to create".
16. Keep their email/personal details private; never send them to external services.

## Their taste, in their words (keep these in mind)
- "classy, posh, clean, beautiful, aesthetic — not random things"
- "smoothest possible transitions, especially between different styles"
- "every transition must be seamless … like a single camera is moving"
- "make it cute and clean and classic, not at all childlike or bad"
- "the font, the color, everything, the whole vibe should be clean, posh, beautiful"
- "we must improve in every iteration"
- "go through all the frames again … do 2 times check"

## Things they explicitly liked (do more of this)
- Panchuka: ink river → palm-leaf calendar; Radha Pada Darshan: one red thread carries the whole film (watercolour → jhoti);
  Harihara: stained glass → shadow puppet; Bali Jatra VO: one continuous camera with the scent-of-cloves gold thread.
- Kartika Wind: gold wind threads weaving ikat, scissors, real elevation map, crow returning, firelight transition.
- Danga: window background changing per festival; boita sinking; train with wheels and city names.
- Manabasa (final): 56 clay-pot towers with an Odia counter; sunrise sweep turning his face into his shadow; Lakshmi becoming her own
  shadow puppet; the aroma thread to Jagannath and Lakshmi seen inside his eye; aerial Ananda Bazar rows becoming palm-leaf lines;
  Balabhadra's wide→narrow eyes (subtle, not exaggerated).
