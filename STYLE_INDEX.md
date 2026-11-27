# STYLE_INDEX.md — searchable catalogue of visual styles and engines
_Read when: choosing a style for a new line or scene. One row per style; grep by keyword._

## Painterly / craft media

| Style | Keywords | Medium | Path | Best for | Owner verdict |
|---|---|---|---|---|---|
| Watercolour | dawn, shore, soft, wet edge, pigment | 2D canvas | `balijatra-vo/engine_wc.js`, `sc_wc.js`; also harihara, radha-pada, panchuka-reel | soft worlds, dawn skies, shores | ✓ used in top films |
| Ink wash + vermilion | Ma Yuan, restraint, one accent, heron | 2D canvas | `panchuka-reel/sc_ink.js` | Odia restraint; history/legend voice | ✓✓ most-viewed film |
| Klimt gold leaf | gold plaque, name reveal, ornament | Huashu #18 | `panchuka-reel/sc_gold.js` | deity names, grand reveals | ✓ |
| Palm-leaf manuscript | incised, soot-filled, red cord, Purana | 2D canvas | `panchuka-reel/sc_leaf.js`, `balijatra-vo/sc_poem.js`, `manabasa/sc_flow.js palmLeafOne` | history/Purana voice, aerial rows→text | ✓ |
| Jhoti chita | rice paste, Lakshmi feet, floor strokes | 2D canvas | `radha-pada-darshan/jhoti.js`, `manabasa/sc_jhoti.js`, `manabasa/sc_new.js shriyaDoor` | Lakshmi/household; floor world | ✓ |
| Sambalpuri ikat loom | cloth, ghagra, weave, hide/reveal | 2D canvas | `radha-pada-darshan/loom.js`, `bj-wind/sc_gate.js` | cloth that hides or reveals a figure | ✓ |
| Pattachitra | Raghurajpur, border, flat colour, black line | 2D canvas | `radha-pada-darshan/patta.js`, `harihara-besha/pattachitra_main.js`, `manabasa/sc_patta.js` | moving kit of deities | ✓ (must move; rejected when flat) |
| Saura wall painting | white rice paste, red ochre, legend | 2D canvas | `bj-wind/sc_saura.js` | "it is said…" legend sequences | ✓ |
| Paper-cut lightbox | backlit pulp, cast shadows, festival night | 2D canvas | `balijatra-vo/lightbox.js`, `sc_lamp.js`; `megha-kadamba`, `jadu-guni-ext` | fairs, festivals, lamp-boats | ✓ |
| Shadow theatre | Ravana Chhaya → Wayang, puppet carved with crescents | WebGL / canvas | `balijatra-vo/sc_shadow.js`; `manabasa/sp/gl.js`; `manabasa/sc_final.js shadowPlay()` | curses, legends | ✓ |
| Impasto oil | palette-knife, chorus lift | 2D canvas | `megha-kadamba/impasto.js` | musical chorus peaks | ✓ |
| Ink line portrait | pen pressure, dry-brush, single continuous line | 2D canvas | `jadu-guni/ink.js`, `paper.js`, `line.js` | intimate close-up portraits | ✓ |
| Sand art | table of sand, top-lit relief vs backlit | 2D canvas | `bali-yatra/sand.js`, `sandart.js` | — | neutral |
| Stained glass / art deco | colour segments, lead lines | styleframe | `harihara-besha/styleframe_*` | divine forms with structure | ✓ |

## Lamplit 2D world (Danga / Manabasa look)

| Engine | Keywords | Path | Notes |
|---|---|---|---|
| Figure engine | profile, rim-lit, saree, animated IK hands | `manabasa/sc_people.js` | `motherStanding()`, `motherKneeling()`, `girlKneeling()`; `setLook({saree,skin…})` |
| Diya flame | realistic flame, ghee lamp | `manabasa/sc_light.js flame()` | |
| Temple door / idol | Jagannath, Balabhadra, wide/stern, crown | `manabasa/sc_temple.js` | `idol(c,t,x,y,s,'J'|'B',{wide,stern,lit})` |
| Puri lane | sunlit limewash, door shadows, dusk mode | `manabasa/sc_lane.js wall()` | `shadowOf()` |
| Dawn river | lamps on sails, syllables, boat | `danga/sc_river.js` | |
| Night train | wheels, split-flap city boards | `danga/sc_train.js` | |
| Festival window | Dussehra, Diwali, Raja swing | `danga/sc_home.js` | |

## 3D (three.js 0.170)

| Style | Keywords | Path |
|---|---|---|
| Jagannath temple three.js | rekha deula, Nilachakra, walls | `jagannath-3d/main.js` |
| Moon / boita / lamp boats | night, sea, festival | `bali-yatra/night.js` |
| Neon / low-poly fair / glass studio | rap, club, 3D map | `opuscar-overlay/films/bali-rap/*` |
| Architectural model + projector | 1:150 white model, cadastral map | `plot1/world.js`, `proj.js`, `table.js` |

## Blender Cycles (Srimandir pipeline)

| Element | Keywords | File |
|---|---|---|
| Rekha deula / vimana | Odia temple, 65 m tower, pidha roof | `srimandir/temple.py vimana()` |
| Nilachakra + flag | disc wheel, 1.75 m radius, flag pole | `srimandir/temple.py nilachakra()`, `flag()` |
| Stone material | limeplaster, laterite, grime, joint bump | `srimandir/mats.py`, `geo.py mat_stone()` |
| Ocean + palms | beach, coconut, foam | `srimandir/world.py` |
| Camera path (84.4 s) | one-take, 40+ keys | `srimandir/anim.py KEYS` |
| Render pipeline | resumable, volume-aware SPP | `srimandir/render.py` |
| Distributed render farm | helpers, segments, merge | `scripts/tools/render_chunk.sh`, `merge_chunk.sh` |

## Camera / transition machinery (canvas)

| Device | Keywords | Path |
|---|---|---|
| 2.5D camera tilt | pitchView, wall→floor, floor→ceiling | `manabasa/sc_flow.js pitchView(), tiltAt()` |
| Doorway portal push | next-scene inside a door, push to fill screen | `manabasa/film.js sDusk` |
| Light-carried transition | gold bloom, figure condenses from glow | `manabasa/film.js sAlong` |
| Sunrise sweep | soft wipe, face→shadow on wall | `manabasa/film.js sHook` |
| Figure→puppet morph | same position/scale, background crossfades | `manabasa/film.js sCurse` |
| Dust wipe | blown grains, soft edge | `manabasa/film.js sDust` |
| Eye push | exponential zoom into pupil | `manabasa/film.js sHut, inEye, lakshmiGold` |
| Aerial pull-back into text | rows→palm-leaf lines | `manabasa/film.js feast(), sLeaf` |
| Gold thread / scent | braided gold strands, through-line | `common.js scent()` |

## External style libraries
- **Opuscar `styles/`**: 99 styles, at `/home/user/lemomo-ai/lemo-opuscar/styles/`
- **Huashu**: `~/.claude/skills/huashu-art-motion` (e.g. #18 = Klimt gold leaf)
- **claude-drawing**: 83 painterly styles, `~/.claude/skills/claude-drawing`
- **OpenVideoHarness**: `/root/OpenVideoHarness`
