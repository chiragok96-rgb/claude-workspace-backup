# 08 · Film history, deliverables and current status (as of 2026-11-25)

## Film index
| Film | Project dir (repo → restored) | Entry / render | Final deliverable(s) in `deliverables/` | Status |
|---|---|---|---|---|
| **Plot · Right of Way** (new Odisha property channel, film 1, 55.7 s VO) | `projects/plot1` → `/home/user/plot1` | `film.js` (+ `world.js` three.js model/projector, `proj.js`, `table.js` records, `layout.js`), `mix.py` | `Plot_RightOfWay_v2.mp4` (v1 kept); storyboard `Plot_RightOfWay_STORYBOARD_v1*.jpg` | **latest, delivered 2026-11-25** |
| Manabasa Gurubara (Lakshmi Purana, 55.8 s VO) | `projects/manabasa` → `/home/user/manabasa` | `film.js` (+ `sc_flow.js`, `sc_new.js`, `sc_final.js`, `sc_temple.js`, `sc_people.js`, `sc_jhoti.js`, `sc_lane.js`), `mix.py` | `Manabasa_Gurubara_final_v7.mp4` (delivered); older: `_v6`, `_v5_onetake`, `_final` | done unless owner sends more notes |
| Aa Ka Ma Bai / Boita Bandana (Danga, 53.6 s VO) | `projects/danga` | `film.js`, `sc_*.js`, `mix.py` | `AaKaMaBai_BoitaBandana_final_v2.mp4` | done |
| Kartika Wind (Bali Jatra, 49 s VO) | `projects/bj-wind` | `film.js` (render film.js directly) | `KartikaWind_BaliJatra_v3.mp4` + cover | done (3rd most viewed) |
| Bali Jatra VO (62 s) | `projects/balijatra-vo` | `film.js` via `?p=film` | `BaliJatra_VO_final_v3.mp4` + cover | done |
| Bali Jatra rap (song) | `opuscar-overlay/films/bali-rap` → `$LIB/films/bali-rap` | `film.js` (`--q "p=film"`) | `bali-jatra-rap_share.mp4` | done (owner adds captions) |
| Bali Jatra (song, sand/3D) | `projects/bali-yatra` | `film.js` | `bali-jatra_share.mp4` | done |
| Panchuka (reel) | `projects/panchuka-reel` (+ `panchuka` VO tools) | `film.js` | (older backup) | done — most viewed |
| Radha Pada Darshan | `projects/radha-pada-darshan` (+ `radha-pada` v1) | `film.js` | (older backup) | done — 2nd most viewed |
| Harihara Besha | `projects/harihara-besha` | `main.js` | — | done |
| Jadu Guni (+ext), Megha Kadamba | `projects/jadu-guni*`, `projects/megha-kadamba` | `main.js` + `build.sh` | — | lyric films |
| Jagannath 3D temple | `projects/jagannath-3d` | `main.js` (three.js) | — | asset |
| Bali toon | `opuscar-overlay/films/bali-toon` | — | — | rejected (cartoon) |

Storyboards: `deliverables/Manabasa_*STORYBOARD*.jpg`, `Danga_STORYBOARD_v3*.jpg`, `projects/*/STORYBOARD*.jpg`.
Source audio: `projects/<film>/audio/vo.mp3|wav`, older songs in `inputs/audio/`.

## Manabasa v7 timeline (the most recent, most refined film — use as the template)
0.20 face fades in on "Jagannath" (1 s); pots land tier by tier 0.1–1.93 with the 1→56 counter; 1.9–2.5 steam to his face; 2.7–3.0
fires die; 2.84–3.42 sunrise sweep (face→shadow); 3.3–5.55 shadows walk, doors shut (4.12, 4.79); 5.45–6.5 tilt down, grain lands
6.45 ("Why?"); 6.5–13.25 jhoti floor, title 7.0–9.4, Lakshmi's steps 9.3–12.6; 13.25–14.15 tilt up to Shriya; wet wash 13.6–14.45;
jhoti 14.4–15.25; gold 15.15–15.95; push into the doorway light 15.85–16.62 → temple; Balabhadra appears 16.94, anger 18.3–18.95
with a push-in, doors slam 20.55; puppet morph 20.75–21.6; curse, 12 lamps out 23.4–24.55; rice → dust wipe 24.75–26.95; dusk lane,
lit door (opaque 28.2 → translucent 30.5–31.9), portal push 31.6–32.95; hut, aroma 33.15–34.45, push on face 34.0–34.85, eyes widen
34.45–34.8, eye push 34.95–37.05; temple doors open in the pupil 37.9–38.8; tilt down to the feast 39.5–40.45; wash 41.95–42.95;
every hand in the pot 42.95–44.3; aerial pull-back 43.1–49.3; rows → palm leaf 49.3–50.6; gold line 51.9; flame push 54.75–55.8 → loop.
VO phrase table: `projects/manabasa/ph.npy`; word onsets measured: "Jagannath" 0.20, "Balabhadra" 16.94, "atakaile" 17.5,
"se gharu asicha" 18.30, "pasibani" 20.55.

## Open items / ideas not yet done
- Manabasa: palm-leaf Odia lines other than "ମହାପ୍ରସାଦେ ନାହିଁ ଜାତିଭେଦ" are Claude's wording — owner should proofread.
  Aerial devotees are simple shapes; the eye push (35.9–36.4 s) is the fastest move.
- Future films: owner may send a new VO/script any time; follow 03_workflow.md. Owner-ranked best references: Panchuka, Radha Pada
  Darshan, Kartika Wind, plus Manabasa v7 for one-take machinery.

## Plot · Right of Way (property channel, film 1) — notes
- New channel: premium, non-religious, Odisha real estate / property facts. Owner approved storyboard v1 and asked for the video.
- Look: warm-white 1:150 architectural model on a plinth (Opuscar `white-model` grammar: data = projected light; gold = ours/safe,
  vermilion = claim/danger, cream = the record) + an `archive-lighttable` table of records (Bhulekh sheet, pattas, deeds, loupe).
  2D table drawn crisply between 17.85 and 42.55 s; hand-overs at an identical top-down view (D 3.6 ↔ 1155 px/unit).
- Captions: one Odia key phrase per line (one gold accent) + a small English line; readouts (₹, days) and pins in-picture.
- Open: channel name/handle for the end card (currently only "FOLLOW"); the patta's owner name ଶ୍ରୀ ହରିହର ମହାନ୍ତି is invented — owner to confirm.
