# 05 · Styles, engines and techniques we have built (reuse them!)

All files are under `projects/<film>/` (restored to `/home/user/<film>/`). Copy a module into a new film instead of rewriting.
Library catalogues to consult when choosing styles: Opuscar `styles/` (99, `core/render`), Huashu (`~/.claude/skills/huashu-art-motion`,
e.g. #18 Klimt gold leaf), claude-drawing (83 painterly styles), OpenVideoHarness workbench.

## Painterly / craft media (Odia crafts work best)
| Style | Where | Notes |
|---|---|---|
| Watercolour engine (wet edges, pigment, paper) | `balijatra-vo/engine_wc.js`, `sc_wc.js`; also harihara, radha-pada, panchuka-reel | dawn skies, shores, soft worlds |
| Paper-cut lightbox (backlit pulp, cast shadows) | `balijatra-vo/lightbox.js`, `sc_lamp.js`; `megha-kadamba`, `jadu-guni-ext` | festivals at night, fair, lamp-boats |
| Ink wash + vermilion (Ma Yuan composition) | `panchuka-reel/sc_ink.js` | most-viewed film; restraint, one accent colour |
| Klimt gold leaf plaques | `panchuka-reel/sc_gold.js` (Huashu 18) | names revealed on gold |
| Palm-leaf manuscript (incised, soot-filled, red cord) | `panchuka-reel/sc_leaf.js`, `balijatra-vo/sc_poem.js`, `manabasa/sc_flow.js palmLeafOne` | the "Purana/history" voice |
| Jhoti chita (rice-paste finger strokes, Lakshmi's feet) | `radha-pada-darshan/jhoti.js`, `manabasa/sc_jhoti.js` (floor world, footprints `foot()`), `manabasa/sc_new.js shriyaDoor` (eye-level jhoti + hand) | Lakshmi/household themes |
| Sambalpuri ikat loom, ghagra | `radha-pada-darshan/loom.js`, `bj-wind/sc_gate.js` (ikat ribbon) | cloth that hides/reveals |
| Pattachitra (Raghurajpur order: prime, border, flat colour, black line) | `radha-pada-darshan/patta.js`, `harihara-besha/pattachitra_main.js`, `manabasa/sc_patta.js` | rejected once as "cheap" when used flat; good as a moving kit |
| Saura wall painting (white rice paste on red ochre) | `bj-wind/sc_saura.js` | legends ("it is said…") |
| Shadow theatre: Ravana Chhaya → Wayang | `balijatra-vo/sc_shadow.js`; WebGL piyingxi compositor `manabasa/sp/gl.js`; canvas puppet `manabasa/sc_final.js shadowPlay()` | curses, legends; puppet carved with crescents, rivets, rods |
| Sand art (table of sand, top-lit relief vs backlit) | `bali-yatra/sand.js`, `sandart.js` | |
| Impasto palette-knife oil | `megha-kadamba/impasto.js` | chorus lift |
| Ink line with pen pressure, dry-brush, paper | `jadu-guni/ink.js`, `paper.js`, `line.js` | one continuous line portrait |
| Stained glass, art deco, shadow puppet styleframes | `harihara-besha/styleframe_*` | |

## Lamplit 2D world (the Danga/Manabasa look)
- `sc_people.js` **figure engine**: profile figures drawn on an offscreen layer, shaded from the back, rim-lit (rim = mask minus shifted mask),
  optional held glow. `setLook({saree, sareeD, border, crown, skin, skinD})`; `motherStanding(c,x,y,s,{raise,phone,wind,…})`,
  `motherKneeling(c,x,y,s,{hands:[[x,y],[x,y]], lean})` (2-bone IK hands — animate the hand targets to make her draw/wipe), `girlKneeling`.
- `sc_light.js flame()` realistic diya flame; `sc_temple.js`: `dark`, `glow`, `lamp` (brass lamp), `templeDoor({shut})`,
  `idol(c,t,x,y,s,'J'|'B',{wide, stern, look, lit})` (Jagannath/Balabhadra faces with flower crown; `wide` and `stern` are the expressions),
  `riceFall`, `twelveLamps`. `sc_new.js`: `kudua()` clay pot, `templeNight()`, `hearth()`, `shriyaDoor({clean, draw, gold})`.
- `sc_lane.js wall()`: sunlit limewash Puri lane of doors with long deity shadows (`shadowOf`), dusk mode, one lit door.
- Danga: `sc_river.js` (dawn river of lamps, syllables on sails), `sc_moon.js`, `sc_count.js` (gold line drawing hands/joints),
  `sc_train.js` (night train with wheels, split-flap city boards), `sc_home.js` (window showing each festival), `sc_dawn.js`, `sc_india.js` (real state outlines, gold threads home).

## Camera / transition machinery
- **`pitchView()` + `tiltAt()`** (`manabasa/sc_flow.js`): a real 2.5D camera tilt between a wall image and a ground image (row-by-row
  perspective drawImage). Wall view (th=0) and top-down view (th=π/2) are both 1:1 with the plain drawings, so the hand-over is invisible.
  Used for wall→jhoti floor, floor→Shriya's door, temple door→feast floor.
- **Doorway portal** (`manabasa/film.js sDusk`): render the next scene offscreen, draw it inside the doorway rect, push in until it fills
  the screen at exactly 1:1 (doorway width 300 → Z=3.6). Door starts opaque light, then turns translucent.
- **Light-carried transition** (`sAlong`): push into a glow, bloom at a target point, the next scene fades in under the bloom with a
  figure at that point (gold light → Lakshmi at the temple).
- **Sunrise sweep** (`sHook`): a soft multi-layer clipped wipe with a warm light front; a dark face becomes its shadow on the wall.
- **Figure→puppet morph** (`sCurse`): same figure, same position/scale, background crossfades from night wall to glowing cloth.
- **Dust wipe** (`sDust`): blown grains form a soft, dusty edge revealing the next scene.
- **Eye push** (`sHut`, `inEye`, `lakshmiGold`): exponential zoom into a pupil (Z up to 110); inside, a reflection of the next scene.
- **Aerial pull-back into text** (`feast()`, `sLeaf`): rows of people from above become the incised lines of a palm leaf.
- **Gold thread / scent** (`common.js scent()`): braided shimmering gold strands with motes — the through-line device.
- Exponential zooms: `Z = exp(log(Zmax) * ease(u))` for constant-feeling speed; `zoomAt(c, cx, cy, z)`.

## 3D (three.js 0.170, in Opuscar's node_modules)
- `jagannath-3d/main.js` (Srimandir model: rekha deula, Nilachakra, walls, Singhadwara), `bali-yatra/night.js` (moon, boita, lamp boats),
  `bali-yatra/food.js`, `opuscar-overlay/films/bali-rap/*` (neon, low-poly fair, glass studio, 3D map). Real terrain: `bj-wind/tools/map.py`
  (Terrarium elevation tiles, zoom 7).

## Typography inside the picture
- Odia gold foil/engraved titles (`bj-wind/sc_word.js`: ବାଲିଯାତ୍ରା splits into ବାଲି→island, ଯାତ୍ରା→boat), Odia numerals counters
  (`manabasa/sc_flow.js potCounter`: steady, counts 1→56 one by one).

## Architectural model + projector + light table (`plot1`)
- `world.js`: three.js white model (houses with parapets/mumty/tanks/windows that glow `uWin`, palms, scale figures, gate with rising pillars
  and swinging leaves), projection shader (top-down canvas → emissive add × (0.42+0.58·N·up)), key light that can run like the sun, Opuscar
  `makePost` (DOF, bloom, grade). `proj.js` layers (soft washes, running gold path, cadastral map), `table.js` vector records (map sheet,
  patta cards, stamp-paper deed, registered deed with embossed seal), `film.js` loupe, pins, readouts, smoke words, monotone camera keys.

- **Blender render farm** (`scripts/tools/render_chunk.sh` + `merge_chunk.sh`): helpers (Haiku sessions "Render helper N", reuse them) render a contiguous block of `render-jobs/<film>/scene.blend` with that film's `render.py`, pack losslessly (libx264rgb -qp 0, bit-exact) in 60-frame segments, push to `render-<film>-pN`; the orchestrator merges + verifies a check frame. Blender (bpy 5.0.1, Py 3.11) comes from the claude-workspace-backup environment setup script into /home/user/bpyenv. Use 10–12 helpers by default.
